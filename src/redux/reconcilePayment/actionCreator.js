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
  settledOrderBegin,
  settledOrderSuccess,
  settledOrderErr,
  unsettledOrderBegin,
  unsettledOrderSuccess,
  unsettledOrderErr,
  invoiceReconBegin,
  invoiceReconSuccess,
  invoiceReconErr,
  vcpReconBegin,
  vcpReconSuccess,
  vcpReconErr,
} = actions;

const mockService = async (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          status: 'success',
          data: [
            {
              id: 1,
              name: payload?.name || 'Demo',
              amount: payload?.amount || 100,
            },
          ],
        },
      });
    }, 500);
  });
};
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

export const getSettledOrders = (payload) => {
  return async (dispatch) => {
    dispatch(settledOrderBegin());

    try {
      const response = await mockService(payload);
      if (response.data.status === 'success') {
        dispatch(settledOrderSuccess(response.data));
      } else {
        dispatch(settledOrderErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(settledOrderErr(err.response?.data?.message || err.message));
    }
  };
};

export const getUnsettledOrders = (payload) => {
  return async (dispatch) => {
    dispatch(unsettledOrderBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(unsettledOrderSuccess(response.data));
      } else {
        dispatch(unsettledOrderErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(unsettledOrderErr(err.response?.data?.message || err.message));
    }
  };
};

export const getInvoiceReconciliation = (payload) => {
  return async (dispatch) => {
    dispatch(invoiceReconBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(invoiceReconSuccess(response.data));
      } else {
        dispatch(invoiceReconErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(invoiceReconErr(err.message));
    }
  };
};

export const getVcpReconciliation = (payload) => {
  return async (dispatch) => {
    dispatch(vcpReconBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(vcpReconSuccess(response.data));
      } else {
        dispatch(vcpReconErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(vcpReconErr(err.message));
    }
  };
};
