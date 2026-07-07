// Deffinitions for existing entities
export interface TagItem {
  Id: number;
  Name: string;
  Context?: string | null;
  IsActive: boolean | true;
  Order: number | null;
}

export interface luLocationItem {
  Id: number;
  Country: string;
  City?: string | null;
  IsActive: boolean | true;
  Order: number | null;
}

export interface luRoleinterfaceItem {
  Id: number;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export interface luWorkModelItem {
  Id: number;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export interface luBenefitItem {
  Id: number;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export interface SourceItem {
  Id: number;
  Name: string;
  PortalURL?: string | null;
  Details?: string | null;
  IsActive: boolean | true;
}

export interface LocationItemItem {
  Id: number;
  Country: string;
  City?: string;
  IsActive: boolean;
  Order: number;
}

export interface PlaceOfWorkItem {
  Id: number;
  LocationId: number;
  Location: Location;
  Address?: string | null;
  IsActive: boolean | true;
}

export interface ContactItem {
  Id: number;
  Name: string;
  Email?: string | null;
  Phone?: string | null;
  Details?: string | null;
  IsActive: boolean | true;
}

export interface ApplicationItem {
  Id: number;
  Applied: string;
  Confirmed?: string | null;
  Discarded?: string | null;
  Notes?: string | null;
  Interviews?: InterviewItem[] | null;
  Offers?: OfferItem[] | null;
  IsActive: boolean | true;
}

export interface JobSpecItem {
  Id: number;
  Position: string;
  Created: string | null;
  Company?: string | null;
  SourceId?: number | null;
  Source?: string | null;
  Link?: string | null;
  Description?: string | null;
  PlaceOfWorkId?: number | null;
  PlaceOfWork?: string | null;
  WorkModelId?: number | null;
  WorkModel?: string | null;
  RoleTypeId?: number | null;
  RoleType?: string | null;
  SalaryExpectation?: string | null;
  ContactId?: number | null;
  Contact?: ContactItem | null;
  Published?: string | null;
  Applications?: ApplicationItem[] | null;
  Benefits?: luBenefitItem[] | null;
  Tags?: TagItem[] | null;
  IsActive: boolean | true;
}

export interface InterviewItem {
  Id: number;
  ApplicationId: number;
  Scheduled: string;
  ContactId?: number | null;
  Contact?: ContactItem | null;
  Notes?: string | null;
  Outcome?: string | null;
  Feedback?: string | null;
  IsActive: boolean | true;
}

export interface OfferItem {
  Id: number;
  ApplicationId: number;
  Offered: string;
  Salary?: string | null;
  Notes?: string | null;
  Benefits?: luBenefitItem[] | null;
  IsActive: boolean | true;
}

// Deffinition for new entities
export interface newTagItem {
  Id?: number | null;
  Name: string;
  Context?: string | null;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newLuLocationItem {
  Id?: number | null;
  Country: string;
  City?: string | null;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newLuRoleinterfaceItem {
  Id?: number | null;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newLuWorkModelItem {
  Id?: number | null;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newLuBenefitItem {
  Id?: number | null;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newSourceItem {
  Id?: number | null;
  Name: string;
  PortalURL?: string | null;
  Details?: string | null;
  IsActive: boolean | true;
}

export interface newLocationItemItem {
  Id?: number | null;
  Country: string;
  City?: string;
  IsActive: boolean;
  Order: number;
}

export interface newPlaceOfWorkItem {
  Id?: number | null;
  LocationId: number;
  Address?: string | null;
  IsActive: boolean | true;
}

export interface newContactItem {
  Id?: number | null;
  Name: string;
  Email?: string | null;
  Phone?: string | null;
  Details?: string | null;
  IsActive: boolean | true;
}

export interface newApplicationItem {
  Id?: number | null;
  Applied: string;
  Confirmed?: string | null;
  Discarded?: string | null;
  Notes?: string | null;
  IsActive: boolean | true;
}

export interface newJobSpecItem {
  Id?: number | null;
  Position: string;
  Created: string | null;
  Company?: string | null;
  SourceId?: number | null;
  Link?: string | null;
  Description?: string | null;
  PlaceOfWorkId?: number | null;
  WorkModelId?: number | null;
  RoleTypeId?: number | null;
  SalaryExpectation?: string | null;
  ContactId?: number | null;
  Published?: string | null;
  IsActive: boolean | true;
}

export interface newInterviewItem {
  Id?: number | null;
  ApplicationId: number;
  Scheduled: string;
  ContactId?: number | null;
  Notes?: string | null;
  Outcome?: string | null;
  Feedback?: string | null;
  IsActive: boolean | true;
}

export interface newOfferItem {
  Id?: number | null;
  ApplicationId: number;
  Offered: string;
  Salary?: string | null;
  Notes?: string | null;
  Benefits?: luBenefitItem[] | null;
  IsActive: boolean | true;
}
