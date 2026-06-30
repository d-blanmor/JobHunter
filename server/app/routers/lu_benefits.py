from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import LuBenefit
from app.schemas import LookupCreate, LookupRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/lookup/benefits", response_model=list[LookupRead])
def list_benefits(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuBenefit)
    if active_only:
        statement = statement.where(LuBenefit.IsActive == True)
    statement = statement.order_by(LuBenefit.Order)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/lookup/benefits/{benefit_id}", response_model=LookupRead)
def get_benefit(benefit_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _get_entity_or_404(session, LuBenefit, benefit_id)

@router.post(conf_pathname()+"/v1/lookup/benefits", response_model=LookupRead)
def create_or_update_benefit(payload: LookupCreate, session: Session = Depends(get_session)) -> LookupRead:
    return _upsert_entity(session, LuBenefit, payload)

@router.delete(conf_pathname()+"/v1/lookup/benefits/{benefit_id}", response_model=LookupRead)
def delete_benefit(benefit_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _soft_delete_entity(session, LuBenefit, benefit_id)



#@router.get("/api/getLuBenefits", response_model=list[LookupRead])
#def get_lu_benefits(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
#    statement = select(LuBenefit)
#    if active_only:
#        statement = statement.where(LuBenefit.IsActive == True)
#    statement = statement.order_by(LuBenefit.Order)
#    return session.exec(statement).all()

#@router.post("/api/setLuBenefit", response_model=LookupRead)
#def set_lu_benefit(payload: LookupCreate, session: Session = Depends(get_session)) -> LookupRead:
#    benefit = LuBenefit(**payload.model_dump())
#    session.add(benefit)
#    session.commit()
#    session.refresh(benefit)
#    return benefit
