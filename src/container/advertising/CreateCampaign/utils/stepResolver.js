import { SP_STEPS } from '../constants';

export const resolveSteps = (campaignType) => {
  switch (campaignType) {
    case 'SP':
      return SP_STEPS;

    default:
      return [];
  }
};
