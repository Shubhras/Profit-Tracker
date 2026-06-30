import actions from './actions';

const initialState = {
  campaignData: [],
  adsGroupData: [],
  keywordsData: [],
  adsProductsData: [],
  adsProductsDataDetails: [],
  productsAds: [],
  searchTerms: [],
  targets: [],
  createrule: [],
  updaterule: [],
  deleterule: [],
  negativekeyword: [],
  editbid: [],
  keybidupdate: [],
  updatecampaign: [],
  orderProcessingData: [],
  advertiseOverview: [],
  rules: [],
  campginrulelist: [],
  loading: false,
  error: null,
};

const {
  CAMPAIGNS_BEGIN,
  CAMPAIGNS_SUCCESS,
  CAMPAIGNS_ERR,
  ADS_GROUP_BEGIN,
  ADS_GROUP_SUCCESS,
  ADS_GROUP_ERR,
  KEYWORDS_BEGIN,
  KEYWORDS_SUCCESS,
  KEYWORDS_ERR,

  ADS_PRODUCTS_BEGIN,
  ADS_PRODUCTS_SUCCESS,
  ADS_PRODUCTS_ERR,

  ADS_PRODUCTS_DETAILS_BEGIN,
  ADS_PRODUCTS_DETAILS_SUCCESS,
  ADS_PRODUCTS_DETAILS_ERR,

  PRODUCTS_ADS_BEGIN,
  PRODUCTS_ADS_SUCCESS,
  PRODUCTS_ADS_ERR,

  SEARCH_TERMS_BEGIN,
  SEARCH_TERMS_SUCCESS,
  SEARCH_TERMS_ERR,

  RULES_BEGIN,
  RULES_SUCCESS,
  RULES_ERR,

  TARGETS_BEGIN,
  TARGETS_SUCCESS,
  TARGETS_ERR,

  CREATERULE_BEGIN,
  CREATERULE_SUCCESS,
  CREATERULE_ERR,

  UPDATERULE_BEGIN,
  UPDATERULE_SUCCESS,
  UPDATERULE_ERR,

  DELETERULE_BEGIN,
  DELETERULE_SUCCESS,
  DELETERULE_ERR,

  CAMPAIGN_RULE_LIST_BEGIN,
  CAMPAIGN_RULE_LIST_SUCCESS,
  CAMPAIGN_RULE_LIST_ERR,

  EDIT_BID_BEGIN,
  EDIT_BID_SUCCESS,
  EDIT_BID_ERR,

  CAMPAIGN_UPDATE_BEGIN,
  CAMPAIGN_UPDATE_SUCCESS,
  CAMPAIGN_UPDATE_ERR,

  KEYWORD_BID_BEGIN,
  KEYWORD_BID_SUCCESS,
  KEYWORD_BID_ERR,

  NEGATIVE_KEYWORD_BEGIN,
  NEGATIVE_KEYWORD_SUCCESS,
  NEGATIVE_KEYWORD_ERR,

  ORDER_PROCESSING_BEGIN,
  ORDER_PROCESSING_SUCCESS,
  ORDER_PROCESSING_ERR,

  ADVERTISE_OVERVIEW_BEGIN,
  ADVERTISE_OVERVIEW_SUCCESS,
  ADVERTISE_OVERVIEW_ERR,
} = actions;

const AdvertisingReducer = (state = initialState, action) => {
  const { type, data, err } = action;
  switch (type) {
    case CAMPAIGNS_BEGIN:
      return {
        ...state,
        loading: true,
      };

    case CAMPAIGNS_SUCCESS:
      return {
        ...state,
        campaignData: data,
        loading: false,
      };

    case CAMPAIGNS_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case ADS_GROUP_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ADS_GROUP_SUCCESS:
      return {
        ...state,
        adsGroupData: data,
        loading: false,
      };

    case ADS_GROUP_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case KEYWORDS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case KEYWORDS_SUCCESS:
      return {
        ...state,
        keywordsData: data,
        loading: false,
      };

    case KEYWORDS_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case ADS_PRODUCTS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ADS_PRODUCTS_SUCCESS:
      return {
        ...state,
        adsProductsData: data,
        loading: false,
      };

    case ADS_PRODUCTS_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case ADS_PRODUCTS_DETAILS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ADS_PRODUCTS_DETAILS_SUCCESS:
      return {
        ...state,
        adsProductsDataDetails: data,
        loading: false,
      };

    case ADS_PRODUCTS_DETAILS_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case PRODUCTS_ADS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PRODUCTS_ADS_SUCCESS:
      return {
        ...state,
        productsAds: data,
        loading: false,
      };

    case PRODUCTS_ADS_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case SEARCH_TERMS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SEARCH_TERMS_SUCCESS:
      return {
        ...state,
        searchTerms: data,
        loading: false,
      };

    case SEARCH_TERMS_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case RULES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case RULES_SUCCESS:
      return {
        ...state,
        rules: data,
        loading: false,
      };

    case RULES_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case TARGETS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case TARGETS_SUCCESS:
      return {
        ...state,
        targets: data,
        loading: false,
      };

    case TARGETS_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case CREATERULE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATERULE_SUCCESS:
      return {
        ...state,
        createrule: data,
        loading: false,
      };

    case CREATERULE_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case UPDATERULE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATERULE_SUCCESS:
      return {
        ...state,
        updaterule: data,
        loading: false,
      };

    case UPDATERULE_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case DELETERULE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETERULE_SUCCESS:
      return {
        ...state,
        deleterule: data,
        loading: false,
      };

    case DELETERULE_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case CAMPAIGN_RULE_LIST_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CAMPAIGN_RULE_LIST_SUCCESS:
      return {
        ...state,
        campginrulelist: data,
        loading: false,
      };

    case CAMPAIGN_RULE_LIST_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case EDIT_BID_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case EDIT_BID_SUCCESS:
      return {
        ...state,
        editbid: data,
        loading: false,
      };

    case EDIT_BID_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case CAMPAIGN_UPDATE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CAMPAIGN_UPDATE_SUCCESS:
      return {
        ...state,
        updatecampaign: data,
        loading: false,
      };

    case CAMPAIGN_UPDATE_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case KEYWORD_BID_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case KEYWORD_BID_SUCCESS:
      return {
        ...state,
        keybidupdate: data,
        loading: false,
      };

    case KEYWORD_BID_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case NEGATIVE_KEYWORD_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case NEGATIVE_KEYWORD_SUCCESS:
      return {
        ...state,
        negativekeyword: data,
        loading: false,
      };

    case NEGATIVE_KEYWORD_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case ORDER_PROCESSING_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ORDER_PROCESSING_SUCCESS:
      return {
        ...state,
        orderProcessingData: data,
        loading: false,
      };

    case ORDER_PROCESSING_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case ADVERTISE_OVERVIEW_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ADVERTISE_OVERVIEW_SUCCESS:
      return {
        ...state,
        advertiseOverview: data,
        loading: false,
      };

    case ADVERTISE_OVERVIEW_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
  // default:
  //   return state;
};

export default AdvertisingReducer;
