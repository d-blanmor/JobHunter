import { listLocations } from '../api/lu_locations';
import { getPlaceOfWork } from '../api/place_of_work';
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

export async function getPlaceOfWorkLabel(placeOfWorkId: number) {
  try {
    const [
      placeOfWork, 
      luLocations
    ] = await Promise.all([
      getPlaceOfWork(placeOfWorkId),
      listLocations()
    ]);
    const location = placeOfWork ? luLocations.find((item: luLocationItem) => item.Id === placeOfWork.LocationId) : null;
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


