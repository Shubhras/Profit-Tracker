import actions from './actions';
// import { DataService } from '../../config/dataService/dataService';

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

export const getProductConfiguration = (payload) => {
  return async (dispatch) => {
    dispatch(productconfigBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(productconfigSuccess(response.data));
      } else {
        dispatch(productconfigErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(productconfigErr(err.message));
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

export const getChannels = (payload) => {
  return async (dispatch) => {
    dispatch(getchannelsBegin());

    try {
      const response = await mockService(payload);

      if (response.data.status === 'success') {
        dispatch(getchannelsSuccess(response.data));
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
