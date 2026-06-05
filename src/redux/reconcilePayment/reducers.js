import actions from './actions';

const initialState = {
  reconcileData: [],
  allsettlementData: [],
  loading: false,
  error: null,
  outstandingData: [],
  outstandingLoading: false,
  outstandingError: null,
  bankTransferData: [],
  bankTransferLoading: false,
  bankTransferError: null,
  settledData: [],
  settledLoading: false,
  settledError: null,
  unsettledData: [],
  unsettledLoading: false,
  amazontransation: [],
  unsettledError: null,
  invoiceReconData: [],
  invoiceReconLoading: false,
  invoiceReconError: null,
  vcpReconData: [],
  vcpReconLoading: false,
  vcpReconError: null,
  quickcomReconData: [],
  quickcomReconLoading: false,
  quickcomReconError: null,

  feeleaksReconData: [],
  feeleaksReconLoading: false,
  feeleaksReconError: null,
};

const {
  RECONCILE_PAYMENT_BEGIN,
  RECONCILE_PAYMENT_SUCCESS,
  RECONCILE_PAYMENT_ERR,
  OUTSTANDING_PAYMENT_BEGIN,
  OUTSTANDING_PAYMENT_SUCCESS,
  OUTSTANDING_PAYMENT_ERR,
  BANK_TRANSFER_BEGIN,
  BANK_TRANSFER_SUCCESS,
  BANK_TRANSFER_ERR,
  SETTLED_ORDER_BEGIN,
  SETTLED_ORDER_SUCCESS,
  SETTLED_ORDER_ERR,
  UNSETTLED_ORDER_BEGIN,
  UNSETTLED_ORDER_SUCCESS,
  UNSETTLED_ORDER_ERR,
  INVOICE_RECON_BEGIN,
  INVOICE_RECON_SUCCESS,
  INVOICE_RECON_ERR,
  VCP_RECON_BEGIN,
  VCP_RECON_SUCCESS,
  VCP_RECON_ERR,

  QUICKCOM_RECON_BEGIN,
  QUICKCOM_RECON_SUCCESS,
  QUICKCOM_RECON_ERR,

  FEELEAKS_RECON_BEGIN,
  FEELEAKS_RECON_SUCCESS,
  FEELEAKS_RECON_ERR,

  AMAZON_TRANSACTION_BEGIN,
  AMAZON_TRANSACTION_SUCCESS,
  AMAZON_TRANSACTION_ERR,

  ALL_SETTLEMENT_BEGIN,
  ALL_SETTLEMENT_SUCCESS,
  ALL_SETTLEMENT_ERR,
} = actions;

const reconcilePaymentReducer = (state = initialState, action) => {
  const { type, data, err } = action;
  // switch (type) {
  //   case RECONCILE_PAYMENT_BEGIN:
  //     return {
  //       ...state,
  //       loading: true,
  //     };
  //   case RECONCILE_PAYMENT_SUCCESS:
  //     return {
  //       ...state,
  //       reconcileData: data,
  //       loading: false,
  //     };
  //   case RECONCILE_PAYMENT_ERR:
  //     return {
  //       ...state,
  //       error: err,
  //       loading: false,
  //     };
  switch (type) {
    case RECONCILE_PAYMENT_BEGIN:
      return {
        ...state,
        loading: true,
      };

    case RECONCILE_PAYMENT_SUCCESS:
      return {
        ...state,
        reconcileData: data,
        loading: false,
      };

    case RECONCILE_PAYMENT_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case OUTSTANDING_PAYMENT_BEGIN:
      return {
        ...state,
        outstandingLoading: true,
      };

    case OUTSTANDING_PAYMENT_SUCCESS:
      return {
        ...state,
        outstandingData: data,
        outstandingLoading: false,
      };

    case OUTSTANDING_PAYMENT_ERR:
      return {
        ...state,
        outstandingError: err,
        outstandingLoading: false,
      };

    case BANK_TRANSFER_BEGIN:
      return {
        ...state,
        bankTransferLoading: true,
      };

    case BANK_TRANSFER_SUCCESS:
      return {
        ...state,
        bankTransferData: data,
        bankTransferLoading: false,
      };

    case BANK_TRANSFER_ERR:
      return {
        ...state,
        bankTransferError: err,
        bankTransferLoading: false,
      };
    case SETTLED_ORDER_BEGIN:
      return {
        ...state,
        settledLoading: true,
      };

    case SETTLED_ORDER_SUCCESS:
      return {
        ...state,
        settledData: action.data,
        settledLoading: false,
      };

    case SETTLED_ORDER_ERR:
      return {
        ...state,
        settledError: action.err,
        settledLoading: false,
      };

    case UNSETTLED_ORDER_BEGIN:
      return {
        ...state,
        unsettledLoading: true,
      };

    case UNSETTLED_ORDER_SUCCESS:
      return {
        ...state,
        unsettledData: data,
        unsettledLoading: false,
      };

    case UNSETTLED_ORDER_ERR:
      return {
        ...state,
        unsettledError: err,
        unsettledLoading: false,
      };
    case INVOICE_RECON_BEGIN:
      return {
        ...state,
        invoiceReconLoading: true,
      };

    case INVOICE_RECON_SUCCESS:
      return {
        ...state,
        invoiceReconData: data,
        invoiceReconLoading: false,
      };

    case INVOICE_RECON_ERR:
      return {
        ...state,
        invoiceReconError: err,
        invoiceReconLoading: false,
      };
    case VCP_RECON_BEGIN:
      return {
        ...state,
        vcpReconLoading: true,
      };

    case VCP_RECON_SUCCESS:
      return {
        ...state,
        vcpReconData: data,
        vcpReconLoading: false,
      };

    case VCP_RECON_ERR:
      return {
        ...state,
        vcpReconError: err,
        vcpReconLoading: false,
      };

    case QUICKCOM_RECON_BEGIN:
      return {
        ...state,
        quickcomReconLoading: true,
      };

    case QUICKCOM_RECON_SUCCESS:
      return {
        ...state,
        quickcomReconData: data,
        quickcomReconLoading: false,
      };

    case QUICKCOM_RECON_ERR:
      return {
        ...state,
        quickcomReconError: err,
        quickcomReconLoading: false,
      };

    case FEELEAKS_RECON_BEGIN:
      return {
        ...state,
        feeleaksReconLoading: true,
      };

    case FEELEAKS_RECON_SUCCESS:
      return {
        ...state,
        feeleaksReconData: data,
        feeleaksReconLoading: false,
      };

    case FEELEAKS_RECON_ERR:
      return {
        ...state,
        feeleaksReconError: err,
        feeleaksReconLoading: false,
      };

    case AMAZON_TRANSACTION_BEGIN:
      return {
        ...state,
        loading: true,
      };

    case AMAZON_TRANSACTION_SUCCESS:
      return {
        ...state,
        amazontransation: action.data,
        loading: false,
      };

    case AMAZON_TRANSACTION_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case ALL_SETTLEMENT_BEGIN:
      return {
        ...state,
        loading: true,
      };

    case ALL_SETTLEMENT_SUCCESS:
      return {
        ...state,
        allsettlementData: data,
        loading: false,
      };

    case ALL_SETTLEMENT_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
  // default:
  //   return state;
};

export default reconcilePaymentReducer;
