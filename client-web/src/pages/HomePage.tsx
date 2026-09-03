import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTags } from 'react-icons/fa';
import { useEffect, useState, useMemo } from 'react';

import { DEFAULT_PAGE_SIZE } from '../config';
import { 
  Stage,
  Counts,
} from '../defs/types';
import { titleMap } from '../defs/maps';
import { formatShortDate, parseDate } from '../defs/tools';

import StageModal from '../components/StageModal';

import { listWorkModels } from '../api/lu_workmodels';
import { listTags } from '../api/tags';
import { listRoleTypes } from '../api/lu_roletypes';
import {
  listJobSpecs,
  inStageReceived,
  inStageApplied,
  inStageInterview,
  inStageOffer,
  inStageDiscarded,
} from '../api/workflow';

import SourceModal from '../components/SourceModal';
import { listSources } from '../api/sources';
import { wfStageItem, SourceItem } from '../defs/interfaces';

export async function getJobSpecCounts(): Promise<Counts> {
  try {
    const [
      inReceived,
      inApplied,
      inInterview,
      inOffer,
      inDiscarded,
    ] = await Promise.all([
      await inStageReceived(),
      await inStageApplied(),
      await inStageInterview(),
      await inStageOffer(),
      await inStageDiscarded(),
    ]);

    return {
      received: Array.isArray(inReceived) ? inReceived.length : 0,
      applied: Array.isArray(inApplied) ? inApplied.length : 0,
      interview: Array.isArray(inInterview) ? inInterview.length : 0,
      offers: Array.isArray(inOffer) ? inOffer.length : 0,
      discarded: Array.isArray(inDiscarded) ? inDiscarded.length : 0,
    };
  } catch (err) {
    console.error('[summary] getJobSpecCounts error:', err);
    throw err;
  }
}

