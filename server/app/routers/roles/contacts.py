from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesContact
from app.schemas import ContactBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/contacts", response_model=list[ContactBase])
def list_contacts(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[ContactBase]:
    return _get_entity_or_404(session, rolesContact, None, active_only)

@router.get(conf_pathname()+"/v1/roles/contacts/{contact_id}", response_model=ContactBase)
def get_contact(contact_id: int, session: Session = Depends(get_session)) -> ContactBase:
    return _get_entity_or_404(session, rolesContact, contact_id)

@router.post(conf_pathname()+"/v1/roles/contacts", response_model=ContactBase)
def create_or_update_contact(payload: ContactBase, session: Session = Depends(get_session)) -> ContactBase:
    return _upsert_entity(session, rolesContact, payload)

@router.delete(conf_pathname()+"/v1/roles/contacts/{contact_id}", response_model=ContactBase)
def delete_contact(contact_id: int, session: Session = Depends(get_session)) -> ContactBase:
    return _soft_delete_entity(session, rolesContact, contact_id)
