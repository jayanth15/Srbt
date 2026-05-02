from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class VehicleType(str, Enum):
    tipper = "tipper"
    lorry = "lorry"


class VehicleStatus(str, Enum):
    available = "available"
    on_trip = "on_trip"
    maintenance = "maintenance"


class Vehicle(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    vehicle_number: str = Field(max_length=20, unique=True, index=True)
    vehicle_type: VehicleType
    capacity_tons: float
    driver_name: str = Field(max_length=100)
    driver_phone: str = Field(max_length=15)
    status: VehicleStatus = Field(default=VehicleStatus.available)
    created_at: datetime = Field(default_factory=datetime.utcnow)