export default function HomePage() {
  const [counts, setCounts] = useState<Counts>({
    received: 0,
    applied: 0,
    interview: 0,
    offers: 0,
    discarded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalStage, setModalStage] = useState<Stage | null>(null);

  /* ---- Portal (source) state -------------------------------------------- */
  const [jobSpecs, setJobSpecs] = useState<wfStageItem[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [parents, setParents] = useState<SourceItem[]>([]);
  const [children, setChildren] = useState<Record<number, SourceItem[]>>({});
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [roleTypes, setRoleTypes] = useState<any[]>([]);
  const [workModels, setWorkModels] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  const PAGE_SIZE = DEFAULT_PAGE_SIZE;
  const [filterJobspecs, setFilterJobspecs] = useState('');
  const filteredJobspecs = jobSpecs.filter(
    (s) =>
      (s.Position ?? "").toLowerCase().includes(filterJobspecs.toLowerCase()) ||
      (s.Company ?? "").toLowerCase().includes(filterJobspecs.toLowerCase()),
  );
  const [jobSpecsLoading, setJobSpecsLoading] = useState(true);
  const [jobSpecsError, setJobSpecsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const totalJobSpecsPages = Math.max(1, Math.ceil(filteredJobspecs.length / PAGE_SIZE));
  const pagedJobSpecs = filteredJobspecs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [filterSources, setFilterSources] = useState('');
  const filteredSources = sources.filter((s)=> s.Name.toLowerCase().includes(filterSources.toLowerCase()));
  const filteredParents = parents.filter((s)=> s.Name.toLowerCase().includes(filterSources.toLowerCase()));
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [sourcesError, setSourcesError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null); // id of source being edited

  const navigate = useNavigate();

  /* ---- Fetch job‑spec counts ------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    async function loadCounts() {
      setLoading(true);
      try {
        const counters = await getJobSpecCounts();
        if (mounted) setCounts(counters);
      } catch (err) {
        if (mounted)
          setError(err instanceof Error ? err.message : 'Failed to load counts');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCounts();
    return () => {
      mounted = false;
    };
  }, []);

  /* ---- Portal list fetch utility ---------------------------------------- */
  const loadCounts = async (mounted: boolean = true) => {
    setLoading(true);
    try {
      const counters = await getJobSpecCounts();
      if (mounted) setCounts(counters);
    } catch (err) {
      if (mounted)
        setError(err instanceof Error ? err.message : 'Failed to load counts');
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const roleTypeById = useMemo(() => new Map(roleTypes.map((role) => [role.Id, role.Name])), [roleTypes]);
  const workModelById = useMemo(() => new Map(workModels.map((model) => [model.Id, model.Name])), [workModels]);

  const getRoleTypeLabel = (id: number | null) => {
    if (id === null || id === undefined) return '—';
    return roleTypeById.get(id) ?? 'Unknown';
  };

  const getWorkModelLabel = (id: number | null) => {
    if (id === null || id === undefined) return '—';
    return workModelById.get(id) ?? 'Unknown';
  };

  const handlePageChange = (target: number) => {
    setPage(Math.max(1, Math.min(target, totalJobSpecsPages)));
  };


  const handleRowClick = (id: number) => {
    navigate(`/job-specs/view/${id}`);
  };


  /* ---- Portal list fetch utility ---------------------------------------- */
  const fetchJobspecs = async (mounted: boolean = true) => {
    setJobSpecsLoading(true);
    try {
      const [
              lJobspecs,
              roleTypeData, 
              workModelData, 
              tagData
            ] = await Promise.all([
              listJobSpecs(),
              listRoleTypes(),
              listWorkModels(),
              listTags(),
            ]);

      if (lJobspecs != "()") {
        setJobSpecs(lJobspecs);
      }
      setRoleTypes(roleTypeData);
      setWorkModels(workModelData);
      setTags(tagData);
      if (mounted && Array.isArray(lJobspecs)) setJobSpecs(lJobspecs);
    } catch (err) {
      if (mounted)
        setJobSpecsError(
          err instanceof Error ? err.message : 'Failed to load job specs'
        );
    } finally {
      if (mounted) setJobSpecsLoading(false);
    }
  };

  /* ---- Portal list fetch utility ---------------------------------------- */
  const fetchSources = async (mounted: boolean = true) => {
    setSourcesLoading(true);
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
      if (mounted && Array.isArray(data)) setSources(data);
    } catch (err) {
      if (mounted)
        setSourcesError(
          err instanceof Error ? err.message : 'Failed to load portals'
        );
    } finally {
      if (mounted) setSourcesLoading(false);
    }
  };

  const navigateToNewJobSpec = () => {
    navigate('/job-specs/new');
  };

  /* ---- Fetch portal list on mount -------------------------------------- */
  useEffect(() => {
    let mounted = true;
    fetchJobspecs(mounted);
    fetchSources(mounted);
    return () => {
      mounted = false;
    };
  }, []);

  const openModalFor = (stage: Stage) => {
    setModalStage(stage);
  };

  const closeModal = () => {
    setModalStage(null);
  };

  return (
    <section className="page">
      {loading && <p>Loading summary...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="status-grid-container">
          <div className="status-row">
            {counts.received > 0 ? (
              <div
                className="status-box status-box-received status-box-clickable"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('received')}>
                <div className="status-title status-title-received">Received</div>
                <div className="status-value status-value-received">{counts.received}</div>
              </div>
            ) : (
              <div
                className="status-box status-box-received status-box-clickable"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('received')}>
                <div className="status-title status-title-received">Received</div>
                <div className="status-value status-value-received">{counts.received}</div>
              </div>
            )}
            <div className="status-arrow">→</div>
            {counts.applied > 0 ? (
              <div
                className="status-box status-box-clickable status-box-applied"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('applied')}>
                <div className="status-title status-title-applied">Applied</div>
                <div className="status-value status-value-applied">{counts.applied}</div>
              </div>
            ) : (
              <div
                className="status-box status-box-applied"
                role="button"
                tabIndex={0}>
                <div className="status-title status-title-applied">Applied</div>
                <div className="status-value status-value-applied">{counts.applied}</div>
              </div>
            )}
            <div className="status-arrow">→</div>
            {counts.interview > 0 ? (
              <div
                className="status-box status-box-clickable status-box-interview"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('interview')}>
                <div className="status-title status-title-interview">Interview</div>
                <div className="status-value status-value-interview">{counts.interview}</div>
              </div>
            ) : (
              <div
                className="status-box status-box-interview"
                role="button"
                tabIndex={0}>
                <div className="status-title status-title-interview">Interview</div>
                <div className="status-value status-value-interview">{counts.interview}</div>
              </div>
            )}
            <div className="status-arrow">→</div>
            {counts.offers > 0 ? (
              <div
                className="status-box status-box-clickable status-box-offer"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('offers')}>
                <div className="status-title status-title-offered">Offers</div>
                <div className="status-value status-value-offered">{counts.offers}</div>
              </div>
            ) : (
              <div
                className="status-box status-box-offer"
                role="button"
                tabIndex={0}>
                <div className="status-title status-title-offered">Offers</div>
                <div className="status-value status-value-offered">{counts.offers}</div>
              </div>
            )}
          </div>
          
          {counts.discarded > 0 ? (
            <div className="status-row">
              <div
                className="status-box status-box-clickable status-box-discarded"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('discarded')}>
                <div className="status-title status-title-discarded">Discarded</div>
                <div className="status-value status-value-discarded">{counts.discarded}</div>
              </div>
            </div>
          ) : (
            <div className="status-row">
              <div
                className="status-box status-box-discarded"
                role="button"
                tabIndex={0}>
                <div className="status-title status-title-discarded">Discarded</div>
                <div className="status-value status-value-discarded">{counts.discarded}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <hr className="rounded"></hr>
      <div className="page-header-row">
        <span className="source-header-title">
          <h2>Job specs</h2>
        </span>
        <span className="source-header">
          <FaSearch aria-hidden="true" />
        </span>
        <span className="source-header-search">
          <input
            type="text"
            className="source-header"
            placeholder="Filter job specs..."
            value={filterJobspecs}
            onChange={(e)=>setFilterJobspecs(e.currentTarget.value)}
          />
        </span>
        <span className="source-header-action">
          <button 
            type="button"
            className="action-button"
            onClick={navigateToNewJobSpec}>
            Add new Job Spec
          </button>
        </span>

        {!jobSpecsLoading && filterJobspecs != '' && (
          <>
            <div className="jsGrid-row jsGrid-row-header">
              <div className="jsGrid-cell jsGrid-cell-date">Added on</div>
              <div className="jsGrid-cell jsGrid-cell-job-position">Job Position</div>
              <div className="jsGrid-cell">Role Type</div>
              <div className="jsGrid-cell">Work Model</div>
              <div className="jsGrid-cell jsGrid-cell-status">Status</div>
            </div>
            <div className="jsGrid-table">
              {pagedJobSpecs.length === 0 && (
                <div className="jsGrid-row jsGrid-empty-row">
                  <div className="jsGrid-cell jsGrid-paged-cell">
                    No job specs found.
                  </div>
                </div>
              )}
              {pagedJobSpecs.map((item) => (
                <div key={item.JobSpecId} className="jsGrid-row jsGrid-row-clickable" onClick={() => handleRowClick(item.JobSpecId)}>
                  <div className="jsGrid-cell jsGrid-cell-date">
                    {formatShortDate(item.Created)}
                  </div>
                  <div className="jsGrid-cell jsGrid-cell-job-position">
                    {item.Position || item.Company ? (
                      <>
                        {item.Position ? (
                          <span className="job-position-name">{item.Position}</span>
                        ) : (
                          <span className="job-position-empty">—</span>
                        )}
                        {item.Position && item.Company && (
                          <span className="job-position-separator"> at </span>
                        )}
                        {item.Company ? (
                          <span className="job-company-name">{item.Company}</span>
                        ) : null}
                      </>
                    ) : (
                      <span className="job-position-empty">—</span>
                    )}
                  </div>
                  <div className="jsGrid-cell">
                    {item.RoleTypeId ? (
                      getRoleTypeLabel(item.RoleTypeId)
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className="jsGrid-cell">
                    {item.WorkModelId ? (
                      getWorkModelLabel(item.WorkModelId)
                    ) : (
                      '—'
                    )}
                  </div>
                  <div className="jsGrid-cell">
                    {item.Stage}
                  </div>
                </div>
              ))}
            </div>
            {totalJobSpecsPages && totalJobSpecsPages > 1 ? (
              <div className="jsGrid-pagination">
                <button className="jsGrid-button jsGrid-secondary-button" onClick={() => handlePageChange(1)} disabled={page === 1}>
                  First
                </button>
                <button className="jsGrid-button jsGrid-secondary-button" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                  Previous
                </button>
                <span>
                  Page {page} / {totalJobSpecsPages}
                </span>
                <button className="jsGrid-button jsGrid-secondary-button" onClick={() => handlePageChange(page + 1)} disabled={page === totalJobSpecsPages}>
                  Next
                </button>
                <button className="jsGrid-button stage-secondary-button" onClick={() => handlePageChange(totalJobSpecsPages)} disabled={page === totalJobSpecsPages}>
                  Last
                </button>
              </div>
            ) : ( <div className="jsGrid-pagination"/> )}
          </>
        )}

      </div>

      <hr className="rounded"></hr>
      <div className="page-header-row">
        <span className="source-header-title">
          <h2>Job Seeking Portals</h2>
        </span>
        <span className="source-header">
          <FaSearch aria-hidden="true" />
        </span>
        <span className="source-header-search">
          <input
            type="text"
            className="source-header"
            placeholder="Filter portals..."
            value={filterSources}
            onChange={(e)=>setFilterSources(e.currentTarget.value)}
          />
        </span>
        <span className="source-header-action">
          <button 
            type="button"
            className="action-button"
            onClick={() => {
              setCurrentId(null);
              setModalOpen(true);
              }}>
            Add new Portal
          </button>
        </span>
      </div>

      {sourcesLoading && <p>Loading portals...</p>}
      {sourcesError && <p className="error">{sourcesError}</p>}
      {!sourcesLoading &&
        !sourcesError &&
        filteredParents.length > 0 && (
          <ul className="source-list">
            {filteredParents.map((parent) => (
              <li key={parent.Id}
                  className="source-item">
                {children[parent.Id] ? (
                  <span className="source-expand-span"
                      onClick={() => setExpanded((prev)=>{
                        const newSet=new Set(prev);
                        if(newSet.has(parent.Id))newSet.delete(parent.Id);else newSet.add(parent.Id);
                        return newSet;
                      })}>
                    {(expanded.has(parent.Id) ? '▼' : '▶')}
                  </span>
                ) : (
                  <span className="source-expand-span-empty">
                    ▼
                  </span>
                )}
                {parent.PortalURL ? (
                  <a className="source-item"
                    href={parent.PortalURL || '#'}
                    target="_blank"
                    rel="noopener noreferrer">
                    {parent.Name}
                  </a>
                ) : (
                  <span className="source-item">
                    {parent.Name}
                  </span>
                )}
                {parent.Details && (
                  <span className="source-item-secondary">
                    {parent.Details}
                  </span>
                )}
                {expanded.has(parent.Id) && (
                  <ul className="source-sublist">
                    {expanded.has(parent.Id) && (children[parent.Id]||[]).map((child) => (
                      <li key={child.Id} className="source-subitem">
                        {child.PortalURL ? (
                          <a className="source-subitem"
                            href={child.PortalURL || '#'}
                            target="_blank"
                            rel="noopener noreferrer">
                            {child.Name}
                          </a>
                        ) : (
                          <span className="source-subitem">
                            {child.Name}
                          </span>
                        )}
                        {child.Details && (
                          <span className="source-subitem-secondary">
                            {child.Details}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}

      {modalStage && (
        <StageModal
          stage={modalStage}
          title={titleMap[modalStage]}
          open={true}
          onClose={async () => {
            await loadCounts();
            closeModal()
          }}
        />
      )}

      {modalOpen && (
        <SourceModal
          sourceId={currentId}
          title='New Source Portal'
          onClose={() => setModalOpen(false)}
          onSuccess={async () => {
            await fetchSources(true); // refresh portal list after modal close
            setModalOpen(false);
          }}
        />
      )}
    </section>
  );
}