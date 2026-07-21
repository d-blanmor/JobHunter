import { API_BASE } from '../config';

export async function listSources(IsActive: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/sources?active_only=${IsActive}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function listMainSources(IsActive: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/sources-main?active_only=${IsActive}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function getSource(id: number) {
  const res = await fetch(`${API_BASE}/roles/sources/${id}`);
  if (!res.ok) throw new Error(`Failed to load source: ${res.status}`);
  return res.json();
}

export async function getSourceByParent(parentId: number) {
  const res = await fetch(`${API_BASE}/roles/sources/by-parent?/${parentId}`);
  if (!res.ok) throw new Error(`Failed to load source: ${res.status}`);
  return res.json();
}

export async function saveSource(payload: any) {
  const res = await fetch(`${API_BASE}/roles/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save source: ${res.status}`);
  return res.json();
}

export async function deleteSource(id: number) {
  const res = await fetch(`${API_BASE}/roles/sources/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete source: ${res.status}`);
  return res.json();
}
