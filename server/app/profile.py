from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship

class profileData (SQLModel, table=True):
    __tablename__ = "profile_data"
    Key: str = Field(primary_key=True)
    Value: Optional[str] = None

class profileTechnology (SQLModel, table=True):
    __tablename__ = "profile_technologies"
    Id: int = Field(
        primary_key=True,
        sa_column_kwargs={"autoincrement": True}
    )
    Name: str
    Order: int = 0
    IsActive: bool = True

    ProfRoles: list["profileProfRole"] = Relationship(back_populates="Technology")

class profileSkill (SQLModel, table=True):
    __tablename__ = "profile_skills"
    Id: int = Field(
        primary_key=True,
        sa_column_kwargs={"autoincrement": True}
    )
    Name: str
    Order: int = 0
    IsActive: bool = True

    ProfRoles: list["profileProfRole"] = Relationship(back_populates="Skill")

class profileProfRole (SQLModel, table=True):
    __tablename__ = "profile_prof_roles"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Role: str
    Company: Optional[datetime] = None
    Start: Optional[datetime] = None
    End: Optional[datetime] = None
    Location: Optional[str] = None
    Description: Optional[str] = None
    Achievements: Optional[str] = None
    IsActive: bool = True

    Achievements: list["profileProfAchievement"] = Relationship(back_populates="ProfRole")

    Technologies: list["profileTechnology"] = Relationship(back_populates="ProfRole")
    Skills: list["profileSkill"] = Relationship(back_populates="ProfRole")

class profileProfAchievement (SQLModel, table=True):
    __tablename__ = "profile_prof_achievements"
    Id: int = Field(
        primary_key=True,
        sa_column_kwargs={"autoincrement": True}
    )
    ProfRoleId: int = Field(
        default=None, 
        foreign_key="profile_prof_roles.Id", 
        index=True
    )
    Name: str
    Description: Optional[str] = None
    OnDate: Optional[datetime] = None
    Order: int = 0
    IsActive: bool = True

    ProfRole: Optional["profileProfRole"] = Relationship(back_populates="Achievements")

class profileLnkProfRoleTechnology(SQLModel, table=True):
    __tablename__ = "profile_lnk_profroles_technologies"
    ProfRoleId: int = Field(
        primary_key=True,
        foreign_key="profile_prof_roles.Id", 
    )
    TechnologyId: int = Field(
        primary_key=True,
        foreign_key="profile_technologies.Id", 
    )
    Notes: Optional[str] = None
    Order: int = 0

    ProfRole: Optional["profileProfRole"] = Relationship(back_populates="Technologies")
    Technology: Optional["profileTechnology"] = Relationship(back_populates="ProfRoles")

class profileLnkProfRoleSkill(SQLModel, table=True):
    __tablename__ = "profile_lnk_profroles_skillss"
    ProfRoleId: int = Field(
        primary_key=True,
        foreign_key="profile_prof_roles.Id", 
    )
    SkillId: int = Field(
        primary_key=True,
        foreign_key="profile_skills.Id", 
    )
    Notes: Optional[str] = None
    Order: int = 0

    ProfRole: Optional["profileProfRole"] = Relationship(back_populates="Technologies")
    Skill: Optional["profileSkill"] = Relationship(back_populates="ProfRoles")

class profileAcademicDegree(SQLModel, table=True):
    __tablename__ = "profile_academic_degrees"
    Id: int = Field(
        primary_key=True,
        sa_column_kwargs={"autoincrement": True}
    )
    Degree: str
    Institution: Optional[str] = None
    Date: Optional[datetime] = None
    Notes: Optional[str] = None
    Order: int = 0
    IsActive: bool = True
