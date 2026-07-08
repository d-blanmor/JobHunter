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

function getWorkModel(spec: any, models: any[]) {
  return models.find((item) => item.Id === spec.WorkModelId) || null;
};

function getRoleType(spec: any, roleTypes: any[]) {
  return roleTypes.find((item) => item.Id === spec.RoleTypeId) || null;
}

function getContact(contactId: any, contacts: any[]) {
  const contact = contacts.find((item) => item.Id === contactId);
  if (!contact) return null;
  return contact;
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
  const [inContact, setInContact] = useState< any > (null);
  // Lookups
  const [lSources, setSources] = useState<SourceItem[]>([]);
  const [lPlacesOfWork, setPlacesOfWork] = useState<PlaceOfWorkItem[]>([]);
  const [lWorkModels, setWorkModels] = useState<luWorkModelItem[]>([]);
  const [lRoleTypes, setRoleTypes] = useState<luRoleTypeItem[]>([]);
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
          luSources, 
          luPlacesOfWork, 
          luWorkModels, 
          luRoleTypes, 
          luContacts,
          luBenefits,
          luTags,
        ] = await Promise.all([
          getJobSpec(Number(id)),
          getJobSpecBenefits(Number(id)).catch(() => []),
          getJobSpecTags(Number(id)).catch(() => []),
          getApplicationsByJobSpec(Number(id)).catch(() => []),
          getInterviewByJobSpec(Number(id)).catch(() => []),
          getOfferByJobSpec(Number(id)).catch(() => []),
          listSources().catch(() => []),
          listPlacesOfWork().catch(() => []),
          listWorkModels().catch(() => []),
          listRoleTypes().catch(() => []),
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
        if (jobSpec.Applications && jobSpec.Applications.length > 0) {
          setInterviews(Array.isArray(interviews) ? interviews : []);
          jobSpec.Applications[0].Interviews = interviews;
          setOffers(Array.isArray(offers) ? offers : []);
          jobSpec.Applications[0].Offers = offers;
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
        }
        setSources(Array.isArray(luSources) ? luSources : []);
        setPlacesOfWork(Array.isArray(luPlacesOfWork) ? luPlacesOfWork : []);
        setWorkModels(Array.isArray(luWorkModels) ? luWorkModels : []);
        setRoleTypes(Array.isArray(luRoleTypes) ? luRoleTypes : []);
        setContacts(Array.isArray(luContacts) ? luContacts : []);
        setBenefits(Array.isArray(luBenefits) ? luBenefits : []);
        setTags(Array.isArray(luTags) ? luTags : []);
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
  const roleType = useMemo(() =>  (jobSpec ? getRoleType(jobSpec, lRoleTypes) : null), [jobSpec]);
  const workModel = useMemo(() => (jobSpec ? getWorkModel(jobSpec, lWorkModels) : null), [jobSpec,lWorkModels]);
  const contact = useMemo(() => (jobSpec ? getContact(jobSpec.ContactId, lContacts) : null), [jobSpec]);
  // TODO: Get assigned benefits in jsBenefits to jobspec
  // TODO: Get assigned tags in jsTags to jobspec
  
  const sourceName = useMemo(() => {
    if (!jobSpec?.SourceId) return '—';
    const found = lSources.find((item) => item.Id === jobSpec.SourceId);
    return found?.Name || '—';
  }, [jobSpec, lSources]);
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
                <span className="job-spec-note-label">Found in</span>
                <span className="job-spec-note-value">{safeValue(source?.Name)}</span>
                {source?.PortalURL ? (
                  <a href={source.PortalURL} target="_blank" rel="noreferrer" className="job-spec-inline-link" title="Open source portal">
                    🔗
                  </a>
                ) : null}
                {source?.Details ? (
                  <span className="job-spec-info-icon" title={source.Details}>ℹ️</span>
                ) : null}
              </div>
            ) : null}

            {jobSpec.ContactId ? (
              <div>
                <div className="job-spec-note-row contact-row">
                  <span className="job-spec-note-label">Contact </span>
                  <span>
                    {contact?.Name || '—'}
                  </span>
                  {contact?.Details ? (
                    <span className="job-spec-info-icon" title={contact.Details}>ℹ️</span>
                  ) : null}
                </div>

              {contact?.Email ? (
                <div className="job-spec-note-row contact-row">
                  <span>
                    <a href={`mailto:${contact.Email}`} target="_blank" rel="noreferrer" className="job-spec-contact-link" title={`Send email to ${contact?.Name || 'contact'}`}>
                      {contact.Email || '—'}
                    </a>
                  </span>
                </div>
                ) : null}

              {contact?.Phone ? (
                <div className="job-spec-note-row contact-row">
                  <span>
                    {contact?.Phone ? <span className="job-spec-contact-phone">{contact.Phone}</span> : null}
                  </span>
                </div>
              ) : null}
            </div>
            ) : null}
          </div>

          {jobSpec.Published || jobSpec.Created ? (
            <div className="job-spec-metadata">
              {jobSpec.Published ? (
                <div className="job-spec-meta-item">
                  <span className="job-spec-meta-label">Published since</span>
                  <span>{formatDateOnly(jobSpec.Published)}</span>
                </div>
              ) : null }
              {jobSpec.Created ? (
                <div className="job-spec-meta-item">
                  <span className="job-spec-meta-label">Tracked since</span>
                  <span>{formatDate(jobSpec.Created)}</span>
                </div>
              ) : null}
            </div>
          ) : null}

          {jobSpec.PlaceOfWorkId || jobSpec.RoleTypeId || jobSpec.WorkModelId || jobSpec.SalaryExpectation || (jobSpec.Benefits && jobSpec.Benefits.length > 0) ? (
            <div className="job-spec-section">
              {jobSpec.PlaceOfWorkId ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Based in </span>
                  {placeOfWork?.city ? (
                    <span>{safeValue(placeOfWork.city)}</span>
                  ) : ''}
                  {placeOfWork?.country ? (
                    <span>{safeValue(placeOfWork.country)}</span>
                  ) : ''}
                  {placeOfWork?.address ? (
                    <span>{safeValue(placeOfWork.address)}</span>
                  ) : ''}
                </div>
              ) : null}
              {jobSpec.RoleTypeId && roleType ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Role Type</span>
                  <span>{safeValue(roleType.Name)}</span>
                </div>
              ) : null}
              {jobSpec.WorkModelId && workModel ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Work Model</span>
                  <span>{safeValue(workModel.Name)}</span>
                </div>
              ) : null}
              {jobSpec.SalaryExpectation ? (
                <div className="job-spec-field-row">
                  <span className="job-spec-field-label">Salary Expectation</span>
                  <span>{safeValue(salary)}</span>
                </div>
              ) : null}
              {jobSpec.Benefits && jobSpec.Benefits.length > 0 ? (
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

          {jobSpec.Analysis ? (
            <div className="job-spec-section job-spec-description-section">
              <h4 className="section-heading">Analysis and recomendations</h4>
              <p className="job-spec-description">{safeValue(jobSpec.Analysis)}</p>
            </div>
          ) : null}

          {jobSpec.Notes ? (
            <div className="job-spec-section job-spec-description-section">
              <h4 className="section-heading">Notes</h4>
              <p className="job-spec-description">{safeValue(jobSpec.Notes)}</p>
            </div>
          ) : null}

          {jobSpec.Applications && jobSpec.Applications.length > 0 && (
            <div className={`job-spec-section application-section ${jobSpec.Applications[0].Discarded ? 'discarded' : ''}`}>
              <div className="section-heading-row">
                <h4 className="section-heading">Application</h4>
                {jobSpec.Applications[0].Discarded ? <span className="section-status">Discarded</span> : null}
              </div>

              {jobSpec.Applications.map((application) => (
                <div key={application.Id || Math.random()} className="application-item">
                  {application.Applied ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Applied on</span>
                      <span>{formatDateOnly(application.Applied)}</span>
                    </div>
                  ) : null}

                  {application.Confirmed ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Confirmed on</span>
                      <span>{formatDateOnly(application.Confirmed)}</span>
                    </div>
                  ) : null}

                  {application.Letter ? (
                    <div className="job-spec-section job-spec-description-section">
                      <h4 className="section-heading">Application letter</h4>
                      <p className="job-spec-description">{safeValue(application.Letter)}</p>
                    </div>
                  ) : null}

                  {application.CV ? (
                    <div className="job-spec-section job-spec-description-section">
                      <h4 className="section-heading">Resume sent</h4>
                      <p className="job-spec-description">{safeValue(application.CV)}</p>
                    </div>
                  ) : null}

                  {application.Notes ? (
                    <div className="job-spec-section job-spec-description-section">
                      <h4 className="section-heading">Notes</h4>
                      <p className="job-spec-description">{safeValue(application.Notes)}</p>
                    </div>
                  ) : null}

                  {application.Discarded ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Discarded on</span>
                      <span>{formatDateOnly(application.Discarded)}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {jobSpec.Applications && jobSpec.Applications[0] && jobSpec.Applications[0].Interviews && jobSpec.Applications[0].Interviews.length > 0 && (
            <div className="job-spec-section interviews-section">
              <div className="section-heading-row">
                <h4 className="section-heading">Interviews</h4>
              </div>

              {jobSpec.Applications[0].Interviews.map((interview) => (
                <div key={interview.Id || Math.random()} className="interview-item">
                  {interview.Scheduled ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Scheduled for</span>
                      <span>{formatDateTime(interview.Scheduled)}</span>
                    </div>
                  ) : null}

                  {interview.ContactId && setInContact(lContacts.find((item) => item.Id === interview.ContactId)) ? (
                    <div className="job-spec-note-row contact-row">
                      <span className="job-spec-note-label">Contact</span>
                      <span>

                        <div>
                          <div className="job-spec-note-row contact-row">
                            <span className="job-spec-note-label">Contact </span>
                            <span>
                              {inContact?.Name || '—'}
                            </span>
                            {inContact?.Details ? (
                              <span className="job-spec-info-icon" title={inContact.Details}>ℹ️</span>
                            ) : null}
                          </div>

                        {inContact?.Email ? (
                          <div className="job-spec-note-row contact-row">
                            <span>
                              <a href={`mailto:${inContact.Email}`} target="_blank" rel="noreferrer" className="job-spec-contact-link" title={`Send email to ${inContact?.Name || 'contact'}`}>
                                {inContact.Email || '—'}
                              </a>
                            </span>
                          </div>
                          ) : null}

                        {inContact?.Phone ? (
                          <div className="job-spec-note-row contact-row">
                            <span>
                              {inContact?.Phone ? <span className="job-spec-contact-phone">{inContact.Phone}</span> : null}
                            </span>
                          </div>
                        ) : null}
                        </div>
                      </span>
                    </div>
                  ) : null}

                  {interview.Description ? (
                    <div className="job-spec-section job-spec-description-section">
                      <h4 className="section-heading">Description</h4>
                      <p className="job-spec-description">{safeValue(interview.Description)}</p>
                    </div>
                  ) : null}

                  {interview.Analysis ? (
                    <div className="job-spec-section job-spec-description-section">
                      <h4 className="section-heading">Recomendations</h4>
                      <p className="job-spec-description">{safeValue(interview.Analysis)}</p>
                    </div>
                  ) : null}

                  {interview.Notes ? (
                    <div className="job-spec-section job-spec-description-section">
                      <h4 className="section-heading">Notes</h4>
                      <p className="job-spec-description">{safeValue(interview.Notes)}</p>
                    </div>
                  ) : null}

                  {interview.Outcome ? (
                    <div className="job-spec-section job-spec-description-section">
                      <h4 className="section-heading">Outcome</h4>
                      <p className="job-spec-description">{safeValue(interview.Outcome)}</p>
                    </div>
                  ) : null}

                  {interview.Feedback ? (
                    <div className="job-spec-section job-spec-description-section">
                      <h4 className="section-heading">Feedback</h4>
                      <p className="job-spec-description">{safeValue(interview.Feedback)}</p>
                    </div>
                  ) : null}

                </div>
              ))}
            </div>
          )}

          {jobSpec.Applications && jobSpec.Applications[0] && jobSpec.Applications[0].Offers && jobSpec.Applications[0].Offers.length > 0 && (
            <div className="job-spec-section offers-section">
              <div className="section-heading-row">
                <h4 className="section-heading">Offer</h4>
              </div>
              {jobSpec.Applications[0].Offers.map((offer) => (
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
