import actions from './action';
import { DataService } from '../../config/dataService/dataService';

const {
  // dashboard
  dashboardBegin,
  dashboardSuccess,
  dashboardErr,

  // pivot
  pivotBegin,
  pivotSuccess,
  pivotErr,

  // profit
  profitBegin,
  profitSuccess,
  profitErr,
} = actions;
export const getDashboard = (payload) => {
  return async (dispatch) => {
    dispatch(dashboardBegin());

    try {
      const response = await DataService.post('/amazon/dashboard-stats/', payload);

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(dashboardSuccess(response.data));
      } else {
        dispatch(dashboardErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(dashboardErr(err));
    }
  };
};
export const getPivotStats = (payload) => {
  return async (dispatch) => {
    dispatch(pivotBegin());

    try {
      const response = await DataService.post('/amazon/pivot-stats/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(pivotSuccess(response.data));
      } else {
        dispatch(pivotErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(pivotErr(err));
    }
  };
};

export const getProfitData = (payload) => {
  return async (dispatch) => {
    dispatch(profitBegin());

    try {
      const response = await DataService.post('/amazon/dashboard-profitability/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(profitSuccess(response.data));
      } else {
        dispatch(profitErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(profitErr(err));
    }
  };
};

const { monthwiseProfitBegin, monthwiseProfitSuccess, monthwiseProfitErr } = actions;

export const getProfitMonthwise = (payload) => {
  return async (dispatch) => {
    dispatch(monthwiseProfitBegin());

    try {
      const response = await DataService.post('/amazon/profitability-monthwise/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(monthwiseProfitSuccess(response.data));
      } else {
        dispatch(monthwiseProfitErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(monthwiseProfitErr(err));
    }
  };
};

export const getProfitDetails = (payload) => {
  return async (dispatch) => {
    dispatch(profitBegin());

    try {
      const response = await DataService.post('/amazon/profitability/details/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(profitSuccess(response.data)); // same reducer use kar sakte ho
      } else {
        dispatch(profitErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(profitErr(err));
    }
  };
};
