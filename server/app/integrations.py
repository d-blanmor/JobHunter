import os
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

def __getKnowledge (session: Session) -> str:
    knowledgeSource = _get_appSetting_or_404(session, appSetting, ollama_knowledge_source_tag(), True).Value

    if os.path.exists(knowledgeSource):
        with open(knowledgeSource, 'r') as file:
            return file.read()
    else:
        return ''

def _get_ollama_models_or_404(session: Session) -> OllamaModelsResponse:
    models: list[ollamaModelBase] = []
    ollamaHost = _get_appSetting_or_404(session, appSetting, ollama_url_tag(), True).Value
    client = __ollama_helper(ollamaHost, None)

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

def _get_ollama_generate_or_404(session: Session, request: str, payload: str, addKnowledge: bool | None = None) -> OllamaJobspecResponse:
    try:
        ollamaHost = _get_appSetting_or_404(session, appSetting, ollama_url_tag(), True).Value
        ollamaModel = _get_appSetting_or_404(session, appSetting, ollama_model_tag(), True).Value
        systemPrompt = _get_appSetting_or_404(session, appSetting, ollama_sys_prompt_tag(), True).Value
        userPrompt = ''
        knowledge = ''
        client = __ollama_helper(ollamaHost, None)

        if addKnowledge:
            knowledge = __getKnowledge(session)

        if knowledge != '':
            userPrompt = 'The user profile is:\n' + knowledge + '\n'
        userPrompt = userPrompt + '\n\n' + request + '\n\n' + payload

        outcome = client.generate(model=ollamaModel, system=systemPrompt, prompt=userPrompt)
        return OllamaJobspecResponse(
            outcome=outcome.response if outcome else "",
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
