from typing import Optional
from sqlmodel import Field, SQLModel


class OrderItemStatus(str):
    pending    = "pending"
    in_transit = "in_transit"
    delivered  = "delivered"
    cancelled  = "cancelled"


class OrderItem(SQLModel, table=True):
    __tablename__ = "orderitem"

    id:                    Optional[int] = Field(default=None, primary_key=True)
    order_id:              int           = Field(foreign_key="order.id", index=True)
    material_id:           Optional[int] = Field(default=None, foreign_key="material.id")
    material_name_snapshot: str          = Field(max_length=200)
    qty:                   float         = Field(default=1.0)
    unit:                  str           = Field(default="Ton", max_length=50)
    rate:                  float         = Field(default=0.0)
    status:                str           = Field(default="pending", max_length=20)
    dc_number:             Optional[str] = Field(default=None, max_length=100)
