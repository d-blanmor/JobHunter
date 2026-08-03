import { useEffect, useState } from 'react';
import { FaRegArrowAltCircleRight, FaRegArrowAltCircleDown } from "react-icons/fa";

import { setting_keys } from '../config';
import { getJobSpec } from '../api/jobSpecs';
import { getApplication, saveApplication} from '../api/applications';
import { newApplicationItem, ApplicationItem, JobSpecItem } from '../defs/interfaces';
import { formatFieldDate } from '../defs/tools'
import { isDirty, setIsDirty } from '../App';

import Modal from './Modal';
import OllamaRequestModal from '../components/OllamaRequestModal'

type Props = {
  /** id of the application to edit; null or undefined means create new */
  applicationId?: number | null;
  jobSpecId?: number | null;
  title: string;
  onClose: () => void;
  onSuccess?: () => void;      // called after successful submit
};

export default function ApplicationModal({ applicationId, jobSpecId, title, onClose, onSuccess = () => {}, }: Props) {
  /* ---------- State --------------------------------------------------- */
  const [isLoading, setIsLoading] = useState<boolean>(!!applicationId);
  const [error, setError] = useState<string | null>(null);

  const [modalOpenOllamaLetter, setModalOpenOllamaLetter] = useState(false);
  const [showLetter, setShowLetter] = useState(false);
  const [showCV, setShowCV] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showCallAI, setShowCallAI] = useState(false);

  // form fields – initialise to empty values
  // Entities
  const [jobSpec, setJobSpec] = useState<JobSpecItem | null>(null);

  const [applied, setApplied] = useState('');
  const [confirmed, setConfirmed] = useState('');
  const [discarded, setDiscarded] = useState('');
  const [letter, setLetter] = useState<string | ''>('');
  const [cV, setCV] = useState<string | ''>('');
  const [notes, setNotes] = useState<string | ''>('');
  // Lookups

  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      try {
        if (applicationId) { 
          // load the Application to be editted
          const src: ApplicationItem | undefined = await getApplication(applicationId);
          if (mounted && src) {
            jobSpecId = src.JobSpecId;
            setApplied(src.Applied);
            if (src.Confirmed) setConfirmed(src.Confirmed);
            if (src.Discarded) setDiscarded(src.Discarded);
            if (src.Letter) setLetter(src.Letter);
            if (src.CV) setCV(src.CV);
            if (src.Notes) setNotes(src.Notes);
          }
        }
        if (mounted && jobSpecId) {
          setJobSpec(await getJobSpec(jobSpecId));
        }
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
  }, [applicationId, jobSpecId]);

  const handleFieldEdit = (field: string, value: string) => {
    setIsDirty(true);
    if (field.toLowerCase() == 'applied') {
      setApplied(value);
    }
    else if (field.toLowerCase() == 'letter') {
      setLetter(value);
    }
    else if (field.toLowerCase() == 'cv') {
      setCV(value);
    }
    else if (field.toLowerCase() == 'notes') {
      setNotes(value);
    }
    else if (field.toLowerCase() == 'confirmed') {
      setConfirmed(value);
    }
    else if (field.toLowerCase() == 'discarded') {
      setDiscarded(value);
    }
  }

  const handleSubmit = async () => {
    setError(null);
    // Basic client‑side validation
    if (!jobSpecId || !applied) {
      if (!jobSpecId) setError('A job spec to be linked to is required');
      if (!applied) setError('Application date is required');
      return;
    }

    const payload: newApplicationItem = {
      JobSpecId: jobSpecId,
      Applied: new Date(applied).toISOString(),
      Letter: letter?.trim() || null,
      CV: cV?.trim() || null,
      Notes: notes?.trim() || null,
      IsActive: true,
    };
    if (applicationId) payload.Id = Number(applicationId);
    if (confirmed) payload.Confirmed = new Date(confirmed).toISOString();
    if (discarded) payload.Discarded = new Date(discarded).toISOString()

    try {
      await saveApplication(payload);
      setIsDirty(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save application');
    }
  };

  const handleCancel = () => {
    setApplied('');
    setConfirmed('');
    setDiscarded('');
    setLetter('');
    setCV('');
    setNotes('');
    setJobSpec(null);
    setIsDirty(false);
    onClose();
  };

  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal  title={title} onClose={onClose}>
      {error && <p className="error">{error}</p>}

      {(isLoading || !applicationId) && applicationId
        ? <p>Loading…</p>
        : (
        <div>

          <div className="modal-field-date">
            <label>* Applied on</label>
            <input id="applied"
              type="date"
              required
              placeholder="Application Date"
              value={formatFieldDate(applied)}
              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}
            />
          </div>

          <div className="modal-table">
            {showLetter ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowLetter(false);
                        setShowCV(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  <textarea id="letter"
                            value={letter} 
                            placeholder="Application letter used" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field">
                  <button className="button" 
                          onClick={() => {
                                    setModalOpenOllamaLetter(true);
                                  }}
                  >Ask AI</button>
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowLetter(true);
                        setShowCV(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  <textarea id="letter"
                            value={letter} 
                            placeholder="Application letter used" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field">
                  <button className="button" 
                          onClick={() => {
                                    setModalOpenOllamaLetter(true);
                                  }}
                  >Ask AI</button>
                </span>
                <span className="modal-field"></span>
              </span>
            )}

            {showCV ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowLetter(false);
                        setShowCV(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  <textarea id="cv"
                            value={cV} 
                            placeholder="Resume sent" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowLetter(false);
                        setShowCV(true);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  <textarea id="cv"
                            value={cV} 
                            placeholder="Resume sent" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field"></span>
              </span>
            )}

            {showNotes ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowLetter(false);
                        setShowCV(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  <textarea id="notes"
                            value={notes} 
                            placeholder="Notes about the application" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowLetter(false);
                        setShowCV(false);
                        setShowNotes(true)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  <textarea id="notes"
                            value={notes} 
                            placeholder="Notes about the application" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field"></span>
              </span>
            )}

          </div>

          {applicationId ? (
            <div>
              <div className="modal-field-date">
                <label>Confirmed on</label>
                <input id="confirmed"
                    type="date"
                    placeholder="Confirmed on"
                    value={formatFieldDate(confirmed)}
                    onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}
                />
              </div>

              <div className="modal-field-date">
                <label>Discarded on</label>
                <input id="discarded"
                    type="date"
                    placeholder="Discarded on"
                    value={formatFieldDate(discarded)}
                    onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}
                />
              </div>
            </div>
          ) : null}

          <div className="modal-actions">
            <button className="button" onClick={handleSubmit}>OK</button>
            <button className="button secondary-button" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
        )
      }

      {modalOpenOllamaLetter && (
        <OllamaRequestModal
          response={null}
          request={setting_keys.OLLAMA.PromptGenerateCoverLetter}
          payload={letter.trim()}
          title = "Create cover letter to apply"
          onClose={() => setModalOpenOllamaLetter(false)}
          onSuccess={async (response?: string) => {
            if (response) setLetter(response);
            setModalOpenOllamaLetter(false);
          }}
        />
      )}
    </Modal>
  );
}