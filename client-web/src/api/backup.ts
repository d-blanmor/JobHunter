import { encodeURI } from '../defs/tools'
import { API_BASE } from '../config';

export async function systemExportFile(outFile: string = '', IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/backup/system/export-file?file_path=${outFile}&active_only=${IsActve}`);
  if (!res.ok) throw new Error(`Failed to to export system to file ${outFile}`);
  return res.json();
}

export async function systemImportFile(inFile: string) {
  const res = await fetch(`${API_BASE}/backup/system/import-file?file_path=${encodeURI(inFile)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to import system from file ${inFile}`);
  return res.json();
}

export async function rolesExportFile(outFile: string = '', IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/backup/roles/export-file?file_path=${outFile}&active_only=${IsActve}`);
  if (!res.ok) throw new Error(`Failed to to export roles to file ${outFile}`);
  return res.json();
}

export async function rolesImportFile(inFile: string) {
  const res = await fetch(`${API_BASE}/backup/roles/import-file?file_path=${encodeURI(inFile)}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to import roles from file ${inFile}`);
  return res.json();
}
