from typing import Annotated, Any
from fastapi import Header, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select

def _get_tag_or_404(session: Session, model: type[Any], tag_id: int | None = None, tag_name: str | None = None, tag_context: str | None = None, IsActive: bool | None = None) -> Any:
    if tag_id is not None:
        tags = session.get(model, (tag_id))
    elif tag_name is None or tag_context is None:
        statement = select(model)
        if IsActive:
            statement = statement.where(model.IsActive == True)
        if tag_name is not None:
            statement = statement.where(model.Name == tag_name)
        if tag_context is not None:
            statement = statement.where(model.Context == tag_context)
        tags = session.exec(statement).all()
    if not tags:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return tags

def _upsert_tag(session: Session, model: type[Any], payload: dict[str, Any]) -> Any:
    """
    Create or update a tag.
    
    * `payload` may be a Pydantic model (e.g. Tag) or
    a plain dictionary.  We normalise it to a dict for uniform handling.
    """
    # Normalise payload → dict
    if isinstance(payload, BaseModel):
        data: dict[str, Any] = payload.model_dump(exclude_unset=True)
    else:
        data = payload
    tag_id = data.get("Id")
    
    if tag_id is not None:
        # Update existing record
        tag = session.get(model, tag_id)
        if tag is None:
            #tag = model(**payload)
            raise HTTPException(
                status_code=404,
                detail=f"{model.__name__} with id {tag_id} not found",
            )
        else:
            for key, value in data.items():
                setattr(tag, key, value)
    else:
        # Create new record
        tag = model(**data)
    
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag

def _soft_delete_tag(session: Session, model: type[Any], tag_id: int) -> Any:
    tag = _get_tag_or_404(session, model, tag_id)
    tag.IsActive = False
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag

def _get_entity_or_404(session: Session, model: type[Any], entity_id: int | None = None, IsActive: bool | None = None) -> Any:
    statement = select(model)
    if entity_id is not None:
        entities = session.get(model, (entity_id))
    else:
        if IsActive:
            statement = statement.where(model.IsActive == True)
        statement = statement.order_by(model.Id.desc())
        entities = session.exec(statement).all()
    if not entities:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return entities

def _upsert_entity(session: Session, model: type[Any], payload: dict[str, Any]) -> Any:
    """
    Create or update an entity.
    
    * `payload` may be a Pydantic model (e.g. JobSpecCreate) or
      a plain dictionary.  We normalise it to a dict for uniform handling.
    """
    # Normalise payload → dict
    if isinstance(payload, BaseModel):
        data: dict[str, Any] = payload.model_dump(exclude_unset=True)
    else:
        data = payload
    entity_id = data.get("Id")
    
    if entity_id is not None:
        # Update existing record
        entity = session.get(model, entity_id)
        if entity is None:
            #entity = model(**payload)
            raise HTTPException(
                status_code=404,
                detail=f"{model.__name__} with id {entity_id} not found",
            )
        else:
            for key, value in data.items():
                setattr(entity, key, value)
    else:
        # Create new record
        entity = model(**data)
    
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

def __get_link_key_columns(model: type[Any]) -> list[str]:
    """
    Return the names of the primary key columns for a link table model."""
    return [col.key for col in model.__mapper__.primary_key]

def _get_link_or_404(session: Session, model: type[Any], pk1: int | None = None, pk2: int | None = None) -> Any:
    """
    Return a link row identified by one or both foreign keys.
    If only one id is given, the first matching row is returned;
    if none exist → 404.
    """
    pk_cols = __get_link_key_columns(model)
    pkey = getattr(model, pk_cols[0])
    skey = getattr(model, pk_cols[1])

    if pk1 is not None and pk2 is not None:
        links = session.get(model, (pk1, pk2))
    else:
        statement = select(model)
        if pk1 is not None:
            statement = statement.where(pkey == pk1)
        if pk2 is not None:
            statement = statement.where(skey == pk2)
        links = session.exec(statement).all()
    if not links:
        raise HTTPException(status_code=404, detail=f"{model.__name__} link not found")
    return links

