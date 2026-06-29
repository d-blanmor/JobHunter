import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getJobSpecCounts } from '../api/summary';

export default function HomePage() {
  const [counts, setCounts] = useState({ received: 0, applied: 0, interview: 0, offers: 0, discarded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const c = await getJobSpecCounts();
        if (mounted) setCounts(c);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="page">
      <h2>Job specs</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <Link className="button" to="/job-specs/new">Add new Job Spec</Link>
      </div>

      {loading && <p>Loading summary...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div>
          <div className="status-row">
            <div className="status-box">
              <div className="status-title">Received</div>
              <div className="status-value">{counts.received}</div>
            </div>
            <div className="status-arrow">→</div>
            <div className="status-box">
              <div className="status-title">Applied</div>
              <div className="status-value">{counts.applied}</div>
            </div>
            <div className="status-arrow">→</div>
            <div className="status-box">
              <div className="status-title">Interview</div>
              <div className="status-value">{counts.interview}</div>
            </div>
            <div className="status-arrow">→</div>
            <div className="status-box">
              <div className="status-title">Offers</div>
              <div className="status-value">{counts.offers}</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div className="status-box status-box-discarded">
              <div className="status-title">Discarded</div>
              <div className="status-value">{counts.discarded}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
