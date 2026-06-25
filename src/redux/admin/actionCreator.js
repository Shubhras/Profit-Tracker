import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const {
  // dashboard
  createCouponCodesBegin,
  createCouponCodesSuccess,
  createCouponCodesErr,

  getCouponCodesBegin,
  getCouponCodesSuccess,
  getCouponCodesErr,

  deleteCouponCodesBegin,
  deleteCouponCodesSuccess,
  deleteCouponCodesErr,

  updateCouponCodesBegin,
  updateCouponCodesSuccess,
  updateCouponCodesErr,

  adminDashboardBegin,
  adminDashboardSuccess,
  adminDashboardErr,

  subscriptionListBegin,
  subscriptionListSuccess,
  subscriptionListErr,

  createSubscriptionBegin,
  createSubscriptionSuccess,
  createSubscriptionErr,

  deleteSubscriptionBegin,
  deleteSubscriptionSuccess,
  deleteSubscriptionErr,

  updateSubscriptionBegin,
  updateSubscriptionSuccess,
  updateSubscriptionErr,

  getPrivacyPolicyBegin,
  getPrivacyPolicySuccess,
  getPrivacyPolicyErr,

  createPrivacyPolicyBegin,
  createPrivacyPolicySuccess,
  createPrivacyPolicyErr,

  updatePrivacyPolicyBegin,
  updatePrivacyPolicySuccess,
  updatePrivacyPolicyErr,

  deletePrivacyPolicyBegin,
  deletePrivacyPolicySuccess,
  deletePrivacyPolicyErr,

  getuserslistBegin,
  getuserslistSuccess,
  getuserslistErr,

  notificationListBegin,
  notificationListSuccess,
  notificationListErr,
} = actions;

