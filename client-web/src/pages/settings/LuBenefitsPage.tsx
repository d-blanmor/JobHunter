import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
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
            <Link to="" className="button settings-link" onClick={openCreateModal}>
              Create new benefit
            </Link>
          </div>

          {orderedBenefits.length != 0 ? (
            <table className="lookup-table">
              <tbody>
                {orderedBenefits.map((benefit, index) => (
                  <tr key={benefit.Id}>
                    <td> &#10625; </td>
                    <td>{benefit.Name}</td>
                    <td className="cell-actions">
                      <div className="lookup-action-buttons" style={{ display: 'flex', gap: '0.25rem' }}>
                        {index > 0 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-up"
                            onClick={() => moveBenefit(benefit, 'up')}
                            aria-label="Move up"
                          >
                            &#11014;
                          </button>
                        ) : (
                          <div className="action-placeholder" />
                        )}
                        {index < orderedBenefits.length - 1 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-down"
                            onClick={() => moveBenefit(benefit, 'down')}
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
                          onClick={() => openEditModal(benefit)}
                          aria-label="Edit benefit"
                        >
                          &#9999;
                        </button>
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-delete"
                          onClick={() => handleDeleteBenefit(benefit)}
                          aria-label="Delete benefit"
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
