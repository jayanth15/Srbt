from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class OrderStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    dispatched = "dispatched"
    delivered = "delivered"
    cancelled = "cancelled"


class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    order_number: str = Field(max_length=20, unique=True, index=True)
    customer_id: int = Field(foreign_key="user.id", index=True)
    material_id: int = Field(foreign_key="material.id")
    vehicle_id: Optional[int] = Field(default=None, foreign_key="vehicle.id")
    quantity_tons: float
    delivery_address: str = Field(max_length=500)
    status: OrderStatus = Field(default=OrderStatus.pending)
    notes: Optional[str] = Field(default=None, max_length=1000)
    total_amount: Optional[float] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    dispatched_at: Optional[datetime] = Field(default=None)
    delivered_at: Optional[datetime] = Field(default=None)
