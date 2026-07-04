import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { listTags, getTag, saveTag, deleteTag } from '../../api/tags';

interface TagItem {
  Id: number;
  Name: string;
  Context?: string;
  IsActive: boolean;
  Order: number;
}

export default function TagsPage() {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentTag, setCurrentTag] = useState<TagItem | null>(null);
  const [formValues, setFormValues] = useState({ Name: '', Context: '', Order: 0 });
  const [modalError, setModalError] = useState<string | null>(null);

  async function loadTags() {
    setLoading(true);
    setError(null);
    try {
      const data = await listTags();
      if (data != "()") setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentTag(null);
    setFormValues({ Name: '', Context: '', Order: 0 });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tag: TagItem) => {
    setModalMode('edit');
    setCurrentTag(tag);
    setFormValues({ Name: tag.Name, Context: tag.Context ?? '', Order: tag.Order });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  const orderedTags = useMemo(
    () => [...tags].sort((a, b) => a.Order - b.Order || a.Id - b.Id),
    [tags],
  );

  const moveTag = async (tag: TagItem, direction: 'up' | 'down') => {
    const currentIndex = orderedTags.findIndex((item) => item.Id === tag.Id);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedTags.length) {
      return;
    }

    const targetTag = orderedTags[targetIndex];
    const updatedTag = { ...tag, Order: targetTag.Order };
    const updatedTarget = { ...targetTag, Order: tag.Order };

    try {
      setLoading(true);
      await Promise.all([saveTag(updatedTag), saveTag(updatedTarget)]);
      await loadTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tag: TagItem) => {
    try {
      setLoading(true);
      await deleteTag(tag.Id);
      await loadTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async () => {
    const name = formValues.Name.trim();
    const order = Number(formValues.Order);

    if (!name) {
      setModalError('Name is required.');
      return;
    }

    if (!Number.isFinite(order) || order < 0) {
      setModalError('Order must be a valid non-negative number.');
      return;
    }

    const payload = {
      Name: name,
      Context: formValues.Context.trim() || undefined,
      Order: order,
      IsActive: true,
      ...(modalMode === 'edit' && currentTag ? { Id: currentTag.Id } : {}),
    };

    setModalError(null);

    try {
      setLoading(true);
      await saveTag(payload);
      closeModal();
      await loadTags();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: 'Name' | 'Context' | 'Order', value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: field === 'Order' ? Number(value) : value }));
  };

  return (
    <section className="page">
      <h2>Tags</h2>
      <p>These are the active tags available for job specifications.</p>

      {loading && <p>Loading tags...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <div className="settings-button">
            <Link to="" className="button settings-link" onClick={openCreateModal}>
              Create new tag
            </Link>
          </div>

          {orderedTags.length != 0 ? (
            <table className="lookup-table">
              <tbody>
                {orderedTags.map((tag, index) => (
                  <tr key={tag.Id}>
                    <td> &#10625; </td>
                    <td>{tag.Name}</td>
                    <td>{tag.Context || '—'}</td>
                    <td className="cell-actions">
                      <div className="lookup-action-buttons" style={{ display: 'flex', gap: '0.25rem' }}>
                        {index > 0 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-up"
                            onClick={() => moveTag(tag, 'up')}
                            aria-label="Move up"
                          >
                            &#11014;
                          </button>
                        ) : (
                          <div className="action-placeholder" />
                        )}
                        {index < orderedTags.length - 1 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-down"
                            onClick={() => moveTag(tag, 'down')}
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
                          onClick={() => openEditModal(tag)}
                          aria-label="Edit tag"
                        >
                          &#9999;
                        </button>
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-delete"
                          onClick={() => handleDeleteTag(tag)}
                          aria-label="Delete tag"
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
                <h3>{modalMode === 'create' ? 'Create tag' : 'Edit tag'}</h3>
                <div className="modal-field">
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formValues.Name}
                    onChange={(event) => handleFormChange('Name', event.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="context">Context</label>
                  <input
                    id="context"
                    type="text"
                    value={formValues.Context}
                    onChange={(event) => handleFormChange('Context', event.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="order">Order</label>
                  <input
                    id="order"
                    type="number"
                    value={formValues.Order}
                    onChange={(event) => handleFormChange('Order', event.target.value)}
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