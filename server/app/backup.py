import base64
import json
import re
from fastapi import HTTPException
from datetime import date, datetime
from pathlib import Path
from typing import Any

from sqlmodel import Session, select

from app.dependencies import (
    upsert_appSetting, 
    upsert_entity, 
    upsert_link, 
    _get_tag, 
    _get_entity, 
    _get_link, 
    get_applications_by_job_spec, 
    get_interviews_by_job_spec, 
    get_offers_by_job_spec
)
from app.models import (
    appSetting,
    tag,
    rolesLuBenefit,
    rolesLuLocation,
    rolesLuRoleType,
    rolesLuWorkModel,
    rolesSource,
    rolesPlaceOfWork,
    rolesContact,
    rolesLnkJobSpecTags,
    rolesLnkJobSpecBenefit,
    rolesLnkOfferBenefit,
    rolesJobSpec,
    rolesApplication,
    rolesInterview,
    rolesOffer
)

LOOKUP_EXPORT_ORDER: dict[str, type[Any]] = {
    "tags": tag,
    "locations": rolesLuLocation,
    "role_types": rolesLuRoleType,
    "work_models": rolesLuWorkModel,
    "benefits": rolesLuBenefit,
    "sources": rolesSource,
    "contacts": rolesContact,
}

def _json_safe(value: Any) -> Any:
    if isinstance(value, bytes):
        return base64.b64encode(value).decode("utf-8")
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, list):
        return [_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: _json_safe(val) for key, val in value.items()}
    return value

def _model_rows_to_payload(rows: list[Any]) -> list[dict[str, Any]]:
    payload: list[dict[str, Any]] = []
    for row in rows:
        payload.append(_json_safe(row.model_dump()))
    return payload

def _rows_to_payload(rows: list[Any]) -> list[dict[str, Any]]:
    payload: list[dict[str, Any]] = []
    for row in rows:
        payload.append(_json_safe(row))
    return payload

def _get_item_id(model: Any, item: Any, current_list) -> int | None:
    id = None

    if model is rolesLuLocation:
        existing_items = [luItem for luItem in current_list if luItem.Country == item['Country'] and luItem.City == item['City']]
    elif model is tag:
        existing_items = [luItem for luItem in current_list if luItem.Name == item['Name'] and luItem.Context == item['Context']]
    else:
        existing_items = [luItem for luItem in current_list if luItem.Name == item['Name']]
    if len(existing_items) > 0:
        id = existing_items[0].Id
    return id
    id = None

def _str_to_date(strDate: str) -> datetime | None:
    if re.match("^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.\d+$", strDate): return datetime.strptime(strDate, "%Y-%m-%dT%H:%M:%S.%f")
    elif re.match("^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d$", strDate): return datetime.strptime(strDate, "%Y-%m-%dT%H:%M:%S")
    elif re.match("^\d\d\d\d-\d\d-\d\d$", strDate): return datetime.strptime(strDate, "%Y-%m-%d")
    return None

def export_system_backup(session: Session, IsActive: bool | None = None) -> dict[str, Any]:
    statement = select(appSetting)
    if IsActive:
        statement = statement.where(appSetting.IsActive == True)
    settings = session.exec(statement).all()
    lookups: dict[str, list[dict[str, Any]]] = {}

    for table_name, model in LOOKUP_EXPORT_ORDER.items():
        statement = select(model)
        if IsActive:
            statement = statement.where(model.IsActive == True)
        rows = session.exec(statement).all()
        lookups[table_name] = _model_rows_to_payload(rows)

    return {
        "app_settings": _model_rows_to_payload(settings),
        "lookups": lookups,
    }

