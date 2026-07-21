from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.models import rolesLnkOfferBenefit
from app.schemas import LnkOfferBenefitBase
from app.dependencies import _get_link_or_404, _upsert_link, _delete_link

router = APIRouter()

@router.get(conf_pathname()+"/v1/roles/lnk/offers-benefits", response_model=list[LnkOfferBenefitBase])
def list_offers_benefits(*, session: Session = Depends(get_session)) -> list[LnkOfferBenefitBase]:
    return _get_link_or_404(session, rolesLnkOfferBenefit, None, None)

@router.get(conf_pathname()+"/v1/roles/lnk/offer-benefit/{offer_id}/{benefit_id}", response_model=LnkOfferBenefitBase)
def get_offer_benefit(offer_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkOfferBenefitBase:
    return _get_link_or_404(session, rolesLnkOfferBenefit, offer_id, benefit_id)

@router.get(conf_pathname()+"/v1/roles/lnk/offer-benefits/{offer_id}", response_model=list[LnkOfferBenefitBase])
def get_offer_benefits(offer_id: int, session: Session = Depends(get_session)) -> LnkOfferBenefitBase:
    return _get_link_or_404(session, rolesLnkOfferBenefit, offer_id, None)

@router.get(conf_pathname()+"/v1/roles/lnk/offers-benefit/{benefit_id}", response_model=list[LnkOfferBenefitBase])
def get_offers_benefit(benefit_id: int, session: Session = Depends(get_session)) -> LnkOfferBenefitBase:
    return _get_link_or_404(session, rolesLnkOfferBenefit, None, benefit_id)

@router.post(conf_pathname()+"/v1/roles/lnk/offer-benefit", response_model=LnkOfferBenefitBase)
def create_or_update_offer_benefit(payload: LnkOfferBenefitBase, session: Session = Depends(get_session)) -> LnkOfferBenefitBase:
    return _upsert_link(session, rolesLnkOfferBenefit, payload)

@router.delete(conf_pathname()+"/v1/roles/lnk/offer-benefit/{offer_id}/{benefit_id}", response_model=LnkOfferBenefitBase)
def delete_offer_benefit(offer_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkOfferBenefitBase:
    return _delete_link(session, rolesLnkOfferBenefit, offer_id, benefit_id)

@router.delete(conf_pathname()+"/v1/roles/lnk/offer-benefits/{offer_id}", response_model=LnkOfferBenefitBase)
def delete_offer_benefit(offer_id: int, session: Session = Depends(get_session)) -> LnkOfferBenefitBase:
    return _delete_link(session, rolesLnkOfferBenefit, offer_id, None)

@router.delete(conf_pathname()+"/v1/roles/lnk/offers-benefit/{benefit_id}", response_model=LnkOfferBenefitBase)
def delete_offer_benefit(benefit_id: int, session: Session = Depends(get_session)) -> LnkOfferBenefitBase:
    return _delete_link(session, rolesLnkOfferBenefit, None, benefit_id)
