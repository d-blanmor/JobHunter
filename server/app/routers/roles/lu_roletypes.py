from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesLuRoleType
from app.schemas import StandardLookupBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lookup/role-types", response_model=list[StandardLookupBase])
def list_role_types(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[StandardLookupBase]:
    #statement = select(rolesLuRoleType)
    #if active_only:
    #    statement = statement.where(rolesLuRoleType.IsActive == True)
    #statement = statement.order_by(rolesLuRoleType.Order)
    #return session.exec(statement).all()
    return _get_entity_or_404(session, rolesLuRoleType, None, active_only)

@router.get(conf_pathname()+"/v1/roles/lookup/role-types/{role_type_id}", response_model=StandardLookupBase)
def get_role_type(role_type_id: int, session: Session = Depends(get_session)) -> StandardLookupBase:
    return _get_entity_or_404(session, rolesLuRoleType, role_type_id)

@router.post(conf_pathname()+"/v1/roles/lookup/role-types", response_model=StandardLookupBase)
def create_or_update_role_type(payload: StandardLookupBase, session: Session = Depends(get_session)) -> StandardLookupBase:
    return _upsert_entity(session, rolesLuRoleType, payload)

@router.delete(conf_pathname()+"/v1/roles/lookup/role-types/{role_type_id}", response_model=StandardLookupBase)
def delete_role_type(role_type_id: int, session: Session = Depends(get_session)) -> StandardLookupBase:
    return _soft_delete_entity(session, rolesLuRoleType, role_type_id)
