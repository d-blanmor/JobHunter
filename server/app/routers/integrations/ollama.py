from typing import Any
from app.config import conf_pathname

from fastapi import APIRouter, Depends, Query
from fastapi.exceptions import RequestValidationError
from sqlmodel import Session

from app.database import get_session
from app.models import appSetting
from app.schemas import OllamaModelsResponse, OllamaJobspecResponse
from app.integrations import _get_ollama_models_or_404, _get_ollama_jobspec_analysis_or_404

router = APIRouter()

@router.get(conf_pathname()+"/v1/external/ollama/get-models", response_model=OllamaModelsResponse)
def list_models(*, session: Session = Depends(get_session)) -> OllamaModelsResponse:
  return _get_ollama_models_or_404(session)

@router.get(conf_pathname()+"/v1/external/ollama/check-jobspec", response_model=OllamaJobspecResponse)
def check_jobspec(*, session: Session = Depends(get_session)) -> OllamaJobspecResponse:
  return _get_ollama_jobspec_analysis_or_404(session)
