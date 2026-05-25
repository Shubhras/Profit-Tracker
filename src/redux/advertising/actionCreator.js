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

  adsproductsBegin,
  adsproductsSuccess,
  adsproductsErr,

  adsproductsDetailsBegin,
  adsproductsDetailsSuccess,
  adsproductsDetailsErr,

  productsadsBegin,
  productsadsSuccess,
  productsadsErr,

  searchtermsBegin,
  searchtermsSuccess,
  searchtermsErr,

  rulesBegin,
  rulesSuccess,
  rulesErr,

  targetsBegin,
  targetsSuccess,
  targetsErr,
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

export const getAdsGroup = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(adsgroupBegin());

    try {
      const response = await DataService.post(
        `/amazon-ads/ad-groups/list/?page=${page}&page_size=${pageSize}`,
        payload,
      );

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
export const getKeywords = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(keywordsBegin());
    try {
      const response = await DataService.post(`/amazon-ads/keywords/list/?page=${page}&page_size=${pageSize}`, payload);
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

export const getAdProducts = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(adsproductsBegin());

    try {
      const response = await DataService.post(
        `/amazon-ads/product-ads/list/?page=${page}&page_size=${pageSize}`,
        payload,
      );

      if (response.data.status === true) {
        dispatch(adsproductsSuccess(response.data));
      } else {
        dispatch(adsproductsErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(adsproductsErr(err.response?.data?.message || err.message));
    }
  };
};

export const getAdProductsDetails = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(adsproductsDetailsBegin());

    try {
      const response = await DataService.post(
        `/amazon-ads/camping-by-sku/list/?page=${page}&page_size=${pageSize}`,
        payload,
      );

      if (response.data.status === true) {
        dispatch(adsproductsDetailsSuccess(response.data));
      } else {
        dispatch(adsproductsDetailsErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(adsproductsDetailsErr(err.response?.data?.message || err.message));
    }
  };
};

export const getProductsAds = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(productsadsBegin());

    try {
      const response = await DataService.post(
        `/amazon-ads/adgroup-by-camping/?page=${page}&page_size=${pageSize}`,
        payload,
      );

      if (response.data.status === true) {
        dispatch(productsadsSuccess(response.data));
      } else {
        dispatch(productsadsErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(productsadsErr(err.response?.data?.message || err.message));
    }
  };
};

export const getSearchTerms = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(searchtermsBegin());

    try {
      const response = await DataService.post(
        `/amazon-ads/search-term-metrics/?page=${page}&page_size=${pageSize}`,
        payload,
      );

      if (response.data.status === true) {
        dispatch(searchtermsSuccess(response.data));
      } else {
        dispatch(searchtermsErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(searchtermsErr(err.response?.data?.message || err.message));
    }
  };
};

export const getRules = (page = 1, pageSize = 10, ruleType = '') => {
  return async (dispatch) => {
    dispatch(rulesBegin());

    try {
      const url = ruleType
        ? `/amazon-ads/budget-rule-list/?page=${page}&page_size=${pageSize}&rule_type=${ruleType}`
        : `/amazon-ads/budget-rule-list/?page=${page}&page_size=${pageSize}`;

      const response = await DataService.get(url);

      if (response.data.results.status === true) {
        dispatch(rulesSuccess(response.data));
      } else {
        dispatch(rulesErr(response.data.results.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(rulesErr(err.response?.data?.message || err.message));
    }
  };
};

export const getTargets = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(targetsBegin());

    try {
      const response = await DataService.post(
        `/amazon-ads/get-ads-targeting/?page=${page}&page_size=${pageSize}`,
        payload,
      );

      if (response.data.status === true) {
        dispatch(targetsSuccess(response.data));
      } else {
        dispatch(targetsErr(response.data.message || 'Something went wrong'));
      }
    } catch (err) {
      dispatch(targetsErr(err.response?.data?.message || err.message));
    }
  };
};
