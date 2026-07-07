import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';

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

  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [link, setLink] = useState('');
  const [published, setPublished] = useState('');
  const [contactId, setContactId] = useState<number | null>(null);
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [description, setDescription] = useState('');
  const [sourceId, setSourceId] = useState<number | ''>('');
  const [workModelId, setWorkModelId] = useState<number | ''>('');
  const [roleTypeId, setRoleTypeId] = useState<number | ''>('');
  const [placeOfWorkId, setPlaceOfWorkId] = useState<number | ''>('');

  const [contacts, setContacts] = useState<any[]>([]);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactFormError, setContactFormError] = useState<string | null>(null);
  const [contactCreating, setContactCreating] = useState(false);
  
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

        let contactData: any[] = [];
        try {
          contactData = await listContacts();
        } catch (contactErr) {
          console.warn('[StageModal] failed to load contacts', contactErr);
        }

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

  const [showSourceModal, setShowSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const [showPlaceModal, setShowPlaceModal] = useState(false);
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
      setShowSourceModal(false);
      setNewSourceName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <section className="page job-spec-create">
      <h2>Create Job Spec</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && (
        <div>
          <div className="modal-field">
            <label>Position *</label>
            <input value={position} onChange={(e) => setPosition(e.target.value)} />
          </div>

          <div className="modal-field">
            <label>Company</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          <div className="modal-field">
            <label>Source</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select style={{ flex: 1 }} value={sourceId} onChange={(e) => setSourceId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">—</option>
                {sources.map((s) => (
                  <option key={s.Id} value={s.Id}>{s.Name}</option>
                ))}
              </select>
              <button className="button small" onClick={() => setShowSourceModal(true)}>+</button>
            </div>
          </div>

          <div className="modal-field">
            <label>URL</label>
            <input value={link} onChange={(e) => setLink(e.target.value)} />
          </div>

          <div className="modal-field">
            <label>Publish Date</label>
            <input
              type="date"
              value={published}
              onChange={(event) => setPublished(event.target.value)}
            />
          </div>

          <div className="modal-field">
            <label>Work model</label>
            <select value={workModelId} onChange={(e) => setWorkModelId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">—</option>
              {workModels.map((w) => (
                <option key={w.Id} value={w.Id}>{w.Name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>Role type</label>
            <select value={roleTypeId} onChange={(e) => setRoleTypeId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">—</option>
              {roleTypes.map((r) => (
                <option key={r.Id} value={r.Id}>{r.Name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label>Salary Expectation</label>
            <input value={salaryExpectation} onChange={(e) => setSalaryExpectation(e.target.value)} />
          </div>

          <div className="modal-field">
            <label>Place of work</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select style={{ flex: 1 }} value={placeOfWorkId} onChange={(e) => setPlaceOfWorkId(e.target.value ? Number(e.target.value) : '')}>
                <option value="">—</option>
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
              <button className="button small" onClick={() => setShowPlaceModal(true)}>+</button>
            </div>
          </div>

          <div className="modal-field">
            <label>Contact</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
              <select
                value={contactId ?? ''}
                onChange={(event) => setContactId(event.target.value ? Number(event.target.value) : null)}
              >
                <option value="">No contact</option>
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
                onClick={(e) => {
                  setShowContactModal(true);
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="modal-field">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="modal-actions">
            <button className="button" onClick={handleSubmit}>OK</button>
            <button className="button secondary-button" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {showSourceModal && (
        <Modal title="Create Source" onClose={() => setShowSourceModal(false)}>
          <div className="modal-field">
            <label>Name *</label>
            <input value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="button" onClick={handleCreateSource}>OK</button>
            <button className="button secondary-button" onClick={() => setShowSourceModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {showPlaceModal && (
        <Modal title="Create Place of Work" onClose={() => setShowPlaceModal(false)}>
          <div className="modal-field">
            <label>Location *</label>
            <select value={newPlaceLocationId} onChange={(e) => setNewPlaceLocationId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">—</option>
              {locations.map((l) => (
                <option key={l.Id} value={l.Id}>{l.Country}{l.City ? ` - ${l.City}` : ''}</option>
              ))}
            </select>
          </div>
          <div className="modal-field">
            <label>Address</label>
            <input value={newPlaceAddress} onChange={(e) => setNewPlaceAddress(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="button" onClick={handleCreatePlace}>OK</button>
            <button className="button secondary-button" onClick={() => setShowPlaceModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      {showContactModal && (
        <Modal title="Create Contact" onClose={() => setShowContactModal(false)}>
          <div className="modal-field">
            <label>Name</label>
            <input value={newContactName} onChange={(e) => setNewContactName(e.target.value)} />
          </div>
          <div className="modal-field">
            <label>Email</label>
            <input value={newContactEmail} onChange={(e) => setNewContactEmail(e.target.value)} />
          </div>
          <div className="modal-field">
            <label>Phone</label>
            <input value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} />
          </div>
          <div className="modal-field">
            <label>Details</label>
            <input value={newContactNotes} onChange={(e) => setNewContactNotes(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="button" onClick={handleCreateContact}>OK</button>
            <button className="button secondary-button" onClick={() => closeContactForm()}>Cancel</button>
          </div>
        </Modal>
      )}

    </section>
  );
}
