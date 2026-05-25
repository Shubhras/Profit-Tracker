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
  rules: [],
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
    default:
      return state;
  }
  // default:
  //   return state;
};

export default AdvertisingReducer;
