from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.filesystem import check_file_exists, list_files
from app.database import get_session

from app.schemas import genericResponse

router = APIRouter()

@router.get(conf_pathname()+"/v1/system/check/filesystem/{path}", response_model=genericResponse)
def check_file(*, path: str) -> genericResponse:
    return check_file_exists(path = path)

@router.get(conf_pathname()+"/v1/system/list/files/{path}/{filter}", response_model=genericResponse)
def list_settings(*, path: str, filter: str | None = None) -> genericResponse:
    return list_files(path = path, filter = filter)

