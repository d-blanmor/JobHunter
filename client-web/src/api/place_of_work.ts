import { API_BASE } from '../config';

export async function listPlacesOfWork(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/places-of-work?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load places of work: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function getPlaceOfWork(id: number) {
  const res = await fetch(`${API_BASE}/roles/places-of-work/${id}`);
  if (!res.ok) throw new Error(`Failed to load place of work: ${res.status}`);
  return res.json();
}

export async function savePlaceOfWork(payload: any) {
  const res = await fetch(`${API_BASE}/roles/places-of-work`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save place of work: ${res.status}`);
  return res.json();
}

export async function deletePlaceOfWork(id: number) {
  const res = await fetch(`${API_BASE}/roles/places-of-work/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete place of work: ${res.status}`);
  return res.json();
}
