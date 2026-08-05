import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTags, FaArrowCircleRight, FaTrashAlt, FaUndo, FaRegCalendarPlus } from 'react-icons/fa';
import { GiCardDiscard } from "react-icons/gi";
import { Stage,  } from '../defs/types';
import { wfStageItem } from '../defs/types';
import { 
  titleMap,
  stageDateLabels,
} from '../defs/maps';
import Modal from './Modal';
import ApplicationModal from '../components/ApplicationModal';
import InterviewModal from '../components/InterviewModal';
import OfferModal from '../components/OfferModal';
import { inStageReceived, inStageApplied, inStageInterview, inStageOffer, inStageDiscarded } from '../api/workflow';
import { listWorkModels } from '../api/lu_workmodels';
import { listTags } from '../api/tags';
import { listRoleTypes } from '../api/lu_roletypes';
import { listContacts } from '../api/contacts';
import { deleteJobSpec } from '../api/jobSpecs';
import { getApplication, saveApplication } from '../api/applications';
import { getInterview, saveInterview } from '../api/interviews';
import { getOffer, saveOffer } from '../api/offers';
import { DEFAULT_PAGE_SIZE } from '../config';

type Props = {
  stage: Stage;
  title: string;
  open: boolean;
  onClose: () => void;
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

function buildJobSpecItem( spec: wfStageItem ) {
  return {
    JobspecId: spec.JobSpecId,
    ApplicationId: spec.ApplicationId ?? null,
    InterviewId: spec.InterviewId ?? null,
    OfferId: spec.OfferId ?? null,
    Position: spec.Position ?? '',
    Company: spec.Company ?? '',
    RoleTypeId: spec.RoleTypeId ?? null,
    WorkModelId: spec.WorkModelId ?? null,
    Created: spec.Created ?? null,
    Applied: spec.Applied ?? null,
    Discarded: spec.Discarded ?? null,
    Scheduled: spec.Scheduled ?? null,
    Offered: spec.Offered ?? null,
    //tagIds: jobSpecTagIds,
    //tagNames: jobSpecTagIds.map((id) => tagsMap.get(id) ?? 'Unknown'),
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
  const [stageDateLabel, setStageDateLabel] = useState<string> (stageDateLabels[stage]);
  const [items, setItems] = useState<wfStageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modalOpenApplication, setModalOpenApplication] = useState(false);
  const [modalOpenInterview, setModalOpenInterview] = useState(false);
  const [modalOpenOffer, setModalOpenOffer] = useState(false);

  const [dateFrom, setDateFrom] = useState('');
  const [searchPosition, setSearchPosition] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [selectedRoleTypeIds, setSelectedRoleTypeIds] = useState<number[]>([]);
  const [selectedWorkModelIds, setSelectedWorkModelIds] = useState<number[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  const [selectedJobSpecId, setSelectedJobSpecId] = useState<number | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [roleTypes, setRoleTypes] = useState<any[]>([]);
  const [workModels, setWorkModels] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

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
      const stageJobSpecs = await loadStageSpecs(stage);

      if (!mounted) return;
      const itemsWithMeta = stageJobSpecs.map((spec: any) => {
        //const specTags = jobSpecTags.find((relation) => relation.id === spec.JobSpecId);
        //return buildJobSpecItem(spec, stage, apps, interviews, offers, tagMap, specTags?.tagIds ?? []);
        return buildJobSpecItem(spec);
      });

      setItems(stageJobSpecs);
      //setItems(itemsWithMeta);
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

  const closeModalForm = async (nextStage?: Stage) => {
    setSelectedJobSpecId(null);
    setSelectedApplicationId(null);
    setModalOpenApplication(false);
    setModalOpenInterview(false);
    setModalOpenOffer(false);
    
    if (nextStage) {
      stage = nextStage;
      title = titleMap[stage];
      setStageDateLabel(stageDateLabels[stage])
      StageModal.apply;
    }
    await loadStageData();
  }

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
          ? item.Applied
          : stage === 'interview'
          ? item.Scheduled
          : stage === 'offers'
          ? item.Offered
          : item.Discarded;

      if (dateThreshold) {
        const parsed = parseDate(fieldDateValue);
        if (!parsed || parsed < dateThreshold) {
          return false;
        }
      }

      if (searchPosition && !item.Position.toLowerCase().includes(searchPosition.toLowerCase())) {
        return false;
      }
      if (searchCompany && item.Company && !item.Company.toLowerCase().includes(searchCompany.toLowerCase())) {
        return false;
      }
      if (selectedRoleTypeIds.length > 0 && (!item.RoleTypeId || !selectedRoleTypeIds.includes(item.RoleTypeId))) {
        return false;
      }
      if (selectedWorkModelIds.length > 0 && (!item.WorkModelId || !selectedWorkModelIds.includes(item.WorkModelId))) {
        return false;
      }
      //if (selectedTagIds.length > 0 && !selectedTagIds.some((tagId) => item.tagIds.includes(tagId))) {
      //  return false;
      //}
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
            <div className="modal-filter-date">
              <label>{stageDateLabel}</label>
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>
            <div className="modal-filter">
              <input value={searchPosition} onChange={(event) => setSearchPosition(event.target.value)} placeholder="Filter by position" />
            </div>
            <div className="modal-filter">
              <input value={searchCompany} onChange={(event) => setSearchCompany(event.target.value)} placeholder="Filter by company" />
            </div>
            <div className="modal-filter">
              <select className="modal-filter"
                      value={selectedRoleTypeIds[0] ? String(selectedRoleTypeIds[0]) : ''}
                      onChange={(event) => handleDropdownChange(event, setSelectedRoleTypeIds)}>
                <option value="">All Role Types</option>
                {roleTypes.map((role) => (
                  <option key={role.Id} value={role.Id}>{role.Name}</option>
                ))}
              </select>
            </div>
            <div className="modal-filter">
              <select className="modal-filter"
                      value={selectedWorkModelIds[0] ? String(selectedWorkModelIds[0]) : ''}
                      onChange={(event) => handleDropdownChange(event, setSelectedWorkModelIds)}>
                <option value="">All Work Models</option>
                {workModels.map((model) => (
                  <option key={model.Id} value={model.Id}>{model.Name}</option>
                ))}
              </select>
            </div>
            <div className="modal-filter">
              <select className="modal-filter"
                      value={selectedTagIds[0] ? String(selectedTagIds[0]) : ''}
                      onChange={(event) => handleDropdownChange(event, setSelectedTagIds)}>
                <option value="">All Tags</option>
                {/*
                {tags.map((tag) => (
                  <option key={tag.Id} value={tag.Id}>{tag.Name}</option>
                ))}
                */}
              </select>
            </div>
          </div>

          <div className="stage-row stage-row-header">
            <div className="stage-cell">{stageDateLabel}</div>
            <div className="stage-cell">Job Position</div>
            <div className="stage-cell">Role Type</div>
            <div className="stage-cell">Work Model</div>
            <div className="stage-cell">Tags</div>
            <div className="stage-cell">Actions</div>
          </div>
          <div className="stage-table">
            {pagedItems.length === 0 && (
              <div className="stage-row stage-empty-row">
                <div className="stage-cell stage-paged-cell">
                  No job specs match the selected filters.
                </div>
              </div>
            )}
            {pagedItems.map((item) => (
              <div key={item.JobSpecId} className="stage-row stage-row-clickable" onClick={() => handleRowClick(item.JobSpecId)}>
                <div className="stage-cell stage-cell-date">
                  {formatShortDate(
                    stage === 'received'
                      ? item.Created
                      : stage === 'applied'
                      ? item.Applied
                      : stage === 'interview'
                      ? item.Scheduled
                      : stage === 'offers'
                      ? item.Offered
                      : item.Discarded,
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
                <div className="stage-cell">
                  {item.RoleTypeId ? (
                    getRoleTypeLabel(item.RoleTypeId)
                  ) : (
                    '—'
                  )}
                </div>
                <div className="stage-cell">
                  {item.WorkModelId ? (
                    getWorkModelLabel(item.WorkModelId)
                  ) : (
                    '—'
                  )}
                </div>
                <div className="stage-cell">
                  <FaTags />
                </div>
                <div className="stage-cell stage-cell-actions">
                  {stage === 'received' ? (
                    <div className="stage-row-actions">
                      <button type="button"
                              className={`stage-action-button${actionLoadingId === item.JobSpecId ? ' disabled' : ''}`}
                              title="Create application for this job spec"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (actionLoadingId !== item.JobSpecId) {
                                  setSelectedJobSpecId(Number(item.JobSpecId));
                                  setModalOpenApplication(true);
                                }
                              }}
                              disabled={actionLoadingId === item.JobSpecId}>
                        <FaArrowCircleRight />
                      </button>
                      <button type="button"
                              className={`stage-action-button stage-action-button-delete${actionLoadingId === item.JobSpecId ? ' disabled' : ''}`}
                              title="Soft delete this job spec"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (actionLoadingId !== item.JobSpecId) handleSoftDeleteJobSpec(item.JobSpecId);
                              }}
                              disabled={actionLoadingId === item.JobSpecId}>
                        <FaTrashAlt />
                      </button>
                      <button type="button"
                              className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                              title="Discard application"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                                  handleDiscardApplication(item.ApplicationId);
                                }
                              }}
                              disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}>
                        <GiCardDiscard />
                      </button>
                    </div>
                  ) : stage === 'applied' ? (
                    <div className="stage-row-actions">
                      <button type="button"
                              className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                              title="Create interview for this application"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                                  setSelectedApplicationId(Number(item.ApplicationId));
                                  setModalOpenInterview(true);
                                }
                              }}
                              disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}>
                        <FaArrowCircleRight />
                      </button>
                      <button type="button"
                              className={`stage-action-button stage-action-button-delete${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                              title="Soft delete this application"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                                  handleSoftDeleteApplication(item.ApplicationId);
                                }
                              }}
                              disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}>
                        <FaTrashAlt />
                      </button>
                      <button type="button"
                              className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                              title="Discard application"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                                  handleDiscardApplication(item.ApplicationId);
                                }
                              }}
                              disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}>
                        <GiCardDiscard />
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
                            setSelectedApplicationId(Number(item.ApplicationId));
                            setModalOpenInterview(true);
                          }
                        }}
                        disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}
                      >
                        <FaRegCalendarPlus />
                      </button>
                      <button type="button"
                              className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                              title="Create offer for this application"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                                  setSelectedApplicationId(Number(item.ApplicationId));
                                  setModalOpenOffer(true);
                                }
                              }}
                              disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}>
                        <FaArrowCircleRight />
                      </button>
                      <button type="button"
                              className={`stage-action-button stage-action-button-delete${actionLoadingId === item.InterviewId ? ' disabled' : ''}`}
                              title="Soft delete this interview"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.InterviewId && actionLoadingId !== item.InterviewId) {
                                  handleSoftDeleteInterview(item.InterviewId);
                                }
                              }}
                              disabled={!item.InterviewId || actionLoadingId === item.InterviewId}>
                        <FaTrashAlt />
                      </button>
                      <button type="button"
                              className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                              title="Discard application"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                                  handleDiscardApplication(item.ApplicationId);
                                }
                              }}
                              disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}>
                        <GiCardDiscard />
                      </button>
                    </div>
                  ) : stage === 'offers' ? (
                    <div className="stage-row-actions">
                      <button type="button"
                              className={`stage-action-button stage-action-button-delete${actionLoadingId === item.OfferId ? ' disabled' : ''}`}
                              title="Soft delete this offer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.OfferId && actionLoadingId !== item.OfferId) {
                                  handleSoftDeleteOffer(item.OfferId);
                                }
                              }}
                              disabled={!item.OfferId || actionLoadingId === item.OfferId}>
                        <FaTrashAlt />
                      </button>
                      <button type="button"
                              className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                              title="Discard application"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                                  handleDiscardApplication(item.ApplicationId);
                                }
                              }}
                              disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}>
                        <GiCardDiscard />
                      </button>
                    </div>
                  ) : stage === 'discarded' ? (
                    <div className="stage-row-actions">
                      <button type="button"
                              className={`stage-action-button${actionLoadingId === item.ApplicationId ? ' disabled' : ''}`}
                              title="Restore application"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (item.ApplicationId && actionLoadingId !== item.ApplicationId) {
                                  handleRestoreApplication(item.ApplicationId);
                                }
                              }}
                              disabled={!item.ApplicationId || actionLoadingId === item.ApplicationId}>
                        <FaUndo />
                      </button>
                    </div>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
            ))}
          </div>
          {totalPages && totalPages > 1 ? (
            <div className="stage-pagination">
              <button className="stage-button stage-secondary-button" onClick={() => handlePageChange(1)} disabled={page === 1}>
                First
              </button>
              <button className="stage-button stage-secondary-button" onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
                Previous
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button className="stage-button stage-secondary-button" onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
                Next
              </button>
              <button className="stage-button stage-secondary-button" onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}>
                Last
              </button>
            </div>
          ) : ( <div className="stage-pagination"/> )}
        </>
      )}
      <div className="stage-actions">
        <button className="stage-button stage-secondary-button" onClick={onClose}>Close</button>
      </div>

      {modalOpenApplication && (
        <ApplicationModal
          applicationId={null}
          jobSpecId={selectedJobSpecId}
          title = "Create new Application"
          onClose={() => closeModalForm()}
          onSuccess={async () => {
            closeModalForm('applied');
          }}
        />
      )}

      {modalOpenInterview && (
        <InterviewModal
          interviewId={null}
          applicationId={selectedApplicationId}
          title = "Create new Interview"
          onClose={() => closeModalForm()}
          onSuccess={async () => {
            closeModalForm('interview');
          }}
        />
      )}

      {modalOpenOffer && (
        <OfferModal
          offerId={null}
          applicationId={selectedApplicationId}
          title = "Create new Offer"
          onClose={() => closeModalForm()}
          onSuccess={async () => {
            closeModalForm('offers');
          }}
        />
      )}

    </Modal>
  );
}
