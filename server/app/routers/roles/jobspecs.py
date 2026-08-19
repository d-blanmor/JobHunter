from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesJobSpec, rolesLnkJobSpecTags, tag, rolesLnkJobSpecBenefit, rolesLuBenefit
from app.schemas import JobSpecBase, TagBase, StandardLookupBase
from app.dependencies import get_entity_or_404, upsert_entity, soft_delete_entity, get_tags_by_entity, get_benefits_by_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/job-specs", response_model=list[JobSpecBase])
def list_job_specs(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecBase]:
    return get_entity_or_404(session = session, model = rolesJobSpec, IsActive = active_only)

@router.get(conf_pathname()+"/v1/roles/job-specs/{job_spec_id}", response_model=JobSpecBase)
def get_job_spec_v1(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecBase:
    return get_entity_or_404(session = session, model = rolesJobSpec, entity_id = job_spec_id)

@router.post(conf_pathname()+"/v1/roles/job-specs", response_model=JobSpecBase)
def create_or_update_job_spec(payload: JobSpecBase, session: Session = Depends(get_session)) -> JobSpecBase:
    return upsert_entity(session = session, model = rolesJobSpec, payload = payload)

@router.delete(conf_pathname()+"/v1/roles/job-specs/{job_spec_id}", response_model=JobSpecBase)
def delete_job_spec_v1(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecBase:
    return soft_delete_entity(session = session, model = rolesJobSpec, entity_id = job_spec_id)

@router.get(conf_pathname()+"/v1/roles/job-specs/get_tags/{job_spec_id}", response_model=list[TagBase])
def get_job_spec_tags_v1(job_spec_id: int, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[TagBase]:
    return get_tags_by_entity(session = session, lnk_model = rolesLnkJobSpecTags, model = tag, entity_id = job_spec_id, active_only = active_only)

@router.get(conf_pathname()+"/v1/roles/job-specs/get_benefits/{job_spec_id}", response_model=list[Any])
def get_job_spec_benefits_v1(job_spec_id: int, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Any]:
    return get_benefits_by_entity(session = session, lnk_model = rolesLnkJobSpecBenefit, model = rolesLuBenefit, job_spec_id = job_spec_id, active_only = active_only)
