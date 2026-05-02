from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.database import get_session
from app.models.order import Order

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("/")
async def list_orders(skip: int = 0, limit: int = 20, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Order).offset(skip).limit(limit))
    return result.all()


@router.get("/{order_id}")
async def get_order(order_id: int, session: AsyncSession = Depends(get_session)):
    order = await session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.patch("/{order_id}/status")
async def update_order_status(order_id: int, new_status: str, session: AsyncSession = Depends(get_session)):
    order = await session.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    order.status = new_status
    session.add(order)
    await session.commit()
    await session.refresh(order)
    return order
