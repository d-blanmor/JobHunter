from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship

class tag (SQLModel, table=True):
    __tablename__ = "tags"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Name: str
    Context: Optional[str] = None
    IsActive: bool = True
    Order: int = 0

    JobSpecs: list["rolesLnkJobSpecTags"] = Relationship(back_populates="Tag")

class appSetting(SQLModel, table=True):
    __tablename__ = "app_settings"
    Key: str = Field(primary_key=True)
    Value: Optional[str] = None
    Notes: Optional[str] = None
    IsActive: bool = True

class vwWorkflow(SQLModel, table=True):
    __tablename__ = "vwWorkflow"
    JobSpecId: int = Field(primary_key=True)
    ApplicationId: Optional[int] = None
    InterviewId: Optional[int] = None
    OfferId: Optional[int] = None
    Position: str
    Company: Optional[str] = None
    RoleTypeId: Optional[int] = None
    WorkModelId: Optional[int] = None
    Created: datetime
    Applied: Optional[datetime] = None
    Discarded: Optional[datetime] = None
    Scheduled: Optional[datetime] = None
    Offered: Optional[datetime] = None
    Stage: Optional[str] = None
    IsActive: bool = True

# View definitions
# --------------------------------------------------------------------------- #
# Simple placeholder model (no table)
# --------------------------------------------------------------------------- #
class wf_stages(SQLModel):
    """Placeholder for the view – no __table__ attribute."""
    pass

# --------------------------------------------------------------------------- #
# Helper that actually creates the view when the app starts
# --------------------------------------------------------------------------- #
from sqlalchemy import text, Engine
from sqlmodel import SQLModel

def _delete_vwJobSpecBenefits_table(engine: Engine) -> None:
    delete_table_sql = """
        DROP TABLE IF EXISTS vwJobSpecBenefits
    """
    with engine.connect() as conn:
        conn.execute(text(delete_table_sql))
        conn.commit()

def _create_vwJobSpecBenefits_view(engine: Engine) -> None:
    create_view_sql = """
        CREATE VIEW IF NOT EXISTS vwJobSpecBenefits AS      
        SELECT bnf."Id"         AS "Id"
            , lnk."JobSpecId"   AS "JobSpecId"
            , bnf."Name"        AS "Name"
            , lnk."Notes"       AS "Notes"
            , bnf."IsActive"    AS "IsActive"
            , lnk."Order"       AS "Order"
        FROM "roles_lnk_jobspecs_benefits" lnk
        LEFT JOIN "roles_lu_benefits" bnf ON lnk."LuBenefitId" = bnf."Id"
        ORDER BY lnk."Order"
    """
    with engine.connect() as conn:
        conn.execute(text(create_view_sql))
        conn.commit()

def _delete_vwOfferBenefits_table(engine: Engine) -> None:
    delete_table_sql = """
        DROP TABLE IF EXISTS vwOfferBenefits
    """
    with engine.connect() as conn:
        conn.execute(text(delete_table_sql))
        conn.commit()

def _create_vwOfferBenefits_view(engine: Engine) -> None:
    create_view_sql = """
        CREATE VIEW IF NOT EXISTS vwOfferBenefits AS      
        SELECT bnf."Id"         AS "Id"
            , lnk."OfferId"     AS "OfferId"
            , bnf."Name"        AS "Name"
            , lnk."Notes"       AS "Notes"
            , bnf."IsActive"    AS "IsActive"
            , lnk."Order"       AS "Order"
        FROM "roles_lnk_offers_benefits" lnk
        LEFT JOIN "roles_lu_benefits" bnf ON lnk."LuBenefitId" = bnf."Id"
        ORDER BY lnk."Order"
    """
    with engine.connect() as conn:
        conn.execute(text(create_view_sql))
        conn.commit()

def _delete_vwWorkflow_table(engine: Engine) -> None:
    delete_table_sql = """
        DROP TABLE IF EXISTS vwWorkflow
    """
    with engine.connect() as conn:
        conn.execute(text(delete_table_sql))
        conn.commit()

