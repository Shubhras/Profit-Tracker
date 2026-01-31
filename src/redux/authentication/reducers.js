import Cookies from 'js-cookie';
import actions from './actions';

const {
  LOGIN_BEGIN,
  LOGIN_SUCCESS,
  LOGIN_ERR,
  LOGOUT_BEGIN,
  LOGOUT_SUCCESS,
  LOGOUT_ERR,
  FORGOT_BEGIN,
  FORGOT_SUCCESS,
  FORGOT_ERR,
  PASSWORD_BEGIN,
  PASSWORD_SUCCESS,
  PASSWORD_ERR,
  UPDATE_PROFILE_BEGIN,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_ERR,
  SET_USER_PROFILE,
} = actions;

const initState = {
  login: Cookies.get('logedIn'),
  loading: false,
  error: null,
  profile: null, // ✅ Add profile state
};

/**
 *
 * @todo impure state mutation/explaination
 */
const AuthReducer = (state = initState, action) => {
  const { type, data, err, msg } = action;
  switch (type) {
    case LOGIN_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        login: data,
        loading: false,
        error: null,
      };
    case LOGIN_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    case LOGOUT_BEGIN:
      return {
        ...state,
        loading: true,
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        login: data,
        profile: null, // ✅ Clear profile on logout
        loading: false,
        error: null,
      };
    case LOGOUT_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    case FORGOT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
        message: null,
      };

    case FORGOT_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        message: msg, // ✅ "Reset token generated"
      };

    case FORGOT_ERR:
      return {
        ...state,
        loading: false,
        error: err,
      };

    case PASSWORD_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
        success: null,
      };

    case PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        success: msg,
        error: null,
      };

    case PASSWORD_ERR:
      return {
        ...state,
        loading: false,
        error: err,
        success: null,
      };

    case UPDATE_PROFILE_BEGIN:
      return {
        ...state,
        loading: true,
      };

    case UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        loading: false,
        profile: data,
      };

    case UPDATE_PROFILE_ERR:
      return {
        ...state,
        loading: false,
        error: err,
      };

    case SET_USER_PROFILE:
      return {
        ...state,
        profile: data,
      };

    default:
      return state;
  }
};
export default AuthReducer;
