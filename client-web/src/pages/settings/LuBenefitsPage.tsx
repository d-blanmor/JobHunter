import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaTrashAlt, FaArrowCircleUp, FaArrowCircleDown } from "react-icons/fa";
import { GoDotFill } from "react-icons/go";
import Modal from '../../components/Modal';
import { listBenefits, saveBenefit, deleteBenefit, getJobSpecsBenefit, getOffersBenefit } from '../../api/lu_benefits';

interface LookupItem {
  Id: number;
  Name: string;
  IsActive: boolean;
  Order: number;
}

export default function LuBenefitsPage() {
  const [benefits, setBenefits] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentBenefit, setCurrentBenefit] = useState<LookupItem | null>(null);
  const [formValues, setFormValues] = useState({ Name: '', Order: 0 });
  const [modalError, setModalError] = useState<string | null>(null);

  async function loadBenefits() {
    setLoading(true);
    setError(null);
    try {
      const data = await listBenefits();
      if (data != "()") setBenefits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBenefits();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentBenefit(null);
    setFormValues({ Name: '', Order: 0 });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (benefit: LookupItem) => {
    setModalMode('edit');
    setCurrentBenefit(benefit);
    setFormValues({ Name: benefit.Name, Order: benefit.Order });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  const orderedBenefits = useMemo(
    () => [...benefits].sort((a, b) => a.Order - b.Order || a.Id - b.Id),
    [benefits],
  );

  const moveBenefit = async (benefit: LookupItem, direction: 'up' | 'down') => {
    const currentIndex = orderedBenefits.findIndex((item) => item.Id === benefit.Id);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedBenefits.length) {
      return;
    }

    const targetBenefit = orderedBenefits[targetIndex];
    const updatedBenefit = { ...benefit, Order: targetBenefit.Order };
    const updatedTarget = { ...targetBenefit, Order: benefit.Order };

    if (updatedBenefit.Order === updatedTarget.Order) {
      if (direction == 'up') updatedTarget.Order++;
      else updatedBenefit.Order++;
    }

    try {
      setLoading(true);
      await Promise.all([saveBenefit(updatedBenefit), saveBenefit(updatedTarget)]);
      await loadBenefits();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBenefit = async (benefit: LookupItem) => {
    try {
      setLoading(true);
      await deleteBenefit(benefit.Id);
      await loadBenefits();
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
      ...(modalMode === 'edit' && currentBenefit ? { Id: currentBenefit.Id } : {}),
    };

    setModalError(null);

    try {
      setLoading(true);
      await saveBenefit(payload);
      closeModal();
      await loadBenefits();
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
      <h2>Benefits</h2>
      <p>These are the active benefits available for job specifications.</p>

      {loading && <p>Loading benefits...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <div className="settings-button">
            <button className="settings-button" onClick={() => openCreateModal}>Create new benefit</button>
          </div>

          {orderedBenefits.length != 0 ? (
            <div className="lookup-table">
              {orderedBenefits.map((benefit, index) => (
                <div key={benefit.Id} className="lookup-row">
                  <div className="lookup-icon-cell">
                    <GoDotFill />
                  </div>
                  <div className="lookup-cell">
                    {benefit.Name}
                  </div>
                  <div className="lookup-description-cell"></div>
                  <div className="lookup-action-buttons-cell">
                    <span className="lookup-action-buttons">
                      <button
                        type="button"
                        className="lookup-action-button lookup-action-edit"
                        onClick={() => openEditModal(benefit)}
                        aria-label="Edit benefit">
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="lookup-action-button lookup-action-delete"
                        onClick={() => handleDeleteBenefit(benefit)}
                        aria-label="Delete benefit">
                        <FaTrashAlt />
                      </button>
                      {index > 0 ? (
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-up"
                          onClick={() => moveBenefit(benefit, 'up')}
                          aria-label="Move up"
                        >
                          <FaArrowCircleUp />
                        </button>
                      ) : (
                        <div className="action-placeholder" />
                      )}
                      {benefit.Order}
                      {index < orderedBenefits.length - 1 ? (
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-down"
                          onClick={() => moveBenefit(benefit, 'down')}
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
                <h3>{modalMode === 'create' ? 'Create benefit' : 'Edit benefit'}</h3>
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
