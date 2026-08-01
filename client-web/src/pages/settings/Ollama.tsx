import { setting_keys } from '../../config';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaIdBadge, FaExternalLinkAlt, FaEnvelopeSquare, FaPhoneSquareAlt, FaRegArrowAltCircleRight, FaRegArrowAltCircleDown } from 'react-icons/fa';
import { isDirty, setIsDirty } from '../../App';
import { getSetting, saveSetting } from '../../api/app_settings';
import { ollamaListModels } from '../../api/integrations/ollama';
import { fromEvent } from "file-selector";

export default function OllamaIntegrationPage() {
  const navigate = useNavigate();

  // Settings
  const [ollamaUrl, setOllamaUrl] = useState('');
  const [ollamaUrl_Notes, setOllamaUrl_Notes] = useState('');
  const [ollamaApiKey, setOllamaApiKey] = useState('');
  const [ollamaApiKey_Notes, setOllamaApiKey_Notes] = useState('');
  const [ollamaModel, setOllamaModel] = useState('');
  const [ollamaModel_Notes, setOllamaModel_Notes] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [systemPrompt_Notes, setSystemPrompt_Notes] = useState('');
  const [promptAnalyseJobspec, setPromptAnalyseJobspec] = useState('');
  const [promptAnalyseJobspec_Notes, setPromptAnalyseJobspec_Notes] = useState('');
  const [promptMatchProfile, setPromptMatchProfile] = useState('');
  const [promptMatchProfile_Notes, setPromptMatchProfile_Notes] = useState('');
  const [promptGenerateCoverLetter, setPromptGenerateCoverLetter] = useState('');
  const [promptGenerateCoverLetter_Notes, setPromptGenerateCoverLetter_Notes] = useState('');
  const [profilePath, setProfilePath] = useState('');
  const [profilePath_Notes, setProfilePath_Notes] = useState('');
  
  const [isOllamaDefined, setIsOllamaDefined] = useState(false);
  // Behaviour
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Lookups
  const [lModels, setLModels] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [
          url, 
          apiKey,
          model,
          prompt, 
          promptAnalyseJobspec,
          promptMatchProfile,
          promptGenerateCoverLetter,
          profilePath
        ] = await Promise.all([
          getSetting(setting_keys.OLLAMA.OllamaURL),
          getSetting(setting_keys.OLLAMA.OllamaApiKey),
          getSetting(setting_keys.OLLAMA.OllamaModel),
          getSetting(setting_keys.OLLAMA.SystemPrompt),
          getSetting(setting_keys.OLLAMA.PromptAnalyseJobspec),
          getSetting(setting_keys.OLLAMA.PromptMatchProfile),
          getSetting(setting_keys.OLLAMA.PromptGenerateCoverLetter),
          getSetting(setting_keys.OLLAMA.KnowledgeSource)
        ]);
        if (!mounted) return;

        if (url) {
          setOllamaUrl(url.Value);
          setOllamaUrl_Notes(url.Notes);
        }
        if (apiKey) {
          setOllamaApiKey(apiKey.Value);
          setOllamaApiKey_Notes(apiKey.Notes);
        }
        if (model) {
          setOllamaModel(model.Value);
          setOllamaModel_Notes(model.Notes);
        }
        if (prompt) {
          setSystemPrompt(prompt.Value);
          setSystemPrompt_Notes(prompt.Notes);
        }
        if (promptAnalyseJobspec) {
          setPromptAnalyseJobspec(promptAnalyseJobspec.Value);
          setPromptAnalyseJobspec_Notes(prompt.Notes);
        }
        if (promptMatchProfile) {
          setPromptMatchProfile(promptMatchProfile.Value);
          setPromptMatchProfile_Notes(promptMatchProfile.Notes);
        }
        if (promptGenerateCoverLetter) {
          setPromptGenerateCoverLetter(promptGenerateCoverLetter.Value);
          setPromptGenerateCoverLetter_Notes(promptGenerateCoverLetter.Notes);
        }
        if (profilePath) {
          setProfilePath(profilePath.Value);
          setProfilePath_Notes(profilePath.Notes);
        }
      } 
      catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } 
      finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleFieldEdit = (field: string, value: string) => {
    setIsDirty(true);
    if (field.toLowerCase() == 'ollamaurl') {
      setOllamaUrl(value);
      //checkOllama();
    }
    else if (field.toLowerCase() == 'ollamaapikey') {
      setOllamaApiKey(value);
      //checkOllama();
    }
    else if (field.toLowerCase() == 'ollamamodel') {
      setOllamaModel(value);
    }
    else if (field.toLowerCase() == 'systemprompt') {
      setSystemPrompt(value);
    }
    else if (field.toLowerCase() == 'promptanalysejobspec') {
      setPromptAnalyseJobspec(value);
    }
    else if (field.toLowerCase() == 'promptmatchprofile') {
      setPromptMatchProfile(value);
    }
    else if (field.toLowerCase() == 'promptgeneratecoverletter') {
      setPromptGenerateCoverLetter(value);
    }
    else if (field.toLowerCase() == 'profilepath') {
      setProfilePath(value);
    }
  }

  async function loadOllamaModels () {
    setLoading(true);
    setError(null);
    try {
      const data = await ollamaListModels();

      if (data != "()") {
        const lItems: any[] = [];

        data.models.forEach((s: any) => {
          if (s.Key != null && s.Name != null) {
            const item: any = {};

            item['model'] = s.Key;
            item['name'] = s.Name;
            lItems.push(item);
          }
        });
        setLModels(lItems);
        setIsOllamaDefined(true);
      };
    } catch (err){
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsOllamaDefined(false);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    setError(null);
    setIsDirty(false);

    try 
    {
      setLoading(true);
      if (ollamaUrl && ollamaUrl != '') {
        await saveSetting (setting_keys.OLLAMA.OllamaURL, ollamaUrl, ollamaUrl_Notes);
      }
      if (ollamaApiKey && ollamaApiKey != '') {
        await saveSetting (setting_keys.OLLAMA.OllamaApiKey, ollamaApiKey, ollamaApiKey_Notes);
      }
      if (ollamaModel && ollamaModel != '') {
        await saveSetting (setting_keys.OLLAMA.OllamaModel, ollamaModel, ollamaModel_Notes);
      }
      if (systemPrompt && systemPrompt != '') {
        await saveSetting (setting_keys.OLLAMA.SystemPrompt, systemPrompt, systemPrompt_Notes);
      }
      if (promptAnalyseJobspec && promptAnalyseJobspec != '') {
        await saveSetting (setting_keys.OLLAMA.PromptAnalyseJobspec, promptAnalyseJobspec, promptAnalyseJobspec_Notes);
      }
      if (promptMatchProfile && promptMatchProfile != '') {
        await saveSetting (setting_keys.OLLAMA.PromptMatchProfile, promptMatchProfile, promptMatchProfile_Notes);
      }
      if (promptGenerateCoverLetter && promptGenerateCoverLetter != '') {
        await saveSetting (setting_keys.OLLAMA.PromptGenerateCoverLetter, promptGenerateCoverLetter, promptGenerateCoverLetter_Notes);
      }
      if (profilePath && profilePath != '') {
        await saveSetting (setting_keys.OLLAMA.KnowledgeSource, profilePath, profilePath_Notes);
      }
      navigate('/Settings');
    } 
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } 
    finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty()) {
      if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
        return;
    }
    navigate('/Settings');
    setIsDirty(false);
    return;
  };

  return (
    <section className="page">
      {loading && (
        <div className="page-header-row">
          <div>
            <h2 className="settings-title"><p>Loading settings...</p></h2>
          </div>
          <button className="action-button" onClick={() => navigate(-1)}>Back</button>
        </div>
      )}
      {error && (
        <div className="page-header-row">
          <div>
            <h2 className="settings-title"><p className="error">{error}</p></h2>
          </div>
          <button className="action-button" onClick={() => navigate(-1)}>Back</button>
        </div>
      )}

      {!loading && !error &&  (
        <div className="settings-view">
          <div className="page-header-action">
            <button className="action-button" onClick={() => navigate(-1)}>Back</button>
          </div>
          <div className="page-header-row">
            <div>
              <span className="settings-title">Ollama Integration</span>
              <p className="settings-subtitle">Integration to Ollama LLM</p>
            </div>
          </div>

          <div className="settings">
            <div className="settings-field">
              <input id="OllamaUrl" required value={ollamaUrl} placeholder="Ollama URL" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
            </div>

            <div className="settings-field">
              <input id="OllamaAPIKey" required value={ollamaApiKey} placeholder="Ollama API Key" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
            </div>

            {ollamaUrl && ollamaUrl != '' ? (
              <div className="settings-field">
                <button className="settings-button" onClick={() => loadOllamaModels()}>Test Connection</button>
              </div>
            ) : (
              ''
            )}
          </div>

          {isOllamaDefined ? (
            <>
              <div className="settings-field">
                <select id="OllamaModel"
                        value={ollamaModel} 
                        onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
                  <option value="">No model selected</option>
                  {lModels.map((r) => (<option key={r.model} value={r.model}>{r.name}</option>))}
                </select>
              </div>

              <div className="modal-table">
                <span className='settings-field-expanded'>
                  <textarea id="SystemPrompt"
                          value={systemPrompt} 
                          placeholder="System Prompt" 
                          onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
              </div>

              <div className="modal-table">
                <span className='settings-field'>
                  <textarea id="PromptAnalyseJobspec"
                          value={promptAnalyseJobspec} 
                          placeholder="Prompt to analyse a job specification" 
                          onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
              </div>

              <div className="modal-table">
                <span className='settings-field'>
                  <textarea id="PromptMatchProfile"
                          value={promptMatchProfile} 
                          placeholder="Prompt to match a job specification with a CV" 
                          onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
              </div>

              <div className="modal-table">
                <span className='settings-field'>
                  <textarea id="PromptGenerateCoverLetter"
                          value={promptGenerateCoverLetter} 
                          placeholder="Prompt used to write a cover letter for a specific job based on the user profile" 
                          onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
              </div>

              <div className="settings-field">
                <input id="ProfilePath" 
                      type="file" 
                      placeholder="Profesional Profile Path" 
                      name="Select file" 
                      accept=".txt, .md" 
                      onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                <span className='settings-field-file'>{profilePath}</span>
              </div>
            </>
          ) : (
            ''
          )}

          <span className="modal-actions">
            <button className="button" onClick={handleSubmit}>OK</button>
            <button className="button secondary-button" onClick={handleCancel}>Cancel</button>
          </span>
        </div>
      )}

    </section>
  );
}
