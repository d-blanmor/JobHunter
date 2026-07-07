import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getJobSpec, getJobSpecBenefits, getJobSpecTags } from '../api/jobSpecs';
import { getApplicationsByJobSpec } from '../api/applications';
import { getInterviewByJobSpec } from '../api/interviews';
import { getOfferByJobSpec, getOfferBenefits } from '../api/offers';

import { listWorkModels } from '../api/lu_workmodels';
import { listRoleTypes } from '../api/lu_roletypes';
import { listBenefits } from '../api/lu_benefits';
import { listPlacesOfWork } from '../api/place_of_work';
import { listSources } from '../api/sources';
import { listContacts } from '../api/contacts';
import { listTags } from '../api/tags';

import { 
  JobSpecItem, 
  ApplicationItem,
  InterviewItem,
  OfferItem,
  SourceItem, 
  PlaceOfWorkItem, 
  luWorkModelItem,
  luRoleTypeItem,
  ContactItem, 
  TagItem,
  luBenefitItem,
  } from '../defs/interfaces';

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  //return date.toLocaleString();
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
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

function getSource(spec: any, sources: SourceItem[]) {
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

function getWorkModel(spec: any) {
  const model = spec.WorkModel || {};
  return {
    name: model.Name || spec.WorkModel || spec.WorkModel?.Name || '—',
  };
}

function getRoleType(spec: any) {
  const roleType = spec.RoleType || {};
  return {
    name: roleType.Name || spec.RoleType || spec.RoleType?.Name || '—',
  };
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

function normalizeBenefits(value: any) {
  if (!value) return '—';
  if (Array.isArray(value)) return value.filter(Boolean).join(', ') || '—';
  if (typeof value === 'string') return value.trim() || '—';
  return String(value);
}

export default function JobSpecView() {
  const { id } = useParams();
  const navigate = useNavigate();
  // Entities
  const [jobSpec, setSpec] = useState<JobSpecItem | null>(null);
  const [jsBenefits, setJsBenefits] = useState<luBenefitItem[]>([]);
  const [jsTags, setJSTags] = useState<TagItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [ofBenefits, setOfBenefits] = useState<luBenefitItem[]>([]);
  // Lookups
  const [lRoleTypes, setRoleTypes] = useState<luRoleTypeItem[]>([]);
  const [lWorkModels, setWorkModels] = useState<luWorkModelItem[]>([]);
  const [lSources, setSources] = useState<SourceItem[]>([]);
  const [lPlacesOfWork, setPlacesOfWork] = useState<PlaceOfWorkItem[]>([]);
  const [lContacts, setContacts] = useState<ContactItem[]>([]);
  const [lBenefits, setBenefits] = useState<luBenefitItem[]>([]); 
  const [lTags, setTags] = useState<TagItem[]>([]); 
  // Behaviour
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        const [
          jobSpec, 
          jsBenefits,
          jsTags,
          applications, 
          interviews, 
          offers,
          sources, 
          placesOfWork, 
          workModels, 
          roleTypes, 
          contacts,
          benefits,
          tags,
        ] = await Promise.all([
          getJobSpec(Number(id)),
          getJobSpecBenefits(Number(id)).catch(() => []),
          getJobSpecTags(Number(id)).catch(() => []),
          getApplicationsByJobSpec(Number(id)).catch(() => []),
          getInterviewByJobSpec(Number(id)).catch(() => []),
          getOfferByJobSpec(Number(id)).catch(() => []),
          listRoleTypes().catch(() => []),
          listWorkModels().catch(() => []),
          listSources().catch(() => []),
          listPlacesOfWork().catch(() => []),
          listContacts().catch(() => []),
          listBenefits().catch(() => []),
          listTags().catch(() => []),
        ]);

        if (!mounted) return;

        setSpec(jobSpec);
        setJsBenefits(jsBenefits || []);
        jobSpec.Benefits = jsBenefits;
        setJSTags(jsTags || []);
        jobSpec.Tags = jsTags;
        setApplications(Array.isArray(applications) ? applications : []);
        jobSpec.Applications = applications;
        setInterviews(Array.isArray(interviews) ? interviews : []);
        jobSpec.Applications.Interviews = interviews;
        setOffers(Array.isArray(offers) ? offers : []);
        jobSpec.Applications.Offers = offers;

        // Get benefits for each offer if needed
        if (Array.isArray(jobSpec.Applications) && jobSpec.Applications.length > 0) {
          if (Array.isArray(jobSpec.Applications[0].Offers) && jobSpec.Applications[0].Offers.length > 0) {
            for (let i = 0; i<jobSpec.Applications[0].Offers.length; i++) {
              const ofBenefits = await (getOfferBenefits(Number(jobSpec.Applications[0].Offers[i].id)).catch(() => []));

              setOfBenefits(Array.isArray(ofBenefits) ? ofBenefits : []);
              jobSpec.Applications[0].Offers[i].Benefits = ofBenefits;
            }
          }
        }

        setRoleTypes(Array.isArray(lRoleTypes) ? roleTypes : []);
        setWorkModels(Array.isArray(lWorkModels) ? workModels : []);
        setSources(Array.isArray(lSources) ? sources : []);
        setPlacesOfWork(Array.isArray(lPlacesOfWork) ? placesOfWork : []);
        setContacts(Array.isArray(lContacts) ? contacts : []);
        setBenefits(Array.isArray(lBenefits) ? benefits : []);
        setTags(Array.isArray(tags) ? lTags : []);

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

  const source = useMemo(() => (jobSpec ? getSource(jobSpec, lSources) : null), [jobSpec, lSources]);
  const placeOfWork = useMemo(() => (jobSpec ? getPlaceOfWork(jobSpec, lPlacesOfWork) : null), [jobSpec, lPlacesOfWork]);
  const workModel = useMemo(() => (jobSpec ? getWorkModel(jobSpec) : null), [jobSpec]);
  const roleType = useMemo(() =>  (jobSpec ? getRoleType(jobSpec) : null), [jobSpec]);
  const contact = useMemo(() => (jobSpec ? getContact(jobSpec) : null), [jobSpec]);
  // TODO: Get assigned tags to jobspec
  
  const sourceName = useMemo(() => {
    if (!jobSpec?.SourceId) return '—';
    const found = lSources.find((item) => item.Id === jobSpec.SourceId);
    return found?.Name || '—';
  }, [jobSpec, lSources]);
  const placeOfWorkName = useMemo(() => {
    if (!jobSpec?.PlaceOfWorkId) return '—';
    const found = lPlacesOfWork.find((item) => item.Id === jobSpec.PlaceOfWorkId);
    return found?.Location || '—';
  }, [jobSpec, lPlacesOfWork]);
  const workModelName = useMemo(() => {
    if (!jobSpec?.WorkModelId) return '—';
    const found = lWorkModels.find((item) => item.Id === jobSpec.WorkModelId);
    return found?.Name || '—';
  }, [jobSpec, lWorkModels]);
  const roleTypeName = useMemo(() => {
    if (!jobSpec?.RoleTypeId) return '—';
    const found = lRoleTypes.find((item) => item.Id === jobSpec.RoleTypeId);
    return found?.Name || '—';
  }, [jobSpec, lRoleTypes]);
  const contactName = useMemo(() => {
    if (!jobSpec?.ContactId) return '—';
    const found = lContacts.find((item) => item.Id === jobSpec.ContactId);
    return found?.Name || '—';
  }, [jobSpec, lContacts]);

  const salary = jobSpec?.SalaryExpectation ||  '—';
  const benefits = normalizeBenefits(jobSpec?.Benefits ?? jobSpec?.Benefits);

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

      {!loading && !error && jobSpec && (
        <div className="job-spec-view">
          <div className="page-header-row">
            <div>
              <h2 className="job-spec-title">
                {safeValue(jobSpec.Position)}
                {jobSpec.Link ? (
                  <a href={jobSpec.Link} target="_blank" rel="noreferrer" className="job-spec-link" title="Open job link">
                    🔗
                  </a>
                ) : null}
              </h2>
              {jobSpec.Company ? (
                <p className="job-spec-company">{safeValue(jobSpec.Company)}</p>
              ) : (
                <p className="job-spec-company">- Unknown Company -</p>
              )}
            </div>
            <button className="button secondary-button" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          <div className="job-spec-notes">
            {jobSpec.SourceId ? (
              <div className="job-spec-note-row">
                <span className="job-spec-note-label">Source:</span>
                <span className="job-spec-note-value">{safeValue(source.Name)}</span>
                {source.PortalURL ? (
                  <a href={source.PortalURL} target="_blank" rel="noreferrer" className="job-spec-inline-link" title="Open source portal">
                    🔗
                  </a>
                ) : null}
              </div>
            ) : null}
            {source?.Details ? <p className="job-spec-note-subtext">{source.Details}</p> : null}

            {jobSpec.Contact ? (
              <div className="job-spec-note-row contact-row">
                <span className="job-spec-note-label">Contact:</span>
                <span>
                  {jobSpec.Contact.Name || '—'}
                  {jobSpec.Contact.Email ? (
                    <a href={`mailto:${jobSpec.Contact.Email}`} className="job-spec-contact-link">
                      {jobSpec.Contact.Email}
                    </a>
                  ) : null}
                  {jobSpec.Contact.Phone ? <span className="job-spec-contact-phone">{jobSpec.Contact.Phone}</span> : null}
                </span>
                {jobSpec.Contact.Details ? (
                  <span className="job-spec-info-icon" title={jobSpec.Contact.Details}>ℹ️</span>
                ) : null}
              </div>
            ) : null}
          </div>

          {jobSpec.Published || jobSpec.Created ? (
            <div className="job-spec-metadata">
              {jobSpec.Published ? (
                <div className="job-spec-meta-item">
                  <span className="job-spec-meta-label">Published</span>
                  <span>{formatDateOnly(jobSpec.Published)}</span>
                </div>
              ) : null }
              {jobSpec.Created ? (
                <div className="job-spec-meta-item">
                  <span className="job-spec-meta-label">Created</span>
                  <span>{formatDate(jobSpec.Created)}</span>
                </div>
              ) : null}
            </div>
          ) : null}
          {jobSpec.PlaceOfWorkId || jobSpec.RoleTypeId || jobSpec.WorkModelId || jobSpec.SalaryExpectation || jobSpec.Benefits.length > 0 ? (
            <div className="job-spec-section">
              {jobSpec.PlaceOfWorkId ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Place of Work</span>
                  <span>{placeOfWork ? `${placeOfWork.label}${placeOfWork.address ? ` — ${placeOfWork.address}` : ''}` : '—'}</span>
                </div>
              ) : null}
              {jobSpec.RoleTypeId ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Role Type</span>
                  <span>{roleTypeName}</span>
                </div>
              ) : null}
              {jobSpec.WorkModelId ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Work Model</span>
                  <span>{workModelName}</span>
                </div>
              ) : null}
              {jobSpec.SalaryExpectation ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Salary Expectation</span>
                  <span>{safeValue(salary)}</span>
                </div>
              ) : null}
              {jobSpec.Benefits.length > 0 ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Benefits</span>
                  <span>{normalizeBenefits(jobSpec.Benefits)}</span>
                </div>
              ) : null}
            </div>
          ) : null}
          {jobSpec.Description ? (
            <div className="job-spec-section job-spec-description-section">
              <h4 className="section-heading">Description</h4>
              <p className="job-spec-description">{safeValue(jobSpec.Description)}</p>
            </div>
          ) : null}

          {jobSpec.Applications.length > 0 && (
            <div className={`job-spec-section application-section ${jobSpec.Applications[0].Discarded ? 'discarded' : ''}`}>
              <div className="section-heading-row">
                <h4 className="section-heading">Application</h4>
                {jobSpec.Applications[0].Discarded ? <span className="section-status">Discarded</span> : null}
              </div>
              {jobSpec.Applications.map((application) => (
                <div key={application.Id || Math.random()} className="application-item">
                  {application.Applied ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Applied Date</span>
                      <span>{formatDateOnly(application.Applied)}</span>
                    </div>
                  ) : null}
                  {application.Confirmed ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Confirmed Date</span>
                      <span>{formatDateOnly(application.Confirmed)}</span>
                    </div>
                  ) : null}
                  {application.Notes ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Notes</span>
                      <span className="job-spec-description">{safeValue(application.Notes)}</span>
                    </div>
                  ) : null}
                  {application.Discarded ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Discarded Date</span>
                      <span>{formatDateOnly(application.Discarded)}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {interviews.length > 0 && (
            <div className="job-spec-section interviews-section">
              <div className="section-heading-row">
                <h4 className="section-heading">Interviews</h4>
              </div>
              {interviews.map((interview) => (
                <div key={interview.Id || Math.random()} className="interview-item">
                  {interview.Scheduled ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Scheduled Date</span>
                      <span>{formatDateTime(interview.Scheduled)}</span>
                    </div>
                  ) : null}
                  {interview.Contact ? (
                    <div className="job-spec-note-row contact-row">
                      <span className="job-spec-note-label">Contact:</span>
                      <span>
                        {interview.Contact.Name || '—'}
                        {interview.Contact.Email ? (
                          <a href={`mailto:${interview.Contact.Email}`} className="job-spec-contact-link">
                            {interview.Contact.Email}
                          </a>
                        ) : null}
                        {interview.Contact.Phone ? <span className="job-spec-contact-phone">{interview.Contact.Phone}</span> : null}
                      </span>
                      {interview.Contact.Details ? (
                        <span className="job-spec-info-icon" title={interview.Contact.Details}>ℹ️</span>
                      ) : null}
                    </div>
                  ) : null}
                  {interview.Notes ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Notes</span>
                      <span className="job-spec-description">{safeValue(interview.Notes)}</span>
                    </div>
                  ) : null}
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
            <div className="job-spec-section offers-section">
              <div className="section-heading-row">
                <h4 className="section-heading">Offer</h4>
              </div>
              {offers.map((offer) => (
                <div key={offer.Id || Math.random()} className="offer-item">
                  {offer.Offered ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Offered Date</span>
                      <span>{formatDateOnly(offer.Offered)}</span>
                    </div>
                  ) : null}
                  {offer.Salary ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Salary</span>
                      <span>{safeValue(offer.Salary)}</span>
                    </div>
                  ) : null}
                  {offer.Benefits ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Benefits</span>
                      <span>{normalizeBenefits(offer.Benefits)}</span>
                    </div>
                  ) : null}
                  {offer.Notes ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Notes</span>
                      <span className="job-spec-description">{safeValue(offer.Notes)}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
