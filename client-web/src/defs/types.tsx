export type Stage = 'received' | 'applied' | 'interview' | 'offers' | 'discarded';

export type Tag = {
  Id: number;
  Name: string;
  Context?: string | null;
  IsActive: boolean | true;
  Order: number | null;
}

export type luLocation = {
  Id: number;
  Country: string;
  City?: string | null;
  IsActive: boolean | true;
  Order: number | null;
}

export type luRoleType = {
  Id: number;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export type luWorkModel = {
  Id: number;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export type luBenefit = {
  Id: number;
  Name: string;
  IsActive: boolean | true;
  Order: number | null;
}

export type Source = {
  Id: number;
  Name: string;
  PortalURL?: string | null;
  Details?: string | null;
  IsActive: boolean | true;
}

export type PlaceOfWork = {
  Id: number;
  LocationId: number;
  Location: Location;
  Address?: string | null;
  IsActive: boolean | true;
}

export type Contact = {
  Id: number;
  Name: string;
  Email?: string | null;
  Phone?: string | null;
  Details?: string | null;
  IsActive: boolean | true;
}

export type Application = {
  Id: number;
  Applied: string;
  Confirmed?: string | null;
  Discarded?: string | null;
  Notes?: string | null;
  Interviews?: Interview[] | null;
  Offers?: Offer[] | null;
  IsActive: boolean | true;
}

export type JobSpec = {
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
  Contact?: Contact | null;
  Published?: string | null;
  Applications?: Application[] | null;
  Benefits?: luBenefit[] | null;
  Tags?: Tag[] | null;
  IsActive: boolean | true;
}

export type Interview = {
  Id: number;
  ApplicationId: number;
  Scheduled: string;
  ContactId?: number | null;
  Contact?: Contact | null;
  Notes?: string | null;
  Outcome?: string | null;
  Feedback?: string | null;
  IsActive: boolean | true;
}

export type Offer = {
  Id: number;
  ApplicationId: number;
  Offered: string;
  Salary?: string | null;
  Notes?: string | null;
  Benefits?: luBenefit[] | null;
  IsActive: boolean | true;
}
