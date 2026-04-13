import { DataService } from '../../config/dataService/dataService';

export const dashboardBegin = () => ({
  type: 'DASHBOARD_BEGIN',
});

export const dashboardSuccess = (data) => ({
  type: 'DASHBOARD_SUCCESS',
  data,
});

export const dashboardErr = (err) => ({
  type: 'DASHBOARD_ERR',
  err,
});

export const getDashboard = () => {
  return async (dispatch) => {
    dispatch(dashboardBegin());

    try {
      const response = await DataService.get('/amazon/dashboard-stats/');

      if (response.data.status === 'success') {
        dispatch(dashboardSuccess(response.data));
      }
    } catch (err) {
      dispatch(dashboardErr(err));
    }
  };
};
