import { API_BASE } from '../config';

export async function listBenefits(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/lookup/benefits?active_only=${IsActve}`);
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

// Linked Jobspecs

export async function getJobSpecsBenefit(benefitId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspecs-benefit/${benefitId}`);
  if (!res.ok) throw new Error('Failed to load benefit job specs');
  return res.json();
}

export async function deleteJobSpecsByBenefit(benefitId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspecs-benefit/${benefitId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete job specs ny benefit: ${res.status}`);
  return res.json();
}

// Linked Offers

export async function getOffersBenefit(benefitId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/offers-benefit/${benefitId}`);
  if (!res.ok) throw new Error('Failed to load benefit offers');
  return res.json();
}

export async function deleteOffersByBenefit(benefitId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/offers-benefit/${benefitId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete job specs ny benefit: ${res.status}`);
  return res.json();
}
