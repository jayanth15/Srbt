from datetime import date, datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class OrderStatus(str, Enum):
    pending    = "pending"
    confirmed  = "confirmed"
    dispatched = "dispatched"
    delivered  = "delivered"
    cancelled  = "cancelled"


class Order(SQLModel, table=True):
    id:               Optional[int]      = Field(default=None, primary_key=True)
    order_number:     str                = Field(max_length=20, unique=True, index=True)
    company_id:       Optional[int]      = Field(default=None, foreign_key="company.id", index=True)
    customer_name:    str                = Field(max_length=200, default="")   # fallback for walk-ins
    customer_phone:   Optional[str]      = Field(default=None, max_length=15)
    delivery_address: str                = Field(max_length=500, default="")
    delivery_date:    Optional[date]     = Field(default=None)
    delivery_slot:    Optional[str]      = Field(default=None, max_length=20)  # morning/afternoon/night
    po_number:        Optional[str]      = Field(default=None, max_length=100)
    status:           OrderStatus        = Field(default=OrderStatus.pending)
    notes:            Optional[str]      = Field(default=None, max_length=1000)
    total_amount:     Optional[float]    = Field(default=None)
    created_at:       datetime           = Field(default_factory=datetime.utcnow)
    dispatched_at:    Optional[datetime] = Field(default=None)
    delivered_at:     Optional[datetime] = Field(default=None)
