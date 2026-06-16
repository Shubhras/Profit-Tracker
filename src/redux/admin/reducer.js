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
  getuserlist: null,
  updatePolicy: null,
  deletepolicy: null,
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
    default:
      return state;
  }
};

export default AdmindashboardReducer;
