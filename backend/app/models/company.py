from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class Company(SQLModel, table=True):
    id:         Optional[int] = Field(default=None, primary_key=True)
    name:       str           = Field(max_length=200, index=True)
    phone:      Optional[str] = Field(default=None, max_length=15)
    email:      Optional[str] = Field(default=None, max_length=255)
    gst_number: Optional[str] = Field(default=None, max_length=20)
    address:    Optional[str] = Field(default=None, max_length=500)
    is_active:  bool          = Field(default=True)
    created_at: datetime      = Field(default_factory=datetime.utcnow)