export const getCouponCodes = () => {
  return async (dispatch) => {
    dispatch(getCouponCodesBegin());

    try {
      const response = await DataService.get('user/promocodes/list/');

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(getCouponCodesSuccess(response.data));
      } else {
        dispatch(getCouponCodesErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(getCouponCodesErr(err));
    }
  };
};

export const createCouponCodes = (payload) => {
  return async (dispatch) => {
    dispatch(createCouponCodesBegin());

    try {
      const response = await DataService.post('user/promocodes/create/', payload);

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(createCouponCodesSuccess(response.data));
        dispatch(getCouponCodes());
      } else {
        dispatch(createCouponCodesErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(createCouponCodesErr(err));
    }
  };
};

export const deleteCouponCodes = (id) => {
  return async (dispatch) => {
    dispatch(deleteCouponCodesBegin());

    try {
      const response = await DataService.delete(`user/promocodes/delete/${id}/`);

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(deleteCouponCodesSuccess(response.data));
        dispatch(getCouponCodes());
      } else {
        dispatch(deleteCouponCodesErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(deleteCouponCodesErr(err));
    }
  };
};

export const updateCouponCodes = (id, payload) => {
  return async (dispatch) => {
    dispatch(updateCouponCodesBegin());

    try {
      const response = await DataService.put(`user/promocodes/update/${id}/`, payload);

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(updateCouponCodesSuccess(response.data));
        dispatch(getCouponCodes());
      } else {
        dispatch(updateCouponCodesErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(updateCouponCodesErr(err));
    }
  };
};

export const getAdminDashboard = () => {
  return async (dispatch) => {
    dispatch(adminDashboardBegin());

    try {
      const response = await DataService.get('user/admin/dashboard/');

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(adminDashboardSuccess(response.data));
      } else {
        dispatch(adminDashboardErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(adminDashboardErr(err));
    }
  };
};

export const getSubscriptionList = () => {
  return async (dispatch) => {
    dispatch(subscriptionListBegin());

    try {
      const response = await DataService.get('user/subscription-plan/list/');
      console.log('API RESPONSE =>', response.data);
      if (response.data?.results?.status === true) {
        dispatch(subscriptionListSuccess(response.data));
      } else {
        dispatch(subscriptionListErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(subscriptionListErr(err));
    }
  };
};

export const CreateSubscription = (payload) => {
  return async (dispatch) => {
    dispatch(createSubscriptionBegin());

    try {
      const response = await DataService.post('user/subscription-plan/create/', payload);
      console.log('API RESPONSE =>', response.data);
      if (response.data?.results?.status === true) {
        dispatch(createSubscriptionSuccess(response.data));
      } else {
        dispatch(createSubscriptionErr('Something went wrong'));
      }
      return response.data;
    } catch (err) {
      dispatch(createSubscriptionErr(err));
    }
  };
};

export const updateSubscription = (id, payload) => {
  return async (dispatch) => {
    dispatch(updateSubscriptionBegin());

    try {
      const response = await DataService.put(`user/subscription-plan/update/${id}/`, payload);

      if (response.data?.results?.status === true) {
        dispatch(updateSubscriptionSuccess(response.data));
        dispatch(getSubscriptionList());
      } else {
        dispatch(updateSubscriptionErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(updateSubscriptionErr(err));
    }
  };
};

export const DeleteSubscription = (id) => {
  return async (dispatch) => {
    dispatch(deleteSubscriptionBegin());

    try {
      const response = await DataService.delete(`user/subscription-plan/delete/${id}/`);

      if (response.data?.results?.status === true) {
        dispatch(deleteSubscriptionSuccess(response.data));
      } else {
        dispatch(deleteSubscriptionErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(deleteSubscriptionErr(err));
    }
  };
};

export const getPrivacyPolicy = (title) => {
  return async (dispatch) => {
    dispatch(getPrivacyPolicyBegin());

    try {
      const response = await DataService.get(`user/privacy-policy/get-list/?title=${title}`);

      if (response.data?.status === true) {
        dispatch(getPrivacyPolicySuccess(response.data));
      } else {
        dispatch(getPrivacyPolicyErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(getPrivacyPolicyErr(err));
    }
  };
};

export const createPrivacyPolicy = (data) => {
  return async (dispatch) => {
    dispatch(createPrivacyPolicyBegin());

    try {
      const response = await DataService.post('user/privacy-policy-create/', data);
      if (response.data?.status === true) {
        dispatch(createPrivacyPolicySuccess(response.data));
      } else {
        dispatch(createPrivacyPolicyErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(createPrivacyPolicyErr(err));
    }
  };
};

export const updatePrivacyPolicy = (id, data) => {
  return async (dispatch) => {
    dispatch(updatePrivacyPolicyBegin());

    try {
      const response = await DataService.put(`user/privacy-policy/${id}/update/`, data);
      if (response.data?.status === true) {
        dispatch(updatePrivacyPolicySuccess(response.data));
      } else {
        dispatch(updatePrivacyPolicyErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(updatePrivacyPolicyErr(err));
    }
  };
};

export const deletePrivacyPolicy = (id) => {
  return async (dispatch) => {
    dispatch(deletePrivacyPolicyBegin());

    try {
      const response = await DataService.delete(`user/privacy-policy/${id}/delete/`);

      if (response.data?.status === true) {
        dispatch(deletePrivacyPolicySuccess(response.data));
      } else {
        dispatch(deletePrivacyPolicyErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(deletePrivacyPolicyErr(err));
    }
  };
};

export const getUsersList = (page = 1, limit = 10, search = '') => {
  return async (dispatch) => {
    dispatch(getuserslistBegin());

    try {
      const response = await DataService.get(`user/admin/user-list/?search=${search}&page=${page}&limit=${limit}`);

      if (response.data?.status === true) {
        dispatch(getuserslistSuccess(response.data));
      } else {
        dispatch(getuserslistErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(getuserslistErr(err));
    }
  };
};

export const getNotificationList = () => {
  return async (dispatch) => {
    dispatch(notificationListBegin());

    try {
      const response = await DataService.get('user/notifications/');
      console.log('API RESPONSE =>', response.data);
      if (response.data?.results?.status === true) {
        dispatch(notificationListSuccess(response.data));
      } else {
        dispatch(notificationListErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(notificationListErr(err));
    }
  };
};
