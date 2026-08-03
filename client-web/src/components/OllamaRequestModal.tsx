import { setting_keys } from '../config';
import { useEffect, useState } from 'react';
import Modal from './Modal';
import ReactMarkdown from 'react-markdown';

import { ollamaCheckJobSpec, ollamaCheckJobSpecProfile, ollamaCoverLetter } from '../api/integrations/ollama';
import { getSetting } from '../api/app_settings';
import { safeValue } from '../defs/tools'

type Props = {
  response?: string | null;
  request: string;
  payload: string;
  title: string;
  onClose: () => void;
  onSuccess?: (response: string) => void;      // called after successful submit
};

export default function SourceModal({ response, request, payload, title, onClose, onSuccess = () => {}, }: Props) {
  /* ---------- State --------------------------------------------------- */
  const [isLoading, setIsLoading] = useState<boolean>(!!response);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<Boolean> (false);
  const [prompt, setPrompt] = useState <string | null>(null);

  // form fields – initialise to empty values
  const [ollamaResponse, setOllamaResponse] = useState<string>('');
  
  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const prmt = await getSetting(request);

        if (mounted && prmt) setPrompt(prmt.Value);
      } catch (err) {
        if (mounted)
          setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [response]);

  const promptOllama = async () => {
    setProcessing(true);
    try {
      if (request == setting_keys.OLLAMA.PromptAnalyseJobspec) {
        const resp = await ollamaCheckJobSpec(payload);

        if (resp) {
          if (resp.state == 200) {
            setOllamaResponse(resp.outcome);
          }
          else {
            setError(resp.message);
          }
        }
      }
      else if (request == setting_keys.OLLAMA.PromptMatchProfile) {
        const resp = await ollamaCheckJobSpecProfile(payload);

        if (resp) {
          if (resp.state == 202) {
            setOllamaResponse(resp.outcome);
          }
          else {
            setError(resp.message);
          }
        }
      }
      else if (request == setting_keys.OLLAMA.PromptGenerateCoverLetter) {
        const resp = await ollamaCoverLetter(payload);

        if (resp) {
          if (resp.state == 202) {
            setOllamaResponse(resp.outcome);
          }
          else {
            setError(resp.message);
          }
        }
      }
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } 
    finally {
      setProcessing(false);
    }
  }

  const handleSubmit = async () => {
    setError(null);
    try {
      onSuccess(ollamaResponse);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save analysis');
    }
  };

  const handleCancel = () => {
    setOllamaResponse('');
    onClose();
  };

  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal title={title} onClose={onClose} closeOnOverlayClick={!processing}>
      {error && <p className="error">{error}</p>}

      {(isLoading)
        ? <p>Loading…</p>
        : (
        <div>
          <div className="modal-field">
            <ReactMarkdown>{safeValue(prompt)}</ReactMarkdown>
          </div>

          {processing ? (
            <div className="modal-loading">
              <svg className="spinner" width="40" height="40" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r="19"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="80 36"
                />
              </svg>
              <span className="loading-text">Processing...</span>
            </div>
          ) : (
            <div className="modal-table">
              <span className='modal-field-button'
                    onClick={() => {promptOllama();}}>
                Send query to AI
              </span>
            </div>
          )}

          {!processing && ollamaResponse && ollamaResponse != '' ? (
            <div className="modal-field">
              <span className='modal-field-expanded'>
                <textarea
                  placeholder="Response from AI"
                  value={ollamaResponse}
                  onChange={(e) => setOllamaResponse(e.target.value)}
                />
              </span>
            </div>
          ) : (<></>)}

          {!processing ? (
            <div className="modal-actions">
              {ollamaResponse && ollamaResponse != '' ? (
                <button className="button" onClick={handleSubmit}>OK</button>
              ) : (<></>)}
              <button className="button secondary-button" onClick={handleCancel}>Cancel</button>
            </div>
          ) : (<></>)}
        </div>
        )
      }
    </Modal>
  );
}

