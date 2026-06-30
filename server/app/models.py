from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship


class LnkJobSpecBenefit(SQLModel, table=True):
    __tablename__ = "lnk_jobspec_benefits"
    JobSpecId: int = Field(foreign_key="job_specs.Id", primary_key=True)
    BenefitId: int = Field(foreign_key="lu_benefits.Id", primary_key=True)
    Notes: Optional[str] = None
    Order: int = 0
    IsActive: bool = True

    JobSpec: "JobSpec" = Relationship(back_populates="benefit_links")
    Benefit: "LuBenefit" = Relationship(back_populates="jobspec_links")

class LuLocation(SQLModel, table=True):
    __tablename__ = "lu_locations"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    Country: str
    City: Optional[str] = None
    IsActive: bool = True
    Order: int = 0

class LuRoleType(SQLModel, table=True):
    __tablename__ = "lu_role_types"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    Name: str
    IsActive: bool = True
    Order: int = 0

class LuWorkModel(SQLModel, table=True):
    __tablename__ = "lu_work_models"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    Name: str
    IsActive: bool = True
    Order: int = 0

class LuBenefit(SQLModel, table=True):
    __tablename__ = "lu_benefits"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    Name: str
    IsActive: bool = True
    Order: int = 0

    jobspec_links: list[LnkJobSpecBenefit] = Relationship(back_populates="Benefit")

class Source(SQLModel, table=True):
    __tablename__ = "sources"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    Name: str
    PortalURL: Optional[str] = None
    Details: Optional[str] = None
    IsActive: bool = True

class PlaceOfWork(SQLModel, table=True):
    __tablename__ = "places_of_work"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    LocationId: int = Field(foreign_key="lu_locations.Id")
    Address: Optional[str] = None
    IsActive: bool = True

class Contact(SQLModel, table=True):
    __tablename__ = "contacts"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    Name: str
    Email: Optional[str] = None
    Phone: Optional[str] = None
    Details: Optional[str] = None
    IsActive: bool = True

class Application(SQLModel, table=True):
    __tablename__ = "applications"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    Applied: datetime
    Confirmed: Optional[datetime] = None
    Discarded: Optional[datetime] = None
    Notes: Optional[str] = None
    IsActive: bool = True

class JobSpec(SQLModel, table=True):
    __tablename__ = "job_specs"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    Position: str
    Company: Optional[str] = None
    SourceId: Optional[int] = Field(default=None, foreign_key="sources.Id")
    Link: Optional[str] = None
    Description: Optional[str] = None
    PlaceOfWorkId: Optional[int] = Field(default=None, foreign_key="places_of_work.Id")
    WorkModelId: Optional[int] = Field(default=None, foreign_key="lu_work_models.Id")
    RoleTypeId: Optional[int] = Field(default=None, foreign_key="lu_role_types.Id")
    SalaryExpectation: Optional[str] = None
    ContactId: Optional[int] = Field(default=None, foreign_key="contacts.Id")
    Published: Optional[datetime] = None
    Created: datetime = Field(default_factory=datetime.utcnow)
    ApplicationId: Optional[int] = Field(default=None, foreign_key="applications.Id")
    IsActive: bool = True

    benefit_links: list[LnkJobSpecBenefit] = Relationship(back_populates="JobSpec")

class Interview(SQLModel, table=True):
    __tablename__ = "interviews"
    Id: int = Field(primary_key=True, sa_column_kwargs={"autoincrement": True})
    ApplicationId: int = Field(foreign_key="applications.Id")
    Scheduled: Optional[datetime] = None
    ContactId: Optional[int] = Field(default=None, foreign_key="contacts.Id")
    Notes: Optional[str] = None
    Outcome: Optional[str] = None
    Feedback: Optional[str] = None
    IsActive: bool = True

#class HeroTeamView(SQLModel):
#    name: str
#    secret_name: str
#    age: Optional[int] = None
