from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from ..dependencies import get_tag_or_404, upsert_tag, soft_delete_tag
from app.database import get_session
from app.models import tag
from app.schemas import TagBase

router = APIRouter()

@router.get(conf_pathname()+"/v1/tags", response_model=list[TagBase])
def list_tags(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[TagBase]:
    return get_tag_or_404(session = session, model = tag, IsActive = active_only)

@router.get(conf_pathname()+"/v1/tags/{tag_id}", response_model=TagBase)
def get_tag(tag_id: int, session: Session = Depends(get_session)) -> TagBase:
    return get_tag_or_404(session = session, model = tag, tag_id = tag_id)

@router.get(conf_pathname()+"/v1/tags/by-name/{tag_Name}", response_model=list[TagBase])
def get_tag(tag_Name: str, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[TagBase]:
    return get_tag_or_404(session = session, model = tag, tag_name = tag_Name, IsActive = active_only)

@router.get(conf_pathname()+"/v1/tags/by-context/{tag_Context}", response_model=list[TagBase])
def get_tag(tag_Context: str, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[TagBase]:
    return get_tag_or_404(session = session, model = tag, tag_context = tag_Context, IsActive = active_only)

@router.get(conf_pathname()+"/v1/tags/by-name-context/{tag_Name}/{tag_Context}", response_model=list[TagBase])
def get_tag(tag_Name: str, tag_Context: str, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[TagBase]:
    return get_tag_or_404(session = session, model = tag, tag_name = tag_Name, tag_context = tag_Context, IsActive = active_only)

@router.post(conf_pathname()+"/v1/tags", response_model=TagBase)
def create_or_update_tag(payload: TagBase, session: Session = Depends(get_session)) -> TagBase:
    return upsert_tag(session = session, model = tag, payload = payload)

@router.delete(conf_pathname()+"/v1/tags/{tag_id}", response_model=TagBase)
def delete_tag(tag_id: int, session: Session = Depends(get_session)) -> TagBase:
    return soft_delete_tag(session = session, model = tag, tag_id = tag_id)
