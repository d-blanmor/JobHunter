import { useEffect, useState } from 'react';
import { FaPlus, FaRegArrowAltCircleRight, FaRegArrowAltCircleDown, FaTags, FaTimes } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Adds support for tables, strikethrough, etc.
import rehypeSanitize from 'rehype-sanitize'; // Optional but recommended for security

import { setting_keys } from '../config';
import { isDirty, setIsDirty } from '../App';
import { fetchAllBenefits, safeValue } from '../defs/tools';
import { newJobSpecItem, PlaceOfWorkItem } from '../defs/interfaces';
import { Source, luWorkModel, luRoleType, PlaceOfWork, luLocation, luBenefit, Tag, lnkJobSpecTag, lnkJobSpecBenefit, benefitWithNotes } from '../defs/types';

import { listLocations } from '../api/lu_locations';
import { listRoleTypes } from '../api/lu_roletypes';
import { listWorkModels } from '../api/lu_workmodels';
import { listBenefits, getBenefitByName } from '../api/lu_benefits';
import { listPlacesOfWork } from '../api/place_of_work';
import { listSources } from '../api/sources';
import { listContacts } from '../api/contacts';
import { saveJobSpec, saveJobSpecTag, saveJobSpecBenefit } from '../api/jobSpecs';
import { getTagByContext, getTagByNameContext, saveTag } from '../api/tags';
import { SourceItem } from '../defs/interfaces';
import { ollamaCheckJobSpec } from '../api/integrations/ollama';

import SourceModal from '../components/SourceModal';
import ContactModal from '../components/ContactModal';
import PlaceOfWorkModal from '../components/PlaceOfWorkModal'
import OllamaRequestModal from '../components/OllamaRequestModal'

