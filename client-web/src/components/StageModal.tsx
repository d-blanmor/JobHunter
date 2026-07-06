import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { inStageReceived, inStageApplied, inStageInterview, inStageOffer, inStageDiscarded } from '../api/workflow';
import { listWorkModels } from '../api/lu_workmodels';
import { listTags } from '../api/tags';
import { listRoleTypes } from '../api/lu_roletypes';
import { listContacts, saveContact } from '../api/contacts';
import { deleteJobSpec, getJobSpecTags } from '../api/jobSpecs';
import { listAllApplications, getApplication, saveApplication } from '../api/applications';
import { listAllInterviews, getInterview, saveInterview } from '../api/interviews';
import { listAllOffers, getOffer, saveOffer } from '../api/offers';
import { DEFAULT_PAGE_SIZE } from '../config';
import { Stage } from '../defs/types';

type StageItem = {
  Id: number;
  Position: string;
  Company: string;
  RoleTypeId: number | null;
  WorkModelId: number | null;
  Created: string | null;
  applicationDate: string | null;
  interviewDate: string | null;
  offerDate: string | null;
  discardedDate: string | null;
  ApplicationId: number | null;
  Application: any | null;
  InterviewId?: number | null;
  Interview?: any | null;
  OfferId?: number | null;
  Offer?: any | null;
  tagIds: number[];
  tagNames: string[];
};

type Props = {
  stage: Stage;
  title: string;
  open: boolean;
  onClose: () => void;
};

const stageDateLabels: Record<Stage, string> = {
  received: 'Recieved',
  applied: 'Applied',
  interview: 'Next Interview',
  offers: 'Offered',
  discarded: 'Discarded',
};

