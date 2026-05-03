from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func

from app.database import get_session
from app.models.company import Company
from app.models.invoice import Invoice
from app.models.material import Material
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

PAGE_SIZE = 20


class OrderItemCreate(BaseModel):
    material_id:            Optional[int]  = None
    material_name_snapshot: Optional[str]  = None
    qty:                    float
    unit:                   str            = "Ton"
    rate:                   float          = 0.0


class OrderCreate(BaseModel):
    company_id:       Optional[int]  = None
    customer_name:    str            = ""
    customer_phone:   Optional[str]  = None
    delivery_address: str            = ""
    delivery_date:    Optional[date] = None
    delivery_slot:    Optional[str]  = None
    po_number:        Optional[str]  = None
    notes:            Optional[str]  = None
    items:            List[OrderItemCreate]


class OrderItemStatusUpdate(BaseModel):
    status:    str
    dc_number: Optional[str] = None


async def _next_order_number(session: AsyncSession) -> str:
    count_result = await session.exec(select(func.count(Order.id)))
    n = (count_result.one() or 0) + 1
    return f"SRBT-{n:04d}"


def _apply_quick_filter(q, quick_filter: str):
    today = date.today()
    if quick_filter == "today":
        q = q.where(func.date(Order.created_at) == today)
    elif quick_filter == "last30":
        from datetime import timedelta
        q = q.where(Order.created_at >= datetime.combine(today - timedelta(days=30), datetime.min.time()))
    elif quick_filter == "last_month":
        import calendar
        if today.month == 1:
            first = date(today.year - 1, 12, 1)
            last  = date(today.year - 1, 12, 31)
        else:
            first = date(today.year, today.month - 1, 1)
            last  = date(today.year, today.month - 1, calendar.monthrange(today.year, today.month - 1)[1])
        q = q.where(func.date(Order.created_at) >= first, func.date(Order.created_at) <= last)
    return q


@router.get("/")
async def list_orders(
    page:         int            = 1,
    status:       Optional[str]  = None,
    company_id:   Optional[int]  = None,
    material_id:  Optional[int]  = None,
    date_from:    Optional[date] = None,
    date_to:      Optional[date] = None,
    quick_filter: Optional[str]  = None,
    session:      AsyncSession   = Depends(get_session),
):
    q = select(Order)
    if status:
        q = q.where(Order.status == status)
    if company_id:
        q = q.where(Order.company_id == company_id)
    if date_from:
        q = q.where(func.date(Order.created_at) >= date_from)
    if date_to:
        q = q.where(func.date(Order.created_at) <= date_to)
    if quick_filter:
        q = _apply_quick_filter(q, quick_filter)
    if material_id:
        subq = select(OrderItem.order_id).where(OrderItem.material_id == material_id)
        q = q.where(Order.id.in_(subq))

    count_q = select(func.count()).select_from(q.subquery())
    total_result = await session.exec(count_q)
    total = total_result.one()

    offset = (page - 1) * PAGE_SIZE
    q = q.order_by(Order.created_at.desc()).offset(offset).limit(PAGE_SIZE)
    result = await session.exec(q)
    orders = result.all()

    order_ids = [o.id for o in orders]

    items_by_order: dict = {}
    if order_ids:
        items_result2 = await session.exec(
            select(OrderItem).where(OrderItem.order_id.in_(order_ids))
        )
        for item in items_result2.all():
            items_by_order.setdefault(item.order_id, []).append(item.model_dump())

    # company names
    company_ids = list({o.company_id for o in orders if o.company_id})
    companies: dict = {}
    if company_ids:
        comp_result = await session.exec(select(Company).where(Company.id.in_(company_ids)))
        companies = {c.id: c.name for c in comp_result.all()}

    # has_invoice
    invoiced_ids: set = set()
    if order_ids:
        inv_result = await session.exec(select(Invoice.order_id).where(Invoice.order_id.in_(order_ids)))
        invoiced_ids = set(inv_result.all())

    return {
        "items": [
            {**o.model_dump(),
             "items":       items_by_order.get(o.id, []),
             "company_name": companies.get(o.company_id),
             "has_invoice": o.id in invoiced_ids}
            for o in orders
        ],
        "total":     total,
        "page":      page,
        "page_size": PAGE_SIZE,
        "pages":     max(1, -(-total // PAGE_SIZE)),
    }


@router.get("/{order_id}")
async def get_order(order_id: int, session: AsyncSession = Depends(get_session)):
    order = await session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    items_result = await session.exec(select(OrderItem).where(OrderItem.order_id == order_id))
    items = items_result.all()
    company = await session.get(Company, order.company_id) if order.company_id else None
    inv_result = await session.exec(select(Invoice.id).where(Invoice.order_id == order_id).limit(1))
    has_invoice = inv_result.first() is not None
    return {
        **order.model_dump(),
        "items":        [i.model_dump() for i in items],
        "company_name": company.name if company else None,
        "has_invoice":  has_invoice,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(
    data:    OrderCreate,
    session: AsyncSession = Depends(get_session),
    _:       User         = Depends(get_current_user),
):
    order_number = await _next_order_number(session)
    order = Order(
        order_number=order_number,
        company_id=data.company_id,
        customer_name=data.customer_name,
        customer_phone=data.customer_phone,
        delivery_address=data.delivery_address,
        delivery_date=data.delivery_date,
        delivery_slot=data.delivery_slot,
        po_number=data.po_number,
        notes=data.notes,
    )
    session.add(order)
    await session.flush()

    total = 0.0
    for item_data in data.items:
        name_snapshot = item_data.material_name_snapshot
        if not name_snapshot and item_data.material_id:
            mat = await session.get(Material, item_data.material_id)
            name_snapshot = mat.name if mat else f"Material #{item_data.material_id}"
        item = OrderItem(
            order_id=order.id,
            material_id=item_data.material_id,
            material_name_snapshot=name_snapshot or "",
            qty=item_data.qty,
            unit=item_data.unit,
            rate=item_data.rate,
        )
        session.add(item)
        total += item_data.qty * item_data.rate

    order.total_amount = total
    session.add(order)
    await session.commit()
    await session.refresh(order)
    items_result = await session.exec(select(OrderItem).where(OrderItem.order_id == order.id))
    return {**order.model_dump(), "items": [i.model_dump() for i in items_result.all()]}


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id:   int,
    new_status: str,
    session:    AsyncSession = Depends(get_session),
    _:          User         = Depends(get_current_user),
):
    order = await session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = new_status
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order


@router.patch("/{order_id}/items/{item_id}")
async def update_order_item(
    order_id: int,
    item_id:  int,
    data:     OrderItemStatusUpdate,
    session:  AsyncSession = Depends(get_session),
    _:        User         = Depends(get_current_user),
):
    item = await session.get(OrderItem, item_id)
    if not item or item.order_id != order_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    item.status = data.status
    if data.dc_number is not None:
        item.dc_number = data.dc_number
    session.add(item)

    all_items_result = await session.exec(select(OrderItem).where(OrderItem.order_id == order_id))
    all_items = all_items_result.all()
    statuses = {i.status for i in all_items}
    order = await session.get(Order, order_id)
    if order:
        if "in_transit" in statuses:
            order.status = OrderStatus.dispatched
        elif statuses <= {"delivered", "cancelled"}:
            order.status     = OrderStatus.delivered
            order.delivered_at = datetime.utcnow()
        session.add(order)
    await session.commit()
    await session.refresh(item)
    return item.model_dump()
