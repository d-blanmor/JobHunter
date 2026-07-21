import { useEffect, useState } from 'react';
import { FaRegArrowAltCircleRight, FaRegArrowAltCircleDown } from "react-icons/fa";
import Modal from './Modal';
import { getOffer, saveOffer } from '../api/offers';
import { getApplication } from '../api/applications';
import { getJobSpec } from '../api/jobSpecs';
import { listBenefits } from '../api/lu_benefits'
import { newOfferItem, OfferItem, JobSpecItem, ApplicationItem, luBenefitItem } from '../defs/interfaces';
import { formatFieldDate } from '../defs/tools'
import { isDirty, setIsDirty } from '../App';

type Props = {
  /** id of the offer to edit; null or undefined means create new */
  offerId?: number | null;
  applicationId?: number | null;
  title: string;
  onClose: () => void;
  onSuccess?: () => void;      // called after successful submit
};

export default function OfferModal({ offerId, applicationId, title, onClose, onSuccess = () => {}, }: Props) {
  /* ---------- State --------------------------------------------------- */
  const [isLoading, setIsLoading] = useState<boolean>(!!offerId);
  const [error, setError] = useState<string | null>(null);

  const [showDescription, setShowDescription] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // form fields – initialise to empty values
  // Entities
  const [jobSpec, setJobSpec] = useState<JobSpecItem | null>(null);
  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [offered, setOffered] = useState('');
  const [salary, setSalary] = useState<string | ''>('');
  const [description, setDescription] = useState<string | ''>('');
  const [notes, setNotes] = useState<string | ''>('');
  // Lookups
  const [luBenefits, setLuBenefits] = useState<luBenefitItem[] | []>([]);

  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      try {
        fetchBenefits();

        if (offerId) { 
          // load the Offer to be editted
          const src: OfferItem | undefined = await getOffer(offerId);
          if (mounted && src) {
            applicationId = src.ApplicationId;
            setOffered(src.Offered);
            if (src.Salary) setSalary(src.Salary);
            if (src.Description) setDescription(src.Description);
            if (src.Notes) setNotes(src.Notes);
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
  }, [offerId, applicationId]);

  const fetchBenefits = async (mounted: boolean = true) => {
    try {
      const data = await listBenefits();
      if (mounted && Array.isArray(data)) setLuBenefits(data);
    } catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load benefits',
        );
    } finally {
      //if (mounted) setContactsLoading(false);
    }
  };

  const handleFieldEdit = (field: string, value: string) => {
    setIsDirty(true);
    if (field.toLowerCase() == 'offered') {
      setOffered(value);
    }
    else if (field.toLowerCase() == 'salary') {
      setSalary(value);
    }
    else if (field.toLowerCase() == 'description') {
      setDescription(value);
    }
    else if (field.toLowerCase() == 'notes') {
      setNotes(value);
    }
  }

  const handleSubmit = async () => {
    setError(null);
    // Basic client‑side validation
    if (!applicationId || !offered) {
      if (!applicationId) setError('An application to be linked to is required');
      if (!offered) setError('Offer date is required');
      return;
    }

    const payload: newOfferItem = {
      ApplicationId: applicationId,
      Offered: new Date(offered).toISOString(),
      Salary: salary?.trim() || null,
      Description: description?.trim() || null,
      Notes: notes?.trim() || null,
      IsActive: true,
    };
    if (offerId) payload.Id = Number(offerId);

    try {
      await saveOffer(payload);
      setIsDirty(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save offer');
    }
  };

  const handleCancel = () => {
    setOffered('');
    setSalary('');
    setDescription('');
    setNotes('');
    setApplication(null);
    setIsDirty(false);
    onClose();
  };

  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal  title={title} onClose={onClose}>
      {error && <p className="error">{error}</p>}

      {(isLoading || !offerId) && offerId
        ? <p>Loading…</p>
        : (
        <div>
          <div className="modal-field-date">
            <label>* Offered on</label>
            <input id="offered"
                  type="date"
                  required
                  placeholder="Offer Date"
                  value={formatFieldDate(offered)}
                  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}
            />
          </div>

          <div className="modal-field">
            <input id="salary" value={salary}  placeholder="Salary offered"  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
          </div>

          <div className="modal-table">
            {showDescription ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowNotes(false);}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  <textarea id="Description"
                          value={description} 
                          placeholder="Description of the offer" 
                          onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(true);
                        setShowNotes(false);}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  <textarea id="Description"
                          value={description} 
                          placeholder="Description of the offer" 
                          onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field"></span>
              </span>
            )}

            {showNotes ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowNotes(false);}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  <textarea id="notes"
                            value={notes} 
                            placeholder="Notes about the offer" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowNotes(true);}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  <textarea id="notes"
                            value={notes} 
                            placeholder="Notes about the offer" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}/>
                </span>
                <span className="modal-field"></span>
              </span>
            )}
          </div>

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