import { API_BASE } from '../config';

export async function listTags(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/tags?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to list tags: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function getTag(id: number) {
  const res = await fetch(`${API_BASE}/tags/${id}`);
  if (!res.ok) throw new Error(`Failed to load tag: ${res.status}`);
  return res.json();
}

export async function getTagByName(tagName: string) {
  const res = await fetch(`${API_BASE}/tags/by-name/${tagName}`);
  if (!res.ok) throw new Error(`Failed to load tag: ${res.status}`);
  return res.json();
}

export async function getTagByContext(tagContext: string) {
  const res = await fetch(`${API_BASE}/tags/by-context/${tagContext}`);
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

// Linked JobSpecs

export async function getJobSpecsByTag(tagId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspecs-tag/${tagId}`);
  if (!res.ok) throw new Error('Failed to load tag job specs');
  return res.json();
}

export async function deleteJobSpecsByTag(tagId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspecs-tag/${tagId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete job specs tag: ${res.status}`);
  return res.json();
}

