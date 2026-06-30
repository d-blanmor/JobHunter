from typing import Annotated, Any
from fastapi import Header, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

def _get_entity_or_404(session: Session, model: type[Any], entity_id: int) -> Any:
    entity = session.get(model, entity_id)
    if not entity:
        raise HTTPException(status_code=404, detail=f"{model.__name__} not found")
    return entity

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

def _get_link_or_404(session: Session, model: type[Any], pk1: int | None = None, pk2: int | None = None) -> Any:
    """
    Return a link row identified by one or both foreign keys.
    If only one id is given, the first matching row is returned;
    if none exist → 404.
    """
    pk_cols = [col.key for col in model.__mapper__.primary_key]
    statement = select(model)
    if pk1 is not None:
        statement = statement.where(model.pk_cols[0] == pk1)
    if pk2 is not None:
        statement = statement.where(model.pk_cols[1] == pk2)

    if pk1 is not None and pk2 is not None:
        entity = session.get(model, (pk1, pk2))
    else:
        entity = session.exec(statement).first()

    if not entity:
        raise HTTPException(status_code=404, detail=f"{model.__name__} link not found")
    return entity

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
    pk_cols = [col.key for col in model.__mapper__.primary_key]

    #js_id = data.get(model.pk_cols[0])
    #lb_id = data.get(model.pk_cols[1])
    js_id = getattr(model, pk_cols[0])
    lb_id = getattr(model, pk_cols[1])

    if js_id is None or lb_id is None:
        raise HTTPException(
            status_code=400,
            detail="Both primary keys are required",
        )

    # Try to fetch existing link
    entity = session.get(model, (js_id, lb_id))
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



def _soft_delete_link(session: Session, model: type[Any], pk1: int | None = None, pk2: int | None = None) -> list[Any]:
    """
    Soft‑delete one or more link rows.
    * If both ids are supplied → delete that single row.
    * If only one id is supplied → delete every row matching that id.
    Returns the list of affected instances.
    """
    if pk1 is None and pk2 is None:
        raise HTTPException(
            status_code=400,
            detail="At least one identifier must be provided",
        )
    pk_cols = [col.key for col in model.__mapper__.primary_key]
    statement = select(model)
    if pk1 is not None:
        statement = statement.where(model.pk_cols[0] == pk1)
    if pk2 is not None:
        statement = statement.where(model.pk_cols[1] == pk2)

    rows = session.exec(statement).all()
    if not rows:
        raise HTTPException(
            status_code=404,
            detail=f"{model.__name__} link(s) not found",
        )

    for row in rows:
        row.IsActive = False
        session.add(row)
    session.commit()

    # refresh to reflect the new IsActive flag
    for row in rows:
        session.refresh(row)

    return rows