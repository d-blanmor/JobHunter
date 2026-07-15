import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaLink } from 'react-icons/fa';

import JobSpecModal from '../components/JobSpecModal';
import ApplicationModal from '../components/ApplicationModal';
import InterviewModal from '../components/InterviewModal';
import OfferModal from '../components/OfferModal';

import { getJobSpec, getJobSpecBenefits, getJobSpecTags } from '../api/jobSpecs';
import { getApplicationsByJobSpec, getApplication } from '../api/applications';
import { getInterviewByJobSpec } from '../api/interviews';
import { getOfferByJobSpec, getOfferBenefits } from '../api/offers';
import { listPlacesOfWork } from '../api/place_of_work';
import { listWorkModels } from '../api/lu_workmodels';
import { listRoleTypes } from '../api/lu_roletypes';
import { listBenefits } from '../api/lu_benefits';
import { listLocations } from '../api/lu_locations';
import { listSources } from '../api/sources';
import { listContacts } from '../api/contacts';
import { listTags } from '../api/tags';

import { 
  formatDate, 
  formatDateOnly, 
  formatDateTime, 
  formatFieldDate, 
  safeValue,
  getSourceItem,
  getWorkModelItem,
  getRoleTypeItem,
  getContactItem,
  normalizeBenefits,
  getPlaceOfWorkLabel
  } from '../defs/tools'
import { 
  JobSpecItem, 
  ApplicationItem,
  InterviewItem,
  SourceItem, 
  PlaceOfWorkItem,
  luLocationItem, 
  luWorkModelItem,
  luRoleTypeItem,
  ContactItem, 
  TagItem,
  luBenefitItem,
  } from '../defs/interfaces';

