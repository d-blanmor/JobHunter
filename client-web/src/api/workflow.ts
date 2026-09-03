import { API_BASE } from '../config';

export async function listJobSpecs(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/workflow/jobspecs?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function inStageReceived(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/workflow/stages/received?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function inStageApplied(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/workflow/stages/applied?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function inStageInterview(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/workflow/stages/interview?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function inStageOffer(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/workflow/stages/offer?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

export async function inStageDiscarded(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/workflow/stages/discarded?active_only=${IsActve}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load sources: ${res.status}`);
    return "()";
  }
  return res.json();
}

