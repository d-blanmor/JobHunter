import { useEffect, useState } from 'react';
import { FaPlus, FaRegArrowAltCircleRight, FaRegArrowAltCircleDown } from "react-icons/fa";
import Modal from './Modal';
import SourceModal from '../components/SourceModal';
import ContactModal from '../components/ContactModal';
import PlaceOfWorkModal from '../components/PlaceOfWorkModal'
import { listLocations } from '../api/lu_locations';
import { listRoleTypes } from '../api/lu_roletypes';
import { listWorkModels } from '../api/lu_workmodels';
import { listPlacesOfWork } from '../api/place_of_work';
import { listSources } from '../api/sources';
import { listContacts } from '../api/contacts';
import { getJobSpec, saveJobSpec } from '../api/jobSpecs';
import { newJobSpecItem, SourceItem, PlaceOfWorkItem } from '../defs/interfaces';
import { formatFieldDate } from '../defs/tools'
import { isDirty, setIsDirty } from '../App';

type Props = {
  /** id of the jobspec to edit; null or undefined means create new */
  jobSpecId?: number | null;
  title: string;
  onClose: () => void;
  onSuccess?: () => void;      // called after successful submit
};

export default function JobSpecModal({ jobSpecId, title, onClose, onSuccess = () => {}, }: Props) {
  /* ---------- State --------------------------------------------------- */
  const [isLoading, setIsLoading] = useState<boolean>(!!jobSpecId);
  const [error, setError] = useState<string | null>(null);

  const [modalOpenSource, setModalOpenSource] = useState(false);
  const [modalOpenPlaceOfWork, setModalOpenPlaceOfWork] = useState(false);
  const [modalOpenContact, setModalOpenContact] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // form fields – initialise to empty values
  // Entities
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [sourceId, setSourceId] = useState<number | ''>('');
  const [link, setLink] = useState('');
  const [published, setPublished] = useState('');
  const [contactId, setContactId] = useState<number | null>(null);
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [notes, setNotes] = useState('');
  const [workModelId, setWorkModelId] = useState<number | ''>('');
  const [roleTypeId, setRoleTypeId] = useState<number | ''>('');
  const [placeOfWorkId, setPlaceOfWorkId] = useState<number | ''>('');
  const [created, setCreated] = useState('');
  const [isActive, setIsActive] = useState<boolean>(true);
  // Lookups
  const [contacts, setContacts] = useState<any[]>([]);
  
  const [filter, setFilter] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [parents, setParents] = useState<SourceItem[]>([]);
  const filteredParents = parents.filter((s)=> s.Name.toLowerCase().includes(filter.toLowerCase()));
  const [workModels, setWorkModels] = useState<any[]>([]);
  const [roleTypes, setRoleTypes] = useState<any[]>([]);
  const [placesOfWork, setPlacesOfWork] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const [
          lSources,
          lWorkModels,
          lRoleTypes,
          lPlacesOfWork,
          lLocations,
          lContacts
        ] = await Promise.all([
          listSources(),
          listWorkModels(),
          listRoleTypes(),
          listPlacesOfWork(),
          listLocations(),
          listContacts()
        ]);
        const sources = Array.isArray(lSources) ? lSources : (lSources?.data ?? []);
        setSources(sources);
        setParents(sources.filter((s: SourceItem) => s.ParentId == null));
        const workModels = Array.isArray(lWorkModels) ? lWorkModels : (lWorkModels?.data ?? []);
        setWorkModels(workModels);
        const roleTypes = Array.isArray(lRoleTypes) ? lRoleTypes : (lRoleTypes?.data ?? []);
        setRoleTypes(roleTypes);
        const places = Array.isArray(lPlacesOfWork) ? lPlacesOfWork : (lPlacesOfWork?.data ?? []);
        setPlacesOfWork(places);
        const locations = Array.isArray(lLocations) ? lLocations : (lLocations?.data ?? []);
        setLocations(locations);
        const contacts = Array.isArray(lContacts) ? lContacts : (lContacts?.data ?? []);
        setContacts(contacts);
        if (jobSpecId) { 
          // load the Application to be editted
          const src: newJobSpecItem | undefined = await getJobSpec(jobSpecId);
          if (mounted && src) {
            if (src.Position) setPosition(src.Position);
            if (src.Company) setCompany(src.Company);
            if (src.SourceId) setSourceId(src.SourceId);
            if (src.Link) setLink(src.Link);
            if (src.PlaceOfWorkId) setPlaceOfWorkId(src.PlaceOfWorkId);
            if (src.WorkModelId) setWorkModelId(src.WorkModelId);
            if (src.RoleTypeId) setRoleTypeId(src.RoleTypeId);
            if (src.SalaryExpectation) setSalaryExpectation(src.SalaryExpectation);
            if (src.ContactId) setContactId(src.ContactId);
            if (src.Description) setDescription(src.Description);
            if (src.Analysis) setAnalysis(src.Analysis);
            if (src.Notes) setNotes(src.Notes);
            if (src.Published) setPublished(src.Published);
            if (src.Created) setCreated(src.Created);
            if (src.IsActive) setIsActive(src.IsActive);
          }
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
  }, [jobSpecId]);

  const handleFieldEdit = (field: string, value: string) => {
    setIsDirty(true);
    if (field.toLowerCase() == 'position') {
      setPosition(value);
    }
    else if (field.toLowerCase() == 'company') {
      setCompany(value);
    }
    else if (field.toLowerCase() == 'sourceid') {
      setSourceId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'link') {
      setLink(value);
    }
    else if (field.toLowerCase() == 'placeofworkid') {
      setPlaceOfWorkId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'workmodelid') {
      setWorkModelId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'roletypeid') {
      setRoleTypeId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'salaryexpectation') {
      setSalaryExpectation(value);
    }
    else if (field.toLowerCase() == 'contactid') {
      setContactId(value ? Number(value) : null);
    }
    else if (field.toLowerCase() == 'description') {
      setDescription(value);
    }
    else if (field.toLowerCase() == 'analysis') {
      setAnalysis(value);
    }
    else if (field.toLowerCase() == 'notes') {
      setNotes(value);
    }
    else if (field.toLowerCase() == 'published') {
      setPublished(value);
    }
    else if (field.toLowerCase() == 'created') {
      setCreated(value);
    }
    else if (field.toLowerCase() == 'isactive') {
      setIsActive(value? Boolean(value) : true);
    }
  }

  const handleSubmit = async () => {
    setError(null);
    // Basic client‑side validation
    if (!jobSpecId || !position) {
      if (!jobSpecId) setError('A job spec is required');
      if (!position) setError('A Postion is required');
      return;
    }

    const payload: newJobSpecItem = {
      Position: position,
      Company: company,
      Link: link,
      SalaryExpectation: salaryExpectation,
      ContactId: contactId,
      Description: description,
      Analysis: analysis,
      Notes: notes,
      Published: published,
      Created: created,
      IsActive: isActive,
    };
    if (jobSpecId) payload.Id = jobSpecId;
    if (sourceId != '') payload.SourceId = sourceId;
    if (workModelId != '') payload.WorkModelId = workModelId;
    if (roleTypeId != '') payload.RoleTypeId = roleTypeId;
    if (placeOfWorkId != '') payload.PlaceOfWorkId = placeOfWorkId;

    try {
      await saveJobSpec(payload);
      setIsDirty(false);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job spec');
    }
  };

  const handleCancel = () => {
    setPosition('');
    setCompany('');
    setSourceId('');
    setLink('');
    setPlaceOfWorkId('');
    setWorkModelId('');
    setRoleTypeId('');
    setSalaryExpectation('');
    setContactId(null);
    setDescription('');
    setAnalysis('');
    setNotes('');
    setPublished('');
    setCreated('');
    setIsActive(true);
    setIsDirty(false);
    onClose();
  };

  const fetchSources = async (mounted: boolean = true) => {
    try {
      const data = await listSources();
      if (mounted && Array.isArray(data)) setSources(data);
    } 
    catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load portals',
        );
    } 
    finally {}
  };

  const fetchContacts = async (mounted: boolean = true) => {
    try {
      const data = await listContacts();
      if (mounted && Array.isArray(data)) setContacts(data);
    } 
    catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load contacts',
        );
    } 
    finally {}
  };

  const fetchPlacesOfWork = async (mounted: boolean = true) => {
    try {
      const data = await listPlacesOfWork();
      if (mounted && Array.isArray(data)) setPlacesOfWork(data);
    } 
    catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load places of work',
        );
    } 
    finally {}
  };

  const placeOfWorkLabel = (placeOfWork?: PlaceOfWorkItem | null, placeOfWorkId?: number | null) => {
    var locationLabel = null;

    if (!placeOfWork && placeOfWorkId) placeOfWork = placesOfWork.find((item) => item.Id === placeOfWorkId);
    if (placeOfWork) {
      const location = placeOfWork ? locations.find((item) => item.Id === placeOfWork.LocationId) : null;
      
      if (placeOfWork) {
        if (location) {
          locationLabel = location.Country;
          if (location.City && location.City != '') {
            locationLabel = locationLabel + ` - ${location.City?.trim()}`;
          }
        }
        if (placeOfWork?.Address && placeOfWork.Address.trim() != ''){
          locationLabel = locationLabel + ` (${placeOfWork.Address?.trim()})`;
        }
      }
    }
    return locationLabel;
  }

  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal title={title} onClose={onClose}>
      {isLoading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!isLoading && (
        <div>
          <div className="modal-field">
            <input id="Position" required value={position} placeholder="Position" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <input id="Company" value={company} placeholder="Company" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <select id="Source" value={sourceId} onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
              <option value="">No source selected</option>
              {parents.map((s) => (<option key={s.Id} value={s.Id}>{s.Name}</option>))}
            </select>
            <button className="button" 
              onClick={() => {
                setSourceId('');
                setModalOpenSource(true);}}>
              <FaPlus />
            </button>
          </div>

          <div className="modal-field">
            <input id="link"
              value={link} 
              placeholder="URL to the job offer"
              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field-date">
            <label>* Published on</label>
            <input id="Published"
              type="date"
              placeholder="Publish Date"
              value={formatFieldDate(published)}
              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <select id="WorkModel"
                    value={workModelId} 
                    onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
              <option value="">No work model selected</option>
              {workModels.map((w) => (
                <option key={w.Id} value={w.Id}>{w.Name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <select id="RoleType"
                    value={roleTypeId} 
                    onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
              <option value="">No role type selected</option>
              {roleTypes.map((r) => (<option key={r.Id} value={r.Id}>{r.Name}</option>))}
            </select>
          </div>

          <div className="modal-field">
            <input id="SalaryExpectation" value={salaryExpectation} placeholder="Salary range" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <select id="PlaceOfWork"
                    value={placeOfWorkId} 
                    onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
              <option value="">No place of work selected</option>
              {placesOfWork.map((p) => {
                return (
                  <option key={p.Id} value={p.Id}>{placeOfWorkLabel(p)}</option>
                );
              })}
            </select>
            <button
              type="button"
              className="button"
              title="Create new place of work"
              onClick={() => {
                setPlaceOfWorkId('');
                setModalOpenPlaceOfWork(true);}}>
              <FaPlus />
            </button>
          </div>

          <div className="modal-field">
            <div onClick={(e) => e.stopPropagation()}>
              <select id="Contact"
                      value={contactId ?? ''}
                      onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
                <option value="">No contact selected</option>
                {contacts.map((contact) => (
                  <option key={contact.Id ?? contact.id} value={contact.Id ?? contact.id}>
                    {contact.Name || contact.name || contact.Title || contact.Email || contact.EmailAddress || 'Unnamed contact'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="button"
                title="Create new contact"
                onClick={() => {
                  setContactId(null);
                  setModalOpenContact(true);
                }}><FaPlus /></button>
            </div>
          </div>

          <div className="modal-table">
            {showDescription ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  <textarea id="Description"
                            value={description} 
                            placeholder="Description of the role" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(true);
                        setShowAnalysis(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  <textarea id="Description"
                            value={description} 
                            placeholder="Description of the role" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
                <span className="modal-field"></span>
              </span>
            )}

            {showAnalysis ? (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  <textarea id="Analysis"
                            value={analysis} 
                            placeholder="Analysis of the role spec" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
                <span className="modal-field">
                  <button className="button" >Ask AI</button>
                </span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(true);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  <textarea id="Analysis"
                            value={analysis} 
                            placeholder="Analysis of the role spec" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
                <span className="modal-field">
                  <button className="button" >Ask AI</button>
                </span>
              </span>
            )}

            {showNotes ? (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  <textarea id="notes"
                            value={notes} 
                            placeholder="Notes about the role" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
                <span className='modal-field'></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowNotes(true)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  <textarea id="notes"
                            value={notes} 
                            placeholder="Notes about the role" 
                            onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                </span>
                <span className='modal-field'></span>
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

      {modalOpenSource && (
        <SourceModal
          sourceId={null}
          title = "Create new Source"
          onClose={() => setModalOpenSource(false)}
          onSuccess={async () => {
            await fetchSources(true); // refresh portal list after modal close
            setModalOpenSource(false);
            setSourceId(sourceId);
          }}
        />
      )}

      {modalOpenPlaceOfWork && (
        <PlaceOfWorkModal
          placeOfWorkId={null}
          title = "Create new Place of Work"
          onClose={() => setModalOpenPlaceOfWork(false)}
          onSuccess={async () => {
            await fetchPlacesOfWork(true); // refresh portal list after modal close
            setModalOpenPlaceOfWork(false);
            setPlaceOfWorkId(placeOfWorkId);
          }}
        />
      )}

      {modalOpenContact && (
        <ContactModal
          contactId={null}
          iniSourceId={sourceId || null}
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