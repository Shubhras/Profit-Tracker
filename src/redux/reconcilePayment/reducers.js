import actions from './actions';

const initialState = {
  reconcileData: [],
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
  unsettledError: null,
  invoiceReconData: [],
  invoiceReconLoading: false,
  invoiceReconError: null,
  vcpReconData: [],
  vcpReconLoading: false,
  vcpReconError: null,
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
        settledData: data,
        settledLoading: false,
      };

    case SETTLED_ORDER_ERR:
      return {
        ...state,
        settledError: err,
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
    default:
      return state;
  }
  // default:
  //   return state;
};

export default reconcilePaymentReducer;
