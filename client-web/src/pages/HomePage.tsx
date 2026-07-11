import { Link, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { 
  Stage,
  Counts,
} from '../defs/types';
import { titleMap } from '../defs/maps';
import StageModal from '../components/StageModal';
import {
  inStageReceived,
  inStageApplied,
  inStageInterview,
  inStageOffer,
  inStageDiscarded,
} from '../api/workflow';

import SourceModal from '../components/SourceModal';
import { listSources } from '../api/sources';
import { SourceItem } from '../defs/interfaces';

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
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [filter, setFilter] = useState('');
  const filteredSources = sources.filter((s)=> s.Name.toLowerCase().includes(filter.toLowerCase()));
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

  /* ---- Portal list fetch utility ---------------------------------------- */
  const fetchSources = async (mounted: boolean = true) => {
    setSourcesLoading(true);
    try {
      const data = await listSources(); // API defined elsewhere
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
      <div className="page-header-row">
        <h2>Job specs</h2>
          <button 
            type="button"
            className="action-button"
            onClick={navigateToNewJobSpec}>
            Add new Job Spec
          </button>
      </div>

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
                className="status-box status-box-applied status-box-clickable"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('applied')}>
                <div className="status-title status-title-applied">Applied</div>
                <div className="status-value status-value-applied">{counts.applied}</div>
              </div>
            ) : (
              <div
                className="status-box status-box-applied status-box-clickable"
                role="button"
                tabIndex={0}>
                <div className="status-title status-title-applied">Applied</div>
                <div className="status-value status-value-applied">{counts.applied}</div>
              </div>
            )}
            <div className="status-arrow">→</div>
            {counts.interview > 0 ? (
              <div
                className="status-box status-box-interview status-box-clickable"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('interview')}>
                <div className="status-title status-title-interview">Interview</div>
                <div className="status-value status-value-interview">{counts.interview}</div>
              </div>
            ) : (
              <div
                className="status-box status-box-interview status-box-clickable"
                role="button"
                tabIndex={0}>
                <div className="status-title status-title-interview">Interview</div>
                <div className="status-value status-value-interview">{counts.interview}</div>
              </div>
            )}
            <div className="status-arrow">→</div>
            {counts.offers > 0 ? (
              <div
                className="status-box status-box-offer status-box-clickable"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('offers')}>
                <div className="status-title status-title-offer">Offers</div>
                <div className="status-value status-value-offer">{counts.offers}</div>
              </div>
            ) : (
              <div
                className="status-box status-box-offer status-box-clickable"
                role="button"
                tabIndex={0}>
                <div className="status-title status-title-offered">Offers</div>
                <div className="status-value status-value-offered">{counts.offers}</div>
              </div>
            )}
          </div>
          
          {counts.discarded > 0 ? (
            <div className="discarded-row">
              <div
                className="status-box status-box-discarded status-box-clickable"
                role="button"
                tabIndex={0}
                onClick={() => openModalFor('discarded')}>
                <div className="status-title status-title-discarded">Discarded</div>
                <div className="status-value status-value-discarded">{counts.discarded}</div>
              </div>
            </div>
          ) : (
            <div className="discarded-row">
              <div
                className="status-box status-box-discarded status-box-clickable"
                role="button"
                tabIndex={0}>
                <div className="status-title status-title-discarded">Discarded</div>
                <div className="status-value status-value-discarded">{counts.discarded}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="page-header-row">
        <span className="modal-field">
          <h2>Job Seeking Portals</h2>
        </span>
        <span className="modal-field">
          <input
            type="text"
            placeholder="Filter portals..."
            value={filter}
            onChange={(e)=>setFilter(e.currentTarget.value)}
            style={{marginLeft:'1rem', marginRight:'1rem'}}
          />
        </span>
        <span className="modal-field">
          <FaSearch aria-hidden="true" />
        </span>
        <span className="modal-field">
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
        filteredSources.length > 0 && (
          <ul
            className="source-list"
            style={{ listStyle: 'none', padding: 0 }}>
            {filteredSources.map((src) => (
              <li
                key={src.Id}
                className="source-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '.5rem',
                }}>
                {src.PortalURL ? (
                <a
                  href={src.PortalURL || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginRight: 'auto',
                    textDecoration: 'none',
                    color: '#0066cc',
                  }}>
                  {src.Name}
                </a>
                ) : (
                  <span
                    className="source-details"
                  style={{
                    marginRight: 'auto',
                    textDecoration: 'none',
                    color: '#0066cc',
                  }}
                  >
                    {src.Name}
                  </span>
                )}
                {src.Details && (
                  <span
                    className="source-details"
                    style={{ marginLeft: '1rem', color: '#666', fontSize: '.85rem' }}>
                    {src.Details}
                  </span>
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