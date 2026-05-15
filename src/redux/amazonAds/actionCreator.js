import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const { amazonAdsActionBegin, amazonAdsActionSuccess, amazonAdsActionErr } = actions;

const amazonAdsAction = (params, callback) => {
  return async (dispatch) => {
    dispatch(amazonAdsActionBegin());

    try {
      const queryString = new URLSearchParams(params).toString();

      //   const response = await DataService.get(`amazon-ads/account/callback/?${queryString}`);
      const response = await DataService.get(`amazon/callback/advertise?${queryString}`);

      if (response.data.status === true) {
        dispatch(amazonAdsActionSuccess(response.data.data));

        if (callback) callback(response.data.data);
      } else {
        dispatch(amazonAdsActionErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(amazonAdsActionErr(err.response?.data?.message || err.message));
    }
  };
};

export { amazonAdsAction };
