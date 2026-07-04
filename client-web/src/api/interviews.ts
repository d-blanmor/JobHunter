import { API_BASE } from '../config';

export async function listAllInterviews(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/interviews?active_only=${IsActve}`);
  if (!res.ok) throw new Error('Failed to load interviews');
  return res.json();
}

export async function getInterview(id: number) {
  const res = await fetch(`${API_BASE}/roles/interviews/${id}`);
  if (!res.ok) throw new Error('Failed to load interview');
  return res.json();
}

export async function getInterviewByJobSpec(id: number) {
  const res = await fetch(`${API_BASE}/roles/interviews-by-jobspec/${id}`);
  if (!res.ok) throw new Error('Failed to load interview by job spec');
  return res.json();
}

export async function saveInterview(payload: any) {
  const res = await fetch(`${API_BASE}/roles/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save interview: ${res.status}`);
  return res.json();
}

export async function deleteInterview(id: number) {
  const res = await fetch(`${API_BASE}/roles/interviews/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete interview: ${res.status}`);
  return res.json();
}
