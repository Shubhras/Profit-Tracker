import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const { productRankBegin, productRankSuccess, productRankErr } = actions;

export const getProductRanking = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(productRankBegin());
    try {
      const response = await DataService.get(
        `/amazon/catalog-list-details/?page=${page}&page_size=${pageSize}`,
        payload,
      );
      if (response.data.status === 'success') {
        dispatch(productRankSuccess(response.data));
      } else {
        dispatch(productRankErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(productRankErr(err.response?.data?.message || err.message));
    }
  };
};
