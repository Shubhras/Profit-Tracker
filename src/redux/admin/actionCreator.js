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

  createNotificationBegin,
  createNotificationSuccess,
  createNotificationErr,

  deleteNotificationBegin,
  deleteNotificationSuccess,
  deleteNotificationErr,

  getTicketsListBegin,
  getTicketsListSuccess,
  getTicketsListErr,

  updateTicketStatusBegin,
  updateTicketStatusSuccess,
  updateTicketStatusErr,

  createModulesBegin,
  createModulesSuccess,
  createModulesErr,

  getModulesBegin,
  getModulesSuccess,
  getModulesErr,

  updateModulesBegin,
  updateModulesSuccess,
  updateModulesErr,

  deleteModulesBegin,
  deleteModulesSuccess,
  deleteModulesErr,

  viewSingleModulesBegin,
  viewSingleModulesSuccess,
  viewSingleModulesErr,

  getSubModulesBegin,
  getSubModulesSuccess,
  getSubModulesErr,

  createSubModulesBegin,
  createSubModulesSuccess,
  createSubModulesErr,

  updateSubModulesBegin,
  updateSubModulesSuccess,
  updateSubModulesErr,

  deleteSubModulesBegin,
  deleteSubModulesSuccess,
  deleteSubModulesErr,

  getSubUsersBegin,
  getSubUsersSuccess,
  getSubUsersErr,

  createSubUsersBegin,
  createSubUsersSuccess,
  createSubUsersErr,

  updateSubUsersBegin,
  updateSubUsersSuccess,
  updateSubUsersErr,

  deleteSubUsersBegin,
  deleteSubUsersSuccess,
  deleteSubUsersErr,
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

export const getNotificationList = (callback) => {
  return async (dispatch) => {
    dispatch(notificationListBegin());

    try {
      const response = await DataService.get('user/notifications/');

      console.log(response.data);

      if (response.data?.status) {
        dispatch(notificationListSuccess(response.data));

        if (callback) callback(response.data);
      } else {
        dispatch(notificationListErr(response.data?.message));
      }
    } catch (err) {
      dispatch(notificationListErr(err));

      if (callback) callback(null);
    }
  };
};

export const createNotification = (data, callback) => {
  return async (dispatch) => {
    dispatch(createNotificationBegin());

    try {
      const response = await DataService.post('user/notifications/create/', data);
      console.log(response.data);

      if (response.data?.status) {
        dispatch(createNotificationSuccess(response.data));

        if (callback) callback(response.data);
      } else {
        dispatch(createNotificationErr(response.data?.message));
      }
    } catch (err) {
      dispatch(createNotificationErr(err));

      if (callback) callback(null);
    }
  };
};

export const deleteNotification = (id, callback) => {
  return async (dispatch) => {
    dispatch(deleteNotificationBegin());

    try {
      const response = await DataService.delete(`user/admin/notifications/delete/${id}/`);
      console.log(response.data);

      if (response.data?.status) {
        dispatch(deleteNotificationSuccess(response.data));

        if (callback) callback(response.data);
      } else {
        dispatch(deleteNotificationErr(response.data?.message));
      }
    } catch (err) {
      dispatch(deleteNotificationErr(err));

      if (callback) callback(null);
    }
  };
};

