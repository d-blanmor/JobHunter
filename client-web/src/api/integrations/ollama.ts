import { API_BASE } from '../../config';

export async function ollamaListModels() {
  const res = await fetch(`${API_BASE}/external/ollama/get-models`);
  if (!res.ok) throw new Error('Failed to get ollama list models');
  return res.json();
}

export async function ollamaCheckJobSpec(payload: any) {
  const res = await fetch(`${API_BASE}/external/ollama/check-jobspec`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to check job spec in ollama: ${res.status}`);
  return res.json();
}

export async function ollamaCheckJobSpecProfile(payload: any) {
  const res = await fetch(`${API_BASE}/external/ollama/check-jobspec-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to check job spec in ollama: ${res.status}`);
  return res.json();
}

export async function ollamaCoverLetter(payload: any) {
  const res = await fetch(`${API_BASE}/external/ollama/get-coverletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to check job spec in ollama: ${res.status}`);
  return res.json();
}
