import { useEffect, useState } from 'react';
import { FaRegArrowAltCircleRight, FaRegArrowAltCircleDown } from "react-icons/fa";
import Modal from './Modal'; // your existing modal component
import { getSource, listMainSources, saveSource } from '../api/sources';
import { newSourceItem, SourceItem } from '../defs/interfaces';

type Props = {
  /** id of the source to edit; null or undefined means create new */
  sourceId?: number | null;
  title: string;
  onClose: () => void;
  onSuccess?: () => void;      // called after successful submit
};

export default function SourceModal({ sourceId, title, onClose, onSuccess = () => {}, }: Props) {
  /* ---------- State --------------------------------------------------- */
  const [isLoading, setIsLoading] = useState<boolean>(!!sourceId);
  const [error, setError] = useState<string | null>(null);

  const [showDescription, setShowDescription] = useState(false);

  // form fields – initialise to empty values
  const [mainSources, setMainSources] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [portalURL, setPortalURL] = useState<string | ''>('');
  const [icon, setIcon] = useState<Blob | null>(null);
  const [details, setDetails] = useState<string | ''>('');
  const [order, setOrder] = useState<number | 0>(0);
  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const [
          lMainSources,
        ] = await Promise.all([
          listMainSources(),
        ]);
        if (!mounted) return;
        const mainSources = Array.isArray(lMainSources) ? lMainSources : (lMainSources?.data ?? [])
        setMainSources(mainSources);

        if (sourceId) { 
          // load the Source to be editted
          const src: SourceItem | undefined = await getSource(sourceId);
          if (mounted && src) {
            setName(src.Name || '');
            setParentId(src.ParentId || null);
            setPortalURL(src.PortalURL || '');
            setIcon(src.Icon || null);
            setDetails(src.Details || '');
            setOrder(src.Order || 0);
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
  }, [sourceId]);

  const handleSubmit = async () => {
    setError(null);
    // Basic client‑side validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const payload: newSourceItem = {
      Id: null,
      Name: name.trim(),
      ParentId: Number(parentId) || undefined,
      PortalURL: portalURL.trim() || undefined,
      Icon: null,
      Details: details.trim() || undefined,
      IsActive: true,
      Order: 0,
    };
    if (sourceId) payload.Id = Number(sourceId);

    try {
      await saveSource(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save source');
    }
  };

  const handleCancel = () => {
    //setSourceFormOpen(false);
    setMainSources([]);
    setName('');
    setParentId(null);
    setPortalURL('');
    setIcon(null);
    setDetails('');
    setOrder(0);
    onClose();
  };


  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal  title={title} onClose={onClose}>
      {error && <p className="error">{error}</p>}

      {(isLoading || !sourceId) && sourceId
        ? <p>Loading…</p>
        : (
        <div>
          <div className="modal-field mandatory-field">
            <input 
              value={name}
              placeholder="Portal name"
              onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="modal-field">
            <select style={{ flex: 1 }} 
              value={parentId ?? ''} 
              onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">No parent portal selected</option>
              {mainSources.map((mainSource) => (
                <option key={mainSource.Id} value={mainSource.Id}>
                  {mainSource.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <input 
              value={portalURL}
              type="url"
              placeholder="https://example.int/jobs"
              onChange={(e) => setPortalURL(e.target.value)} />
          </div>

          <div className="modal-table">
            {showDescription ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  <textarea id="Description"
                            placeholder="Description of the Source"
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}/>
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(true);}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  <textarea id="Description"
                            placeholder="Description of the Source"
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}/>
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