import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const {
  overviewsettingBegin,
  overviewsettingSuccess,
  overviewsettingErr,

  productconfigBegin,
  productconfigSuccess,
  productconfigErr,

  otherexpensesBegin,
  otherexpensesSuccess,
  otherexpensesErr,

  cashbackBegin,
  cashbackSuccess,
  cashbackErr,

  exceptionrulesBegin,
  exceptionrulesSuccess,
  exceptionrulesErr,

  configreconcileBegin,
  configreconcileSuccess,
  configreconcileErr,

  getchannelsBegin,
  getchannelsSuccess,
  getchannelsErr,

  userinfoBegin,
  userinfoSuccess,
  userinfoErr,
  adduserBegin,
  adduserSuccess,
  adduserErr,

  exportproductconfigurationBegin,
  exportproductconfigurationSuccess,
  exportproductconfigurationErr,

  uploadproductconfigurationBegin,
  uploadproductconfigurationSuccess,
  uploadproductconfigurationErr,
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

export const getOverviewSettings = (payload) => {
  return async (dispatch) => {
    dispatch(overviewsettingBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(overviewsettingSuccess(response.data));
      } else {
        dispatch(overviewsettingErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(overviewsettingErr(err.message));
    }
  };
};

export const getOtherExpenses = (payload) => {
  return async (dispatch) => {
    dispatch(otherexpensesBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(otherexpensesSuccess(response.data));
      } else {
        dispatch(otherexpensesErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(otherexpensesErr(err.message));
    }
  };
};

export const getCashbackApi = (payload) => {
  return async (dispatch) => {
    dispatch(cashbackBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(cashbackSuccess(response.data));
      } else {
        dispatch(cashbackErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(cashbackErr(err.message));
    }
  };
};

export const getExceptionRules = (payload) => {
  return async (dispatch) => {
    dispatch(exceptionrulesBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(exceptionrulesSuccess(response.data));
      } else {
        dispatch(exceptionrulesErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(exceptionrulesErr(err.message));
    }
  };
};

export const getConfigReconcile = (payload) => {
  return async (dispatch) => {
    dispatch(configreconcileBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(configreconcileSuccess(response.data));
      } else {
        dispatch(configreconcileErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(configreconcileErr(err.message));
    }
  };
};

export const getChannels = () => {
  return async (dispatch) => {
    dispatch(getchannelsBegin());

    try {
      const response = await DataService.get('/user/connected-accounts/');

      if (response.data.status === 'success') {
        dispatch(getchannelsSuccess(response.data.data));
      } else {
        dispatch(getchannelsErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(getchannelsErr(err.message));
    }
  };
};

export const getUserInfo = (payload) => {
  return async (dispatch) => {
    dispatch(userinfoBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(userinfoSuccess(response.data));
      } else {
        dispatch(userinfoErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(userinfoErr(err.message));
    }
  };
};

export const addUser = (payload) => {
  return async (dispatch) => {
    dispatch(adduserBegin());

    try {
      const response = await mockService(payload);

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(adduserSuccess(response.data));
      } else {
        dispatch(adduserErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(adduserErr(err.message));
    }
  };
};

export const getProductConfiguration = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(productconfigBegin());

    try {
      const finalPayload = {
        ...payload,
        pagination: {
          page,
          page_size: pageSize,
        },
      };
      const response = await DataService.post(`/amazon/amazon-listing-items/`, finalPayload);

      if (response.data.status === true) {
        dispatch(productconfigSuccess(response.data));
      } else {
        dispatch(productconfigErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(productconfigErr(err.message));
    }
  };
};

export const exportProductConfiguration = () => {
  return async (dispatch) => {
    dispatch(exportproductconfigurationBegin());

    try {
      const response = await DataService.get('/amazon/export-amazon-listing-excel/');

      console.log('Export Response:', response.data);

      if (response.data.status && response.data.download_url) {
        // Direct download/open
        window.open(response.data.download_url, '_blank');

        dispatch(exportproductconfigurationSuccess(response.data));
      } else {
        throw new Error('Download URL not found');
      }
    } catch (err) {
      console.log(err);

      dispatch(exportproductconfigurationErr(err.message));
    }
  };
};
export const uploadProductConfiguration = (file) => {
  return async (dispatch) => {
    dispatch(uploadproductconfigurationBegin());

    try {
      const formData = new FormData();

      formData.append('file', file);

      const response = await DataService.post('/amazon/upload-amazon-listing-excel/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.status === true) {
        dispatch(uploadproductconfigurationSuccess(response.data));
      } else {
        dispatch(uploadproductconfigurationErr('Something went wrong'));
      }

      return response.data;
    } catch (err) {
      dispatch(uploadproductconfigurationErr(err.message));
      throw err;
    }
  };
};
