import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const {
  reconcilePaymentBegin,
  reconcilePaymentSuccess,
  reconcilePaymentErr,
  outstandingPaymentBegin,
  outstandingPaymentSuccess,
  outstandingPaymentErr,
  bankTransferBegin,
  bankTransferSuccess,
  bankTransferErr,
} = actions;

export const getReconcilePaymentSummary = (payload) => {
  return async (dispatch) => {
    dispatch(reconcilePaymentBegin());
    try {
      const response = await DataService.post('/amazon/reconcile-paymentsummary/', payload);
      if (response.data.status === 'success') {
        dispatch(reconcilePaymentSuccess(response.data));
      } else {
        dispatch(reconcilePaymentErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(reconcilePaymentErr(err.response?.data?.message || err.message));
    }
  };
};

export const getOutstandingPayments = (payload) => {
  return async (dispatch) => {
    dispatch(outstandingPaymentBegin());

    try {
      const response = await DataService.post('/amazon/outstanding-payments/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(outstandingPaymentSuccess(response.data));
      } else {
        dispatch(outstandingPaymentErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(outstandingPaymentErr(err));
    }
  };
};

export const getBankTransferSummary = (payload) => {
  return async (dispatch) => {
    dispatch(bankTransferBegin());

    try {
      const response = await DataService.post('/amazon/bank/ransfer-summary/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(bankTransferSuccess(response.data));
      } else {
        dispatch(bankTransferErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(bankTransferErr(err.response?.data?.message || err.message));
    }
  };
};
