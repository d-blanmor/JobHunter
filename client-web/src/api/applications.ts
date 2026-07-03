import { API_BASE } from '../config';

export async function updateApplication(payload: any) {
  const res = await fetch(`${API_BASE}/roles/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update application: ${res.status}`);
  return res.json();
}

export async function getApplicationsByJobSpec(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/applications-by-jobspec/{jobspec_id}`);
  if (!res.ok) throw new Error('Failed to load applications by job spec');
  return res.json();
}

export async function listAllApplications() {
  const res = await fetch(`${API_BASE}/roles/applications?active_only=true`);
  if (!res.ok) throw new Error('Failed to load applications');
  return res.json();
}

export async function listAllInterviews() {
  const res = await fetch(`${API_BASE}/roles/interviews?active_only=true`);
  if (!res.ok) throw new Error('Failed to load interviews');
  return res.json();
}

export async function listAllOffers() {
  const res = await fetch(`${API_BASE}/roles/offers?active_only=true`);
  if (!res.ok) throw new Error('Failed to load offers');
  return res.json();
}
