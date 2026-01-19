import Cookies from 'js-cookie';
import actions from './actions';
import { DataService } from '../../config/dataService/dataService';

const { loginBegin, loginSuccess, loginErr, logoutBegin, logoutSuccess, logoutErr } = actions;

// const login = (values, callback) => {
//   return async (dispatch) => {
//     dispatch(loginBegin());
//     try {
//       const response = await DataService.post('/login', values);
//       if (response.data.errors) {
//         dispatch(loginErr(response.data.errors));
//       } else {
//         Cookies.set('access_token', response.data.data.token);
//         Cookies.set('logedIn', true);
//         dispatch(loginSuccess(true));
//         callback();
//       }
//     } catch (err) {
//       dispatch(loginErr(err));
//     }
//   };
// };

const login = (values, callback) => {
  return async (dispatch) => {
    dispatch(loginBegin());

    const { email, password } = values;

    if (email === 'hexadash@dm.com' && password === '123456') {
      localStorage.setItem('access_token', 'demo-token');
      localStorage.setItem('loggedIn', 'true');
      dispatch(loginSuccess(true));
      callback();
    } else {
      dispatch(loginErr('Invalid credentials'));
    }
  };
};

const register = (values, callback) => {
  return async (dispatch) => {
    dispatch(loginBegin());
    try {
      const response = await DataService.post('/register', values);
      if (response.data.errors) {
        dispatch(loginErr('Registration failed!'));
        callback();
      } else {
        dispatch(loginSuccess(false));
        callback();
      }
    } catch (err) {
      dispatch(loginErr(err));
      callback();
    }
  };
};

const logOut = (callback) => {
  return async (dispatch) => {
    dispatch(logoutBegin());
    try {
      Cookies.remove('logedIn');
      Cookies.remove('access_token');
      dispatch(logoutSuccess(false));
      callback();
    } catch (err) {
      dispatch(logoutErr(err));
    }
  };
};

export { login, logOut, register };
