from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import LuRoleType
from app.schemas import LookupCreate, LookupRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/lookup/role-types", response_model=list[LookupRead])
def list_role_types(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuRoleType)
    if active_only:
        statement = statement.where(LuRoleType.IsActive == True)
    statement = statement.order_by(LuRoleType.Order)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/lookup/role-types/{role_type_id}", response_model=LookupRead)
def get_role_type(role_type_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _get_entity_or_404(session, LuRoleType, role_type_id)

@router.post(conf_pathname()+"/v1/lookup/role-types", response_model=LookupRead)
def create_or_update_role_type(payload: LookupCreate, session: Session = Depends(get_session)) -> LookupRead:
    return _upsert_entity(session, LuRoleType, payload)

@router.delete(conf_pathname()+"/v1/lookup/role-types/{role_type_id}", response_model=LookupRead)
def delete_role_type(role_type_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _soft_delete_entity(session, LuRoleType, role_type_id)



#@router.get("/api/getLuRoleTypes", response_model=list[LookupRead])
#def get_lu_role_types(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
#    statement = select(LuRoleType)
#    if active_only:
#        statement = statement.where(LuRoleType.IsActive == True)
#    statement = statement.order_by(LuRoleType.Order)
#    return session.exec(statement).all()

#@router.post("/api/setLuRoleType", response_model=LookupRead)
#def set_lu_role_type(payload: LookupCreate, session: Session = Depends(get_session)) -> LookupRead:
#    role_type = LuRoleType(**payload.model_dump())
#    session.add(role_type)
#    session.commit()
#    session.refresh(role_type)
#    return role_type

#@router.post("/api/setLuWorkModel", response_model=LookupRead)
#def set_lu_work_model(payload: LookupCreate, session: Session = Depends(get_session)) -> LookupRead:
#    work_model = LuWorkModel(**payload.model_dump())
#    session.add(work_model)
#    session.commit()
#    session.refresh(work_model)
#    return work_model
