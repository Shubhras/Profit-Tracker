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

  createruleBegin,
  createruleSuccess,
  createruleErr,

  updateruleBegin,
  updateruleSuccess,
  updateruleErr,

  deleteruleBegin,
  deleteruleSuccess,
  deleteruleErr,

  campaignruleListBegin,
  campaignruleListSuccess,
  campaignruleListErr,

  editbidBegin,
  editbidSuccess,
  editbidErr,

  campaignupdateBegin,
  campaignupdateSuccess,
  campaignupdateErr,

  keywordBidBegin,
  keywordBidSuccess,
  keywordBidErr,

  negativekeywordBegin,
  negativekeywordSuccess,
  negativekeywordErr,

  orderprocessingBegin,
  orderprocessingSuccess,
  orderprocessingErr,
} = actions;

export const getCampaigns = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(campaignsBegin());
    try {
      const response = await DataService.post(
        `/amazon-ads/campaigns/list/?page=${page}&page_size=${pageSize}`,
        payload,
      );
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

export const getSearchTerms = (payload = {}) => {
  return async (dispatch) => {
    dispatch(searchtermsBegin());

    try {
      const response = await DataService.post(`/amazon-ads/search-term-metrics/`, payload);

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

export const getRules = (page = 1, pageSize = 10) => {
  return async (dispatch) => {
    dispatch(rulesBegin());

    try {
      const response = await DataService.get(
        `/amazon-ads/budget-rule-list/?page=${page}&page_size=${pageSize}&rule_state=ACTIVE`,
      );
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

export const getCreateRules = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(createruleBegin());

    try {
      const response = await DataService.post(
        `/amazon-ads/budget-rules/create/?page=${page}&page_size=${pageSize}`,
        payload,
      );

      if (response.data.status === true) {
        dispatch(createruleSuccess(response.data));
        return response.data;
      }

      dispatch(createruleErr(response.data.message || 'Something went wrong'));

      return response.data;
    } catch (err) {
      dispatch(createruleErr(err.response?.data?.message || err.message));

      return {
        status: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };
};

export const getUpdateRules = (page = 1, pageSize = 10, payload = {}) => {
  return async (dispatch) => {
    dispatch(updateruleBegin());

    try {
      const response = await DataService.put(
        `/amazon-ads/budget-rules/update/?page=${page}&page_size=${pageSize}`,
        payload,
      );

      if (response.data.status === true) {
        dispatch(updateruleSuccess(response.data));
        return response.data;
      }

      dispatch(updateruleErr(response.data.message || 'Something went wrong'));

      return response.data;
    } catch (err) {
      dispatch(updateruleErr(err.response?.data?.message || err.message));

      return {
        status: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };
};

export const getDeleteRules = (budgetRuleId) => {
  return async (dispatch) => {
    dispatch(deleteruleBegin());

    try {
      const response = await DataService.delete(`/amazon-ads/budget-rules/${budgetRuleId}/delete/`);

      if (response.data.status === true) {
        dispatch(deleteruleSuccess(response.data));

        return response.data;
      }

      dispatch(deleteruleErr(response.data.message || 'Something went wrong'));

      return response.data;
    } catch (err) {
      dispatch(deleteruleErr(err.response?.data?.message || err.message));

      return {
        status: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };
};

export const getCampaignsRulesList = () => {
  return async (dispatch) => {
    dispatch(campaignruleListBegin());

    try {
      const response = await DataService.post(`/amazon-ads/campaigns-id/list/`);

      if (response.data.status === true) {
        dispatch(campaignruleListSuccess(response.data));
        return response.data;
      }

      dispatch(campaignruleListErr(response.data.message || 'Something went wrong'));

      return response.data;
    } catch (err) {
      dispatch(campaignruleListErr(err.response?.data?.message || err.message));

      return {
        status: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };
};

export const getEditBid = (payload) => {
  return async (dispatch) => {
    dispatch(editbidBegin());

    try {
      const response = await DataService.put(`/amazon-ads/adgroup-update/`, payload);

      if (response.data.status === true) {
        dispatch(editbidSuccess(response.data));
        return response.data;
      }

      dispatch(editbidErr(response.data.message || 'Something went wrong'));

      return response.data;
    } catch (err) {
      dispatch(editbidErr(err.response?.data?.message || err.message));

      return {
        status: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };
};

export const getCampaignUpdate = (payload) => {
  return async (dispatch) => {
    dispatch(campaignupdateBegin());

    try {
      const response = await DataService.put(`/amazon-ads/campaigns-update/`, payload);

      if (response.data.status === true) {
        dispatch(campaignupdateSuccess(response.data));
        return response.data;
      }

      dispatch(campaignupdateErr(response.data.message || 'Something went wrong'));

      return response.data;
    } catch (err) {
      dispatch(campaignupdateErr(err.response?.data?.message || err.message));

      return {
        status: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };
};

export const KeywordBidUpdate = (payload) => {
  return async (dispatch) => {
    dispatch(keywordBidBegin());

    try {
      const response = await DataService.put(`/amazon-ads/keywords-update/`, payload);

      if (response.data.status === true) {
        dispatch(keywordBidSuccess(response.data));
        return response.data;
      }

      dispatch(keywordBidErr(response.data.message || 'Something went wrong'));

      return response.data;
    } catch (err) {
      dispatch(keywordBidErr(err.response?.data?.message || err.message));

      return {
        status: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };
};

export const getNegativeKeywords = (payload) => {
  return async (dispatch) => {
    dispatch(negativekeywordBegin());

    try {
      const response = await DataService.post(`/amazon-ads/negative-keywords/list/`, payload);

      if (response.data.status === true) {
        dispatch(negativekeywordSuccess(response.data));
        return response.data;
      }

      dispatch(negativekeywordErr(response.data.message || 'Something went wrong'));

      return response.data;
    } catch (err) {
      dispatch(negativekeywordErr(err.response?.data?.message || err.message));

      return {
        status: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };
};

export const getOrderProcessing = (payload) => {
  return async (dispatch) => {
    dispatch(orderprocessingBegin());

    try {
      const response = await DataService.get(
        `/amazon/order-processing-dashboard/?timeline=${payload.timeline}&marketplace_id=${payload.marketplace_id}&channel=${payload.channel}`,
        {},
      );
      if (response.data.status === true) {
        dispatch(orderprocessingSuccess(response.data));
        return response.data;
      }

      dispatch(orderprocessingErr(response.data.message || 'Something went wrong'));

      return response.data;
    } catch (err) {
      dispatch(orderprocessingErr(err.response?.data?.message || err.message));

      return {
        status: false,
        message: err.response?.data?.message || err.message,
      };
    }
  };
};
