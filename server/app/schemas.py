from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class LuLocationBase(BaseModel):
    Country: Optional[str] = None
    City: Optional[str] = None
    IsActive: bool = True
    Order: int = 0


class LuLocationCreate(LuLocationBase):
    pass


class LuLocationRead(LuLocationBase):
    Id: Optional[int] = None


class LookupBase(BaseModel):
    Name: str
    IsActive: bool = True
    Order: int = 0


class LookupCreate(LookupBase):
    pass


class LookupRead(LookupBase):
    Id: Optional[int] = None


class SourceBase(BaseModel):
    Name: str
    PortalURL: Optional[str] = None
    Details: Optional[str] = None
    IsActive: bool = True


class SourceCreate(SourceBase):
    pass


class SourceRead(SourceBase):
    Id: Optional[int] = None


class JobSpecBase(BaseModel):
    Company: Optional[str] = None
    Position: str
    SourceId: Optional[int] = None
    Link: Optional[str] = None
    Description: Optional[str] = None
    PlaceOfWorkId: Optional[int] = None
    WorkModelId: Optional[int] = None
    RoleTypeId: Optional[int] = None
    SalaryExpectation: Optional[str] = None
    ContactId: Optional[int] = None
    Published: Optional[datetime] = None
    ApplicationId: Optional[int] = None
    IsActive: bool = True


class JobSpecCreate(JobSpecBase):
    pass


class JobSpecRead(JobSpecBase):
    Id: Optional[int] = None
    Created: datetime
