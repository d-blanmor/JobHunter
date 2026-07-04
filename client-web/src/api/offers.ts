import { API_BASE } from '../config';

export async function listAllOffers(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/offers?active_only=${IsActve}`);
  if (!res.ok) throw new Error('Failed to load offers');
  return res.json();
}

export async function getOffer(id: number) {
  const res = await fetch(`${API_BASE}/roles/offers/${id}`);
  if (!res.ok) throw new Error('Failed to load offer');
  return res.json();
}

export async function getOfferByJobSpec(id: number) {
  const res = await fetch(`${API_BASE}/roles/offers-by-jobspec/${id}`);
  if (!res.ok) throw new Error('Failed to load offer by job spec');
  return res.json();
}

export async function saveOffer(payload: any) {
  const res = await fetch(`${API_BASE}/roles/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save offer: ${res.status}`);
  return res.json();
}

export async function deleteOffer(id: number) {
  const res = await fetch(`${API_BASE}/roles/offers/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete offer: ${res.status}`);
  return res.json();
}

// Linked Benefits

export async function listAllOffersBenefits(offerId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/offers-benefits`);
  if (!res.ok) throw new Error('Failed to load offers benefits');
  return res.json();
}

export async function getOfferBenefit(offerId: number, benefitId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/offer-benefit/${offerId}/${benefitId}`);
  if (!res.ok) throw new Error('Failed to load offer benefit');
  return res.json();
}

export async function getOfferBenefits(offerId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/offer-benefits/${offerId}`);
  if (!res.ok) throw new Error('Failed to load offer benefits');
  return res.json();
}

export async function saveOfferBenefit(payload: any) {
  const res = await fetch(`${API_BASE}/roles/lnk/offer-benefit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save offer benefit: ${res.status}`);
  return res.json();
}

export async function deleteOfferBenefit(offerId: number, benefitId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/offers-benefits/${offerId}/${benefitId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete offer benefit: ${res.status}`);
  return res.json();
}

export async function deleteOfferBenefits(offerId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/offer-benefits/${offerId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete offer benefits: ${res.status}`);
  return res.json();
}
