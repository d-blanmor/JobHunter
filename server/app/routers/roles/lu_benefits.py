from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesLuBenefit
from app.schemas import StandardLookupBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lookup/benefits", response_model=list[StandardLookupBase])
def list_benefits(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[StandardLookupBase]:
    #statement = select(rolesLuBenefit)
    #if active_only:
    #    statement = statement.where(rolesLuBenefit.IsActive == True)
    #statement = statement.order_by(rolesLuBenefit.Order)
    #return session.exec(statement).all()
    return _get_entity_or_404(session, rolesLuBenefit, None, active_only)

@router.get(conf_pathname()+"/v1/roles/lookup/benefits/{benefit_id}", response_model=StandardLookupBase)
def get_benefit(benefit_id: int, session: Session = Depends(get_session)) -> StandardLookupBase:
    return _get_entity_or_404(session, rolesLuBenefit, benefit_id)

@router.post(conf_pathname()+"/v1/roles/lookup/benefits", response_model=StandardLookupBase)
def create_or_update_benefit(payload: StandardLookupBase, session: Session = Depends(get_session)) -> StandardLookupBase:
    return _upsert_entity(session, rolesLuBenefit, payload)

@router.delete(conf_pathname()+"/v1/roles/lookup/benefits/{benefit_id}", response_model=StandardLookupBase)
def delete_benefit(benefit_id: int, session: Session = Depends(get_session)) -> StandardLookupBase:
    return _soft_delete_entity(session, rolesLuBenefit, benefit_id)
