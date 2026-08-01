from typing import Annotated, Any
from fastapi import Header, HTTPException
from pydantic import BaseModel
from sqlmodel import Session
from ollama import Client, Message

from app.config import ollama_url_tag, ollama_api_key_tag, ollama_model_tag, ollama_sys_prompt_tag, ollama_knowledge_source_tag
from app.models import appSetting
from app.schemas import ollamaModelBase, OllamaModelsResponse, OllamaJobspecResponse
from app.dependencies import _get_appSetting_or_404

def __ollama_helper (ollamaHost: str, ollamaApiKey: str | None) -> Client:
    if (ollamaApiKey and ollamaApiKey != ''):
        oClient = Client (
            host = ollamaHost,
            headers = {'Authorization:': 'Bearer ' + ollamaApiKey },
        )
    else:
        oClient = Client (
            host = ollamaHost
        )
    return oClient

def _get_ollama_models_or_404(session: Session) -> OllamaModelsResponse:
    models: list[ollamaModelBase] = []
    ollamaHost = _get_appSetting_or_404(session, appSetting, ollama_url_tag(), True)
    client = __ollama_helper(ollamaHost.Value, None)

    try:
        items = range(len(client.list().models))
        for i in items:
            obj = ollamaModelBase()
            obj.Key = client.list().models[i].model
            obj.Name = client.list().models[i].model
            models.append(obj)
        if not models:
            raise HTTPException(status_code=404, detail=f"ollama models not found")
        return OllamaModelsResponse(
            models=models,
            state=200,
            message=None
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        return OllamaModelsResponse(
            models=[],
            state=500,
            message=str(e)
        )

def _get_ollama_jobspec_analysis_or_404(session: Session) -> OllamaJobspecResponse:
    result: any
    try:
        ollamaHost = _get_appSetting_or_404(session, appSetting, ollama_url_tag(), True)
        ollamaModel = _get_appSetting_or_404(session, appSetting, ollama_model_tag(), True)
        client = __ollama_helper(ollamaHost.Value, None)

        outcome = client.generate(model=ollamaModel, prompt='Why is the sky blue?')
        return OllamaJobspecResponse(
            outcome=outcome if outcome else "",
            state=200,
            message=None
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        return OllamaJobspecResponse(
            outcome="",
            state=500,
            message=str(e)
        )
