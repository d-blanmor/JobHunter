from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesSource
from app.schemas import SourceBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/sources", response_model=list[SourceBase])
def list_sources(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[SourceBase]:
    return _get_entity_or_404(session, rolesSource, None, active_only)

@router.get(conf_pathname()+"/v1/roles/sources/{source_id}", response_model=SourceBase)
def get_source(source_id: int, session: Session = Depends(get_session)) -> SourceBase:
    return _get_entity_or_404(session, rolesSource, source_id)

@router.post(conf_pathname()+"/v1/roles/sources", response_model=SourceBase)
def create_or_update_source(payload: SourceBase, session: Session = Depends(get_session)) -> SourceBase:
    return _upsert_entity(session, rolesSource, payload)

@router.delete(conf_pathname()+"/v1/roles/sources/{source_id}", response_model=SourceBase)
def delete_source(source_id: int, session: Session = Depends(get_session)) -> SourceBase:
    return _soft_delete_entity(session, rolesSource, source_id)