def export_system_backup_to_file(session: Session, file_path: str | Path, IsActive: bool | None = None) -> Path:
    payload = export_system_backup(session, IsActive)
    target = Path(file_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return target

def import_system_backup_payload(session: Session, payload: dict[str, Any]) -> dict[str, str | int]:
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Backup payload must be a JSON object")

    app_settings = payload.get("app_settings", [])
    if not isinstance(app_settings, list):
        raise HTTPException(status_code=400, detail="app_settings must be a list")

    lookups = payload.get("lookups", {})
    if not isinstance(lookups, dict):
        raise HTTPException(status_code=400, detail="lookups must be an object")

    for item in app_settings:
        upsert_appSetting(session, appSetting, item)

    for table_name, model in LOOKUP_EXPORT_ORDER.items():
        rows = lookups.get(table_name, [])
        if rows is None:
            continue
        if not isinstance(rows, list):
            raise HTTPException(status_code=400, detail=f"lookups.{table_name} must be a list")
        statement = select(model)
        current_lu_values = session.exec(statement).all()
        for row in rows:
            row['Id'] = _get_item_id(model, row, current_lu_values)
            upsert_entity(session, model, row)
    return {
        "state": 200,
        "message": "System settings and lookups imported successfully",
    }

def import_system_backup_from_file(session: Session, file_path: str | Path) -> dict[str, str | int]:
    target = Path(file_path)
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"Backup file not found: {target}")

    payload = json.loads(target.read_text(encoding="utf-8"))
    return import_system_backup_payload(session, payload)

def export_roles_backup(session: Session, JobSpecId: int | None, IsActive: bool | None = None) -> dict[str, Any]:
    lJobSpecs: list[dict[str, Any]] = []

    statement = select(rolesJobSpec)
    if JobSpecId:
        statement = statement.where(rolesJobSpec.Id == JobSpecId)
    if IsActive:
        statement = statement.where(rolesJobSpec.IsActive == True)
    jobSpecs = session.exec(statement).all()
    for jobSpec in jobSpecs:
        job_spec_dict = _json_safe(jobSpec.model_dump())
        tags: list[dict[str, Any]] = {}

        if (jobSpec.SourceId):
            source = _get_entity(session, rolesSource, jobSpec.SourceId)
            if hasattr(jobSpec, 'Source') and source:
                job_spec_dict['Source'] = _json_safe(source.model_dump())
        if (jobSpec.PlaceOfWorkId): 
            placeOfWork = _get_entity(session, rolesPlaceOfWork, jobSpec.PlaceOfWorkId)
            if hasattr(jobSpec, 'PlaceOfWork') and placeOfWork:
                pw_dict = _json_safe(placeOfWork.model_dump())
                if hasattr(placeOfWork, 'Location') and placeOfWork.LocationId:
                    location = _get_entity(session, rolesLuLocation, placeOfWork.LocationId)
                    if location:
                        pw_dict['Location'] = _json_safe(location.model_dump())
                job_spec_dict['PlaceOfWork'] = pw_dict
        if (jobSpec.WorkModelId): 
            workModel = _get_entity(session, rolesLuWorkModel, jobSpec.WorkModelId)
            if hasattr(jobSpec, 'WorkModel') and workModel:
                job_spec_dict['WorkModel'] = _json_safe(workModel.model_dump())
        if (jobSpec.RoleTypeId): 
            roleType = _get_entity(session, rolesLuRoleType, jobSpec.RoleTypeId)
            if hasattr(jobSpec, 'RoleType') and roleType:
                job_spec_dict['RoleType'] = _json_safe(roleType.model_dump())
        if (jobSpec.ContactId): 
            contact = _get_entity(session, rolesContact, jobSpec.ContactId)
            if hasattr(jobSpec, 'Contact') and contact:
                job_spec_dict['Contact'] = _json_safe(contact.model_dump())
        jobSpecTags = _get_link(session, rolesLnkJobSpecTags, jobSpec.Id, None)
        if (len(jobSpecTags) > 0):
            for jobSpecTag in jobSpecTags:
                tag = _get_tag(session, tag, jobSpecTag.TagId)
                if (IsActive == None) or (not IsActive) or (IsActive and tag.IsActive): tags.append(tag)
            if len(tags) > 0: 
                if hasattr(jobSpec, 'Tags') and tags:
                    job_spec_dict['Tags'] = [_json_safe(t.model_dump()) for t in tags]
        jobSpecBenefits = _get_link(session, rolesLnkJobSpecBenefit, jobSpec.Id, None)
        if (len(jobSpecBenefits) > 0):
            benefits: list[dict[str, Any]] = {}

            for jobSpecBenefit in jobSpecBenefits:
                benefit = _get_entity(session, rolesLuBenefit, jobSpecBenefit.LuBenefitId)
                if (IsActive == None) or (not IsActive) or (IsActive and benefit.IsActive): benefits.append(benefit)
            if len(benefits) > 0: 
                if hasattr(jobSpec, 'Benefits') and benefits:
                    job_spec_dict['Benefits'] = [_json_safe(b.model_dump()) for b in benefits]

        applications = get_applications_by_job_spec(session, jobSpec.Id)
        interviews = get_interviews_by_job_spec(session, jobSpec.Id)
        offers = get_offers_by_job_spec(session, jobSpec.Id)

        if (len(applications) > 0):
            app_dicts = []
            for app in applications:
                app_dict = _json_safe(app.model_dump())
                interview_dicts = []
                offers_dicts = []

                if len(interviews) > 0:
                    for interview in interviews:
                        if app.Id == interview.ApplicationId: 
                            interview_dict = _json_safe(interview.model_dump())
                            if (interview.ContactId): 
                                contact = _get_entity(session, rolesContact, interview.ContactId)
                                if hasattr(interview, 'Contact') and contact:
                                    interview_dict['Contact'] = _json_safe(contact.model_dump())
                            interview_dicts.append(interview_dict)
                    if hasattr(app, 'Interviews'): app_dict['Interviews'] = interview_dicts

                if len(offers) > 0:
                    for offer in offers:
                        if app.Id == offer.ApplicationId:
                            offer_dict = _json_safe(offer.model_dump())
                            offerBenefits = _get_link(session, rolesLnkOfferBenefit, offer.Id, None)
                            if (len(offerBenefits) > 0):
                                benefits: list[dict[str, Any]] = {}

                                for offerBenefit in offerBenefits:
                                    benefit = _get_entity(session, rolesLuBenefit, offerBenefit.LuBenefitId)
                                    if (IsActive == None) or (not IsActive) or (IsActive and benefit.IsActive): benefits.append(benefit)
                                if len(benefits) > 0: 
                                    if hasattr(offer, 'Benefits') and benefits:
                                        offer_dict['Benefits'] = [_json_safe(b.model_dump()) for b in benefits]
                            offers_dicts.append(offer_dict)
                    if hasattr(app, 'Offers'): app_dict['Offers'] = offers_dicts
                app_dicts.append(app_dict)

            if hasattr(jobSpec, 'Applications'):
                job_spec_dict['Applications'] = app_dicts
        lJobSpecs.append(job_spec_dict)
    return {
        "JobSpecs": lJobSpecs,
    }

