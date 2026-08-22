from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesContact
from app.schemas import ContactBase
from app.dependencies import get_entity_or_404, upsert_entity, soft_delete_entity, get_contacts_by_source

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/contacts", response_model=list[ContactBase])
def list_contacts(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[ContactBase]:
    return get_entity_or_404(session = session, model = rolesContact, IsActive = active_only)

@router.get(conf_pathname()+"/v1/roles/contacts/{contact_id}", response_model=ContactBase)
def get_contact(contact_id: int, session: Session = Depends(get_session)) -> ContactBase:
    return get_entity_or_404(session = session, model = rolesContact, entity_id = contact_id)

@router.get(conf_pathname()+"/v1/roles/contacts/by-source/{source_id}", response_model=list[ContactBase])
def get_contacts_by_source(source_id: int, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[ContactBase]:
    return get_contacts_by_source(session = session, source_id = source_id, active_only = active_only);

@router.post(conf_pathname()+"/v1/roles/contacts", response_model=ContactBase)
def create_or_update_contact(payload: ContactBase, session: Session = Depends(get_session)) -> ContactBase:
    return upsert_entity(session = session, model = rolesContact, payload = payload)

@router.delete(conf_pathname()+"/v1/roles/contacts/{contact_id}", response_model=ContactBase)
def delete_contact(contact_id: int, session: Session = Depends(get_session)) -> ContactBase:
    return soft_delete_entity(session = session, model = rolesContact, entity_id = contact_id)
