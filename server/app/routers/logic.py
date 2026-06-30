from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import JobSpec, Application, Interview
from app.schemas import JobSpecRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/logic/stage/received", response_model=list[JobSpecRead])
def list_jobspecs_received(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecRead]:
    statement = select(JobSpec)
    statement = statement.where(JobSpec.ApplicationId == None)  # JobSpec has not been applied
    if active_only:
        statement = statement.where(JobSpec.IsActive == True)
    statement = statement.order_by(JobSpec.Created.desc())
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/logic/stage/applied", response_model=list[JobSpecRead])
def list_jobspecs_applied(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecRead]:
    statement = select(JobSpec).left_outer_join(Application).left_outer_join(Interview)
    statement = statement.where(JobSpec.ApplicationId != None).where(Application.Discarded != True).where(Application.IsActive == True)  # JobSpec has a non discarded applications
    statement = statement.where(Interview.Id == None)  # Application has no interviews
    if active_only:
        statement = statement.where(JobSpec.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/logic/stage/interview", response_model=list[JobSpecRead])
def list_jobspecs_interview(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecRead]:
    statement = select(JobSpec).left_outer_join(Application).left_outer_join(Interview)
    statement = statement.where(JobSpec.ApplicationId != None).where(Application.Discarded != True).where(Application.IsActive == True)  # JobSpec has a non discarded applications
    statement = statement.where(Interview.Id != None).where(Interview.IsActive == True)  # Application has at least one interview
    if active_only:
        statement = statement.where(JobSpec.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/logic/stage/offer", response_model=list[JobSpecRead])
def list_jobspecs_offer(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecRead]:
    return None

@router.get(conf_pathname()+"/v1/logic/stage/discarded", response_model=list[JobSpecRead])
def list_jobspecs_discarded(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecRead]:
    statement = select(JobSpec).left_outer_join(Application).left_outer_join(Interview)
    statement = statement.where(JobSpec.ApplicationId != None).where(Application.Discarded == True).where(Application.IsActive == True)  # JobSpec has a discarded application
    if active_only:
        statement = statement.where(JobSpec.IsActive == True)
    return session.exec(statement).all()