def export_roles_backup_to_file(session: Session, file_path: str | Path, JobSpecId: int | None, IsActive: bool | None = None) -> Path:
    payload = export_roles_backup(session, JobSpecId, IsActive)
    target = Path(file_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return target

def import_roles_backup_payload(session: Session, payload: dict[str, Any]) -> dict[str, str | int]:
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Backup payload must be a JSON object")

    JobSpecs = payload.get("JobSpecs", [])
    if not isinstance(JobSpecs, list):
        raise HTTPException(status_code=400, detail="JobSpecs must be a list")

    if (len(JobSpecs) > 0):
        #lTags = _get_tag(session, tag, None, None, None, True)
        lBenefits = _get_entity(session, rolesLuBenefit, None, True)
        lLocations = _get_entity(session, rolesLuLocation, None, True)
        lRoleTypes = _get_entity(session, rolesLuRoleType, None, True)
        lWorkModels = _get_entity(session, rolesLuWorkModel, None, True)
        lSources = _get_entity(session, rolesSource, None, True)
        lPlacesOfWork = _get_entity(session, rolesPlaceOfWork, None, True)
        lContacts = _get_entity(session, rolesContact, None, True)
        # Helper function to safely access attributes on ORM objects
        def get_attr(obj, attr_name):
            if hasattr(obj, attr_name):
                return getattr(obj, attr_name)
            return None

        for jobSpec in JobSpecs:
            nJobSpec = rolesJobSpec()
            if ('Position' in jobSpec): nJobSpec.Position = jobSpec['Position']
            if ('Company' in jobSpec): nJobSpec.Company = jobSpec['Company']
            if ('Link' in jobSpec): nJobSpec.Link = jobSpec['Link']
            if ('SalaryExpectation' in jobSpec): nJobSpec.SalaryExpectation = jobSpec['SalaryExpectation']
            if ('Description' in jobSpec): nJobSpec.Description = jobSpec['Description']
            if ('Analysis' in jobSpec): nJobSpec.Analysis = jobSpec['Analysis']
            if ('Profile' in jobSpec): nJobSpec.Profile = jobSpec['Profile']
            if ('Notes' in jobSpec): nJobSpec.Notes = jobSpec['Notes']
            if ('Published' in jobSpec) and jobSpec['Published'] and jobSpec['Published'] != '': nJobSpec.Published = _str_to_date(jobSpec['Published'])
            if ('Created' in jobSpec) and jobSpec['Created'] and jobSpec['Created'] != '': nJobSpec.Created = _str_to_date(jobSpec['Created'])
            nJobSpec.IsActive = jobSpec['IsActive']

            if jobSpec.get('Source'):
                foundItem = next((item for item in lSources 
                                if get_attr(item, 'Name') == jobSpec["Source"].get('Name') and get_attr(item, 'PortalURL') == jobSpec["Source"].get('PortalURL')), None)
                if foundItem: nJobSpec.SourceId = get_attr(foundItem, 'Id')
            if jobSpec.get('PlaceOfWork'):
                PlaceOfWorkId = None
                LocationId = None
                
                if jobSpec['PlaceOfWork'].get('Location'):
                    foundItem = next((item for item in lLocations 
                                    if get_attr(item, 'Country') == jobSpec["PlaceOfWork"]["Location"].get('Country') and get_attr(item, 'City') == jobSpec["PlaceOfWork"]["Location"].get('City')), None)
                    if foundItem: 
                        LocationId = get_attr(foundItem, 'Id')
                        foundItem = next((item for item in lPlacesOfWork 
                                        if get_attr(item, 'Address') == jobSpec["PlaceOfWork"].get('Address') and get_attr(item, 'LocationId') == LocationId), None)
                        if foundItem: PlaceOfWorkId = get_attr(foundItem, 'Id')
                else:
                    foundItem = next((item for item in lPlacesOfWork 
                                    if get_attr(item, 'Address') == jobSpec["PlaceOfWork"].get('Address')), None)
                    if foundItem: PlaceOfWorkId = get_attr(foundItem, 'Id')
                if PlaceOfWorkId: nJobSpec.PlaceOfWorkId = PlaceOfWorkId
            if jobSpec.get('WorkModel'):
                foundItem = next((item for item in lWorkModels 
                                if get_attr(item, 'Name') == jobSpec["WorkModel"].get('Name')), None)
                if foundItem: nJobSpec.WorkModelId = get_attr(foundItem, 'Id')
            if jobSpec.get('RoleType'):
                foundItem = next((item for item in lRoleTypes 
                                if get_attr(item, 'Name') == jobSpec["RoleType"].get('Name')), None)
                if foundItem: nJobSpec.RoleTypeId = get_attr(foundItem, 'Id')
            if jobSpec.get('Contact'):
                foundItem = next((item for item in lContacts 
                                if get_attr(item, 'Name') == jobSpec["Contact"].get('Name') and get_attr(item, 'Email') == jobSpec["Contact"].get('Email')), None)
                if foundItem: nJobSpec.ContactId = get_attr(foundItem, 'Id')

            nJobSpec.Id = upsert_entity(session, rolesJobSpec, nJobSpec).Id

            if jobSpec.get('Benefits') and len(jobSpec['Benefits']) > 0:
                order = 0
                for benefit in jobSpec['Benefits']:
                    nLink = rolesLnkJobSpecBenefit()
                    nLink.JobSpecId = jobSpec['Id']
                    nLink.Order = order
                    order += 1
                    foundItem = next((item for item in lBenefits 
                                    if get_attr(item, 'Name') == benefit.get('Name')), None)
                    if foundItem: 
                        nLink.LuBenefitId = get_attr(foundItem, 'Id')
                        upsert_link(session, rolesLnkJobSpecBenefit, nLink)

            #if jobSpec.get('Tags') and len(jobSpec['Tags']):
            #    order = 0
            #    for tag in jobSpec['Tags']:
            #        nLink: rolesLnkJobSpecTags()
            #        nLink.JobSpecId = jobSpec['Id']
            #        nLink.Order = order
            #        order += 1
            #        foundItem = next((item for item in lTags if get_attr(item, 'Name') == tag.get('Name') and get_attr(item, 'Context') == tag.get('Context')), None)
            #        if foundItem: 
            #            nLink.TagId = get_attr(foundItem, 'Id')
            #            upsert_link(session, rolesLnkJobSpecTags, nLink)

            if jobSpec.get('Applications') and len(jobSpec['Applications']) > 0:
                for application in jobSpec['Applications']:
                    nApplication = rolesApplication()
                    nApplication.JobSpecId = nJobSpec.Id
                    if 'Letter' in application: nApplication.Letter = application['Letter']
                    if 'CV' in application: nApplication.CV = application['CV']
                    if 'Notes' in application: nApplication.Notes = application['Notes']
                    if 'IsActive' in application: nApplication.IsActive = application['IsActive']
                    if 'Applied' in application and application['Applied'] and application['Applied'] != '': nApplication.Applied = _str_to_date(application['Applied'])
                    if 'Confirmed' in application and application['Confirmed'] and application['Confirmed'] != '': nApplication.Confirmed = _str_to_date(application['Confirmed'])
                    if 'Discarded' in application and application['Discarded'] and application['Discarded'] != '': nApplication.Discarded = _str_to_date(application['Discarded'])

                    nApplication.Id = upsert_entity(session, rolesApplication, nApplication).Id

                    if application.get('Interviews') and len(application['Interviews']) > 0:
                        for interview in application['Interviews']:
                            nInterview = rolesInterview()
                            nInterview.ApplicationId = nApplication.Id
                            if 'Description' in interview: nInterview.Description = interview['Description']
                            if 'Analysis' in interview: nInterview.Analysis = interview['Analysis']
                            if 'Notes' in interview: nInterview.Notes = interview['Notes']
                            if 'Outcome' in interview: nInterview.Outcome = interview['Outcome']
                            if 'Feedback' in interview: nInterview.Feedback = interview['Feedback']
                            if 'IsActive' in interview: nInterview.IsActive = interview['IsActive']
                            if 'Scheduled' in interview and interview['Scheduled'] and interview['Scheduled'] != '': nInterview.Scheduled = _str_to_date(interview['Scheduled'])
                            if interview.get('Contact'):
                                foundItem = next((item for item in lContacts 
                                                if get_attr(item, 'Name') == interview["Contact"].get('Name') and get_attr(item, 'Email') == interview["Contact"].get('Email')), None)
                                if foundItem: nInterview.ContactId = get_attr(foundItem, 'Id')

                            nInterview.Id = upsert_entity(session, rolesInterview, nInterview).Id

                    if application.get('Offers') and len(application['Offers']) > 0:
                        for offer in application['Offers']:
                            nOffer = rolesOffer()
                            nOffer.ApplicationId = nApplication.Id
                            if 'Salary' in offer: nOffer.Salary = offer['Salary']
                            if 'Description' in offer: nOffer.Description = offer['Description']
                            if 'Notes' in offer: nOffer.Notes = offer['Notes']
                            if 'IsActive' in offer: nOffer.IsActive = offer['IsActive']
                            if 'Offered' in offer and offer['Offered'] and offer['Offered'] != '': nOffer.Offered = _str_to_date(offer['Offered'])

                            nOffer.Id = upsert_entity(session, rolesOffer, nOffer).Id
                            if offer.get('Benefits') and len(offer['Benefits']) > 0:
                                order = 0
                                for benefit in offer['Benefits']:
                                    nLink = rolesLnkOfferBenefit()
                                    nLink.JobSpecId = nOffer.Id
                                    nLink.Order = order
                                    order += 1
                                    foundItem = next((item for item in lBenefits 
                                                    if get_attr(item, 'Name') == benefit.get('Name')), None)
                                    if foundItem: 
                                        nLink.LuBenefitId = get_attr(foundItem, 'Id')
                                        upsert_link(session, rolesLnkOfferBenefit, nLink)

    return {
        "state": 200,
        "message": "JobSpecs imported successfully",
    }

def import_roles_backup_from_file(session: Session, file_path: str | Path) -> dict[str, str | int]:
    target = Path(file_path)
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"Backup file not found: {target}")

    payload = json.loads(target.read_text(encoding="utf-8"))
    return import_roles_backup_payload(session, payload)
