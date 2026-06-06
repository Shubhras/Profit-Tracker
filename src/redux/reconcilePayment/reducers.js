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
  returnAdjustment: [],

  amazontransation: [],
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

  AMAZON_TRANSACTION_BEGIN,
  AMAZON_TRANSACTION_SUCCESS,
  AMAZON_TRANSACTION_ERR,

  ALL_SETTLEMENT_BEGIN,
  ALL_SETTLEMENT_SUCCESS,
  ALL_SETTLEMENT_ERR,

  RETURN_ADJUSTMENT_BEGIN,
  RETURN_ADJUSTMENT_SUCCESS,
  RETURN_ADJUSTMENT_ERR,
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

    case RETURN_ADJUSTMENT_BEGIN:
      return {
        ...state,
        loading: true,
      };

    case RETURN_ADJUSTMENT_SUCCESS:
      return {
        ...state,
        returnAdjustment: data,
        loading: false,
      };

    case RETURN_ADJUSTMENT_ERR:
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
