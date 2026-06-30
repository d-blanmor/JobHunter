from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import JobSpec
from app.schemas import JobSpecCreate, JobSpecRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/job-specs", response_model=list[JobSpecRead])
def list_job_specs(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecRead]:
    statement = select(JobSpec)
    if active_only:
        statement = statement.where(JobSpec.IsActive == True)
    statement = statement.order_by(JobSpec.Created.desc())
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/job-specs/{job_spec_id}", response_model=JobSpecRead)
def get_job_spec_v1(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecRead:
    return _get_entity_or_404(session, JobSpec, job_spec_id)

@router.post(conf_pathname()+"/v1/job-specs", response_model=JobSpecRead)
def create_or_update_job_spec(payload: JobSpecCreate, session: Session = Depends(get_session)) -> JobSpecRead:
    return _upsert_entity(session, JobSpec, payload)

@router.delete(conf_pathname()+"/v1/job-specs/{job_spec_id}", response_model=JobSpecRead)
def delete_job_spec_v1(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecRead:
    return _soft_delete_entity(session, JobSpec, job_spec_id)



#@router.get("/api/getJobSpecs", response_model=list[JobSpecRead])
#def get_job_specs(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecRead]:
#    statement = select(JobSpec)
#    if active_only:
#        statement = statement.where(JobSpec.IsActive == True)
#    statement = statement.order_by(JobSpec.Created.desc())
#    return session.exec(statement).all()

#@router.get("/api/getJobSpecById", response_model=JobSpecRead)
#def get_job_spec_by_id(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecRead:
#    job_spec = session.get(JobSpec, job_spec_id)
#    if not job_spec:
#        raise HTTPException(status_code=404, detail="Job spec not found")
#    return job_spec

#@router.post("/api/setJobSpec", response_model=JobSpecRead)
#def set_job_spec(payload: JobSpecCreate, session: Session = Depends(get_session)) -> JobSpecRead:
#    job_spec = JobSpec(**payload.model_dump())
#    session.add(job_spec)
#    session.commit()
#    session.refresh(job_spec)
#    return job_spec
