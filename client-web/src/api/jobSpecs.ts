import { API_BASE } from '../config';

export async function saveJobSpec(payload: any) {
  const res = await fetch(`${API_BASE}/roles/job-specs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save job spec: ${res.status}`);
  return res.json();
}

export async function listSources() {
  const res = await fetch(`${API_BASE}/roles/sources?active_only=true`);
  if (!res.ok) throw new Error('Failed to load sources');
  return res.json();
}

export async function listWorkModels() {
  const res = await fetch(`${API_BASE}/roles/lookup/work-models?active_only=true`);
  if (!res.ok) throw new Error('Failed to load work models');
  return res.json();
}

export async function listRoleTypes() {
  const res = await fetch(`${API_BASE}/roles/lookup/role-types?active_only=true`);
  if (!res.ok) throw new Error('Failed to load role types');
  return res.json();
}

export async function listPlacesOfWork() {
  const endpoints = [
    `${API_BASE}/roles/places-of-work?active_only=true`,
    `${API_BASE}/roles/lookup/places-of-work?active_only=true`,
  ];

  let lastError: Error | null = null;
  for (const url of endpoints) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    lastError = new Error(`Failed to load places of work from ${url} (${res.status})`);
  }

  throw lastError ?? new Error('Failed to load places of work');
}

export async function getJobSpecById(id: number) {
  const res = await fetch(`${API_BASE}/roles/job-specs/${id}`);
  if (!res.ok) throw new Error('Failed to load job spec');
  return res.json();
}

export async function listTags() {
  const res = await fetch(`${API_BASE}/tags?active_only=true`);
  if (!res.ok) throw new Error('Failed to load tags');
  return res.json();
}

export async function listJobSpecTags(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspec-tags/${jobSpecId}`);
  if (!res.ok) throw new Error('Failed to load job spec tags');
  return res.json();
}

export async function listInterviews() {
  const res = await fetch(`${API_BASE}/roles/interviews?active_only=true`);
  if (!res.ok) throw new Error('Failed to load interviews');
  return res.json();
}

export async function listOffers() {
  const res = await fetch(`${API_BASE}/roles/offers?active_only=true`);
  if (!res.ok) throw new Error('Failed to load offers');
  return res.json();
}

export async function createSource(payload: any) {
  const res = await fetch(`${API_BASE}/roles/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create source: ${res.status}`);
  return res.json();
}

export async function createPlaceOfWork(payload: any) {
  const res = await fetch(`${API_BASE}/roles/places-of-work`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create place of work: ${res.status}`);
  return res.json();
}
