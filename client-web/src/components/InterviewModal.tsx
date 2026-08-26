import { useEffect, useState } from 'react';
import { FaPlus, FaRegArrowAltCircleRight, FaRegArrowAltCircleDown } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Adds support for tables, strikethrough, etc.
import rehypeSanitize from 'rehype-sanitize'; // Optional but recommended for security

import { newInterviewItem, InterviewItem, ApplicationItem, JobSpecItem, ContactItem } from '../defs/interfaces';
import { formatFieldDateTime, safeValue } from '../defs/tools'
import { isDirty, setIsDirty } from '../App';

import { getJobSpec } from '../api/jobSpecs';
import { getApplication } from '../api/applications';
import { getInterview, saveInterview} from '../api/interviews';
import { listContacts } from '../api/contacts';

import Modal from './Modal'; // your existing modal component
import ContactModal from '../components/ContactModal';

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
  const [editableDescription, setEditableDescription] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [editableNotes, setEditableNotes] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [editableAnalysis, setEditableAnalysis] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [editableOutcome, setEditableOutcome] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [editableFeedback, setEditableFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
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

  const handleFieldEdit = (field: string, value: string) => {
    setIsDirty(true);
    if (field.toLowerCase() == 'scheduled') {
      setScheduled(value);
    }
    else if (field.toLowerCase() == 'contactid') {
      setContactId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'description') {
      setDescription(value);
    }
    else if (field.toLowerCase() == 'notes') {
      setNotes(value);
    }
    else if (field.toLowerCase() == 'analysis') {
      setAnalysis(value);
    }
    else if (field.toLowerCase() == 'outcome') {
      setOutcome(value);
    }
    else if (field.toLowerCase() == 'feedback') {
      setFeedback(value);
    }
  }

  const handleSubmit = async () => {
    setError(null);
    // Basic client‑side validation
    if (!applicationId || !scheduled) {
      if (!applicationId) setError('An application to be linked to is required');
      if (!scheduled) setError('Schedule date is required');
      return;
    }

    const payload: newInterviewItem = {
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
      setIsDirty(false);
      onSuccess();
      handleCancel();
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
    setIsDirty(false);
    onClose();
  };

  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal title={title} onClose={onClose}>
      {error && <p className="error">{error}</p>}

      {(isLoading || !interviewId) && interviewId
        ? <p>Loading…</p>
        : (
        <div className="modal-envelope">
          <div className="modal-field-date">
            <label>* Scheduled for</label>
            <input id="scheduled"
                  type="datetime-local"
                  required
                  placeholder="Schedule Date"
                  value={formatFieldDateTime(scheduled)}
                  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}
            />
          </div>

          <div className="modal-field-add">
            <select id="ContactId"
                    value={contactId} 
                    onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
              <option value="">No contact selected</option>
              {luContacts.map((s) => (
                <option key={s.Id} value={s.Id}>{s.Name}</option>
              ))}
            </select>
            <button className="button small" 
                    onClick={() => {
                      setContactId('');
                      setModalOpenContact(true);
                    }}>
              <FaPlus />
            </button>
          </div>

          <div className="modal-table">
            {showDescription ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowNotes(false);
                        setShowAnalysis(false);
                        setShowOutcome(false);
                        setShowFeedback(false);}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  {editableDescription ? (
                    <textarea id="Description"
                              value={description} 
                              placeholder="Description of the interview" 
                              autoFocus
                              onBlur={(e) => setEditableDescription(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                  ) : (
                    <div className='modal-field-expanded-view' onClick={() => setEditableDescription(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={description && description !== '' ? safeValue(description) : "```Description of the interview```"}
                      />
                    </div>
                  )}
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(true);
                        setShowNotes(false);
                        setShowAnalysis(false);
                        setShowOutcome(false);
                        setShowFeedback(false);}}>
  
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  {editableDescription ? (
                    <textarea id="Description"
                              value={description} 
                              placeholder="Description of the interview" 
                              autoFocus
                              onBlur={(e) => setEditableDescription(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                  ) : (
                    <div className='modal-field-view' onClick={() => setEditableDescription(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={description && description !== '' ? safeValue(description) : "```Description of the interview```"}
                      />
                    </div>
                  )}
                </span>
                <span className="modal-field"></span>
              </span>
            )}

            {showNotes ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowNotes(false);
                        setShowAnalysis(false);
                        setShowOutcome(false);
                        setShowFeedback(false);}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  {editableNotes ? (
                    <textarea id="notes"
                              value={notes} 
                              placeholder="Notes about the interview" 
                              autoFocus
                              onBlur={(e) => setEditableNotes(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                  ) : (
                    <div className='modal-field-expanded-view' onClick={() => setEditableNotes(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={notes && notes !== '' ? safeValue(notes) : "```Notes about the interview```"}
                      />
                    </div>
                  )}
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowNotes(true);
                        setShowAnalysis(false);
                        setShowOutcome(false);
                        setShowFeedback(false);}}>
  
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  {editableNotes ? (
                    <textarea id="notes"
                              value={notes} 
                              placeholder="Notes about the interview" 
                              autoFocus
                              onBlur={(e) => setEditableNotes(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                  ) : (
                    <div className='modal-field-view' onClick={() => setEditableNotes(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={notes && notes !== '' ? safeValue(notes) : "```Notes about the interview```"}
                      />
                    </div>
                  )}
                </span>
                <span className="modal-field"></span>
              </span>
            )}

            {interviewId ? (
              <div>
                {showAnalysis ? (
                  <span className="modal-row">
                    <span className='modal-field' style={{ 'marginTop': '10px' }} 
                          onClick={() => {
                            setShowDescription(false);
                            setShowNotes(false);
                            setShowAnalysis(false);
                            setShowOutcome(false);
                            setShowFeedback(false);}}>
                      <FaRegArrowAltCircleDown />
                    </span>
                    <span className='modal-field-expanded'>
                      {editableAnalysis ? (
                        <textarea id="analysis"
                                  value={analysis} 
                                  placeholder="Analysis and tips for the interview" 
                                  autoFocus
                                  onBlur={(e) => setEditableAnalysis(false)}
                                  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                      ) : (
                        <div className='modal-field-expanded-view' onClick={() => setEditableAnalysis(true)}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            children={analysis && analysis !== '' ? safeValue(analysis) : "```Analysis and tips for the interview```"}
                          />
                        </div>
                      )}
                    </span>
                    <span className="modal-field"></span>
                  </span>
                ) : (
                  <span className="modal-row">
                    <span className='modal-field' style={{ 'marginTop': '10px' }} 
                          onClick={() => {
                            setShowDescription(false);
                            setShowNotes(false);
                            setShowAnalysis(true);
                            setShowOutcome(false);
                            setShowFeedback(false);}}>
                      <FaRegArrowAltCircleRight />
                    </span>
                    <span className='modal-field'>
                      {editableAnalysis ? (
                        <textarea id="analysis"
                                  value={analysis} 
                                  placeholder="Analysis and tips for the interview" 
                                  autoFocus
                                  onBlur={(e) => setEditableAnalysis(false)}
                                  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                      ) : (
                        <div className='modal-field-view' onClick={() => setEditableAnalysis(true)}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            children={analysis && analysis !== '' ? safeValue(analysis) : "```Analysis and tips for the interview```"}
                          />
                        </div>
                      )}
                    </span>
                    <span className="modal-field"></span>
                  </span>
                )}

                {showOutcome ? (
                  <span className="modal-row">
                    <span className='modal-field' style={{ 'marginTop': '10px' }} 
                          onClick={() => {
                            setShowDescription(false);
                            setShowNotes(false);
                            setShowAnalysis(false);
                            setShowOutcome(false);
                            setShowFeedback(false);}}>
                      <FaRegArrowAltCircleDown />
                    </span>
                    <span className='modal-field-expanded'>
                      {editableOutcome ? (
                        <textarea id="outcome"
                                  value={outcome} 
                                  placeholder="Outcome of the interview" 
                                  autoFocus
                                  onBlur={(e) => setEditableOutcome(false)}
                                  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                      ) : (
                        <div className='modal-field-expanded-view' onClick={() => setEditableOutcome(true)}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            children={outcome && outcome !== '' ? safeValue(outcome) : "```Outcome of the interview```"}
                          />
                        </div>
                      )}
                    </span>
                    <span className="modal-field"></span>
                  </span>
                ) : (
                  <span className="modal-row">
                    <span className='modal-field' style={{ 'marginTop': '10px' }} 
                          onClick={() => {
                            setShowDescription(false);
                            setShowNotes(false);
                            setShowAnalysis(false);
                            setShowOutcome(true);
                            setShowFeedback(false);}}>
                      <FaRegArrowAltCircleRight />
                    </span>
                    <span className='modal-field'>
                      {editableOutcome ? (
                        <textarea id="outcome"
                                  value={outcome} 
                                  placeholder="Outcome of the interview" 
                                  autoFocus
                                  onBlur={(e) => setEditableOutcome(false)}
                                  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                      ) : (
                        <div className='modal-field-view' onClick={() => setEditableOutcome(true)}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            children={outcome && outcome !== '' ? safeValue(outcome) : "```Outcome of the interview```"}
                          />
                        </div>
                      )}
                    </span>
                    <span className="modal-field"></span>
                  </span>
                )}

                {showFeedback ? (
                  <span className="modal-row">
                    <span className='modal-field' style={{ 'marginTop': '10px' }} 
                          onClick={() => {
                            setShowDescription(false);
                            setShowNotes(false);
                            setShowAnalysis(false);
                            setShowOutcome(false);
                            setShowFeedback(false);}}>
                      <FaRegArrowAltCircleDown />
                    </span>
                    <span className='modal-field-expanded'>
                      {editableFeedback ? (
                        <textarea id="feedback"
                                  value={feedback} 
                                  placeholder="Feedback from interviewer" 
                                  autoFocus
                                  onBlur={(e) => setEditableFeedback(false)}
                                  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                      ) : (
                        <div className='modal-field-expanded-view' onClick={() => setEditableFeedback(true)}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            children={feedback && feedback !== '' ? safeValue(feedback) : "```Feedback from interviewer```"}
                          />
                        </div>
                      )}
                    </span>
                    <span className="modal-field"></span>
                  </span>
                ) : (
                  <span className="modal-row">
                    <span className='modal-field' style={{ 'marginTop': '10px' }} 
                          onClick={() => {
                            setShowDescription(false);
                            setShowNotes(false);
                            setShowAnalysis(false);
                            setShowOutcome(false);
                            setShowFeedback(true);}}>
                      <FaRegArrowAltCircleRight />
                    </span>
                    <span className='modal-field'>
                      {editableFeedback ? (
                        <textarea id="feedback"
                                  value={feedback} 
                                  placeholder="Feedback from interviewer" 
                                  autoFocus
                                  onBlur={(e) => setEditableFeedback(false)}
                                  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                      ) : (
                        <div className='modal-field-view' onClick={() => setEditableFeedback(true)}>
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeSanitize]}
                            children={feedback && feedback !== '' ? safeValue(feedback) : "```Feedback from interviewer```"}
                          />
                        </div>
                      )}
                    </span>
                    <span className="modal-field"></span>
                  </span>
                )}
              </div>
            ) : null}
          </div>
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