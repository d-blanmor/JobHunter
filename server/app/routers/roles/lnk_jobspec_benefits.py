from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import rolesLnkJobSpecBenefit
from app.schemas import LnkJobSpecBenefitBase
from app.dependencies import _get_link_or_404, _upsert_link, _delete_link

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-benefits", response_model=list[LnkJobSpecBenefitBase])
def list_jobspecs_benefits(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LnkJobSpecBenefitBase]:
    statement = select(rolesLnkJobSpecBenefit)
    if active_only:
        statement = statement.where(rolesLnkJobSpecBenefit.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-benefits/{jobspec_id}/{benefit_id}", response_model=LnkJobSpecBenefitBase)
def get_jobspec_benefit(jobspec_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefitBase:
    link = session.get(rolesLnkJobSpecBenefit, (jobspec_id, benefit_id))
    if not link:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    return link

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-benefits/by-job-spec-id/{jobspec_id}", response_model=list[LnkJobSpecBenefitBase])
def get_jobspec_benefits(jobspec_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefitBase:
    link = session.get(rolesLnkJobSpecBenefit, (jobspec_id, None))
    if not link:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    return link

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-benefits/by-benefit-id/{benefit_id}", response_model=list[LnkJobSpecBenefitBase])
def get_jobspecs_benefit(benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefitBase:
    link = session.get(rolesLnkJobSpecBenefit, (None, benefit_id))
    if not link:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    return link

@router.post(conf_pathname()+"/v1/roles/lnk/jobspec-benefits", response_model=LnkJobSpecBenefitBase)
def create_or_update_jobspec_benefit(payload: LnkJobSpecBenefitBase, session: Session = Depends(get_session)) -> LnkJobSpecBenefitBase:
    return _upsert_link(session, rolesLnkJobSpecBenefit, payload)

@router.delete(conf_pathname()+"/v1/roles/lnk/jobspecs-benefits/{jobspec_id}/{benefit_id}", response_model=LnkJobSpecBenefitBase)
def delete_jobspec_benefit(jobspec_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefitBase:
    return _delete_link(session, rolesLnkJobSpecBenefit, jobspec_id, benefit_id)
