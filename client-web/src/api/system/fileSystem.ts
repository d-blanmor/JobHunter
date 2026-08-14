import { encodeURI } from '../../defs/tools'
import { API_BASE } from '../../config';

export async function checkFileSystem(path: string) {
  const res = await fetch(`${API_BASE}/system/check/filesystem/${encodeURI(path)}`);
  if (!res.ok) throw new Error('Failed to check filesystem');
  return res.json();
}

export async function listFiles(path: string, filter: string) {
  const res = await fetch(`${API_BASE}/system/list/files/${encodeURI(path)}/${encodeURI(filter)}`);
  if (!res.ok) throw new Error('Failed to list files');
  return res.json();
}
