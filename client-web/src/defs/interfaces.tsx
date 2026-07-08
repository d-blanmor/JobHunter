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

export interface luRoleTypeItem {
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
  ParentId?: number | null;
  PortalURL?: string | null;
  Icon?: Blob | null;
  Details?: string | null;
  IsActive: boolean | true;
  Order: number;
}

export interface PlaceOfWorkItem {
  Id: number;
  LocationId: number;
  Address?: string | null;
  IsActive: boolean | true;
}

export interface ContactItem {
  Id: number;
  Name: string;
  Email?: string | null;
  Phone?: string | null;
  Details?: string | null;
  SourceId?: number | null;
  IsActive: boolean | true;
}

export interface JobSpecItem {
  Id: number;
  Position: string;
  Company?: string | null;
  SourceId?: number | null;
  Link?: string | null;
  PlaceOfWorkId?: number | null;
  WorkModelId?: number | null;
  RoleTypeId?: number | null;
  SalaryExpectation?: string | null;
  ContactId?: number | null;
  Description?: string | null;
  Analysis?: string | null;
  Notes?: string | null;
  Published?: string | null;
  Created: string | null;
  Applications?: ApplicationItem[] | [];
  Benefits?: luBenefitItem[] | [];
  Tags?: TagItem[] | [];
  IsActive: boolean | true;
}

export interface ApplicationItem {
  Id: number;
  JobSpecId: number;
  Applied: string;
  Confirmed?: string | null;
  Discarded?: string | null;
  Letter?: string | null;
  CV?: string | null;
  Notes?: string | null;
  Interviews?: InterviewItem[] | null;
  Offers?: OfferItem[] | null;
  IsActive: boolean | true;
}

export interface InterviewItem {
  Id: number;
  ApplicationId: number;
  Scheduled: string;
  ContactId?: number | null;
  Description?: string | null;
  Analysis?: string | null;
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
  Description?: string | null;
  Notes?: string | null;
  Benefits?: luBenefitItem[] | null;
  IsActive: boolean | true;
}

export interface AppSettingItem {
  Key: string;
  Value?: string | null;
  Notes?: string | null;
  IsActive: boolean | true;
}

// Deffinition for new entities

export interface newTagItem {
  Id?: number | null;
  Name?: string;
  Context?: string | null;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newluLocationItem {
  Id?: number | null;
  Country: string;
  City?: string | null;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newluRoleTypeItem {
  Id?: number | null;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newluWorkModelItem {
  Id?: number | null;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newluBenefitItem {
  Id?: number | null;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export interface newSourceItem {
  Id?: number | null;
  Name: string;
  ParentId?: number | null;
  PortalURL?: string | null;
  Icon?: Blob | null;
  Details?: string | null;
  IsActive: boolean | true;
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
  SourceId?: number | null;
  IsActive: boolean | true;
}

export interface newJobSpecItem {
  Id?: number | null;
  Position: string;
  Company?: string | null;
  SourceId?: number | null;
  Link?: string | null;
  PlaceOfWorkId?: number | null;
  WorkModelId?: number | null;
  RoleTypeId?: number | null;
  SalaryExpectation?: string | null;
  ContactId?: number | null;
  Description?: string | null;
  Analysis?: string | null;
  Notes?: string | null;
  Published?: string | null;
  Created: string | null;
  Applications?: ApplicationItem[] | [];
  Benefits?: luBenefitItem[] | [];
  Tags?: TagItem[] | [];
  IsActive: boolean | true;
}

export interface newApplicationItem {
  Id?: number | null;
  JobSpecId: number;
  Applied: string;
  Confirmed?: string | null;
  Discarded?: string | null;
  Letter?: string | null;
  CV?: string | null;
  Notes?: string | null;
  Interviews?: InterviewItem[] | null;
  Offers?: OfferItem[] | null;
  IsActive: boolean | true;
}

export interface newInterviewItem {
  Id?: number | null;
  ApplicationId: number;
  Scheduled: string;
  ContactId?: number | null;
  Description?: string | null;
  Analysis?: string | null;
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
  Description?: string | null;
  Notes?: string | null;
  Benefits?: luBenefitItem[] | null;
  IsActive: boolean | true;
}

export interface newAppSettingsItem {
  Key?: string | null;
  Value?: string | null;
  Notes?: string | null;
  IsActive: boolean | true;
}
