import { API_BASE } from '../config';

export async function listRoleTypes(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/lookup/role-types?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load role types: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function getRoleType(id: number) {
  const res = await fetch(`${API_BASE}/roles/lookup/role-types/${id}`);
  if (!res.ok) throw new Error(`Failed to load role type: ${res.status}`);
  return res.json();
}

export async function saveRoleType(payload: any) {
  const res = await fetch(`${API_BASE}/roles/lookup/role-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save role type: ${res.status}`);
  return res.json();
}

export async function deleteRoleType(id: number) {
  const res = await fetch(`${API_BASE}/roles/lookup/role-types/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete role type: ${res.status}`);
  return res.json();
}
