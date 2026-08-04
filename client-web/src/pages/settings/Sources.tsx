import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { FaEdit, FaTrashAlt, FaArrowCircleUp, FaArrowCircleDown } from "react-icons/fa";
import SourceModal from '../../components/SourceModal';
import { listSources, saveSource, deleteSource  } from '../../api/sources';
import { SourceItem } from '../../defs/interfaces';

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [parents, setParents] = useState<SourceItem[]>([]);
  const [children, setChildren] = useState<Record<number, SourceItem[]>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

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
      if (data != "()") {
        setSources(data);
        const parents = data.filter((s: SourceItem) => s.ParentId == null);
        const childrenMap: Record<number, SourceItem[]> = {};
        data.forEach((s: SourceItem) => {
          if (s.ParentId != null) {
            childrenMap[s.ParentId] = childrenMap[s.ParentId] ?? [];
            childrenMap[s.ParentId].push(s);
          }
        });
        setParents(parents);
        setChildren(childrenMap);
      }
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

  const orderedSources = useMemo(
    () => [...sources].sort((a, b) => a.Order - b.Order || a.Id - b.Id),
    [sources],
  );

  const orderedParents = useMemo(
    () => [...parents].sort((a, b) => a.Order - b.Order || a.Id - b.Id),
    [parents],
  );

  const moveParent = async (source: SourceItem, direction: 'up' | 'down') => {
    const currentIndex = orderedParents.findIndex((item) => item.Id === source.Id);
    if (currentIndex === -1) {
      return;
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedParents.length) {
      return;
    }

    const targetSource = orderedParents[targetIndex];
    const updatedSource = { ...source, Order: targetSource.Order };
    const updatedTarget = { ...targetSource, Order: source.Order };

    if (updatedSource.Order === updatedTarget.Order) {
      if (direction == 'up') updatedTarget.Order++;
      else updatedSource.Order++;
    }

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

  const moveChild = async (source: SourceItem, direction: 'up' | 'down') => {
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

    if (updatedSource.Order === updatedTarget.Order) {
      if (direction == 'up') updatedTarget.Order++;
      else updatedSource.Order++;
    }

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

          {orderedSources.length != 0 ? (
            <div className="lookup-table">
              {sources.length != 0 ? (
                <ul className="source-list">
                  {parents.map((parent, index) => (
                    <li key={parent.Id} className="source-item">
                      {children[parent.Id] && children[parent.Id].length > 0 ? (
                        <span className="source-expand-span"
                          onClick={() => setExpanded((prev)=>{
                            const newSet=new Set(prev);
                            if(newSet.has(parent.Id))newSet.delete(parent.Id);else newSet.add(parent.Id);
                            return newSet;
                          })}>
                          {(expanded.has(parent.Id) ? '▼' : '▶')}
                        </span>
                      ) : (
                        <span className="source-expand-span-empty"></span>
                      )}
                      <span className="lookup-row">{parent.Name}</span>
                      {/*<span className="source-item">{parent.PortalURL || '—'}</span>*/}
                      <span className="lookup-subrow">{parent.Details || '—'}</span>
                      <span className="lookup-action-buttons">
                        {index > 0 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-up"
                            onClick={() => moveParent(parent, 'up')}
                            aria-label="Move up"
                          >
                            <FaArrowCircleUp />
                          </button>
                        ) : (
                          <div className="action-placeholder" />
                        )}
                        {parent.Order}
                        {index < orderedParents.length - 1 ? (
                          <button
                            type="button"
                            className="lookup-action-button lookup-action-down"
                            onClick={() => moveParent(parent, 'down')}
                            aria-label="Move down"
                          >
                            <FaArrowCircleDown />
                          </button>
                        ) : (
                          <div className="action-placeholder" />
                        )}
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-edit"
                          onClick={() => openEditModal(parent)}
                          aria-label="Edit source"
                        >
                          <FaEdit aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="lookup-action-button lookup-action-delete"
                          onClick={() => handleDeleteSource(parent)}
                          aria-label="Delete source"
                        >
                          <FaTrashAlt />
                        </button>
                      </span>
                      {expanded.has(parent.Id) && (
                        <ul>
                          {expanded.has(parent.Id) && (children[parent.Id]||[]).map((child, index) => (
                            <li key={child.Id}
                                className="source-item">
                              <span className="source-item">{child.Name}</span>
                              <span className="source-item">{child.PortalURL || '—'}</span>
                              <span className="source-item">{child.Details || '—'} </span>
                              <span className="lookup-action-buttons">
                                {index > 0 ? (
                                  <button
                                    type="button"
                                    className="lookup-action-button lookup-action-up"
                                    onClick={() => moveChild(child, 'up')}
                                    aria-label="Move up"
                                  >
                                    <FaArrowCircleUp />
                                  </button>
                                ) : (
                                  <div className="action-placeholder" />
                                )}
                                {child.Order}
                                {index < orderedSources.length - 1 ? (
                                  <button
                                    type="button"
                                    className="lookup-action-button lookup-action-down"
                                    onClick={() => moveChild(child, 'down')}
                                    aria-label="Move down"
                                  >
                                    <FaArrowCircleDown />
                                  </button>
                                ) : (
                                  <div className="action-placeholder" />
                                )}
                                <button
                                  type="button"
                                  className="lookup-action-button lookup-action-edit"
                                  onClick={() => openEditModal(child)}
                                  aria-label="Edit source"
                                >
                                  <FaEdit aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  className="lookup-action-button lookup-action-delete"
                                  onClick={() => handleDeleteSource(child)}
                                  aria-label="Delete source"
                                >
                                  <FaTrashAlt />
                                </button>
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : ( '' )}
            </div>
          ) : (
            ''
          )}

          {isModalOpen && (
            <SourceModal
              title='New Source Portal'
              onClose={() => setIsModalOpen(false)}
              onSuccess={async () => {
                await loadSources();
                setIsModalOpen(false);
              }}
            />
          )}
        </>
      )}
    </section>
  );
}