from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesInterview
from app.schemas import InterviewBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity, _get_interviews_by_job_spec

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/interviews", response_model=list[InterviewBase])
def list_interviews(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[InterviewBase]:
    return _get_entity_or_404(session, rolesInterview, None, active_only)

@router.get(conf_pathname()+"/v1/roles/interviews/{interview_id}", response_model=InterviewBase)
def get_interview(interview_id: int, session: Session = Depends(get_session)) -> InterviewBase:
    return _get_entity_or_404(session, rolesInterview, interview_id)

@router.get(conf_pathname()+"/v1/roles/interviews-by-jobspec/{jobspec_id}", response_model=list[InterviewBase])
def get_jobspec_benefit(jobspec_id: int, session: Session = Depends(get_session)) -> list[InterviewBase]:
    return _get_interviews_by_job_spec(session, jobspec_id)

@router.post(conf_pathname()+"/v1/roles/interviews", response_model=InterviewBase)
def create_or_update_interview(payload: InterviewBase, session: Session = Depends(get_session)) -> InterviewBase:
    return _upsert_entity(session, rolesInterview, payload)

@router.delete(conf_pathname()+"/v1/roles/interviews/{interview_id}", response_model=InterviewBase)
def delete_interview(interview_id: int, session: Session = Depends(get_session)) -> InterviewBase:
    return _soft_delete_entity(session, rolesInterview, interview_id)
