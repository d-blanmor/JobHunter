from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import rolesApplication
from app.schemas import ApplicationBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/applications", response_model=list[ApplicationBase])
def list_applications(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[ApplicationBase]:
    statement = select(rolesApplication)
    if active_only:
        statement = statement.where(rolesApplication.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/roles/applications/{application_id}", response_model=ApplicationBase)
def get_application(application_id: int, session: Session = Depends(get_session)) -> ApplicationBase:
    return _get_entity_or_404(session, rolesApplication, application_id)

@router.post(conf_pathname()+"/v1/roles/applications", response_model=ApplicationBase)
def create_or_update_application(payload: ApplicationBase, session: Session = Depends(get_session)) -> ApplicationBase:
    return _upsert_entity(session, rolesApplication, payload)

@router.delete(conf_pathname()+"/v1/roles/applications/{application_id}", response_model=ApplicationBase)
def delete_application(application_id: int, session: Session = Depends(get_session)) -> ApplicationBase:
    return _soft_delete_entity(session, rolesApplication, application_id)
