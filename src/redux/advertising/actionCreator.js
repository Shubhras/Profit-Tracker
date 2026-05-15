import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const {
  campaignsBegin,
  campaignsSuccess,
  campaignsErr,
  adsgroupBegin,
  adsgroupSuccess,
  adsgroupErr,
  keywordsBegin,
  keywordsSuccess,
  keywordsErr,
} = actions;

export const getCampaigns = (page = 1, pageSize = 10) => {
  return async (dispatch) => {
    dispatch(campaignsBegin());
    try {
      const response = await DataService.post(`/amazon-ads/campaigns/list/?page=${page}&page_size=${pageSize}`);
      if (response.data.status === true) {
        dispatch(campaignsSuccess(response.data));
      } else {
        dispatch(campaignsErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(campaignsErr(err.response?.data?.message || err.message));
    }
  };
};

export const getAdsGroup = (page = 1, pageSize = 10) => {
  return async (dispatch) => {
    dispatch(adsgroupBegin());

    try {
      const response = await DataService.post(`/amazon-ads/ad-groups/list/?page=${page}&page_size=${pageSize}`);

      if (response.data.status === true) {
        dispatch(adsgroupSuccess(response.data));
      } else {
        dispatch(adsgroupErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(adsgroupErr(err.response?.data?.message || err.message));
    }
  };
};
export const getKeywords = (page = 1, pageSize = 10) => {
  return async (dispatch) => {
    dispatch(keywordsBegin());
    try {
      const response = await DataService.post(`/amazon-ads/keywords/list/?page=${page}&page_size=${pageSize}`);
      if (response.data.status === true) {
        dispatch(keywordsSuccess(response.data));
      } else {
        dispatch(keywordsErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(keywordsErr(err.response?.data?.message || err.message));
    }
  };
};
