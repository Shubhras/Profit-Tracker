import actions from './actions';

const initialState = {
  reconcileData: [],
  loading: false,
  error: null,
};

const { RECONCILE_PAYMENT_BEGIN, RECONCILE_PAYMENT_SUCCESS, RECONCILE_PAYMENT_ERR } = actions;

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
    default:
      return state;
  }
};

export default reconcilePaymentReducer;
