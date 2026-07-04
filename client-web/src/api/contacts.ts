import { API_BASE } from '../config';

export async function listContacts(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/lookup/contacts?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load contacts: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function getContact(id: number) {
  const res = await fetch(`${API_BASE}/roles/lookup/contacts/${id}`);
  if (!res.ok) throw new Error(`Failed to load contact: ${res.status}`);
  return res.json();
}

export async function saveContact(payload: any) {
  const res = await fetch(`${API_BASE}/roles/lookup/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save contact: ${res.status}`);
  return res.json();
}

export async function deleteContact(id: number) {
  const res = await fetch(`${API_BASE}/roles/lookup/contacts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete contact: ${res.status}`);
  return res.json();
}
