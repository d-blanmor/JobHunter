import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaIdBadge, FaExternalLinkAlt, FaEnvelopeSquare, FaPhoneSquareAlt, FaRegArrowAltCircleRight, FaRegArrowAltCircleDown } from 'react-icons/fa';
import { BsInfoCircle } from "react-icons/bs";
import ReactMarkdown from 'react-markdown';

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
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showJsDescription, setShowJsDescription] = useState(true);
  const [showJsAnalysis, setShowJsAnalysis] = useState(false);
  const [showJsNotes, setShowJsNotes] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [showApLetter, setShowApLetter] = useState(false);
  const [showApCV, setShowApCV] = useState(false);
  const [showApNotes, setShowApNotes] = useState(false);
  const [showInterviews, setShowInterviews] = useState(false);
  const [showIvContactDetails, setShowIvContactDetails] = useState(false);
  const [showInDescription, setShowInDescription] = useState(false);
  const [showInAnalysis, setShowInAnalysis] = useState(false);
  const [showInNotes, setShowInNotes] = useState(false);
  const [showInOutcome, setShowInOutcome] = useState(false);
  const [showInFeedback, setShowInFeedback] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
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

  const getModalTitle = (modal: string) => {
    var title: string = '';

    if (modal.toLowerCase() === 'jobspec') {
      title = 'Edit job spec';
      if (jobSpec != null) {
        if (jobSpec.Company) title = `${title} for ${jobSpec.Position} at ${jobSpec.Company}`
        else title = `${title} for ${jobSpec.Position}`
      }
    }
    else if (modal.toLowerCase() === 'application') {
      title = 'Edit application';
      if (jobSpec != null) {
        if (jobSpec.Company) title = `${title} for ${jobSpec.Position} at ${jobSpec.Company}`
        else title = `${title} for ${jobSpec.Position}`
      }
    }
    else if (modal.toLowerCase() === 'interview') {
      title = 'Edit interview';
      if (jobSpec != null) {
        if (jobSpec.Company) title = `${title} for ${jobSpec.Position} at ${jobSpec.Company}`
        else title = `${title} for ${jobSpec.Position}`
      }
    }
    else if (modal.toLowerCase() === 'offer') {
      title = 'Edit offer';
      if (jobSpec != null) {
        if (jobSpec.Company) title = `${title} for ${jobSpec.Position} at ${jobSpec.Company}`
        else title = `${title} for ${jobSpec.Position}`
      }
    }
    return title;
  }

  return (
    <section className="page">
      {loading && (
        <div className="page-header-row">
          <div>
            <h2 className="job-spec-title"><p>Loading job spec...</p></h2>
          </div>
          <button className="action-button" onClick={() => navigate(-1)}>Back</button>
        </div>
      )}
      {error && (
        <div className="page-header-row">
          <div>
            <h2 className="job-spec-title"><p className="error">{error}</p></h2>
          </div>
          <button className="action-button" onClick={() => navigate(-1)}>Back</button>
        </div>
      )}

      {!loading && !error && jobSpec && (
        <div className="job-spec-view">
          <div className="page-header-action">
            <span className="job-spec-subtitle-link" 
                  title='Edit Job Spec' 
                  onClick={() => {setModalEditJobSpec(true);}}>
              <FaEdit aria-hidden="true" />
            </span>
            <button className="action-button" onClick={() => navigate(-1)}>Back</button>
          </div>
          <div className="page-header-row">
            <div>
              <span className="job-spec-title">
                {safeValue(jobSpec.Position)}
              </span>
              {jobSpec.Link ? (
                <span className="job-spec-title-link  ">
                  <a className="job-spec-label" title={`link to: ${jobSpec.Link}`} href={jobSpec.Link} target="_blank" rel="noreferrer">
                    <FaExternalLinkAlt aria-hidden="true" />
                  </a>
                </span>
              ) : null}
              {jobSpec.Company ? (
                <p className="job-spec-subtitle">{safeValue(jobSpec.Company)}</p>
              ) : (
                <p className="job-spec-subtitle">- Unknown Company -</p>
              )}
            </div>
          </div>

          <div className="job-spec">
            {jobSpec.SourceId ? (
              <div className="job-spec-row">
                {jobSpec.SourceId ? (
                  <div className="job-spec-field-row">
                    <span className="job-spec-label">
                      {source?.Details ? (<span title={source.Details}><BsInfoCircle /></span>) : null} Found in
                    </span>
                    <span className="job-spec-value">
                      {safeValue(source?.Name)} {source?.PortalURL ? (<a href={`source.PortalURL`} target="_blank" rel="noreferrer" className="job-spec-label" title="Open source portal"><FaExternalLinkAlt /></a>) : null}
                    </span>
                  </div>
                ) : (null) }
              </div>
            ) : (null) }

            {jobSpec.ContactId ? (
              <div className="job-spec">
                {jobSpec.ContactId && showContactDetails ? (
                  <div className="jov-spec-contact-card">
                    <div className="job-spec-contact">
                      {contact?.Details ? (
                        <span className="job-spec-label-link" title={contact.Details}>
                          <a className="job-spec-label" onClick={() => setShowContactDetails(false)}><FaIdBadge /></a> 
                        </span>
                      ) : (
                        <span className="job-spec-label-link">
                          <a className="job-spec-label" onClick={() => setShowContactDetails(false)}><FaIdBadge /></a> 
                        </span>
                      )}
                      <span className="job-spec-value">
                        {contact?.Name || '—'}
                      </span>
                    </div>
                    <div className="job-spec-contact">
                      {contact?.Email ? (
                        <span className="job-spec-contact">
                          <a href={`mailto:${contact.Email}`} target="_blank" rel="noreferrer" className="job-spec-label" title={`Send email to ${contact?.Name || 'contact'}`}>
                            <FaEnvelopeSquare /> 
                          </a>
                          <span className="job-spec-value">{contact.Email}</span>
                        </span>
                      ) : null}
                    </div>
                    <div className="job-spec-contact">
                      {contact?.Phone ? (
                        <span className="job-spec-contact">
                          <a className="job-spec-label"><FaPhoneSquareAlt /></a> 
                          <span className="job-spec-value">{contact.Phone}</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                ) : 
                jobSpec.ContactId ? (
                  <div className="jov-spec-contact-card">
                    <div className="job-spec-contact">
                      {contact?.Details ? (
                        <span className="job-spec-label-link" title={contact.Details}>
                          <a className="job-spec-label" onClick={() => setShowContactDetails(true)}><FaIdBadge /></a> 
                        </span>
                      ) : (
                        <span className="job-spec-label-link">
                          <a className="job-spec-label" onClick={() => setShowContactDetails(true)}><FaIdBadge /></a> 
                        </span>
                      )}
                      <span className="job-spec-value">
                        {contact?.Name || '—'}
                      </span>
                    </div>
                  </div>
                ) : (null)}
              </div>
            ) : (null) }

            {jobSpec.Published || jobSpec.Created ? (
              <div className="job-spec-row">
                {jobSpec.Published ? (
                  <div className="job-spec-field-row">
                    <span className="job-spec-label">Published since</span>
                    <span className="job-spec-value">{formatDateOnly(jobSpec.Published)}</span>
                  </div>
                ) : null }
                {jobSpec.Created ? (
                  <div className="job-spec-field-row">
                    <span className="job-spec-label">Tracked since</span>
                    <span className="job-spec-value">{formatDateOnly(jobSpec.Created)}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            {jobSpec.PlaceOfWorkId ? (
              <div className="job-spec-row">
                <div className="job-spec-field-row">
                  <span className="job-spec-label">Based in </span>
                  <span className="job-spec-value">{placeOfWorkLabel}</span>
                </div>
              </div>
            ) : null}

            {jobSpec.RoleTypeId || jobSpec.WorkModelId || jobSpec.SalaryExpectation || (jobSpec.Benefits && jobSpec.Benefits.length > 0) ? (
              <div className="job-spec-row">
                {jobSpec.RoleTypeId && roleType ? (
                  <div className="job-spec-field-row">
                    <span className="job-spec-label">Role Type</span>
                    <span className="job-spec-value">{safeValue(roleType.Name)}</span>
                  </div>
                ) : null}
                {jobSpec.WorkModelId && workModel ? (
                  <div className="job-spec-field-row">
                    <span className="job-spec-label">Work Model</span>
                    <span className="job-spec-value">{safeValue(workModel.Name)}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
            {jobSpec.RoleTypeId || jobSpec.WorkModelId || jobSpec.SalaryExpectation || (jobSpec.Benefits && jobSpec.Benefits.length > 0) ? (
              <div className="job-spec-row">
                {jobSpec.SalaryExpectation ? (
                  <div className="job-spec-field-row">
                    <span className="job-spec-label">Salary Expectation</span>
                    <span className="job-spec-value">{safeValue(salary)}</span>
                  </div>
                ) : null}
                {jobSpec.Benefits && jobSpec.Benefits.length > 0 ? (
                  <div className="job-spec-field-row">
                    <span className="job-spec-label">Benefits</span>
                    <span className="job-spec-value">{normalizeBenefits(jobSpec.Benefits)}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {jobSpec.Description || jobSpec.Analysis || jobSpec.Notes ? (
            <div className="job-spec">
              {jobSpec.Description && showJsDescription ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsDescription(false)}>
                    <h4 className="section-heading"><FaRegArrowAltCircleDown /> Description</h4>
                  </div>
                  <ReactMarkdown>{safeValue(jobSpec.Description)}</ReactMarkdown>
                </div>
              ) : (jobSpec.Description ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsDescription(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Description</h4></div>
                </div>
              ) : null )}

              {jobSpec.Analysis && showJsAnalysis ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsAnalysis(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Analysis and recomendations</h4></div>
                  <ReactMarkdown>{safeValue(jobSpec.Analysis)}</ReactMarkdown>
                </div>
              ) : (jobSpec.Analysis ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsAnalysis(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Analysis and recomendations</h4></div>
                </div>
              ) : null )}

              {jobSpec.Notes && showJsNotes ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsNotes(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Notes</h4></div>
                  <ReactMarkdown>{safeValue(jobSpec.Notes)}</ReactMarkdown>
                </div>
              ) : (jobSpec.Notes ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsNotes(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Notes</h4></div>
                </div>
              ) : null )}
            </div>
          ) : (null)}
          
          {jobSpec.Applications && jobSpec.Applications.length > 0 ? (
            showApplications ? (
              <div className={`${jobSpec.Applications[0].Discarded ? 'job-spec-discarded' : 'job-spec'}`}>
                <div className="application-row">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowApplications(false)}>
                    <h4 className="section-heading"> 
                      <FaRegArrowAltCircleDown /> Application {jobSpec.Applications[0].Discarded ? (`(Discarded)`) : (null)}
                    </h4>
                  </div>
                </div>
                {jobSpec.Applications.map((application) => (
                  <div key={application.Id || Math.random()}>
                    {application.Id ? (
                      <div className="application-row">
                        <span className="job-spec-label-link" 
                              title='Edit Application' 
                              onClick={() => {setModalEditApplication(true);}}>
                          <FaEdit aria-hidden="true" />
                        </span>
                        {application.Applied ? (
                          <>
                            <span className="job-spec-label">Applied on</span>
                            <span className="job-spec-value">{formatDateOnly(application.Applied)}</span>
                          </>
                        ) : (null)}
                        {application.Confirmed ? (
                          <>
                            <span className="job-spec-label">Confirmed on</span>
                            <span className="job-spec-value">{formatDateOnly(application.Confirmed)}</span>
                          </>
                        ) : (null)}
                        {application.Discarded ? (
                          <>
                            <span className="job-spec-label">Discarded on</span>
                            <span className="job-spec-value">{formatDateOnly(application.Discarded)}</span>
                          </>
                        ) : (null)}
                      </div>
                    ) : (null)}
                    {application.Letter || application.CV || application.Notes ? (
                      <div className={`${application.Discarded ? 'job-spec-decorated-discarded' : 'job-spec-decorated'}`}>
                        {application.Letter && showApLetter ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApLetter(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Cover Letter</h4></div>
                            <ReactMarkdown>{safeValue(application.Letter)}</ReactMarkdown>
                          </div>
                        ) : (application.Letter ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApLetter(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Cover Letter</h4></div>
                          </div>
                        ) : null )}

                        {application.CV && showApCV ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApCV(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Resume sent</h4></div>
                            <ReactMarkdown>{safeValue(application.CV)}</ReactMarkdown>
                          </div>
                        ) : (application.CV ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApCV(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Resume sent</h4></div>
                          </div>
                        ) : null )}

                        {application.Notes && showApNotes ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApNotes(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Notes</h4></div>
                            <ReactMarkdown>{safeValue(application.Notes)}</ReactMarkdown>
                          </div>
                        ) : (application.Notes ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApNotes(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Notes</h4></div>
                          </div>
                        ) : null )}
                      </div>
                    ) : ( null )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${jobSpec.Applications[0].Discarded ? 'job-spec-discarded' : 'job-spec'}`}>
                <div>
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowApplications(true)}>
                    <h4 className="section-heading"> 
                      <FaRegArrowAltCircleRight /> Application {jobSpec.Applications[0].Discarded ? (`(Discarded)`) : (null)}
                    </h4>
                  </div>
                </div>
              </div>
            )) : (null)
          }

          {jobSpec.Applications && jobSpec.Applications[0] && jobSpec.Applications[0].Interviews && jobSpec.Applications[0].Interviews.length > 0 ? (
            showInterviews ? (
              <div className="job-spec">
                <div className="interview-row">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowInterviews(false)}>
                    <h4 className="section-heading">
                      <FaRegArrowAltCircleDown /> Interviews
                    </h4>
                  </div>
                </div>

                {jobSpec.Applications[0].Interviews.map((interview) => (
                  <div key={interview.Id || Math.random()} className="job-spec">
                    <div className="job-spec-meta-item">
                      {interview.Id ? (
                        <div className="interview-row">
                          <span className="job-spec-label-link" 
                                title='Edit Interview' 
                                onClick={() => {
                                    setInterviewId(interview.Id);
                                    setModalEditInterview(true);
                                  }}>
                            <FaEdit aria-hidden="true" />
                          </span>
                          {interview.Scheduled ? (
                            <>
                              <span className="job-spec-label">Scheduled for</span>
                              <span className="job-spec-value">{formatDateTime(interview.Scheduled)}</span>
                            </>
                          ) : null}
                        </div>
                      ) : (null)}
                      {interview.ContactId && showIvContactDetails ? (
                        <div className="jov-spec-contact-card">
                          <div className="job-spec-contact">
                            {interview.Contact?.Details ? (
                              <span className="job-spec-label-link" title={interview.Contact.Details}><a className="job-spec-label" onClick={() => setShowIvContactDetails(false)}><FaIdBadge /></a></span>
                            ) : <span className="job-spec-label-link"><a className="job-spec-label" onClick={() => setShowIvContactDetails(false)}><FaIdBadge /></a></span>}
                            <span className="job-spec-value">
                              {interview.Contact?.Name || '—'}
                            </span>
                          </div>
                          <div className="job-spec-contact">
                            {interview.Contact?.Email ? (
                              <span className="job-spec-contact">
                                <a href={`mailto:${interview.Contact.Email}`} target="_blank" rel="noreferrer" className="job-spec-label" title={`Send email to ${interview.Contact?.Name || 'contact'}`}>
                                  <FaEnvelopeSquare /> 
                                </a>
                                <span className="job-spec-value">{interview.Contact.Email}</span>
                              </span>
                            ) : null}
                          </div>
                          <div className="job-spec-contact">
                            {interview.Contact?.Phone ? (
                              <span className="job-spec-contact">
                                <a className="job-spec-label"><FaPhoneSquareAlt /></a> 
                                <span className="job-spec-value">{interview.Contact.Phone}</span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : 
                      interview.ContactId ? (
                        <div className="jov-spec-contact-card">
                          <div className="job-spec-contact">
                            {interview.Contact?.Details ? (
                              <span className="job-spec-label-link" title={interview.Contact.Details}><a className="job-spec-label" onClick={() => setShowIvContactDetails(true)}><FaIdBadge /></a></span>
                            ) : <span className="job-spec-label-link"><a className="job-spec-label" onClick={() => setShowIvContactDetails(true)}><FaIdBadge /></a></span>}
                            <span className="job-spec-value">
                              {interview.Contact?.Name || '—'}
                            </span>
                          </div>
                        </div>
                      ) : (null)}

                      {interview.Description || interview.Analysis || interview.Notes || interview.Outcome || interview.Feedback ? (
                        <div className="job-spec-decorated">

                          {interview.Description && showInDescription ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInDescription(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Description</h4></div>
                              <ReactMarkdown>{safeValue(interview.Description)}</ReactMarkdown>
                            </div>
                          ) : (interview.Description ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInDescription(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Description</h4></div>
                            </div>
                          ) : null )}

                          {interview.Analysis && showInAnalysis ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInAnalysis(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Recomendations</h4></div>
                              <ReactMarkdown>{safeValue(interview.Analysis)}</ReactMarkdown>
                            </div>
                          ) : (interview.Analysis ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInAnalysis(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Recomendations</h4></div>
                            </div>
                          ) : null )}

                          {interview.Notes && showInNotes ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInNotes(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Notes</h4></div>
                              <ReactMarkdown>{safeValue(interview.Notes)}</ReactMarkdown>
                            </div>
                          ) : (interview.Notes ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInNotes(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Notes</h4></div>
                            </div>
                          ) : null )}

                          {interview.Outcome && showInOutcome ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInOutcome(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Outcome</h4></div>
                              <ReactMarkdown>{safeValue(interview.Outcome)}</ReactMarkdown>
                            </div>
                          ) : (interview.Outcome ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInOutcome(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Outcome</h4></div>
                            </div>
                          ) : null )}

                          {interview.Feedback && showInFeedback ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInFeedback(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Feedback</h4></div>
                              <ReactMarkdown>{safeValue(interview.Feedback)}</ReactMarkdown>
                            </div>
                          ) : (interview.Feedback ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInFeedback(true)}><h4 className="section-heading"><FaRegArrowAltCircleRight /> Feedback</h4></div>
                            </div>
                          ) : null )}
                        
                        </div>
                      ) : (null)}

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="job-spec">
                <div>
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowInterviews(true)}>
                    <h4 className="section-heading"><FaRegArrowAltCircleRight /> Interviews</h4>
                  </div>
                </div>
              </div>
            )) : (null)
          }

          {jobSpec.Applications && jobSpec.Applications[0] && jobSpec.Applications[0].Offers && jobSpec.Applications[0].Offers.length > 0 ? (
            showOffers ? (
              <div className="job-spec">
                <div className="offer-row">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowOffers(false)}>
                    <h4 className="section-heading">
                      <FaRegArrowAltCircleDown /> Offers
                    </h4>
                  </div>
                </div>

                {jobSpec.Applications[0].Offers.map((offer) => (
                  <div key={offer.Id || Math.random()} className="job-spec">
                    <div className="job-spec-meta-item">
                      {offer.Id ? (
                        <div className="offer-row">
                          <span className="job-spec-label-link" 
                                title='Edit Offer' 
                                onClick={() => {
                                    setOfferId(offer.Id);
                                    setModalEditOffer(true);
                                  }}>
                            <FaEdit aria-hidden="true" />
                          </span>
                          {offer.Offered ? (
                            <>
                              <span className="job-spec-label">Offered Date</span>
                              <span className="job-spec-value">{formatDateOnly(offer.Offered)}</span>
                            </>
                          ) : null}
                        </div>
                      ) : (null)}

                      {offer.Salary ? (
                        <div className="job-spec-field-row">
                          <span className="job-spec-label">Salary</span>
                          <span className="job-spec-value">{safeValue(offer.Salary)}</span>
                        </div>
                      ) : (null)}

                      {offer.Benefits ? (
                        <div className="job-spec-field-row">
                          <span className="job-spec-label">Benefits</span>
                          <span className="job-spec-value">{normalizeBenefits(offer.Benefits)}</span>
                        </div>
                      ) : (null)}

                      {offer.Notes  ? (
                        <div className="job-spec-decorated">
                          {showOfNotes ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowOfNotes(false)}><h4 className="section-heading"><FaRegArrowAltCircleDown /> Notes</h4></div>
                              <ReactMarkdown>{safeValue(offer.Notes)}</ReactMarkdown>
                            </div>
                          ) : (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowOfNotes(true)}>
                                <h4 className="section-heading"><FaRegArrowAltCircleRight /> Notes</h4>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (null)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="job-spec">
                <div>
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowOffers(true)}>
                    <h4 className="section-heading"><FaRegArrowAltCircleRight /> Offers</h4>
                  </div>
                </div>
              </div>
            )) : (null)
          }
        </div>
      )}

      {modalEditJobSpec && (
        <JobSpecModal
          jobSpecId={jobSpec?.Id || null}
          title = {getModalTitle('jobspec')}
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
          title = {getModalTitle('application')}
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
          title = {getModalTitle('interview')}
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
          title = {getModalTitle('offer')}
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
