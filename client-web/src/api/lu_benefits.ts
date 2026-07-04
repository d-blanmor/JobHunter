import { API_BASE } from '../config';

export async function listBenefits() {
  const res = await fetch(`${API_BASE}/roles/lookup/benefits?active_only=true`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load benefits: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function getBenefit(id: number) {
  const res = await fetch(`${API_BASE}/roles/lookup/benefits/${id}`);
  if (!res.ok) throw new Error(`Failed to load benefit: ${res.status}`);
  return res.json();
}

export async function saveBenefit(payload: any) {
  const res = await fetch(`${API_BASE}/roles/lookup/benefits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save benefit: ${res.status}`);
  return res.json();
}

export async function deleteBenefit(id: number) {
  const res = await fetch(`${API_BASE}/roles/lookup/benefits/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete benefit: ${res.status}`);
  return res.json();
}
