from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import LuWorkModel
from app.schemas import LookupCreate, LookupRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/lookup/work-models", response_model=list[LookupRead])
def list_work_models(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuWorkModel)
    if active_only:
        statement = statement.where(LuWorkModel.IsActive == True)
    statement = statement.order_by(LuWorkModel.Order)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/lookup/work-models/{work_model_id}", response_model=LookupRead)
def get_work_model(work_model_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _get_entity_or_404(session, LuWorkModel, work_model_id)

@router.post(conf_pathname()+"/v1/lookup/work-models", response_model=LookupRead)
def create_or_update_work_model(payload: LookupCreate, session: Session = Depends(get_session)) -> LookupRead:
    return _upsert_entity(session, LuWorkModel, payload)

@router.delete(conf_pathname()+"/v1/lookup/work-models/{work_model_id}", response_model=LookupRead)
def delete_work_model(work_model_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _soft_delete_entity(session, LuWorkModel, work_model_id)





#@router.get("/api/getLuWorkModels", response_model=list[LookupRead])
#def get_lu_work_models(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
#    statement = select(LuWorkModel)
#    if active_only:
#        statement = statement.where(LuWorkModel.IsActive == True)
#    statement = statement.order_by(LuWorkModel.Order)
#    return session.exec(statement).all()
