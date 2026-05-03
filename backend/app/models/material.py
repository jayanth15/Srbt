from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Material(SQLModel, table=True):
    id:           Optional[int] = Field(default=None, primary_key=True)
    name:         str           = Field(max_length=100)
    description:  str           = Field(default="", max_length=255)
    category:     str           = Field(default="", max_length=100)
    unit:         str           = Field(default="Ton", max_length=50)
    rate:         float         = Field(default=0.0)
    stock_tons:   float         = Field(default=0.0)
    stock_level:  str           = Field(default="high", max_length=20)  # high / low / out
    image_base64: Optional[str] = Field(default=None)                   # base64-encoded image
    is_active:    bool          = Field(default=True)
    updated_at:   datetime      = Field(default_factory=datetime.utcnow)
