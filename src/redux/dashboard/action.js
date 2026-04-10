const actions = {
  DASHBOARD_BEGIN: 'DASHBOARD_BEGIN',
  DASHBOARD_SUCCESS: 'DASHBOARD_SUCCESS',
  DASHBOARD_ERR: 'DASHBOARD_ERR',

  dashboardBegin: () => ({
    type: actions.DASHBOARD_BEGIN,
  }),

  dashboardSuccess: (data) => ({
    type: actions.DASHBOARD_SUCCESS,
    data,
  }),

  dashboardErr: (err) => ({
    type: actions.DASHBOARD_ERR,
    err,
  }),
};

export default actions;