const PAGE_SIZE = DEFAULT_PAGE_SIZE;

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function formatShortDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${String(date.getFullYear()).slice(-2)}`;
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildJobSpecItem(
  spec: any,
  stage: Stage,
  applications: any[],
  interviews: any[],
  offers: any[],
  tagsMap: Map<number, string>,
  jobSpecTagIds: number[],
) {
  const applicationByJobSpec = applications.filter((app) => app.JobSpecId === spec.Id);
  const latestApplication = applicationByJobSpec.reduce((best, app) => {
    const next = parseDate(app.Applied);
    const current = best ? parseDate(best.Applied) : null;
    if (!current) return app;
    if (!next) return best;
    return next > current ? app : best;
  }, applicationByJobSpec[0] as any | undefined);

  const applicationIds = applicationByJobSpec.map((app) => app.Id);
  const interviewItems = interviews.filter((item) => applicationIds.includes(item.ApplicationId));
  const latestInterview = interviewItems.reduce((best, item) => {
    const next = parseDate(item.Scheduled);
    const current = best ? parseDate(best.Scheduled) : null;
    if (!current) return item;
    if (!next) return best;
    return next > current ? item : best;
  }, interviewItems[0] as any | undefined);

  const offerItems = offers.filter((item) => applicationIds.includes(item.ApplicationId));
  const latestOffer = offerItems.reduce((best, item) => {
    const next = parseDate(item.Offered);
    const current = best ? parseDate(best.Offered) : null;
    if (!current) return item;
    if (!next) return best;
    return next > current ? item : best;
  }, offerItems[0] as any | undefined);

  return {
    Id: spec.Id,
    Position: spec.Position ?? '',
    Company: spec.Company ?? '',
    RoleTypeId: spec.RoleTypeId ?? null,
    WorkModelId: spec.WorkModelId ?? null,
    Created: spec.Created ?? null,
    applicationDate: latestApplication?.Applied ?? null,
    interviewDate: latestInterview?.Scheduled ?? null,
    InterviewId: latestInterview?.Id ?? null,
    Interview: latestInterview ?? null,
    offerDate: latestOffer?.Offered ?? null,
    OfferId: latestOffer?.Id ?? null,
    Offer: latestOffer ?? null,
    discardedDate: latestApplication?.Discarded ?? null,
    ApplicationId: latestApplication?.Id ?? null,
    Application: latestApplication ?? null,
    tagIds: jobSpecTagIds,
    tagNames: jobSpecTagIds.map((id) => tagsMap.get(id) ?? 'Unknown'),
  };
}

function loadStageSpecs(stage: Stage) {
  switch (stage) {
    case 'received':
      return inStageReceived();
    case 'applied':
      return inStageApplied();
    case 'interview':
      return inStageInterview();
    case 'offers':
      return inStageOffer();
    case 'discarded':
      return inStageDiscarded();
  }
}

export default function StageModal({ stage, title, open, onClose }: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<StageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dateFrom, setDateFrom] = useState('');
  const [searchPosition, setSearchPosition] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [selectedRoleTypeIds, setSelectedRoleTypeIds] = useState<number[]>([]);
  const [selectedWorkModelIds, setSelectedWorkModelIds] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  const [roleTypes, setRoleTypes] = useState<any[]>([]);
  const [workModels, setWorkModels] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactFormError, setContactFormError] = useState<string | null>(null);
  const [contactCreating, setContactCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [interviewFormOpen, setInterviewFormOpen] = useState(false);
  const [activeApplicationId, setActiveApplicationId] = useState<number | null>(null);
  const [interviewSchedule, setInterviewSchedule] = useState('');
  const [interviewContactId, setInterviewContactId] = useState<number | null>(null);
  const [interviewNotes, setInterviewNotes] = useState('');
  const [interviewFormError, setInterviewFormError] = useState<string | null>(null);
  const [offerFormOpen, setOfferFormOpen] = useState(false);
  const [offerOfferedDate, setOfferOfferedDate] = useState('');
  const [offerSalary, setOfferSalary] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [offerFormError, setOfferFormError] = useState<string | null>(null);
  const [offerCreating, setOfferCreating] = useState(false);

  const loadStageData = async () => {
    let mounted = true;
    setLoading(true);
    setError(null);

    try {
      const [roleTypeData, workModelData, tagData] = await Promise.all([
        listRoleTypes(),
        listWorkModels(),
        listTags(),
      ]);

      let contactData: any[] = [];
      try {
        contactData = await listContacts();
      } catch (contactErr) {
        console.warn('[StageModal] failed to load contacts', contactErr);
      }

      if (!mounted) return;
      setRoleTypes(roleTypeData);
      setWorkModels(workModelData);
      setTags(tagData);
      setContacts(contactData);

      const stageJobSpecs = await loadStageSpecs(stage);
      const apps = ['applied', 'interview', 'offers', 'discarded'].includes(stage)
        ? await listAllApplications()
        : [];
      const interviews = stage === 'interview' ? await listAllInterviews() : [];
      const offers = stage === 'offers' ? await listAllOffers() : [];
      const tagMap = new Map<number, string>(
        tagData.map((tag: any): [number, string] => [Number(tag.Id), String(tag.Name)]),
      );

      const jobSpecTags = await Promise.all(
        stageJobSpecs.map(async (spec: any) => {
          try {
            const relations = await getJobSpecTags(spec.Id);
            return {
              id: spec.Id,
              tagIds: Array.isArray(relations)
                ? relations
                    .map((relation: any) => relation.TagId)
                    .filter((tagId) => typeof tagId === 'number')
                : [],
            };
          } catch (tagErr) {
            console.warn('[StageModal] failed loading tags for job spec', spec.Id, tagErr);
            return { id: spec.Id, tagIds: [] };
          }
        }),
      );

      if (!mounted) return;

      const itemsWithMeta = stageJobSpecs.map((spec: any) => {
        const specTags = jobSpecTags.find((relation) => relation.id === spec.Id);
        return buildJobSpecItem(spec, stage, apps, interviews, offers, tagMap, specTags?.tagIds ?? []);
      });

      setItems(itemsWithMeta);
    } catch (err) {
      if (!mounted) return;
      setError(err instanceof Error ? err.message : 'Failed to load stage items');
    } finally {
      if (!mounted) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadStageData();
  }, [open, stage]);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, searchPosition, searchCompany, selectedRoleTypeIds.join(','), selectedWorkModelIds.join(','), selectedTagIds.join(',')]);

  const stageDateLabel = stageDateLabels[stage];

  const handleCreateApplication = async (jobSpecId: number) => {
    setError(null);
    setActionLoadingId(jobSpecId);

    try {
      await saveApplication({
        JobSpecId: jobSpecId,
        Applied: new Date().toISOString(),
        IsActive: true,
      });
      await loadStageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create application');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSoftDeleteJobSpec = async (jobSpecId: number) => {
    if (!window.confirm('Are you sure you want to soft delete this Job Spec?')) return;
    setError(null);
    setActionLoadingId(jobSpecId);

    try {
      await deleteJobSpec(jobSpecId);
      await loadStageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job spec');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openInterviewForm = (applicationId: number) => {
    setActiveApplicationId(applicationId);
    setInterviewSchedule('');
    setInterviewContactId(null);
    setInterviewNotes('');
    setInterviewFormError(null);
    setInterviewFormOpen(true);
  };

  const openContactForm = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactNotes('');
    setContactFormError(null);
//    setContactFormOpen(true);
  };

  const openOfferForm = (applicationId: number) => {
    setActiveApplicationId(applicationId);
    // default offered date to today in YYYY-MM-DD
    setOfferOfferedDate(new Date().toISOString().slice(0, 10));
    setOfferSalary('');
    setOfferNotes('');
    setOfferFormError(null);
    setOfferFormOpen(true);
    setInterviewFormOpen(false);
  };

  const closeOfferForm = () => {
    setOfferFormOpen(false);
    setActiveApplicationId(null);
    setOfferOfferedDate('');
    setOfferSalary('');
    setOfferNotes('');
    setOfferFormError(null);
    setOfferCreating(false);
  };

  const handleCreateOffer = async () => {
    if (!activeApplicationId) {
      setOfferFormError('No application selected.');
      return;
    }
    if (!offerOfferedDate) {
      setOfferFormError('Offered date is required.');
      return;
    }
    setOfferFormError(null);
    setOfferCreating(true);
    try {
      await saveOffer({
        ApplicationId: activeApplicationId,
        Offered: new Date(offerOfferedDate).toISOString(),
        Salary: offerSalary || null,
        Notes: offerNotes || null,
        IsActive: true,
      });
      closeOfferForm();
      await loadStageData();
    } catch (err) {
      setOfferFormError(err instanceof Error ? err.message : 'Failed to create offer');
    } finally {
      setOfferCreating(false);
    }
  };

  const handleSoftDeleteInterview = async (interviewId: number) => {
    if (!window.confirm('Are you sure you want to soft delete this interview?')) return;
    setError(null);
    setActionLoadingId(interviewId);
    try {
      const interview = await getInterview(interviewId);
      const minimalPayload: any = {};
      for (const [key, value] of Object.entries(interview || {})) {
        if (value === null) {
          minimalPayload[key] = null;
        } else if (typeof value !== 'object') {
          minimalPayload[key] = value;
        }
      }
      minimalPayload.Id = interviewId;
      minimalPayload.IsActive = false;
      await saveInterview(minimalPayload);
      await loadStageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete interview');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSoftDeleteOffer = async (offerId: number) => {
    if (!window.confirm('Are you sure you want to soft delete this offer?')) return;
    setError(null);
    setActionLoadingId(offerId);
    try {
      const offer = await getOffer(offerId);
      const minimalPayload: any = {};
      for (const [key, value] of Object.entries(offer || {})) {
        if (value === null) {
          minimalPayload[key] = null;
        } else if (typeof value !== 'object') {
          minimalPayload[key] = value;
        }
      }
      minimalPayload.Id = offerId;
      minimalPayload.IsActive = false;
      console.debug('updateOffer payload', minimalPayload);
      await saveOffer(minimalPayload);
      await loadStageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete offer');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDiscardApplication = async (applicationId: number) => {
    if (!window.confirm('Mark this application as discarded?')) return;
    setError(null);
    setActionLoadingId(applicationId);
    try {
      const application = await getApplication(applicationId);
      const minimalPayload: any = {};
      for (const [key, value] of Object.entries(application || {})) {
        if (value === null) {
          minimalPayload[key] = null;
        } else if (typeof value !== 'object') {
          minimalPayload[key] = value;
        }
      }
      minimalPayload.Id = applicationId;
      const iso = new Date().toISOString();
      minimalPayload.Discarded = iso;
      minimalPayload.DiscardedDate = iso;
      console.debug('updateApplication discard payload', minimalPayload);
      await saveApplication(minimalPayload);
      await loadStageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discard application');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRestoreApplication = async (applicationId: number) => {
    if (!window.confirm('Restore this application (clear discarded date)?')) return;
    setError(null);
    setActionLoadingId(applicationId);
    try {
      const application = await getApplication(applicationId);
      const minimalPayload: any = {};
      for (const [key, value] of Object.entries(application || {})) {
        if (value === null) {
          minimalPayload[key] = null;
        } else if (typeof value !== 'object') {
          minimalPayload[key] = value;
        }
      }
      minimalPayload.Id = applicationId;
      minimalPayload.Discarded = null;
      minimalPayload.DiscardedDate = null;
      console.debug('updateApplication restore payload', minimalPayload);
      await saveApplication(minimalPayload);
      await loadStageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore application');
    } finally {
      setActionLoadingId(null);
    }
  };

  const closeContactForm = () => {
    setContactFormOpen(false);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactNotes('');
    setContactFormError(null);
    setContactCreating(false);
  };

  const handleCreateContact = async () => {
    if (!contactName.trim()) {
      setContactFormError('Name is required');
      return;
    }
    setContactFormError(null);
    setContactCreating(true);
    try {
      const payload = {
        Name: contactName.trim(),
        Email: contactEmail.trim() || null,
        Phone: contactPhone.trim() || null,
        Details: contactNotes.trim() || null,
        IsActive: true,
      };
      const created = await saveContact(payload);
      const newContact = created ?? payload;
      setContacts((prev) => [newContact, ...prev]);
      const newId = newContact.Id ?? newContact.id ?? null;
      if (newId) setInterviewContactId(Number(newId));
      // Close contact form then ensure the interview form remains open so user can continue creating the interview.
      closeContactForm();
      setInterviewFormOpen(true);
    } catch (err) {
      setContactFormError(err instanceof Error ? err.message : 'Failed to create contact');
    } finally {
      setContactCreating(false);
    }
  };

  const closeInterviewForm = () => {
    setInterviewFormOpen(false);
    setActiveApplicationId(null);
    setInterviewSchedule('');
    setInterviewContactId(null);
    setInterviewNotes('');
    setInterviewFormError(null);
  };

  const handleCreateInterview = async () => {
    if (!activeApplicationId) {
      setInterviewFormError('No application selected.');
      return;
    }
    if (!interviewSchedule) {
      setInterviewFormError('Schedule date is required.');
      return;
    }

    setError(null);
    setInterviewFormError(null);
    setActionLoadingId(activeApplicationId);

    try {
      await saveInterview({
        ApplicationId: activeApplicationId,
        Scheduled: new Date(interviewSchedule).toISOString(),
        ContactId: interviewContactId,
        Notes: interviewNotes,
        IsActive: true,
      });
      closeInterviewForm();
      await loadStageData();
    } catch (err) {
      setInterviewFormError(err instanceof Error ? err.message : 'Failed to create interview');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSoftDeleteApplication = async (applicationId: number) => {
    if (!window.confirm('Are you sure you want to soft delete this application?')) return;
    setError(null);
    setActionLoadingId(applicationId);

    try {
      const application = await getApplication(applicationId);
      // Build a minimal payload for updating the application to avoid modifying related JobSpec or nested objects.
      const minimalPayload: any = {};
      for (const [key, value] of Object.entries(application || {})) {
        // keep primitives and nulls only; skip nested objects/arrays which may represent linked entities
        if (value === null) {
          minimalPayload[key] = null;
        } else if (typeof value !== 'object') {
          minimalPayload[key] = value;
        }
      }
      minimalPayload.Id = applicationId;
      minimalPayload.IsActive = false;
      await saveApplication(minimalPayload);
      await loadStageData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredItems = useMemo(() => {
    const dateThreshold = dateFrom ? parseDate(dateFrom) : null;

    return items.filter((item) => {
      const fieldDateValue =
        stage === 'received'
          ? item.Created
          : stage === 'applied'
          ? item.applicationDate
          : stage === 'interview'
          ? item.interviewDate
          : stage === 'offers'
          ? item.offerDate
          : item.discardedDate;

      if (dateThreshold) {
        const parsed = parseDate(fieldDateValue);
        if (!parsed || parsed < dateThreshold) {
          return false;
        }
      }

      if (searchPosition && !item.Position.toLowerCase().includes(searchPosition.toLowerCase())) {
        return false;
      }
      if (searchCompany && !item.Company.toLowerCase().includes(searchCompany.toLowerCase())) {
        return false;
      }
      if (selectedRoleTypeIds.length > 0 && (!item.RoleTypeId || !selectedRoleTypeIds.includes(item.RoleTypeId))) {
        return false;
      }
      if (selectedWorkModelIds.length > 0 && (!item.WorkModelId || !selectedWorkModelIds.includes(item.WorkModelId))) {
        return false;
      }
      if (selectedTagIds.length > 0 && !selectedTagIds.some((tagId) => item.tagIds.includes(tagId))) {
        return false;
      }
      return true;
    });
  }, [items, dateFrom, searchPosition, searchCompany, selectedRoleTypeIds, selectedWorkModelIds, selectedTagIds, stage]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const pagedItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const roleTypeById = useMemo(() => new Map(roleTypes.map((role) => [role.Id, role.Name])), [roleTypes]);
  const workModelById = useMemo(() => new Map(workModels.map((model) => [model.Id, model.Name])), [workModels]);

  const getRoleTypeLabel = (id: number | null) => {
    if (id === null || id === undefined) return '—';
    return roleTypeById.get(id) ?? 'Unknown';
  };

  const getWorkModelLabel = (id: number | null) => {
    if (id === null || id === undefined) return '—';
    return workModelById.get(id) ?? 'Unknown';
  };

  const handlePageChange = (target: number) => {
    setPage(Math.max(1, Math.min(target, totalPages)));
  };

  const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>, setter: (values: number[]) => void) => {
    const value = event.target.value;
    setter(value ? [Number(value)] : []);
  };

  const handleRowClick = (id: number) => {
    onClose();
    navigate(`/job-specs/view/${id}`);
  };

  return (
    <Modal title={title} onClose={onClose}>
      {loading && <p>Loading items…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && (
        <>
          <div className="modal-filters">
            <div className="modal-field">
              <label>{stageDateLabel}</label>
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>
            <div className="modal-field">
              <label>Position</label>
              <input value={searchPosition} onChange={(event) => setSearchPosition(event.target.value)} placeholder="Search position" />
            </div>
            <div className="modal-field">
              <label>Company</label>
              <input value={searchCompany} onChange={(event) => setSearchCompany(event.target.value)} placeholder="Search company" />
            </div>
            <div className="modal-field">
              <label>Role Type</label>
              <select
                className="stage-select"
                value={selectedRoleTypeIds[0] ? String(selectedRoleTypeIds[0]) : ''}
                onChange={(event) => handleDropdownChange(event, setSelectedRoleTypeIds)}
              >
                <option value="">All Role Types</option>
                {roleTypes.map((role) => (
                  <option key={role.Id} value={role.Id}>{role.Name}</option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label>Work Model</label>
              <select
                className="stage-select"
                value={selectedWorkModelIds[0] ? String(selectedWorkModelIds[0]) : ''}
                onChange={(event) => handleDropdownChange(event, setSelectedWorkModelIds)}
              >
                <option value="">All Work Models</option>
                {workModels.map((model) => (
                  <option key={model.Id} value={model.Id}>{model.Name}</option>
                ))}
              </select>
            </div>
            <div className="modal-field">
              <label>Tags</label>
              <select
                className="stage-select"
                value={selectedTagIds[0] ? String(selectedTagIds[0]) : ''}
                onChange={(event) => handleDropdownChange(event, setSelectedTagIds)}
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.Id} value={tag.Id}>{tag.Name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="stage-table">
            <div className="stage-row stage-row-header">
              <div className="stage-cell stage-cell-date">{stageDateLabel}</div>
              <div className="stage-cell">Job Position</div>
              <div className="stage-cell">Role Type</div>
              <div className="stage-cell">Work Model</div>
              <div className="stage-cell">Tags</div>
              <div className="stage-cell stage-cell-actions">Actions</div>
            </div>
            {pagedItems.length === 0 && (
              <div className="stage-row empty-row">
                <div className="stage-cell" style={{ gridColumn: '1 / -1' }}>
                  No job specs match the selected filters.
                </div>
              </div>
            )}
            {pagedItems.map((item) => (
              <div key={item.Id} className="stage-row stage-row-clickable" onClick={() => handleRowClick(item.Id)}>
                <div className="stage-cell stage-cell-date">
                  {formatShortDate(
                    stage === 'received'
                      ? item.Created
                      : stage === 'applied'
                      ? item.applicationDate
                      : stage === 'interview'
                      ? item.interviewDate
                      : stage === 'offers'
                      ? item.offerDate
                      : item.discardedDate,
                  )}
                </div>
                <div className="stage-cell stage-cell-job-position">
                  {item.Position || item.Company ? (
                    <>
                      {item.Position ? (
                        <span className="job-position-name">{item.Position}</span>
                      ) : (
                        <span className="job-position-empty">—</span>
                      )}
                      {item.Position && item.Company && (
                        <span className="job-position-separator"> at </span>
                      )}
                      {item.Company ? (
                        <span className="job-company-name">{item.Company}</span>
                      ) : null}
                    </>
                  ) : (
                    <span className="job-position-empty">—</span>
                  )}
                </div>
                <div className="stage-cell">{getRoleTypeLabel(item.RoleTypeId)}</div>
                <div className="stage-cell">{getWorkModelLabel(item.WorkModelId)}</div>
                <div className="stage-cell">
                  {item.tagNames.length > 0 ? (
                    <span className="tag-icon" title={item.tagNames.join(', ')}>
                      🏷️
                    </span>
                  ) : (
                    '—'
                  )}
                </div>
                <div className="stage-cell stage-cell-actions">
                  {stage === 'received' ? (
                    <div className="stage-row-actions">
                      <button
                        type="button"
                        className={`stage-action-button${actionLoadingId === item.Id ? ' disabled' : ''}`}
                        title="Create application for this job spec"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (actionLoadingId !== item.Id) handleCreateApplication(item.Id);
                        }}
                        disabled={actionLoadingId === item.Id}
                      >
                        →
                      </button>
                      <button
                        type="button"
                        className={`stage-action-button stage-action-button-delete${actionLoadingId === item.Id ? ' disabled' : ''}`}
                        title="Soft delete this job spec"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (actionLoadingId !== item.Id) handleSoftDeleteJobSpec(item.Id);
                        }}
                        disabled={actionLoadingId === item.Id}
                      >
                        ✖
                      </button>
                      <button
                        type="button"
                        className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                        title="Discard application"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                            handleDiscardApplication(item.ApplicationId);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        🗑
                      </button>
                    </div>
                  ) : stage === 'applied' ? (
                    <div className="stage-row-actions">
                      <button
                        type="button"
                        className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                        title="Create interview for this application"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                            openInterviewForm(item.ApplicationId);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        →
                      </button>
                      <button
                        type="button"
                        className={`stage-action-button stage-action-button-delete${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                        title="Soft delete this application"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                            handleSoftDeleteApplication(item.ApplicationId);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        ✖
                      </button>
                      <button
                        type="button"
                        className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                        title="Discard application"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                            handleDiscardApplication(item.ApplicationId);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        🗑
                      </button>
                    </div>
                  ) : stage === 'interview' ? (
                    <div className="stage-row-actions">
                      <button
                        type="button"
                        className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                        title="Create interview for this application"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                            openInterviewForm(item.ApplicationId);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                        title="Create offer for this application"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                            openOfferForm(item.ApplicationId);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        →
                      </button>
                      <button
                        type="button"
                        className={`stage-action-button stage-action-button-delete${actionLoadingId === item.InterviewId ? ' disabled' : ''}`}
                        title="Soft delete this interview"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.InterviewId && actionLoadingId !== item.InterviewId) {
                            handleSoftDeleteInterview(item.InterviewId);
                          }
                        }}
                        disabled={!item.InterviewId || actionLoadingId === item.InterviewId}
                      >
                        ✖
                      </button>
                      <button
                        type="button"
                        className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                        title="Discard application"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                            handleDiscardApplication(item.ApplicationId);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        🗑
                      </button>
                    </div>
                  ) : stage === 'offers' ? (
                    <div className="stage-row-actions">
                      <button
                        type="button"
                        className={`stage-action-button stage-action-button-delete${actionLoadingId === item.OfferId ? ' disabled' : ''}`}
                        title="Soft delete this offer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.OfferId && actionLoadingId !== item.OfferId) {
                            handleSoftDeleteOffer(item.OfferId);
                          }
                        }}
                        disabled={!item.OfferId || actionLoadingId === item.OfferId}
                      >
                        ✖
                      </button>
                      <button
                        type="button"
                        className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                        title="Discard application"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                            handleDiscardApplication(item.ApplicationId);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        🗑
                      </button>
                    </div>
                  ) : stage === 'discarded' ? (
                    <div className="stage-row-actions">
                      <button
                        type="button"
                        className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                        title="Restore application"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                            handleRestoreApplication(item.ApplicationId);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        ↺
                      </button>
                    </div>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            ))}
          </div>

          {contactFormOpen && (
            <div className="stage-modal-popup-overlay contact-popup">
              <div className="stage-modal-popup">
                <h4>Create Contact</h4>
                {contactFormError && <p className="error">{contactFormError}</p>}
                <div className="modal-field">
                  <label>Name</label>
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name" />
                </div>
                <div className="modal-field">
                  <label>Email</label>
                  <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email address" />
                </div>
                <div className="modal-field">
                  <label>Phone</label>
                  <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone number" />
                </div>
                <div className="modal-field">
                  <label>Notes</label>
                  <textarea value={contactNotes} onChange={(e) => setContactNotes(e.target.value)} rows={4} />
                </div>
                <div className="modal-actions">
                  <button className="button secondary-button" type="button" onClick={closeContactForm}>
                    Cancel
                  </button>
                  <button className="button primary-button" type="button" onClick={handleCreateContact} disabled={contactCreating}>
                    Create
                  </button>
                </div>
              </div>
            </div>
          )}

          {offerFormOpen && (
            <div className="stage-modal-popup-overlay">
              <div className="stage-modal-popup">
                <h4>Create Offer</h4>
                {offerFormError && <p className="error">{offerFormError}</p>}
                <div className="modal-field">
                  <label>Offered date</label>
                  <input
                    type="date"
                    value={offerOfferedDate}
                    onChange={(e) => setOfferOfferedDate(e.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label>Salary</label>
                  <input value={offerSalary} onChange={(e) => setOfferSalary(e.target.value)} placeholder="Salary amount" />
                </div>
                <div className="modal-field">
                  <label>Notes</label>
                  <textarea value={offerNotes} onChange={(e) => setOfferNotes(e.target.value)} rows={4} />
                </div>
                <div className="modal-actions">
                  <button className="button secondary-button" type="button" onClick={closeOfferForm}>
                    Cancel
                  </button>
                  <button className="button primary-button" type="button" onClick={handleCreateOffer} disabled={offerCreating}>
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}

          {interviewFormOpen && (
            <div className="stage-modal-popup-overlay">
              <div className="stage-modal-popup">
                <h4>Create Interview</h4>
                {interviewFormError && <p className="error">{interviewFormError}</p>}
                <div className="modal-field">
                  <label>Schedule Date</label>
                  <input
                    type="date"
                    value={interviewSchedule}
                    onChange={(event) => setInterviewSchedule(event.target.value)}
                  />
                </div>
                <div className="modal-field">
                  <label>Contact</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={(e) => e.stopPropagation()}>
                    <select
                      value={interviewContactId ?? ''}
                      onChange={(event) => setInterviewContactId(event.target.value ? Number(event.target.value) : null)}
                    >
                      <option value="">No contact</option>
                      {contacts.map((contact) => (
                        <option key={contact.Id ?? contact.id} value={contact.Id ?? contact.id}>
                          {contact.Name || contact.name || contact.Title || contact.Email || contact.EmailAddress || 'Unnamed contact'}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="stage-action-button"
                      title="Create new contact"
                      onClick={(e) => {
                        e.stopPropagation();
                        openContactForm(e);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="modal-field">
                  <label>Notes</label>
                  <textarea
                    value={interviewNotes}
                    onChange={(event) => setInterviewNotes(event.target.value)}
                    placeholder="Interview notes"
                    rows={4}
                  />
                </div>
                <div className="modal-actions">
                  <button className="button secondary-button" type="button" onClick={closeInterviewForm}>
                    Cancel
                  </button>
                  <button
                    className="button primary-button"
                    type="button"
                    onClick={handleCreateInterview}
                    disabled={actionLoadingId === activeApplicationId}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="stage-pagination">
            <button className="button secondary-button" onClick={() => handlePageChange(1)} disabled={page === 1}>
              First
            </button>
            <button className="button secondary-button" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button className="button secondary-button" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
              Next
            </button>
            <button className="button secondary-button" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>
              Last
            </button>
          </div>
        </>
      )}
      <div className="modal-actions" style={{ justifyContent: 'center' }}>
        <button className="button secondary-button" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
