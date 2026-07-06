from app.config import conf_pathname
from fastapi import APIRouter
from app.database import init_db

router = APIRouter()

@router.on_event("startup")
def on_startup() -> None:
    init_db()

@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
