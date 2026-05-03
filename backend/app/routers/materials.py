import base64
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from app.database import get_session
from app.models.material import Material
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/materials", tags=["materials"])


class MaterialCreate(BaseModel):
    name:        str
    description: str  = ""
    category:    str  = ""
    unit:        str  = "Ton"
    rate:        float = 0.0
    stock_level: str  = "high"


class MaterialUpdate(BaseModel):
    name:        Optional[str]   = None
    description: Optional[str]  = None
    category:    Optional[str]  = None
    unit:        Optional[str]  = None
    rate:        Optional[float] = None
    stock_level: Optional[str]  = None
    is_active:   Optional[bool]  = None


# ── READ ──────────────────────────────────────────────────────────────────────

@router.get("/")
async def list_materials(
    search:   str = "",
    category: str = "",
    skip:     int = 0,
    limit:    int = 50,
    session:  AsyncSession = Depends(get_session),
):
    q = select(Material).where(Material.is_active == True)
    if search:
        q = q.where(Material.name.icontains(search))
    if category:
        q = q.where(Material.category == category)
    result = await session.exec(q.offset(skip).limit(limit))
    return result.all()


@router.get("/{material_id}")
async def get_material(material_id: int, session: AsyncSession = Depends(get_session)):
    mat = await session.get(Material, material_id)
    if not mat or not mat.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return mat


# ── WRITE (JWT protected) ─────────────────────────────────────────────────────

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_material(
    data:    MaterialCreate,
    session: AsyncSession = Depends(get_session),
    _:       User         = Depends(get_current_user),
):
    mat = Material(**data.model_dump())
    session.add(mat)
    await session.commit()
    await session.refresh(mat)
    return mat


@router.put("/{material_id}")
async def update_material(
    material_id: int,
    data:        MaterialUpdate,
    session:     AsyncSession = Depends(get_session),
    _:           User         = Depends(get_current_user),
):
    mat = await session.get(Material, material_id)
    if not mat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    updates = data.model_dump(exclude_unset=True)
    for k, v in updates.items():
        setattr(mat, k, v)
    mat.updated_at = datetime.utcnow()
    session.add(mat)
    await session.commit()
    await session.refresh(mat)
    return mat


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: int,
    session:     AsyncSession = Depends(get_session),
    _:           User         = Depends(get_current_user),
):
    mat = await session.get(Material, material_id)
    if not mat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    mat.is_active = False
    session.add(mat)
    await session.commit()


@router.post("/{material_id}/image")
async def upload_image(
    material_id: int,
    file:        UploadFile = File(...),
    session:     AsyncSession = Depends(get_session),
    _:           User         = Depends(get_current_user),
):
    mat = await session.get(Material, material_id)
    if not mat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    content_type = file.content_type or "image/jpeg"
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image")
    data = await file.read()
    b64 = base64.b64encode(data).decode("utf-8")
    mat.image_base64 = f"data:{content_type};base64,{b64}"
    mat.updated_at = datetime.utcnow()
    session.add(mat)
    await session.commit()
    await session.refresh(mat)
    return {"image_base64": mat.image_base64}
