from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session
from app.models import tag
from app.schemas import TagBase

router = APIRouter()

@router.get(conf_pathname()+"/v1/tags", response_model=list[TagBase])
def list_sources(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[TagBase]:
    statement = select(tag)
    if active_only:
        statement = statement.where(tag.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/tags/{tag_id}", response_model=TagBase)
def get_source(tag_id: int, session: Session = Depends(get_session)) -> TagBase:
    return _get_entity_or_404(session, tag, tag_id)

@router.post(conf_pathname()+"/v1/tags", response_model=TagBase)
def create_or_update_source(payload: TagBase, session: Session = Depends(get_session)) -> TagBase:
    return _upsert_entity(session, tag, payload)

@router.delete(conf_pathname()+"/v1/tags/{tag_id}", response_model=TagBase)
def delete_source(tag_id: int, session: Session = Depends(get_session)) -> TagBase:
    return _soft_delete_entity(session, tag, tag_id)
