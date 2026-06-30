from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import LuLocation
from app.schemas import LuLocationRead, LuLocationCreate

router = APIRouter()

@router.get(conf_pathname()+"/v1/lookup/locations", response_model=list[LuLocationRead])
def list_locations(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LuLocationRead]:
    statement = select(LuLocation)
    if active_only:
        statement = statement.where(LuLocation.IsActive == True)
    statement = statement.order_by(LuLocation.Order)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/lookup/locations/{location_id}", response_model=LuLocationRead)
def get_location(location_id: int, session: Session = Depends(get_session)) -> LuLocationRead:
    return _get_entity_or_404(session, LuLocation, location_id)

@router.post(conf_pathname()+"/v1/lookup/locations", response_model=LuLocationRead)
def create_or_update_location(payload: LuLocationCreate, session: Session = Depends(get_session)) -> LuLocationRead:
    return _upsert_entity(session, LuLocation, payload)

@router.delete(conf_pathname()+"/v1/lookup/locations/{location_id}", response_model=LuLocationRead)
def delete_location(location_id: int, session: Session = Depends(get_session)) -> LuLocationRead:
    return _soft_delete_entity(session, LuLocation, location_id)




#@router.post("/api/setLuLocation", response_model=LuLocationRead)
#def set_lu_location(payload: LuLocationCreate, session: Session = Depends(get_session)) -> LuLocationRead:
#    location = LuLocation(**payload.model_dump())
#    session.add(location)
#    session.commit()
#    session.refresh(location)
#    return location

#@router.get("/api/getLuLocations", response_model=list[LookupRead])
#def get_lu_locations(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
#    statement = select(LuLocation)
#    if active_only:
#        statement = statement.where(LuLocation.IsActive == True)
#    statement = statement.order_by(LuLocation.Order)
#    return session.exec(statement).all()

#@router.get("/api/getLuLocationById", response_model=LuLocationRead)
#def get_lu_location_by_id(location_id: int, session: Session = Depends(get_session)) -> LuLocationRead:
#    location = session.get(LuLocation, location_id)
#    if not location:
#        raise HTTPException(status_code=404, detail="Location not found")
#    return location
