import { useEffect, useState } from 'react';
import { FaPlus, FaTimes, FaRegArrowAltCircleRight, FaRegArrowAltCircleDown } from "react-icons/fa";

import { newOfferItem, OfferItem, JobSpecItem, ApplicationItem, luBenefitItem } from '../defs/interfaces';
import { luBenefit, lnkOfferBenefit, benefitWithNotes } from '../defs/types';

import { formatFieldDate } from '../defs/tools'
import { isDirty, setIsDirty } from '../App';

import { listBenefits, getBenefit, getBenefitByName, saveBenefit } from '../api/lu_benefits';
import { getOffer, saveOffer, getOfferBenefits, deleteOfferBenefits, saveOfferBenefit } from '../api/offers';
import { getApplication } from '../api/applications';
import { getJobSpec } from '../api/jobSpecs';

import Modal from './Modal';

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
  const [loading, setLoading] = useState<boolean>(!!offerId);
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
  const [lAddBenefits, setLAddBenefits] = useState<benefitWithNotes[]>([]);
  
  // Lookups
  const [luBenefits, setLuBenefits] = useState<luBenefit[]>([]);

  // Floating values
  const [benefitInput, setBenefitInput] = useState<string>('');
  const [benefitSuggestions, setBenefitSuggestions] = useState<any[]>([]);
  const [benefitEditorOpen, setBenefitEditorOpen] = useState(false);
  const [benefitError, setBenefitError] = useState<string | null>(null);

  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const lBenefits = await listBenefits();

        const benefits = Array.isArray(lBenefits) ? lBenefits : (lBenefits?.data ?? []);
        setLuBenefits(benefits);

        if (offerId) { 
          // load the offer to be editted
          const src: OfferItem | undefined = await getOffer(offerId);
          if (mounted && src) {
            applicationId = src.ApplicationId;
            setOffered(src.Offered);
            if (src.Salary) setSalary(src.Salary);
            if (src.Description) setDescription(src.Description);
            if (src.Notes) setNotes(src.Notes);
            const ofrBenefits = await getOfferBenefits(offerId);
            setLAddBenefits(ingestBenefits(ofrBenefits));
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
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [offerId, applicationId]);

  async function fetchBenefit (BenefitName: string) {
    let benefitId: number;

    try {
      let addBenefit = await getBenefitByName(BenefitName);

      if (!addBenefit) {
        const payload: luBenefit = {
          Name: BenefitName,
          Order: lAddBenefits.length,
          IsActive: true
        }
        addBenefit = await saveBenefit(payload);
        benefitId = addBenefit.Id;
      }
      else {
        benefitId = addBenefit[0].Id;
      }
      return benefitId;
    }
    catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get benefit',
      );
    }
  };

  function findBenefitId (benefit: string) {
    luBenefits.forEach((item: luBenefit) => {
      if (item.Name.toLowerCase() == benefit.toLowerCase()) {
        return item.Id;
      }
    });
    return null;
  }

  const ingestBenefits = (list_benefits: any[]) => {
    let output: benefitWithNotes[] = [];

    if (list_benefits.length > 0) {
      for (const bnf of list_benefits) {
        const outBnf: benefitWithNotes = {
          BenefitId: bnf.Id,
          Benefit: bnf.Name,
          Notes: bnf.Notes
        };
        output.push(outBnf);
      }
    }
    return output;
  }

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

  function verifyBenefit (benefit: string) {
    let isValid: boolean = false
    luBenefits.forEach((item: luBenefit) => {
      if (item.Name.toLowerCase() == benefit.toLowerCase()) {
        isValid = true;
      }
    });
    return isValid;
  }

  const handleAddBenefit = async () => {
    if (benefitInput && verifyBenefit(benefitInput)) {
      let newLBenefits = lAddBenefits;

      if (lAddBenefits.length > 0) {
        let found = false;

        lAddBenefits.forEach((bn: benefitWithNotes) => {
          if (bn.Benefit.toLowerCase() == benefitInput.toLowerCase()) {
            found = true;
          }
        });
        if (!found) {
          const nBenefit: benefitWithNotes = {
            Benefit: benefitInput,
            Notes: ""
          }
          newLBenefits.push(nBenefit);
          setLAddBenefits(newLBenefits);
        }
      }
      else {
        const nBenefit: benefitWithNotes = {
          Benefit: benefitInput,
          Notes: ""
        }
        newLBenefits.push(nBenefit);
        setLAddBenefits(newLBenefits);
      }
    }
    setBenefitInput('');
    setBenefitEditorOpen(false);
  };

  const handleRemoveBenefit = (deletedBenefit: string) => {
    if (lAddBenefits.length > 0) {
      let newLBenefits: benefitWithNotes[] = [];

      lAddBenefits.forEach((bn: benefitWithNotes) => {
        if (bn.Benefit.toLowerCase() != deletedBenefit.toLowerCase()) {
          newLBenefits.push(bn);
        }
      });
      setLAddBenefits(newLBenefits);
    }
  };

  const handleBenefitNoteChange = (index: number, newValue: string) => {
    const updatedBenefits = [...lAddBenefits];
    updatedBenefits[index] = {
      ...updatedBenefits[index],
      Notes: newValue
    };
    setLAddBenefits(updatedBenefits);
  };

  const handleSubmit = async () => {
    setLoading(true);
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
      const savedOffer = await saveOffer(payload);

      if (savedOffer && savedOffer.Id) {
        // clean offer benefits
        await deleteOfferBenefits(savedOffer.Id);
        if (lAddBenefits.length > 0) {
          // Add new benefits
          for (const bnf of lAddBenefits) {
            bnf.BenefitId = await fetchBenefit(bnf.Benefit);
            if (bnf.BenefitId != null) {
              const payload: lnkOfferBenefit = {
                OfferId: savedOffer.Id,
                LuBenefitId: bnf.BenefitId,
                Notes: bnf.Notes,
                Order: lAddBenefits.findIndex((b: any) => bnf === b)
              };
              await saveOfferBenefit(payload);
            }
          }
        }
      }
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
    setLAddBenefits([]);
    setIsDirty(false);
    onClose();
  };

  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal  title={title} onClose={onClose}>
      {error && <p className="error">{error}</p>}

      {(loading || !offerId) && offerId
        ? <p>Loading…</p>
        : (
        <div className="modal-envelope">
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
            <input id="salary" value={salary} placeholder="Salary offered" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="job-spec-benefits-area">
            <div className="job-spec-benefits-header">Benefits</div>
            {!benefitEditorOpen && (
              <button type="button" 
                      className="job-spec-benefits-list-button" 
                      onClick={() => { 
                        setBenefitEditorOpen(true); 
                        setBenefitError(null); 
                      }}>
                <FaPlus />
              </button>
            )}
            <div className="job-spec-benefits-list">
              {lAddBenefits.length ? lAddBenefits.map((benefit: benefitWithNotes, index) => (
                <span className="job-spec-benefits-list" key={`${benefit.Benefit}-${index}`}>
                  <span>{benefit.Benefit}</span>
                  <input id={`benefit-note-${index}`} 
                        value={benefit.Notes} 
                        placeholder={"Notes about " + benefit.Benefit} 
                        onChange={(e) => handleBenefitNoteChange(index, e.target.value)} />
                  <button type="button" 
                          className="job-spec-benefit-button" 
                          onClick={() => handleRemoveBenefit(benefit.Benefit)}>
                    <FaTimes />
                  </button>
                </span>
              )) : <></>}
            </div>
          </div>
          {benefitEditorOpen && (
            <div className="job-spec-benefit-editor">
              <input
                className="job-spec-benefit-editor"
                value={benefitInput}
                placeholder="Type benefit name"
                onChange={(e) => setBenefitInput(e.target.value)}
                type="text"
                list="benefits-list"
              />
              <datalist id="benefits-list">
                {luBenefits.filter((benefit: any, index) => (!lAddBenefits.includes(benefit.Name))).map((benefit: any, index) => (
                  <option key={index} value={benefit.Name} />
                ))}
              </datalist>
              <button type="button" className="job-spec-benefit-editor" onClick={handleAddBenefit}><FaPlus /></button>
            </div>
          )}
          {benefitError && <p className="job-spec-benefitserror">{benefitError}</p>}

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