from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import PlaceOfWork
from app.schemas import PlaceOfWorkCreate, PlaceOfWorkRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/places-of-work", response_model=list[PlaceOfWorkRead])
def list_places_of_work(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[PlaceOfWorkRead]:
    statement = select(Source)
    if active_only:
        statement = statement.where(Source.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/places-of-work/{place_of_work_id}", response_model=PlaceOfWorkRead)
def get_place_of_work(place_of_work_id: int, session: Session = Depends(get_session)) -> PlaceOfWorkRead:
    return _get_entity_or_404(session, PlaceOfWork, place_of_work_id)

@router.post(conf_pathname()+"/v1/places-of-work", response_model=PlaceOfWorkRead)
def create_or_update_place_of_work(payload: PlaceOfWorkCreate, session: Session = Depends(get_session)) -> PlaceOfWorkRead:
    return _upsert_entity(session, PlaceOfWork, payload)

@router.delete(conf_pathname()+"/v1/places-of-work/{place_of_work_id}", response_model=PlaceOfWorkRead)
def delete_place_of_work(place_of_work_id: int, session: Session = Depends(get_session)) -> PlaceOfWorkRead:
    return _soft_delete_entity(session, PlaceOfWork, place_of_work_id)
