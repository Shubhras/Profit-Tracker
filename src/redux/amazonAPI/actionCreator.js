import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const { amazonActionBegin, amazonActionSuccess, amazonActionErr } = actions;

const amazonAction = (params, callback) => {
  return async (dispatch) => {
    dispatch(amazonActionBegin());
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await DataService.get(`/amazon/callback/?${queryString}`);
      if (response.data.status === 'success') {
        dispatch(amazonActionSuccess(response.data.data));
        if (callback) callback(response.data.data);
      } else {
        dispatch(amazonActionErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(amazonActionErr(err.response?.data?.message || err.message));
    }
  };
};

export { amazonAction };
