from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from ..dependencies import _get_appSetting_or_404, _upsert_appSetting, _soft_delete_appSetting
from app.database import get_session
from app.models import appSetting
from app.schemas import appSettingBase

router = APIRouter()

@router.get(conf_pathname()+"/v1/app-settings", response_model=list[appSettingBase])
def list_settings(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[appSettingBase]:
    return _get_appSetting_or_404(session, appSetting, None, active_only)

@router.get(conf_pathname()+"/v1/app-settings/{key}", response_model=appSettingBase)
def get_settings(key: str, session: Session = Depends(get_session)) -> appSettingBase:
    return _get_appSetting_or_404(session, appSetting, key, None)

@router.post(conf_pathname()+"/v1/app-settings", response_model=appSettingBase)
def create_or_update_setting(payload: appSettingBase, session: Session = Depends(get_session)) -> appSettingBase:
    return _upsert_appSetting(session, appSetting, payload)

@router.delete(conf_pathname()+"/v1/app-settings/{key}", response_model=appSettingBase)
def delete_setting(key: str, session: Session = Depends(get_session)) -> appSettingBase:
    return _soft_delete_appSetting(session, appSetting, key)
