import actions from './action';

const {
  // dashboard
  DASHBOARD_BEGIN,
  DASHBOARD_SUCCESS,
  DASHBOARD_ERR,

  // pivot
  PIVOT_BEGIN,
  PIVOT_SUCCESS,
  PIVOT_ERR,

  // profit
  PROFIT_BEGIN,
  PROFIT_SUCCESS,
  PROFIT_ERR,
  MONTHWISE_PROFIT_BEGIN,
  MONTHWISE_PROFIT_SUCCESS,
  MONTHWISE_PROFIT_ERR,
} = actions;

const initialState = {
  loading: false,
  dashboardData: null,
  pivotData: null,
  profitData: null,
  monthwiseProfitData: null,
  error: null,
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case DASHBOARD_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DASHBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        dashboardData: action.data,
      };

    case DASHBOARD_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case PIVOT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PIVOT_SUCCESS:
      return {
        ...state,
        loading: false,
        pivotData: action.data,
      };

    case PIVOT_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case PROFIT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PROFIT_SUCCESS:
      return {
        ...state,
        loading: false,
        profitData: action.data,
      };

    case PROFIT_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case MONTHWISE_PROFIT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case MONTHWISE_PROFIT_SUCCESS:
      return {
        ...state,
        loading: false,
        monthwiseProfitData: action.data,
      };

    case MONTHWISE_PROFIT_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    default:
      return state;
  }
};

export default dashboardReducer;
