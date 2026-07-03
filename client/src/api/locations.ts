import { API_BASE } from '../config';

export async function listLocations() {
  const res = await fetch(`${API_BASE}/roles/lookup/locations?active_only=true`);
  if (!res.ok) throw new Error(`Failed to load locations: ${res.status}`);
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

export async function deleteLocation(id: number) {
  const res = await fetch(`${API_BASE}/roles/lookup/locations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete location: ${res.status}`);
  return res.json();
}