export const getAdminTickets = () => {
  return async (dispatch) => {
    dispatch(getTicketsListBegin());

    try {
      const response = await DataService.get('user/admin/support-tickets/');

      if (response.data?.results?.status === true) {
        dispatch(getTicketsListSuccess(response.data));
      } else {
        dispatch(getTicketsListErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(getTicketsListErr(err));
    }
  };
};

export const updateTicketStatus = (id, payload, callback) => {
  return async (dispatch) => {
    dispatch(updateTicketStatusBegin());

    try {
      const response = await DataService.put(`user/admin/tickets/${id}/update/`, payload);

      if (response.data?.status === true) {
        dispatch(updateTicketStatusSuccess(response.data));

        callback?.(true, response.data);
      } else {
        dispatch(updateTicketStatusErr('Something went wrong'));

        callback?.(false);
      }
    } catch (err) {
      dispatch(updateTicketStatusErr(err));

      callback?.(false);
    }
  };
};

export const createModules = (payload, callback) => {
  return async (dispatch) => {
    dispatch(createModulesBegin());

    try {
      const response = await DataService.post('user/modules/create/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(createModulesSuccess(response.data));

        callback?.(true, response.data);
      } else {
        dispatch(createModulesErr('Something went wrong'));
        callback?.(false, response.data);
      }
    } catch (err) {
      dispatch(createModulesErr(err));
      callback?.(false, err);
    }
  };
};

export const getModules = () => {
  return async (dispatch) => {
    dispatch(getModulesBegin());

    try {
      const response = await DataService.get('user/modules/list/');

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(getModulesSuccess(response.data));
      } else {
        dispatch(getModulesErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(getModulesErr(err));
    }
  };
};

export const updateModules = (id, payload, callback) => {
  return async (dispatch) => {
    dispatch(updateModulesBegin());

    try {
      const response = await DataService.put(`user/modules/${id}/update/`, payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(updateModulesSuccess(response.data));
        callback?.(true, response.data);
      } else {
        dispatch(updateModulesErr('Something went wrong'));
        callback?.(false);
      }
    } catch (err) {
      dispatch(updateModulesErr(err));
      callback?.(false);
    }
  };
};

export const deleteModules = (id, callback) => {
  return async (dispatch) => {
    dispatch(deleteModulesBegin());

    try {
      const response = await DataService.delete(`user/modules/${id}/delete/`);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(deleteModulesSuccess(response.data));
        callback?.(true, response.data);
      } else {
        dispatch(deleteModulesErr('Something went wrong'));
        callback?.(false);
      }
    } catch (err) {
      dispatch(deleteModulesErr(err));
      callback?.(false);
    }
  };
};

export const ViewSingleModule = (id, callback) => {
  return async (dispatch) => {
    dispatch(viewSingleModulesBegin());

    try {
      const response = await DataService.get(`user/modules/${id}/`);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(viewSingleModulesSuccess(response.data));
        callback?.(true, response.data);
      } else {
        dispatch(viewSingleModulesErr('Something went wrong'));
        callback?.(false);
      }
    } catch (err) {
      dispatch(viewSingleModulesErr(err));
      callback?.(false);
    }
  };
};

export const getSubModules = () => {
  return async (dispatch) => {
    dispatch(getSubModulesBegin());

    try {
      const response = await DataService.get('user/submodules/list/');

      if (response.data?.status === 'success' || response.data?.status === true) {
        dispatch(getSubModulesSuccess(response.data));
      } else {
        dispatch(getSubModulesErr('Something went wrong'));
      }
    } catch (err) {
      dispatch(getSubModulesErr(err));
    }
  };
};

export const createSubModules = (payload, callback) => {
  return async (dispatch) => {
    dispatch(createSubModulesBegin());

    try {
      const response = await DataService.post('user/submodules/create/', payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(createSubModulesSuccess(response.data));

        callback?.(true, response.data);
      } else {
        dispatch(createSubModulesErr('Something went wrong'));
        callback?.(false, response.data);
      }
    } catch (err) {
      dispatch(createSubModulesErr(err));
      callback?.(false, err?.response?.data);
    }
  };
};

export const updateSubModules = (id, payload, callback) => {
  return async (dispatch) => {
    dispatch(updateSubModulesBegin());

    try {
      const response = await DataService.put(`user/submodules/${id}/update/`, payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(updateSubModulesSuccess(response.data));
        callback?.(true, response.data);
      } else {
        dispatch(updateSubModulesErr('Something went wrong'));
        callback?.(false);
      }
    } catch (err) {
      dispatch(updateSubModulesErr(err));
      callback?.(false);
    }
  };
};

export const deleteSubModules = (id, callback) => {
  return async (dispatch) => {
    dispatch(deleteSubModulesBegin());

    try {
      const response = await DataService.delete(`user/submodules/${id}/delete/`);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(deleteSubModulesSuccess(response.data));
        callback?.(true, response.data);
      } else {
        dispatch(deleteSubModulesErr('Something went wrong'));
        callback?.(false);
      }
    } catch (err) {
      dispatch(deleteSubModulesErr(err));
      callback?.(false);
    }
  };
};

export const getSubUsers = (callback) => {
  return async (dispatch) => {
    dispatch(getSubUsersBegin());

    try {
      const response = await DataService.get('user/sub-users/');

      if (response.data?.results?.status === true || response.data?.results?.status === 'success') {
        dispatch(getSubUsersSuccess(response.data));
        callback?.(true, response.data);
      } else {
        dispatch(getSubUsersErr('Something went wrong'));
        callback?.(false);
      }
    } catch (err) {
      dispatch(getSubUsersErr(err));
      callback?.(false);
    }
  };
};

export const createSubUsers = (payload, callback) => {
  return async (dispatch) => {
    dispatch(createSubUsersBegin());

    try {
      const response = await DataService.post(`user/sub-users/`, payload);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(createSubUsersSuccess(response.data));
        callback?.(true, response.data);
      } else {
        dispatch(createSubUsersErr('Something went wrong'));
        callback?.(false);
      }
    } catch (err) {
      dispatch(createSubUsersErr(err));
      // callback?.(false);
      callback?.(false, err?.response?.data);
    }
  };
};

export const updateSubUsers = (id, callback) => {
  return async (dispatch) => {
    dispatch(updateSubUsersBegin());

    try {
      const response = await DataService.put(`user/sub-users/${id}/`);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(updateSubUsersSuccess(response.data));
        callback?.(true, response.data);
      } else {
        dispatch(updateSubUsersErr('Something went wrong'));
        callback?.(false);
      }
    } catch (err) {
      dispatch(updateSubUsersErr(err));
      // callback?.(false);
      callback?.(false, err?.response?.data);
    }
  };
};

export const deleteSubUsers = (id, callback) => {
  return async (dispatch) => {
    dispatch(deleteSubUsersBegin());

    try {
      const response = await DataService.delete(`user/sub-users/${id}/`);

      if (response.data?.status === true || response.data?.status === 'success') {
        dispatch(deleteSubUsersSuccess(response.data));
        callback?.(true, response.data);
      } else {
        dispatch(deleteSubUsersErr('Something went wrong'));
        callback?.(false);
      }
    } catch (err) {
      dispatch(deleteSubUsersErr(err));
      // callback?.(false);
      callback?.(false, err?.response?.data);
    }
  };
};
