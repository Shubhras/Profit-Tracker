const actions = {
  LOGIN_BEGIN: 'LOGIN_BEGIN',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERR: 'LOGIN_ERR',

  LOGOUT_BEGIN: 'LOGOUT_BEGIN',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',
  LOGOUT_ERR: 'LOGOUT_ERR',

  FORGOT_BEGIN: 'FORGOT_BEGIN',
  FORGOT_SUCCESS: 'FORGOT_SUCCESS',
  FORGOT_ERR: 'FORGOT_ERR',

  PASSWORD_BEGIN: 'PASSWORD_BEGIN',
  PASSWORD_SUCCESS: 'PASSWORD_SUCCESS',
  PASSWORD_ERR: 'PASSWORD_ERR',

  loginBegin: () => {
    return {
      type: actions.LOGIN_BEGIN,
    };
  },

  loginSuccess: (data) => {
    return {
      type: actions.LOGIN_SUCCESS,
      data,
    };
  },

  loginErr: (err) => {
    return {
      type: actions.LOGIN_ERR,
      err,
    };
  },

  logoutBegin: () => {
    return {
      type: actions.LOGOUT_BEGIN,
    };
  },

  logoutSuccess: (data) => {
    return {
      type: actions.LOGOUT_SUCCESS,
      data,
    };
  },

  logoutErr: (err) => {
    return {
      type: actions.LOGOUT_ERR,
      err,
    };
  },

  forgotBegin: () => ({
    type: actions.FORGOT_BEGIN,
  }),

  forgotSuccess: (msg) => ({
    type: actions.FORGOT_SUCCESS,
    msg,
  }),

  forgotErr: (err) => ({
    type: actions.FORGOT_ERR,
    err,
  }),

  passwordBegin: () => {
    return {
      type: actions.PASSWORD_BEGIN,
    };
  },

  passwordSuccess: (msg) => {
    return {
      type: actions.PASSWORD_SUCCESS,
      msg,
    };
  },

  passwordErr: (err) => {
    return {
      type: actions.PASSWORD_ERR,
      err,
    };
  },

  UPDATE_PROFILE_BEGIN: 'UPDATE_PROFILE_BEGIN',
  UPDATE_PROFILE_SUCCESS: 'UPDATE_PROFILE_SUCCESS',
  UPDATE_PROFILE_ERR: 'UPDATE_PROFILE_ERR',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  PROFILE_LOADING: 'PROFILE_LOADING',

  updateProfileBegin: () => {
    return {
      type: actions.UPDATE_PROFILE_BEGIN,
    };
  },

  updateProfileSuccess: (data) => {
    return {
      type: actions.UPDATE_PROFILE_SUCCESS,
      data,
    };
  },

  updateProfileErr: (err) => {
    return {
      type: actions.UPDATE_PROFILE_ERR,
      err,
    };
  },

  setUserProfile: (data) => {
    return {
      type: actions.SET_USER_PROFILE,
      data,
    };
  },

  profileLoading: (isLoading) => {
    return {
      type: actions.PROFILE_LOADING,
      data: isLoading,
    };
  },
};

export default actions;
