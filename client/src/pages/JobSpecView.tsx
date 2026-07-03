import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getJobSpecById,
  listRoleTypes,
  listWorkModels,
  listSources,
  listPlacesOfWork,
} from '../api/jobSpecs';
import {
  getApplicationsByJobSpec,
  listAllInterviews,
  listAllOffers,
} from '../api/applications';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
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
        const [jobSpec, roles, works, srcs, places] = await Promise.all([
          getJobSpecById(Number(id)),
          listRoleTypes().catch(() => []),
          listWorkModels().catch(() => []),
          listSources().catch(() => []),
          listPlacesOfWork().catch(() => []),
        ]);

        if (!mounted) return;

        setSpec(jobSpec);
        setRoleTypes(Array.isArray(roles) ? roles : []);
        setWorkModels(Array.isArray(works) ? works : []);
        setSources(Array.isArray(srcs) ? srcs : []);
        setPlacesOfWork(Array.isArray(places) ? places : []);

        const applications = await getApplicationsByJobSpec(Number(id)).catch(() => []);
        const appsArray = Array.isArray(applications) ? applications : [applications];
        const currentApplication = appsArray[0] || null;
        setApplication(currentApplication);

        if (currentApplication?.Id) {
          const [allInterviews, allOffers] = await Promise.all([
            listAllInterviews().catch(() => []),
            listAllOffers().catch(() => []),
          ]);

          const interviewsArray = Array.isArray(allInterviews) ? allInterviews : [];
          const offersArray = Array.isArray(allOffers) ? allOffers : [];

          setInterviews(
            interviewsArray.filter(
              (item: any) => item.ApplicationId === currentApplication.Id || item.JobApplicationId === currentApplication.Id,
            ),
          );
          setOffers(
            offersArray.filter(
              (item: any) => item.ApplicationId === currentApplication.Id || item.JobApplicationId === currentApplication.Id),
          );
        }
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
      <div className="page-header-row">
        <div>
          <h2>Job Spec Details</h2>
          <p className="page-subtitle">Review the job spec and linked application history.</p>
        </div>
        <button className="button secondary-button" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {loading && <p>Loading job spec...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && spec && (
        <div className="job-spec-view">
          <div className="job-spec-header">
            <div>
              <h3 className="job-spec-title">{safeValue(spec.Position)}</h3>
              <p className="job-spec-company">{safeValue(spec.Company)}</p>
            </div>
            {spec.Link ? (
              <a href={spec.Link} target="_blank" rel="noreferrer" className="job-spec-link" title="Open job link">
                🔗
              </a>
            ) : (
              <span className="job-spec-link-placeholder">No link</span>
            )}
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

          {!application && (
            <button className="button wide-button">Apply</button>
          )}

          {application && (
            <div className={`job-spec-section application-section ${application.Discarded ? 'discarded' : ''}`}>
              <div className="section-heading-row">
                <h4 className="section-heading">Application</h4>
                {application.Discarded ? <span className="section-status">Discarded</span> : null}
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Date of Application</span>
                <span>{formatDate(application.Applied || application.DateApplied)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Date of Confirmation</span>
                <span>{formatDate(application.Confirmed || application.DateConfirmed)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Application Notes</span>
                <span className="job-spec-description">{safeValue(application.Notes || application.ApplicationNotes)}</span>
              </div>
              {application.Discarded ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Discarded Date</span>
                  <span>{formatDate(application.Discarded)}</span>
                </div>
              ) : (
                <button className="button secondary-button wide-button">Discard</button>
              )}
            </div>
          )}

          {application && interviews.length > 0 && (
            <div className="job-spec-section">
              <div className="section-heading-row">
                <h4 className="section-heading">Interviews</h4>
              </div>
              {interviews.map((interview) => (
                <div key={interview.Id || interview.id || Math.random()} className="job-spec-section interview-item">
                  <div className="job-spec-field-row">
                    <span className="job-spec-field-label">Scheduled</span>
                    <span>{formatDate(interview.Scheduled || interview.DateScheduled)}</span>
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
                      {interview.ContactPhone || interview.Contact?.Phone ? (
                        <span className="job-spec-contact-phone">{interview.ContactPhone || interview.Contact?.Phone}</span>
                      ) : null}
                    </span>
                    {(interview.ContactDetails || interview.Contact?.Details) ? (
                      <span className="job-spec-info-icon" title={interview.ContactDetails || interview.Contact?.Details}>ℹ️</span>
                    ) : null}
                  </div>
                  <div className="job-spec-field-row">
                    <span className="job-spec-field-label">Interview Notes</span>
                    <span className="job-spec-description">{safeValue(interview.Notes || interview.InterviewNotes)}</span>
                  </div>
                  {interview.Outcome ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Outcome</span>
                      <span>{safeValue(interview.Outcome)}</span>
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

          {application && <button className="button wide-button secondary-button">Add an Interview</button>}

          {application && !offers.length && (
            <button className="button wide-button secondary-button">Offer Received</button>
          )}

          {application && offers.length > 0 && (
            <div className="job-spec-section">
              <div className="section-heading-row">
                <h4 className="section-heading">Offer</h4>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Date Offered</span>
                <span>{formatDate(offers[0].Offered || offers[0].DateOffered)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Salary</span>
                <span>{safeValue(offers[0].Salary || offers[0].SalaryExpectation)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Benefits</span>
                <span>{normalizeBenefits(offers[0].Benefits || offers[0].Perks)}</span>
              </div>
              <div className="job-spec-field-row">
                <span className="job-spec-field-label">Offer Notes</span>
                <span className="job-spec-description">{safeValue(offers[0].Notes || offers[0].OfferNotes)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
