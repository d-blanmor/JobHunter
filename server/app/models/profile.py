from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship

class personal (SQLModel, table=True):
    __tablename__ = "profile_personal"
    Key: str = Field(primary_key=True)
    Value: Optional[str] = None
    Notes: Optional[str] = None
    IsActive: bool = True

class position (SQLModel, table=True):
    __tablename__ = "profile_positions"
    Id: int = Field(
        primary_key=True,
        sa_column_kwargs={"autoincrement": True}
    )
    Title: str
    Company: str
    Init_Date: datetime
    Finish_Date: Optional[datetime] = None
    Location: Optional[str] = None
    Summary: Optional[str] = None
    IsActive: bool = True

    Skills: list["lnkPositionSkill"] = Relationship(back_populates="Positions")

class degree (SQLModel, table=True):
    __tablename__ = "profile_degrees"
    Id: int = Field(
        primary_key=True,
        sa_column_kwargs={"autoincrement": True}
    )
    Title: str
    Institution: str
    Year: Optional[datetime] = None
    IsActive: bool = True

class certificate (SQLModel, table=True):
    __tablename__ = "profile_certificates"
    Id: int = Field(
        primary_key=True,
        sa_column_kwargs={"autoincrement": True}
    )
    Title: str
    Institution: str
    Date: Optional[datetime] = None
    IsActive: bool = True

class skill (SQLModel, table=True):
    __tablename__ = "profile_skills"
    Id: int = Field(
        primary_key=True, 
        sa_column_kwargs={"autoincrement": True}
    )
    Name: str
    Context: Optional[str] = None
    IsActive: bool = True
    Order: int = 0

    Positions: list["lnkPositionSkill"] = Relationship(back_populates="Skills")

class lnkPositionSkill(SQLModel, table=True):
    __tablename__ = "profile_lnk_position_skills"
    PositionId: int = Field(
        primary_key=True,
        foreign_key="profile_positions.Id", 
    )
    SkillId: int = Field(
        primary_key=True,
        foreign_key="profile_skills.Id", 
    )
    Notes: Optional[str] = None
    Order: int = 0

    Positions: Optional["position"] = Relationship(back_populates="Skills")
    Skills: Optional["skill"] = Relationship(back_populates="Positions")