def _upsert_link(session: Session, model: type[Any], payload: BaseModel | dict[str, Any]) -> Any:
    """
    Create a new link or update an existing one.
    `payload` must contain both primary keys (the composite key).
    """
    # Normalise to plain dict
    data = (
        payload.model_dump(exclude_unset=True)
        if isinstance(payload, BaseModel)
        else payload
    )
    pk_cols = __get_link_key_columns(model)
    pval = data.get(pk_cols[0])
    sval = data.get(pk_cols[1])

    if pval is None or sval is None:
        raise HTTPException(
            status_code=400,
            detail="Both primary keys are required",
        )

    # Try to fetch existing link
    entity = session.get(model, (pval, sval))
    if entity is not None:
        # Update existing record
        for key, value in data.items():
            setattr(entity, key, value)
    else:
        # Create new record
        entity = model(**data)
    session.add(entity)
    session.commit()
    session.refresh(entity)
    return entity

def _delete_link(session: Session, model: type[Any], pk1: int | None = None, pk2: int | None = None) -> Any:
    """
    Delete one or more link rows.
    * If both ids are supplied → delete that single row.
    * If only one id is supplied → delete every row matching that id.
    Returns the affected instance(s).
    """
    if pk1 is None and pk2 is None:
        raise HTTPException(
            status_code=400,
            detail="At least one identifier must be provided",
        )

    if pk1 is not None and pk2 is not None:
        row = _get_link_or_404(session, model, pk1, pk2)
        session.delete(row)
        session.commit()
        return row

    pk_cols = __get_link_key_columns(model)
    pkey = getattr(model, pk_cols[0])
    skey = getattr(model, pk_cols[1])

    statement = select(model)
    if pk1 is not None:
        statement = statement.where(pkey == pk1)
    if pk2 is not None:
        statement = statement.where(skey == pk2)

    rows = session.exec(statement).all()
    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"{model.__name__} link(s) not found",
        )

    for row in rows:
        session.delete(row)

    session.commit()

    return rows

def _get_appSetting_or_404(session: Session, model: type[Any], settingKey: str | None = None, IsActive: bool | None = None) -> Any:
    statement = select(model)
    if settingKey is not None:
        appSettings = session.get(model, (settingKey))
    else:
        if IsActive:
            statement = statement.where(model.IsActive == True)
        statement = statement.order_by(model.Key)
        appSettings = session.exec(statement).all()
    if not appSettings:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return appSettings

def _upsert_appSetting(session: Session, model: type[Any], payload: dict[str, Any]) -> Any:
    if isinstance(payload, BaseModel):
        data: dict[str, Any] = payload.model_dump(exclude_unset=True)
    else:
        data = payload
    appSettingKey = data.get("Key")

    appSetting = session.get(model, appSettingKey)
    if appSetting is None:
        # The setting doesn't exist, needs to be created
        appSetting = model(**data)
    else:
        if appSetting.IsActive == False:
            # It appears the setting has previously been deleted, is user tries to recreate it will fail, so we´ll undelete it with the new information
            appSetting.Value = payload.Value
            appSetting.Notes = payload.Notes
            appSetting.IsActive = payload.IsActive
        # The setting exists, needs to be updated
        for key, value in data.items():
            setattr(appSetting, key, value)

    session.add(appSetting)
    session.commit()
    session.refresh(appSetting)
    return appSetting

def _soft_delete_appSetting(session: Session, model: type[Any], appSettingKey: str) -> Any:
    appSetting = _get_appSetting_or_404(session, model, appSettingKey)
    appSetting.IsActive = False
    session.add(appSetting)
    session.commit()
    session.refresh(appSetting)
    return appSetting

#####################
#  special entities
from app.schemas import ContactBase, SourceBase
from app.models import rolesContact, rolesSource

def _get_contacts_by_source(session: Session, source_id: int, active_only: bool = True) -> list[ContactBase]:
    statement = select(rolesContact)
    statement = statement.where(rolesContact.SourceId  == source_id)    # Directly linked to a Source
    if (active_only):
        statement = statement.where(rolesContact.IsActive == True)      # Only non deleted Contacts
    statement = statement.order_by(rolesContact.Name.desc())
    return session.exec(statement).all()

def _get_main_sources(session: Session, active_only: bool = True) -> list[SourceBase]:
    statement = select(rolesSource)
    statement = statement.where(rolesSource.ParentId == None)       # ony main sources (have no parent)
    if (active_only):
        statement = statement.where(rolesSource.IsActive == True)   # Only non deleted Contacts
    statement = statement.order_by(rolesSource.Order.asc())
    return session.exec(statement).all()

def _get_sources_by_parent(session: Session, parent_id: int, active_only: bool = True) -> list[SourceBase]:
    statement = select(rolesSource)
    statement = statement.where(rolesSource.ParentId == parent_id)  # Directly children of the given source
    if (active_only):
        statement = statement.where(rolesSource.IsActive == True)   # Only non deleted Contacts
    statement = statement.order_by(rolesSource.Order.asc())
    return session.exec(statement).all()

