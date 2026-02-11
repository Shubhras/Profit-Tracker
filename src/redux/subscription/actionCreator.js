import Cookies from 'js-cookie';
import actions from './actions';
import authActions from '../authentication/actions';
import { DataService } from '../../config/dataService/dataService';

const {
  createSubscriptionBegin,
  createSubscriptionSuccess,
  createSubscriptionErr,
  verifyPaymentBegin,
  verifyPaymentSuccess,
  verifyPaymentErr,
  setSelectedPlan,
  clearSelectedPlan,
  resetSubscriptionState,
} = actions;

const createSubscription = (planId, callback) => {
  return async (dispatch) => {
    dispatch(createSubscriptionBegin());

    try {
      const response = await DataService.post('/create-subscription/', { plan_id: planId });

      if (response.data.status === true) {
        // Check if it's a free plan (payment_required is false)
        const isFreePlan = response.data.data.payment_required === false;

        const subscriptionData = {
          // If free, we might not have subscription_id or razorpay_key, or strict structure
          subscription_id: response.data.data.subscription_id || 'FREE_PLAN',
          subscription_status: response.data.data.subscription_status || 'active',
          razorpay_key: response.data.data.razorpay_key || null,
          isFreePlan, // Flag to help the callback decide
          ...response.data.data, // Include all other data like plan_id, active, etc.
        };

        dispatch(createSubscriptionSuccess(subscriptionData));

        if (callback) {
          callback(subscriptionData);
        }
      } else {
        dispatch(createSubscriptionErr(response.data.message || 'Failed to create subscription'));
      }
    } catch (err) {
      console.error('Create Subscription Failed:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Something went wrong';
      dispatch(createSubscriptionErr(errorMessage));
    }
  };
};

const verifyPayment = (paymentData, callback) => {
  return async (dispatch) => {
    dispatch(verifyPaymentBegin());

    try {
      const response = await DataService.post('/verify-payment/', paymentData);

      if (response.data.status === true) {
        dispatch(verifyPaymentSuccess(response.data));

        // Update subscription status to true after successful payment
        Cookies.set('hasSubscription', 'true');
        dispatch(authActions.setHasSubscription(true));

        if (callback) {
          callback(response.data);
        }
      } else {
        dispatch(verifyPaymentErr(response.data.message || 'Payment verification failed'));
      }
    } catch (err) {
      console.error('Verify Payment Failed:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Payment verification failed';
      dispatch(verifyPaymentErr(errorMessage));
    }
  };
};

const selectPlan = (plan) => {
  return (dispatch) => {
    dispatch(setSelectedPlan(plan));
  };
};

const clearPlan = () => {
  return (dispatch) => {
    dispatch(clearSelectedPlan());
  };
};

const resetSubscription = () => {
  return (dispatch) => {
    dispatch(resetSubscriptionState());
  };
};

export { createSubscription, verifyPayment, selectPlan, clearPlan, resetSubscription };
