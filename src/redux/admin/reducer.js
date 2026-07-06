import actions from './actions';

const {
  CREATE_COUPONCODE_BEGIN,
  CREATE_COUPONCODE_SUCCESS,
  CREATE_COUPONCODE_ERR,

  GET_COUPONCODE_BEGIN,
  GET_COUPONCODE_SUCCESS,
  GET_COUPONCODE_ERR,

  DELETE_COUPONCODE_BEGIN,
  DELETE_COUPONCODE_SUCCESS,
  DELETE_COUPONCODE_ERR,

  UPDATE_COUPONCODE_BEGIN,
  UPDATE_COUPONCODE_SUCCESS,
  UPDATE_COUPONCODE_ERR,

  ADMIN_DASHBOARD_BEGIN,
  ADMIN_DASHBOARD_SUCCESS,
  ADMIN_DASHBOARD_ERR,

  SUBSCRIPTION_LIST_BEGIN,
  SUBSCRIPTION_LIST_SUCCESS,
  SUBSCRIPTION_LIST_ERR,

  CREATE_SUBSCRIPTION_BEGIN,
  CREATE_SUBSCRIPTION_SUCCESS,
  CREATE_SUBSCRIPTION_ERR,

  DELETE_SUBSCRIPTION_BEGIN,
  DELETE_SUBSCRIPTION_SUCCESS,
  DELETE_SUBSCRIPTION_ERR,

  UPDATE_SUBSCRIPTION_BEGIN,
  UPDATE_SUBSCRIPTION_SUCCESS,
  UPDATE_SUBSCRIPTION_ERR,

  GET_PRIVACY_POLICY_BEGIN,
  GET_PRIVACY_POLICY_SUCCESS,
  GET_PRIVACY_POLICY_ERR,

  CREATE_PRIVACY_POLICY_BEGIN,
  CREATE_PRIVACY_POLICY_SUCCESS,
  CREATE_PRIVACY_POLICY_ERR,

  UPDATE_PRIVACY_POLICY_BEGIN,
  UPDATE_PRIVACY_POLICY_SUCCESS,
  UPDATE_PRIVACY_POLICY_ERR,

  DELETE_PRIVACY_POLICY_BEGIN,
  DELETE_PRIVACY_POLICY_SUCCESS,
  DELETE_PRIVACY_POLICY_ERR,

  USERS_LIST_BEGIN,
  USERS_LIST_SUCCESS,
  USERS_LIST_ERR,

  NOTIFICATION_LIST_BEGIN,
  NOTIFICATION_LIST_SUCCESS,
  NOTIFICATION_LIST_ERR,

  CREATE_NOTIFICATION_BEGIN,
  CREATE_NOTIFICATION_SUCCESS,
  CREATE_NOTIFICATION_ERR,

  DELETE_NOTIFICATION_BEGIN,
  DELETE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_ERR,

  GET_TICKETS_LISTS_BEGIN,
  GET_TICKETS_LISTS_SUCCESS,
  GET_TICKETS_LISTS_ERR,

  UPDATE_TICKET_STATUS_BEGIN,
  UPDATE_TICKET_STATUS_SUCCESS,
  UPDATE_TICKET_STATUS_ERR,

  CREATE_MODULES_BEGIN,
  CREATE_MODULES_SUCCESS,
  CREATE_MODULES_ERR,

  GET_MODULES_BEGIN,
  GET_MODULES_SUCCESS,
  GET_MODULES_ERR,

  UPDATE_MODULES_BEGIN,
  UPDATE_MODULES_SUCCESS,
  UPDATE_MODULES_ERR,

  DELETE_MODULES_BEGIN,
  DELETE_MODULES_SUCCESS,
  DELETE_MODULES_ERR,

  GET_SUB_MODULES_BEGIN,
  GET_SUB_MODULES_SUCCESS,
  GET_SUB_MODULES_ERR,

  CREATE_SUB_MODULES_BEGIN,
  CREATE_SUB_MODULES_SUCCESS,
  CREATE_SUB_MODULES_ERR,

  UPDATE_SUB_MODULES_BEGIN,
  UPDATE_SUB_MODULES_SUCCESS,
  UPDATE_SUB_MODULES_ERR,

  DELETE_SUB_MODULES_BEGIN,
  DELETE_SUB_MODULES_SUCCESS,
  DELETE_SUB_MODULES_ERR,

  GET_SUBUSERS_BEGIN,
  GET_SUBUSERS_SUCCESS,
  GET_SUBUSERS_ERR,

  CREATE_SUBUSERS_BEGIN,
  CREATE_SUBUSERS_SUCCESS,
  CREATE_SUBUSERS_ERR,

  UPDATE_SUBUSERS_BEGIN,
  UPDATE_SUBUSERS_SUCCESS,
  UPDATE_SUBUSERS_ERR,

  DELETE_SUBUSERS_BEGIN,
  DELETE_SUBUSERS_SUCCESS,
  DELETE_SUBUSERS_ERR,

  GET_MODULE_SUBMODULE_BEGIN,
  GET_MODULE_SUBMODULE_SUCCESS,
  GET_MODULE_SUBMODULE_ERR,

  UPDATE_MODULE_PERMISSION_BEGIN,
  UPDATE_MODULE_PERMISSION_SUCCESS,
  UPDATE_MODULE_PERMISSION_ERR,

  GET_MODULE_PERMISSION_DETAILS_BEGIN,
  GET_MODULE_PERMISSION_DETAILS_SUCCESS,
  GET_MODULE_PERMISSION_DETAILS_ERR,
} = actions;

