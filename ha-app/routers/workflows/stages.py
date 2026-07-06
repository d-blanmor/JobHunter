from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import rolesJobSpec, rolesApplication, rolesInterview
from app.schemas import JobSpecBase
from app.dependencies import _workflow_get_received, _workflow_get_applied, _workflow_get_interview, _workflow_get_offer, _workflow_get_discarded

router = APIRouter()

@router.get(conf_pathname()+"/v1/workflow/stages/received", response_model=list[JobSpecBase])
def list_jobspecs_received(*, session: Session = Depends(get_session)) -> list[JobSpecBase]:
    return _workflow_get_received(session)

@router.get(conf_pathname()+"/v1/workflow/stages/applied", response_model=list[JobSpecBase])
def list_jobspecs_applied(*, session: Session = Depends(get_session)) -> list[JobSpecBase]:
    return _workflow_get_applied(session)

@router.get(conf_pathname()+"/v1/workflow/stages/interview", response_model=list[JobSpecBase])
def list_jobspecs_interview(*, session: Session = Depends(get_session)) -> list[JobSpecBase]:
    return _workflow_get_interview(session)

@router.get(conf_pathname()+"/v1/workflow/stages/offer", response_model=list[JobSpecBase])
def list_jobspecs_offer(*, session: Session = Depends(get_session)) -> list[JobSpecBase]:
    return _workflow_get_offer(session)

@router.get(conf_pathname()+"/v1/workflow/stages/discarded", response_model=list[JobSpecBase])
def list_jobspecs_discarded(*, session: Session = Depends(get_session)) -> list[JobSpecBase]:
    return _workflow_get_discarded(session)
