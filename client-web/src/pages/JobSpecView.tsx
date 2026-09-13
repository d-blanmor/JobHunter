import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaEdit, FaIdBadge, FaExternalLinkAlt, FaEnvelopeSquare, FaPhoneSquareAlt, FaRegArrowAltCircleRight, FaRegArrowAltCircleDown, FaTags, FaArrowCircleRight, FaTrashAlt, FaUndo, FaRegCalendarPlus } from 'react-icons/fa';
import { BsInfoCircle } from "react-icons/bs";
import { GiCardDiscard } from "react-icons/gi";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Adds support for tables, strikethrough, etc.
import rehypeSanitize from 'rehype-sanitize'; // Optional but recommended for security

import { isDirty, setIsDirty } from '../App';
import { 
  formatDate, 
  formatDateOnly, 
  formatDateTime, 
  formatFieldDate, 
  safeValue,
  getSourceItem,
  getPlaceOfWorkLabel,
  getContactDetails,
  getWorkModelItem,
  getRoleTypeItem,
  getContactItem,
  normalizeBenefits,
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
  } from '../defs/interfaces';
import { Tag, luBenefit, lnkJobSpecBenefit, lnkOfferBenefit, benefitWithNotes } from '../defs/types';

import JobSpecModal from '../components/JobSpecModal';
import ApplicationModal from '../components/ApplicationModal';
import InterviewModal from '../components/InterviewModal';
import OfferModal from '../components/OfferModal';

import { getJobSpec, getJobSpecTags, getJobSpecBenefits, deleteJobSpec } from '../api/jobSpecs';
import { getApplicationsByJobSpec, getApplication, saveApplication } from '../api/applications';
import { getInterviewByJobSpec, getInterview, saveInterview } from '../api/interviews';
import { getOfferByJobSpec, getOfferBenefits, getOffer, saveOffer } from '../api/offers';
import { listPlacesOfWork } from '../api/place_of_work';
import { listWorkModels } from '../api/lu_workmodels';
import { listRoleTypes } from '../api/lu_roletypes';
import { listBenefits } from '../api/lu_benefits';
import { listLocations } from '../api/lu_locations';
import { listSources } from '../api/sources';
import { listContacts } from '../api/contacts';

