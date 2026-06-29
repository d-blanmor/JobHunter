import { useEffect, useMemo, useState } from 'react';
import Modal from '../components/Modal';
import { listLocations, saveLocation, deleteLocation } from '../api/locations';

interface LocationItem {
  Id: number;
  Country: string;
  City?: string;
  IsActive: boolean;
  Order: number;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentLocation, setCurrentLocation] = useState<LocationItem | null>(null);
  const [formValues, setFormValues] = useState({ Country: '', City: '', Order: 0 });
  const [modalError, setModalError] = useState<string | null>(null);

  async function loadLocations() {
    setLoading(true);
    setError(null);
    try {
      const data = await listLocations();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLocations();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setCurrentLocation(null);
    setFormValues({ Country: '', City: '', Order: 0 });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (location: LocationItem) => {
    setModalMode('edit');
    setCurrentLocation(location);
    setFormValues({ Country: location.Country, City: location.City ?? '', Order: location.Order });
    setModalError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  const orderedLocations = useMemo(
    () => [...locations].sort((a, b) => a.Order - b.Order || a.Id - b.Id),
    [locations],
  );

  const moveLocation = async (location: LocationItem, direction: 'up' | 'down') => {
    const currentIndex = orderedLocations.findIndex((item) => item.Id === location.Id);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedLocations.length) {
      return;
    }

    const targetLocation = orderedLocations[targetIndex];
    const updatedLocation = { ...location, Order: targetLocation.Order };
    const updatedTarget = { ...targetLocation, Order: location.Order };

    try {
      setLoading(true);
      await Promise.all([saveLocation(updatedLocation), saveLocation(updatedTarget)]);
      await loadLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (location: LocationItem) => {
    try {
      setLoading(true);
      await deleteLocation(location.Id);
      await loadLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleModalSubmit = async () => {
    const country = formValues.Country.trim();
    const order = Number(formValues.Order);

    if (!country) {
      setModalError('Country is required.');
      return;
    }

    if (!Number.isFinite(order) || order < 0) {
      setModalError('Order must be a valid non-negative number.');
      return;
    }

    const payload = {
      Country: country,
      City: formValues.City.trim() || undefined,
      Order: order,
      IsActive: true,
      ...(modalMode === 'edit' && currentLocation ? { Id: currentLocation.Id } : {}),
    };

    setModalError(null);

    try {
      setLoading(true);
      await saveLocation(payload);
      closeModal();
      await loadLocations();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: 'Country' | 'City' | 'Order', value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: field === 'Order' ? Number(value) : value }));
  };

  return (
    <section className="page">
      <h2>Locations</h2>
      <p>These are the active locations available for job specifications.</p>

      {loading && <p>Loading locations...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <div className="button-row button-row-top">
            <button type="button" className="button" onClick={openCreateModal}>
              Create new location
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Country</th>
                <th>City</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderedLocations.map((location, index) => (
                <tr key={location.Id}>
                  <td>{location.Id}</td>
                  <td>{location.Country}</td>
                  <td>{location.City || '—'}</td>
                  <td>{location.Order}</td>
                  <td>
                    <div className="action-buttons">
                      {index > 0 && (
                        <button
                          type="button"
                          className="button secondary-button"
                          onClick={() => moveLocation(location, 'up')}
                        >
                          Up
                        </button>
                      )}
                      {index < orderedLocations.length - 1 && (
                        <button
                          type="button"
                          className="button secondary-button"
                          onClick={() => moveLocation(location, 'down')}
                        >
                          Down
                        </button>
                      )}
                      <button
                        type="button"
                        className="button secondary-button"
                        onClick={() => openEditModal(location)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="button secondary-button delete-button"
                        onClick={() => handleDeleteLocation(location)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="button-row button-row-bottom">
            <button type="button" className="button" onClick={openCreateModal}>
              Create new location
            </button>
          </div>

          {isModalOpen && (
            <div className="modal-overlay" role="dialog" aria-modal="true">
              <div className="modal">
                <h3>{modalMode === 'create' ? 'Create location' : 'Edit location'}</h3>
                <div className="modal-field">
                  <label htmlFor="country">Country</label>
                  <input
                    id="country"
                    type="text"
                    value={formValues.Country}
                    onChange={(event) => handleFormChange('Country', event.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    type="text"
                    value={formValues.City}
                    onChange={(event) => handleFormChange('City', event.target.value)}
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
