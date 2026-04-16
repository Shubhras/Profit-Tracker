import actions from './actions';

const initialState = {
  reconcileData: [],
  loading: false,
  error: null,
  outstandingData: [],
  outstandingLoading: false,
  outstandingError: null,
};

const {
  RECONCILE_PAYMENT_BEGIN,
  RECONCILE_PAYMENT_SUCCESS,
  RECONCILE_PAYMENT_ERR,
  OUTSTANDING_PAYMENT_BEGIN,
  OUTSTANDING_PAYMENT_SUCCESS,
  OUTSTANDING_PAYMENT_ERR,
} = actions;

const reconcilePaymentReducer = (state = initialState, action) => {
  const { type, data, err } = action;
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
      switch (type) {
        // ✅ existing (same as it is)
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

        // 🔥 NEW (outstanding cases)
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

        default:
          return state;
      }
    default:
      return state;
  }
};

export default reconcilePaymentReducer;
