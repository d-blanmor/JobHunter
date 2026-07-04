import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StageModal from '../components/StageModal';
import { inStageReceived, inStageApplied, inStageInterview, inStageOffer, inStageDiscarded } from '../api/workflow';

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
    const [inReceived, inApplied, inInterview, inOffer, inDiscarded] = await Promise.all([
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
  const [counts, setCounts] = useState<Counts>({ received: 0, applied: 0, interview: 0, offers: 0, discarded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalStage, setModalStage] = useState<Stage | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCounts() {
      setLoading(true);
      try {
        const counters = await getJobSpecCounts();
        if (mounted) setCounts(counters);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load counts');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCounts();
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
            <div className="status-box status-box-clickable" role="button" tabIndex={0} onClick={() => openModalFor('received')}>
              <div className="status-title">Received</div>
              <div className="status-value">{counts.received}</div>
            </div>
            <div className="status-arrow">→</div>
            <div className="status-box status-box-clickable" role="button" tabIndex={0} onClick={() => openModalFor('applied')}>
              <div className="status-title">Applied</div>
              <div className="status-value">{counts.applied}</div>
            </div>
            <div className="status-arrow">→</div>
            <div className="status-box status-box-clickable" role="button" tabIndex={0} onClick={() => openModalFor('interview')}>
              <div className="status-title">Interview</div>
              <div className="status-value">{counts.interview}</div>
            </div>
            <div className="status-arrow">→</div>
            <div className="status-box status-box-clickable" role="button" tabIndex={0} onClick={() => openModalFor('offers')}>
              <div className="status-title">Offers</div>
              <div className="status-value">{counts.offers}</div>
            </div>
          </div>

          <div className="discarded-row">
            <div className="status-box status-box-discarded status-box-clickable" role="button" tabIndex={0} onClick={() => openModalFor('discarded')}>
              <div className="status-title">Discarded</div>
              <div className="status-value">{counts.discarded}</div>
            </div>
          </div>
        </div>
      )}

      {modalStage && (
        <StageModal stage={modalStage} title={titleMap[modalStage]} open={true} onClose={closeModal} />
      )}
    </section>
  );
}
