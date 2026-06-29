import { API_BASE } from '../config';

export async function updateApplication(payload: any) {
  const res = await fetch(`${API_BASE}/repository/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update application: ${res.status}`);
  return res.json();
}

export async function getApplicationsByJobSpec(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/repository/applications/by-job-spec/${jobSpecId}`);
  if (!res.ok) throw new Error('Failed to load applications by job spec');
  return res.json();
}
