from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from app.database import get_session
from app.models.vehicle import Vehicle

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("/")
async def list_vehicles(session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Vehicle))
    return result.all()


@router.get("/{vehicle_id}")
async def get_vehicle(vehicle_id: int, session: AsyncSession = Depends(get_session)):
    vehicle = await session.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found")
    return vehicle
