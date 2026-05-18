import actions from './actions';

const initialState = {
  campaignData: [],
  adsGroupData: [],
  keywordsData: [],
  adsProductsData: [],
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
    default:
      return state;
  }
  // default:
  //   return state;
};

export default AdvertisingReducer;
