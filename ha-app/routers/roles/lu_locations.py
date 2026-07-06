from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesLuLocation
from app.schemas import LuLocationBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lookup/locations", response_model=list[LuLocationBase])
def list_locations(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LuLocationBase]:
    #statement = select(rolesLuLocation)
    #if active_only:
    #    statement = statement.where(rolesLuLocation.IsActive == True)
    #statement = statement.order_by(rolesLuLocation.Order)
    #return session.exec(statement).all()
    return _get_entity_or_404(session, rolesLuLocation, None, active_only)

@router.get(conf_pathname()+"/v1/roles/lookup/locations/{location_id}", response_model=LuLocationBase)
def get_location(location_id: int, session: Session = Depends(get_session)) -> LuLocationBase:
    return _get_entity_or_404(session, rolesLuLocation, location_id)

@router.post(conf_pathname()+"/v1/roles/lookup/locations", response_model=LuLocationBase)
def create_or_update_location(payload: LuLocationBase, session: Session = Depends(get_session)) -> LuLocationBase:
    return _upsert_entity(session, rolesLuLocation, payload)

@router.delete(conf_pathname()+"/v1/roles/lookup/locations/{location_id}", response_model=LuLocationBase)
def delete_location(location_id: int, session: Session = Depends(get_session)) -> LuLocationBase:
    return _soft_delete_entity(session, rolesLuLocation, location_id)
