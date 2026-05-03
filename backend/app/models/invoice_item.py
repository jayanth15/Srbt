from typing import Optional
from sqlmodel import Field, SQLModel


class InvoiceItem(SQLModel, table=True):
    __tablename__ = "invoiceitem"

    id:            Optional[int] = Field(default=None, primary_key=True)
    invoice_id:    int           = Field(foreign_key="invoice.id", index=True)
    order_item_id: Optional[int] = Field(default=None, foreign_key="orderitem.id")
    description:   str           = Field(max_length=200)
    qty:           float         = Field(default=1.0)
    unit:          str           = Field(default="Ton", max_length=50)
    rate:          float         = Field(default=0.0)
    dc_number:     Optional[str] = Field(default=None, max_length=100)
    amount:        float         = Field(default=0.0)
