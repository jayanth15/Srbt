from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, func
from app.database import get_session
from app.models.order import Order, OrderStatus

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary")
async def order_summary(session: AsyncSession = Depends(get_session)):
    total = await session.exec(select(func.count(Order.id)))
    delivered = await session.exec(select(func.count(Order.id)).where(Order.status == OrderStatus.delivered))
    pending = await session.exec(select(func.count(Order.id)).where(Order.status == OrderStatus.pending))
    revenue = await session.exec(select(func.sum(Order.total_amount)).where(Order.status == OrderStatus.delivered))
    return {
        "total_orders": total.one(),
        "delivered": delivered.one(),
        "pending": pending.one(),
        "total_revenue": revenue.one() or 0.0,
    }
