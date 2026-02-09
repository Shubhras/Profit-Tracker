import Cookies from 'js-cookie';
import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const {
  loginBegin,
  loginSuccess,
  loginErr,
  logoutBegin,
  logoutSuccess,
  logoutErr,
  forgotBegin,
  forgotSuccess,
  forgotErr,
  passwordBegin,
  passwordSuccess,
  passwordErr,
} = actions;

const login = (values, callback) => {
  return async (dispatch) => {
    dispatch(loginBegin());

    try {
      const response = await DataService.post('/user/login/', values);

      // console.log('Login Success:', response.data);

      if (response.data.status === true) {
        // Store tokens
        Cookies.set('access_token', response.data.data.access);
        Cookies.set('refresh_token', response.data.data.refresh);
        Cookies.set('logedIn', 'true'); // Set logedIn cookie for persistence

        // Store user email for display purposes
        Cookies.set('userEmail', values.email);

        // Get subscription status from response
        const hasSubscription = response.data.data.has_subscription === true;
        Cookies.set('hasSubscription', hasSubscription ? 'true' : 'false');

        // Dispatch login success and subscription status
        dispatch(loginSuccess(true));
        dispatch(actions.setHasSubscription(hasSubscription));

        // Pass subscription status to callback for redirect logic
        callback(hasSubscription);
      }
    } catch (err) {
      console.log('Login Failed:', err.response?.data);

      const errorMessage = err.response?.data?.error || 'Something went wrong';

      dispatch(loginErr(errorMessage));
    }
  };
};

// const login = (values, callback) => {
//   return async (dispatch) => {
//     dispatch(loginBegin());

//     const { email, password } = values;

//     if (email === 'hexadash@dm.com' && password === '123456') {
//       Cookies.set('access_token', 'demo-token');
//       Cookies.set('loggedIn', 'true');
//       dispatch(loginSuccess(true));
//       callback();
//     } else {
//       dispatch(loginErr('Invalid credentials'));
//     }
//   };
// };

const register = (values, callback) => {
  return async (dispatch) => {
    dispatch(loginBegin());

    try {
      const response = await DataService.post('/user/register/', values);

      // console.log('Register Success:', response.data);
      if (response.data.status === true) {
        dispatch(loginSuccess(false)); // user not logged in yet
        callback(); // redirect to login page
      } else {
        const errorMessage = response.data.error || 'Registration failed';

        dispatch(loginErr(errorMessage));
      }
    } catch (err) {
      console.log('Register Failed:', err.response?.data);

      const errorMessage = err.response?.data?.error || 'Something went wrong';

      dispatch(loginErr(errorMessage));
    }
  };
};

const forgotPassword = (values, callback) => {
  return async (dispatch) => {
    dispatch(forgotBegin());

    try {
      const response = await DataService.post('/user/forgot-password/', values);

      // console.log('Forgot Password Success:', response.data);

      if (response.data.status === true) {
        dispatch(forgotSuccess(response.data.message));

        // ✅ Redirect or move to OTP page
        callback();
      } else {
        dispatch(forgotErr('Reset failed'));
      }
    } catch (err) {
      console.log('Forgot Password Failed:', err.response?.data);

      const errorMessage = err.response?.data?.error || 'Something went wrong';

      dispatch(forgotErr(errorMessage));
    }
  };
};

const resetPassword = (values, callback) => {
  return async (dispatch) => {
    dispatch(forgotBegin());

    try {
      const response = await DataService.post('/user/reset-password/', values);

      // console.log('Reset Password Success:', response.data);

      if (response.data.status === true) {
        dispatch(forgotSuccess(response.data.message));
        callback();
      } else {
        dispatch(forgotErr('Reset failed'));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Something went wrong';

      dispatch(forgotErr(errorMessage));
    }
  };
};

const changePassword = (values, callback) => {
  return async (dispatch) => {
    dispatch(passwordBegin());

    try {
      const response = await DataService.post('/user/change-password/', values);

      // console.log('Change Password Success:', response.data);

      if (response.data.status === true) {
        dispatch(passwordSuccess(response.data.message));
        callback();
      } else {
        dispatch(passwordErr(response.data.error || 'Password change failed'));
      }
    } catch (error) {
      console.log('Change Password Failed:', error.response?.data);

      const errorMessage = error.response?.data?.error || 'Something went wrong';

      dispatch(passwordErr(errorMessage));
    }
  };
};

const logOut = (callback) => {
  return async (dispatch) => {
    dispatch(logoutBegin());
    try {
      // Cookies.remove('loggedIn');
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      Cookies.remove('logedIn'); // Clear logedIn cookie
      Cookies.remove('hasSubscription'); // Clear subscription status cookie
      Cookies.remove('userEmail'); // Clear user email cookie
      dispatch(logoutSuccess(false));
      callback();
    } catch (err) {
      dispatch(logoutErr(err));
    }
  };
};

const getProfile = () => {
  return async (dispatch, getState) => {
    // Check if profile is already loading or already loaded to prevent duplicate calls
    const { profileLoading, profile } = getState().auth;
    if (profileLoading || profile) {
      return;
    }

    try {
      dispatch(actions.profileLoading(true));
      const response = await DataService.get('/user/profile/');
      if (response.data.status === true) {
        dispatch(actions.setUserProfile(response.data.data));
      }
    } catch (err) {
      console.log('Get Profile Failed:', err);
      dispatch(actions.profileErr(err));
    }
  };
};

const setUserProfile = (data) => {
  return (dispatch) => {
    dispatch(actions.setUserProfile(data));
  };
};

export { login, logOut, register, forgotPassword, resetPassword, changePassword, getProfile, setUserProfile };
