import { useEffect, useState } from 'react';
import Modal from './Modal';
import { getOffer, saveOffer } from '../api/offers';
import { getApplication } from '../api/applications';
import { getJobSpec } from '../api/jobSpecs';
import { listBenefits } from '../api/lu_benefits'
import { newOfferItem, OfferItem, ApplicationItem, luBenefitItem } from '../defs/interfaces';

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
          {jobSpec && application ? (
            <div className="job-spec-metadata">
              <div className="modal-field">
                {jobSpec.Company && <span className="job-spec-meta-label">Offer for {jobSpec.Position} at {jobSpec.Company} </span>}
                {!jobSpec.Company && <span className="job-spec-meta-label">Offer for {jobSpec.Position}</span>}
              </div>
            </div>
          ) : null}

          <div className="modal-field">
            <label>* Offered on</label>
            <input
              type="date"
              required
              placeholder="Offer Date"
              value={offered}
              onChange={(e) => setOffered(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Salary offered" />
          </div>

          <div className="modal-field">
            <textarea 
              value={description} 
              placeholder="Description of the offer" 
              onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="modal-field">
            <textarea 
              value={notes} 
              placeholder="Notes about the offer" 
              onChange={(e) => setNotes(e.target.value)} />
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