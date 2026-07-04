import { API_BASE } from '../config';

export async function listWorkModels() {
  const res = await fetch(`${API_BASE}/roles/lookup/work-models?active_only=true`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load work models: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function getWorkModel(id: number) {
  const res = await fetch(`${API_BASE}/roles/lookup/work-models/${id}`);
  if (!res.ok) throw new Error(`Failed to load work model: ${res.status}`);
  return res.json();
}

export async function saveWorkModel(payload: any) {
  const res = await fetch(`${API_BASE}/roles/lookup/work-models`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save work model: ${res.status}`);
  return res.json();
}

export async function deleteWorkModel(id: number) {
  const res = await fetch(`${API_BASE}/roles/lookup/work-models/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete work model: ${res.status}`);
  return res.json();
}
