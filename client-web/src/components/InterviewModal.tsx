import { useEffect, useState } from 'react';
import Modal from './Modal'; // your existing modal component
import ContactModal from '../components/ContactModal';
import { getJobSpec } from '../api/jobSpecs';
import { getApplication } from '../api/applications';
import { getInterview, saveInterview} from '../api/interviews';
import { listContacts } from '../api/contacts';
import { newInterviewItem, InterviewItem, ApplicationItem, JobSpecItem, ContactItem } from '../defs/interfaces';

type Props = {
  /** id of the interview to edit; null or undefined means create new */
  interviewId?: number | null;
  applicationId?: number | null;
  title: string;
  onClose: () => void;
  onSuccess?: () => void;      // called after successful submit
};

export default function InterviewModal({ interviewId, applicationId, title, onClose, onSuccess = () => {}, }: Props) {
  /* ---------- State --------------------------------------------------- */
  const [isLoading, setIsLoading] = useState<boolean>(!!interviewId);
  const [error, setError] = useState<string | null>(null);

  const [modalOpenContact, setModalOpenContact] = useState(false);
  // form fields – initialise to empty values
  // Entities

  const [jobSpec, setJobSpec] = useState<JobSpecItem | null>(null);
  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [scheduled, setScheduled] = useState('');
  const [contactId, setContactId] = useState<number | ''>('');
  const [description, setDescription] = useState<string | ''>('');
  const [analysis, setAnalysis] = useState<string | ''>('');
  const [notes, setNotes] = useState<string | ''>('');
  const [outcome, setOutcome] = useState<string | ''>('');
  const [feedback, setFeedback] = useState<string | ''>('');
  // Lookups
  const [luContacts, setLuContacts] = useState<ContactItem[] | []>([]);

  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      try {
        fetchContacts();

        if (interviewId) { 
          // load the Interview to be editted
          const src: InterviewItem | undefined = await getInterview(interviewId);
          if (mounted && src) {
            applicationId = src.ApplicationId;
            setScheduled(src.Scheduled);
            if (src.ContactId) setContactId(src.ContactId);
            if (src.Description) setDescription(src.Description);
            if (src.Analysis) setAnalysis(src.Analysis);
            if (src.Notes) setNotes(src.Notes);
            if (src.Outcome) setOutcome(src.Outcome);
            if (src.Feedback) setFeedback(src.Feedback);
          }
        }
        if (mounted && applicationId) {
          setApplication(await getApplication(applicationId));
          if (application && application.JobSpecId) setJobSpec(await getJobSpec(application.JobSpecId));
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
  }, [interviewId, applicationId]);

  const fetchContacts = async (mounted: boolean = true) => {
    try {
      const data = await listContacts();
      if (mounted && Array.isArray(data)) setLuContacts(data);
    } catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load contacts',
        );
    } finally {
      //if (mounted) setContactsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    // Basic client‑side validation
    if (!applicationId || !scheduled) {
      if (!applicationId) setError('An application to be linked to is required');
      if (!scheduled) setError('Schedule date is required');
      return;
    }

    const payload: newInterviewItem = {
      Id: null,
      ApplicationId: applicationId,
      Scheduled: new Date(scheduled).toISOString(),
      ContactId: Number(contactId) || null,
      Description: description?.trim() || null,
      Analysis: analysis?.trim() || null,
      Notes: notes?.trim() || null,
      Outcome: outcome?.trim() || null,
      Feedback: feedback?.trim() || null,
      IsActive: true,
    };
    if (interviewId) payload.Id = Number(interviewId);

    try {
      await saveInterview(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save interview');
    }
  };

  const handleCancel = () => {
    setScheduled('');
    setContactId('');
    setDescription('');
    setAnalysis('');
    setNotes('');
    setOutcome('');
    setFeedback('');
    setApplication(null);
    setJobSpec(null);
    onClose();
  };

  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal  title={title} onClose={onClose}>
      {error && <p className="error">{error}</p>}

      {(isLoading || !interviewId) && interviewId
        ? <p>Loading…</p>
        : (
        <div>
          {jobSpec && application ? (
            <div className="job-spec-metadata">
              <div className="modal-field">
                {jobSpec.Company && <span className="job-spec-meta-label">Interview for {jobSpec.Position} at {jobSpec.Company} </span>}
                {!jobSpec.Company && <span className="job-spec-meta-label">Interview for {jobSpec.Position}</span>}
              </div>
            </div>
          ) : null}

          <div className="modal-field">
            <label>* Scheduled for</label>
            <input
              type="datetime-local"
              required
              placeholder="Publish Date"
              value={scheduled}
              onChange={(e) => setScheduled(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select style={{ flex: 1 }} value={contactId} onChange={(e) => setContactId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">No contact selected</option>
                {luContacts.map((s) => (
                  <option key={s.Id} value={s.Id}>{s.Name}</option>
                ))}
              </select>
              <button 
                className="button small" 
                onClick={() => {
                  setContactId('');
                  setModalOpenContact(true);
                }}>+</button>
            </div>
          </div>

          <div className="modal-field">
            <textarea 
              value={description} 
              placeholder="Description of the interview" 
              onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="modal-field">
            <textarea 
              value={notes} 
              placeholder="Notes about the interview" 
              onChange={(e) => setNotes(e.target.value)} />
          </div>

          {interviewId ? (
            <div>
              <div className="modal-field">
                <textarea 
                    value={analysis} 
                    placeholder="Analysis and tips for the interview" 
                    onChange={(e) => setAnalysis(e.target.value)} />
              </div>

              <div className="modal-field">
                <textarea 
                    value={outcome} 
                    placeholder="Outcome of the interview" 
                    onChange={(e) => setOutcome(e.target.value)} />
              </div>

              <div className="modal-field">
                <textarea 
                    value={feedback} 
                    placeholder="Feedback from interviewer" 
                    onChange={(e) => setFeedback(e.target.value)} />
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

      {modalOpenContact && (
        <ContactModal
          contactId={null}
          iniSourceId={null}
          title = "Create new Contact"
          onClose={() => setModalOpenContact(false)}
          onSuccess={async () => {
            await fetchContacts(true); // refresh portal list after modal close
            setModalOpenContact(false);
            setContactId(contactId);
          }}
        />
      )}

    </Modal>
  );
}