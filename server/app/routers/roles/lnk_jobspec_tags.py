from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session
from app.models import rolesLnkJobSpecTags
from app.schemas import LnkJobSpecTagBase
from app.dependencies import _get_link_or_404, _upsert_link, _delete_link

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-tags", response_model=list[LnkJobSpecTagBase])
def list_jobspecs_tags(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LnkJobSpecTagBase]:
    statement = select(rolesLnkJobSpecTags)
    if active_only:
        statement = statement.where(rolesLnkJobSpecTags.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-tags/{jobspec_id}/{tag_id}", response_model=LnkJobSpecTagBase)
def get_jobspec_tag(jobspec_id: int, tag_id: int, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    link = session.get(rolesLnkJobSpecTags, (jobspec_id, tag_id))
    if not link:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    return link

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-tags/by-job-spec-id/{jobspec_id}", response_model=list[LnkJobSpecTagBase])
def get_jobspec_tags(jobspec_id: int, tag_id: int, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    link = session.get(rolesLnkJobSpecTags, (jobspec_id, None))
    if not link:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    return link

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-tags/by-tag-id/{tag_id}", response_model=list[LnkJobSpecTagBase])
def get_jobspecs_tag(tag_id: int, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    link = session.get(rolesLnkJobSpecTags, (None, tag_id))
    if not link:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    return link

@router.post(conf_pathname()+"/v1/roles/lnk/jobspec-tags", response_model=LnkJobSpecTagBase)
def create_or_update_jobspec_tag(payload: LnkJobSpecTagBase, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    return _upsert_link(session, rolesLnkJobSpecTags, payload)

@router.delete(conf_pathname()+"/v1/roles/lnk/jobspecs-tags/{jobspec_id}/{tag_id}", response_model=LnkJobSpecTagBase)
def delete_jobspec_tag(jobspec_id: int, tag_id: int, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    return _delete_link(session, rolesLnkJobSpecTags, jobspec_id, tag_id)
