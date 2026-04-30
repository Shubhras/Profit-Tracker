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

  UNSETTLED_ORDER_BEGIN: 'UNSETTLED_ORDER_BEGIN',
  UNSETTLED_ORDER_SUCCESS: 'UNSETTLED_ORDER_SUCCESS',
  UNSETTLED_ORDER_ERR: 'UNSETTLED_ORDER_ERR',
  INVOICE_RECON_BEGIN: 'INVOICE_RECON_BEGIN',
  INVOICE_RECON_SUCCESS: 'INVOICE_RECON_SUCCESS',
  INVOICE_RECON_ERR: 'INVOICE_RECON_ERR',

  VCP_RECON_BEGIN: 'VCP_RECON_BEGIN',
  VCP_RECON_SUCCESS: 'VCP_RECON_SUCCESS',
  VCP_RECON_ERR: 'VCP_RECON_ERR',

  QUICKCOM_RECON_BEGIN: 'QUICKCOM_RECON_BEGIN',
  QUICKCOM_RECON_SUCCESS: 'QUICKCOM_RECON_SUCCESS',
  QUICKCOM_RECON_ERR: 'QUICKCOM_RECON_ERR',

  FEELEAKS_RECON_BEGIN: 'FEELEAKS_RECON_BEGIN',
  FEELEAKS_RECON_SUCCESS: 'FEELEAKS_RECON_SUCCESS',
  FEELEAKS_RECON_ERR: 'FEELEAKS_RECON_ERR',

  RETURN_SUMMARY_BEGIN: 'RETURN_SUMMARY_BEGIN',
  RETURN_SUMMARY_SUCCESS: 'RETURN_SUMMARY_SUCCESS',
  RETURN_SUMMARY_ERR: 'RETURN_SUMMARY_ERR',

  DOWNLOADS_BEGIN: 'DOWNLOADS_BEGIN',
  DOWNLOADS_SUCCESS: 'DOWNLOADS_SUCCESS',
  DOWNLOADS_ERR: 'DOWNLOADS_ERR',

  ORGANISATION_REPORT_BEGIN: 'ORGANISATION_REPORT_BEGIN',
  ORGANISATION_REPORT_SUCCESS: 'ORGANISATION_REPORT_SUCCESS',
  ORGANISATION_REPORT_ERR: 'ORGANISATION_REPORT_ERR',

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

  unsettledOrderBegin: () => ({
    type: actions.UNSETTLED_ORDER_BEGIN,
  }),

  unsettledOrderSuccess: (data) => ({
    type: actions.UNSETTLED_ORDER_SUCCESS,
    data,
  }),

  unsettledOrderErr: (err) => ({
    type: actions.UNSETTLED_ORDER_ERR,
    err,
  }),
  invoiceReconBegin: () => ({
    type: actions.INVOICE_RECON_BEGIN,
  }),

  invoiceReconSuccess: (data) => ({
    type: actions.INVOICE_RECON_SUCCESS,
    data,
  }),

  invoiceReconErr: (err) => ({
    type: actions.INVOICE_RECON_ERR,
    err,
  }),
  vcpReconBegin: () => ({
    type: actions.VCP_RECON_BEGIN,
  }),

  vcpReconSuccess: (data) => ({
    type: actions.VCP_RECON_SUCCESS,
    data,
  }),

  vcpReconErr: (err) => ({
    type: actions.VCP_RECON_ERR,
    err,
  }),

  quickcomReconBegin: () => ({
    type: actions.QUICKCOM_RECON_BEGIN,
  }),

  quickcomReconSuccess: (data) => ({
    type: actions.QUICKCOM_RECON_SUCCESS,
    data,
  }),

  quickcomReconErr: (err) => ({
    type: actions.QUICKCOM_RECON_ERR,
    err,
  }),

  feeleaksReconBegin: () => ({
    type: actions.FEELEAKS_RECON_BEGIN,
  }),

  feeleaksReconSuccess: (data) => ({
    type: actions.FEELEAKS_RECON_SUCCESS,
    data,
  }),

  feeleaksReconErr: (err) => ({
    type: actions.FEELEAKS_RECON_ERR,
    err,
  }),

  returnsummaryBegin: () => ({
    type: actions.RETURN_SUMMARY_BEGIN,
  }),

  returnsummarySuccess: (data) => ({
    type: actions.RETURN_SUMMARY_SUCCESS,
    data,
  }),

  returnsummaryErr: (err) => ({
    type: actions.RETURN_SUMMARY_ERR,
    err,
  }),

  downloadsBegin: () => ({
    type: actions.DOWNLOADS_BEGIN,
  }),

  downloadsSuccess: (data) => ({
    type: actions.DOWNLOADS_SUCCESS,
    data,
  }),

  downloadsErr: (err) => ({
    type: actions.DOWNLOADS_ERR,
    err,
  }),

  organisationreportBegin: () => ({
    type: actions.ORGANISATION_REPORT_BEGIN,
  }),

  organisationreportSuccess: (data) => ({
    type: actions.ORGANISATION_REPORT_SUCCESS,
    data,
  }),

  organisationreportErr: (err) => ({
    type: actions.ORGANISATION_REPORT_ERR,
    err,
  }),
};

export default actions;
