from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select, func, outerjoin

from app.database import get_session
from app.models.company import Company
from app.models.invoice import Invoice, InvoiceStatus
from app.models.invoice_item import InvoiceItem
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/invoices", tags=["invoices"])

PAGE_SIZE = 20
GST_RATE  = 0.05  # 5% total GST → 2.5% CGST + 2.5% SGST


class InvoiceCreate(BaseModel):
    order_id:          int
    is_gst_applicable: bool = True


async def _next_invoice_number(session: AsyncSession) -> str:
    year = datetime.utcnow().year
    count_result = await session.exec(select(func.count(Invoice.id)))
    n = (count_result.one() or 0) + 1
    return f"INV-{year}-{n:04d}"


@router.get("/")
async def list_invoices(
    page:         int            = 1,
    status:       Optional[str]  = None,    # pending | paid | not_invoiced
    company_id:   Optional[int]  = None,
    date_from:    Optional[str]  = None,
    date_to:      Optional[str]  = None,
    quick_filter: Optional[str]  = None,    # today | last30 | last_month
    session:      AsyncSession   = Depends(get_session),
):
    from datetime import date, timedelta
    import calendar

    # "not_invoiced" = orders that have no invoice yet
    if status == "not_invoiced":
        q = select(Order).where(~Order.id.in_(select(Invoice.order_id)))
        if company_id:
            q = q.where(Order.company_id == company_id)

        count_q = select(func.count()).select_from(q.subquery())
        total = (await session.exec(count_q)).one()
        offset = (page - 1) * PAGE_SIZE
        result = await session.exec(q.order_by(Order.created_at.desc()).offset(offset).limit(PAGE_SIZE))
        orders = result.all()
        return {
            "items": [
                {
                    **o.model_dump(),
                    "type":           "order",
                    "invoice_status": "not_invoiced",
                }
                for o in orders
            ],
            "total":     total,
            "page":      page,
            "page_size": PAGE_SIZE,
            "pages":     max(1, -(-total // PAGE_SIZE)),
        }

    q = select(Invoice)
    if status:
        q = q.where(Invoice.status == status)
    if company_id:
        q = q.where(Invoice.company_id == company_id)

    today = date.today()
    if quick_filter == "today":
        q = q.where(func.date(Invoice.created_at) == today)
    elif quick_filter == "last30":
        q = q.where(Invoice.created_at >= datetime.combine(today - timedelta(days=30), datetime.min.time()))
    elif quick_filter == "last_month":
        if today.month == 1:
            first = date(today.year - 1, 12, 1)
            last  = date(today.year - 1, 12, 31)
        else:
            first = date(today.year, today.month - 1, 1)
            last  = date(today.year, today.month - 1, calendar.monthrange(today.year, today.month - 1)[1])
        q = q.where(func.date(Invoice.created_at) >= first, func.date(Invoice.created_at) <= last)

    if date_from:
        q = q.where(func.date(Invoice.created_at) >= date_from)
    if date_to:
        q = q.where(func.date(Invoice.created_at) <= date_to)

    count_q = select(func.count()).select_from(q.subquery())
    total = (await session.exec(count_q)).one()
    offset = (page - 1) * PAGE_SIZE
    result = await session.exec(q.order_by(Invoice.created_at.desc()).offset(offset).limit(PAGE_SIZE))
    invoices = result.all()

    # Enrich with company names
    company_ids = {i.company_id for i in invoices if i.company_id}
    companies: dict = {}
    if company_ids:
        co_result = await session.exec(select(Company).where(Company.id.in_(company_ids)))
        companies = {c.id: c.name for c in co_result.all()}

    # Enrich with order numbers
    order_ids = {i.order_id for i in invoices if i.order_id}
    order_nums: dict = {}
    if order_ids:
        ord_result = await session.exec(select(Order).where(Order.id.in_(order_ids)))
        order_nums = {o.id: o.order_number for o in ord_result.all()}

    return {
        "items": [
            {**inv.model_dump(),
             "company_name": companies.get(inv.company_id),
             "order_number": order_nums.get(inv.order_id)}
            for inv in invoices
        ],
        "total":     total,
        "page":      page,
        "page_size": PAGE_SIZE,
        "pages":     max(1, -(-total // PAGE_SIZE)),
    }


@router.get("/{invoice_id}")
async def get_invoice(invoice_id: int, session: AsyncSession = Depends(get_session)):
    inv = await session.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    items_result = await session.exec(select(InvoiceItem).where(InvoiceItem.invoice_id == invoice_id))
    items        = items_result.all()
    order        = await session.get(Order, inv.order_id)
    company      = await session.get(Company, inv.company_id) if inv.company_id else None
    return {
        **inv.model_dump(),
        "items":        [i.model_dump() for i in items],
        "order_number": order.order_number if order else None,
        "company_name": company.name       if company else None,
        "company_gst":  company.gst_number if company else None,
        "company_address": company.address if company else None,
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_invoice(
    data:    InvoiceCreate,
    session: AsyncSession = Depends(get_session),
    _:       User         = Depends(get_current_user),
):
    # Prevent duplicate
    existing = await session.exec(select(Invoice).where(Invoice.order_id == data.order_id))
    if existing.first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invoice already exists for this order")

    order = await session.get(Order, data.order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Get delivered items
    items_result = await session.exec(
        select(OrderItem).where(
            OrderItem.order_id == data.order_id,
            OrderItem.status.in_(["delivered"]),
        )
    )
    order_items = items_result.all()
    if not order_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No delivered items to invoice",
        )

    invoice_number = await _next_invoice_number(session)
    subtotal = sum(i.qty * i.rate for i in order_items)
    cgst_amount = round(subtotal * GST_RATE / 2, 2) if data.is_gst_applicable else 0.0
    sgst_amount = cgst_amount
    total_amount = subtotal + cgst_amount + sgst_amount

    inv = Invoice(
        invoice_number=invoice_number,
        order_id=data.order_id,
        company_id=order.company_id,
        is_gst_applicable=data.is_gst_applicable,
        subtotal=round(subtotal, 2),
        cgst_amount=cgst_amount,
        sgst_amount=sgst_amount,
        total_amount=round(total_amount, 2),
    )
    session.add(inv)
    await session.flush()

    for oi in order_items:
        inv_item = InvoiceItem(
            invoice_id=inv.id,
            order_item_id=oi.id,
            description=oi.material_name_snapshot,
            qty=oi.qty,
            unit=oi.unit,
            rate=oi.rate,
            dc_number=oi.dc_number,
            amount=round(oi.qty * oi.rate, 2),
        )
        session.add(inv_item)

    await session.commit()
    await session.refresh(inv)
    items_result2 = await session.exec(select(InvoiceItem).where(InvoiceItem.invoice_id == inv.id))
    return {**inv.model_dump(), "items": [i.model_dump() for i in items_result2.all()]}


@router.patch("/{invoice_id}/paid")
async def mark_invoice_paid(
    invoice_id: int,
    session:    AsyncSession = Depends(get_session),
    _:          User         = Depends(get_current_user),
):
    inv = await session.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
    if inv.status == InvoiceStatus.paid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invoice is already paid")
    inv.status  = InvoiceStatus.paid
    inv.paid_at = datetime.utcnow()
    session.add(inv)
    await session.commit()
    await session.refresh(inv)
    return inv
