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

  profitabilityBegin,
  profitabilitySuccess,
  profitabilityErr,

  profitmodalBegin,
  profitmodalSuccess,
  profitmodalErr,

  estimatedFeesBegin,
  estimatedFeesSuccess,
  estimatedFeesErr,
} = actions;

const mockService = async (payload) => {
  console.log('EXPORT PAYLOAD =>', payload);

  return new Promise((resolve) => {
    setTimeout(() => {
      const blob = new Blob(['Dummy excel content'], {
        type: 'application/vnd.ms-excel',
      });

      resolve({
        data: blob,
      });
    }, 500);
  });
};

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

export const getProfitDetailsByParentId = (payload) => {
  return async (dispatch) => {
    dispatch(profitBegin());
    try {
      const response = await DataService.post('/amazon/profitability/details/by-parentproductid/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(profitSuccess(response.data)); // same reducer reuse
      } else {
        dispatch(profitErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(profitErr(err));
    }
  };
};

export const exportProfitData = (payload) => {
  return async () => {
    try {
      // const response = await DataService.post('/amazon/export', payload, {
      //   responseType: 'blob',
      // });
      const response = await mockService(payload);

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');

      link.href = url;

      link.setAttribute('download', 'profit.xlsx');

      document.body.appendChild(link);

      // link.click();

      link.remove();
    } catch (error) {
      console.log(error);
    }
  };
};

export const getSecondDetials = (payload) => {
  return async (dispatch) => {
    dispatch(profitabilityBegin());

    try {
      const response = await DataService.post('/amazon/profitability/details/by-parent-asin/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(profitabilitySuccess(response.data));
      } else {
        dispatch(profitabilityErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(profitabilityErr(err));
    }
  };
};

export const getProfitModalApi = (payload) => {
  return async (dispatch) => {
    dispatch(profitmodalBegin());

    try {
      const response = await mockService(payload);

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(profitmodalSuccess(response.data));
      } else {
        dispatch(profitmodalErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(profitmodalErr(err.message));
    }
  };
};

export const getEstimatedFees = (payload) => {
  return async (dispatch) => {
    dispatch(estimatedFeesBegin());

    try {
      const response = await DataService.post('/amazon/estimated-fees/list/', payload);
      console.log('API Response =>', response);
      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(estimatedFeesSuccess(response.data));
      } else {
        dispatch(estimatedFeesErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(estimatedFeesErr(err));
    }
  };
};