const initialState = {
  loading: false,
  createcouponcodedata: null,
  getcouponCodeData: null,
  deleteCouponCode: null,
  updateCouponCode: null,
  getadmindashboard: null,
  getsubscriptionData: null,
  createSubscription: null,
  deleteSubscription: null,
  updateSubscription: null,
  privacypolicyData: null,
  createPrivacyPolicy: null,
  getTicketsLists: null,
  updateModule: null,
  deleteModule: null,
  viewsingleModule: null,
  getuserlist: null,
  getModuleslist: null,
  getsubModule: null,
  updateSubModules: null,
  createSubModule: null,
  deleteSubModules: null,
  getSubUserslist: null,
  updateSubUsers: null,
  deleteSubUsers: null,
  createSubUsers: null,
  getnotificationlist: null,
  createNotification: null,
  deleteNotification: null,
  updatePolicy: null,
  deletepolicy: null,
  getModuleSubmodules: null,
  updateModulePermission: null,
  modulePermissionsDetails: null,
};

const AdmindashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_COUPONCODE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_COUPONCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        createcouponcodedata: action.data,
      };

    case CREATE_COUPONCODE_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_COUPONCODE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_COUPONCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        getcouponCodeData: action.data,
      };

    case GET_COUPONCODE_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case DELETE_COUPONCODE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_COUPONCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteCouponCode: action.data,
      };

    case DELETE_COUPONCODE_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case UPDATE_COUPONCODE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_COUPONCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        updateCouponCode: action.data,
      };

    case UPDATE_COUPONCODE_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case ADMIN_DASHBOARD_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ADMIN_DASHBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        getadmindashboard: action.data,
      };

    case ADMIN_DASHBOARD_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case SUBSCRIPTION_LIST_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SUBSCRIPTION_LIST_SUCCESS:
      console.log('ACTION =>', action);
      return {
        ...state,
        loading: false,
        getsubscriptionData: action.data,
      };

    case SUBSCRIPTION_LIST_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case CREATE_SUBSCRIPTION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        loading: false,
        createSubscription: action.data,
      };

    case CREATE_SUBSCRIPTION_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case DELETE_SUBSCRIPTION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteSubscription: action.data,
      };

    case DELETE_SUBSCRIPTION_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case UPDATE_SUBSCRIPTION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        loading: false,
        updateSubscription: action.data,
      };

    case UPDATE_SUBSCRIPTION_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_PRIVACY_POLICY_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_PRIVACY_POLICY_SUCCESS:
      return {
        ...state,
        loading: false,
        privacypolicyData: action.data,
      };

    case GET_PRIVACY_POLICY_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case CREATE_PRIVACY_POLICY_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_PRIVACY_POLICY_SUCCESS:
      return {
        ...state,
        loading: false,
        createPrivacyPolicy: action.data,
      };

    case CREATE_PRIVACY_POLICY_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case UPDATE_PRIVACY_POLICY_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_PRIVACY_POLICY_SUCCESS:
      return {
        ...state,
        loading: false,
        updatePolicy: action.data,
      };

    case UPDATE_PRIVACY_POLICY_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case DELETE_PRIVACY_POLICY_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_PRIVACY_POLICY_SUCCESS:
      return {
        ...state,
        loading: false,
        deletepolicy: action.data,
      };

    case DELETE_PRIVACY_POLICY_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case USERS_LIST_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case USERS_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        getuserlist: action.data,
      };

    case USERS_LIST_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case NOTIFICATION_LIST_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case NOTIFICATION_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        getnotificationlist: action.data,
      };

    case NOTIFICATION_LIST_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case CREATE_NOTIFICATION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        createNotification: action.data,
      };

    case CREATE_NOTIFICATION_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case DELETE_NOTIFICATION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteNotification: action.data,
      };

    case DELETE_NOTIFICATION_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_TICKETS_LISTS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_TICKETS_LISTS_SUCCESS:
      return {
        ...state,
        loading: false,
        getTicketsLists: action.data,
      };

    case GET_TICKETS_LISTS_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case UPDATE_TICKET_STATUS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_TICKET_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        updateticketStatus: action.data,
      };

    case UPDATE_TICKET_STATUS_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case CREATE_MODULES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_MODULES_SUCCESS:
      return {
        ...state,
        loading: false,
        createModules: action.data,
      };

    case CREATE_MODULES_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_MODULES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_MODULES_SUCCESS:
      return {
        ...state,
        loading: false,
        getModuleslist: action.data,
      };

    case GET_MODULES_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case UPDATE_MODULES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_MODULES_SUCCESS:
      return {
        ...state,
        loading: false,
        updateModule: action.data,
      };

    case UPDATE_MODULES_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case DELETE_MODULES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_MODULES_SUCCESS:
      return {
        ...state,
        loading: false,
        viewsingleModule: action.data,
      };

    case DELETE_MODULES_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_SUB_MODULES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_SUB_MODULES_SUCCESS:
      return {
        ...state,
        loading: false,
        getsubModule: action.data,
      };

    case GET_SUB_MODULES_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case CREATE_SUB_MODULES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_SUB_MODULES_SUCCESS:
      return {
        ...state,
        loading: false,
        createSubModule: action.data,
      };

    case CREATE_SUB_MODULES_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case UPDATE_SUB_MODULES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_SUB_MODULES_SUCCESS:
      return {
        ...state,
        loading: false,
        updateSubModules: action.data,
      };

    case UPDATE_SUB_MODULES_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case DELETE_SUB_MODULES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_SUB_MODULES_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteSubModules: action.data,
      };

    case DELETE_SUB_MODULES_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_SUBUSERS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_SUBUSERS_SUCCESS:
      return {
        ...state,
        loading: false,
        getSubUserslist: action.data,
      };

    case GET_SUBUSERS_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case CREATE_SUBUSERS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_SUBUSERS_SUCCESS:
      return {
        ...state,
        loading: false,
        createSubUsers: action.data,
      };

    case CREATE_SUBUSERS_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case UPDATE_SUBUSERS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_SUBUSERS_SUCCESS:
      return {
        ...state,
        loading: false,
        updateSubUsers: action.data,
      };

    case UPDATE_SUBUSERS_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case DELETE_SUBUSERS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_SUBUSERS_SUCCESS:
      return {
        ...state,
        loading: false,
        deleteSubUsers: action.data,
      };

    case DELETE_SUBUSERS_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_MODULE_SUBMODULE_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_MODULE_SUBMODULE_SUCCESS:
      return {
        ...state,
        loading: false,
        getModuleSubmodules: action.data,
      };

    case GET_MODULE_SUBMODULE_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case UPDATE_MODULE_PERMISSION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_MODULE_PERMISSION_SUCCESS:
      return {
        ...state,
        loading: false,
        updateModulePermission: action.data,
      };

    case UPDATE_MODULE_PERMISSION_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_MODULE_PERMISSION_DETAILS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_MODULE_PERMISSION_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        modulePermissionsDetails: action.data,
      };

    case GET_MODULE_PERMISSION_DETAILS_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };
    default:
      return state;
  }
};

export default AdmindashboardReducer;
