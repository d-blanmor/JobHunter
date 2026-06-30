import { API_BASE } from '../config';

export async function saveJobSpec(payload: any) {
  const res = await fetch(`${API_BASE}/job-specs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save job spec: ${res.status}`);
  return res.json();
}

export async function listSources() {
  const res = await fetch(`${API_BASE}/sources?active_only=true`);
  if (!res.ok) throw new Error('Failed to load sources');
  return res.json();
}

export async function listWorkModels() {
  const res = await fetch(`${API_BASE}/lookup/work-models?active_only=true`);
  if (!res.ok) throw new Error('Failed to load work models');
  return res.json();
}

export async function listRoleTypes() {
  const res = await fetch(`${API_BASE}/lookup/role-types?active_only=true`);
  if (!res.ok) throw new Error('Failed to load role types');
  return res.json();
}

export async function listPlacesOfWork() {
  const res = await fetch(`${API_BASE}/places-of-work?active_only=true`);
  if (!res.ok) throw new Error('Failed to load places of work');
  return res.json();
}

export async function createSource(payload: any) {
  const res = await fetch(`${API_BASE}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create source: ${res.status}`);
  return res.json();
}

export async function createPlaceOfWork(payload: any) {
  const res = await fetch(`${API_BASE}/places-of-work`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create place of work: ${res.status}`);
  return res.json();
}
