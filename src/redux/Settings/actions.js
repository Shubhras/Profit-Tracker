const actions = {
  OVERVIEW_SETTING_BEGIN: 'OVERVIEW_SETTING_BEGIN',
  OVERVIEW_SETTING_SUCCESS: 'OVERVIEW_SETTING_SUCCESS',
  OVERVIEW_SETTING_ERR: 'OVERVIEW_SETTING_ERR',

  PRODUCT_CONFIG_BEGIN: 'PRODUCT_CONFIG_BEGIN',
  PRODUCT_CONFIG_SUCCESS: 'PRODUCT_CONFIG_SUCCESS',
  PRODUCT_CONFIG_ERR: 'PRODUCT_CONFIG_ERR',

  OTHER_EXPENSES_BEGIN: 'OTHER_EXPENSES_BEGIN',
  OTHER_EXPENSES_SUCCESS: 'OTHER_EXPENSES_SUCCESS',
  OTHER_EXPENSES_ERR: 'OTHER_EXPENSES_ERR',

  CASHBACK_BEGIN: 'CASHBACK_BEGIN',
  CASHBACK_SUCCESS: 'CASHBACK_SUCCESS',
  CASHBACK_ERR: 'CASHBACK_ERR',

  EXCEPTION_RULES_BEGIN: 'EXCEPTION_RULES_BEGIN',
  EXCEPTION_RULES_SUCCESS: 'EXCEPTION_RULES_SUCCESS',
  EXCEPTION_RULES_ERR: 'EXCEPTION_RULES_ERR',

  CONFIG_RECONCILE_BEGIN: 'CONFIG_RECONCILE_BEGIN',
  CONFIG_RECONCILE_SUCCESS: 'CONFIG_RECONCILE_SUCCESS',
  CONFIG_RECONCILE_ERR: 'CONFIG_RECONCILE_ERR',

  GET_CHANNELS_BEGIN: 'GET_CHANNELS_BEGIN',
  GET_CHANNELS_SUCCESS: 'GET_CHANNELS_SUCCESS',
  GET_CHANNELS_ERR: 'GET_CHANNELS_ERR',

  USER_INFO_BEGIN: 'USER_INFO_BEGIN',
  USER_INFO_SUCCESS: 'USER_INFO_SUCCESS',
  USER_INFO_ERR: 'USER_INFO_ERR',

  overviewsettingBegin: () => {
    return {
      type: actions.OVERVIEW_SETTING_BEGIN,
    };
  },

  overviewsettingSuccess: (data) => {
    return {
      type: actions.OVERVIEW_SETTING_SUCCESS,
      data,
    };
  },

  overviewsettingErr: (err) => {
    return {
      type: actions.OVERVIEW_SETTING_ERR,
      err,
    };
  },

  productconfigBegin: () => {
    return {
      type: actions.PRODUCT_CONFIG_BEGIN,
    };
  },

  productconfigSuccess: (data) => {
    return {
      type: actions.PRODUCT_CONFIG_SUCCESS,
      data,
    };
  },

  productconfigErr: (err) => {
    return {
      type: actions.PRODUCT_CONFIG_ERR,
      err,
    };
  },

  otherexpensesBegin: () => {
    return {
      type: actions.OTHER_EXPENSES_BEGIN,
    };
  },

  otherexpensesSuccess: (data) => {
    return {
      type: actions.OTHER_EXPENSES_SUCCESS,
      data,
    };
  },

  otherexpensesErr: (err) => {
    return {
      type: actions.OTHER_EXPENSES_ERR,
      err,
    };
  },

  cashbackBegin: () => {
    return {
      type: actions.CASHBACK_BEGIN,
    };
  },

  cashbackSuccess: (data) => {
    return {
      type: actions.CASHBACK_SUCCESS,
      data,
    };
  },

  cashbackErr: (err) => {
    return {
      type: actions.CASHBACK_ERR,
      err,
    };
  },

  exceptionrulesBegin: () => {
    return {
      type: actions.EXCEPTION_RULES_BEGIN,
    };
  },

  exceptionrulesSuccess: (data) => {
    return {
      type: actions.EXCEPTION_RULES_SUCCESS,
      data,
    };
  },

  exceptionrulesErr: (err) => {
    return {
      type: actions.EXCEPTION_RULES_ERR,
      err,
    };
  },

  configreconcileBegin: () => {
    return {
      type: actions.CONFIG_RECONCILE_BEGIN,
    };
  },

  configreconcileSuccess: (data) => {
    return {
      type: actions.CONFIG_RECONCILE_SUCCESS,
      data,
    };
  },

  configreconcileErr: (err) => {
    return {
      type: actions.CONFIG_RECONCILE_ERR,
      err,
    };
  },

  getchannelsBegin: () => {
    return {
      type: actions.GET_CHANNELS_BEGIN,
    };
  },

  getchannelsSuccess: (data) => {
    return {
      type: actions.GET_CHANNELS_SUCCESS,
      data,
    };
  },

  getchannelsErr: (err) => {
    return {
      type: actions.GET_CHANNELS_ERR,
      err,
    };
  },
  userinfoBegin: () => {
    return {
      type: actions.USER_INFO_BEGIN,
    };
  },

  userinfoSuccess: (data) => {
    return {
      type: actions.USER_INFO_SUCCESS,
      data,
    };
  },

  userinfoErr: (err) => {
    return {
      type: actions.USER_INFO_ERR,
      err,
    };
  },
};

export default actions;
