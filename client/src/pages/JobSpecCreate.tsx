import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveJobSpec, listSources, listWorkModels, listRoleTypes, listPlacesOfWork, createSource, createPlaceOfWork } from '../api/jobSpecs';
import Modal from '../components/Modal';
import { listLocations } from '../api/locations';

export default function JobSpecCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [sourceId, setSourceId] = useState<number | ''>('');
  const [workModelId, setWorkModelId] = useState<number | ''>('');
  const [roleTypeId, setRoleTypeId] = useState<number | ''>('');
  const [placeOfWorkId, setPlaceOfWorkId] = useState<number | ''>('');

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
        const [s, w, r, p, locs] = await Promise.all([listSources(), listWorkModels(), listRoleTypes(), listPlacesOfWork(), listLocations()]);
        if (!mounted) return;
        setSources(s);
        setWorkModels(w);
        setRoleTypes(r);
        setPlacesOfWork(p);
        setLocations(locs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleCancel = () => {
    navigate('/');
  };

  const [showSourceModal, setShowSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [newPlaceLocationId, setNewPlaceLocationId] = useState<number | ''>('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');

  const handleCreateSource = async () => {
    if (!newSourceName.trim()) return;
    try {
      setLoading(true);
      const created = await createSource({ Name: newSourceName.trim(), IsActive: true });
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
      const payload: any = { LocationId: Number(newPlaceLocationId), IsActive: true };
      if (newPlaceAddress.trim()) payload.Address = newPlaceAddress.trim();
      const created = await createPlaceOfWork(payload);
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

  const handleSubmit = async () => {
    setError(null);
    if (!position.trim()) {
      setError('Position is required');
      return;
    }
    const payload: any = {
      Position: position.trim(),
      Company: company.trim() || undefined,
      Description: description.trim() || undefined,
      IsActive: true,
    };
    if (sourceId) payload.SourceId = Number(sourceId);
    if (workModelId) payload.WorkModelId = Number(workModelId);
    if (roleTypeId) payload.RoleTypeId = Number(roleTypeId);
    if (placeOfWorkId) payload.PlaceOfWorkId = Number(placeOfWorkId);

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
    <section className="page">
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
    </section>
  );
}