export default function JobSpecView() {
  const { id } = useParams();

  const navigate = useNavigate();

  const tagContext: string = 'JobSpecs';
  const [modalOpenApplication, setModalOpenApplication] = useState(false);
  const [modalOpenInterview, setModalOpenInterview] = useState(false);
  const [modalOpenOffer, setModalOpenOffer] = useState(false);
  const [modalEditJobSpec, setModalEditJobSpec] = useState(false);
  const [modalEditApplication, setModalEditApplication] = useState(false);
  const [modalEditInterview, setModalEditInterview] = useState(false);
  const [modalEditOffer, setModalEditOffer] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showJsDescription, setShowJsDescription] = useState(true);
  const [showJsAnalysis, setShowJsAnalysis] = useState(false);
  const [showJsProfile, setShowJsProfile] = useState(false);
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
  const [showOfDescription, setShowOfDescription] = useState(false);
  const [showOfNotes, setShowOfNotes] = useState(false);

  // Entities
  const [jobSpec, setJobSpec] = useState<JobSpecItem | null>(null);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [offerId, setOfferId] = useState<number | null>(null);
  // Lookups
  const [lSources, setSources] = useState<SourceItem[]>([]);
  const [lLocations, setLLocations] = useState<luLocationItem[]>([]);
  const [lPlacesOfWork, setLPlacesOfWork] = useState<PlaceOfWorkItem[]>([]);
  const [lWorkModels, setWorkModels] = useState<luWorkModelItem[]>([]);
  const [lRoleTypes, setRoleTypes] = useState<luRoleTypeItem[]>([]);
  const [lContacts, setLContacts] = useState<ContactItem[]>([]);
  // Behaviour
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshJobSpec = async (mounted: boolean = true) => {
    setLoading(true);
    setError(null);

    try {
      const [
        js, 
        applications, 
        interviews, 
        offers
      ] = await Promise.all([
        getJobSpec(Number(id)),
        getApplicationsByJobSpec(Number(id)).catch(() => []),
        getInterviewByJobSpec(Number(id)).catch(() => []),
        getOfferByJobSpec(Number(id)).catch(() => [])
      ]);
      js.Tags = [];
      js.Benefits = [];
      if (js && js.Id > 0) {
        [js.Tags, js.Benefits] = await Promise.all ([getJobSpecTags(js.Id), getJobSpecBenefits(js.Id)]);
      }

      js.Applications = applications;
      setInterviewId(null);
      if (js.Applications && js.Applications.length > 0) {
        setApplicationId(js.Applications[0].Id);
        js.Applications[0].Interviews = interviews;
        js.Applications[0].Offers = offers;
        if (Array.isArray(js.Applications) && js.Applications.length > 0) {
          if (Array.isArray(js.Applications[0].Interviews) && js.Applications[0].Interviews.length > 0) {
            for (let i = 0; i < js.Applications[0].Interviews.length; i++) {
              if (js.Applications[0].Interviews[i].ContactId) {
                js.Applications[0].Interviews[i].Contact = getContactDetails(js.Applications[0].Interviews[i].ContactId, lContacts);
              }
            }
          }

          if (Array.isArray(js.Applications[0].Offers) && js.Applications[0].Offers.length > 0) {
            for (let i = 0; i < js.Applications[0].Offers.length; i++) {
              const ofBenefits = await (getOfferBenefits(Number(js.Applications[0].Offers[i].Id)).catch(() => []));

              js.Applications[0].Offers[i].Benefits = ofBenefits;
            }
          }
        }
      }
      setJobSpec(js);
    }
    catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load contacts',
        );
    } 
    finally {
      if (!mounted) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);

      try {
        if (!mounted) return;
        const [
          js, 
          luSources, 
          luLocations,
          luPlacesOfWork,
          luWorkModels, 
          luRoleTypes, 
          luContacts,
        ] = await Promise.all([
          getJobSpec(Number(id)),
          listSources().catch(() => []),
          listLocations().catch(() => []),
          listPlacesOfWork().catch(() => []),
          listWorkModels().catch(() => []),
          listRoleTypes().catch(() => []),
          listContacts().catch(() => []),
        ]);
        setSources(Array.isArray(luSources) ? luSources : []);
        setLLocations(Array.isArray(luLocations) ? luLocations : []);
        setLPlacesOfWork(Array.isArray(luPlacesOfWork) ? luPlacesOfWork : []);
        setWorkModels(Array.isArray(luWorkModels) ? luWorkModels : []);
        setRoleTypes(Array.isArray(luRoleTypes) ? luRoleTypes : []);
        setLContacts(Array.isArray(luContacts) ? luContacts : []);
        setJobSpec(js);
        await refreshJobSpec(mounted);
      } 
      catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load job spec');
      } 
      finally {
        setIsDirty(false);
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    function handelOnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      return (event.preventDefault());
    }
    window.addEventListener('beforeunload', handelOnBeforeUnload, {capture: true});
    return () => {
      if (isDirty()) window.removeEventListener('beforeunload', handelOnBeforeUnload, {capture: true});
    }
  }, []);

  const source = useMemo(() => (jobSpec ? getSourceItem(jobSpec, lSources) : null), [jobSpec, lSources]);
  const roleType = useMemo(() =>  (jobSpec ? getRoleTypeItem(jobSpec, lRoleTypes) : null), [jobSpec]);
  const workModel = useMemo(() => (jobSpec ? getWorkModelItem(jobSpec, lWorkModels) : null), [jobSpec,lWorkModels]);
  const placeOfWorkLabel = useMemo(() => (jobSpec?.PlaceOfWorkId ? getPlaceOfWorkLabel(jobSpec.PlaceOfWorkId, lPlacesOfWork, lLocations) : '—'), [jobSpec?.PlaceOfWorkId, lPlacesOfWork, lLocations]);
  const contact = useMemo(() => (jobSpec ? getContactItem(jobSpec.ContactId, lContacts) : null), [jobSpec]);
  const salary = jobSpec?.SalaryExpectation ||  '—';

  const handleSoftDeleteJobSpec = async (jsId: number) => {
    if (!window.confirm('Are you sure you want to soft delete this Job Spec?')) return;
    setError(null);
    
    try {
      await deleteJobSpec(jsId);
      navigate('/');
    } catch(err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job spec');
    } finally {

    }
  };

  const handleSoftDeleteApplication = async (appId: number) => {
    if (!window.confirm('Are you sure you want to soft delete this application?')) return;
    setError(null);
    //setActionLoadingId(appId);
    try {
      const application = await getApplication(appId);
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
      minimalPayload.Id = appId;
      minimalPayload.IsActive = false;
      await saveApplication(minimalPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    } finally {
      await refreshJobSpec();
    }
  };

  const handleSoftDeleteInterview = async (intvwId: number) => {
    if (!window.confirm('Are you sure you want to soft delete this interview?')) return;
    setError(null);
    try {
      const interview = await getInterview(intvwId);
      const minimalPayload: any = {};
      for (const [key, value] of Object.entries(interview || {})) {
        if (value === null) {
          minimalPayload[key] = null;
        } else if (typeof value !== 'object') {
          minimalPayload[key] = value;
        }
      }
      minimalPayload.Id = intvwId;
      minimalPayload.IsActive = false;
      await saveInterview(minimalPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete interview');
    } finally {
      await refreshJobSpec();
    }
  };

  const handleSoftDeleteOffer = async (offId: number) => {
    if (!window.confirm('Are you sure you want to soft delete this offer?')) return;
    setError(null);
    try {
      const offer = await getOffer(offId);
      const minimalPayload: any = {};
      for (const [key, value] of Object.entries(offer || {})) {
        if (value === null) {
          minimalPayload[key] = null;
        } else if (typeof value !== 'object') {
          minimalPayload[key] = value;
        }
      }
      minimalPayload.Id = offId;
      minimalPayload.IsActive = false;
      await saveOffer(minimalPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete offer');
    } finally {
      await refreshJobSpec();
    }
  };

  const handleDiscardApplication = async (appId: number) => {
    if (!window.confirm('Mark this application as discarded?')) return;
    setError(null);
    try {
      const application = await getApplication(appId);
      const minimalPayload: any = {};
      for (const [key, value] of Object.entries(application || {})) {
        if (value === null) {
          minimalPayload[key] = null;
        } else if (typeof value !== 'object') {
          minimalPayload[key] = value;
        }
      }
      minimalPayload.Id = appId;
      const iso = new Date().toISOString();
      minimalPayload.Discarded = iso;
      minimalPayload.DiscardedDate = iso;
      console.debug('updateApplication discard payload', minimalPayload);
      await saveApplication(minimalPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discard application');
    } finally {
      await refreshJobSpec();
    }
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
  };

  return (
    <section className="page">
      {loading && (
        <div className="page-header-row">
          <div>
            <h2 className="job-spec-title"><p>Loading job spec...</p></h2>
          </div>
          <button className="action-button" onClick={() => navigate('/')}>Back</button>
        </div>
      )}
      {error && (
        <div className="page-header-row">
          <div>
            <h2 className="job-spec-title"><p className="error">{error}</p></h2>
          </div>
          <button className="action-button" onClick={() => navigate('/')}>Back</button>
        </div>
      )}

      {!loading && !error && jobSpec && (
        <div className="job-spec-view">
          <div className="page-header-action">
            <div className="job-spec-actions">
              <button type="button"
                      className="job-spec-button"
                      title="Edit Job Spec"
                      onClick={() => {
                        setModalEditJobSpec(true);
                      }}
                      >
                <FaEdit aria-hidden="true" />
              </button>
              {!jobSpec.Applications || jobSpec.Applications.length == 0 ? (
                <>
                  <button type="button"
                          className="job-spec-button"
                          title="Create application for this job spec"
                          onClick={() => {
                            setModalOpenApplication(true);
                          }}
                          >
                    <FaArrowCircleRight />
                  </button>

                </>
              ) : jobSpec.Applications && 
                  jobSpec.Applications[0] && 
                  !jobSpec.Applications[0].Discarded && 
                  (!jobSpec.Applications[0].Interviews || jobSpec.Applications[0].Interviews.length == 0) ? (
                <>
                  <button type="button"
                          className="job-spec-button"
                          title="Create interview for this application"
                          onClick={() => {
                            if (jobSpec.Applications && jobSpec.Applications[0]) {
                              setApplicationId(jobSpec.Applications[0].Id);
                              setModalOpenInterview(true);
                            }
                          }}>
                    <FaRegCalendarPlus />
                  </button>
                  <button type="button"
                          className="job-spec-button"
                          title="Discard application"
                          onClick={() => {
                            if (jobSpec.Applications && jobSpec.Applications[0].Id) {
                              handleDiscardApplication(jobSpec.Applications[0].Id);
                            }
                          }}>
                    <GiCardDiscard />
                  </button>
                </>
              ) : jobSpec.Applications && 
                  jobSpec.Applications[0] && 
                  !jobSpec.Applications[0].Discarded &&
                  (!jobSpec.Applications[0].Offers || jobSpec.Applications[0].Offers.length == 0) ? (
                <>
                  <button type="button"
                          className="job-spec-button"
                          title="Create offer for this application"
                          onClick={() => {
                            if (jobSpec.Applications && jobSpec.Applications[0].Id) {
                              setApplicationId(jobSpec.Applications[0].Id);
                              setModalOpenOffer(true);
                            }
                          }}>
                    <FaArrowCircleRight />
                  </button>
                </>
              ) : ( null  )}

              <button type="button"
                      className="job-spec-button job-spec-button-delete"
                      title="Soft delete this job spec"
                      onClick={async () => {
                        handleSoftDeleteJobSpec(Number(id));
                      }}>
                <FaTrashAlt />
              </button>
            </div>

            <button className="action-button" onClick={() => navigate('/')}>Back</button>
          </div>

          <div className="page-header-row">
            <div>
              <span className="job-spec-title">
                {safeValue(jobSpec.Position)}
              </span>
              {jobSpec.Link ? (
                <span className="job-spec-title-link">
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

          {jobSpec.Tags && jobSpec.Tags.length > 0 ? (
            <div className="job-spec-tags-area">
              <div className="job-spec-tags-header"><FaTags /></div>
              <div className="job-spec-tags-list">
                {jobSpec.Tags.length ? jobSpec.Tags.map((tag: Tag) => (
                  <span className="job-spec-tags-list" key={tag.Id}>
                    <span style={{'border': 'none'}}>{tag.Name}</span>
                  </span>
                )) : <></>}
              </div>
            </div>
          ) : ( '' )}

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

            {jobSpec.RoleTypeId || jobSpec.WorkModelId || jobSpec.SalaryExpectation ? (
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
            {jobSpec.RoleTypeId || jobSpec.WorkModelId || jobSpec.SalaryExpectation ? (
              <div className="job-spec-row">
                {jobSpec.SalaryExpectation ? (
                  <div className="job-spec-field-row">
                    <span className="job-spec-label">Salary Expectation</span>
                    <span className="job-spec-value">{safeValue(salary)}</span>
                  </div>
                ) : null}
              </div>
            ) : null}
            {jobSpec.Benefits && jobSpec.Benefits.length > 0 ? (
              <div className="job-spec-benefits-area">
                <span className="job-spec-label">Benefits</span>
                <div className="job-spec-benefits-list">
                  {jobSpec.Benefits.map((benefit: any, index) => (
                    <>
                      {benefit.Notes != '' ? (
                        <span className="job-spec-benefits-list">
                          <span className="job-spec-value">{benefit.Name}: </span>
                          <span className="job-spec-value">{benefit.Notes} </span>
                        </span>
                      ) :
                      (
                        <span className="job-spec-benefits-list">
                          <span className="job-spec-value">{benefit.Name}</span>
                        </span>
                      )}
                    </>
                  ))}
                </div>
              </div>
            ) : (
              <div className="job-spec-benefits-area">
                <span className="job-spec-label">Benefits</span>
              </div>
            )}
          </div>

          {jobSpec.Description || jobSpec.Analysis || jobSpec.Profile || jobSpec.Notes ? (
            <div className="job-spec">
              {jobSpec.Description && showJsDescription ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsDescription(false)}>
                    <h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Description</h4>
                  </div>
                  <div className="job-spec-text">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                      children={safeValue(jobSpec.Description)}
                    />
                  </div>
                </div>
              ) : (jobSpec.Description ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsDescription(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Description</h4></div>
                </div>
              ) : null )}

              {jobSpec.Analysis && showJsAnalysis ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsAnalysis(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Analysis and recomendations</h4></div>
                  <div className="job-spec-text">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                      children={safeValue(jobSpec.Analysis)}
                    />
                  </div>
                </div>
              ) : (jobSpec.Analysis ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsAnalysis(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Analysis and recomendations</h4></div>
                </div>
              ) : null )}

              {jobSpec.Profile && showJsProfile ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsProfile(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Profile match to Job Spec</h4></div>
                  <div className="job-spec-text">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                      children={safeValue(jobSpec.Profile)}
                    />
                  </div>
                </div>
              ) : (jobSpec.Profile ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsProfile(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Profile match to Job Spec</h4></div>
                </div>
              ) : null )}

              {jobSpec.Notes && showJsNotes ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsNotes(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Notes</h4></div>
                  <div className="job-spec-text">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeSanitize]}
                      children={safeValue(jobSpec.Notes)}
                    />
                  </div>
                </div>
              ) : (jobSpec.Notes ? (
                <div className="job-spec job-spec-textarea-section">
                  <div className="job-spec-section-clickable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setShowJsNotes(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Notes</h4></div>
                </div>
              ) : null )}
            </div>
          ) : (null)}
          
          {jobSpec.Applications && jobSpec.Applications.length > 0 ? (
            showApplications ? (
              <div className={`${jobSpec.Applications[0].Discarded ? 'job-spec-discarded' : 'job-spec'}`}>
                <div>
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
                      <>
                        <div className="application-row">
                          <div className="job-spec-actions">
                            <button type="button"
                                    className="job-spec-button"
                                    title="Edit Application"
                                    onClick={() => {setModalEditApplication(true);}}>
                              <FaEdit aria-hidden="true" />
                            </button>
                            {!application.Discarded && (!application.Offers || application.Offers.length == 0) ? (
                              <>
                                <button type="button"
                                        className="job-spec-button"
                                        title="Create interview for this application"
                                        onClick={() => {
                                          if (jobSpec.Applications && jobSpec.Applications[0]) setApplicationId(jobSpec.Applications[0].Id);
                                          setModalOpenInterview(true);
                                        }}>
                                  <FaRegCalendarPlus />
                                </button>
                                <button type="button"
                                        className="stage-action-button"
                                        title="Discard application"
                                        onClick={() => {
                                          if (jobSpec.Applications && jobSpec.Applications[0].Id) {
                                            handleDiscardApplication(jobSpec.Applications[0].Id);
                                          }
                                        }}>
                                  <GiCardDiscard />
                                </button>
                              </>
                            ) : (null)}
                            <button type="button"
                                    className="job-spec-button job-spec-button-delete"
                                    title="Soft delete this application"
                                    onClick={() => {
                                      if (jobSpec.Applications && jobSpec.Applications[0].Id) {
                                        handleSoftDeleteApplication(jobSpec.Applications[0].Id);
                                      }
                                    }}>
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                        <div className="application-row">
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
                      </>
                    ) : (null)}
                    {application.Letter || application.CV || application.Notes ? (
                      <div className={`${application.Discarded ? 'job-spec-decorated-discarded' : 'job-spec-decorated'}`}>
                        {application.Letter && showApLetter ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApLetter(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Cover Letter</h4></div>
                            <div className="job-spec-text">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSanitize]}
                                children={safeValue(application.Letter)}
                              />
                            </div>
                          </div>
                        ) : (application.Letter ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApLetter(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Cover Letter</h4></div>
                          </div>
                        ) : null )}

                        {application.CV && showApCV ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApCV(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Resume sent</h4></div>
                            <div className="job-spec-text">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSanitize]}
                                children={safeValue(application.CV)}
                              />
                            </div>
                          </div>
                        ) : (application.CV ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApCV(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Resume sent</h4></div>
                          </div>
                        ) : null )}

                        {application.Notes && showApNotes ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApNotes(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Notes</h4></div>
                            <div className="job-spec-text">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSanitize]}
                                children={safeValue(application.Notes)}
                              />
                            </div>
                          </div>
                        ) : (application.Notes ? (
                          <div className="job-spec job-spec-textarea-section">
                            <div className="job-spec-section-clickable"
                                role="button"
                                tabIndex={0}
                                onClick={() => setShowApNotes(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Notes</h4></div>
                          </div>
                        ) : null )}
                      </div>
                    ) : ( null )}
                    <hr/>
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
                <div>
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
                        <>
                          <div className="interview-row">
                            <div className="job-spec-actions">
                              <button type="button"
                                      className="stage-action-button"
                                      title="Edit Interview"
                                      onClick={() => {
                                        setInterviewId(interview.Id);
                                        setModalEditInterview(true);
                                      }}>
                                <FaEdit aria-hidden="true" />
                              </button>
                              <button type="button"
                                      className="stage-action-button stage-action-button-delete"
                                      title="Soft delete this interview"
                                      onClick={() => {handleSoftDeleteInterview(interview.Id)}}>
                                <FaTrashAlt />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (null)}
                      <div className="interview-row">
                        {interview.Scheduled ? (
                          <>
                            <span className="job-spec-label">Scheduled for</span>
                            <span className="job-spec-value">{formatDateTime(interview.Scheduled)}</span>
                          </>
                        ) : null}
                      </div>
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
                                  onClick={() => setShowInDescription(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Description</h4></div>
                              <div className="job-spec-text">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeSanitize]}
                                  children={safeValue(interview.Description)}
                                />
                              </div>
                            </div>
                          ) : (interview.Description ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInDescription(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Description</h4></div>
                            </div>
                          ) : null )}

                          {interview.Analysis && showInAnalysis ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInAnalysis(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Recomendations</h4></div>
                              <div className="job-spec-text">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeSanitize]}
                                  children={safeValue(interview.Analysis)}
                                />
                              </div>
                            </div>
                          ) : (interview.Analysis ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInAnalysis(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Recomendations</h4></div>
                            </div>
                          ) : null )}

                          {interview.Notes && showInNotes ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInNotes(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Notes</h4></div>
                              <div className="job-spec-text">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeSanitize]}
                                  children={safeValue(interview.Notes)}
                                />
                              </div>
                            </div>
                          ) : (interview.Notes ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInNotes(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Notes</h4></div>
                            </div>
                          ) : null )}

                          {interview.Outcome && showInOutcome ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInOutcome(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Outcome</h4></div>
                              <div className="job-spec-text">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeSanitize]}
                                  children={safeValue(interview.Outcome)}
                                />
                              </div>
                            </div>
                          ) : (interview.Outcome ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInOutcome(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Outcome</h4></div>
                            </div>
                          ) : null )}

                          {interview.Feedback && showInFeedback ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInFeedback(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Feedback</h4></div>
                              <div className="job-spec-text">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeSanitize]}
                                  children={safeValue(interview.Feedback)}
                                />
                              </div>
                            </div>
                          ) : (interview.Feedback ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowInFeedback(true)}><h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Feedback</h4></div>
                            </div>
                          ) : null )}
                        
                        </div>
                      ) : (null)}
                      <hr/>
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
                      onClick={async () => {
                        await refreshJobSpec(true);
                        setShowInterviews(true);
                      }}>
                    <h4 className="section-heading"><FaRegArrowAltCircleRight /> Interviews</h4>
                  </div>
                </div>
              </div>
            )) : (null)
          }

          {jobSpec.Applications && jobSpec.Applications[0] && jobSpec.Applications[0].Offers && jobSpec.Applications[0].Offers.length > 0 ? (
            showOffers ? (
              <div className="job-spec">
                <div>
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
                        <>
                          <div className="offer-row">
                            <div className="job-spec-actions">
                              <button type="button"
                                      className="job-spec-button"
                                      title="Edit Offer"
                                      onClick={() => {
                                        setOfferId(offer.Id);
                                        setModalEditOffer(true);
                                      }}>
                                <FaEdit aria-hidden="true" />
                              </button>
                              <button type="button"
                                      className="job-spec-button job-spec-button-delete"
                                      title="Soft delete this offer"
                                      onClick={async () => {
                                        handleSoftDeleteOffer(offer.Id);
                                      }}>
                                <FaTrashAlt />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (null)}

                      <div className="offer-row">
                        {offer.Offered ? (
                          <>
                            <span className="job-spec-label">Offered Date</span>
                            <span className="job-spec-value">{formatDateOnly(offer.Offered)}</span>
                          </>
                        ) : null}
                      </div>

                      {offer.Salary ? (
                        <div className="offer-row">
                          <span className="job-spec-label">Salary</span>
                          <span className="job-spec-value">{safeValue(offer.Salary)}</span>
                        </div>
                      ) : (null)}

                      {offer.Benefits && offer.Benefits.length > 0 ? (
                        <div className="offer-benefits-area">
                          <span className="offer-label">Benefits</span>
                          <div className="job-spec-benefits-list">
                            {offer.Benefits.map((benefit: any, index) => (
                              <>
                                {benefit.Notes != '' ? (
                                  <span className="job-spec-benefits-list">
                                    <span className="job-spec-value">{benefit.Name}: </span>
                                    <span className="job-spec-value">{benefit.Notes} </span>
                                  </span>
                                ) :
                                (
                                  <span className="job-spec-benefits-list">
                                    <span className="job-spec-value">{benefit.Name}</span>
                                  </span>
                                )}
                              </>
                            ))}
                          </div>
                        </div>
                      ) : ( null )}

                      {offer.Description  ? (
                        <div className="job-spec-decorated">
                          {showOfDescription ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowOfDescription(false)}>
                                <h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Description</h4>
                              </div>
                              <div className="job-spec-text">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeSanitize]}
                                  children={safeValue(offer.Description)}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowOfDescription(true)}>
                                <h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Description</h4>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (null)}

                      {offer.Notes  ? (
                        <div className="job-spec-decorated">
                          {showOfNotes ? (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowOfNotes(false)}><h4 className="job-spec-section"><FaRegArrowAltCircleDown /> Notes</h4></div>
                              <div className="job-spec-text">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  rehypePlugins={[rehypeSanitize]}
                                  children={safeValue(offer.Notes)}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="job-spec job-spec-textarea-section">
                              <div className="job-spec-section-clickable"
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setShowOfNotes(true)}>
                                <h4 className="job-spec-section"><FaRegArrowAltCircleRight /> Notes</h4>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (null)}
                    </div>
                    <hr/>
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

      {modalOpenApplication && (
        <ApplicationModal
          applicationId={null}
          jobSpecId={jobSpec?.Id}
          title = "Create new Application"
          onClose={() => {
            if (isDirty()) {
              if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
                return;
            }
            setIsDirty(false);
            setModalOpenApplication(false);
          }}
          onSuccess={async () => {
            await refreshJobSpec(true);
            setModalOpenApplication(false);
          }}
        />
      )}

      {modalOpenInterview && (
        <InterviewModal
          interviewId={null}
          applicationId={applicationId}
          title = "Create new Interview"
          onClose={() => {
            if (isDirty()) {
              if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
                return;
            }
            setIsDirty(false);
            setModalOpenInterview(false);
          }}
          onSuccess={async () => {
            await refreshJobSpec(true);
            setModalOpenInterview(false);
          }}
        />
      )}

      {modalOpenOffer && (
        <OfferModal
          offerId={null}
          applicationId={applicationId}
          title = "Create new Offer"
          onClose={() => {
            if (isDirty()) {
              if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
                return;
            }
            setIsDirty(false);
            setModalOpenOffer(false);
          }}
          onSuccess={async () => {
            await refreshJobSpec(true);
            setModalOpenOffer(false);
          }}
        />
      )}

      {modalEditJobSpec && (
        <JobSpecModal
          jobSpecId={jobSpec?.Id || null}
          title = {getModalTitle('jobspec')}
          onClose={() => {
            if (isDirty()) {
              if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
                return;
            }
            setIsDirty(false);
            setModalEditJobSpec(false);
          }}
          onSuccess={async () => {
            await refreshJobSpec(true);
            setModalEditJobSpec(false);
          }}
        />
      )}

      {modalEditApplication && (
        <ApplicationModal
          applicationId={applicationId}
          jobSpecId={jobSpec?.Id || null}
          title = {getModalTitle('application')}
          onClose={() => {
            if (isDirty()) {
              if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
                return;
            }
            setIsDirty(false);
            setModalEditApplication(false);
          }} 
          onSuccess={async () => {
            await refreshJobSpec(true);
            setModalEditApplication(false);
          }}
        />
      )}

      {modalEditInterview && (
        <InterviewModal
          interviewId={interviewId}
          applicationId={applicationId}
          title = {getModalTitle('interview')}
          onClose={() => {
            if (isDirty()) {
              if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
                return;
            }
            setIsDirty(false);
            setModalEditInterview(false);
          }}
          onSuccess={async () => {
            await refreshJobSpec(true);
            setModalEditInterview(false);
          }}
        />
      )}

      {modalEditOffer && (
        <OfferModal
          offerId={offerId}
          applicationId={applicationId}
          title = {getModalTitle('offer')}
          onClose={() => {
            if (isDirty()) {
              if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
                return;
            }
            setIsDirty(false);
            setModalEditOffer(false);
          }}
          onSuccess={async () => {
            await refreshJobSpec(true);
            setModalEditOffer(false);
          }}
        />
      )}

    </section>
  );
}
