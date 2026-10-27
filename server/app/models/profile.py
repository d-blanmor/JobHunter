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

class rolesLnkJobSpecBenefit(SQLModel, table=True):
    __tablename__ = "roles_lnk_jobspecs_benefits"
    JobSpecId: int = Field(
        primary_key=True,
        foreign_key="roles_job_specs.Id", 
    )
    LuBenefitId: int = Field(
        primary_key=True,
        foreign_key="roles_lu_benefits.Id", 
    )
    Notes: Optional[str] = None
    Order: int = 0

    JobSpec: Optional["rolesJobSpec"] = Relationship(back_populates="Benefits")
    Benefit: Optional["rolesLuBenefit"] = Relationship(back_populates="jobspec_links")

class rolesLnkOfferBenefit(SQLModel, table=True):
    __tablename__ = "roles_lnk_offers_benefits"
    OfferId: int = Field(
        primary_key=True,
        foreign_key="roles_offers.Id", 
    )
    LuBenefitId: int = Field(
        primary_key=True,
        foreign_key="roles_lu_benefits.Id", 
    )
    Notes: Optional[str] = None
    Order: int = 0

    Offer: Optional["rolesOffer"] = Relationship(back_populates="Benefits")
    Benefit: Optional["rolesLuBenefit"] = Relationship(back_populates="offer_links")

class rolesLnkJobSpecTags(SQLModel, table=True):
    __tablename__ = "roles_lnk_jobspec_tags"
    JobSpecId: int = Field(
        primary_key=True,
        foreign_key="roles_job_specs.Id", 
    )
    TagId: int = Field(
        primary_key=True,
        foreign_key="tags.Id", 
    )
    Order: int = 0

    JobSpec: Optional["rolesJobSpec"] = Relationship(back_populates="Tags")
    Tag: Optional["tag"] = Relationship(back_populates="JobSpecs")

class rolesLuLocation(SQLModel, table=True):
    __tablename__ = "roles_lu_locations"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Country: str
    City: Optional[str] = None
    IsActive: bool = True
    Order: int = 0

    PlacesOfWork: list["rolesPlaceOfWork"] = Relationship(back_populates="Location")

class rolesLuRoleType(SQLModel, table=True):
    __tablename__ = "roles_lu_role_types"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Name: str
    IsActive: bool = True
    Order: int = 0
    
    JobSpecs: list["rolesJobSpec"] = Relationship(back_populates="RoleType")

class rolesLuWorkModel(SQLModel, table=True):
    __tablename__ = "roles_lu_work_models"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Name: str
    IsActive: bool = True
    Order: int = 0

    JobSpecs: list["rolesJobSpec"] = Relationship(back_populates="WorkModel")

class rolesLuBenefit(SQLModel, table=True):
    __tablename__ = "roles_lu_benefits"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Name: str
    IsActive: bool = True
    Order: int = 0

    jobspec_links: list["rolesLnkJobSpecBenefit"] = Relationship(back_populates="Benefit")
    offer_links: list["rolesLnkOfferBenefit"] = Relationship(back_populates="Benefit")

class rolesSource(SQLModel, table=True):
    __tablename__ = "roles_sources"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Name: str
    ParentId: Optional[int] = Field(foreign_key="roles_sources.Id")
    PortalURL: Optional[str] = None
    Icon: Optional[bytes] = None
    Details: Optional[str] = None
    IsActive: bool = True
    Order: int = 0

    JobSpecs: list["rolesJobSpec"] = Relationship(back_populates="Source")
    #Children: list["rolesSource"] = Relationship(back_populates="Children")
    Contacts: list["rolesContact"] = Relationship(back_populates="Source")

class rolesPlaceOfWork(SQLModel, table=True):
    __tablename__ = "roles_places_of_work"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    LocationId: int = Field(foreign_key="roles_lu_locations.Id")
    Address: Optional[str] = None
    IsActive: bool = True

    Location: Optional["rolesLuLocation"] = Relationship(back_populates="PlacesOfWork")
    JobSpecs: list["rolesJobSpec"] = Relationship(back_populates="PlaceOfWork")

class rolesContact(SQLModel, table=True):
    __tablename__ = "roles_contacts"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Name: str
    Email: Optional[str] = None
    Phone: Optional[str] = None
    Details: Optional[str] = None
    SourceId: Optional[int] = Field(foreign_key="roles_sources.Id", nullable=True)
    IsActive: bool = True

    JobSpecs: list["rolesJobSpec"] = Relationship(back_populates="Contact")
    Interviews: list["rolesInterview"] = Relationship(back_populates="Contact")
    Source: list["rolesSource"] = Relationship(back_populates="Contacts")

