import { API_BASE } from '../config';

export async function listAllSettings(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/app-settings?active_only=${IsActve}`);
  if (!res.ok) throw new Error('Failed to load settings');
  return res.json();
}

export async function getSetting(key: string) {
  const res = await fetch(`${API_BASE}/roles/app-settings/${key}`);
  if (!res.ok) {
    if (res.status != 404) throw new Error(`Failed to load setting ${key}`);
    return '';
  }
  return res.json();
}

export async function saveSetting(key: string, value: string | '', Notes: string | '') {
  const payload: any = {
    "Key": `${key}`,
    "Value": `${value}`,
    "Notes": `${Notes}`,
    "IsActive": true
  };
  const res = await fetch(`${API_BASE}/app-settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save setting: ${res.status}`);
  return res.json();
}

export async function deleteSetting(key: string) {
  const res = await fetch(`${API_BASE}/app-settings/${key}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete setting: ${res.status}`);
  return res.json();
}
