import { useEffect, useState } from 'react';
import Modal from './Modal';
import { getPlaceOfWork, savePlaceOfWork } from '../api/place_of_work';
import { listLocations } from '../api/lu_locations';
import { newPlaceOfWorkItem, PlaceOfWorkItem } from '../defs/interfaces';

type Props = {
  /** id of the source to edit; null or undefined means create new */
  placeOfWorkId?: number | null;
  title: string;
  onClose: () => void;
  onSuccess?: () => void;      // called after successful submit
};

export default function SourceModal({ placeOfWorkId, title, onClose, onSuccess = () => {}, }: Props) {
  /* ---------- State --------------------------------------------------- */
  const [isLoading, setIsLoading] = useState<boolean>(!!placeOfWorkId);
  const [error, setError] = useState<string | null>(null);

  // form fields – initialise to empty values
  const [locationId, setLocationId] = useState<number | null>(null);
  const [address, setAddress] = useState<string | ''>('');
  
  const [locations, setLocations] = useState<any[]>([]);
  
  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const [
          lLocations,
        ] = await Promise.all([
          listLocations(),
        ]);
        if (!mounted) return;
        setLocations(lLocations);

        if (placeOfWorkId) { 
          // load the Source to be editted
          const src: PlaceOfWorkItem | undefined = await getPlaceOfWork(placeOfWorkId);
          if (mounted && src) {
            setLocationId(src.LocationId || null);
            setAddress(src.Address || '');
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
  }, [placeOfWorkId]);

  const handleSubmit = async () => {
    setError(null);
    // Basic client‑side validation
    if (!locationId) {
      setError('Location is required');
      return;
    }

    const payload: newPlaceOfWorkItem = {
      Id: null,
      LocationId: locationId,
      Address: address.trim(),
      IsActive: true,
    };
    if (placeOfWorkId) payload.Id = Number(placeOfWorkId);

    try {
      await savePlaceOfWork(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save place of work');
    }
  };

  const handleCancel = () => {
    setLocationId(null);
    setAddress('');

    onClose();
  };


  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal title={title} onClose={onClose}>
      {error && <p className="error">{error}</p>}

      {(isLoading || !placeOfWorkId) && placeOfWorkId
        ? <p>Loading…</p>
        : (
        <div>
          <div className="modal-field">
            <select style={{ flex: 1 }} 
              required
              value={locationId ?? ''} 
              onChange={(e) => setLocationId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">No location selected</option>
              {locations.map((location) => (
                <option key={location.Id} value={location.Id}>
                  {location.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <input 
              value={address}
              placeholder="Place of work address"
              onChange={(e) => setAddress(e.target.value)} />
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