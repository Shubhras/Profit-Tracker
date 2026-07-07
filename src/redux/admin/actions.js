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

  NOTIFICATION_LIST_BEGIN: 'NOTIFICATION_LIST_BEGIN',
  NOTIFICATION_LIST_SUCCESS: 'NOTIFICATION_LIST_SUCCESS',
  NOTIFICATION_LIST_ERR: 'NOTIFICATION_LIST_ERR',

  CREATE_NOTIFICATION_BEGIN: 'CREATE_NOTIFICATION_BEGIN',
  CREATE_NOTIFICATION_SUCCESS: 'CREATE_NOTIFICATION_SUCCESS',
  CREATE_NOTIFICATION_ERR: 'CREATE_NOTIFICATION_ERR',

  DELETE_NOTIFICATION_BEGIN: 'DELETE_NOTIFICATION_BEGIN',
  DELETE_NOTIFICATION_SUCCESS: 'DELETE_NOTIFICATION_SUCCESS',
  DELETE_NOTIFICATION_ERR: 'DELETE_NOTIFICATION_ERR',

  GET_TICKETS_LISTS_BEGIN: 'GET_TICKETS_LISTS_BEGIN',
  GET_TICKETS_LISTS_SUCCESS: 'GET_TICKETS_LISTS_SUCCESS',
  GET_TICKETS_LISTS_ERR: 'GET_TICKETS_LISTS_ERR',

  UPDATE_TICKET_STATUS_BEGIN: 'UPDATE_TICKET_STATUS_BEGIN',
  UPDATE_TICKET_STATUS_SUCCESS: 'UPDATE_TICKET_STATUS_SUCCESS',
  UPDATE_TICKET_STATUS_ERR: 'UPDATE_TICKET_STATUS_ERR',

  CREATE_MODULES_BEGIN: 'CREATE_MODULES_BEGIN',
  CREATE_MODULES_SUCCESS: 'CREATE_MODULES_SUCCESS',
  CREATE_MODULES_ERR: 'CREATE_MODULES_ERR',

  GET_MODULES_BEGIN: 'GET_MODULES_BEGIN',
  GET_MODULES_SUCCESS: 'GET_MODULES_SUCCESS',
  GET_MODULES_ERR: 'GET_MODULES_ERR',

  UPDATE_MODULES_BEGIN: 'UPDATE_MODULES_BEGIN',
  UPDATE_MODULES_SUCCESS: 'UPDATE_MODULES_SUCCESS',
  UPDATE_MODULES_ERR: 'UPDATE_MODULES_ERR',

  DELETE_MODULES_BEGIN: 'DELETE_MODULES_BEGIN',
  DELETE_MODULES_SUCCESS: 'DELETE_MODULES_SUCCESS',
  DELETE_MODULES_ERR: 'DELETE_MODULES_ERR',

  VIEW_MODULES_BEGIN: 'VIEW_MODULES_BEGIN',
  VIEW_MODULES_SUCCESS: 'VIEW_MODULES_SUCCESS',
  VIEW_MODULES_ERR: 'VIEW_MODULES_ERR',

  GET_SUB_MODULES_BEGIN: 'GET_SUB_MODULES_BEGIN',
  GET_SUB_MODULES_SUCCESS: 'GET_SUB_MODULES_SUCCESS',
  GET_SUB_MODULES_ERR: 'GET_SUB_MODULES_ERR',

  CREATE_SUB_MODULES_BEGIN: 'CREATE_SUB_MODULES_BEGIN',
  CREATE_SUB_MODULES_SUCCESS: 'CREATE_SUB_MODULES_SUCCESS',
  CREATE_SUB_MODULES_ERR: 'CREATE_SUB_MODULES_ERR',

  UPDATE_SUB_MODULES_BEGIN: 'UPDATE_SUB_MODULES_BEGIN',
  UPDATE_SUB_MODULES_SUCCESS: 'UPDATE_SUB_MODULES_SUCCESS',
  UPDATE_SUB_MODULES_ERR: 'UPDATE_SUB_MODULES_ERR',

  DELETE_SUB_MODULES_BEGIN: 'DELETE_SUB_MODULESS_BEGIN',
  DELETE_SUB_MODULES_SUCCESS: 'DELETE_SUB_MODULES_SUCCESS',
  DELETE_SUB_MODULES_ERR: 'DELETE_SUB_MODULES_ERR',

  GET_SUBUSERS_BEGIN: 'GET_SUBUSERS_BEGIN',
  GET_SUBUSERS_SUCCESS: 'GET_SUBUSERS_SUCCESS',
  GET_SUBUSERS_ERR: 'GET_SUBUSERS_ERR',

  CREATE_SUBUSERS_BEGIN: 'CREATE_SUBUSERS_BEGIN',
  CREATE_SUBUSERS_SUCCESS: 'CREATE_SUBUSERS_SUCCESS',
  CREATE_SUBUSERS_ERR: 'CREATE_SUBUSERS_ERR',

  UPDATE_SUBUSERS_BEGIN: 'UPDATE_SUBUSERS_BEGIN',
  UPDATE_SUBUSERS_SUCCESS: 'UPDATE_SUBUSERS_SUCCESS',
  UPDATE_SUBUSERS_ERR: 'UPDATE_SUBUSERS_ERR',

  DELETE_SUBUSERS_BEGIN: 'DELETE_SUBUSERS_BEGIN',
  DELETE_SUBUSERS_SUCCESS: 'DELETE_SUBUSERS_SUCCESS',
  DELETE_SUBUSERS_ERR: 'DELETE_SUBUSERS_ERR',

  GET_MODULE_SUBMODULE_BEGIN: 'GET_MODULE_SUBMODULE_BEGIN',
  GET_MODULE_SUBMODULE_SUCCESS: 'GET_MODULE_SUBMODULE_SUCCESS',
  GET_MODULE_SUBMODULE_ERR: 'GET_MODULE_SUBMODULE_ERR',

  UPDATE_MODULE_PERMISSION_BEGIN: 'UPDATE_MODULE_PERMISSION_BEGIN',
  UPDATE_MODULE_PERMISSION_SUCCESS: 'UPDATE_MODULE_PERMISSION_SUCCESS',
  UPDATE_MODULE_PERMISSION_ERR: 'UPDATE_MODULE_PERMISSION_ERR',

  GET_MODULE_PERMISSION_DETAILS_BEGIN: 'GET_MODULE_PERMISSION_DETAILS_BEGIN',
  GET_MODULE_PERMISSION_DETAILS_SUCCESS: 'GET_MODULE_PERMISSION_DETAILS_SUCCESS',
  GET_MODULE_PERMISSION_DETAILS_ERR: 'GET_MODULE_PERMISSION_DETAILS_ERR',

  GET_USERS_DETAILS_BEGIN: 'GET_USERS_DETAILS_BEGIN',
  GET_USERS_DETAILS_SUCCESS: 'GET_USERS_DETAILS_SUCCESS',
  GET_USERS_DETAILS_ERR: 'GET_USERS_DETAILS_ERR',

  UPDATE_USERS_DETAILS_BEGIN: 'UPDATE_USERS_DETAILS_BEGIN',
  UPDATE_USERS_DETAILS_SUCCESS: 'UPDATE_USERS_DETAILS_SUCCESS',
  UPDATE_USERS_DETAILS_ERR: 'UPDATE_USERS_DETAILS_ERR',
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

  notificationListBegin: () => ({
    type: actions.NOTIFICATION_LIST_BEGIN,
  }),

  notificationListSuccess: (data) => ({
    type: actions.NOTIFICATION_LIST_SUCCESS,
    data,
  }),

  notificationListErr: (err) => ({
    type: actions.NOTIFICATION_LIST_ERR,
    err,
  }),

  createNotificationBegin: () => ({
    type: actions.CREATE_NOTIFICATION_BEGIN,
  }),

  createNotificationSuccess: (data) => ({
    type: actions.CREATE_NOTIFICATION_SUCCESS,
    data,
  }),

  createNotificationErr: (err) => ({
    type: actions.CREATE_NOTIFICATION_ERR,
    err,
  }),

  deleteNotificationBegin: () => ({
    type: actions.DELETE_NOTIFICATION_BEGIN,
  }),

  deleteNotificationSuccess: (data) => ({
    type: actions.DELETE_NOTIFICATION_SUCCESS,
    data,
  }),

  deleteNotificationErr: (err) => ({
    type: actions.DELETE_NOTIFICATION_ERR,
    err,
  }),

  getTicketsListBegin: () => ({
    type: actions.GET_TICKETS_LISTS_BEGIN,
  }),

  getTicketsListSuccess: (data) => ({
    type: actions.GET_TICKETS_LISTS_SUCCESS,
    data,
  }),

  getTicketsListErr: (err) => ({
    type: actions.GET_TICKETS_LISTS_ERR,
    err,
  }),

  updateTicketStatusBegin: () => ({
    type: actions.UPDATE_TICKET_STATUS_BEGIN,
  }),

  updateTicketStatusSuccess: (data) => ({
    type: actions.UPDATE_TICKET_STATUS_SUCCESS,
    data,
  }),

  updateTicketStatusErr: (err) => ({
    type: actions.UPDATE_TICKET_STATUS_ERR,
    err,
  }),

  createModulesBegin: () => ({
    type: actions.CREATE_MODULES_BEGIN,
  }),

  createModulesSuccess: (data) => ({
    type: actions.CREATE_MODULES_SUCCESS,
    data,
  }),

  createModulesErr: (err) => ({
    type: actions.CREATE_MODULES_ERR,
    err,
  }),

  getModulesBegin: () => ({
    type: actions.GET_MODULES_BEGIN,
  }),

  getModulesSuccess: (data) => ({
    type: actions.GET_MODULES_SUCCESS,
    data,
  }),

  getModulesErr: (err) => ({
    type: actions.GET_MODULES_ERR,
    err,
  }),

  updateModulesBegin: () => ({
    type: actions.UPDATE_MODULES_BEGIN,
  }),

  updateModulesSuccess: (data) => ({
    type: actions.UPDATE_MODULES_SUCCESS,
    data,
  }),

  updateModulesErr: (err) => ({
    type: actions.UPDATE_MODULES_ERR,
    err,
  }),

  deleteModulesBegin: () => ({
    type: actions.DELETE_MODULES_BEGIN,
  }),

  deleteModulesSuccess: (data) => ({
    type: actions.DELETE_MODULES_SUCCESS,
    data,
  }),

  deleteModulesErr: (err) => ({
    type: actions.DELETE_MODULES_ERR,
    err,
  }),

  viewSingleModulesBegin: () => ({
    type: actions.VIEW_MODULES_BEGIN,
  }),

  viewSingleModulesSuccess: (data) => ({
    type: actions.VIEW_MODULES_SUCCESS,
    data,
  }),

  viewSingleModulesErr: (err) => ({
    type: actions.VIEW_MODULES_ERR,
    err,
  }),

  getSubModulesBegin: () => ({
    type: actions.GET_SUB_MODULES_BEGIN,
  }),

  getSubModulesSuccess: (data) => ({
    type: actions.GET_SUB_MODULES_SUCCESS,
    data,
  }),

  getSubModulesErr: (err) => ({
    type: actions.GET_SUB_MODULES_ERR,
    err,
  }),

  createSubModulesBegin: () => ({
    type: actions.CREATE_SUB_MODULES_BEGIN,
  }),

  createSubModulesSuccess: (data) => ({
    type: actions.CREATE_SUB_MODULES_SUCCESS,
    data,
  }),

  createSubModulesErr: (err) => ({
    type: actions.CREATE_SUB_MODULES_ERR,
    err,
  }),

  updateSubModulesBegin: () => ({
    type: actions.UPDATE_SUB_MODULES_BEGIN,
  }),

  updateSubModulesSuccess: (data) => ({
    type: actions.UPDATE_SUB_MODULES_SUCCESS,
    data,
  }),

  updateSubModulesErr: (err) => ({
    type: actions.UPDATE_SUB_MODULES_ERR,
    err,
  }),

  deleteSubModulesBegin: () => ({
    type: actions.DELETE_SUB_MODULES_BEGIN,
  }),

  deleteSubModulesSuccess: (data) => ({
    type: actions.DELETE_SUB_MODULES_SUCCESS,
    data,
  }),

  deleteSubModulesErr: (err) => ({
    type: actions.DELETE_SUB_MODULES_ERR,
    err,
  }),

  getSubUsersBegin: () => ({
    type: actions.GET_SUBUSERS_BEGIN,
  }),

  getSubUsersSuccess: (data) => ({
    type: actions.GET_SUBUSERS_SUCCESS,
    data,
  }),

  getSubUsersErr: (err) => ({
    type: actions.GET_SUBUSERS_ERR,
    err,
  }),

  createSubUsersBegin: () => ({
    type: actions.CREATE_SUBUSERS_BEGIN,
  }),

  createSubUsersSuccess: (data) => ({
    type: actions.CREATE_SUBUSERS_SUCCESS,
    data,
  }),

  createSubUsersErr: (err) => ({
    type: actions.CREATE_SUBUSERS_ERR,
    err,
  }),

  updateSubUsersBegin: () => ({
    type: actions.UPDATE_SUBUSERS_BEGIN,
  }),

  updateSubUsersSuccess: (data) => ({
    type: actions.UPDATE_SUBUSERS_SUCCESS,
    data,
  }),

  updateSubUsersErr: (err) => ({
    type: actions.UPDATE_SUBUSERS_ERR,
    err,
  }),

  deleteSubUsersBegin: () => ({
    type: actions.DELETE_SUBUSERS_BEGIN,
  }),

  deleteSubUsersSuccess: (data) => ({
    type: actions.DELETE_SUBUSERS_SUCCESS,
    data,
  }),

  deleteSubUsersErr: (err) => ({
    type: actions.DELETE_SUBUSERS_ERR,
    err,
  }),

  getModuleSubModuleBegin: () => ({
    type: actions.GET_MODULE_SUBMODULE_BEGIN,
  }),

  getModuleSubModuleSuccess: (data) => ({
    type: actions.GET_MODULE_SUBMODULE_SUCCESS,
    data,
  }),

  getModuleSubModuleErr: (err) => ({
    type: actions.GET_MODULE_SUBMODULE_ERR,
    err,
  }),

  updateModulesPermissionBegin: () => ({
    type: actions.UPDATE_MODULE_PERMISSION_BEGIN,
  }),

  updateModulesPermissionSuccess: (data) => ({
    type: actions.UPDATE_MODULE_PERMISSION_SUCCESS,
    data,
  }),

  updateModulesPermissionErr: (err) => ({
    type: actions.UPDATE_MODULE_PERMISSION_ERR,
    err,
  }),

  getModulePermissionDetailsBegin: () => ({
    type: actions.GET_MODULE_PERMISSION_DETAILS_BEGIN,
  }),

  getModulePermissionDetailsSuccess: (data) => ({
    type: actions.GET_MODULE_PERMISSION_DETAILS_SUCCESS,
    data,
  }),

  getModulePermissionDetailsErr: (err) => ({
    type: actions.GET_MODULE_PERMISSION_DETAILS_ERR,
    err,
  }),

  getusersDetailsBegin: () => ({
    type: actions.GET_USERS_DETAILS_BEGIN,
  }),

  getusersDetailsSuccess: (data) => ({
    type: actions.GET_USERS_DETAILS_SUCCESS,
    data,
  }),

  getusersDetailsErr: (err) => ({
    type: actions.GET_USERS_DETAILS_ERR,
    err,
  }),

  updateUsersDetailsBegin: () => ({
    type: actions.UPDATE_USERS_DETAILS_BEGIN,
  }),

  updateUsersDetailsSuccess: (data) => ({
    type: actions.UPDATE_USERS_DETAILS_SUCCESS,
    data,
  }),

  updateUsersDetailsErr: (err) => ({
    type: actions.UPDATE_USERS_DETAILS_ERR,
    err,
  }),
};

export default actions;
