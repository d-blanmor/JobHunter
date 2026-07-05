import { useEffect, useState } from 'react';
import Modal from './Modal'; // your existing modal component
import {
  getSource,
  saveSource
} from '../api/sources';          // API helpers you already have
import { SourceItem } from '../defs/interfaces';

type Props = {
  /** id of the source to edit; null or undefined means create new */
  sourceId?: number | null;
  onClose: () => void;
  onSuccess?: () => void;      // called after successful submit
};

export default function SourceModal({
  sourceId,
  onClose,
  onSuccess = () => {},
}: Props) {
  /* ---------- State --------------------------------------------------- */
  const [isLoading, setIsLoading] = useState<boolean>(!!sourceId);
  const [error, setError] = useState<string | null>(null);

  // form fields – initialise to empty values
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [portalURL, setPortalURL] = useState('');

  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    if (!sourceId) return; // create – nothing to load

    let mounted = true;
    async function fetchSource() {
      setIsLoading(true);
      try {
        const src: SourceItem | undefined = await getSource(sourceId);
        if (mounted && src) {
          setName(src.Name || '');
          setDetails(src.Details || '');
          setPortalURL(src.PortalURL || '');
        }
      } catch (err) {
        if (mounted)
          setError(
            err instanceof Error ? err.message : 'Failed to load source',
          );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchSource();
    return () => {
      mounted = false;
    };
  }, [sourceId]);

  /* ---------- Submit handler ------------------------------------------ */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    // Basic client‑side validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      if (sourceId) {
        await saveSource({Id: sourceId, Name: name, Details: details, PortalURL: portalURL, IsActive: true });
      } else {
        await saveSource({ Name: name, Details: details, PortalURL: portalURL, IsActive: true });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save source');
    }
  };

  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal  open={true} onClose={onClose}>
      <h2>{sourceId ? 'Edit Portal' : 'New Portal'}</h2>

      {error && <p className="error">{error}</p>}

      {(isLoading || !sourceId) && sourceId
        ? <p>Loading…</p>
        : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="src-name">Portal name *</label>
              <input
                id="src-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="src-details">Details</label>
              <textarea
                id="src-details"
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="src-url">Portal URL</label>
              <input
                id="src-url"
                type="url"
                placeholder="https://example.com/jobs"
                value={portalURL}
                onChange={(e) => setPortalURL(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button type="submit" className="primary">
                {sourceId ? 'Save changes' : 'Create Portal'}
              </button>
              <button type="button" onClick={onClose} className="secondary">
                Cancel
              </button>
            </div>
          </form>
        )
      }
    </Modal>
  );
}