export default function JobSpecCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpenSource, setModalOpenSource] = useState(false);
  const [modalOpenPlaceOfWork, setModalOpenPlaceOfWork] = useState(false);
  const [modalOpenContact, setModalOpenContact] = useState(false);
  const [modalOpenOllamaAnalysis, setModalOpenOllamaAnalysis] = useState(false);
  const [modalOpenOllamaProfile, setModalOpenOllamaProfile] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [editableDescription, setEditableDescription] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [editableAnalysis, setEditableAnalysis] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editableProfile, setEditableProfile] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [editableNotes, setEditableNotes] = useState(false);
  const [showCallAI, setShowCallAI] = useState(false);
    
  // Entities
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [sourceId, setSourceId] = useState<number | ''>('');
  const [link, setLink] = useState('');
  const [published, setPublished] = useState('');
  const [contactId, setContactId] = useState<number | null>(null);
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [description, setDescription] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [profile, setProfile] = useState('');
  const [notes, setNotes] = useState('');
  const [workModelId, setWorkModelId] = useState<number | ''>('');
  const [roleTypeId, setRoleTypeId] = useState<number | ''>('');
  const [placeOfWorkId, setPlaceOfWorkId] = useState<number | ''>('');

  // Lookups
  const tagContext: string = 'JobSpecs';
  const [contacts, setContacts] = useState<any[]>([]);
  const [luTags, setLuTags] = useState<Tag[]>([]);
  const [luBenefits, setLuBenefits] = useState<luBenefit[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [parents, setParents] = useState<SourceItem[]>([]);
  const [workModels, setWorkModels] = useState<luWorkModel[]>([]);
  const [roleTypes, setRoleTypes] = useState<luRoleType[]>([]);
  const [placesOfWork, setPlacesOfWork] = useState<PlaceOfWork[]>([]);
  const [locations, setLocations] = useState<luLocation[]>([]);

  // Floating values
  const [lAddTags, setLAddTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [tagSuggestions, setTagSuggestions] = useState<any[]>([]);
  const [tagEditorOpen, setTagEditorOpen] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [lAddBenefits, setLAddBenefits] = useState<benefitWithNotes[]>([]);
  const [benefitInput, setBenefitInput] = useState<string>('');
  const [benefitSuggestions, setBenefitSuggestions] = useState<any[]>([]);
  const [benefitEditorOpen, setBenefitEditorOpen] = useState(false);
  const [benefitError, setBenefitError] = useState<string | null>(null);

  const fetchAllTags = async () => {
    try {
      const data = await getTagByContext(tagContext);
      if (data === '()' || data == null) {
        setTagSuggestions([]);
        return [] as any[];
      }
      const tags = Array.isArray(data) ? data : (data?.data ?? []);
      setTagSuggestions(tags);
      return tags;
    } catch (err) {
      setTagError(err instanceof Error ? err.message : 'Failed to load tags');
      return [] as any[];
    }
  };

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!tagEditorOpen) return;
      await fetchAllTags();
    };
    void loadSuggestions();
  }, [tagEditorOpen]);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!benefitEditorOpen) return;
      setBenefitSuggestions([]);
      const benefits = await fetchAllBenefits();

      setBenefitSuggestions(benefits);
    };
    void loadSuggestions();
  }, [benefitEditorOpen]);

  useEffect(() => {
    function handelOnBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      //return (event.returnValue = '');
      return (event.preventDefault());
    }
    window.addEventListener('beforeunload', handelOnBeforeUnload, {capture: true});
    return () => {
      if (isDirty()) window.removeEventListener('beforeunload', handelOnBeforeUnload, {capture: true});
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const [
          lTags,
          lBenefits,
          lSources,
          lWorkModels,
          lRoleTypes,
          lPlacesOfWork,
          lLocations,
          lContacts
        ] = await Promise.all([
          getTagByContext(tagContext),
          listBenefits(),
          listSources(),
          listWorkModels(),
          listRoleTypes(),
          listPlacesOfWork(),
          listLocations(),
          listContacts()
        ]);

        if (!mounted) return;

        const tags = Array.isArray(lTags) ? lTags : (lTags?.data ?? []);
        setLuTags(tags);
        const benefits = Array.isArray(lBenefits) ? lBenefits : (lBenefits?.data ?? []);
        setLuBenefits(benefits);
        const sources = Array.isArray(lSources) ? lSources : (lSources?.data ?? []);
        setSources(sources);
        setParents(sources.filter((s: SourceItem) => s.ParentId == null));
        const workModels = Array.isArray(lWorkModels) ? lWorkModels : (lWorkModels?.data ?? []);
        setWorkModels(workModels);
        const roleTypes = Array.isArray(lRoleTypes) ? lRoleTypes : (lRoleTypes?.data ?? []);
        setRoleTypes(roleTypes);
        const places = Array.isArray(lPlacesOfWork) ? lPlacesOfWork : (lPlacesOfWork?.data ?? []);
        setPlacesOfWork(places);
        const locations = Array.isArray(lLocations) ? lLocations : (lLocations?.data ?? []);
        setLocations(locations);
        const contacts = Array.isArray(lContacts) ? lContacts : (lContacts?.data ?? []);
        setContacts(contacts);
      } 
      catch (err: any) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } 
      finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  async function fetchTag(tagName: string) {
    let tagId: number;

    try {
      let addTag = await getTagByNameContext(tagName, tagContext);

      if (!addTag) {
        const payload: Tag = {
          Name: tagName,
          Context: tagContext,
          Order: luTags.length,
          IsActive: true
        }
        addTag = await saveTag(payload);
        tagId = addTag.Id;
      }
      else {
        tagId = addTag[0].Id;
      }
      return tagId;
    }
    catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get tag',
      );
    }
  };

  async function fetchBenefit(benefitName: string) {
    let benefitId: number;

    try {
      let addBenefit = await getBenefitByName(benefitName);

      if (!addBenefit) {
        const payload: Tag = {
          Name: benefitName,
          Order: luBenefits.length,
          IsActive: true
        }
        addBenefit = await saveTag(payload);
        benefitId = addBenefit.Id;
      }
      else {
        benefitId = addBenefit[0].Id;
      }
      return benefitId;
    }
    catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to get benefit',
      );
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    if (!position.trim()) {
      setError('Position is required');
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }
    const payload: newJobSpecItem = {
      Id: null,
      Position: position.trim(),
      Company: company.trim() || null,
      SourceId: Number(sourceId) || null,
      Link: link.trim() || null,
      PlaceOfWorkId: Number(placeOfWorkId) || null,
      WorkModelId: Number(workModelId) || null,
      RoleTypeId: Number(roleTypeId) || null,
      SalaryExpectation: salaryExpectation.trim() || null,
      ContactId: Number(contactId) || null,
      Description: description.trim() || null,
      Analysis: analysis.trim() || null,
      Profile: profile.trim() || null,
      Notes: notes.trim() || null,
      Created: new Date().toISOString(),
      IsActive: true,
    };

    try {
      if (published) payload.Published = new Date(published).toISOString();
    } 
    catch(err) {
      payload.Published = null;
    }
    try 
    {
      const savedJobSpec = await saveJobSpec(payload);

      if (savedJobSpec && savedJobSpec.Id) {
        if (lAddTags.length > 0) {
          for (const t of lAddTags) {
            const tagId = await fetchTag(t);

            if (tagId != null) {
              const payload: lnkJobSpecTag = {
                JobSpecId: savedJobSpec.Id,
                TagId: tagId,
                Order: lAddTags.findIndex((s: string) => t === s)
              };
              await saveJobSpecTag(payload);
            }
          }
        }

        if (lAddBenefits.length > 0) {
          for (const bn of lAddBenefits) {
            const benefitId = await fetchBenefit(bn.Benefit);

            if (benefitId != null) {
              const payload: lnkJobSpecBenefit = {
                JobSpecId: savedJobSpec.Id,
                LuBenefitId: benefitId,
                Notes: bn.Notes,
                Order: lAddBenefits.findIndex((s: benefitWithNotes) => bn === s)
              };
              await saveJobSpecBenefit(payload);
            }
          }
        }
      }
      navigate('/');
    } 
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } 
    finally {
      setLoading(false);
      setIsDirty(false);
    }
  };

  const handleCancel = () => {
    if (isDirty()) {
      if (!window.confirm('If you leave now you will lose any unsaved changes. Are you sure?')) 
        return;
    }
    navigate('/');
    setIsDirty(false);
    return;
  };

  const handleAddTag = async () => {
    if (tagInput) {
      let newLTags = lAddTags;

      if (lAddTags.length > 0) {
        let found = false;

        lAddTags.forEach((t: string) => {
          if (t.toLowerCase() == tagInput.toLowerCase()) {
            found = true;
          }
        });
        if (!found) {
          newLTags.push(tagInput);
          setLAddTags(newLTags);
        }
      }
      else {
        newLTags.push(tagInput);
        setLAddTags(newLTags);
      }
    }
    setTagInput('');
    setTagEditorOpen(false);
  };

  function verifyBenefit (benefit: string) {
    let isValid: boolean = false
    luBenefits.forEach((item: luBenefit) => {
      if (item.Name.toLowerCase() == benefit.toLowerCase()){
        isValid = true;
      }
    });
    return isValid;
  }

  const handleAddBenefit = async () => {
    if (benefitInput && verifyBenefit(benefitInput)) {
      let newLBenefits = lAddBenefits;

      if (lAddBenefits.length > 0) {
        let found = false;

        lAddBenefits.forEach((bn: benefitWithNotes) => {
          if (bn.Benefit.toLowerCase() == benefitInput.toLowerCase()) {
            found = true;
          }
        });
        if (!found) {
          const nBenefit: benefitWithNotes = {
            Benefit: benefitInput,
            Notes: ""
          }
          newLBenefits.push(nBenefit);
          setLAddBenefits(newLBenefits);
        }
      }
      else {
        const nBenefit: benefitWithNotes = {
          Benefit: benefitInput,
          Notes: ""
        }
        newLBenefits.push(nBenefit);
        setLAddBenefits(newLBenefits);
      }
    }
    setBenefitInput('');
    setBenefitEditorOpen(false);
  };

  const handleRemoveTag = (deletedTag: string) => {
    if (lAddTags.length > 0) {
      let newLTags: string[] = [];
      
      lAddTags.forEach((t: string) => {
        if (t.toLowerCase() != deletedTag.toLowerCase()) {
          newLTags.push(t);
        }
      });
      setLAddTags(newLTags);
    }
  };

  const handleRemoveBenefit = (deletedBenefit: string) => {
    if (lAddBenefits.length > 0) {
      let newLBenefits: benefitWithNotes[] = [];
      
      lAddBenefits.forEach((bn: benefitWithNotes) => {
        if (bn.Benefit.toLowerCase() != deletedBenefit.toLowerCase()) {
          newLBenefits.push(bn);
        }
      });
      setLAddBenefits(newLBenefits);
    }
  };

