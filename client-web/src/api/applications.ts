import { API_BASE } from '../config';

//async function parseJsonResponse(res: Response) {
//  const text = await res.text();
//  return text ? JSON.parse(text) : null;
//}

export async function listAllApplications(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/applications?active_only=${IsActve}`);
  if (!res.ok) throw new Error('Failed to load applications');
  return res.json();
}

export async function getApplication(id: number) {
  const res = await fetch(`${API_BASE}/roles/applications/${id}`);
  if (!res.ok) throw new Error(`Failed to load application ${id}`);
}

export async function getApplicationsByJobSpec(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/applications-by-jobspec/${jobSpecId}`);
  if (!res.ok) throw new Error('Failed to load applications by job spec');
  return res.json();
}

export async function saveLocation(payload: any) {
  const res = await fetch(`${API_BASE}/roles/lookup/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save location: ${res.status}`);
  return res.json();
}

export async function saveApplication(payload: any) {
  const res = await fetch(`${API_BASE}/roles/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save application: ${res.status}`);
  //return parseJsonResponse(res);
  return res.json();
}

export async function deleteApplication(id: number) {
  const res = await fetch(`${API_BASE}/roles/applications/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete application: ${res.status}`);
  return res.json();
}
