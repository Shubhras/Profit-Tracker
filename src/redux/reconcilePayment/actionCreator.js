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

  amazontransactionBegin,
  amazontransactionSuccess,
  amazontransactionErr,

  allsettlementBegin,
  allsettlementSuccess,
  allsettlementErr,

  returnAdjustmentBegin,
  returnAdjustmentSuccess,
  returnAdjustmentErr,
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

export const getSettledOrders = (page = 1, pageSize = 10) => {
  return async (dispatch) => {
    dispatch(settledOrderBegin());

    try {
      const response = await DataService.get(`/amazon/order-settlement-dashboard/?page=${page}&page_size=${pageSize}`);
      if (response.data.success === true) {
        dispatch(settledOrderSuccess(response.data));
      } else {
        dispatch(settledOrderErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(settledOrderErr(err.response?.data?.message || err.message));
    }
  };
};

export const getAmazonTransactionDetail = (
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  details = false,
  search = '',
  transactionStatus = '',
  transactionType = '',
) => {
  return async (dispatch) => {
    dispatch(amazontransactionBegin());
    try {
      // const response = await DataService.get(`/amazon/amazon-transactions-details/?page=${page}&page_size=${pageSize}`);
      // const response = await DataService.get(
      //   `/amazon/grouped-transactions/?page=${page}&page_size=${pageSize}&start_date=${startDate}&end_date=${endDate}&details=${details}&search=${search}`,
      // );

      const response = await DataService.get(
        `/amazon/grouped-transactions/?page=${page}
        &page_size=${pageSize}
        &start_date=${startDate}
        &end_date=${endDate}
        &details=${details}
        &search=${search}
        &transaction_status=${transactionStatus}
        &transaction_type=${transactionType}`.replace(/\s+/g, ''),
      );

      console.log('API RESPONSE', response.data);
      if (response.data.success === true) {
        dispatch(amazontransactionSuccess(response.data));
      } else {
        dispatch(amazontransactionErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(amazontransactionErr(err.response?.data?.message || err.message));
    }
  };
};

export const getAllSettlement = (params = {}) => {
  return async (dispatch) => {
    dispatch(allsettlementBegin());

    try {
      const query = new URLSearchParams(params).toString();

      const response = await DataService.get(`/amazon/settlement-summary/?${query}`);

      if (response.data.success) {
        dispatch(allsettlementSuccess(response.data));
      } else {
        dispatch(allsettlementErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(allsettlementErr(err.response?.data?.message || err.message));
    }
  };
};

export const getReturnsAdjustment = (
  page = 1,
  pageSize = 10,
  search = '',
  status = '',
  startDate = '',
  endDate = '',
) => {
  return async (dispatch) => {
    dispatch(returnAdjustmentBegin());
    try {
      let url = `/amazon/refund-transactions/?page=${page}&page_size=${pageSize}`;

      if (search) {
        url += `&search=${search}`;
      }

      if (status) {
        url += `&transaction_status=${status}`;
      }

      if (startDate) {
        url += `&start_date=${startDate}`;
      }

      if (endDate) {
        url += `&end_date=${endDate}`;
      }

      const response = await DataService.get(url);

      if (response.data.success) {
        dispatch(returnAdjustmentSuccess(response.data));
      } else {
        dispatch(returnAdjustmentErr(response.data.message));
      }
    } catch (err) {
      dispatch(returnAdjustmentErr(err.response?.data?.message || err.message));
    }
  };
};
