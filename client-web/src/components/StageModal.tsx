import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import {
  listAppliedJobSpecs,
  listDiscardedJobSpecs,
  listInterviewJobSpecs,
  listOffersJobSpecs,
  listReceivedJobSpecs,
} from '../api/summary';
import {
  listAllApplications,
  listAllInterviews,
  listAllOffers,
} from '../api/applications';
import {
  listJobSpecTags,
  listRoleTypes,
  listTags,
  listWorkModels,
} from '../api/jobSpecs';
import { DEFAULT_PAGE_SIZE } from '../config';

type StageType = 'received' | 'applied' | 'interview' | 'offers' | 'discarded';

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
  tagIds: number[];
  tagNames: string[];
};

type Props = {
  stage: StageType;
  title: string;
  open: boolean;
  onClose: () => void;
};

const stageDateLabels: Record<StageType, string> = {
  received: 'Date Creation',
  applied: 'Date Applied',
  interview: 'Interview Date',
  offers: 'Date Offered',
  discarded: 'Date Discarded',
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
  stage: StageType,
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
    offerDate: latestOffer?.Offered ?? null,
    discardedDate: latestApplication?.Discarded ?? null,
    tagIds: jobSpecTagIds,
    tagNames: jobSpecTagIds.map((id) => tagsMap.get(id) ?? 'Unknown'),
  };
}

function loadStageSpecs(stage: StageType) {
  switch (stage) {
    case 'received':
      return listReceivedJobSpecs();
    case 'applied':
      return listAppliedJobSpecs();
    case 'interview':
      return listInterviewJobSpecs();
    case 'offers':
      return listOffersJobSpecs();
    case 'discarded':
      return listDiscardedJobSpecs();
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

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    async function loadData() {
      try {
        const [roleTypeData, workModelData, tagData] = await Promise.all([
          listRoleTypes(),
          listWorkModels(),
          listTags(),
        ]);

        if (!mounted) return;
        setRoleTypes(roleTypeData);
        setWorkModels(workModelData);
        setTags(tagData);

        const stageJobSpecs = await loadStageSpecs(stage);
        const apps = ['applied', 'interview', 'offers', 'discarded'].includes(stage)
          ? await listAllApplications()
          : [];
        const interviews = stage === 'interview' ? await listAllInterviews() : [];
        const offers = stage === 'offers' ? await listAllOffers() : [];
        const tagMap = new Map(tagData.map((tag: any) => [tag.Id, tag.Name]));

        const jobSpecTags = await Promise.all(
          stageJobSpecs.map(async (spec: any) => {
            try {
              const relations = await listJobSpecTags(spec.Id);
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
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [open, stage]);

  useEffect(() => {
    setPage(1);
  }, [dateFrom, searchPosition, searchCompany, selectedRoleTypeIds.join(','), selectedWorkModelIds.join(','), selectedTagIds.join(',')]);

  const stageDateLabel = stageDateLabels[stage];

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
              <div className="stage-cell">Position</div>
              <div className="stage-cell">Company</div>
              <div className="stage-cell">Role Type</div>
              <div className="stage-cell">Work Model</div>
              <div className="stage-cell">Tags</div>
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
                <div className="stage-cell">{item.Position || '—'}</div>
                <div className="stage-cell">{item.Company || '—'}</div>
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
              </div>
            ))}
          </div>

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
