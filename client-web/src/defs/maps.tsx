import { 
  Stage,
} from './types'

export const titleMap: Record<Stage, string> = {
  received: 'Received Job Specs',
  applied: 'Applied Job Specs',
  interview: 'Interview Job Specs',
  offers: 'Offer Job Specs',
  discarded: 'Discarded Job Specs',
};

export const stageDateLabels: Record<Stage, string> = {
  received: 'Recieved',
  applied: 'Applied',
  interview: 'Next Interview',
  offers: 'Offered',
  discarded: 'Discarded',
};
