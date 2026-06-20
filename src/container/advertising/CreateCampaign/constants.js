import moment from 'moment';

export const INITIAL_WIZARD_DATA = {
  campaignType: null,

  campaign: {
    name: '',
    state: 'ENABLED',
    targetingType: 'MANUAL',
    budget: '',
    budgetType: 'DAILY',
    startDate: moment().format('YYYY-MM-DD'),
    endDate: null,

    biddingStrategy: 'AUTO_FOR_SALES',

    placements: {
      topOfSearch: 0,
      restOfSearch: 0,
      productPages: 0,
    },
  },

  adGroup: {
    name: '',
    state: 'ENABLED',
    defaultBid: '1',
  },

  products: [],

  targeting: {
    method: '', // KEYWORD | PRODUCT

    keywords: [],

    targets: [],
  },

  negatives: {
    campaignNegativeKeywords: [],
    campaignNegativeTargets: [],
  },
};

export const SP_STEPS = [
  {
    key: 'campaign',
    title: 'Campaign',
  },
  {
    key: 'adGroup',
    title: 'Ad Group',
  },
  {
    key: 'products',
    title: 'Products',
  },
  {
    key: 'targeting',
    title: 'Targeting',
  },
  {
    key: 'negatives',
    title: 'Negatives',
  },
  {
    key: 'review',
    title: 'Review',
  },
];
