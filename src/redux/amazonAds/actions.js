const amazonAdsActions = {
  AMAZON_ADS_ACTION_BEGIN: 'AMAZON_ADS_ACTION_BEGIN',
  AMAZON_ADS_ACTION_SUCCESS: 'AMAZON_ADS_ACTION_SUCCESS',
  AMAZON_ADS_ACTION_ERR: 'AMAZON_ADS_ACTION_ERR',

  amazonAdsActionBegin: () => ({
    type: amazonAdsActions.AMAZON_ADS_ACTION_BEGIN,
  }),

  amazonAdsActionSuccess: (data) => ({
    type: amazonAdsActions.AMAZON_ADS_ACTION_SUCCESS,
    data,
  }),

  amazonAdsActionErr: (err) => ({
    type: amazonAdsActions.AMAZON_ADS_ACTION_ERR,
    err,
  }),
};

export default amazonAdsActions;
