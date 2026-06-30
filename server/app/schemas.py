from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class LookupBase(BaseModel):
    Name: str
    IsActive: bool = True
    Order: int = 0

class LookupRead(LookupBase):
    Id: Optional[int] = None

class LookupCreate(LookupBase):
    pass

class LuLocationBase(BaseModel):
    Country: Optional[str] = None
    City: Optional[str] = None
    IsActive: bool = True
    Order: int = 0

class LuLocationRead(LuLocationBase):
    Id: Optional[int] = None

class LuLocationCreate(LuLocationBase):
    pass

class SourceBase(BaseModel):
    Name: str
    PortalURL: Optional[str] = None
    Details: Optional[str] = None
    IsActive: bool = True

class SourceCreate(SourceBase):
    pass

class SourceRead(SourceBase):
    Id: Optional[int] = None

class PlaceOfWorkBase(BaseModel):
    LocationId: int
    Address: Optional[str] = None
    IsActive: bool = True

class PlaceOfWorkCreate(PlaceOfWorkBase):
    pass

class PlaceOfWorkRead(PlaceOfWorkBase):
    Id: Optional[int] = None

class ContactBase(BaseModel):
    Name: str
    Email: Optional[str] = None
    Phone: Optional[str] = None
    Details: Optional[str] = None
    IsActive: bool = True

class ContactCreate(ContactBase):
    pass

class ContactRead(ContactBase):
    Id: Optional[int] = None

class ApplicationBase(BaseModel):
    Applied: datetime
    Confirmed: Optional[datetime] = None
    Discarded: Optional[datetime] = None
    Notes: Optional[str] = None
    IsActive: bool = True

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationRead(ApplicationBase):
    Id: Optional[int] = None

class JobSpecBase(BaseModel):
    Position: str
    Company: Optional[str] = None
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

class InterviewBase(BaseModel):
    ApplicationId: int
    Scheduled: Optional[datetime] = None
    ContactId: Optional[int] = None
    Notes: Optional[str] = None
    Outcome: Optional[str] = None
    Feedback: Optional[str] = None
    IsActive: bool = True

class InterviewCreate(InterviewBase):
    pass

class InterviewRead(InterviewBase):
    Id: Optional[int] = None

class LnkJobSpecBenefitBase(BaseModel):
    JobSpecId: int
    LuBenefitId: int
    Notes: Optional[str] = None
    Order: int = 0
    IsActive: bool = True

class LnkJobSpecBenefitCreate(LnkJobSpecBenefitBase):
    pass

class LnkJobSpecBenefitRead(LnkJobSpecBenefitBase):
    pass