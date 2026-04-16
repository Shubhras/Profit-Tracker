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

    default:
      return state;
  }
  // default:
  //   return state;
};

export default reconcilePaymentReducer;
