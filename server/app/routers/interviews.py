from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import Interview
from app.schemas import InterviewCreate, InterviewRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/interviews", response_model=list[InterviewRead])
def list_interviews(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[InterviewRead]:
    statement = select(Interview)
    if active_only:
        statement = statement.where(Interview.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/interviews/{interview_id}", response_model=InterviewRead)
def get_interview(interview_id: int, session: Session = Depends(get_session)) -> InterviewRead:
    return _get_entity_or_404(session, Interview, interview_id)

@router.post(conf_pathname()+"/v1/interviews", response_model=InterviewRead)
def create_or_update_interview(payload: InterviewCreate, session: Session = Depends(get_session)) -> InterviewRead:
    return _upsert_entity(session, Interview, payload)

@router.delete(conf_pathname()+"/v1/interviews/{interview_id}", response_model=InterviewRead)
def delete_interview(interview_id: int, session: Session = Depends(get_session)) -> InterviewRead:
    return _soft_delete_entity(session, Interview, interview_id)




#@router.get("/api/getInterviews", response_model=list[Interview])
#def get_interviews(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Interview]:
#    statement = select(Interview)
#    if active_only:
#        statement = statement.where(Interview.IsActive == True)
#    return session.exec(statement).all()
