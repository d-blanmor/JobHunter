from datetime import datetime
from typing import Optional

from pydantic import BaseModel

class TagBase(BaseModel):
    Id: Optional[int] = None
    Name: str
    Context: Optional[str] = None
    IsActive: bool = True
    Order: int = 0

class LookupBase(BaseModel):
    Id: Optional[int] = None
    IsActive: bool = True
    Order: int = 0

class StandardLookupBase(LookupBase):
    Name: str

class LuLocationBase(LookupBase):
    Country: str
    City: Optional[str] = None

class SourceBase(StandardLookupBase):
    ParentId: Optional[int] = None
    PortalURL: Optional[str] = None
    Icon: Optional[bytes] = None
    Details: Optional[str] = None

class PlaceOfWorkBase(BaseModel):
    Id: Optional[int] = None
    LocationId: int
    Address: Optional[str] = None
    IsActive: bool = True

class ContactBase(BaseModel):
    Id: Optional[int] = None
    Name: str
    Email: Optional[str] = None
    Phone: Optional[str] = None
    Details: Optional[str] = None
    SourceId: Optional[int] = None
    IsActive: bool = True

class ApplicationBase(BaseModel):
    Id: Optional[int] = None
    JobSpecId: int
    Applied: datetime
    Confirmed: Optional[datetime] = None
    Discarded: Optional[datetime] = None
    Letter: Optional[str] = None
    CV: Optional[str] = None
    Notes: Optional[str] = None
    IsActive: bool = True

class JobSpecBase(BaseModel):
    Id: Optional[int] = None
    Position: str
    Company: Optional[str] = None
    SourceId: Optional[int] = None
    Link: Optional[str] = None
    PlaceOfWorkId: Optional[int] = None
    WorkModelId: Optional[int] = None
    RoleTypeId: Optional[int] = None
    SalaryExpectation: Optional[str] = None
    ContactId: Optional[int] = None
    Description: Optional[str] = None
    Analysis: Optional[str] = None
    Profile: Optional[str] = None
    Notes: Optional[str] = None
    Published: Optional[datetime] = None
    Created: datetime
    IsActive: bool = True

class InterviewBase(BaseModel):
    Id: Optional[int] = None
    ApplicationId: int
    Scheduled: Optional[datetime] = None
    ContactId: Optional[int] = None
    Description: Optional[str] = None
    Analysis: Optional[str] = None
    Notes: Optional[str] = None
    Outcome: Optional[str] = None
    Feedback: Optional[str] = None
    IsActive: bool = True

class OfferBase(BaseModel):
    Id: Optional[int] = None
    ApplicationId: int
    Offered: Optional[datetime] = None
    Salary: Optional[str] = None
    Description: Optional[str] = None
    Notes: Optional[str] = None
    IsActive: bool = True

class LnkJobSpecBenefitBase(BaseModel):
    JobSpecId: int
    LuBenefitId: int
    Notes: Optional[str] = None
    Order: int = 0

class LnkOfferBenefitBase(BaseModel):
    OfferId: int
    LuBenefitId: int
    Notes: Optional[str] = None
    Order: int = 0

class LnkJobSpecTagBase(BaseModel):
    JobSpecId: int
    TagId: int
    Order: int = 0

class appSettingBase(BaseModel):
    Key: str
    Value: Optional[str] = None
    Notes: Optional[str] = None
    IsActive: bool = True

class vwWorkflowBase(BaseModel):
    JobSpecId: int
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

class ollamaModelBase(BaseModel):
    Key: str = None
    Name: str = None

class OllamaModelsResponse(BaseModel):
    models: list[ollamaModelBase]
    state: int
    message: Optional[str] = None

class OllamaJobspecResponse(BaseModel):
    outcome: str
    state: int
    message: Optional[str] = None

class OllamaJobspecRequest(BaseModel):
    jobspec: str