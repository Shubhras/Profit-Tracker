const actions = {
  DASHBOARD_BEGIN: 'DASHBOARD_BEGIN',
  DASHBOARD_SUCCESS: 'DASHBOARD_SUCCESS',
  DASHBOARD_ERR: 'DASHBOARD_ERR',

  PIVOT_BEGIN: 'PIVOT_BEGIN',
  PIVOT_SUCCESS: 'PIVOT_SUCCESS',
  PIVOT_ERR: 'PIVOT_ERR',
  PROFIT_BEGIN: 'PROFIT_BEGIN',
  PROFIT_SUCCESS: 'PROFIT_SUCCESS',
  PROFIT_ERR: 'PROFIT_ERR',

  MONTHWISE_PROFIT_BEGIN: 'MONTHWISE_PROFIT_BEGIN',
  MONTHWISE_PROFIT_SUCCESS: 'MONTHWISE_PROFIT_SUCCESS',
  MONTHWISE_PROFIT_ERR: 'MONTHWISE_PROFIT_ERR',

  SET_DATE_RANGE: 'SET_DATE_RANGE',
  SET_SEARCH: 'SET_SEARCH',

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
  pivotBegin: () => ({ type: actions.PIVOT_BEGIN }),
  pivotSuccess: (data) => ({ type: actions.PIVOT_SUCCESS, data }),
  pivotErr: (err) => ({ type: actions.PIVOT_ERR, err }),

  profitBegin: () => ({ type: actions.PROFIT_BEGIN }),
  profitSuccess: (data) => ({ type: actions.PROFIT_SUCCESS, data }),
  profitErr: (err) => ({ type: actions.PROFIT_ERR, err }),
  monthwiseProfitBegin: () => ({
    type: actions.MONTHWISE_PROFIT_BEGIN,
  }),

  monthwiseProfitSuccess: (data) => ({
    type: actions.MONTHWISE_PROFIT_SUCCESS,
    data,
  }),

  monthwiseProfitErr: (err) => ({
    type: actions.MONTHWISE_PROFIT_ERR,
    err,
  }),
  setDateRange: (payload) => ({
    type: actions.SET_DATE_RANGE,
    payload,
  }),
  setSearch: (payload) => ({
    type: actions.SET_SEARCH,
    payload,
  }),
};

export default actions;
