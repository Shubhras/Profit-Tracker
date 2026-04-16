const actions = {
  RECONCILE_PAYMENT_BEGIN: 'RECONCILE_PAYMENT_BEGIN',
  RECONCILE_PAYMENT_SUCCESS: 'RECONCILE_PAYMENT_SUCCESS',
  RECONCILE_PAYMENT_ERR: 'RECONCILE_PAYMENT_ERR',

  OUTSTANDING_PAYMENT_BEGIN: 'OUTSTANDING_PAYMENT_BEGIN',
  OUTSTANDING_PAYMENT_SUCCESS: 'OUTSTANDING_PAYMENT_SUCCESS',
  OUTSTANDING_PAYMENT_ERR: 'OUTSTANDING_PAYMENT_ERR',

  reconcilePaymentBegin: () => {
    return {
      type: actions.RECONCILE_PAYMENT_BEGIN,
    };
  },

  reconcilePaymentSuccess: (data) => {
    return {
      type: actions.RECONCILE_PAYMENT_SUCCESS,
      data,
    };
  },

  reconcilePaymentErr: (err) => {
    return {
      type: actions.RECONCILE_PAYMENT_ERR,
      err,
    };
  },
  outstandingPaymentBegin: () => ({
    type: actions.OUTSTANDING_PAYMENT_BEGIN,
  }),

  outstandingPaymentSuccess: (data) => ({
    type: actions.OUTSTANDING_PAYMENT_SUCCESS,
    data,
  }),

  outstandingPaymentErr: (err) => ({
    type: actions.OUTSTANDING_PAYMENT_ERR,
    err,
  }),
};

export default actions;
