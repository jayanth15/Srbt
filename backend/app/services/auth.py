from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    return jwt.encode({"sub": subject, "exp": expire}, settings.secret_key, algorithm=settings.algorithm)


async def get_user_by_phone(session: AsyncSession, phone: str) -> Optional[User]:
    result = await session.exec(select(User).where(User.phone == phone))
    return result.first()


async def authenticate_user(session: AsyncSession, phone: str, password: str) -> Optional[User]:
    user = await get_user_by_phone(session, phone)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
