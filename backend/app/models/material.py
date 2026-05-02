from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class AggregateSize(str, Enum):
    mm6 = "6mm"
    mm12 = "12mm"
    mm20 = "20mm"
    mm40 = "40mm"


class Material(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100)
    size: AggregateSize
    price_per_ton: float
    stock_tons: float = Field(default=0.0)
    is_active: bool = Field(default=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
