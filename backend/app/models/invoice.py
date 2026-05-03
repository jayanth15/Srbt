from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class InvoiceStatus(str, Enum):
    pending = "pending"
    paid    = "paid"


class Invoice(SQLModel, table=True):
    id:               Optional[int]      = Field(default=None, primary_key=True)
    invoice_number:   str                = Field(max_length=30, unique=True, index=True)
    order_id:         int                = Field(foreign_key="order.id", index=True, unique=True)
    company_id:       Optional[int]      = Field(default=None, foreign_key="company.id")
    is_gst_applicable: bool              = Field(default=True)
    subtotal:         float              = Field(default=0.0)
    cgst_amount:      float              = Field(default=0.0)
    sgst_amount:      float              = Field(default=0.0)
    total_amount:     float              = Field(default=0.0)
    status:           InvoiceStatus      = Field(default=InvoiceStatus.pending)
    created_at:       datetime           = Field(default_factory=datetime.utcnow)
    paid_at:          Optional[datetime] = Field(default=None)
