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

#####################
#  Workflow logic
from app.schemas import JobSpecBase
from app.models import rolesJobSpec, rolesApplication, rolesInterview

def _workflow_get_received(session: Session) -> list[JobSpecBase]:
    statement = select(rolesJobSpec).distinct()
    statement = statement.join(
                    rolesApplication, 
                    rolesApplication.JobSpecId == rolesJobSpec.Id, 
                    isouter=True
                )
    statement = statement.where(rolesApplication.Id == None)  # JobSpec has not been applied
    statement = statement.order_by(rolesJobSpec.Created.desc())
    return session.exec(statement).all()

def _workflow_get_applied(session: Session) -> list[JobSpecBase]:
    statement = select(rolesJobSpec).distinct()
    statement = statement.join(
                    rolesApplication, 
                    rolesApplication.JobSpecId == rolesJobSpec.Id, 
                    isouter=True
                )
    statement = statement.join(
                    rolesInterview, 
                    rolesInterview.ApplicationId == rolesApplication.Id, 
                    isouter=True
                )
    statement = statement.where(rolesJobSpec.IsActive == True)  # JobSpec has a non discarded applications
    statement = statement.where(rolesApplication.IsActive == True)  # JobSpec has a non discarded applications
    statement = statement.where(rolesApplication.Id != None)
    statement = statement.where(rolesInterview.Id == None)  # Application has no interviews
    statement = statement.where(rolesApplication.Discarded == None)
    statement = statement.order_by(rolesJobSpec.Created.desc())
    return session.exec(statement).all()

def _workflow_get_interview(session: Session) -> list[JobSpecBase]:
    statement = select(rolesJobSpec).distinct()
    statement = statement.join(
                    rolesApplication, 
                    rolesApplication.JobSpecId == rolesJobSpec.Id, 
                    isouter=True
                )
    statement = statement.join(
                    rolesInterview, 
                    rolesInterview.ApplicationId == rolesApplication.Id, 
                    isouter=True
                )
    statement = statement.where(rolesJobSpec.IsActive == True)      # JobSpec not deleted
    statement = statement.where(rolesApplication.IsActive == True)  # Application not deleted
    statement = statement.where(rolesInterview.IsActive == True)    # Interview not deleted
    statement = statement.where(rolesApplication.Id != None) # Jobspec has an Application
    statement = statement.where(rolesInterview.Id != None)          # There is at least one Interview
    statement = statement.where(rolesApplication.Discarded == None) # The application is not discarded
    statement = statement.order_by(rolesJobSpec.Created.desc())
    return session.exec(statement).all()

def _workflow_get_offer(session: Session) -> list[JobSpecBase]:
    return []

def _workflow_get_discarded(session: Session) -> list[JobSpecBase]:
    statement = select(rolesJobSpec).distinct()
    statement = statement.join(
                    rolesApplication, 
                    rolesApplication.JobSpecId == rolesJobSpec.Id, 
                    isouter=True
                )
    statement = statement.join(
                    rolesInterview, 
                    rolesInterview.ApplicationId == rolesApplication.Id, 
                    isouter=True
                )
    statement = statement.where(rolesJobSpec.IsActive == True)      # JobSpec not deleted
    statement = statement.where(rolesApplication.IsActive == True)  # Application not deleted
    statement = statement.where(rolesApplication.Id != None) # Jobspec has an Application
    statement = statement.where(rolesApplication.Discarded != None) # The application is discarded
    statement = statement.order_by(rolesJobSpec.Created.desc())
    return session.exec(statement).all()