def _create_vwWorkflow_view(engine: Engine) -> None:
    create_view_sql = """
        CREATE VIEW IF NOT EXISTS vwWorkflow AS
        SELECT "JobSpecs"."Id"                AS "JobSpecId"
            , "Applications"."ApplicationId"  AS "ApplicationId"
            , "Interviews"."InterviewId"      AS "InterviewId"
            , "Offers"."OfferId"              AS "OfferId"
            , "JobSpecs"."Position"           AS "Position"
            , "JobSpecs"."Company"            AS "Company"
            , "JobSpecs"."RoleTypeId"         AS "RoleTypeId"
            , "JobSpecs"."WorkModelId"        AS "WorkModelId"
            , "JobSpecs"."Created"            AS "Created"
            , "Applications"."Applied"        AS "Applied"
            , "Applications"."Discarded"      AS "Discarded"
            , "Interviews"."Scheduled"        AS "Scheduled"
            , "Offers"."Offered"              AS "Offered"
            , CASE
                WHEN "Applications"."ApplicationId" IS NULL THEN 'received'
                WHEN "Applications"."ApplicationId" IS NOT NULL 
                 AND "Interviews"."InterviewId" IS NULL
                 AND "Offers"."OfferId" IS NULL
                 AND "Applications"."Discarded" IS NULL THEN 'applied'
                WHEN "Applications"."ApplicationId" IS NOT NULL 
                 AND "Interviews"."InterviewId" IS NOT NULL
                 AND "Offers"."OfferId" IS NULL
                 AND "Applications"."Discarded" IS NULL THEN 'interview'
                WHEN "Applications"."ApplicationId" IS NOT NULL 
                 AND "Offers"."OfferId" IS NOT NULL
                 AND "Applications"."Discarded" IS NULL THEN 'offer'
                WHEN "Applications"."ApplicationId" IS NOT NULL 
                 AND "Applications"."Discarded" IS NOT NULL THEN 'discarded'
            END                               AS 'Stage'
            , "JobSpecs"."IsActive"           AS "IsActive"
        FROM   roles_job_specs AS JobSpecs
        LEFT JOIN (SELECT MAX("roles_applications"."JobSpecId") AS "JobSpecId"
                        , "roles_applications"."Id"             AS "ApplicationId"
                        , "roles_applications"."Applied"        AS "Applied"
                        , "roles_applications"."Discarded"      AS "Discarded"
                    FROM "roles_applications"
                    WHERE "roles_applications"."IsActive" = 1
                    GROUP BY "JobSpecId"
                    ORDER BY "ApplicationId" DESC) AS "Applications"
        ON "JobSpecs"."Id" = "Applications"."JobSpecId"
        LEFT JOIN (SELECT MAX("roles_interviews"."ApplicationId")   AS "ApplicationId"
                        , "roles_applications".JobSpecId            AS "JobSpecId"
                        , "roles_interviews"."Id"                   AS "InterviewId"
                        , "roles_interviews"."Scheduled"            AS "Scheduled"
                    FROM "roles_interviews" 
                    JOIN "roles_applications" ON "roles_interviews"."ApplicationId" = "roles_applications"."Id"
                    WHERE "roles_interviews"."IsActive" = 1
                    GROUP BY "ApplicationId"
                    ORDER BY "InterviewId" DESC) AS "Interviews"
        ON "JobSpecs"."Id" = "Interviews"."JobSpecId"
        LEFT JOIN (SELECT MAX("roles_offers"."ApplicationId")   AS "ApplicationId"
                        , "roles_applications".JobSpecId        AS "JobSpecId"
                        , "roles_offers"."Id"                   AS "OfferId"
                        , "roles_offers"."Offered"              AS "Offered"
                    FROM "roles_offers"
                    JOIN "roles_applications" ON "roles_offers"."ApplicationId" = "roles_applications"."Id"
                    WHERE "roles_offers"."IsActive" = 1
                    GROUP BY "ApplicationId"
                    ORDER BY "OfferedId" DESC) AS "Offers"
        ON "JobSpecs"."Id" = "Offers"."JobSpecId";
    """
    with engine.connect() as conn:
        conn.execute(text(create_view_sql))
        conn.commit()

def init_models(engine: Engine) -> None:
    from pathlib import Path
    from app.config import conf_dbtype, conf_db

    if(conf_dbtype() == "sqlite"):
        dbFile = Path(conf_db());

        if not dbFile.exists():
            # Create all SQLAlchemy tables that have a __table__ attribute.
            SQLModel.metadata.create_all(engine)

            # Create views (possibly deleting tables with the same name)
            _delete_vwJobSpecBenefits_table(engine)
            _create_vwJobSpecBenefits_view(engine)

            _delete_vwOfferBenefits_table(engine)
            _create_vwOfferBenefits_view(engine)

            _delete_vwWorkflow_table(engine)
            _create_vwWorkflow_view(engine)
        else:
            # Create all SQLAlchemy tables that have a __table__ attribute.
            SQLModel.metadata.create_all(engine)
