import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaTrashAlt, FaArrowCircleUp, FaArrowCircleDown } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import Modal from '../../components/Modal';
import { listWorkModels, saveWorkModel, deleteWorkModel } from '../../api/lu_workmodels';

interface LookupItem {
  Id: number;
  Name: string;
  IsActive: boolean;
  Order: number;
}

export default function LuWorkModelsPage() {
  const [workmodels, setWorkModels] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentWorkModel, setCurrentWorkModel] = useState<LookupItem | null>(null);
  const [formValues, setFormValues] = useState({ Name: '', Order: 0 });
  const [modalError, setModalError] = useState<string | null>(null);

  async function loadWorkModels() {
    setLoading(true);
    setError(null);
    try {
      const data = await listWorkModels();
      if (data != "()") setWorkModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWorkModels();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentWorkModel(null);
    setFormValues({ Name: '', Order: 0 });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (workmodel: LookupItem) => {
    setModalMode('edit');
    setCurrentWorkModel(workmodel);
    setFormValues({ Name: workmodel.Name, Order: workmodel.Order });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  const orderedWorkModels = useMemo(
    () => [...workmodels].sort((a, b) => a.Order - b.Order || a.Id - b.Id),
    [workmodels],
  );

  const moveWorkModel = async (workmodel: LookupItem, direction: 'up' | 'down') => {
    const currentIndex = orderedWorkModels.findIndex((item) => item.Id === workmodel.Id);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedWorkModels.length) {
      return;
    }

    const targetWorkModel = orderedWorkModels[targetIndex];
    const updatedWorkModel = { ...workmodel, Order: targetWorkModel.Order };
    const updatedTarget = { ...targetWorkModel, Order: workmodel.Order };

    if (updatedWorkModel.Order === updatedTarget.Order) {
      if (direction == 'up') updatedTarget.Order++;
      else updatedWorkModel.Order++;
    }

    try {
      setLoading(true);
      await Promise.all([saveWorkModel(updatedWorkModel), saveWorkModel(updatedTarget)]);
      await loadWorkModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkModel = async (workmodel: LookupItem) => {
    try {
      setLoading(true);
      await deleteWorkModel(workmodel.Id);
      await loadWorkModels();
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
      ...(modalMode === 'edit' && currentWorkModel ? { Id: currentWorkModel.Id } : {}),
    };

    setModalError(null);

    try {
      setLoading(true);
      await saveWorkModel(payload);
      closeModal();
      await loadWorkModels();
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
            <button className="settings-button" onClick={() => openCreateModal}>Create new role type</button>
          </div>

          {orderedWorkModels.length != 0 ? (
            <div className="lookup-table">
              {orderedWorkModels.map((workmodel, index) => (
                <div key={workmodel.Id} className="lookup-row">
                  <div className="lookup-icon-cell"><GoDotFill /></div>
                  <div className="lookup-cell">{workmodel.Name}</div>
                  <div className="lookup-description-cell"></div>
                  <div className="lookup-action-buttons-cell">
                    <span className="lookup-action-buttons">
                      <button
                        type="button"
                        className="lookup-action-button lookup-action-edit"
                        onClick={() => openEditModal(workmodel)}
                        aria-label="Edit work model">
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="lookup-action-button lookup-action-delete"
                        onClick={() => handleDeleteWorkModel(workmodel)}
                        aria-label="Delete work model">
                        <FaTrashAlt />
                      </button>
                      {index > 0 ? (
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-up"
                          onClick={() => moveWorkModel(workmodel, 'up')}
                          aria-label="Move up"
                        >
                          <FaArrowCircleUp />
                        </button>
                      ) : (
                        <div className="action-placeholder" />
                      )}
                      {workmodel.Order}
                      {index < orderedWorkModels.length - 1 ? (
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-down"
                          onClick={() => moveWorkModel(workmodel, 'down')}
                          aria-label="Move down"
                        >
                          <FaArrowCircleDown />
                        </button>
                      ) : (
                        <div className="action-placeholder" />
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
