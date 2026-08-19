from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesLuRoleType
from app.schemas import StandardLookupBase
from app.dependencies import get_entity_or_404, upsert_entity, soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lookup/role-types", response_model=list[StandardLookupBase])
def list_role_types(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[StandardLookupBase]:
    return get_entity_or_404(session = session, model = rolesLuRoleType, IsActive = active_only)

@router.get(conf_pathname()+"/v1/roles/lookup/role-types/{role_type_id}", response_model=StandardLookupBase)
def get_role_type(role_type_id: int, session: Session = Depends(get_session)) -> StandardLookupBase:
    return get_entity_or_404(session = session, model = rolesLuRoleType, entity_id = role_type_id)

@router.post(conf_pathname()+"/v1/roles/lookup/role-types", response_model=StandardLookupBase)
def create_or_update_role_type(payload: StandardLookupBase, session: Session = Depends(get_session)) -> StandardLookupBase:
    return upsert_entity(session = session, model = rolesLuRoleType, payload = payload)

@router.delete(conf_pathname()+"/v1/roles/lookup/role-types/{role_type_id}", response_model=StandardLookupBase)
def delete_role_type(role_type_id: int, session: Session = Depends(get_session)) -> StandardLookupBase:
    return soft_delete_entity(session = session, model = rolesLuRoleType, entity_id = role_type_id)
