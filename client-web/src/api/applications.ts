import { API_BASE } from '../config';

async function parseJsonResponse(res: Response) {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function updateApplication(payload: any) {
  const res = await fetch(`${API_BASE}/roles/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update application: ${res.status}`);
  return parseJsonResponse(res);
}

export async function createApplication(payload: any) {
  const res = await fetch(`${API_BASE}/roles/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create application: ${res.status}`);
  return parseJsonResponse(res);
}

export async function getApplicationsByJobSpec(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/applications-by-jobspec/${jobSpecId}`);
  if (!res.ok) throw new Error('Failed to load applications by job spec');
  return res.json();
}

export async function getInterviewsByJobSpec(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/interviews-by-jobspec/${jobSpecId}`);
  if (!res.ok) throw new Error('Failed to load interviews by job spec');
  return res.json();
}

export async function getOffersByJobSpec(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/offers-by-jobspec/${jobSpecId}`);
  if (!res.ok) throw new Error('Failed to load offers by job spec');
  return res.json();
}

export async function getApplicationById(applicationId: number) {
  const endpoints = [
    `${API_BASE}/roles/applications/${applicationId}`,
    `${API_BASE}/repository/Application/${applicationId}`,
    `${API_BASE}/repository/application/${applicationId}`,
    `${API_BASE}/applications/${applicationId}`,
  ];
  for (const url of endpoints) {
    const res = await fetch(url);
    if (!res.ok) continue;
    return res.json();
  }
  throw new Error(`Failed to load application ${applicationId}`);
}

export async function listAllApplications() {
  const res = await fetch(`${API_BASE}/roles/applications?active_only=true`);
  if (!res.ok) throw new Error('Failed to load applications');
  return res.json();
}

export async function createInterview(payload: any) {
  const res = await fetch(`${API_BASE}/roles/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to create interview: ${res.status}`);
  return parseJsonResponse(res);
}

export async function listAllInterviews() {
  const res = await fetch(`${API_BASE}/roles/interviews?active_only=true`);
  if (!res.ok) throw new Error('Failed to load interviews');
  return res.json();
}

export async function getInterviewById(interviewId: number) {
  const endpoints = [
    `${API_BASE}/roles/interviews/${interviewId}`,
    `${API_BASE}/repository/Interview/${interviewId}`,
    `${API_BASE}/repository/interview/${interviewId}`,
    `${API_BASE}/interviews/${interviewId}`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      return res.json();
    } catch (err) {
      continue;
    }
  }
  throw new Error(`Failed to load interview ${interviewId}`);
}

export async function updateInterview(payload: any) {
  const res = await fetch(`${API_BASE}/roles/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update interview: ${res.status}`);
  return parseJsonResponse(res);
}

export async function createOffer(payload: any) {
  const endpoints = [
    `${API_BASE}/roles/offers`,
    `${API_BASE}/repository/Offer`,
    `${API_BASE}/repository/offer`,
    `${API_BASE}/offers`,
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
      continue;
    }
  }
  throw new Error('Failed to create offer');
}

export async function listAllOffers() {
  const res = await fetch(`${API_BASE}/roles/offers?active_only=true`);
  if (!res.ok) throw new Error('Failed to load offers');
  return res.json();
}

export async function getOfferById(offerId: number) {
  const endpoints = [
    `${API_BASE}/roles/offers/${offerId}`,
    `${API_BASE}/repository/Offer/${offerId}`,
    `${API_BASE}/repository/offer/${offerId}`,
    `${API_BASE}/offers/${offerId}`,
  ];
  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      return res.json();
    } catch (err) {
      continue;
    }
  }
  throw new Error(`Failed to load offer ${offerId}`);
}

export async function updateOffer(payload: any) {
  const res = await fetch(`${API_BASE}/roles/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update offer: ${res.status}`);
  return parseJsonResponse(res);
}
