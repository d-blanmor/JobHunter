export const API_HOST = import.meta.env.VITE_API_HOST ?? '127.0.0.1';
export const API_PORT = import.meta.env.VITE_API_PORT ?? '4171';
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';

export const DEV_SERVER_HOST = import.meta.env.VITE_DEV_SERVER_HOST ?? 'localhost';
export const DEV_SERVER_PORT = import.meta.env.VITE_DEV_SERVER_PORT ?? '4170';
export const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE ?? '10');

export const setting_keys = {
  'OLLAMA': {
    'OllamaURL': 'OLLAMA_URL',
    'OllamaApiKey': 'OLLAMA_API_KEY',
    'OllamaModel': 'OLLAMA_MODEL',
    'SystemPrompt': 'OLLAMA_SYSTEM_PROMPT',
    'PromptAnalyseJobspec': 'OLLAMA_PROMPT_ANALYSE_JOBSPEC',
    'PromptMatchProfile': 'OLLAMA_PROMPT_MATCH_PROFILE',
    'PromptGenerateCoverLetter': 'OLLAMA_PROMPT_GENERATE_COVER_LETTER',
    'KnowledgeSource': 'OLLAMA_KNOWLEDGE_SOURCE',
  }
}

export default {
  API_BASE,
  API_HOST,
  API_PORT,
  DEV_SERVER_HOST,
  DEV_SERVER_PORT,
  DEFAULT_PAGE_SIZE,
};
