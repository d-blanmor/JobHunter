import { API_BASE } from '../config';

export async function listAllJobSpecs(IsActve: boolean = true) {
  const res = await fetch(`${API_BASE}/roles/job-specs?active_only=${IsActve}`);
  if (!res.ok) throw new Error('Failed to load job specs');
  return res.json();
}

export async function getJobSpec(id: number) {
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
  return res.json();
}

export async function deleteJobSpec(id: number) {
  const res = await fetch(`${API_BASE}/roles/job-specs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete job spec: ${res.status}`);
  return res.json();
}

// Linked Benefits

export async function listAllJobSpecsBenefits() {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspecs-benefits`);
  if (!res.ok) throw new Error('Failed to load job specs benefits');
  return res.json();
}

export async function getJobSpecBenefit(jobSpecId: number, benefitId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspec-benefit/${jobSpecId}/${benefitId}`);
  if (!res.ok) throw new Error('Failed to load job spec benefit');
  return res.json();
}

export async function getJobSpecBenefits(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspec-benefits/${jobSpecId}`);
  if (!res.ok) throw new Error('Failed to load job spec benefits');
  return res.json();
}

export async function saveJobSpecBenefit(payload: any) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspec-benefit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save job spec benefit: ${res.status}`);
  return res.json();
}

export async function deleteJobSpecBenefit(jobSpecId: number, benefitId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspecs-benefits/${jobSpecId}/${benefitId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete job spec benefit: ${res.status}`);
  return res.json();
}

export async function deleteJobSpecBenefits(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspec-benefits/${jobSpecId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete job spec benefits: ${res.status}`);
  return res.json();
}

// Linked Tags

export async function listAllJobSpecsTags() {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspecs-tags`);
  if (!res.ok) throw new Error('Failed to load job specs tags');
  return res.json();
}

export async function getJobSpecTag(jobSpecId: number, tagId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspec-tag/${jobSpecId}/${tagId}`);
  if (!res.ok) throw new Error('Failed to load job spec tag');
  return res.json();
}

export async function getJobSpecTags(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspec-tags/${jobSpecId}`);
  if (!res.ok) throw new Error('Failed to load job spec tags');
  return res.json();
}

export async function saveJobSpecTag(payload: any) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspec-tag`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save job spec tag: ${res.status}`);
  return res.json();
}

export async function deleteJobSpecTag(jobSpecId: number, tagId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspecs-tags/${jobSpecId}/${tagId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete job spec tag: ${res.status}`);
  return res.json();
}

export async function deleteJobSpecTags(jobSpecId: number) {
  const res = await fetch(`${API_BASE}/roles/lnk/jobspec-tags/${jobSpecId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete job spec tags: ${res.status}`);
  return res.json();
}