const handleBenefitNoteChange = (index: number, newValue: string) => {
  const updatedBenefits = [...lAddBenefits];
  updatedBenefits[index] = {
    ...updatedBenefits[index],
    Notes: newValue
  };
  setLAddBenefits(updatedBenefits);
};

  const checkJobSpecOllama = async () => {
    setLoading(true);
    try {
      const analysisJS = await ollamaCheckJobSpec(description);

      if (analysisJS) {
        setAnalysis(analysisJS);
      }
    }
    catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } 
    finally {
      setLoading(false);
    }
  };

  const handleFieldEdit = (field: string, value: string) => {
    setIsDirty(true);
    if (field.toLowerCase() == 'position') {
      setPosition(value);
    }
    else if (field.toLowerCase() == 'company') {
      setCompany(value);
    }
    else if (field.toLowerCase() == 'source')
      setSourceId(value ? Number(value) : '');
    else if (field.toLowerCase() == 'link') {
      setLink(value);
    }
    else if (field.toLowerCase() == 'published') {
      setPublished(value);
    }
    else if (field.toLowerCase() == 'workmodel') {
      setWorkModelId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'roletype') {
      setRoleTypeId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'salaryexpectation') {
      setSalaryExpectation(value);
    }
    else if (field.toLowerCase() == 'placeofwork') {
      setPlaceOfWorkId(value ? Number(value) : '');
    }
    else if (field.toLowerCase() == 'contact') {
      setContactId(value ? Number(value) : null);
    }
    else if (field.toLowerCase() == 'description') {
      setDescription(value);
      setShowCallAI(false);
      if (value != '') setShowCallAI(true);
    }
    else if (field.toLowerCase() == 'analysis') {
      setAnalysis(value);
    }
    else if (field.toLowerCase() == 'profile') {
      setProfile(value);
    }
    else if (field.toLowerCase() == 'notes') {
      setNotes(value);
    }
  };

  const fetchSources = async (mounted: boolean = true) => {
    try {
      const data = await listSources();
      if (mounted && Array.isArray(data)) setSources(data);
    } 
    catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load portals',
        );
    } 
    finally {}
  };

  const fetchContacts = async (mounted: boolean = true) => {
    try {
      const data = await listContacts();
      if (mounted && Array.isArray(data)) setContacts(data);
    } 
    catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load contacts',
        );
    } 
    finally {}
  };

  const fetchPlacesOfWork = async (mounted: boolean = true) => {
    try {
      const data = await listPlacesOfWork();
      if (mounted && Array.isArray(data)) setPlacesOfWork(data);
    } 
    catch (err) {
      if (mounted)
        setError(
          err instanceof Error ? err.message : 'Failed to load places of work',
        );
    } 
    finally {}
  };

  const placeOfWorkLabel = (placeOfWork?: PlaceOfWorkItem | null, placeOfWorkId?: number | null) => {
    var locationLabel = null;

    if (!placeOfWork && placeOfWorkId) placeOfWork = placesOfWork.find((item) => item.Id === placeOfWorkId);
    if (placeOfWork) {
      const location = placeOfWork ? locations.find((item) => item.Id === placeOfWork.LocationId) : null;
      
      if (placeOfWork) {
        if (location) {
          locationLabel = location.Country;
          if (location.City && location.City != '') {
            locationLabel = locationLabel + ` - ${location.City?.trim()}`;
          }
        }
        if (placeOfWork?.Address && placeOfWork.Address.trim() != ''){
          locationLabel = locationLabel + ` (${placeOfWork.Address?.trim()})`;
        }
      }
    }
    return locationLabel;
  }

  /* ---------- Render --------------------------------------------------- */
  return (
    <section className="page job-spec-create">
      <h2>Create Job Spec</h2>
      
      {loading && <p>Loading...</p>}
      {error && <div className="job-spec-error"><p className="error">{error}</p></div>}
      {!loading && (
        <div>

          <div className="job-spec-tags-area">
            <div className="job-spec-tags-header"><FaTags /></div>
            {!tagEditorOpen && (
              <button type="button" className="job-spec-tags-list-button" onClick={() => { setTagEditorOpen(true); setTagError(null); }}>
                <FaPlus />
              </button>
            )}
            <div className="job-spec-tags-list">
              {lAddTags.length ? lAddTags.map((tag: string) => (
                <span className="job-spec-tags-list" key={tag}>
                  <span style={{'border': 'none'}}>{tag}</span>
                  <button type="button" 
                          className="job-spec-tag-button" 
                          onClick={() => handleRemoveTag(tag)}>
                    <FaTimes />
                  </button>
                </span>
              )) : <></>}
            </div>
          </div>
          {tagEditorOpen && (
            <div className="job-spec-tag-editor">
              <input
                className="job-spec-tag-editor"
                value={tagInput}
                placeholder="Type tag name"
                onChange={(e) => setTagInput(e.target.value)}
                type="text"
                list="tags-list"
              />
              <datalist id="tags-list">
                {luTags.filter((tag: any, index) => (!lAddTags.includes(tag.Name))).map((tag: any, index) => (
                  <option key={index || tag.Id} value={tag.Name} />
                ))}
              </datalist>
              <button type="button" className="job-spec-tag-editor" onClick={handleAddTag}><FaPlus /></button>
            </div>
          )}
          {tagError && <p className="job-spec-tagserror">{tagError}</p>}

          <div className="modal-field-date">
            <label className="modal-field-label">Published on</label>
            <input id="Published"
                  type="date"
                  placeholder="Publish Date"
                  value={published}
                  onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <input id="Position" required value={position} placeholder="Position" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field">
            <input id="Company" value={company} placeholder="Company" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field-add">
            <select id="Source" value={sourceId} onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
              <option value="">No source selected</option>
              {parents.map((s) => (<option key={s.Id} value={s.Id}>{s.Name}</option>))}
            </select>
            <button className="button" 
              onClick={() => {
                setSourceId('');
                setModalOpenSource(true);}}>
              <FaPlus />
            </button>
          </div>

          <div className="modal-field">
            <input id="link"
              value={link} 
              placeholder="URL to the job offer"
              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="modal-field-add">
            <div onClick={(e) => e.stopPropagation()}>
              <select id="Contact"
                      value={contactId ?? ''}
                      onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
                <option value="">No contact selected</option>
                {contacts.map((contact) => (
                  <option key={contact.Id ?? contact.id} value={contact.Id ?? contact.id}>
                    {contact.Name || contact.name || contact.Title || contact.Email || contact.EmailAddress || 'Unnamed contact'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="button"
                title="Create new contact"
                onClick={() => {
                  setContactId(null);
                  setModalOpenContact(true);
                }}><FaPlus /></button>
            </div>
          </div>

          <div className="modal-field">
            <select id="WorkModel"
                    value={workModelId} 
                    onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
              <option value="">No work model selected</option>
              {workModels.map((w) => (
                <option key={w.Id} value={w.Id}>{w.Name}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <select id="RoleType"
                    value={roleTypeId} 
                    onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
              <option value="">No role type selected</option>
              {roleTypes.map((r) => (<option key={r.Id} value={r.Id}>{r.Name}</option>))}
            </select>
          </div>

          <div className="modal-field-add">
            <select id="PlaceOfWork"
                    value={placeOfWorkId} 
                    onChange={(e) => handleFieldEdit(e.target.id, e.target.value)}>
              <option value="">No place of work selected</option>
              {placesOfWork.map((p) => {
                return (
                  <option key={p.Id} value={p.Id}>{placeOfWorkLabel(p)}</option>
                );
              })}
            </select>
            <button
              type="button"
              className="button"
              title="Create new place of work"
              onClick={() => {
                setPlaceOfWorkId('');
                setModalOpenPlaceOfWork(true);}}>
              <FaPlus />
            </button>
          </div>

          <div className="modal-field">
            <input id="SalaryExpectation" value={salaryExpectation} placeholder="Salary range" onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
          </div>

          <div className="job-spec-benefits-area">
            <div className="job-spec-benefits-header">Benefits</div>
            {!benefitEditorOpen && (
              <button type="button" className="job-spec-benefits-list-button" onClick={() => { setBenefitEditorOpen(true); setBenefitError(null); }}>
                <FaPlus />
              </button>
            )}
            <div className="job-spec-benefits-list">
              {lAddBenefits.length ? lAddBenefits.map((benefit: benefitWithNotes, index) => (
                <span className="job-spec-benefits-list" key={`${benefit.Benefit}-${index}`}>
                  <span>{benefit.Benefit}</span>
                  <input id={`benefit-note-${index}`} 
                        value={benefit.Notes} 
                        placeholder={"Notes about " + benefit.Benefit} 
                        onChange={(e) => handleBenefitNoteChange(index, e.target.value)} />
                  <button type="button" 
                          className="job-spec-benefit-button" 
                          onClick={() => handleRemoveBenefit(benefit.Benefit)}>
                    <FaTimes />
                  </button>
                </span>
              )) : <></>}
            </div>
          </div>
          {benefitEditorOpen && (
            <div className="job-spec-benefit-editor">
              <input
                className="job-spec-benefit-editor"
                value={benefitInput}
                placeholder="Type benefit name"
                onChange={(e) => setBenefitInput(e.target.value)}
                type="text"
                list="benefits-list"
              />
              <datalist id="benefits-list">
                {luBenefits.filter((benefit: any, index) => (!lAddBenefits.includes(benefit.Name))).map((benefit: any, index) => (
                  <option key={index} value={benefit.Name} />
                ))}
              </datalist>
              <button type="button" className="job-spec-benefit-editor" onClick={handleAddBenefit}><FaPlus /></button>
            </div>
          )}
          {benefitError && <p className="job-spec-benefitserror">{benefitError}</p>}

          <div className="modal-table">
            {showDescription ? (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowProfile(false);
                        setShowNotes(false)}}>

                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  {editableDescription ? (
                    <textarea id="Description"
                              value={description} 
                              placeholder="Description of the role" 
                              autoFocus
                              onBlur={(e) => setEditableDescription(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                  ) : (
                    <div className='modal-field-expanded-view' onClick={() => setEditableDescription(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={description && description !== '' ? safeValue(description) : "```Description of the role```"}
                      />
                    </div>
                  )}
                </span>
                <span className="modal-field"></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(true);
                        setShowAnalysis(false);
                        setShowProfile(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  {editableDescription ? (
                    <textarea id="Description"
                              value={description} 
                              placeholder="Description of the role" 
                              autoFocus
                              onBlur={(e) => setEditableDescription(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                  ) : (
                    <div className='modal-field-view' onClick={() => setEditableDescription(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={description && description !== '' ? safeValue(description) : "```Description of the role```"}
                      />
                    </div>
                  )}
                </span>
                <span className="modal-field"></span>
              </span>
            )}

            {showAnalysis ? (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowProfile(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  {editableAnalysis ? (
                    <textarea id="Analysis"
                              value={analysis} 
                              placeholder="Analysis of the role spec" 
                              autoFocus
                              onBlur={(e) => setEditableAnalysis(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                  ) : (
                    <div className='modal-field-expanded-view' onClick={() => setEditableAnalysis(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={analysis && analysis !== '' ? safeValue(analysis) : "```Analysis of the role spec```"}
                      />
                    </div>
                  )}
                </span>
                {showCallAI ? (
                  <span className="modal-field">
                    <button className="button" 
                            onClick={() => {
                                      setModalOpenOllamaAnalysis(true);
                                    }}
                    >Ask AI</button>
                  </span>
                ) : ('')}
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(true);
                        setShowProfile(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  {editableAnalysis ? (
                    <textarea id="Analysis"
                              value={analysis} 
                              placeholder="Analysis of the role spec" 
                              autoFocus
                              onBlur={(e) => setEditableAnalysis(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                  ) : (
                    <div className='modal-field-view' onClick={() => setEditableAnalysis(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={analysis && analysis !== '' ? safeValue(analysis) : "```Analysis of the role spec```"}
                      />
                    </div>
                  )}
                </span>
                {showCallAI ? (
                  <span className="modal-field">
                    <button className="button" 
                            onClick={() => {
                                      setModalOpenOllamaAnalysis(true);
                                    }}
                    >Ask AI</button>
                  </span>
                ) : ('')}
              </span>
            )}

            {showProfile ? (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowProfile(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  {editableProfile ? (
                    <textarea id="Profile"
                              value={profile} 
                              placeholder="Profile match to the role specification" 
                              autoFocus
                              onBlur={(e) => setEditableProfile(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                  ) : (
                    <div className='modal-field-expanded-view' onClick={() => setEditableProfile(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={profile && profile !== '' ? safeValue(profile) : "```Profile match to the role specification```"}
                      />
                    </div>
                  )}
                </span>
                {showCallAI ? (
                  <span className="modal-field">
                    <button className="button" 
                            onClick={() => {
                                      setModalOpenOllamaProfile(true);
                                    }}
                    >Ask AI</button>
                  </span>
                ) : ('')}
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowProfile(true);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  {editableProfile ? (
                    <textarea id="Profile"
                              value={profile} 
                              placeholder="Profile match to the role specification" 
                              autoFocus
                              onBlur={(e) => setEditableProfile(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                  ) : (
                    <div className='modal-field-view' onClick={() => setEditableProfile(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={profile && profile !== '' ? safeValue(profile) : "```Profile match to the role specification```"}
                      />
                    </div>
                  )}
                </span>
                {showCallAI ? (
                  <span className="modal-field">
                    <button className="button" 
                            onClick={() => {
                                      setModalOpenOllamaProfile(true);
                                    }}
                    >Ask AI</button>
                  </span>
                ) : ('')}
              </span>
            )}

            {showNotes ? (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowProfile(false);
                        setShowNotes(false)}}>
                  <FaRegArrowAltCircleDown />
                </span>
                <span className='modal-field-expanded'>
                  {editableNotes ? (
                    <textarea id="notes"
                              value={notes} 
                              placeholder="Notes about the role" 
                              autoFocus
                              onBlur={(e) => setEditableNotes(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                  ) : (
                    <div className='modal-field-expanded-view' onClick={() => setEditableNotes(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={notes && notes !== '' ? safeValue(notes) : "```Notes about the role```"}
                      />
                    </div>
                  )}
                </span>
                <span className='modal-field'></span>
              </span>
            ) : (
              <span className="modal-row">
                <span className='modal-field' 
                      style={{ 'marginTop': '10px' }} 
                      onClick={() => {
                        setShowDescription(false);
                        setShowAnalysis(false);
                        setShowProfile(false);
                        setShowNotes(true)}}>
                  <FaRegArrowAltCircleRight />
                </span>
                <span className='modal-field'>
                  {editableNotes ? (
                    <textarea id="notes"
                              value={notes} 
                              placeholder="Notes about the role" 
                              autoFocus
                              onBlur={(e) => setEditableNotes(false)}
                              onChange={(e) => handleFieldEdit(e.target.id, e.target.value)} />
                  ) : (
                    <div className='modal-field-view' onClick={() => setEditableNotes(true)}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeSanitize]}
                        children={notes && notes !== '' ? safeValue(notes) : "```Notes about the role```"}
                      />
                    </div>
                  )}
                </span>
                <span className='modal-field'></span>
              </span>
            )}
          </div>

          <span className="modal-actions">
            <button className="button" onClick={handleSubmit}>OK</button>
            <button className="button secondary-button" onClick={handleCancel}>Cancel</button>
          </span>
        </div>
      )}

      {modalOpenSource && (
        <SourceModal
          sourceId={null}
          title = "Create new Source"
          onClose={() => setModalOpenSource(false)}
          onSuccess={async () => {
            await fetchSources(true); // refresh portal list after modal close
            setModalOpenSource(false);
            setSourceId(sourceId);
          }}
        />
      )}

      {modalOpenPlaceOfWork && (
        <PlaceOfWorkModal
          placeOfWorkId={null}
          title = "Create new Place of Work"
          onClose={() => setModalOpenPlaceOfWork(false)}
          onSuccess={async () => {
            await fetchPlacesOfWork(true); // refresh portal list after modal close
            setModalOpenPlaceOfWork(false);
            setPlaceOfWorkId(placeOfWorkId);
          }}
        />
      )}

      {modalOpenContact && (
        <ContactModal
          contactId={null}
          iniSourceId={sourceId || null}
          title = "Create new Contact"
          onClose={() => setModalOpenContact(false)}
          onSuccess={async () => {
            await fetchContacts(true); // refresh portal list after modal close
            setModalOpenContact(false);
            setContactId(contactId);
          }}
        />
      )}

      {modalOpenOllamaAnalysis && (
        <OllamaRequestModal
          response={null}
          request={setting_keys.OLLAMA.PromptAnalyseJobspec}
          payload={description.trim()}
          title = "Analyse Job Specification"
          onClose={() => setModalOpenOllamaAnalysis(false)}
          onSuccess={async (response?: string) => {
            if (response) setAnalysis(response);
            setModalOpenOllamaAnalysis(false);
          }}
        />
      )}

      {modalOpenOllamaProfile && (
        <OllamaRequestModal
          response={null}
          request={setting_keys.OLLAMA.PromptMatchProfile}
          payload={description.trim()}
          title = "Profile match to the job spec"
          onClose={() => setModalOpenOllamaProfile(false)}
          onSuccess={async (response?: string) => {
            if (response) setProfile(response);
            setModalOpenOllamaProfile(false);
          }}
        />
      )}

    </section>
  );
}
