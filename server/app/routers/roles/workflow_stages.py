from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import rolesJobSpec, rolesApplication, rolesInterview
from app.schemas import JobSpecBase

router = APIRouter()

@router.get(conf_pathname()+"/v1/workflow/stages/received", response_model=list[JobSpecBase])
def list_jobspecs_received(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecBase]:
    statement = select(rolesJobSpec)
    statement = statement.where(rolesJobSpec.ApplicationId == None)  # JobSpec has not been applied
    if active_only:
        statement = statement.where(rolesJobSpec.IsActive == True)
    statement = statement.order_by(rolesJobSpec.Created.desc())
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/workflow/stages/applied", response_model=list[JobSpecBase])
def list_jobspecs_applied(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecBase]:
    statement = select(rolesJobSpec).left_outer_join(rolesApplication).left_outer_join(rolesInterview)
    statement = statement.where(rolesJobSpec.ApplicationId != None).where(rolesApplication.Discarded != True).where(rolesApplication.IsActive == True)  # JobSpec has a non discarded applications
    statement = statement.where(rolesInterview.Id == None)  # Application has no interviews
    if active_only:
        statement = statement.where(rolesJobSpec.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/workflow/stages/interview", response_model=list[JobSpecBase])
def list_jobspecs_interview(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecBase]:
    statement = select(rolesJobSpec).left_outer_join(rolesApplication).left_outer_join(rolesInterview)
    statement = statement.where(rolesJobSpec.ApplicationId != None).where(rolesApplication.Discarded != True).where(rolesApplication.IsActive == True)  # JobSpec has a non discarded applications
    statement = statement.where(rolesInterview.Id != None).where(rolesInterview.IsActive == True)  # Application has at least one interview
    if active_only:
        statement = statement.where(rolesJobSpec.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/workflow/stages/offer", response_model=list[JobSpecBase])
def list_jobspecs_offer(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecBase]:
    return None

@router.get(conf_pathname()+"/v1/workflow/stages/discarded", response_model=list[JobSpecBase])
def list_jobspecs_discarded(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecBase]:
    statement = select(rolesJobSpec).left_outer_join(rolesApplication).left_outer_join(rolesInterview)
    statement = statement.where(rolesJobSpec.ApplicationId != None).where(rolesApplication.Discarded == True).where(rolesApplication.IsActive == True)  # JobSpec has a discarded application
    if active_only:
        statement = statement.where(rolesJobSpec.IsActive == True)
    return session.exec(statement).all()
