import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { listSources, saveSource, deleteSource  } from '../../api/sources';
import { SourceItem } from '../../defs/interfaces';

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentSource, setCurrentSource] = useState<SourceItem | null>(null);
  const [formValues, setFormValues] = useState({ Name: '', PortalURL: '', Details: '' });
  const [modalError, setModalError] = useState<string | null>(null);

  async function loadSources() {
    setLoading(true);
    setError(null);
    try {
      const data = await listSources();
      if (data != "()") setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSources();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentSource(null);
    setFormValues({ Name: '', PortalURL: '', Details: '' });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (source: SourceItem) => {
    setModalMode('edit');
    setCurrentSource(source);
    setFormValues({ Name: source.Name, PortalURL: source.PortalURL ?? '', Details: source.Details ?? '' });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };
/*
  const orderedSources = useMemo(
    () => [...sources].sort((a, b) => a.Order - b.Order || a.Id - b.Id),
    [sources],
  );

  const moveSource = async (source: SourceItem, direction: 'up' | 'down') => {
    const currentIndex = orderedSources.findIndex((item) => item.Id === source.Id);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedSources.length) {
      return;
    }

    const targetSource = orderedSources[targetIndex];
    const updatedSource = { ...source, Order: targetSource.Order };
    const updatedTarget = { ...targetSource, Order: source.Order };

    try {
      setLoading(true);
      await Promise.all([saveSource(updatedSource), saveSource(updatedTarget)]);
      await loadSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };
*/
  const handleDeleteSource = async (source: SourceItem) => {
    try {
      setLoading(true);
      await deleteSource(source.Id);
      await loadSources();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async () => {
    const name = formValues.Name.trim();
    const portalURL = formValues.PortalURL.trim();
    const details = formValues.Details.trim();

    if (!name) {
      setModalError('Name is required.');
      return;
    }

    const payload = {
      Name: name,
      PortalURL: portalURL || undefined,
      Details: details,
      IsActive: true,
      ...(modalMode === 'edit' && currentSource ? { Id: currentSource.Id } : {}),
    };

    setModalError(null);

    try {
      setLoading(true);
      await saveSource(payload);
      closeModal();
      await loadSources();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: 'Name' | 'PortalURL' | 'Details', value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };


  return (
    <section className="page">
      <h2>Sources</h2>
      <p>These are the active sources available for job specifications.</p>

      {loading && <p>Loading sources...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <div className="settings-button">
            <Link to="" className="button settings-link" onClick={openCreateModal}>
              Create new Source
            </Link>
          </div>

          {sources.length != 0 ? (
            <table className="lookup-table">
              <tbody>
                {sources.map((source, index) => (
                  <tr key={source.Id}>
                    <td> &#10625; </td>
                    <td>{source.Name}</td>
                    <td>{source.PortalURL || '—'}</td>
                    <td className="cell-actions">
                      <div className="lookup-action-buttons" style={{ display: 'flex', gap: '0.25rem' }}>
                        {index > 0 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-up"
                            //onClick={() => moveSource(source, 'up')}
                            aria-label="Move up"
                          >
                            &#11014;
                          </button>
                        ) : (
                          <div className="action-placeholder" />
                        )}
                        {index < 10 - 1 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-down"
                            //onClick={() => moveSource(source, 'down')}
                            aria-label="Move down"
                          >
                            &#11015;
                          </button>
                        ) : (
                          <div className="action-placeholder" />
                        )}
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-edit"
                          onClick={() => openEditModal(source)}
                          aria-label="Edit source"
                        >
                          &#9999;
                        </button>
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-delete"
                          onClick={() => handleDeleteSource(source)}
                          aria-label="Delete source"
                        >
                          &#10060;
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            ''
          )}
          {isModalOpen && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="modal">
                <h3>{modalMode === 'create' ? 'Create source' : 'Edit source'}</h3>
                <div className="modal-field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formValues.Name}
                    onChange={(e) => handleFormChange('Name', e.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="portalURL">Portal URL</label>
                  <input
                    id="portalURL"
                    type="text"
                    value={formValues.PortalURL}
                    onChange={(e) => handleFormChange('PortalURL', e.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="details">Details</label>
                  <textarea
                    id="details"
                    rows={3}
                    value={formValues.Details}
                    onChange={(e) => handleFormChange('Details', e.target.value)}
                  />
                </div>
                {modalError && <p className="error">{modalError}</p>}
                <div className="modal-actions">
                  <button type="button" className="button" onClick={handleModalSubmit}>
                    OK
                  </button>
                  <button type="button" className="button secondary-button" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}