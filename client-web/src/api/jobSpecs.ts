import { API_BASE } from '../config';

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function normalizeLookupResponse(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const candidates = [
      (value as any).Items,
      (value as any).items,
      (value as any).Data,
      (value as any).data,
      (value as any).Results,
      (value as any).results,
      (value as any).Value,
      (value as any).value,
      (value as any).List,
      (value as any).list,
      (value as any).Sources,
      (value as any).WorkModels,
      (value as any).RoleTypes,
      (value as any).PlacesOfWork,
      (value as any).Tags,
    ];
    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }
    const firstArray = Object.values(value).find(Array.isArray) as any[] | undefined;
    if (firstArray) return firstArray;
  }
  return [];
}

async function fetchLookupList(endpoints: string[], errorLabel: string) {
  let lastError: Error | null = null;
  for (const url of endpoints) {
    const res = await fetch(url);
    if (!res.ok) {
      lastError = new Error(`Failed to load ${errorLabel} from ${url} (${res.status})`);
      continue;
    }

    const json = await res.json();
    const normalized = normalizeLookupResponse(json);
    const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV;
    if (isDev && normalized.length === 0 && json && typeof json === 'object') {
      console.warn(`Lookup ${errorLabel} returned an unexpected payload shape`, json);
    }
    return normalized;
  }

  throw lastError ?? new Error(`Failed to load ${errorLabel}`);
}

export async function getJobSpecById(id: number) {
  const res = await fetch(`${API_BASE}/roles/job-specs/${id}`);
  if (!res.ok) throw new Error('Failed to load job spec');
  return res.json();
}

export async function saveJobSpec(payload: any) {
  const res = await fetch(`${API_BASE}/roles/job-specs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save job spec: ${res.status}`);
  return parseJsonResponse(res);
}

export async function listSources() {
  return fetchLookupList(
    [
      `${API_BASE}/roles/lookup/sources?active_only=true`,
      `${API_BASE}/roles/sources?active_only=true`,
    ],
    'sources',
  );
}

export async function listWorkModels() {
  return fetchLookupList(
    [
      `${API_BASE}/roles/lookup/work-models?active_only=true`,
      `${API_BASE}/roles/work-models?active_only=true`,
    ],
    'work models',
  );
}

export async function listRoleTypes() {
  return fetchLookupList(
    [
      `${API_BASE}/roles/lookup/role-types?active_only=true`,
      `${API_BASE}/roles/role-types?active_only=true`,
    ],
    'role types',
  );
}

export async function listPlacesOfWork() {
  return fetchLookupList(
    [
      `${API_BASE}/roles/lookup/places-of-work?active_only=true`,
      `${API_BASE}/roles/places-of-work?active_only=true`,
    ],
    'places of work',
  );
}

export async function listContacts() {
  return fetchLookupList(
    [
      `${API_BASE}/roles/lookup/contacts?active_only=true`,
      `${API_BASE}/roles/contacts?active_only=true`,
      `${API_BASE}/repository/Contact?active_only=true`,
      `${API_BASE}/repository/contact?active_only=true`,
      `${API_BASE}/contacts?active_only=true`,
    ],
    'contacts',
  );
}

export async function softDeleteJobSpec(id: number) {
  const jobSpec = await getJobSpecById(id);
  const payload = {
    ...jobSpec,
    Id: id,
    IsActive: false,
  };
  return saveJobSpec(payload);
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
  return parseJsonResponse(res);
}

export async function createPlaceOfWork(payload: any) {
  const res = await fetch(`${API_BASE}/roles/places-of-work`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create place of work: ${res.status}`);
  return parseJsonResponse(res);
}

export async function createContact(payload: any) {
  const endpoints = [
    `${API_BASE}/roles/contacts`,
    `${API_BASE}/repository/Contact`,
    `${API_BASE}/repository/contact`,
    `${API_BASE}/contacts`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) continue;
      return parseJsonResponse(res);
    } catch (err) {
      // try next endpoint
      continue;
    }
  }
  throw new Error('Failed to create contact');
}
