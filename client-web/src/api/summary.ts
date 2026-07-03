import { API_BASE } from '../config';

type Counts = {
  received: number;
  applied: number;
  interview: number;
  offers: number;
  discarded: number;
};

const paths = {
  received: '/workflow/stages/received',
  applied: '/workflow/stages/applied',
  interview: '/workflow/stages/interview',
  offers: '/workflow/stages/offer',
  discarded: '/workflow/stages/discarded',
};

function buildUrl(path: string) {
  const url = `${API_BASE}${path}`;
  console.debug('[summary] fetch url:', url);
  return url;
}

async function fetchJson(url: string, errorMessage: string) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) {
    const body = await res.text().catch(() => 'unable to read body');
    throw new Error(`${errorMessage} (${res.status}): ${body}`);
  }
  return res.json();
}

export async function getJobSpecCounts(): Promise<Counts> {
  try {
    const [rRes, aRes, iRes, oRes, dRes] = await Promise.all([
      fetch(buildUrl(paths.received)),
      fetch(buildUrl(paths.applied)),
      fetch(buildUrl(paths.interview)),
      fetch(buildUrl(paths.offers)),
      fetch(buildUrl(paths.discarded)),
    ]);

    if (!rRes.ok) throw new Error(`Failed to load received specs (${rRes.status})`);
    if (!aRes.ok) throw new Error(`Failed to load applied specs (${aRes.status})`);
    if (!iRes.ok) throw new Error(`Failed to load interview specs (${iRes.status})`);
    if (!oRes.ok) throw new Error(`Failed to load offers (${oRes.status})`);
    if (!dRes.ok) throw new Error(`Failed to load discarded specs (${dRes.status})`);

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
  } catch (err) {
    console.error('[summary] getJobSpecCounts error:', err);
    throw err;
  }
}

export async function listReceivedJobSpecs() {
  return fetchJson(buildUrl(paths.received), 'Failed to load received specs');
}

export async function listAppliedJobSpecs() {
  return fetchJson(buildUrl(paths.applied), 'Failed to load applied specs');
}

export async function listInterviewJobSpecs() {
  return fetchJson(buildUrl(paths.interview), 'Failed to load interview specs');
}

export async function listOffersJobSpecs() {
  return fetchJson(buildUrl(paths.offers), 'Failed to load offer specs');
}

export async function listDiscardedJobSpecs() {
  return fetchJson(buildUrl(paths.discarded), 'Failed to load discarded specs');
}
