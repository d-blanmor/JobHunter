from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from app.database import get_session
from typing import Any

from app.config import conf_pathname
from app.backup import (
    export_system_backup, export_system_backup_to_file, 
    export_roles_backup, export_roles_backup_to_file, 
    import_system_backup_payload, import_system_backup_from_file,
    import_roles_backup_payload, import_roles_backup_from_file
)

router = APIRouter() 

@router.get(conf_pathname() + "/v1/backup/system/export")
def export_system_backup_route(*, session: Session = Depends(get_session), active_only: bool = Query(True)) -> dict[str, Any]:
    return export_system_backup(session, active_only)

@router.get(conf_pathname() + "/v1/backup/system/export-file")
def export_system_backup_to_file_route(
    file_path: str = Query(..., description="Path to the JSON file to write"),
    *,
    session: Session = Depends(get_session), active_only: bool = Query(True),
) -> dict[str, Any]:
    target = export_system_backup_to_file(session, file_path, active_only)
    return {"path": str(target), "message": "Backup exported to file"}

@router.post(conf_pathname() + "/v1/backup/system/import")
def import_system_backup_route(payload: dict[str, Any], *, session: Session = Depends(get_session)) -> dict[str, str | int]:
    return import_system_backup_payload(session, payload)

@router.post(conf_pathname() + "/v1/backup/system/import-file")
def import_system_backup_from_file_route(
    file_path: str = Query(..., description="Path to the JSON file to import"),
    *,
    session: Session = Depends(get_session)
) -> dict[str, str | int]:
    return import_system_backup_from_file(session, file_path)

@router.get(conf_pathname() + "/v1/backup/roles/export")
def export_roles_backup_route(*, session: Session = Depends(get_session), jobspec_id: int | None = None, active_only: bool = Query(True)) -> dict[str, Any]:
    return export_roles_backup(session, jobspec_id, active_only)

@router.get(conf_pathname() + "/v1/backup/roles/export-file")
def export_roles_backup_to_file_route(
    file_path: str = Query(..., description="Path to the JSON file to write"),
    *,
    session: Session = Depends(get_session), jobspec_id: int | None = None, active_only: bool = Query(True),
) -> dict[str, Any]:
    target = export_roles_backup_to_file(session, file_path, jobspec_id, active_only)
    return {"path": str(target), "message": "Backup exported to file"}

@router.post(conf_pathname() + "/v1/backup/roles/import")
def import_roles_backup_route(payload: dict[str, Any], *, session: Session = Depends(get_session)) -> dict[str, str | int]:
    return import_roles_backup_payload(session, payload)

@router.post(conf_pathname() + "/v1/backup/roles/import-file")
def import_roles_backup_from_file_route(
    file_path: str = Query(..., description="Path to the JSON file to import"),
    *,
    session: Session = Depends(get_session)
) -> dict[str, str | int]:
    return import_roles_backup_from_file(session, file_path)
