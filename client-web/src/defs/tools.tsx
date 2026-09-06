import { listBenefits } from '../api/lu_benefits';

import { 
  JobSpecItem, 
  ApplicationItem,
  SourceItem, 
  PlaceOfWorkItem,
  luLocationItem, 
  luWorkModelItem,
  luRoleTypeItem,
  ContactItem, 
  TagItem,
  luBenefitItem,
  } from '../defs/interfaces';

function _pad(value: number) {
  return value.toString().padStart(2, '0');
}

export function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${_pad(date.getDate())}/${_pad(date.getMonth() + 1)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
}

export function formatDateOnly(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${_pad(date.getDate())}/${_pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${_pad(date.getDate())}/${_pad(date.getMonth() + 1)}/${date.getFullYear()} ${_pad(date.getHours())}:${_pad(date.getMinutes())}`;
}

export function formatFieldDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getFullYear()}-${_pad(date.getMonth() + 1)}-${_pad(date.getDate())}`;
}

export function formatFieldDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.getFullYear()}-${_pad(date.getMonth() + 1)}-${_pad(date.getDate())} ${_pad(date.getHours())}:${_pad(date.getMinutes())}:00`;
}

export function safeValue(value: any) {
  return value === null || value === undefined || value === '' ? '—' : value;
}

export function getLocation(locationId:number, lLocations: luLocationItem[]) {
    return lLocations.find(loc => loc.Id === locationId);
  }

export function getPlaceOfWork(powId: number, lPlacesOfWork: PlaceOfWorkItem[]) {
    return lPlacesOfWork.find(pow => pow.Id === powId);
  };

export function getPlaceOfWorkLabel(placeOfWorkId: number, lPlacesOfWork: PlaceOfWorkItem[], lLocations: luLocationItem[]) {
  try {
    const placeOfWork = getPlaceOfWork(placeOfWorkId, lPlacesOfWork);
    const location = placeOfWork ? getLocation(placeOfWork.LocationId, lLocations) : null;
    var locationLabel = '';

    if (location) {
      locationLabel = location.Country;
      if (location.City && location.City != '') {
        locationLabel = locationLabel + ` - ${location.City?.trim()}`;
      }
    }
    if (placeOfWork?.Address && placeOfWork.Address.trim() != ''){
      locationLabel = locationLabel + ` (${placeOfWork.Address?.trim()})`;
    }
    return locationLabel;
  }
  catch (err) {
    return (err instanceof Error ? err.message : 'Failed formating place of work');
  } 
}

export function getContactDetails(contactId: number, lContacts: ContactItem[]) {
    return lContacts.find(c => c.Id === contactId);
  };

export function getSourceItem(spec: any, sources: SourceItem[]) {
  return sources.find((item) => item.Id === spec.SourceId) || null;
}

export function getWorkModelItem(spec: any, models: luWorkModelItem[]) {
  return models.find((item) => item.Id === spec.WorkModelId) || null;
};

export function getRoleTypeItem(spec: any, roleTypes: luRoleTypeItem[]) {
  return roleTypes.find((item) => item.Id === spec.RoleTypeId) || null;
}

export function getContactItem(contactId: any, contacts: ContactItem[]) {
  const contact = contacts.find((item) => item.Id === contactId);
  if (!contact) return null;
  return contact;
}

export function normalizeBenefits(value: any) {
  if (!value) return '—';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '—';
  if (typeof value === 'string') return value.trim() || '—';
  return String(value);
}

export function encodeURI(str: string): string {
  return encodeURIComponent(str);
}

export const fetchAllBenefits = async () => {
  try {
    const data = await listBenefits();
    if (data === '()' || data == null) {
      return [] as any[];
    }
    const benefits = Array.isArray(data) ? data : (data?.data ?? []);
    return benefits;
  } catch (err) {
    return (err instanceof Error ? err.message : 'Failed to load benefits');
  }
};

export function formatShortDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${_pad(date.getDate())}/${_pad(date.getMonth() + 1)}/${String(date.getFullYear()).slice(-2)}`;
}

export function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

