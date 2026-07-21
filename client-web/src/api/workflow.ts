import { API_BASE } from '../config';

export async function inStageReceived() {
  const res = await fetch(`${API_BASE}/workflow/stages/received`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function inStageApplied() {
  const res = await fetch(`${API_BASE}/workflow/stages/applied`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function inStageInterview() {
  const res = await fetch(`${API_BASE}/workflow/stages/interview`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function inStageOffer() {
  const res = await fetch(`${API_BASE}/workflow/stages/offer`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function inStageDiscarded() {
  const res = await fetch(`${API_BASE}/workflow/stages/discarded`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

