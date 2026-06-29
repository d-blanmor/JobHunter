import { API_BASE } from '../config';

type Counts = {
  received: number;
  applied: number;
  interview: number;
  offers: number;
  discarded: number;
};

export async function getJobSpecCounts(): Promise<Counts> {
  const [rRes, aRes, iRes, oRes, dRes] = await Promise.all([
    fetch(`${API_BASE}/repository/job-specs/received`),
    fetch(`${API_BASE}/repository/job-specs/applied`),
    fetch(`${API_BASE}/repository/job-specs/interview`),
    fetch(`${API_BASE}/repository/job-specs/offers`),
    fetch(`${API_BASE}/repository/job-specs/discarded`),
  ]);

  if (!rRes.ok) throw new Error('Failed to load received specs');
  if (!aRes.ok) throw new Error('Failed to load applied specs');
  if (!iRes.ok) throw new Error('Failed to load interview specs');
  if (!oRes.ok) throw new Error('Failed to load offers');
  if (!dRes.ok) throw new Error('Failed to load discarded specs');

  const r = await rRes.json();
  const a = await aRes.json();
  const i = await iRes.json();
  const o = await oRes.json();
  const d = await dRes.json();

  return {
    received: Array.isArray(r) ? r.length : 0,
    applied: Array.isArray(a) ? a.length : 0,
    interview: Array.isArray(i) ? i.length : 0,
    offers: Array.isArray(o) ? o.length : 0,
    discarded: Array.isArray(d) ? d.length : 0,
  };
}

export async function listReceivedJobSpecs() {
  const res = await fetch(`${API_BASE}/repository/job-specs/received`);
  if (!res.ok) throw new Error('Failed to load received specs');
  return res.json();
}

export async function listAppliedJobSpecs() {
  const res = await fetch(`${API_BASE}/repository/job-specs/applied`);
  if (!res.ok) throw new Error('Failed to load applied specs');
  return res.json();
}

export async function listInterviewJobSpecs() {
  const res = await fetch(`${API_BASE}/repository/job-specs/interview`);
  if (!res.ok) throw new Error('Failed to load interview specs');
  return res.json();
}

export async function listDiscardedJobSpecs() {
  const res = await fetch(`${API_BASE}/repository/job-specs/discarded`);
  if (!res.ok) throw new Error('Failed to load discarded specs');
  return res.json();
}
