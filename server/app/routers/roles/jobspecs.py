from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesJobSpec
from app.schemas import JobSpecBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/job-specs", response_model=list[JobSpecBase])
def list_job_specs(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecBase]:
    return _get_entity_or_404(session, rolesJobSpec, None, active_only)

@router.get(conf_pathname()+"/v1/roles/job-specs/{job_spec_id}", response_model=JobSpecBase)
def get_job_spec_v1(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecBase:
    return _get_entity_or_404(session, rolesJobSpec, job_spec_id)

@router.post(conf_pathname()+"/v1/roles/job-specs", response_model=JobSpecBase)
def create_or_update_job_spec(payload: JobSpecBase, session: Session = Depends(get_session)) -> JobSpecBase:
    return _upsert_entity(session, rolesJobSpec, payload)

@router.delete(conf_pathname()+"/v1/roles/job-specs/{job_spec_id}", response_model=JobSpecBase)
def delete_job_spec_v1(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecBase:
    return _soft_delete_entity(session, rolesJobSpec, job_spec_id)
