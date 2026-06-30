from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity
from app.database import get_session, init_db
from app.models import Contact
from app.schemas import ContactCreate, ContactRead

router = APIRouter()

@router.get(conf_pathname()+"/v1/contacts", response_model=list[ContactRead])
def list_contacts(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[ContactRead]:
    statement = select(Contact)
    if active_only:
        statement = statement.where(Contact.IsActive == True)
    return session.exec(statement).all()

@router.get(conf_pathname()+"/v1/contacts/{contact_id}", response_model=ContactRead)
def get_contact(contact_id: int, session: Session = Depends(get_session)) -> ContactRead:
    return _get_entity_or_404(session, Contact, contact_id)

@router.post(conf_pathname()+"/v1/contacts", response_model=ContactRead)
def create_or_update_contact(payload: ContactCreate, session: Session = Depends(get_session)) -> ContactRead:
    return _upsert_entity(session, Contact, payload)

@router.delete(conf_pathname()+"/v1/contacts/{contact_id}", response_model=ContactRead)
def delete_contact(contact_id: int, session: Session = Depends(get_session)) -> ContactRead:
    return _soft_delete_entity(session, Contact, contact_id)




#@router.get("/api/getContacts", response_model=list[Contact])
#def get_contacts(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Contact]:
#    statement = select(Contact)
#    if active_only:
#        statement = statement.where(Contact.IsActive == True)
#    return session.exec(statement).all()
