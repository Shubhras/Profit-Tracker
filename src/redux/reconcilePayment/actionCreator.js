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
  quickcomReconBegin,
  quickcomReconSuccess,
  quickcomReconErr,

  feeleaksReconBegin,
  feeleaksReconSuccess,
  feeleaksReconErr,

  amazontransactionBegin,
  amazontransactionSuccess,
  amazontransactionErr,
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
      const response = await DataService.post('/amazon/order-settlement-dashboard/', payload);
      if (response.data.status === true) {
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

export const getQuickComReconciliation = (payload) => {
  return async (dispatch) => {
    dispatch(quickcomReconBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(quickcomReconSuccess(response.data));
      } else {
        dispatch(quickcomReconErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(quickcomReconErr(err.message));
    }
  };
};

export const getFeeleaksconciliation = (payload) => {
  return async (dispatch) => {
    dispatch(feeleaksReconBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(feeleaksReconSuccess(response.data));
      } else {
        dispatch(feeleaksReconErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(feeleaksReconErr(err.message));
    }
  };
};

export const getAmazonTransactionDetail = (page = 1, pageSize = 10) => {
  return async (dispatch) => {
    dispatch(amazontransactionBegin());
    try {
      const response = await DataService.get(`/amazon/amazon-transactions-details/?page=${page}&page_size=${pageSize}`);
      if (response.data.status === true) {
        dispatch(amazontransactionSuccess(response.data));
      } else {
        dispatch(amazontransactionErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(amazontransactionErr(err.response?.data?.message || err.message));
    }
  };
};
