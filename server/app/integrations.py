import os
from typing import Annotated, Any
from fastapi import Header, HTTPException
from pydantic import BaseModel
from sqlmodel import Session
from ollama import Client, Message
from app.vector_store import VectorStoreService

from app.config import ollama_url_tag, ollama_api_key_tag, ollama_model_tag, ollama_sys_prompt_tag, ollama_knowledge_source_tag
from app.models import appSetting
from app.schemas import ollamaModelBase, OllamaModelsResponse, ollamaResponseBase
from app.dependencies import get_appSetting_or_404

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
    knowledgeSource = get_appSetting_or_404(session, appSetting, ollama_knowledge_source_tag(), True).Value

    if os.path.exists(knowledgeSource):
        with open(knowledgeSource, 'r') as file:
            return file.read()
    else:
        return ''

def _get_ollama_models_or_404(session: Session) -> OllamaModelsResponse:
    models: list[ollamaModelBase] = []
    ollamaHost = get_appSetting_or_404(session, appSetting, ollama_url_tag(), True).Value
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

def _get_ollama_generate_or_404(session: Session, request: str, payload: str, addKnowledge: bool | None = None) -> ollamaResponseBase:
    try:
        ollamaHost = get_appSetting_or_404(session, appSetting, ollama_url_tag(), True).Value
        ollamaModel = get_appSetting_or_404(session, appSetting, ollama_model_tag(), True).Value
        systemPrompt = get_appSetting_or_404(session, appSetting, ollama_sys_prompt_tag(), True).Value
        userPrompt = ''
        client = __ollama_helper(ollamaHost, None)

        context_text = ''
        if addKnowledge:
            try:
                # Use local Chroma + sentence-transformers to fetch short relevant context
                vsvc = VectorStoreService()
                chunks = vsvc.search_relevant_chunks(request + ' ' + payload, top_k=3)
                if chunks:
                    context_text = "\n\n".join([c.text for c in chunks])
                else:
                    # Fallback to legacy file-based knowledge if vector store is empty
                    context_text = __getKnowledge(session)
            except Exception:
                # If anything fails, gracefully fallback to file-based knowledge
                context_text = __getKnowledge(session)

        if context_text:
            # If knowledge was added and relevant chunks were found, avoid re-sending
            # the full payload (jobspec). Provide the context and a minimal instruction.
            userPrompt = (
                'Relevant context:\n'
                + context_text
                + '\n\n'
                + request
                + '\n\n'
                + 'Use only the context above for document details; do not assume information not present there.'
            )
        else:
            # Fall back to original behavior when no context is available
            userPrompt = request + '\n\n' + payload

        outcome = client.generate(model=ollamaModel, system=systemPrompt, prompt=userPrompt)
        if outcome:
            return ollamaResponseBase(
                completed   = outcome.completed,
                done        = outcome.done,
                done_reason = outcome.done_reason,
                context     = ",".join(map(str, outcome.context)),
                thinking    = outcome.thinking,
                outcome     = outcome.response, 
                state       = 200,
                message     = None
            )
        else:
            return ollamaResponseBase(
                outcome="",
                state=200,
                message=None
            )

    except HTTPException as e:
        raise e
    except Exception as e:
        return ollamaResponseBase(
            outcome="",
            state=500,
            message=str(e)
        )
