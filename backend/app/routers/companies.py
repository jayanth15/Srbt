from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models.company import Company
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/companies", tags=["companies"])


class CompanyCreate(BaseModel):
    name:       str
    phone:      Optional[str] = None
    email:      Optional[str] = None
    gst_number: Optional[str] = None
    address:    Optional[str] = None


class CompanyUpdate(BaseModel):
    name:       Optional[str] = None
    phone:      Optional[str] = None
    email:      Optional[str] = None
    gst_number: Optional[str] = None
    address:    Optional[str] = None
    is_active:  Optional[bool] = None


@router.get("/")
async def list_companies(
    search:  str = "",
    skip:    int = 0,
    limit:   int = 20,
    session: AsyncSession = Depends(get_session),
):
    q = select(Company).where(Company.is_active == True)
    if search:
        q = q.where(Company.name.icontains(search))
    result = await session.exec(q.order_by(Company.name).offset(skip).limit(limit))
    return result.all()


@router.get("/{company_id}")
async def get_company(company_id: int, session: AsyncSession = Depends(get_session)):
    co = await session.get(Company, company_id)
    if not co or not co.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return co


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_company(
    data:    CompanyCreate,
    session: AsyncSession = Depends(get_session),
    _:       User         = Depends(get_current_user),
):
    co = Company(**data.model_dump())
    session.add(co)
    await session.commit()
    await session.refresh(co)
    return co


@router.put("/{company_id}")
async def update_company(
    company_id: int,
    data:       CompanyUpdate,
    session:    AsyncSession = Depends(get_session),
    _:          User         = Depends(get_current_user),
):
    co = await session.get(Company, company_id)
    if not co:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(co, k, v)
    session.add(co)
    await session.commit()
    await session.refresh(co)
    return co
