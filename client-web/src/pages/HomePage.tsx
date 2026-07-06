import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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

type Stage = 'received' | 'applied' | 'interview' | 'offers' | 'discarded';

type Counts = {
  received: number;
  applied: number;
  interview: number;
  offers: number;
  discarded: number;
};

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
  const fetchSources = async (mounted: boolean = true) => {
    setSourcesLoading(true);
    try {
      const data = await listSources(); // API defined elsewhere
      if (mounted && Array.isArray(data)) setSources(data);
    } catch (err) {
      if (mounted)
        setSourcesError(
          err instanceof Error ? err.message : 'Failed to load portals',
        );
    } finally {
      if (mounted) setSourcesLoading(false);
    }
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

  const titleMap: Record<Stage, string> = {
    received: 'Received Job Specs',
    applied: 'Applied Job Specs',
    interview: 'Interview Job Specs',
    offers: 'Offer Job Specs',
    discarded: 'Discarded Job Specs',
  };

  return (
    <section className="page">
      {/* ----------------------------------------------------------------- */}
      <div className="page-header-row">
        <h2>Job specs</h2>
        <Link className="button" to="/job-specs/new">
          Add new Job Spec
        </Link>
      </div>

      {loading && <p>Loading summary...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="status-grid-container">
          <div className="status-row">
            <div
              className="status-box status-box-clickable"
              role="button"
              tabIndex={0}
              onClick={() => openModalFor('received')}
            >
              <div className="status-title">Received</div>
              <div className="status-value">{counts.received}</div>
            </div>
            <div className="status-arrow">→</div>
            <div
              className="status-box status-box-clickable"
              role="button"
              tabIndex={0}
              onClick={() => openModalFor('applied')}
            >
              <div className="status-title">Applied</div>
              <div className="status-value">{counts.applied}</div>
            </div>
            <div className="status-arrow">→</div>
            <div
              className="status-box status-box-clickable"
              role="button"
              tabIndex={0}
              onClick={() => openModalFor('interview')}
            >
              <div className="status-title">Interview</div>
              <div className="status-value">{counts.interview}</div>
            </div>
            <div className="status-arrow">→</div>
            <div
              className="status-box status-box-clickable"
              role="button"
              tabIndex={0}
              onClick={() => openModalFor('offers')}
            >
              <div className="status-title">Offers</div>
              <div className="status-value">{counts.offers}</div>
            </div>
          </div>

          <div className="discarded-row">
            <div
              className="status-box status-box-discarded status-box-clickable"
              role="button"
              tabIndex={0}
              onClick={() => openModalFor('discarded')}
            >
              <div className="status-title">Discarded</div>
              <div className="status-value">{counts.discarded}</div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      <div
        className="page-header-row"
        style={{ marginTop: '2rem' }}
      >
        <h2>Job Seeking Portals</h2>

        <div
          className="status-box status-box-discarded status-box-clickable"
          style={{
            marginRight: '.5rem',
            background: 'none',
            border: 0,
            cursor: 'pointer',
          }}
          role="button"
          tabIndex={0}
          onClick={() => {
            setCurrentId(null);
            setModalOpen(true);
          }}
        >
          Add new Portal
        </div>
      </div>

      {sourcesLoading && <p>Loading portals...</p>}
      {sourcesError && <p className="error">{sourcesError}</p>}
      {!sourcesLoading &&
        !sourcesError &&
        sources.length > 0 && (
          <ul
            className="source-list"
            style={{ listStyle: 'none', padding: 0 }}
          >
            {sources.map((src) => (
              <li
                key={src.Id}
                className="source-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '.5rem',
                }}
              >
                {src.PortalURL ? (
                <a
                  href={src.PortalURL || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginRight: 'auto',
                    textDecoration: 'none',
                    color: '#0066cc',
                  }}
                >
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
                    style={{ marginLeft: '1rem', color: '#666', fontSize: '.85rem' }}
                  >
                    {src.Details}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

      {/* ----------------------------------------------------------------- */}
      {modalStage && (
        <StageModal
          stage={modalStage}
          title={titleMap[modalStage]}
          open={true}
          onClose={closeModal}
        />
      )}

      {modalOpen && (
        <SourceModal
          sourceId={currentId}
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