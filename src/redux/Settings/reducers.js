import actions from './actions';

const initialState = {
  overviewsettingData: [],
  overviewsettingLoading: false,
  overviewsettingError: null,

  productconfigData: [],
  productconfigLoading: false,
  productconfigError: null,

  otherexpenseData: [],
  otherexpenseLoading: false,
  otherexpenseError: null,

  cashbackData: [],
  cashbackLoading: false,
  cashbackError: null,

  exceptionruleData: [],
  exceptionruleLoading: false,
  exceptionruleError: null,

  configreconcileData: [],
  configreconcileLoading: false,
  configreconcileError: null,

  getchannelsData: [],
  getchannelsLoading: false,
  getchannelsError: null,

  userinfoData: [],
  userinfoLoading: false,
  userinfoError: null,
};

const {
  OVERVIEW_SETTING_BEGIN,
  OVERVIEW_SETTING_SUCCESS,
  OVERVIEW_SETTING_ERR,

  PRODUCT_CONFIG_BEGIN,
  PRODUCT_CONFIG_SUCCESS,
  PRODUCT_CONFIG_ERR,

  OTHER_EXPENSES_BEGIN,
  OTHER_EXPENSES_SUCCESS,
  OTHER_EXPENSES_ERR,

  CASHBACK_BEGIN,
  CASHBACK_SUCCESS,
  CASHBACK_ERR,

  EXCEPTION_RULES_BEGIN,
  EXCEPTION_RULES_SUCCESS,
  EXCEPTION_RULES_ERR,

  CONFIG_RECONCILE_BEGIN,
  CONFIG_RECONCILE_SUCCESS,
  CONFIG_RECONCILE_ERR,

  GET_CHANNELS_BEGIN,
  GET_CHANNELS_SUCCESS,
  GET_CHANNELS_ERR,

  USER_INFO_BEGIN,
  USER_INFO_SUCCESS,
  USER_INFO_ERR,
} = actions;

const settingsReducer = (state = initialState, action) => {
  const { type, data, err } = action;
  switch (type) {
    case OVERVIEW_SETTING_BEGIN:
      return {
        ...state,
        overviewsettingLoading: true,
      };

    case OVERVIEW_SETTING_SUCCESS:
      return {
        ...state,
        overviewsettingData: data,
        overviewsettingLoading: false,
      };

    case OVERVIEW_SETTING_ERR:
      return {
        ...state,
        overviewsettingError: err,
        overviewsettingLoading: false,
      };

    case PRODUCT_CONFIG_BEGIN:
      return {
        ...state,
        productconfigLoading: true,
      };

    case PRODUCT_CONFIG_SUCCESS:
      return {
        ...state,
        productconfigData: data,
        productconfigLoading: false,
      };

    case PRODUCT_CONFIG_ERR:
      return {
        ...state,
        productconfigError: err,
        productconfigLoading: false,
      };

    case OTHER_EXPENSES_BEGIN:
      return {
        ...state,
        otherexpenseLoading: true,
      };

    case OTHER_EXPENSES_SUCCESS:
      return {
        ...state,
        otherexpenseData: data,
        otherexpenseLoading: false,
      };

    case OTHER_EXPENSES_ERR:
      return {
        ...state,
        otherexpenseError: err,
        otherexpenseLoading: false,
      };

    case CASHBACK_BEGIN:
      return {
        ...state,
        cashbackLoading: true,
      };

    case CASHBACK_SUCCESS:
      return {
        ...state,
        cashbackData: data,
        cashbackLoading: false,
      };

    case CASHBACK_ERR:
      return {
        ...state,
        cashbackError: err,
        cashbackLoading: false,
      };

    case EXCEPTION_RULES_BEGIN:
      return {
        ...state,
        exceptionruleLoading: true,
      };

    case EXCEPTION_RULES_SUCCESS:
      return {
        ...state,
        exceptionruleData: data,
        exceptionruleLoading: false,
      };

    case EXCEPTION_RULES_ERR:
      return {
        ...state,
        exceptionruleError: err,
        exceptionruleLoading: false,
      };

    case CONFIG_RECONCILE_BEGIN:
      return {
        ...state,
        configreconcileLoading: true,
      };

    case CONFIG_RECONCILE_SUCCESS:
      return {
        ...state,
        configreconcileData: data,
        configreconcileLoading: false,
      };

    case CONFIG_RECONCILE_ERR:
      return {
        ...state,
        configreconcileError: err,
        configreconcileLoading: false,
      };

    case GET_CHANNELS_BEGIN:
      return {
        ...state,
        getchannelsLoading: true,
      };

    case GET_CHANNELS_SUCCESS:
      return {
        ...state,
        getchannelsData: data,
        getchannelsLoading: false,
      };

    case GET_CHANNELS_ERR:
      return {
        ...state,
        getchannelsError: err,
        getchannelsLoading: false,
      };

    case USER_INFO_BEGIN:
      return {
        ...state,
        userinfoLoading: true,
      };

    case USER_INFO_SUCCESS:
      return {
        ...state,
        userinfoData: data,
        userinfoLoading: false,
      };

    case USER_INFO_ERR:
      return {
        ...state,
        userinfoError: err,
        userinfoLoading: false,
      };
    default:
      return state;
  }
  // default:
  //   return state;
};

export default settingsReducer;
