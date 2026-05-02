from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel


class UserRole(str, Enum):
    admin = "admin"
    staff = "staff"
    customer = "customer"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    phone: str = Field(max_length=15, unique=True, index=True)
    email: Optional[str] = Field(default=None, max_length=255, unique=True, index=True)
    hashed_password: str
    role: UserRole = Field(default=UserRole.customer)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