#####################
#  JobSpec functions
from app.schemas import ApplicationBase, InterviewBase, OfferBase
from app.models import rolesJobSpec, rolesApplication, rolesInterview, rolesOffer

def _get_applications_by_job_spec(session: Session, job_spec_id: int) -> list[ApplicationBase]:
    statement = select(rolesApplication)
    statement = statement.where(rolesApplication.JobSpecId == job_spec_id)  # Directly linked to JobSpec
    statement = statement.where(rolesApplication.IsActive == True)          # Only non deleted Applications
    statement = statement.order_by(rolesApplication.Applied.desc())
    return session.exec(statement).all()

def _get_interviews_by_job_spec(session: Session, job_spec_id: int) -> list[InterviewBase]:
    statement = select(rolesInterview).distinct()
    statement = statement.join(
                    rolesApplication, 
                    rolesInterview.ApplicationId == rolesApplication.Id and rolesApplication.IsActive == True, 
                )
    statement = statement.where(rolesApplication.JobSpecId == job_spec_id)  # Directly linked to JobSpec
    statement = statement.where(rolesInterview.IsActive == True)            # Only active Applications
    statement = statement.order_by(rolesApplication.Applied.desc())
    statement = statement.order_by(rolesInterview.Scheduled.desc())
    return session.exec(statement).all()

def _get_offers_by_job_spec(session: Session, job_spec_id: int) -> list[OfferBase]:
    statement = select(rolesOffer).distinct()
    statement = statement.join(
                    rolesApplication, 
                    rolesOffer.ApplicationId == rolesApplication.Id and rolesApplication.IsActive == True, 
                )
    statement = statement.where(rolesApplication.JobSpecId == job_spec_id)  # Directly linked to JobSpec
    statement = statement.where(rolesOffer.IsActive == True)            # Only active Applications
    statement = statement.order_by(rolesApplication.Applied.desc())
    statement = statement.order_by(rolesOffer.Offered.desc())
    return session.exec(statement).all()

#####################
#  Workflow logic
from app.schemas import vwWorkflowBase
from app.models import vwWorkflow

def _workflow_get_received(session: Session) -> list[vwWorkflowBase]:
    statement = select(vwWorkflow)
    statement = statement.where(vwWorkflow.ApplicationId == None)   # JobSpec has not been applied
    statement = statement.order_by(vwWorkflow.Created.desc())
    return session.exec(statement).all()

def _workflow_get_applied(session: Session) -> list[vwWorkflowBase]:
    statement = select(vwWorkflow)
    statement = statement.where(vwWorkflow.ApplicationId != None)   # JobSpec has been applied
    statement = statement.where(vwWorkflow.InterviewId == None)     # Application has no interviews
    statement = statement.where(vwWorkflow.OfferId == None)         # Application has no offers
    statement = statement.where(vwWorkflow.Discarded == None)       # Application has not been discarded
    statement = statement.order_by(vwWorkflow.Created.desc())
    return session.exec(statement).all()

def _workflow_get_interview(session: Session) -> list[vwWorkflowBase]:
    statement = select(vwWorkflow)
    statement = statement.where(vwWorkflow.ApplicationId != None)   # JobSpec has been applied
    statement = statement.where(vwWorkflow.InterviewId != None)     # Application has at least one interviews
    statement = statement.where(vwWorkflow.OfferId == None)         # Application has no offers
    statement = statement.where(vwWorkflow.Discarded == None)       # Application has not been discarded
    statement = statement.order_by(vwWorkflow.Created.desc())
    return session.exec(statement).all()

def _workflow_get_offer(session: Session) -> list[vwWorkflowBase]:
    statement = select(vwWorkflow)
    statement = statement.where(vwWorkflow.ApplicationId != None)   # JobSpec has been applied
    statement = statement.where(vwWorkflow.OfferId != None)         # Application has at least one offer
    statement = statement.where(vwWorkflow.Discarded == None)       # Application has not been discarded
    statement = statement.order_by(vwWorkflow.Created.desc())
    return session.exec(statement).all()

def _workflow_get_discarded(session: Session) -> list[vwWorkflowBase]:
    statement = select(vwWorkflow)
    statement = statement.where(vwWorkflow.ApplicationId != None)   # JobSpec has been applied
    statement = statement.where(vwWorkflow.Discarded != None)       # Application is discarded
    statement = statement.order_by(vwWorkflow.Created.desc())
    return session.exec(statement).all()
