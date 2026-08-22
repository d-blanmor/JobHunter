from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesApplication
from app.schemas import ApplicationBase
from app.dependencies import get_entity_or_404, upsert_entity, soft_delete_entity, get_applications_by_job_spec

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/applications", response_model=list[ApplicationBase])
def list_applications(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[ApplicationBase]:
    return get_entity_or_404(session = session, model = rolesApplication, IsActive = active_only)

@router.get(conf_pathname()+"/v1/roles/applications/{application_id}", response_model=ApplicationBase)
def get_application(application_id: int, session: Session = Depends(get_session)) -> ApplicationBase:
    return get_entity_or_404(session = session, model = rolesApplication, entity_id = application_id)

@router.get(conf_pathname()+"/v1/roles/applications-by-jobspec/{jobspec_id}", response_model=list[ApplicationBase])
def get_jobspec_benefit(jobspec_id: int, session: Session = Depends(get_session)) -> list[ApplicationBase]:
    return get_applications_by_job_spec(session = session, job_spec_id = jobspec_id)

@router.post(conf_pathname()+"/v1/roles/applications", response_model=ApplicationBase)
def create_or_update_application(payload: ApplicationBase, session: Session = Depends(get_session)) -> ApplicationBase:
    return upsert_entity(session = session, model = rolesApplication, payload = payload)

@router.delete(conf_pathname()+"/v1/roles/applications/{application_id}", response_model=ApplicationBase)
def delete_application(application_id: int, session: Session = Depends(get_session)) -> ApplicationBase:
    return soft_delete_entity(session = session, model = rolesApplication, entity_id = application_id)
