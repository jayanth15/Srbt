from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.routers import auth, orders, vehicles, reports
from app.routers import materials, companies, invoices


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title=settings.app_name, version="0.2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,      prefix="/api/v1")
app.include_router(orders.router,    prefix="/api/v1")
app.include_router(materials.router, prefix="/api/v1")
app.include_router(companies.router, prefix="/api/v1")
app.include_router(invoices.router,  prefix="/api/v1")
app.include_router(vehicles.router,  prefix="/api/v1")
app.include_router(reports.router,   prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok", "app": settings.app_name}
