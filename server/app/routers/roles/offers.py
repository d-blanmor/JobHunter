from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from app.database import get_session
from app.models import rolesOffer
from app.schemas import OfferBase
from app.dependencies import _get_entity_or_404, _upsert_entity, _soft_delete_entity, _get_offers_by_job_spec

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/offers", response_model=list[OfferBase])
def list_offers(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[OfferBase]:
    return _get_entity_or_404(session, rolesOffer, None, active_only)

@router.get(conf_pathname()+"/v1/roles/offers/{offer_id}", response_model=OfferBase)
def get_offer_v1(offer_id: int, session: Session = Depends(get_session)) -> OfferBase:
    return _get_entity_or_404(session, rolesOffer, offer_id)

@router.get(conf_pathname()+"/v1/roles/offers-by-jobspec/{jobspec_id}", response_model=list[OfferBase])
def get_jobspec_benefit(jobspec_id: int, session: Session = Depends(get_session)) -> list[OfferBase]:
    return _get_offers_by_job_spec(session, jobspec_id)

@router.post(conf_pathname()+"/v1/roles/offers", response_model=OfferBase)
def create_or_update_offer(payload: OfferBase, session: Session = Depends(get_session)) -> OfferBase:
    return _upsert_entity(session, rolesOffer, payload)

@router.delete(conf_pathname()+"/v1/roles/offers/{offer_id}", response_model=OfferBase)
def delete_offer_v1(offer_id: int, session: Session = Depends(get_session)) -> OfferBase:
    return _soft_delete_entity(session, rolesOffer, offer_id)
