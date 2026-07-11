import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SourceModal from '../components/SourceModal';
import ContactModal from '../components/ContactModal';
import PlaceOfWorkModal from '../components/PlaceOfWorkModal'

import { isDirty, setIsDirty } from '../App';
import { listLocations } from '../api/lu_locations';
import { listRoleTypes } from '../api/lu_roletypes';
import { listWorkModels } from '../api/lu_workmodels';
import { listPlacesOfWork } from '../api/place_of_work';
import { listSources, saveSource } from '../api/sources';
import { listContacts } from '../api/contacts';
import { saveJobSpec } from '../api/jobSpecs';

import { newJobSpecItem } from '../defs/interfaces';

export default function JobSpecCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpenSource, setModalOpenSource] = useState(false);
  const [modalOpenPlaceOfWork, setModalOpenPlaceOfWork] = useState(false);
  const [modalOpenContact, setModalOpenContact] = useState(false);
  
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [link, setLink] = useState('');
  const [published, setPublished] = useState('');
  const [contactId, setContactId] = useState<number | null>(null);
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [workModelId, setWorkModelId] = useState<number | ''>('');
  const [roleTypeId, setRoleTypeId] = useState<number | ''>('');
  const [placeOfWorkId, setPlaceOfWorkId] = useState<number | ''>('');

  const [contacts, setContacts] = useState<any[]>([]);
  
  const [sourceId, setSourceId] = useState<number | ''>('');
  const [sources, setSources] = useState<any[]>([]);
  const [workModels, setWorkModels] = useState<any[]>([]);
  const [roleTypes, setRoleTypes] = useState<any[]>([]);
  const [placesOfWork, setPlacesOfWork] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  
  useEffect(() => {
    function handelOnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      alert(event.returnValue);
      return (event.returnValue = '');
    }
    window.addEventListener('beforeunload', handelOnBeforeUnload, {capture: true});
    return () => {
      if (isDirty()) window.removeEventListener('beforeunload', handelOnBeforeUnload, {capture: true});
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
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

        if (!mounted) return;

        const sources = Array.isArray(lSources) ? lSources : (lSources?.data ?? []);
        setSources(sources);
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
      } catch (err: any) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const handleCancel = () => {
    if (isDirty()) {
      if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
        return;
    }
    navigate('/');
    setIsDirty(false);
    return;
  };

  const [newSourceName, setNewSourceName] = useState('');

  const [newPlaceLocationId, setNewPlaceLocationId] = useState<number | ''>('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');

  const [showContactModal, setShowContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactNotes, setNewContactNotes] = useState('');

  const handleCreateSource = async () => {
    if (!newSourceName.trim()) return;
    try {
      setLoading(true);
      const created = await saveSource({ Name: newSourceName.trim(), IsActive: true });
      setSources((prev) => [...prev, created]);
      setSourceId(created.Id);
      //setShowSourceModal(false);
      setNewSourceName('');
    } 
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } 
    finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsDirty(false);
    if (!position.trim()) {
      setError('Position is required');
      return;
    }
    const payload: newJobSpecItem = {
      Id: null,
      Position: position.trim(),
      Company: company.trim() || null,
      SourceId: Number(sourceId) || null,
      Link: link.trim() || null,
      PlaceOfWorkId: Number(placeOfWorkId) || null,
      WorkModelId: Number(workModelId) || null,
      RoleTypeId: Number(roleTypeId) || null,
      SalaryExpectation: salaryExpectation.trim() || null,
      ContactId: Number(contactId) || null,
      Description: description.trim() || null,
      Analysis: null,
      Notes: notes.trim() || null,
      Created: new Date().toISOString(),
      IsActive: true,
    };
    try {
      if (published) payload.Published = new Date(published).toISOString();
    } 
    catch(err) {
      payload.Published = null;
    }

    try 
    {
      setLoading(true);
      await saveJobSpec(payload);
      navigate('/');
    } 
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } 
    finally {
      setLoading(false);
    }
  };

  const handleFieldEdit = (field: string, value: string) => {
    setIsDirty(true);
    if (field.toLowerCase() == 'position') {
      setPosition(value);
    }
    else if (field.toLowerCase() == 'company') {
      setCompany(value);
    }
    else if (field.toLowerCase() == 'source')
      setSourceId(value ? Number(value) : '');
    else if (field.toLowerCase() == 'link') {
      setLink(value);
    }
    else if (field.toLowerCase() == 'published') {
      setPublished(value);
    }
    else if (field.toLowerCase() == 'workmodel') {
      setWorkModelId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'roletype') {
      setRoleTypeId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'salaryexpectation') {
      setSalaryExpectation(value);
    }
    else if (field.toLowerCase() == 'placeofwork') {
      setPlaceOfWorkId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'contact') {
      setContactId(value ? Number(value) : null);
    }
    else if (field.toLowerCase() == 'description') {
      setDescription(value);
    }
    else if (field.toLowerCase() == 'notes') {
      setNotes(value);
    }

  }


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

  return (
    <section className="page job-spec-create">
      <h2>Create Job Spec</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && (
        <div>
          <div className="modal-field">
            <input id="Position"
              required
              value={position} 
              placeholder="Position"
              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <input id="Company"
              value={company} 
              placeholder="Company"
              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select id="Source"
                      style={{ flex: 1 }} 
                      value={sourceId} 
                      onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
                <option value="">No source selected</option>
                {sources.map((s) => (
                  <option key={s.Id} value={s.Id}>{s.Name}</option>
                ))}
              </select>
              <button 
                className="button small" 
                onClick={() => {
                  setSourceId('');
                  setModalOpenSource(true);
                }}>+</button>
            </div>
          </div>

          <div className="modal-field">
            <input id="link"
              value={link} 
              placeholder="URL to the job offer"
              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <input id="Published"
              type="date"
              placeholder="Publish Date"
              value={published}
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
              {roleTypes.map((r) => (
                <option key={r.Id} value={r.Id}>{r.Name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <input id="SalaryExpectation"
              value={salaryExpectation} 
              placeholder="Salary range"
              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select id="PlaceOfWork"
                      style={{ flex: 1 }} 
                      value={placeOfWorkId} 
                      onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
                <option value="">No place of work selected</option>
                {placesOfWork.map((p) => {
                  const loc = locations.find((l) => l.Id === p.LocationId);
                  const label = p.Address && p.Address.trim()
                    ? p.Address
                    : loc
                      ? `${loc.Country}${loc.City ? ` - ${loc.City}` : ''}`
                      : `Place ${p.Id}`;
                  return (
                    <option key={p.Id} value={p.Id}>{label}</option>
                  );
                })}
              </select>
              <button
                type="button"
                className="button small"
                title="Create new place of work"
                onClick={() => {
                  setPlaceOfWorkId('');
                  setModalOpenPlaceOfWork(true);
                }}>+</button>

            </div>
          </div>

          <div className="modal-field">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
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
                className="button small"
                title="Create new contact"
                onClick={() => {
                  setContactId(null);
                  setModalOpenContact(true);
                }}>+</button>
            </div>
          </div>

          <div className="modal-field">
            <textarea id="Description"
                      value={description} 
                      placeholder="Description of the role" 
                      onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <textarea id="notes"
                      value={notes} 
                      placeholder="Notes about the role" 
                      onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-actions">
            <button className="button" onClick={handleSubmit}>OK</button>
            <button className="button secondary-button" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

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

    </section>
  );
}
