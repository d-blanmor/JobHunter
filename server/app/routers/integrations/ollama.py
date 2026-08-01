from typing import Any
from app.config import conf_pathname, ollama_prompt_analyse_jobspec_tag, ollama_prompt_match_profile_tag, ollama_prompt_generater_cover_letter_tag

from fastapi import APIRouter, Depends, Query
from fastapi.exceptions import RequestValidationError
from sqlmodel import Session

from app.database import get_session
from app.models import appSetting
from app.schemas import OllamaModelsResponse, OllamaJobspecResponse
from app.dependencies import _get_appSetting_or_404
from app.integrations import _get_ollama_models_or_404, _get_ollama_generate_or_404

router = APIRouter()

@router.get(conf_pathname()+"/v1/external/ollama/get-models", response_model=OllamaModelsResponse)
def list_models(*, session: Session = Depends(get_session)) -> OllamaModelsResponse:
  return _get_ollama_models_or_404(session)

@router.post(conf_pathname()+"/v1/external/ollama/check-jobspec", response_model=OllamaJobspecResponse)
def check_jobspec(jobspec: str, session: Session = Depends(get_session)) -> OllamaJobspecResponse:
  request = _get_appSetting_or_404(session, appSetting, ollama_prompt_analyse_jobspec_tag(), True).Value
  return _get_ollama_generate_or_404(session, request, jobspec, False)

@router.post(conf_pathname()+"/v1/external/ollama/check-jobspec-profile", response_model=OllamaJobspecResponse)
def check_jobspec(jobspec: str, session: Session = Depends(get_session)) -> OllamaJobspecResponse:
  request = _get_appSetting_or_404(session, appSetting, ollama_prompt_match_profile_tag(), True).Value
  return _get_ollama_generate_or_404(session, request, jobspec, True)

@router.post(conf_pathname()+"/v1/external/ollama/get-coverletter", response_model=OllamaJobspecResponse)
def check_jobspec(jobspec: str, session: Session = Depends(get_session)) -> OllamaJobspecResponse:
  request = _get_appSetting_or_404(session, appSetting, ollama_prompt_generater_cover_letter_tag(), True).Value
  return _get_ollama_generate_or_404(session, request, jobspec, True)
