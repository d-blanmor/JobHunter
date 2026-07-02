from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesLuWorkModel
from app.schemas import StandardLookupBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lookup/work-models", response_model=list[StandardLookupBase])
def list_work_models(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[StandardLookupBase]:
    #statement = select(rolesLuWorkModel)
    #if active_only:
    #    statement = statement.where(rolesLuWorkModel.IsActive == True)
    #statement = statement.order_by(rolesLuWorkModel.Order)
    #return session.exec(statement).all()
    return _get_entity_or_404(session, rolesLuWorkModel, None, active_only)

@router.get(conf_pathname()+"/v1/roles/lookup/work-models/{work_model_id}", response_model=StandardLookupBase)
def get_work_model(work_model_id: int, session: Session = Depends(get_session)) -> StandardLookupBase:
    return _get_entity_or_404(session, rolesLuWorkModel, work_model_id)

@router.post(conf_pathname()+"/v1/roles/lookup/work-models", response_model=StandardLookupBase)
def create_or_update_work_model(payload: StandardLookupBase, session: Session = Depends(get_session)) -> StandardLookupBase:
    return _upsert_entity(session, rolesLuWorkModel, payload)

@router.delete(conf_pathname()+"/v1/roles/lookup/work-models/{work_model_id}", response_model=StandardLookupBase)
def delete_work_model(work_model_id: int, session: Session = Depends(get_session)) -> StandardLookupBase:
    return _soft_delete_entity(session, rolesLuWorkModel, work_model_id)
