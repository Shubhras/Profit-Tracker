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

  ADS_PRODUCTS_BEGIN: 'ADS_PRODUCTS_BEGIN',
  ADS_PRODUCTS_SUCCESS: 'ADS_PRODUCTS_SUCCESS',
  ADS_PRODUCTS_ERR: 'ADS_PRODUCTS_ERR',

  ADS_PRODUCTS_DETAILS_BEGIN: 'ADS_PRODUCTS_DETAILS_BEGIN',
  ADS_PRODUCTS_DETAILS_SUCCESS: 'ADS_PRODUCTS_DETAILS_SUCCESS',
  ADS_PRODUCTS_DETAILS_ERR: 'ADS_PRODUCTS_DETAILS_ERR',

  PRODUCTS_ADS_BEGIN: 'PRODUCTS_ADS_BEGIN',
  PRODUCTS_ADS_SUCCESS: 'PRODUCTS_ADS_SUCCESS',
  PRODUCTS_ADS_ERR: 'PRODUCTS_ADS_ERR',

  SEARCH_TERMS_BEGIN: 'SEARCH_TERMS_BEGIN',
  SEARCH_TERMS_SUCCESS: 'SEARCH_TERMS_SUCCESS',
  SEARCH_TERMS_ERR: 'SEARCH_TERMS_ERR',

  RULES_BEGIN: 'RULES_BEGIN',
  RULES_SUCCESS: 'RULES_SUCCESS',
  RULES_ERR: 'RULES_ERR',

  TARGETS_BEGIN: 'TARGETS_BEGIN',
  TARGETS_SUCCESS: 'TARGETS_SUCCESS',
  TARGETS_ERR: 'TARGETS_ERR',

  CREATERULE_BEGIN: 'CREATERULE_BEGIN',
  CREATERULE_SUCCESS: 'CREATERULE_SUCCESS',
  CREATERULE_ERR: 'CREATERULE_ERR',

  UPDATERULE_BEGIN: 'UPDATERULE_BEGIN',
  UPDATERULE_SUCCESS: 'UPDATERULE_SUCCESS',
  UPDATERULE_ERR: 'UPDATERULE_ERR',

  DELETERULE_BEGIN: 'DELETERULE_BEGIN',
  DELETERULE_SUCCESS: 'DELETERULE_SUCCESS',
  DELETERULE_ERR: 'DELETERULE_ERR',

  CAMPAIGN_RULE_LIST_BEGIN: 'CAMPAIGN_RULE_LIST_BEGIN',
  CAMPAIGN_RULE_LIST_SUCCESS: 'CAMPAIGN_RULE_LIST_SUCCESS',
  CAMPAIGN_RULE_LIST_ERR: 'CAMPAIGN_RULE_LIST_ERR',

  EDIT_BID_BEGIN: 'EDIT_BID_BEGIN',
  EDIT_BID_SUCCESS: 'EDIT_BID_SUCCESS',
  EDIT_BID_ERR: 'EDIT_BID_ERR',

  CAMPAIGN_UPDATE_BEGIN: 'CAMPAIGN_UPDATE_BEGIN',
  CAMPAIGN_UPDATE_SUCCESS: 'CAMPAIGN_UPDATE_SUCCESS',
  CAMPAIGN_UPDATE_ERR: 'CAMPAIGN_UPDATE_ERR',

  KEYWORD_BID_BEGIN: 'KEYWORD_BID_BEGIN',
  KEYWORD_BID_SUCCESS: 'KEYWORD_BID_SUCCESS',
  KEYWORD_BID_ERR: 'KEYWORD_BID_ERR',

  NEGATIVE_KEYWORD_BEGIN: 'NEGATIVE_KEYWORD_BEGIN',
  NEGATIVE_KEYWORD_SUCCESS: 'NEGATIVE_KEYWORD_SUCCESS',
  NEGATIVE_KEYWORD_ERR: 'NEGATIVE_KEYWORD_ERR',

  ORDER_PROCESSING_BEGIN: 'ORDER_PROCESSINGBEGIN',
  ORDER_PROCESSING_SUCCESS: 'ORDER_PROCESSING_SUCCESS',
  ORDER_PROCESSING_ERR: 'ORDER_PROCESSING_ERR',

  ADVERTISE_OVERVIEW_BEGIN: 'ADVERTISE_OVERVIEW_BEGIN',
  ADVERTISE_OVERVIEW_SUCCESS: 'ADVERTISE_OVERVIEW_SUCCESS',
  ADVERTISE_OVERVIEW_ERR: 'ADVERTISE_OVERVIEW_ERR',

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

  adsproductsBegin: () => {
    return {
      type: actions.ADS_PRODUCTS_BEGIN,
    };
  },

  adsproductsSuccess: (data) => {
    return {
      type: actions.ADS_PRODUCTS_SUCCESS,
      data,
    };
  },

  adsproductsErr: (err) => {
    return {
      type: actions.ADS_PRODUCTS_ERR,
      err,
    };
  },

  adsproductsDetailsBegin: () => {
    return {
      type: actions.ADS_PRODUCTS_DETAILS_BEGIN,
    };
  },

  adsproductsDetailsSuccess: (data) => {
    return {
      type: actions.ADS_PRODUCTS_DETAILS_SUCCESS,
      data,
    };
  },

  adsproductsDetailsErr: (err) => {
    return {
      type: actions.ADS_PRODUCTS_DETAILS_ERR,
      err,
    };
  },

  productsadsBegin: () => {
    return {
      type: actions.PRODUCTS_ADS_BEGIN,
    };
  },

  productsadsSuccess: (data) => {
    return {
      type: actions.PRODUCTS_ADS_SUCCESS,
      data,
    };
  },

  productsadsErr: (err) => {
    return {
      type: actions.PRODUCTS_ADS_ERR,
      err,
    };
  },

  searchtermsBegin: () => {
    return {
      type: actions.SEARCH_TERMS_BEGIN,
    };
  },

  searchtermsSuccess: (data) => {
    return {
      type: actions.SEARCH_TERMS_SUCCESS,
      data,
    };
  },

  searchtermsErr: (err) => {
    return {
      type: actions.SEARCH_TERMS_ERR,
      err,
    };
  },

  rulesBegin: () => {
    return {
      type: actions.RULES_BEGIN,
    };
  },

  rulesSuccess: (data) => {
    return {
      type: actions.RULES_SUCCESS,
      data,
    };
  },

  rulesErr: (err) => {
    return {
      type: actions.RULES_ERR,
      err,
    };
  },

  targetsBegin: () => {
    return {
      type: actions.TARGETS_BEGIN,
    };
  },

  targetsSuccess: (data) => {
    return {
      type: actions.TARGETS_SUCCESS,
      data,
    };
  },

  targetsErr: (err) => {
    return {
      type: actions.TARGETS_ERR,
      err,
    };
  },

  createruleBegin: () => {
    return {
      type: actions.CREATERULE_BEGIN,
    };
  },

  createruleSuccess: (data) => {
    return {
      type: actions.CREATERULE_SUCCESS,
      data,
    };
  },

  createruleErr: (err) => {
    return {
      type: actions.CREATERULE_ERR,
      err,
    };
  },

  updateruleBegin: () => {
    return {
      type: actions.UPDATERULE_BEGIN,
    };
  },

  updateruleSuccess: (data) => {
    return {
      type: actions.UPDATERULE_SUCCESS,
      data,
    };
  },

  updateruleErr: (err) => {
    return {
      type: actions.UPDATERULE_ERR,
      err,
    };
  },

  deleteruleBegin: () => {
    return {
      type: actions.DELETERULE_BEGIN,
    };
  },

  deleteruleSuccess: (data) => {
    return {
      type: actions.DELETERULE_SUCCESS,
      data,
    };
  },

  deleteruleErr: (err) => {
    return {
      type: actions.DELETERULE_ERR,
      err,
    };
  },

  campaignruleListBegin: () => {
    return {
      type: actions.CAMPAIGN_RULE_LIST_BEGIN,
    };
  },

  campaignruleListSuccess: (data) => {
    return {
      type: actions.CAMPAIGN_RULE_LIST_SUCCESS,
      data,
    };
  },

  campaignruleListErr: (err) => {
    return {
      type: actions.CAMPAIGN_RULE_LIST_ERR,
      err,
    };
  },

  editbidBegin: () => {
    return {
      type: actions.EDIT_BID_BEGIN,
    };
  },

  editbidSuccess: (data) => {
    return {
      type: actions.EDIT_BID_SUCCESS,
      data,
    };
  },

  editbidErr: (err) => {
    return {
      type: actions.EDIT_BID_ERR,
      err,
    };
  },

  campaignupdateBegin: () => {
    return {
      type: actions.CAMPAIGN_UPDATE_BEGIN,
    };
  },

  campaignupdateSuccess: (data) => {
    return {
      type: actions.CAMPAIGN_UPDATE_SUCCESS,
      data,
    };
  },

  campaignupdateErr: (err) => {
    return {
      type: actions.CAMPAIGN_UPDATE_ERR,
      err,
    };
  },

  keywordBidBegin: () => {
    return {
      type: actions.KEYWORD_BID_BEGIN,
    };
  },

  keywordBidSuccess: (data) => {
    return {
      type: actions.KEYWORD_BID_SUCCESS,
      data,
    };
  },

  keywordBidErr: (err) => {
    return {
      type: actions.KEYWORD_BID_ERR,
      err,
    };
  },

  negativekeywordBegin: () => {
    return {
      type: actions.NEGATIVE_KEYWORD_BEGIN,
    };
  },

  negativekeywordSuccess: (data) => {
    return {
      type: actions.NEGATIVE_KEYWORD_SUCCESS,
      data,
    };
  },

  negativekeywordErr: (err) => {
    return {
      type: actions.NEGATIVE_KEYWORD_ERR,
      err,
    };
  },

  orderprocessingBegin: () => {
    return {
      type: actions.ORDER_PROCESSING_BEGIN,
    };
  },

  orderprocessingSuccess: (data) => {
    return {
      type: actions.ORDER_PROCESSING_SUCCESS,
      data,
    };
  },

  orderprocessingErr: (err) => {
    return {
      type: actions.ORDER_PROCESSING_ERR,
      err,
    };
  },

  advertisingOverviewBegin: () => {
    return {
      type: actions.ADVERTISE_OVERVIEW_BEGIN,
    };
  },

  advertisingOverviewSuccess: (data) => {
    return {
      type: actions.ADVERTISE_OVERVIEW_SUCCESS,
      data,
    };
  },

  advertisingOverviewErr: (err) => {
    return {
      type: actions.ADVERTISE_OVERVIEW_ERR,
      err,
    };
  },
};

export default actions;
