const actions = {
  CREATE_COUPONCODE_BEGIN: 'CREATE_COUPONCODE_BEGIN',
  CREATE_COUPONCODE_SUCCESS: 'CREATE_COUPONCODE_SUCCESS',
  CREATE_COUPONCODE_ERR: 'CREATE_COUPONCODE_ERR',

  GET_COUPONCODE_BEGIN: 'GET_COUPONCODE_BEGIN',
  GET_COUPONCODE_SUCCESS: 'GET_COUPONCODE_SUCCESS',
  GET_COUPONCODE_ERR: 'GET_COUPONCODE_ERR',

  DELETE_COUPONCODE_BEGIN: 'DELETE_COUPONCODE_BEGIN',
  DELETE_COUPONCODE_SUCCESS: 'DELETE_COUPONCODE_SUCCESS',
  DELETE_COUPONCODE_ERR: 'DELETE_COUPONCODE_ERR',

  UPDATE_COUPONCODE_BEGIN: 'UPDATE_COUPONCODE_BEGIN',
  UPDATE_COUPONCODE_SUCCESS: 'UPDATE_COUPONCODE_SUCCESS',
  UPDATE_COUPONCODE_ERR: 'UPDATE_COUPONCODE_ERR',

  ADMIN_DASHBOARD_BEGIN: 'ADMIN_DASHBOARD_BEGIN',
  ADMIN_DASHBOARD_SUCCESS: 'ADMIN_DASHBOARD_SUCCESS',
  ADMIN_DASHBOARD_ERR: 'ADMIN_DASHBOARD_ERR',

  SUBSCRIPTION_LIST_BEGIN: 'SUBSCRIPTION_LIST_BEGIN',
  SUBSCRIPTION_LIST_SUCCESS: 'SUBSCRIPTION_LIST_SUCCESS',
  SUBSCRIPTION_LIST_ERR: 'SUBSCRIPTION_LIST_ERR',

  CREATE_SUBSCRIPTION_BEGIN: 'CREATE_SUBSCRIPTION_BEGIN',
  CREATE_SUBSCRIPTION_SUCCESS: 'CREATE_SUBSCRIPTION_SUCCESS',
  CREATE_SUBSCRIPTION_ERR: 'CREATE_SUBSCRIPTION_ERR',

  DELETE_SUBSCRIPTION_BEGIN: 'DELETE_SUBSCRIPTION_BEGIN',
  DELETE_SUBSCRIPTION_SUCCESS: 'DELETE_SUBSCRIPTION_SUCCESS',
  DELETE_SUBSCRIPTION_ERR: 'DELETE_SUBSCRIPTION_ERR',

  UPDATE_SUBSCRIPTION_BEGIN: 'UPDATE_SUBSCRIPTION_BEGIN',
  UPDATE_SUBSCRIPTION_SUCCESS: 'UPDATE_SUBSCRIPTION_SUCCESS',
  UPDATE_SUBSCRIPTION_ERR: 'UPDATE_SUBSCRIPTION_ERR',

  GET_PRIVACY_POLICY_BEGIN: 'GET_PRIVACY_POLICY_BEGIN',
  GET_PRIVACY_POLICY_SUCCESS: 'GET_PRIVACY_POLICY_SUCCESS',
  GET_PRIVACY_POLICY_ERR: 'GET_PRIVACY_POLICY_ERR',

  CREATE_PRIVACY_POLICY_BEGIN: 'CREATE_PRIVACY_POLICY_BEGIN',
  CREATE_PRIVACY_POLICY_SUCCESS: 'CREATE_PRIVACY_POLICY_SUCCESS',
  CREATE_PRIVACY_POLICY_ERR: 'CREATE_PRIVACY_POLICY_ERR',

  UPDATE_PRIVACY_POLICY_BEGIN: 'UPDATE_PRIVACY_POLICY_BEGIN',
  UPDATE_PRIVACY_POLICY_SUCCESS: 'UPDATE_PRIVACY_POLICY_SUCCESS',
  UPDATE_PRIVACY_POLICY_ERR: 'UPDATE_PRIVACY_POLICY_ERR',

  DELETE_PRIVACY_POLICY_BEGIN: 'DELETE_PRIVACY_POLICY_BEGIN',
  DELETE_PRIVACY_POLICY_SUCCESS: 'DELETE_PRIVACY_POLICY_SUCCESS',
  DELETE_PRIVACY_POLICY_ERR: 'DELETE_PRIVACY_POLICY_ERR',

  USERS_LIST_BEGIN: 'USERS_LIST_BEGIN',
  USERS_LIST_SUCCESS: 'USERS_LIST_SUCCESS',
  USERS_LIST_ERR: 'USERS_LIST_ERR',

  createCouponCodesBegin: () => ({
    type: actions.CREATE_COUPONCODE_BEGIN,
  }),

  createCouponCodesSuccess: (data) => ({
    type: actions.CREATE_COUPONCODE_SUCCESS,
    data,
  }),

  createCouponCodesErr: (err) => ({
    type: actions.CREATE_COUPONCODE_ERR,
    err,
  }),

  getCouponCodesBegin: () => ({
    type: actions.GET_COUPONCODE_BEGIN,
  }),

  getCouponCodesSuccess: (data) => ({
    type: actions.GET_COUPONCODE_SUCCESS,
    data,
  }),

  getCouponCodesErr: (err) => ({
    type: actions.GET_COUPONCODE_ERR,
    err,
  }),

  deleteCouponCodesBegin: () => ({
    type: actions.DELETE_COUPONCODE_BEGIN,
  }),

  deleteCouponCodesSuccess: (data) => ({
    type: actions.DELETE_COUPONCODE_SUCCESS,
    data,
  }),

  deleteCouponCodesErr: (err) => ({
    type: actions.DELETE_COUPONCODE_ERR,
    err,
  }),

  updateCouponCodesBegin: () => ({
    type: actions.UPDATE_COUPONCODE_BEGIN,
  }),

  updateCouponCodesSuccess: (data) => ({
    type: actions.UPDATE_COUPONCODE_SUCCESS,
    data,
  }),

  updateCouponCodesErr: (err) => ({
    type: actions.UPDATE_COUPONCODE_ERR,
    err,
  }),

  adminDashboardBegin: () => ({
    type: actions.ADMIN_DASHBOARD_BEGIN,
  }),

  adminDashboardSuccess: (data) => ({
    type: actions.ADMIN_DASHBOARD_SUCCESS,
    data,
  }),

  adminDashboardErr: (err) => ({
    type: actions.ADMIN_DASHBOARD_ERR,
    err,
  }),

  subscriptionListBegin: () => ({
    type: actions.SUBSCRIPTION_LIST_BEGIN,
  }),

  subscriptionListSuccess: (data) => ({
    type: actions.SUBSCRIPTION_LIST_SUCCESS,
    data,
  }),

  subscriptionListErr: (err) => ({
    type: actions.SUBSCRIPTION_LIST_ERR,
    err,
  }),

  createSubscriptionBegin: () => ({
    type: actions.CREATE_SUBSCRIPTION_BEGIN,
  }),

  createSubscriptionSuccess: (data) => ({
    type: actions.CREATE_SUBSCRIPTION_SUCCESS,
    data,
  }),

  createSubscriptionErr: (err) => ({
    type: actions.CREATE_SUBSCRIPTION_ERR,
    err,
  }),

  deleteSubscriptionBegin: () => ({
    type: actions.DELETE_SUBSCRIPTION_BEGIN,
  }),

  deleteSubscriptionSuccess: (data) => ({
    type: actions.DELETE_SUBSCRIPTION_SUCCESS,
    data,
  }),

  deleteSubscriptionErr: (err) => ({
    type: actions.DELETE_SUBSCRIPTION_ERR,
    err,
  }),

  updateSubscriptionBegin: () => ({
    type: actions.UPDATE_SUBSCRIPTION_BEGIN,
  }),

  updateSubscriptionSuccess: (data) => ({
    type: actions.UPDATE_SUBSCRIPTION_SUCCESS,
    data,
  }),

  updateSubscriptionErr: (err) => ({
    type: actions.UPDATE_SUBSCRIPTION_ERR,
    err,
  }),

  getPrivacyPolicyBegin: () => ({
    type: actions.GET_PRIVACY_POLICY_BEGIN,
  }),

  getPrivacyPolicySuccess: (data) => ({
    type: actions.GET_PRIVACY_POLICY_SUCCESS,
    data,
  }),

  getPrivacyPolicyErr: (err) => ({
    type: actions.GET_PRIVACY_POLICY_ERR,
    err,
  }),

  createPrivacyPolicyBegin: () => ({
    type: actions.CREATE_PRIVACY_POLICY_BEGIN,
  }),

  createPrivacyPolicySuccess: (data) => ({
    type: actions.CREATE_PRIVACY_POLICY_SUCCESS,
    data,
  }),

  createPrivacyPolicyErr: (err) => ({
    type: actions.CREATE_PRIVACY_POLICY_ERR,
    err,
  }),

  updatePrivacyPolicyBegin: () => ({
    type: actions.UPDATE_PRIVACY_POLICY_BEGIN,
  }),

  updatePrivacyPolicySuccess: (data) => ({
    type: actions.UPDATE_PRIVACY_POLICY_SUCCESS,
    data,
  }),

  updatePrivacyPolicyErr: (err) => ({
    type: actions.UPDATE_PRIVACY_POLICY_ERR,
    err,
  }),

  deletePrivacyPolicyBegin: () => ({
    type: actions.DELETE_PRIVACY_POLICY_BEGIN,
  }),

  deletePrivacyPolicySuccess: (data) => ({
    type: actions.DELETE_PRIVACY_POLICY_SUCCESS,
    data,
  }),

  deletePrivacyPolicyErr: (err) => ({
    type: actions.DELETE_PRIVACY_POLICY_ERR,
    err,
  }),

  getuserslistBegin: () => ({
    type: actions.USERS_LIST_BEGIN,
  }),

  getuserslistSuccess: (data) => ({
    type: actions.USERS_LIST_SUCCESS,
    data,
  }),

  getuserslistErr: (err) => ({
    type: actions.USERS_LIST_ERR,
    err,
  }),
};

export default actions;
