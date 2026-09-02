from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from fastapi.exceptions import RequestValidationError
from sqlmodel import Session

from app.config import conf_pathname, ollama_prompt_analyse_jobspec_tag, ollama_prompt_match_profile_tag, ollama_prompt_generater_cover_letter_tag
from app.database import get_session
from app.dependencies import get_appSetting_or_404, get_entity_or_404
from app.integrations import _get_ollama_generate_or_404, _get_ollama_models_or_404
from app.models import appSetting, rolesJobSpec
from app.schemas import OllamaJobspecRequest, OllamaModelsResponse, VectorIndexRequest, genericResponse, ollamaResponseBase
from app.vector_store import Chunk, VectorStoreService

router = APIRouter()

@router.get(conf_pathname()+"/v1/external/ollama/get-models", response_model=OllamaModelsResponse)
def list_models(*, session: Session = Depends(get_session)) -> OllamaModelsResponse:
  return _get_ollama_models_or_404(session)

@router.post(conf_pathname()+"/v1/external/ollama/check-jobspec", response_model=ollamaResponseBase)
def check_jobspec_endpoint(jobspec: OllamaJobspecRequest, session: Session = Depends(get_session)) -> ollamaResponseBase:
  request = get_appSetting_or_404(session, appSetting, ollama_prompt_analyse_jobspec_tag(), True).Value
  return _get_ollama_generate_or_404(session, request, jobspec.jobspec, False)

@router.post(conf_pathname()+"/v1/external/ollama/check-jobspec-profile", response_model=ollamaResponseBase)
def check_jobspec_profile_endpoint(jobspec: OllamaJobspecRequest, session: Session = Depends(get_session)) -> ollamaResponseBase:
  request = get_appSetting_or_404(session, appSetting, ollama_prompt_match_profile_tag(), True).Value
  return _get_ollama_generate_or_404(session, request, jobspec.jobspec, True)

@router.post(conf_pathname()+"/v1/external/ollama/get-coverletter", response_model=ollamaResponseBase)
def get_coverletter_endpoint(jobspec: OllamaJobspecRequest, session: Session = Depends(get_session)) -> ollamaResponseBase:
  request = get_appSetting_or_404(session, appSetting, ollama_prompt_generater_cover_letter_tag(), True).Value
  return _get_ollama_generate_or_404(session, request, jobspec.jobspec, True)

@router.post(conf_pathname()+"/v1/external/ollama/index-context", response_model=genericResponse)
def index_context_endpoint(payload: VectorIndexRequest, session: Session = Depends(get_session)) -> genericResponse:
  text = (payload.text or "").strip()
  if text == "":
    raise HTTPException(status_code=400, detail="text is required")

  entity_id = payload.entity_id or f"{payload.entity_type}:{payload.label or 'document'}"
  metrics = {"id": entity_id, "entity_type": payload.entity_type}

  try:
    store = VectorStoreService()
    store.add_documents([
      Chunk(
        text=text,
        metadata={
          "id": entity_id,
          "entity_type": payload.entity_type,
          "label": payload.label or entity_id,
        }
      )
    ])
    return genericResponse(outcome=metrics, state=200, message=None)
  except Exception as e:
    return genericResponse(outcome="", state=500, message=str(e))

@router.post(conf_pathname()+"/v1/external/ollama/index-profile", response_model=genericResponse)
def index_profile_endpoint(payload: VectorIndexRequest, session: Session = Depends(get_session)) -> genericResponse:
  payload.entity_type = "profile"
  return index_context_endpoint(payload, session)

@router.post(conf_pathname()+"/v1/external/ollama/index-jobspec/{job_spec_id}", response_model=genericResponse)
def index_jobspec_endpoint(job_spec_id: int, session: Session = Depends(get_session)) -> genericResponse:
  job_spec = get_entity_or_404(session, rolesJobSpec, entity_id=job_spec_id)

  text_parts = [
    job_spec.Position,
    job_spec.Company,
    job_spec.Description,
    job_spec.Analysis,
    job_spec.Profile,
    job_spec.Notes,
  ]
  text = "\n".join(part for part in text_parts if part and part.strip())
  if text == "":
    raise HTTPException(status_code=400, detail="No job spec content to index")

  try:
    store = VectorStoreService()
    store.add_documents([
      Chunk(
        text=text,
        metadata={
          "id": f"jobspec:{job_spec.Id}",
          "entity_type": "job_spec",
          "job_spec_id": job_spec.Id,
          "position": job_spec.Position,
        },
      )
    ])
    return genericResponse(
      outcome={"job_spec_id": job_spec.Id, "entity_type": "job_spec", "indexed": True},
      state=200,
      message=None,
    )
  except Exception as e:
    return genericResponse(outcome="", state=500, message=str(e))
