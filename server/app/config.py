import configparser

config = configparser.ConfigParser()
config.read("config.ini")

def conf_pathname() -> str:
    return config.get('api', 'pathname');

def conf_dbtype() -> str:
    return config.get('data', 'type');

def conf_db() -> str:
    return config.get('data', 'db');

def ollama_url_tag() -> str:
    return 'OLLAMA_URL';

def ollama_api_key_tag() -> str:
    return 'OLLAMA_API_KEY';

def ollama_model_tag() -> str:
    return 'OLLAMA_MODEL';

def ollama_sys_prompt_tag() -> str:
    return 'OLLAMA_SYSTEM_PROMPT';

def ollama_prompt_analyse_jobspec_tag() -> str:
    return 'OLLAMA_PROMPT_ANALYSE_JOBSPEC';

def ollama_prompt_match_profile_tag() -> str:
    return 'OLLAMA_PROMPT_MATCH_PROFILE';

def ollama_prompt_generater_cover_letter_tag() -> str:
    return 'OLLAMA_PROMPT_GENERATE_COVER_LETTER';

def ollama_knowledge_source_tag() -> str:
    return 'OLLAMA_KNOWLEDGE_SOURCE';
