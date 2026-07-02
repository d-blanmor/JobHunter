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
    JobSpecId: int = Field(
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
    PortalURL: Optional[str] = None
    Details: Optional[str] = None
    IsActive: bool = True
    JobSpecs: list["rolesJobSpec"] = Relationship(back_populates="Source")

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
    IsActive: bool = True

    JobSpecs: list["rolesJobSpec"] = Relationship(back_populates="Contact")
    Interviews: list["rolesInterview"] = Relationship(back_populates="Contact")

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
    Notes: Optional[str] = None
    IsActive: bool = True

    JobSpec: "rolesJobSpec" = Relationship(back_populates="Applications")
    Interviews: list["rolesInterview"] = Relationship(back_populates="Application")
    Offer: list["rolesOffer"] = Relationship(back_populates="Application")

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
    Description: Optional[str] = None
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
    Notes: Optional[str] = None
    IsActive: bool = True

    Application: Optional["rolesApplication"] = Relationship(back_populates="Offer")

    Benefits: list["rolesLnkOfferBenefit"] = Relationship(back_populates="Offer")
