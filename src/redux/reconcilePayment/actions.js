const actions = {
  RECONCILE_PAYMENT_BEGIN: 'RECONCILE_PAYMENT_BEGIN',
  RECONCILE_PAYMENT_SUCCESS: 'RECONCILE_PAYMENT_SUCCESS',
  RECONCILE_PAYMENT_ERR: 'RECONCILE_PAYMENT_ERR',

  OUTSTANDING_PAYMENT_BEGIN: 'OUTSTANDING_PAYMENT_BEGIN',
  OUTSTANDING_PAYMENT_SUCCESS: 'OUTSTANDING_PAYMENT_SUCCESS',
  OUTSTANDING_PAYMENT_ERR: 'OUTSTANDING_PAYMENT_ERR',

  BANK_TRANSFER_BEGIN: 'BANK_TRANSFER_BEGIN',
  BANK_TRANSFER_SUCCESS: 'BANK_TRANSFER_SUCCESS',
  BANK_TRANSFER_ERR: 'BANK_TRANSFER_ERR',

  SETTLED_ORDER_BEGIN: 'SETTLED_ORDER_BEGIN',
  SETTLED_ORDER_SUCCESS: 'SETTLED_ORDER_SUCCESS',
  SETTLED_ORDER_ERR: 'SETTLED_ORDER_ERR',

  AMAZON_TRANSACTION_BEGIN: 'AMAZON_TRANSACTION_BEGIN',
  AMAZON_TRANSACTION_SUCCESS: 'AMAZON_TRANSACTION_SUCCESS',
  AMAZON_TRANSACTION_ERR: 'AMAZON_TRANSACTION_ERR',

  ALL_SETTLEMENT_BEGIN: 'ALL_SETTLEMENT_BEGIN',
  ALL_SETTLEMENT_SUCCESS: 'ALL_SETTLEMENT_SUCCESS',
  ALL_SETTLEMENT_ERR: 'ALL_SETTLEMENT_ERR',

  RETURN_ADJUSTMENT_BEGIN: 'RETURN_ADJUSTMENT_BEGIN',
  RETURN_ADJUSTMENT_SUCCESS: 'RETURN_ADJUSTMENT_SUCCESS',
  RETURN_ADJUSTMENT_ERR: 'RETURN_ADJUSTMENT_ERR',

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

  bankTransferBegin: () => ({
    type: actions.BANK_TRANSFER_BEGIN,
  }),

  bankTransferSuccess: (data) => ({
    type: actions.BANK_TRANSFER_SUCCESS,
    data,
  }),

  bankTransferErr: (err) => ({
    type: actions.BANK_TRANSFER_ERR,
    err,
  }),
  settledOrderBegin: () => ({
    type: actions.SETTLED_ORDER_BEGIN,
  }),

  settledOrderSuccess: (data) => ({
    type: actions.SETTLED_ORDER_SUCCESS,
    data,
  }),

  settledOrderErr: (err) => ({
    type: actions.SETTLED_ORDER_ERR,
    err,
  }),

  amazontransactionBegin: () => ({
    type: actions.AMAZON_TRANSACTION_BEGIN,
  }),

  amazontransactionSuccess: (data) => ({
    type: actions.AMAZON_TRANSACTION_SUCCESS,
    data,
  }),

  amazontransactionErr: (err) => ({
    type: actions.AMAZON_TRANSACTION_ERR,
    err,
  }),

  allsettlementBegin: () => ({
    type: actions.ALL_SETTLEMENT_BEGIN,
  }),

  allsettlementSuccess: (data) => ({
    type: actions.ALL_SETTLEMENT_SUCCESS,
    data,
  }),

  allsettlementErr: (err) => ({
    type: actions.ALL_SETTLEMENT_ERR,
    err,
  }),

  returnAdjustmentBegin: () => ({
    type: actions.RETURN_ADJUSTMENT_BEGIN,
  }),

  returnAdjustmentSuccess: (data) => ({
    type: actions.RETURN_ADJUSTMENT_SUCCESS,
    data,
  }),

  returnAdjustmentErr: (err) => ({
    type: actions.RETURN_ADJUSTMENT_ERR,
    err,
  }),
};

export default actions;
