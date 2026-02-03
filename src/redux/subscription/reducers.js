import actions from './actions';

const {
  CREATE_SUBSCRIPTION_BEGIN,
  CREATE_SUBSCRIPTION_SUCCESS,
  CREATE_SUBSCRIPTION_ERR,
  VERIFY_PAYMENT_BEGIN,
  VERIFY_PAYMENT_SUCCESS,
  VERIFY_PAYMENT_ERR,
  SET_SELECTED_PLAN,
  CLEAR_SELECTED_PLAN,
  RESET_SUBSCRIPTION_STATE,
} = actions;

const initState = {
  selectedPlan: null,
  subscriptionData: null,
  paymentVerified: false,
  loading: false,
  verifyLoading: false,
  error: null,
  verifyError: null,
};

const SubscriptionReducer = (state = initState, action) => {
  const { type, data, err, plan } = action;

  switch (type) {
    case CREATE_SUBSCRIPTION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
        subscriptionData: null,
      };

    case CREATE_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        loading: false,
        subscriptionData: data,
        error: null,
      };

    case CREATE_SUBSCRIPTION_ERR:
      return {
        ...state,
        loading: false,
        error: err,
      };

    case VERIFY_PAYMENT_BEGIN:
      return {
        ...state,
        verifyLoading: true,
        verifyError: null,
        paymentVerified: false,
      };

    case VERIFY_PAYMENT_SUCCESS:
      return {
        ...state,
        verifyLoading: false,
        paymentVerified: true,
        verifyError: null,
      };

    case VERIFY_PAYMENT_ERR:
      return {
        ...state,
        verifyLoading: false,
        paymentVerified: false,
        verifyError: err,
      };

    case SET_SELECTED_PLAN:
      return {
        ...state,
        selectedPlan: plan,
      };

    case CLEAR_SELECTED_PLAN:
      return {
        ...state,
        selectedPlan: null,
      };

    case RESET_SUBSCRIPTION_STATE:
      return {
        ...initState,
      };

    default:
      return state;
  }
};

export default SubscriptionReducer;
