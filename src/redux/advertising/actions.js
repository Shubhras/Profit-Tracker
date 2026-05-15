const actions = {
  CAMPAIGNS_BEGIN: 'CAMPAIGNS_BEGIN',
  CAMPAIGNS_SUCCESS: 'CAMPAIGNS_SUCCESS',
  CAMPAIGNS_ERR: 'CAMPAIGNS_ERR',

  ADS_GROUP_BEGIN: 'ADS_GROUP_BEGIN',
  ADS_GROUP_SUCCESS: 'ADS_GROUP_SUCCESS',
  ADS_GROUP_ERR: 'ADS_GROUP_ERR',

  KEYWORDS_BEGIN: 'KEYWORDS_BEGIN',
  KEYWORDS_SUCCESS: 'KEYWORDS_SUCCESS',
  KEYWORDS_ERR: 'KEYWORDS_ERR',

  campaignsBegin: () => {
    return {
      type: actions.CAMPAIGNS_BEGIN,
    };
  },

  campaignsSuccess: (data) => {
    return {
      type: actions.CAMPAIGNS_SUCCESS,
      data,
    };
  },

  campaignsErr: (err) => {
    return {
      type: actions.CAMPAIGNS_ERR,
      err,
    };
  },

  adsgroupBegin: () => {
    return {
      type: actions.ADS_GROUP_BEGIN,
    };
  },

  adsgroupSuccess: (data) => {
    return {
      type: actions.ADS_GROUP_SUCCESS,
      data,
    };
  },

  adsgroupErr: (err) => {
    return {
      type: actions.ADS_GROUP_ERR,
      err,
    };
  },

  keywordsBegin: () => {
    return {
      type: actions.KEYWORDS_BEGIN,
    };
  },

  keywordsSuccess: (data) => {
    return {
      type: actions.KEYWORDS_SUCCESS,
      data,
    };
  },

  keywordsErr: (err) => {
    return {
      type: actions.KEYWORDS_ERR,
      err,
    };
  },
};

export default actions;
