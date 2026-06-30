from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import Source
from app.schemas import SourceCreate, SourceRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/sources", response_model=list[SourceRead])
def list_sources(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[SourceRead]:
    statement = select(Source)
    if active_only:
        statement = statement.where(Source.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/sources/{source_id}", response_model=SourceRead)
def get_source(source_id: int, session: Session = Depends(get_session)) -> SourceRead:
    return _get_entity_or_404(session, Source, source_id)

@router.post(conf_pathname()+"/v1/sources", response_model=SourceRead)
def create_or_update_source(payload: SourceCreate, session: Session = Depends(get_session)) -> SourceRead:
    return _upsert_entity(session, Source, payload)

@router.delete(conf_pathname()+"/v1/sources/{source_id}", response_model=SourceRead)
def delete_source(source_id: int, session: Session = Depends(get_session)) -> SourceRead:
    return _soft_delete_entity(session, Source, source_id)

#@router.get("/api/getSources", response_model=list[SourceRead])
#def get_sources(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[SourceRead]:
#    statement = select(Source)
#    if active_only:
#        statement = statement.where(Source.IsActive == True)
#    return session.exec(statement).all()

#@router.get("/api/getSourceById", response_model=SourceRead)
#def get_source_by_id(source_id: int, session: Session = Depends(get_session)) -> SourceRead:
#    source = session.get(Source, source_id)
#    if not source:
#        raise HTTPException(status_code=404, detail="Source not found")
#    return source

#@router.post("/api/setSource", response_model=SourceRead)
#def set_source(payload: SourceCreate, session: Session = Depends(get_session)) -> SourceRead:
#    source = Source(**payload.model_dump())
#    session.add(source)
#    session.commit()
#    session.refresh(source)
#    return source
