import { useEffect, useState } from 'react';
import Modal from './Modal';
import { getContact, saveContact } from '../api/contacts';
import { listSources } from '../api/sources';
import { newContactItem, ContactItem } from '../defs/interfaces';

type Props = {
  /** id of the source to edit; null or undefined means create new */
  contactId?: number | null;
  title: string;
  onClose: () => void;
  onSuccess?: () => void;      // called after successful submit
};

export default function SourceModal({ contactId, title, onClose, onSuccess = () => {}, }: Props) {
  /* ---------- State --------------------------------------------------- */
  const [isLoading, setIsLoading] = useState<boolean>(!!contactId);
  const [error, setError] = useState<string | null>(null);

  // form fields – initialise to empty values
  const [name, setName] = useState('');
  const [email, setEmail] = useState<string | ''>('');
  const [phone, setPhone] = useState<string | ''>('');
  const [details, setDetails] = useState<string | ''>('');
  const [sourceId, setSourceId] = useState<number | null>(null);
  
  const [sources, setSources] = useState<any[]>([]);
  
  /* ---------- Load data for editing ----------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);
      try {
        const [
          lSources,
        ] = await Promise.all([
          listSources(),
        ]);
        if (!mounted) return;
        setSources(lSources);

        if (contactId) { 
          // load the Source to be editted
          const src: ContactItem | undefined = await getContact(contactId);
          if (mounted && src) {
            setName(src.Name || '');
            setEmail(src.Email || '');
            setPhone(src.Phone || '');
            setDetails(src.Details || '');
            setSourceId(src.SourceId || null);
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
  }, [contactId]);

  const handleSubmit = async () => {
    setError(null);
    // Basic client‑side validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const payload: newContactItem = {
      Id: null,
      Name: name.trim(),
      Email: email.trim(),
      Phone: phone.trim(),
      Details: details.trim(),
      SourceId: Number(sourceId) || undefined,
      IsActive: true,
    };
    if (contactId) payload.Id = Number(contactId);

    try {
      await saveContact(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    }
  };

  const handleCancel = () => {
    setName('');
    setEmail('');
    setPhone('');
    setDetails('');
    setSourceId(null);

    onClose();
  };


  /* ---------- Render --------------------------------------------------- */
  return (
    <Modal title={title} onClose={onClose}>
      {error && <p className="error">{error}</p>}

      {(isLoading || !contactId) && contactId
        ? <p>Loading…</p>
        : (
        <div>
          <div className="modal-field">
            <input 
              required
              value={name}
              placeholder="Contact name"
              onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="modal-field">
            <input 
              value={email}
              type="Email address"
              placeholder="contact@example.int"
              onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="modal-field">
            <input 
              value={phone}
              type="Phone number"
              placeholder="+353 (0) 00 000 0000"
              onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="modal-field">
            <textarea
              placeholder="Description of the contact"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="modal-field">
            <select style={{ flex: 1 }} 
              value={sourceId ?? ''} 
              onChange={(e) => setSourceId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">No source portal selected</option>
              {sources.map((source) => (
                <option key={source.Id} value={source.Id}>
                  {source.Name}
                </option>
              ))}
            </select>
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