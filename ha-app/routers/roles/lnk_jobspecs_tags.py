from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.models import rolesLnkJobSpecTags
from app.schemas import LnkJobSpecTagBase
from app.dependencies import _get_link_or_404, _upsert_link, _delete_link

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lnk/jobspecs-tags", response_model=list[LnkJobSpecTagBase])
def list_jobspecs_tags(*, session: Session = Depends(get_session)) -> list[LnkJobSpecTagBase]:
    return _get_link_or_404(session, rolesLnkJobSpecTags, None, None)

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-tag/{jobspec_id}/{tag_id}", response_model=LnkJobSpecTagBase)
def get_jobspec_tag(jobspec_id: int, tag_id: int, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    return _get_link_or_404(session, rolesLnkJobSpecTags, jobspec_id, tag_id)

@router.get(conf_pathname()+"/v1/roles/lnk/jobspec-tags/{jobspec_id}", response_model=list[LnkJobSpecTagBase])
def get_jobspec_tags(jobspec_id: int, session: Session = Depends(get_session)) -> list[LnkJobSpecTagBase]:
    return _get_link_or_404(session, rolesLnkJobSpecTags, jobspec_id, None)

@router.get(conf_pathname()+"/v1/roles/lnk/jobspecs-tag/{tag_id}", response_model=list[LnkJobSpecTagBase])
def get_jobspecs_tag(tag_id: int, session: Session = Depends(get_session)) -> list[LnkJobSpecTagBase]:
    return _get_link_or_404(session, rolesLnkJobSpecTags, None, tag_id)

@router.post(conf_pathname()+"/v1/roles/lnk/jobspec-tag", response_model=LnkJobSpecTagBase)
def create_or_update_jobspec_tag(payload: LnkJobSpecTagBase, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    return _upsert_link(session, rolesLnkJobSpecTags, payload)

@router.delete(conf_pathname()+"/v1/roles/lnk/jobspec-tag/{jobspec_id}/{tag_id}", response_model=LnkJobSpecTagBase)
def delete_jobspec_tag(jobspec_id: int, tag_id: int, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    return _delete_link(session, rolesLnkJobSpecTags, jobspec_id, tag_id)

@router.delete(conf_pathname()+"/v1/roles/lnk/jobspec-tags/{jobspec_id}", response_model=LnkJobSpecTagBase)
def delete_jobspec_tag(jobspec_id: int, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    return _delete_link(session, rolesLnkJobSpecTags, jobspec_id, None)

@router.delete(conf_pathname()+"/v1/roles/lnk/jobspecs-tag/{tag_id}", response_model=LnkJobSpecTagBase)
def delete_jobspec_tag(tag_id: int, session: Session = Depends(get_session)) -> LnkJobSpecTagBase:
    return _delete_link(session, rolesLnkJobSpecTags, None, tag_id)
