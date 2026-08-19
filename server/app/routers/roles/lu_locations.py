from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesLuLocation
from app.schemas import LuLocationBase
from app.dependencies import get_entity_or_404, upsert_entity, soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lookup/locations", response_model=list[LuLocationBase])
def list_locations(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LuLocationBase]:
    return get_entity_or_404(session = session, model = rolesLuLocation, IsActive = active_only)

@router.get(conf_pathname()+"/v1/roles/lookup/locations/{location_id}", response_model=LuLocationBase)
def get_location(location_id: int, session: Session = Depends(get_session)) -> LuLocationBase:
    return get_entity_or_404(session = session, model = rolesLuLocation, IsActive = location_id)

@router.post(conf_pathname()+"/v1/roles/lookup/locations", response_model=LuLocationBase)
def create_or_update_location(payload: LuLocationBase, session: Session = Depends(get_session)) -> LuLocationBase:
    return upsert_entity(session = session, model = rolesLuLocation, payload = payload)

@router.delete(conf_pathname()+"/v1/roles/lookup/locations/{location_id}", response_model=LuLocationBase)
def delete_location(location_id: int, session: Session = Depends(get_session)) -> LuLocationBase:
    return soft_delete_entity(session = session, model = rolesLuLocation, entity_id = location_id)
