import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { listWorkModels } from '../api/lu_workmodels';
import { listRoleTypes } from '../api/lu_roletypes';
import { listPlacesOfWork } from '../api/place_of_work';
import { listSources } from '../api/sources';
import { getJobSpec } from '../api/jobSpecs';
import { getApplicationsByJobSpec } from '../api/applications';
import { getInterviewByJobSpec } from '../api/interviews';
import { getOfferByJobSpec } from '../api/offers';

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function formatDateOnly(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function safeValue(value: any) {
  return value === null || value === undefined || value === '' ? '—' : value;
}

function getContact(spec: any) {
  const contact = spec.Contact || {};
  return {
    name: contact.Name || spec.ContactName || spec.Contact?.Name || '—',
    email: contact.Email || spec.ContactEmail || spec.Contact?.Email || '',
    phone: contact.Phone || spec.ContactPhone || spec.Contact?.Phone || '',
    details: contact.Details || spec.ContactDetails || spec.Contact?.Details || '',
  };
}

function getSource(spec: any, sources: any[]) {
  if (spec.Source) return spec.Source;
  return sources.find((item) => item.Id === spec.SourceId) || null;
}

function getPlaceOfWork(spec: any, places: any[]) {
  const place = places.find((item) => item.Id === spec.PlaceOfWorkId);
  if (!place) return null;
  const location = place.Location || place.location || null;
  return {
    address: place.Address || '—',
    country: location?.Country || place.Country || '—',
    city: location?.City || place.City || '',
    label: `${location?.Country || place.Country || ''}${location?.City || place.City ? `, ${location?.City || place.City}` : ''}`.replace(/^, /, '') || place.Address || '—',
  };
}

function normalizeBenefits(value: any) {
  if (!value) return '—';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '—';
  if (typeof value === 'string') return value.trim() || '—';
  return String(value);
}

export default function JobSpecView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [spec, setSpec] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleTypes, setRoleTypes] = useState<any[]>([]);
  const [workModels, setWorkModels] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [placesOfWork, setPlacesOfWork] = useState<any[]>([]);
  const [application, setApplication] = useState<any | null>(null);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const [jobSpec, roles, works, srcs, places, applications, interviewsBySpec, offersBySpec] = await Promise.all([
          getJobSpec(Number(id)),
          listRoleTypes().catch(() => []),
          listWorkModels().catch(() => []),
          listSources().catch(() => []),
          listPlacesOfWork().catch(() => []),
          getApplicationsByJobSpec(Number(id)).catch(() => []),
          getInterviewByJobSpec(Number(id)).catch(() => []),
          getOfferByJobSpec(Number(id)).catch(() => []),
        ]);

        if (!mounted) return;

        setSpec(jobSpec);
        setRoleTypes(Array.isArray(roles) ? roles : []);
        setWorkModels(Array.isArray(works) ? works : []);
        setSources(Array.isArray(srcs) ? srcs : []);
        setPlacesOfWork(Array.isArray(places) ? places : []);

        const applicationsArray = Array.isArray(applications) ? applications : [];
        setApplication(applicationsArray[0] || null);
        setInterviews(Array.isArray(interviewsBySpec) ? interviewsBySpec : []);
        setOffers(Array.isArray(offersBySpec) ? offersBySpec : []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load job spec');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const source = useMemo(() => (spec ? getSource(spec, sources) : null), [spec, sources]);
  const contact = useMemo(() => (spec ? getContact(spec) : null), [spec]);
  const place = useMemo(() => (spec ? getPlaceOfWork(spec, placesOfWork) : null), [spec, placesOfWork]);
  const roleTypeName = useMemo(() => {
    if (!spec?.RoleTypeId) return '—';
    const found = roleTypes.find((item) => item.Id === spec.RoleTypeId);
    return found?.Name || '—';
  }, [spec, roleTypes]);
  const workModelName = useMemo(() => {
    if (!spec?.WorkModelId) return '—';
    const found = workModels.find((item) => item.Id === spec.WorkModelId);
    return found?.Name || '—';
  }, [spec, workModels]);

  const salary = spec?.SalaryExpectation || spec?.SallaryExpectation || '—';
  const benefits = normalizeBenefits(spec?.Benefits ?? spec?.BenefitList ?? spec?.Perks);

  return (
    <section className="page">
      {loading && (
        <div className="page-header-row">
          <div>
            <h2 className="job-spec-title"><p>Loading job spec...</p></h2>
          </div>
          <button className="button secondary-button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      )}
      {error && (
        <div className="page-header-row">
          <div>
            <h2 className="job-spec-title"><p className="error">{error}</p></h2>
          </div>
          <button className="button secondary-button" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      )}

      {!loading && !error && spec && (
        <div className="job-spec-view">
          <div className="page-header-row">
            <div>
              <h2 className="job-spec-title">
                {safeValue(spec.Position)}
                {spec.Link ? (
                  <a href={spec.Link} target="_blank" rel="noreferrer" className="job-spec-link" title="Open job link">
                    🔗
                  </a>
                ) : (
                  <span className="job-spec-link-placeholder">No link</span>
                )}
              </h2>
              <p className="job-spec-company">{safeValue(spec.Company)}</p>
            </div>
            <button className="button secondary-button" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          <div className="job-spec-notes">
            {source ? (
              <div className="job-spec-note-row">
                <span className="job-spec-note-label">Source:</span>
                <span className="job-spec-note-value">{safeValue(source.Name)}</span>
                {source.PortalURL ? (
                  <a href={source.PortalURL} target="_blank" rel="noreferrer" className="job-spec-inline-link" title="Open source portal">
                    🔗
                  </a>
                ) : null}
              </div>
            ) : (
              <div className="job-spec-note-row">
                <span className="job-spec-note-label">Source:</span>
                <span className="job-spec-note-value">—</span>
              </div>
            )}
            {source?.Details ? <p className="job-spec-note-subtext">{source.Details}</p> : null}

            {(contact?.name || contact?.email || contact?.phone) && (
              <div className="job-spec-note-row contact-row">
                <span className="job-spec-note-label">Contact:</span>
                <span>
                  {contact?.name || '—'}
                  {contact?.email ? (
                    <a href={`mailto:${contact.email}`} className="job-spec-contact-link">
                      {contact.email}
                    </a>
                  ) : null}
                  {contact?.phone ? <span className="job-spec-contact-phone">{contact.phone}</span> : null}
                </span>
                {contact?.details ? (
                  <span className="job-spec-info-icon" title={contact.details}>ℹ️</span>
                ) : null}
              </div>
            )}
          </div>

          <div className="job-spec-metadata">
            <div className="job-spec-meta-item">
              <span className="job-spec-meta-label">Published</span>
              <span>{formatDate(spec.Published)}</span>
            </div>
            <div className="job-spec-meta-item">
              <span className="job-spec-meta-label">Created</span>
              <span>{formatDate(spec.Created)}</span>
            </div>
          </div>

          <div className="job-spec-section">
            <div className="job-spec-field-row">
              <span className="job-spec-field-label">Place of Work</span>
              <span>{place ? `${place.label}${place.address ? ` — ${place.address}` : ''}` : '—'}</span>
            </div>
            <div className="job-spec-field-row">
              <span className="job-spec-field-label">Role Type</span>
              <span>{roleTypeName}</span>
            </div>
            <div className="job-spec-field-row">
              <span className="job-spec-field-label">Work Model</span>
              <span>{workModelName}</span>
            </div>
            <div className="job-spec-field-row">
              <span className="job-spec-field-label">Salary Expectation</span>
              <span>{safeValue(salary)}</span>
            </div>
            <div className="job-spec-field-row">
              <span className="job-spec-field-label">Benefits</span>
              <span>{benefits}</span>
            </div>
          </div>

          <div className="job-spec-section job-spec-description-section">
            <h4 className="section-heading">Description</h4>
            <p className="job-spec-description">{safeValue(spec.Description)}</p>
          </div>

          {application && (
            <div className={`job-spec-section application-section ${application.Discarded ? 'discarded' : ''}`}>
              <div className="section-heading-row">
                <h4 className="section-heading">Application</h4>
                {application.Discarded ? <span className="section-status">Discarded</span> : null}
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Applied Date</span>
                <span>{formatDateOnly(application.Applied || application.DateApplied)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Confirmed Date</span>
                <span>{formatDateOnly(application.Confirmed || application.DateConfirmed)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Notes</span>
                <span className="job-spec-description">{safeValue(application.Notes || application.ApplicationNotes)}</span>
              </div>
              {application.Discarded ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Discarded Date</span>
                  <span>{formatDateOnly(application.Discarded || application.DiscardedDate)}</span>
                </div>
              ) : null}
            </div>
          )}

          {interviews.length > 0 && (
            <div className="job-spec-section interviews-section">
              <div className="section-heading-row">
                <h4 className="section-heading">Interviews</h4>
              </div>
              {interviews.map((interview) => (
                <div key={interview.Id || interview.id || Math.random()} className="interview-item">
                  <div className="job-spec-field-row">
                    <span className="job-spec-field-label">Scheduled Date</span>
                    <span>{formatDateTime(interview.Scheduled || interview.DateScheduled)}</span>
                  </div>
                  <div className="job-spec-note-row contact-row">
                    <span className="job-spec-note-label">Contact</span>
                    <span>
                      {safeValue(interview.ContactName || interview.Contact?.Name)}
                      {interview.ContactEmail || interview.Contact?.Email ? (
                        <a href={`mailto:${interview.ContactEmail || interview.Contact?.Email}`} className="job-spec-contact-link">
                          {interview.ContactEmail || interview.Contact?.Email}
                        </a>
                      ) : null}
                    </span>
                    {(interview.ContactDetails || interview.Contact?.Details) ? (
                      <span className="job-spec-info-icon" title={interview.ContactDetails || interview.Contact?.Details}>ℹ️</span>
                    ) : null}
                  </div>
                  <div className="job-spec-field-row">
                    <span className="job-spec-field-label">Notes</span>
                    <span className="job-spec-description">{safeValue(interview.Notes || interview.InterviewNotes)}</span>
                  </div>
                  {interview.Outcome ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Outcome</span>
                      <span className="job-spec-description">{safeValue(interview.Outcome)}</span>
                    </div>
                  ) : null}
                  {interview.Feedback ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Feedback</span>
                      <span className="job-spec-description">{safeValue(interview.Feedback)}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {offers.length > 0 && (
            <div className="job-spec-section">
              <div className="section-heading-row">
                <h4 className="section-heading">Offer</h4>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Offered Date</span>
                <span>{formatDateOnly(offers[0].Offered || offers[0].DateOffered)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Salary</span>
                <span>{safeValue(offers[0].Salary || offers[0].SalaryExpectation)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Benefits</span>
                <span>{normalizeBenefits(offers[0].Benefits || offers[0].Perks || offers[0].BenefitList)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Notes</span>
                <span className="job-spec-description">{safeValue(offers[0].Notes || offers[0].OfferNotes)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
