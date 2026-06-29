import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getJobSpecCounts, listReceivedJobSpecs, listAppliedJobSpecs, listInterviewJobSpecs, listDiscardedJobSpecs } from '../api/summary';
import Modal from '../components/Modal';
import { updateApplication } from '../api/applications';

type Spec = any;

export default function HomePage() {
  const [counts, setCounts] = useState({ received: 0, applied: 0, interview: 0, offers: 0, discarded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalList, setModalList] = useState<Spec[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const navigate = useNavigate();

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

  const openModalFor = async (kind: 'received' | 'applied' | 'interview' | 'discarded') => {
    setModalLoading(true);
    setModalList([]);
    try {
      let list: Spec[] = [];
      if (kind === 'received') {
        list = await listReceivedJobSpecs();
        setModalTitle('Received Job Specs');
      } else if (kind === 'applied') {
        list = await listAppliedJobSpecs();
        setModalTitle('Applied Job Specs');
      } else if (kind === 'interview') {
        list = await listInterviewJobSpecs();
        setModalTitle('Interview Job Specs');
      } else {
        list = await listDiscardedJobSpecs();
        setModalTitle('Discarded Job Specs');
      }
      setModalList(list);
      setModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleView = (id: number) => {
    navigate(`/job-specs/view/${id}`);
    setModalOpen(false);
  };

  const handleEdit = (id: number) => {
    navigate(`/job-specs/edit/${id}`);
    setModalOpen(false);
  };

  const handleApply = (id: number) => {
    navigate(`/applications/new?jobSpecId=${id}`);
    setModalOpen(false);
  };

  const handleScheduleInterview = (id: number) => {
    navigate(`/interviews/new?jobSpecId=${id}`);
    setModalOpen(false);
  };

  const handleDiscard = async (spec: Spec) => {
    // spec should include ApplicationId
    if (!spec || !spec.ApplicationId) {
      setError('No application found to discard');
      return;
    }
    try {
      setModalLoading(true);
      const payload = { Id: spec.ApplicationId, Discarded: new Date().toISOString() };
      await updateApplication(payload);
      setModalOpen(false);
      // refresh counts
      const c = await getJobSpecCounts();
      setCounts(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setModalLoading(false);
    }
  };

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
            <div className="status-box" style={{ cursor: counts.received > 0 ? 'pointer' : 'default' }} onClick={() => counts.received > 0 && openModalFor('received')}>
              <div className="status-title">Received</div>
              <div className="status-value">{counts.received}</div>
            </div>
            <div className="status-arrow">→</div>
            <div className="status-box" style={{ cursor: counts.applied > 0 ? 'pointer' : 'default' }} onClick={() => counts.applied > 0 && openModalFor('applied')}>
              <div className="status-title">Applied</div>
              <div className="status-value">{counts.applied}</div>
            </div>
            <div className="status-arrow">→</div>
            <div className="status-box" style={{ cursor: counts.interview > 0 ? 'pointer' : 'default' }} onClick={() => counts.interview > 0 && openModalFor('interview')}>
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
            <div className="status-box status-box-discarded" style={{ cursor: counts.discarded > 0 ? 'pointer' : 'default' }} onClick={() => counts.discarded > 0 && openModalFor('discarded')}>
              <div className="status-title">Discarded</div>
              <div className="status-value">{counts.discarded}</div>
            </div>
          </div>
        </div>
      )}
      {modalOpen && (
        <Modal title={modalTitle} onClose={() => setModalOpen(false)}>
          {modalLoading && <p>Loading...</p>}
          {!modalLoading && modalList.length === 0 && <p>No items</p>}
          {!modalLoading && modalList.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modalList.map((s) => (
                <div key={s.Id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div>
                    <strong>{s.Position}</strong>{s.Company ? ` — ${s.Company}` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="button small" onClick={() => handleView(s.Id)}>View</button>
                    <button className="button small" onClick={() => handleEdit(s.Id)}>Edit</button>
                    {modalTitle === 'Received Job Specs' && (
                      <button className="button small" onClick={() => handleApply(s.Id)}>Apply</button>
                    )}
                    {(modalTitle === 'Applied Job Specs' || modalTitle === 'Interview Job Specs') && (
                      <>
                        <button className="button small" onClick={() => handleScheduleInterview(s.Id)}>Schedule Interview</button>
                        <button className="button small" onClick={() => handleDiscard(s)}>Discard</button>
                      </>
                    )}
                    {modalTitle === 'Discarded Job Specs' && null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </section>
  );
}