export default function JobSpecView() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [modalEditJobSpec, setModalEditJobSpec] = useState(false);
  const [modalEditApplication, setModalEditApplication] = useState(false);
  const [modalEditInterview, setModalEditInterview] = useState(false);
  const [modalEditOffer, setModalEditOffer] = useState(false);
  const [showJsDescription, setShowJsDescription] = useState(true);
  const [showJsAnalysis, setShowJsAnalysis] = useState(false);
  const [showJsNotes, setShowJsNotes] = useState(false);
  const [showApLetter, setShowApLetter] = useState(false);
  const [showApCV, setShowApCV] = useState(false);
  const [showApNotes, setShowApNotes] = useState(false);
  const [showInDescription, setShowInDescription] = useState(false);
  const [showInAnalysis, setShowInAnalysis] = useState(false);
  const [showInNotes, setShowInNotes] = useState(false);
  const [showInOutcome, setShowInOutcome] = useState(false);
  const [showInFeedback, setShowInFeedback] = useState(false);
  const [showOfNotes, setShowOfNotes] = useState(false);

  // Entities
  const [jobSpec, setJobSpec] = useState<JobSpecItem | null>(null);
  const [jsBenefits, setJsBenefits] = useState<luBenefitItem[]>([]);
  const [jsTags, setJSTags] = useState<TagItem[]>([]);
  const [inContact, setInContact] = useState< any > (null);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [application, setApplication] = useState<ApplicationItem | null>(null);
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [offerId, setOfferId] = useState<number | null>(null);
  // Lookups
  const [lPlacesOfWork, setPlacesOfWork] = useState<PlaceOfWorkItem[]>([]);
  const [lSources, setSources] = useState<SourceItem[]>([]);
  const [lLocations, setLocations] = useState<luLocationItem[]>([]);
  const [lWorkModels, setWorkModels] = useState<luWorkModelItem[]>([]);
  const [lRoleTypes, setRoleTypes] = useState<luRoleTypeItem[]>([]);
  const [lContacts, setContacts] = useState<ContactItem[]>([]);
  const [lBenefits, setBenefits] = useState<luBenefitItem[]>([]); 
  const [lTags, setTags] = useState<TagItem[]>([]);
  const [placeOfWorkLabel, setPlaceOfWorkLabel] = useState<string | ''>('');
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
          placesOfWork,
          luSources, 
          luLocations,
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
          listPlacesOfWork().catch(() => []),
          listSources().catch(() => []),
          listLocations().catch(() => []),
          listWorkModels().catch(() => []),
          listRoleTypes().catch(() => []),
          listContacts().catch(() => []),
          listBenefits().catch(() => []),
          listTags().catch(() => []),
        ]);

        if (!mounted) return;

        setPlacesOfWork(Array.isArray(placesOfWork) ? placesOfWork : []);
        setSources(Array.isArray(luSources) ? luSources : []);
        setLocations(Array.isArray(luLocations) ? luLocations : []);
        setWorkModels(Array.isArray(luWorkModels) ? luWorkModels : []);
        setRoleTypes(Array.isArray(luRoleTypes) ? luRoleTypes : []);
        setContacts(Array.isArray(luContacts) ? luContacts : []);
        setBenefits(Array.isArray(luBenefits) ? luBenefits : []);
        setTags(Array.isArray(luTags) ? luTags : []);

        setJobSpec(jobSpec);
        setJsBenefits(jsBenefits || []);
        if (jobSpec.PlaceOfWorkId) setPlaceOfWorkLabel(await getPlaceOfWorkLabel(jobSpec.PlaceOfWorkId));
        jobSpec.Benefits = jsBenefits;
        setJSTags(jsTags || []);
        jobSpec.Tags = jsTags;
        jobSpec.Applications = [];
        if (applications && applications.length > 0) {
          jobSpec.Applications = applications;
          if (jobSpec.Applications && jobSpec.Applications.length > 0) {
            setApplicationId(jobSpec.Applications[0].Id);
            jobSpec.Applications[0].Interviews = [];
            if (interviews && interviews.length > 0) {
              jobSpec.Applications[0].Interviews = interviews;
              for (let i = 0; i<jobSpec.Applications[0].Interviews.length; i++) {
                if (jobSpec.Applications[0].Interviews[i].ContactId) {
                  lContacts.find((contact: ContactItem) => contact.Id === jobSpec.Applications[0].Interviews[i].ContactId);
                  jobSpec.Applications[0].Interviews[i].Contact = contact;
                }
              }
            }
            jobSpec.Applications[0].Offers = [];
            if (offers && offers.length > 0) {
              jobSpec.Applications[0].Offers = offers;
              for (let i = 0; i<jobSpec.Applications[0].Offers.length; i++) {
                const ofBenefits = await (getOfferBenefits(Number(jobSpec.Applications[0].Offers[i].id)).catch(() => []));
                jobSpec.Applications[0].Offers[i].Benefits = ofBenefits;
              }
            }
          }
        }
      } 
      catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load job spec');
      } 
      finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const source = useMemo(() => (jobSpec ? getSourceItem(jobSpec, lSources) : null), [jobSpec, lSources]);
  const roleType = useMemo(() =>  (jobSpec ? getRoleTypeItem(jobSpec, lRoleTypes) : null), [jobSpec]);
  const workModel = useMemo(() => (jobSpec ? getWorkModelItem(jobSpec, lWorkModels) : null), [jobSpec,lWorkModels]);
  const contact = useMemo(() => (jobSpec ? getContactItem(jobSpec.ContactId, lContacts) : null), [jobSpec]);
  // TODO: Get assigned benefits in jsBenefits to jobspec
  // TODO: Get assigned tags in jsTags to jobspec

  const salary = jobSpec?.SalaryExpectation ||  '—';
  const benefits = normalizeBenefits(jobSpec?.Benefits ?? jobSpec?.Benefits);

  const refreshJobSpec = async (mounted: boolean = true) => {
    try {
      const [
        jobSpec, 
        jsBenefits,
        jsTags,
        applications, 
        interviews, 
        offers
      ] = await Promise.all([
        getJobSpec(Number(id)),
        getJobSpecBenefits(Number(id)).catch(() => []),
        getJobSpecTags(Number(id)).catch(() => []),
        getApplicationsByJobSpec(Number(id)).catch(() => []),
        getInterviewByJobSpec(Number(id)).catch(() => []),
        getOfferByJobSpec(Number(id)).catch(() => [])
      ]);
      setJobSpec(jobSpec);
      setJsBenefits(jsBenefits || []);
      jobSpec.PlacesOfWork = placeOfWorkLabel;
      jobSpec.Benefits = jsBenefits;
      setJSTags(jsTags || []);
      jobSpec.Tags = jsTags;
      jobSpec.Applications = applications;
      setInterviewId(null);
      if (jobSpec.Applications && jobSpec.Applications.length > 0) {
        setApplicationId(jobSpec.Applications[0].Id);
        jobSpec.Applications[0].Interviews = interviews;
        jobSpec.Applications[0].Offers = offers;
        if (Array.isArray(jobSpec.Applications) && jobSpec.Applications.length > 0) {
          if (Array.isArray(jobSpec.Applications[0].Interviews) && jobSpec.Applications[0].Interviews.length > 0) {
            for (let i = 0; i<jobSpec.Applications[0].Interviews.length; i++) {
              if (jobSpec.Applications[0].Interviews[i].ContactId) {
                lContacts.find((contact: ContactItem) => contact.Id === jobSpec.Applications[0].Interviews[i].ContactId);
                jobSpec.Applications[0].Interviews[i].Contact = contact;
              }
            }
          }

          if (Array.isArray(jobSpec.Applications[0].Offers) && jobSpec.Applications[0].Offers.length > 0) {
            for (let i = 0; i<jobSpec.Applications[0].Offers.length; i++) {
              const ofBenefits = await (getOfferBenefits(Number(jobSpec.Applications[0].Offers[i].id)).catch(() => []));
              jobSpec.Applications[0].Offers[i].Benefits = ofBenefits;
            }
          }
        }
      }
    }
    catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load contacts',
        );
    } 
    finally {}
  };

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
              <span className="page-header-link" title='Edit Job Spec' onClick={() => {setModalEditJobSpec(true);}}><FaEdit aria-hidden="true" /></span>

              <span className="job-spec-title">
                {safeValue(jobSpec.Position)}
              </span>

              {jobSpec.Link ? (
                <span className="page-header-link">
                  <a className="page-header-link" title={`link to: ${jobSpec.Link}`} href={jobSpec.Link} target="_blank" rel="noreferrer">
                    <FaLink aria-hidden="true" />
                  </a>
                </span>
              ) : null}

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
                  <span>{placeOfWorkLabel}</span>
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

          {jobSpec.Description && showJsDescription ? (
            <div className="job-spec-section job-spec-description-section">
              <div className="job-spec-section-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowJsDescription(false)}><h4 className="section-heading">▼ Description</h4></div>
              <p className="job-spec-description">{safeValue(jobSpec.Description)}</p>
            </div>
          ) : (jobSpec.Description ? (
            <div className="job-spec-section job-spec-description-section">
              <div className="job-spec-section-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowJsDescription(true)}><h4 className="section-heading">▶ Description</h4></div>
            </div>
          ) : null )}

          {jobSpec.Analysis && showJsAnalysis ? (
            <div className="job-spec-section job-spec-description-section">
              <div className="job-spec-section-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowJsAnalysis(false)}><h4 className="section-heading">▼ Analysis and recomendations</h4></div>
              <p className="job-spec-description">{safeValue(jobSpec.Analysis)}</p>
            </div>
          ) : (jobSpec.Analysis ? (
            <div className="job-spec-section job-spec-description-section">
              <div className="job-spec-section-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowJsAnalysis(true)}><h4 className="section-heading">▶ Analysis and recomendations</h4></div>
            </div>
          ) : null )}

          {jobSpec.Notes && showJsNotes ? (
            <div className="job-spec-section job-spec-description-section">
              <div className="job-spec-section-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowJsNotes(false)}><h4 className="section-heading">▼ Notes</h4></div>
              <p className="job-spec-description">{safeValue(jobSpec.Notes)}</p>
            </div>
          ) : (jobSpec.Notes ? (
            <div className="job-spec-section job-spec-description-section">
              <div className="job-spec-section-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowJsNotes(true)}><h4 className="section-heading">▶ Notes</h4></div>
            </div>
          ) : null )}

          <div className="modal-actions">
            <button className="button" 
                onClick={() => {
                  setModalEditJobSpec(true);
                }}
            >
              Edit JobSpec
            </button>
          </div>

          {jobSpec.Applications && jobSpec.Applications.length > 0 && (
            <div className={`job-spec-section application-section ${jobSpec.Applications[0].Discarded ? 'discarded' : ''}`}>
              <div className="section-heading-row">
                <h4 className="section-heading">Application</h4>
                {jobSpec.Applications[0].Discarded ? <span className="section-status">Discarded</span> : null}
              </div>

              {jobSpec.Applications.map((application) => (
                <div key={application.Id || Math.random()} className="application-item">
                  <div className="job-spec-metadata">
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
                  </div>
                  {application.Letter && showApLetter ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowApLetter(false)}><h4 className="section-heading">▼ Cover Letter</h4></div>
                      <p className="job-spec-description">{safeValue(application.Letter)}</p>
                    </div>
                  ) : (application.Letter ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowApLetter(true)}><h4 className="section-heading">▶ Cover Letter</h4></div>
                    </div>
                  ) : null )}

                  {application.CV && showApCV ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowApCV(false)}><h4 className="section-heading">▼ Resume sent</h4></div>
                      <p className="job-spec-description">{safeValue(application.CV)}</p>
                    </div>
                  ) : (application.CV ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowApCV(true)}><h4 className="section-heading">▶ Resume sent</h4></div>
                    </div>
                  ) : null )}

                  {application.Notes && showApNotes ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowApNotes(false)}><h4 className="section-heading">▼ Notes</h4></div>
                      <p className="job-spec-description">{safeValue(application.Notes)}</p>
                    </div>
                  ) : (application.Notes ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowApNotes(true)}><h4 className="section-heading">▶ Notes</h4></div>
                    </div>
                  ) : null )}

                  {application.Discarded ? (
                    <div className="job-spec-field-row">
                      <span className="job-spec-field-label">Discarded on</span>
                      <span>{formatDateOnly(application.Discarded)}</span>
                    </div>
                  ) : null}
                  {application.Id ? (
                    <div className="modal-actions">
                      <button className="button" 
                          onClick={() => {
                            setModalEditApplication(true);
                          }}
                      >
                        Edit Application
                      </button>
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
                  {interview.ContactId ? (
                    <div className="job-spec-note-row contact-row">
                      <span className="job-spec-note-label">Contact </span>
                      <span>
                        {interview.Contact?.Name || '—'}
                      </span>
                      {interview.Contact?.Details ? (
                        <span className="job-spec-info-icon" title={interview.Contact.Details}>ℹ️</span>
                      ) : null}
                    </div>
                  ) : ''}

                  {interview.Contact?.Email ? (
                    <div className="job-spec-note-row contact-row">
                      <span>
                        <a href={`mailto:${interview.Contact.Email}`} target="_blank" rel="noreferrer" className="job-spec-contact-link" title={`Send email to ${interview.Contact?.Name || 'contact'}`}>
                          {interview.Contact.Email || '—'}
                        </a>
                      </span>
                    </div>
                  ) : ''}

                  {interview.Contact?.Phone ? (
                    <div className="job-spec-note-row contact-row">
                      <span>
                        {interview.Contact?.Phone ? <span className="job-spec-contact-phone">{interview.Contact.Phone}</span> : ''}
                      </span>
                    </div>
                  ) : ''}

                  {interview.Description && showInDescription ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInDescription(false)}><h4 className="section-heading">▼ Description</h4></div>
                      <p className="job-spec-description">{safeValue(interview.Description)}</p>
                    </div>
                  ) : (interview.Description ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInDescription(true)}><h4 className="section-heading">▶ Description</h4></div>
                    </div>
                  ) : null )}

                  {interview.Analysis && showInAnalysis ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInAnalysis(false)}><h4 className="section-heading">▼ Recomendations</h4></div>
                      <p className="job-spec-description">{safeValue(interview.Analysis)}</p>
                    </div>
                  ) : (interview.Analysis ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInAnalysis(true)}><h4 className="section-heading">▶ Recomendations</h4></div>
                    </div>
                  ) : null )}

                  {interview.Notes && showInNotes ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInNotes(false)}><h4 className="section-heading">▼ Notes</h4></div>
                      <p className="job-spec-description">{safeValue(interview.Notes)}</p>
                    </div>
                  ) : (interview.Notes ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInNotes(true)}><h4 className="section-heading">▶ Notes</h4></div>
                    </div>
                  ) : null )}

                  {interview.Outcome && showInOutcome ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInOutcome(false)}><h4 className="section-heading">▼ Outcome</h4></div>
                      <p className="job-spec-description">{safeValue(interview.Outcome)}</p>
                    </div>
                  ) : (interview.Outcome ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInOutcome(true)}><h4 className="section-heading">▶ Outcome</h4></div>
                    </div>
                  ) : null )}

                  {interview.Feedback && showInFeedback ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInFeedback(false)}><h4 className="section-heading">▼ Feedback</h4></div>
                      <p className="job-spec-description">{safeValue(interview.Feedback)}</p>
                    </div>
                  ) : (interview.Feedback ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowInFeedback(true)}><h4 className="section-heading">▶ Feedback</h4></div>
                    </div>
                  ) : null )}

                  {interview.Id ? (
                    <div className="modal-actions">
                      <button className="button" 
                          onClick={() => {
                            setInterviewId(interview.Id);
                            setModalEditInterview(true);
                          }}
                      >
                        Edit Interview
                      </button>
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

                  {offer.Notes && showOfNotes ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowOfNotes(false)}><h4 className="section-heading">▼ Notes</h4></div>
                      <p className="job-spec-description">{safeValue(offer.Notes)}</p>
                    </div>
                  ) : (offer.Notes ? (
                    <div className="job-spec-section job-spec-description-section">
                      <div className="job-spec-section-clickable"
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowOfNotes(true)}><h4 className="section-heading">▶ Notes</h4></div>
                    </div>
                  ) : null )}

                  {offer.Id ? (
                    <div className="modal-actions">
                      <button className="button" 
                          onClick={() => {
                            setOfferId(offer.Id);
                            setModalEditOffer(true);
                          }}
                      >
                        Edit Offer
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modalEditJobSpec && (
        <JobSpecModal
          jobSpecId={jobSpec?.Id || null}
          title = "Edit job spec"
          onClose={() => setModalEditJobSpec(false)}
          onSuccess={async () => {
            await refreshJobSpec(true); // refresh portal list after modal close
            setModalEditJobSpec(false);
          }}
        />
      )}

      {modalEditApplication && (
        <ApplicationModal
          applicationId={applicationId}
          jobSpecId={jobSpec?.Id || null}
          title = "Edit application"
          onClose={() => setModalEditApplication(false)}
          onSuccess={async () => {
            await refreshJobSpec(true); // refresh portal list after modal close
            setModalEditApplication(false);
          }}
        />
      )}

      {modalEditInterview && (
        <InterviewModal
          interviewId={interviewId}
          applicationId={applicationId}
          title = "Edit interview"
          onClose={() => setModalEditInterview(false)}
          onSuccess={async () => {
            await refreshJobSpec(true); // refresh portal list after modal close
            setModalEditInterview(false);
          }}
        />
      )}

      {modalEditOffer && (
        <OfferModal
          offerId={offerId}
          applicationId={applicationId}
          title = "Edit offer"
          onClose={() => setModalEditOffer(false)}
          onSuccess={async () => {
            await refreshJobSpec(true); // refresh portal list after modal close
            setModalEditOffer(false);
          }}
        />
      )}

    </section>
  );
}
