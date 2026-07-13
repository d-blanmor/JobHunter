import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import { listRoleTypes, saveRoleType, deleteRoleType } from '../../api/lu_roletypes';

interface LookupItem {
  Id: number;
  Name: string;
  IsActive: boolean;
  Order: number;
}

export default function LuRoleTypesPage() {
  const [roletypes, setRoleTypes] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentRoleType, setCurrentRoleType] = useState<LookupItem | null>(null);
  const [formValues, setFormValues] = useState({ Name: '', Order: 0 });
  const [modalError, setModalError] = useState<string | null>(null);

  async function loadRoleTypes() {
    setLoading(true);
    setError(null);
    try {
      const data = await listRoleTypes();
      if (data != "()") setRoleTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRoleTypes();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentRoleType(null);
    setFormValues({ Name: '', Order: 0 });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (roletype: LookupItem) => {
    setModalMode('edit');
    setCurrentRoleType(roletype);
    setFormValues({ Name: roletype.Name, Order: roletype.Order });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  const orderedRoleTypes = useMemo(
    () => [...roletypes].sort((a, b) => a.Order - b.Order || a.Id - b.Id),
    [roletypes],
  );

  const moveRoleType = async (roletype: LookupItem, direction: 'up' | 'down') => {
    const currentIndex = orderedRoleTypes.findIndex((item) => item.Id === roletype.Id);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedRoleTypes.length) {
      return;
    }

    const targetRoleType = orderedRoleTypes[targetIndex];
    const updatedRoleType = { ...roletype, Order: targetRoleType.Order };
    const updatedTarget = { ...targetRoleType, Order: roletype.Order };

    if (updatedRoleType.Order === updatedTarget.Order) {
      if (direction == 'up') updatedTarget.Order++;
      else updatedRoleType.Order++;
    }

    try {
      setLoading(true);
      await Promise.all([saveRoleType(updatedRoleType), saveRoleType(updatedTarget)]);
      await loadRoleTypes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoleType = async (roletype: LookupItem) => {
    try {
      setLoading(true);
      await deleteRoleType(roletype.Id);
      await loadRoleTypes();
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
      Order: order,
      IsActive: true,
      ...(modalMode === 'edit' && currentRoleType ? { Id: currentRoleType.Id } : {}),
    };

    setModalError(null);

    try {
      setLoading(true);
      await saveRoleType(payload);
      closeModal();
      await loadRoleTypes();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: 'Name' | 'Order', value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: field === 'Order' ? Number(value) : value }));
  };

  return (
    <section className="page">
      <h2>Role Types</h2>
      <p>These are the active role types available for job specifications.</p>

      {loading && <p>Loading role types...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <div className="settings-button">
            <Link to="" className="button settings-link" onClick={openCreateModal}>
              Create new role type
            </Link>
          </div>

          {orderedRoleTypes.length != 0 ? (
            <table className="lookup-table">
              <tbody>
                {orderedRoleTypes.map((roletype, index) => (
                  <tr key={roletype.Id}>
                    <td> &#10625; </td>
                    <td>{roletype.Name}</td>
                    <td className="cell-actions">
                      <div className="lookup-action-buttons" style={{ display: 'flex', gap: '0.25rem' }}>
                        {index > 0 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-up"
                            onClick={() => moveRoleType(roletype, 'up')}
                            aria-label="Move up"
                          >
                            &#11014;
                          </button>
                        ) : (
                          <div className="action-placeholder" />
                        )}
                        {roletype.Order}
                        {index < orderedRoleTypes.length - 1 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-down"
                            onClick={() => moveRoleType(roletype, 'down')}
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
                          onClick={() => openEditModal(roletype)}
                          aria-label="Edit role type"
                        >
                          &#9999;
                        </button>
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-delete"
                          onClick={() => handleDeleteRoleType(roletype)}
                          aria-label="Delete role type"
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
                <h3>{modalMode === 'create' ? 'Create role type' : 'Edit role type'}</h3>
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
