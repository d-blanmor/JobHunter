from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.schemas import vwWorkflowBase
from app.dependencies import workflow_get_jobspecs

router = APIRouter()

@router.get(conf_pathname()+"/v1/workflow/jobspecs", response_model=list[vwWorkflowBase])
def list_jobspecs_received(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_jobspecs(session = session, IsActive = True)

@router.get(conf_pathname()+"/v1/workflow/stages/received", response_model=list[vwWorkflowBase])
def list_jobspecs_received(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_jobspecs(session = session, Stage = 'received', IsActive = True)

@router.get(conf_pathname()+"/v1/workflow/stages/applied", response_model=list[vwWorkflowBase])
def list_jobspecs_applied(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_jobspecs(session = session, Stage = 'applied', IsActive = True)

@router.get(conf_pathname()+"/v1/workflow/stages/interview", response_model=list[vwWorkflowBase])
def list_jobspecs_interview(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_jobspecs(session = session, Stage = 'interview', IsActive = True)

@router.get(conf_pathname()+"/v1/workflow/stages/offer", response_model=list[vwWorkflowBase])
def list_jobspecs_offer(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_jobspecs(session = session, Stage = 'offer', IsActive = True)

@router.get(conf_pathname()+"/v1/workflow/stages/discarded", response_model=list[vwWorkflowBase])
def list_jobspecs_discarded(*, session: Session = Depends(get_session)) -> list[vwWorkflowBase]:
    return workflow_get_jobspecs(session = session, Stage = 'discarded', IsActive = True)