class rolesApplication(SQLModel, table=True):
    __tablename__ = "roles_applications"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    JobSpecId: int = Field(
        default=None, 
        foreign_key="roles_job_specs.Id", 
        index=True
    )
    Applied: datetime
    Confirmed: Optional[datetime] = None
    Discarded: Optional[datetime] = None
    Letter: Optional[str] = None
    CV: Optional[str] = None
    Notes: Optional[str] = None
    IsActive: bool = True

    JobSpec: "rolesJobSpec" = Relationship(back_populates="Applications")
    Interviews: list["rolesInterview"] = Relationship(back_populates="Application")
    Offers: list["rolesOffer"] = Relationship(back_populates="Application")

class rolesJobSpec(SQLModel, table=True):
    __tablename__ = "roles_job_specs"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Position: str = Field(index=True)
    Company: Optional[str] = None
    SourceId: Optional[int] = Field(
        default=None, 
        foreign_key="roles_sources.Id", 
        index=True
    )
    Link: Optional[str] = None
    PlaceOfWorkId: Optional[int] = Field(
        default=None, 
        foreign_key="roles_places_of_work.Id", 
        index=True
    )
    WorkModelId: Optional[int] = Field(
        default=None, 
        foreign_key="roles_lu_work_models.Id", 
        index=True
    )
    RoleTypeId: Optional[int] = Field(
        default=None, 
        foreign_key="roles_lu_role_types.Id", 
        index=True
    )
    SalaryExpectation: Optional[str] = None
    ContactId: Optional[int] = Field(
        default=None, 
        foreign_key="roles_contacts.Id", 
        index=True
    )
    Description: Optional[str] = None
    Analysis: Optional[str] = None
    Profile: Optional[str] = None
    Notes: Optional[str] = None
    Published: Optional[datetime] = None
    Created: datetime = Field(default_factory=datetime.utcnow)
    IsActive: bool = True

    Source: Optional["rolesSource"] = Relationship(back_populates="JobSpecs")
    PlaceOfWork: Optional["rolesPlaceOfWork"] = Relationship(back_populates="JobSpecs")
    WorkModel: Optional["rolesLuWorkModel"] = Relationship(back_populates="JobSpecs")
    RoleType: Optional["rolesLuRoleType"] = Relationship(back_populates="JobSpecs")
    Contact: Optional["rolesContact"] = Relationship(back_populates="JobSpecs")
    Applications: list["rolesApplication"] = Relationship(back_populates="JobSpec")

    Benefits: list["rolesLnkJobSpecBenefit"] = Relationship(back_populates="JobSpec")
    Tags: list["rolesLnkJobSpecTags"] = Relationship(back_populates="JobSpec")

class rolesInterview(SQLModel, table=True):
    __tablename__ = "roles_interviews"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    ApplicationId: int = Field(foreign_key="roles_applications.Id")
    Scheduled: Optional[datetime] = None
    ContactId: Optional[int] = Field(
        default=None, 
        foreign_key="roles_contacts.Id"
    )
    Description: Optional[str] = None
    Analysis: Optional[str] = None
    Notes: Optional[str] = None
    Outcome: Optional[str] = None
    Feedback: Optional[str] = None
    IsActive: bool = True

    Application: Optional["rolesApplication"] = Relationship(back_populates="Interviews")
    Contact: Optional["rolesContact"] = Relationship(back_populates="Interviews")

class rolesOffer(SQLModel, table=True):
    __tablename__ = "roles_offers"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    ApplicationId: int = Field(foreign_key="roles_applications.Id")
    Offered: datetime
    Salary: Optional[str] = None
    Description: Optional[str] = None
    Notes: Optional[str] = None
    IsActive: bool = True

    Application: Optional["rolesApplication"] = Relationship(back_populates="Offers")

    Benefits: list["rolesLnkOfferBenefit"] = Relationship(back_populates="Offer")

class vwJobSpecBenefits(SQLModel, table=True):
    __tablename__ = "vwJobSpecBenefits"
    Id: int = Field(primary_key=True)
    JobSpecId: int
    Name: Optional[str] = None
    Notes: Optional[str] = None
    IsActive: bool = True
    Order: int = 0

class vwOfferBenefits(SQLModel, table=True):
    __tablename__ = "vwOfferBenefits"
    Id: int = Field(primary_key=True)
    OfferId: int
    Name: Optional[str] = None
    Notes: Optional[str] = None
    IsActive: bool = True
    Order: int = 0

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
