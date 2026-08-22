from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from ..dependencies import get_appSetting_or_404, upsert_appSetting, soft_delete_appSetting
from app.database import get_session
from app.models import appSetting
from app.schemas import appSettingBase

router = APIRouter()

@router.get(conf_pathname()+"/v1/app-settings", response_model=list[appSettingBase])
def list_settings(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[appSettingBase]:
    return get_appSetting_or_404(session = session, model = appSetting, IsActive = active_only)

@router.get(conf_pathname()+"/v1/app-settings/{key}", response_model=appSettingBase)
def get_settings(key: str, session: Session = Depends(get_session)) -> appSettingBase:
    return get_appSetting_or_404(session = session, model = appSetting, settingKey = key)

@router.post(conf_pathname()+"/v1/app-settings", response_model=appSettingBase)
def create_or_update_setting(payload: appSettingBase, session: Session = Depends(get_session)) -> appSettingBase:
    return upsert_appSetting(session = session, model = appSetting, payload = payload)

@router.delete(conf_pathname()+"/v1/app-settings/{key}", response_model=appSettingBase)
def delete_setting(key: str, session: Session = Depends(get_session)) -> appSettingBase:
    return soft_delete_appSetting(session = session, model = appSetting, appSettingKey = key)
