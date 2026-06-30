from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import Application
from app.schemas import ApplicationCreate, ApplicationRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/applications", response_model=list[ApplicationRead])
def list_applications(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[ApplicationRead]:
    statement = select(Application)
    if active_only:
        statement = statement.where(Application.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/applications/{application_id}", response_model=ApplicationRead)
def get_application(application_id: int, session: Session = Depends(get_session)) -> ApplicationRead:
    return _get_entity_or_404(session, Application, application_id)

@router.post(conf_pathname()+"/v1/applications", response_model=ApplicationRead)
def create_or_update_application(payload: ApplicationCreate, session: Session = Depends(get_session)) -> ApplicationRead:
    return _upsert_entity(session, Application, payload)

@router.delete(conf_pathname()+"/v1/applications/{application_id}", response_model=ApplicationRead)
def delete_application(application_id: int, session: Session = Depends(get_session)) -> ApplicationRead:
    return _soft_delete_entity(session, Application, application_id)




#@router.get("/api/getApplications", response_model=list[Application])
#def get_applications(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Application]:
#    statement = select(Application)
#    if active_only:
#        statement = statement.where(Application.IsActive == True)
#    return session.exec(statement).all()
