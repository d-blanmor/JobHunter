export type Stage = 'received' | 'applied' | 'interview' | 'offers' | 'discarded';

export type Counts = {
  received: number;
  applied: number;
  interview: number;
  offers: number;
  discarded: number;
};

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
  ParentId?: number | null;
  PortalURL?: string | null;
  Icon?: Blob | null;
  Details?: string | null;
  IsActive: boolean | true;
  Order: number;
}

export type PlaceOfWork = {
  Id: number;
  LocationId: number;
  Address?: string | null;
  IsActive: boolean | true;
}

export type Contact = {
  Id: number;
  Name: string;
  Email?: string | null;
  Phone?: string | null;
  Details?: string | null;
  SourceId?: number | null;
  IsActive: boolean | true;
}

export type JobSpec = {
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
  Profile?: string | null;
  Notes?: string | null;
  Published?: string | null;
  Created: string | null;
  Applications?: Application[] | [];
  Benefits?: luBenefit[] | [];
  Tags?: Tag[] | [];
  IsActive: boolean | true;
}

export type Application = {
  Id: number;
  JobSpecId: number;
  Applied: string;
  Confirmed?: string | null;
  Discarded?: string | null;
  Letter?: string | null;
  CV?: string | null;
  Notes?: string | null;
  Interviews?: Interview[] | null;
  Offers?: Offer[] | null;
  IsActive: boolean | true;
}

export type Interview = {
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

export type Offer = {
  Id: number;
  ApplicationId: number;
  Offered: string;
  Salary?: string | null;
  Description?: string | null;
  Notes?: string | null;
  Benefits?: luBenefit[] | null;
  IsActive: boolean | true;
}

export type AppSetting = {
  Key: string;
  Value?: string | null;
  Notes?: string | null;
  IsActive: boolean | true;
}

export type wfStageItem = {
  JobSpecId: number;
  ApplicationId?: number | null;
  InterviewId?: number | null;
  OfferId?: number | null;
  Position: string;
  Company?: string | null;
  RoleTypeId?: number | null;
  WorkModelId?: number | null;
  Created: string;
  Applied?: string | null;
  Discarded?: string | null;
  Scheduled?: string | null;
  Offered?: string | null;
}
