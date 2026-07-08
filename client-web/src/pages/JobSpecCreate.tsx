import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import SourceModal from '../components/SourceModal';
import ContactModal from '../components/ContactModal';
import PlaceOfWorkModal from '../components/PlaceOfWorkModal'

import { listLocations } from '../api/lu_locations';
import { listRoleTypes } from '../api/lu_roletypes';
import { listWorkModels } from '../api/lu_workmodels';
import { listPlacesOfWork, savePlaceOfWork } from '../api/place_of_work';
import { listSources, saveSource } from '../api/sources';
import { listContacts, saveContact } from '../api/contacts';
import { saveJobSpec } from '../api/jobSpecs';

import { newJobSpecItem, newPlaceOfWorkItem, newContactItem } from '../defs/interfaces';

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

        //let contactData: any[] = [];
        //try {
        //  contactData = await listContacts();
        //} catch (contactErr) {
        //  console.warn('[StageModal] failed to load contacts', contactErr);
        //}

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
    navigate('/');
  };

  //const [showSourceModal, setShowSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

//  const [showPlaceModal, setShowPlaceModal] = useState(false);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /*
  const handleCreatePlace = async () => {
    if (!newPlaceLocationId) return;
    try {
      setLoading(true);
      const payload: newPlaceOfWorkItem = { 
        Id: null,
        LocationId: Number(newPlaceLocationId), 
        IsActive: true 
      };
      if (newPlaceAddress.trim()) payload.Address = newPlaceAddress.trim();
      const created = await savePlaceOfWork(payload);
      setPlacesOfWork((prev) => [...prev, created]);
      setPlaceOfWorkId(created.Id);
      setShowPlaceModal(false);
      setNewPlaceLocationId('');
      setNewPlaceAddress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContact = async () => {
    if (!newContactName.trim()) {
      setContactFormError('Name is required');
      return;
    }
    try {
      setLoading(true);
      const payload: newContactItem = {
        Id: null,
        Name: newContactName.trim(),
        Email: newContactEmail.trim() || null,
        Phone: newContactPhone.trim() || null,
        Details: newContactNotes.trim() || null,
        IsActive: true
      };
      const created = await saveContact(payload);
      const newContact = created ?? payload;
      setContacts((prev) => [newContact, ...prev]);
      const newId = newContact.Id ?? newContact.id ?? null;
      if (newId) setContactId(Number(newId));
      closeContactForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const closeContactForm = () => {
    setShowContactModal(false);
    setContactFormOpen(false);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactNotes('');
    setContactFormError(null);
    setContactCreating(false);
  };
  */
  const handleSubmit = async () => {
    setError(null);
    if (!position.trim()) {
      setError('Position is required');
      return;
    }
    const payload: newJobSpecItem = {
      Id: null,
      Position: position.trim(),
      Company: company.trim() || undefined,
      Link: link.trim() || undefined,
      Description: description.trim() || undefined,
      SalaryExpectation: salaryExpectation.trim() || undefined,
      Published: new Date(published).toISOString(),
      ContactId: contactId || undefined,
      Created: new Date().toISOString(),
      IsActive: true,
    };
    if (sourceId) payload.SourceId = Number(sourceId);
    if (workModelId) payload.WorkModelId = Number(workModelId);
    if (roleTypeId) payload.RoleTypeId = Number(roleTypeId);
    if (placeOfWorkId) payload.PlaceOfWorkId = Number(placeOfWorkId);
    if (contactId) payload.ContactId = Number(contactId);

    try {
      setLoading(true);
      await saveJobSpec(payload);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }

  };

  const fetchSources = async (mounted: boolean = true) => {
    try {
      const data = await listSources();
      if (mounted && Array.isArray(data)) setSources(data);
    } catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load portals',
        );
    } finally {
      //if (mounted) setSourcesLoading(false);
    }
  };

  const fetchContacts = async (mounted: boolean = true) => {
    try {
      const data = await listContacts();
      if (mounted && Array.isArray(data)) setContacts(data);
    } catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load contacts',
        );
    } finally {
      //if (mounted) setContactsLoading(false);
    }
  };

  const fetchPlacesOfWork = async (mounted: boolean = true) => {
    try {
      const data = await listPlacesOfWork();
      if (mounted && Array.isArray(data)) setPlacesOfWork(data);
    } catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load places of work',
        );
    } finally {
      //if (mounted) setPlacesOfWorkLoading(false);
    }
  };

  return (
    <section className="page job-spec-create">
      <h2>Create Job Spec</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && (
        <div>
          <div className="modal-field">
            <input 
              required
              value={position} 
              placeholder="Position"
              onChange={(e) => setPosition(e.target.value)} />
          </div>

          <div className="modal-field">
            <input 
              value={company} 
              placeholder="Company"
              onChange={(e) => setCompany(e.target.value)} />
          </div>

          <div className="modal-field">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select style={{ flex: 1 }} value={sourceId} onChange={(e) => setSourceId(e.target.value ? Number(e.target.value) : '')}>
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
            <input 
              value={link} 
              placeholder="URL to the job offer"
              onChange={(e) => setLink(e.target.value)} />
          </div>

          <div className="modal-field">
            <input
              type="date"
              placeholder="Publish Date"
              value={published}
              onChange={(e) => setPublished(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <select value={workModelId} onChange={(e) => setWorkModelId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">No work model selected</option>
              {workModels.map((w) => (
                <option key={w.Id} value={w.Id}>{w.Name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <select value={roleTypeId} onChange={(e) => setRoleTypeId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">No role type selected</option>
              {roleTypes.map((r) => (
                <option key={r.Id} value={r.Id}>{r.Name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <input 
              value={salaryExpectation} 
              placeholder="Salary range"
              onChange={(e) => setSalaryExpectation(e.target.value)} />
          </div>

          <div className="modal-field">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select style={{ flex: 1 }} value={placeOfWorkId} onChange={(e) => setPlaceOfWorkId(e.target.value ? Number(e.target.value) : '')}>
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
              <select
                value={contactId ?? ''}
                onChange={(e) => setContactId(e.target.value ? Number(e.target.value) : null)}
              >
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
            <textarea 
              value={description} 
              placeholder="Description of the role" 
              onChange={(e) => setDescription(e.target.value)} />
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
