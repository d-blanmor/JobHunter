import { API_BASE } from '../config';

export async function listTags() {
  const res = await fetch(`${API_BASE}/tags?active_only=true`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to delete tag: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function getTag(id: number) {
  const res = await fetch(`${API_BASE}/tags/${id}`);
  if (!res.ok) throw new Error(`Failed to load tag: ${res.status}`);
  return res.json();
}

export async function saveTag(payload: any) {
  const res = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save tag: ${res.status}`);
  return res.json();
}

export async function deleteTag(id: number) {
  const res = await fetch(`${API_BASE}/tags/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete tag: ${res.status}`);
  return res.json();
}
