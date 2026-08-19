from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.schemas import vwWorkflowBase
from app.dependencies import workflow_get_received, workflow_get_applied, workflow_get_interview, workflow_get_offer, workflow_get_discarded

router = APIRouter()

@router.get(conf_pathname()+"/v1/workflow/stages/received", response_model=list[vwWorkflowBase])
def list_jobspecs_received(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_received(session = session)

@router.get(conf_pathname()+"/v1/workflow/stages/applied", response_model=list[vwWorkflowBase])
def list_jobspecs_applied(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_applied(session = session)

@router.get(conf_pathname()+"/v1/workflow/stages/interview", response_model=list[vwWorkflowBase])
def list_jobspecs_interview(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_interview(session = session)

@router.get(conf_pathname()+"/v1/workflow/stages/offer", response_model=list[vwWorkflowBase])
def list_jobspecs_offer(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_offer(session = session)

@router.get(conf_pathname()+"/v1/workflow/stages/discarded", response_model=list[vwWorkflowBase])
def list_jobspecs_discarded(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_discarded(session = session)
