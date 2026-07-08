import { useEffect, useState } from 'react';
import Modal from './Modal';
import { getJobSpec } from '../api/jobSpecs';
import { getApplication, saveApplication} from '../api/applications';
import { newApplicationItem, ApplicationItem, JobSpecItem } from '../defs/interfaces';

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

  // form fields – initialise to empty values
  // Entities
  const [jobSpec, setJobSpec] = useState<JobSpecItem | null>(null);
  //const [application, setApplication] = useState<ApplicationItem | null>(null);

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
          {jobSpec ? (
            <div className="job-spec-metadata">
              <div className="modal-field">
                {jobSpec.Company && <span className="job-spec-meta-label">Application for {jobSpec.Position} at {jobSpec.Company} </span>}
                {!jobSpec.Company && <span className="job-spec-meta-label">Application for {jobSpec.Position}</span>}
              </div>
            </div>
          ) : null}

          <div className="modal-field">
            <label>* Applied on</label>
            <input
              type="date"
              required
              placeholder="Application Date"
              value={applied}
              onChange={(e) => setApplied(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <textarea 
              value={letter} 
              placeholder="Application letter used" 
              onChange={(e) => setLetter(e.target.value)} />
          </div>

          <div className="modal-field">
            <textarea 
              value={cV} 
              placeholder="Resume sent" 
              onChange={(e) => setCV(e.target.value)} />
          </div>


          <div className="modal-field">
            <textarea 
              value={notes} 
              placeholder="Notes about the application" 
              onChange={(e) => setNotes(e.target.value)} />
          </div>

          {applicationId ? (
            <div>
              <div className="modal-field">
                <label>Confirmed on</label>
                <input
                    type="date"
                    placeholder="Confirmed on"
                    value={confirmed}
                    onChange={(e) => setConfirmed(e.target.value)}
                />
              </div>

              <div className="modal-field">
                <label>Discarded on</label>
                <input
                    type="date"
                    placeholder="Discarded on"
                    value={discarded}
                    onChange={(e) => setDiscarded(e.target.value)}
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
    </Modal>
  );
}