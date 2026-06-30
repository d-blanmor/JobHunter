from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_link_or_404, _upsert_link, _soft_delete_link
from app.database import get_session, init_db
from app.models import LnkJobSpecBenefit
from app.schemas import LnkJobSpecBenefitCreate, LnkJobSpecBenefitRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/lnk/jobspec-benefits", response_model=list[LnkJobSpecBenefitRead])
def list_jobspecs_benefits(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LnkJobSpecBenefitRead]:
    statement = select(LnkJobSpecBenefit)
    if active_only:
        statement = statement.where(LnkJobSpecBenefit.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/lnk/jobspec-benefits/{jobspec_id}/{benefit_id}", response_model=LnkJobSpecBenefitRead)
def get_jobspec_benefit(jobspec_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefitRead:
    link = session.get(LnkJobSpecBenefit, (jobspec_id, benefit_id))
    if not link:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    return link

@router.get(conf_pathname()+"/v1/lnk/jobspec-benefits/by-benefit-id/{benefit_id}", response_model=list[LnkJobSpecBenefitRead])
def get_jobspecs_benefit(benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefitRead:
    entity = session.get(LnkJobSpecBenefit, (jobspec_id, benefit_id))
    if not entity:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    return entity

#@router.get(conf_pathname()+"/v1/lnk/jobspec-benefits/by-job-spec-id/{jobspec_id}", response_model=list[LnkJobSpecBenefitRead])
#def get_jobspec_benefits(jobspec_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefitRead:
#    entity = session.get(LnkJobSpecBenefit, (jobspec_id, benefit_id))
#    if not entity:
#        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
#    return entity

@router.post(conf_pathname()+"/v1/lnk/jobspec-benefits", response_model=LnkJobSpecBenefitRead)
def create_or_update_jobspec_benefit(payload: LnkJobSpecBenefitCreate, session: Session = Depends(get_session)) -> LnkJobSpecBenefitRead:
    return _upsert_link(session, LnkJobSpecBenefit, payload)

#@router.delete(conf_pathname()+"/v1/lnk/jobspec-benefits/{jobspec_id}/{benefit_id}", response_model=LnkJobSpecBenefitRead)
#def delete_jobspec_benefit(jobspec_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefitRead:
#    entity = session.get(LnkJobSpecBenefit, (jobspec_id, benefit_id))
#    if not entity:
#        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
#    entity.IsActive = False
#    session.add(entity)
#    session.commit()
#    session.refresh(entity)
#    return entity
