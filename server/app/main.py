from typing import Any

from fastapi import FastAPI, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.database import get_session, init_db
from app.models import (
    Application,
    Contact,
    Interview,
    JobSpec,
    LnkJobSpecBenefit,
    LuBenefit,
    LuLocation,
    LuRoleType,
    LuWorkModel,
    PlaceOfWork,
    Source,
)
from app.schemas import (
    JobSpecCreate,
    JobSpecRead,
    LookupCreate,
    LookupRead,
    LuLocationCreate,
    LuLocationRead,
    SourceCreate,
    SourceRead,
)

app = FastAPI(title="JobHunter API", version="0.1.0")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _get_entity_or_404(session: Session, model: type[Any], entity_id: int) -> Any:
    entity = session.get(model, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return entity


def _upsert_entity(session: Session, model: type[Any], payload: dict[str, Any]) -> Any:
    entity_id = payload.get("Id")
    if entity_id is not None:
        entity = session.get(model, entity_id)
        if entity is None:
            entity = model(**payload)
        else:
            for key, value in payload.items():
                setattr(entity, key, value)
    else:
        entity = model(**payload)
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity


def _soft_delete_entity(session: Session, model: type[Any], entity_id: int) -> Any:
    entity = _get_entity_or_404(session, model, entity_id)
    entity.IsActive = False
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity


@app.get("/api/v1/repository/locations", response_model=list[LuLocationRead])
def list_locations(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LuLocationRead]:
    statement = select(LuLocation)
    if active_only:
        statement = statement.where(LuLocation.IsActive == True)
    statement = statement.order_by(LuLocation.Order)
    return session.exec(statement).all()


@app.get("/api/v1/repository/locations/{location_id}", response_model=LuLocationRead)
def get_location(location_id: int, session: Session = Depends(get_session)) -> LuLocationRead:
    return _get_entity_or_404(session, LuLocation, location_id)


@app.post("/api/v1/repository/locations", response_model=LuLocationRead)
def create_or_update_location(payload: dict[str, Any], session: Session = Depends(get_session)) -> LuLocationRead:
    return _upsert_entity(session, LuLocation, payload)


@app.delete("/api/v1/repository/locations/{location_id}", response_model=LuLocationRead)
def delete_location(location_id: int, session: Session = Depends(get_session)) -> LuLocationRead:
    return _soft_delete_entity(session, LuLocation, location_id)


@app.get("/api/v1/repository/role-types", response_model=list[LookupRead])
def list_role_types(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuRoleType)
    if active_only:
        statement = statement.where(LuRoleType.IsActive == True)
    statement = statement.order_by(LuRoleType.Order)
    return session.exec(statement).all()


@app.get("/api/v1/repository/role-types/{role_type_id}", response_model=LookupRead)
def get_role_type(role_type_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _get_entity_or_404(session, LuRoleType, role_type_id)


@app.post("/api/v1/repository/role-types", response_model=LookupRead)
def create_or_update_role_type(payload: dict[str, Any], session: Session = Depends(get_session)) -> LookupRead:
    return _upsert_entity(session, LuRoleType, payload)


@app.delete("/api/v1/repository/role-types/{role_type_id}", response_model=LookupRead)
def delete_role_type(role_type_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _soft_delete_entity(session, LuRoleType, role_type_id)


@app.get("/api/v1/repository/work-models", response_model=list[LookupRead])
def list_work_models(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuWorkModel)
    if active_only:
        statement = statement.where(LuWorkModel.IsActive == True)
    statement = statement.order_by(LuWorkModel.Order)
    return session.exec(statement).all()


@app.get("/api/v1/repository/work-models/{work_model_id}", response_model=LookupRead)
def get_work_model(work_model_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _get_entity_or_404(session, LuWorkModel, work_model_id)


@app.post("/api/v1/repository/work-models", response_model=LookupRead)
def create_or_update_work_model(payload: dict[str, Any], session: Session = Depends(get_session)) -> LookupRead:
    return _upsert_entity(session, LuWorkModel, payload)


@app.delete("/api/v1/repository/work-models/{work_model_id}", response_model=LookupRead)
def delete_work_model(work_model_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _soft_delete_entity(session, LuWorkModel, work_model_id)


@app.get("/api/v1/repository/benefits", response_model=list[LookupRead])
def list_benefits(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuBenefit)
    if active_only:
        statement = statement.where(LuBenefit.IsActive == True)
    statement = statement.order_by(LuBenefit.Order)
    return session.exec(statement).all()


@app.get("/api/v1/repository/benefits/{benefit_id}", response_model=LookupRead)
def get_benefit(benefit_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _get_entity_or_404(session, LuBenefit, benefit_id)


@app.post("/api/v1/repository/benefits", response_model=LookupRead)
def create_or_update_benefit(payload: dict[str, Any], session: Session = Depends(get_session)) -> LookupRead:
    return _upsert_entity(session, LuBenefit, payload)


@app.delete("/api/v1/repository/benefits/{benefit_id}", response_model=LookupRead)
def delete_benefit(benefit_id: int, session: Session = Depends(get_session)) -> LookupRead:
    return _soft_delete_entity(session, LuBenefit, benefit_id)


@app.get("/api/v1/repository/sources", response_model=list[SourceRead])
def list_sources(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[SourceRead]:
    statement = select(Source)
    if active_only:
        statement = statement.where(Source.IsActive == True)
    return session.exec(statement).all()


@app.get("/api/v1/repository/sources/{source_id}", response_model=SourceRead)
def get_source_v1(source_id: int, session: Session = Depends(get_session)) -> SourceRead:
    return _get_entity_or_404(session, Source, source_id)


@app.post("/api/v1/repository/sources", response_model=SourceRead)
def create_or_update_source(payload: dict[str, Any], session: Session = Depends(get_session)) -> SourceRead:
    return _upsert_entity(session, Source, payload)


@app.delete("/api/v1/repository/sources/{source_id}", response_model=SourceRead)
def delete_source_v1(source_id: int, session: Session = Depends(get_session)) -> SourceRead:
    return _soft_delete_entity(session, Source, source_id)


@app.get("/api/v1/repository/places-of-work", response_model=list[PlaceOfWork])
def list_places_of_work(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[PlaceOfWork]:
    statement = select(PlaceOfWork)
    if active_only:
        statement = statement.where(PlaceOfWork.IsActive == True)
    return session.exec(statement).all()


@app.get("/api/v1/repository/places-of-work/{place_of_work_id}", response_model=PlaceOfWork)
def get_place_of_work(place_of_work_id: int, session: Session = Depends(get_session)) -> PlaceOfWork:
    return _get_entity_or_404(session, PlaceOfWork, place_of_work_id)


@app.post("/api/v1/repository/places-of-work", response_model=PlaceOfWork)
def create_or_update_place_of_work(payload: dict[str, Any], session: Session = Depends(get_session)) -> PlaceOfWork:
    return _upsert_entity(session, PlaceOfWork, payload)


@app.delete("/api/v1/repository/places-of-work/{place_of_work_id}", response_model=PlaceOfWork)
def delete_place_of_work(place_of_work_id: int, session: Session = Depends(get_session)) -> PlaceOfWork:
    return _soft_delete_entity(session, PlaceOfWork, place_of_work_id)


@app.get("/api/v1/repository/contacts", response_model=list[Contact])
def list_contacts(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Contact]:
    statement = select(Contact)
    if active_only:
        statement = statement.where(Contact.IsActive == True)
    return session.exec(statement).all()


@app.get("/api/v1/repository/contacts/{contact_id}", response_model=Contact)
def get_contact(contact_id: int, session: Session = Depends(get_session)) -> Contact:
    return _get_entity_or_404(session, Contact, contact_id)


@app.post("/api/v1/repository/contacts", response_model=Contact)
def create_or_update_contact(payload: dict[str, Any], session: Session = Depends(get_session)) -> Contact:
    return _upsert_entity(session, Contact, payload)


@app.delete("/api/v1/repository/contacts/{contact_id}", response_model=Contact)
def delete_contact(contact_id: int, session: Session = Depends(get_session)) -> Contact:
    return _soft_delete_entity(session, Contact, contact_id)


@app.get("/api/v1/repository/applications", response_model=list[Application])
def list_applications(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Application]:
    statement = select(Application)
    if active_only:
        statement = statement.where(Application.IsActive == True)
    return session.exec(statement).all()


@app.get("/api/v1/repository/applications/{application_id}", response_model=Application)
def get_application(application_id: int, session: Session = Depends(get_session)) -> Application:
    return _get_entity_or_404(session, Application, application_id)


@app.post("/api/v1/repository/applications", response_model=Application)
def create_or_update_application(payload: dict[str, Any], session: Session = Depends(get_session)) -> Application:
    return _upsert_entity(session, Application, payload)


@app.delete("/api/v1/repository/applications/{application_id}", response_model=Application)
def delete_application(application_id: int, session: Session = Depends(get_session)) -> Application:
    return _soft_delete_entity(session, Application, application_id)


@app.get("/api/v1/repository/job-specs", response_model=list[JobSpecRead])
def list_job_specs(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecRead]:
    statement = select(JobSpec)
    if active_only:
        statement = statement.where(JobSpec.IsActive == True)
    statement = statement.order_by(JobSpec.Created.desc())
    return session.exec(statement).all()


@app.get("/api/v1/repository/job-specs/{job_spec_id}", response_model=JobSpecRead)
def get_job_spec_v1(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecRead:
    return _get_entity_or_404(session, JobSpec, job_spec_id)


@app.post("/api/v1/repository/job-specs", response_model=JobSpecRead)
def create_or_update_job_spec(payload: dict[str, Any], session: Session = Depends(get_session)) -> JobSpecRead:
    return _upsert_entity(session, JobSpec, payload)


@app.delete("/api/v1/repository/job-specs/{job_spec_id}", response_model=JobSpecRead)
def delete_job_spec_v1(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecRead:
    return _soft_delete_entity(session, JobSpec, job_spec_id)


@app.get("/api/v1/repository/interviews", response_model=list[Interview])
def list_interviews(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Interview]:
    statement = select(Interview)
    if active_only:
        statement = statement.where(Interview.IsActive == True)
    return session.exec(statement).all()


@app.get("/api/v1/repository/interviews/{interview_id}", response_model=Interview)
def get_interview(interview_id: int, session: Session = Depends(get_session)) -> Interview:
    return _get_entity_or_404(session, Interview, interview_id)


@app.post("/api/v1/repository/interviews", response_model=Interview)
def create_or_update_interview(payload: dict[str, Any], session: Session = Depends(get_session)) -> Interview:
    return _upsert_entity(session, Interview, payload)


@app.delete("/api/v1/repository/interviews/{interview_id}", response_model=Interview)
def delete_interview(interview_id: int, session: Session = Depends(get_session)) -> Interview:
    return _soft_delete_entity(session, Interview, interview_id)


@app.get("/api/v1/repository/job-spec-benefits", response_model=list[LnkJobSpecBenefit])
def list_job_spec_benefits(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LnkJobSpecBenefit]:
    statement = select(LnkJobSpecBenefit)
    if active_only:
        statement = statement.where(LnkJobSpecBenefit.IsActive == True)
    return session.exec(statement).all()


@app.get("/api/v1/repository/job-spec-benefits/{job_spec_id}/{benefit_id}", response_model=LnkJobSpecBenefit)
def get_job_spec_benefit(job_spec_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefit:
    entity = session.get(LnkJobSpecBenefit, (job_spec_id, benefit_id))
    if not entity:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    return entity


@app.post("/api/v1/repository/job-spec-benefits", response_model=LnkJobSpecBenefit)
def create_or_update_job_spec_benefit(payload: dict[str, Any], session: Session = Depends(get_session)) -> LnkJobSpecBenefit:
    return _upsert_entity(session, LnkJobSpecBenefit, payload)


@app.delete("/api/v1/repository/job-spec-benefits/{job_spec_id}/{benefit_id}", response_model=LnkJobSpecBenefit)
def delete_job_spec_benefit(job_spec_id: int, benefit_id: int, session: Session = Depends(get_session)) -> LnkJobSpecBenefit:
    entity = session.get(LnkJobSpecBenefit, (job_spec_id, benefit_id))
    if not entity:
        raise HTTPException(status_code=404, detail="Job spec benefit link not found")
    entity.IsActive = False
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity


@app.get("/api/getLuLocations", response_model=list[LookupRead])
def get_lu_locations(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuLocation)
    if active_only:
        statement = statement.where(LuLocation.IsActive == True)
    statement = statement.order_by(LuLocation.Order)
    return session.exec(statement).all()


@app.get("/api/getLuLocationById", response_model=LuLocationRead)
def get_lu_location_by_id(location_id: int, session: Session = Depends(get_session)) -> LuLocationRead:
    location = session.get(LuLocation, location_id)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location


@app.get("/api/getLuRoleTypes", response_model=list[LookupRead])
def get_lu_role_types(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuRoleType)
    if active_only:
        statement = statement.where(LuRoleType.IsActive == True)
    statement = statement.order_by(LuRoleType.Order)
    return session.exec(statement).all()


@app.get("/api/getLuWorkModels", response_model=list[LookupRead])
def get_lu_work_models(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuWorkModel)
    if active_only:
        statement = statement.where(LuWorkModel.IsActive == True)
    statement = statement.order_by(LuWorkModel.Order)
    return session.exec(statement).all()


@app.get("/api/getLuBenefits", response_model=list[LookupRead])
def get_lu_benefits(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[LookupRead]:
    statement = select(LuBenefit)
    if active_only:
        statement = statement.where(LuBenefit.IsActive == True)
    statement = statement.order_by(LuBenefit.Order)
    return session.exec(statement).all()


@app.post("/api/setLuLocation", response_model=LuLocationRead)
def set_lu_location(payload: LuLocationCreate, session: Session = Depends(get_session)) -> LuLocationRead:
    location = LuLocation(**payload.model_dump())
    session.add(location)
    session.commit()
    session.refresh(location)
    return location


@app.post("/api/setLuRoleType", response_model=LookupRead)
def set_lu_role_type(payload: LookupCreate, session: Session = Depends(get_session)) -> LookupRead:
    role_type = LuRoleType(**payload.model_dump())
    session.add(role_type)
    session.commit()
    session.refresh(role_type)
    return role_type


@app.post("/api/setLuWorkModel", response_model=LookupRead)
def set_lu_work_model(payload: LookupCreate, session: Session = Depends(get_session)) -> LookupRead:
    work_model = LuWorkModel(**payload.model_dump())
    session.add(work_model)
    session.commit()
    session.refresh(work_model)
    return work_model


@app.post("/api/setLuBenefit", response_model=LookupRead)
def set_lu_benefit(payload: LookupCreate, session: Session = Depends(get_session)) -> LookupRead:
    benefit = LuBenefit(**payload.model_dump())
    session.add(benefit)
    session.commit()
    session.refresh(benefit)
    return benefit


@app.get("/api/getSources", response_model=list[SourceRead])
def get_sources(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[SourceRead]:
    statement = select(Source)
    if active_only:
        statement = statement.where(Source.IsActive == True)
    return session.exec(statement).all()


@app.get("/api/getSourceById", response_model=SourceRead)
def get_source_by_id(source_id: int, session: Session = Depends(get_session)) -> SourceRead:
    source = session.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return source


@app.post("/api/setSource", response_model=SourceRead)
def set_source(payload: SourceCreate, session: Session = Depends(get_session)) -> SourceRead:
    source = Source(**payload.model_dump())
    session.add(source)
    session.commit()
    session.refresh(source)
    return source


@app.get("/api/getJobSpecs", response_model=list[JobSpecRead])
def get_job_specs(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[JobSpecRead]:
    statement = select(JobSpec)
    if active_only:
        statement = statement.where(JobSpec.IsActive == True)
    statement = statement.order_by(JobSpec.Created.desc())
    return session.exec(statement).all()


@app.get("/api/getJobSpecById", response_model=JobSpecRead)
def get_job_spec_by_id(job_spec_id: int, session: Session = Depends(get_session)) -> JobSpecRead:
    job_spec = session.get(JobSpec, job_spec_id)
    if not job_spec:
        raise HTTPException(status_code=404, detail="Job spec not found")
    return job_spec


@app.post("/api/setJobSpec", response_model=JobSpecRead)
def set_job_spec(payload: JobSpecCreate, session: Session = Depends(get_session)) -> JobSpecRead:
    job_spec = JobSpec(**payload.model_dump())
    session.add(job_spec)
    session.commit()
    session.refresh(job_spec)
    return job_spec


@app.get("/api/getApplications", response_model=list[Application])
def get_applications(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Application]:
    statement = select(Application)
    if active_only:
        statement = statement.where(Application.IsActive == True)
    return session.exec(statement).all()


@app.get("/api/getContacts", response_model=list[Contact])
def get_contacts(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Contact]:
    statement = select(Contact)
    if active_only:
        statement = statement.where(Contact.IsActive == True)
    return session.exec(statement).all()


@app.get("/api/getInterviews", response_model=list[Interview])
def get_interviews(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> list[Interview]:
    statement = select(Interview)
    if active_only:
        statement = statement.where(Interview.IsActive == True)
    return session.exec(statement).all()
