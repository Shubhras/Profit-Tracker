const subscriptionActions = {
  // Subscription creation actions
  CREATE_SUBSCRIPTION_BEGIN: 'CREATE_SUBSCRIPTION_BEGIN',
  CREATE_SUBSCRIPTION_SUCCESS: 'CREATE_SUBSCRIPTION_SUCCESS',
  CREATE_SUBSCRIPTION_ERR: 'CREATE_SUBSCRIPTION_ERR',

  // Verify payment actions
  VERIFY_PAYMENT_BEGIN: 'VERIFY_PAYMENT_BEGIN',
  VERIFY_PAYMENT_SUCCESS: 'VERIFY_PAYMENT_SUCCESS',
  VERIFY_PAYMENT_ERR: 'VERIFY_PAYMENT_ERR',

  // Selected plan actions
  SET_SELECTED_PLAN: 'SET_SELECTED_PLAN',
  CLEAR_SELECTED_PLAN: 'CLEAR_SELECTED_PLAN',

  // Reset subscription state
  RESET_SUBSCRIPTION_STATE: 'RESET_SUBSCRIPTION_STATE',

  // Action creators
  createSubscriptionBegin: () => ({
    type: subscriptionActions.CREATE_SUBSCRIPTION_BEGIN,
  }),

  createSubscriptionSuccess: (data) => ({
    type: subscriptionActions.CREATE_SUBSCRIPTION_SUCCESS,
    data,
  }),

  createSubscriptionErr: (err) => ({
    type: subscriptionActions.CREATE_SUBSCRIPTION_ERR,
    err,
  }),

  verifyPaymentBegin: () => ({
    type: subscriptionActions.VERIFY_PAYMENT_BEGIN,
  }),

  verifyPaymentSuccess: (data) => ({
    type: subscriptionActions.VERIFY_PAYMENT_SUCCESS,
    data,
  }),

  verifyPaymentErr: (err) => ({
    type: subscriptionActions.VERIFY_PAYMENT_ERR,
    err,
  }),

  setSelectedPlan: (plan) => ({
    type: subscriptionActions.SET_SELECTED_PLAN,
    plan,
  }),

  clearSelectedPlan: () => ({
    type: subscriptionActions.CLEAR_SELECTED_PLAN,
  }),

  resetSubscriptionState: () => ({
    type: subscriptionActions.RESET_SUBSCRIPTION_STATE,
  }),
};

export default subscriptionActions;
