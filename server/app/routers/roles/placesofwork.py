from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesPlaceOfWork
from app.schemas import PlaceOfWorkBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/places-of-work", response_model=list[PlaceOfWorkBase])
def list_places_of_work(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[PlaceOfWorkBase]:
    return _get_entity_or_404(session, rolesPlaceOfWork, None, active_only)

@router.get(conf_pathname()+"/v1/roles/places-of-work/{place_of_work_id}", response_model=PlaceOfWorkBase)
def get_place_of_work(place_of_work_id: int, session: Session = Depends(get_session)) -> PlaceOfWorkBase:
    return _get_entity_or_404(session, rolesPlaceOfWork, place_of_work_id)

@router.post(conf_pathname()+"/v1/roles/places-of-work", response_model=PlaceOfWorkBase)
def create_or_update_place_of_work(payload: PlaceOfWorkBase, session: Session = Depends(get_session)) -> PlaceOfWorkBase:
    return _upsert_entity(session, rolesPlaceOfWork, payload)

@router.delete(conf_pathname()+"/v1/roles/places-of-work/{place_of_work_id}", response_model=PlaceOfWorkBase)
def delete_place_of_work(place_of_work_id: int, session: Session = Depends(get_session)) -> PlaceOfWorkBase:
    return _soft_delete_entity(session, rolesPlaceOfWork, place_of_work_id)
