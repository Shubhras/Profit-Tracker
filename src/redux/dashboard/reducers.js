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

  PROFITABILITY_BEGIN,
  PROFITABILITY_SUCCESS,
  PROFITABILITY_ERR,

  PROFITMODAL_BEGIN,
  PROFITMODAL_SUCCESS,
  PROFITMODAL_ERR,

  ESTIMATED_FEES_BEGIN,
  ESTIMATED_FEES_SUCCESS,
  ESTIMATED_FEES_ERR,
} = actions;

const initialState = {
  loading: false,
  dashboardData: null,
  pivotData: null,
  profitData: null,
  monthwiseProfitData: null,
  estimatefees: [],
  error: null,
  dateRange: null,
  search: '',
  channel: [],
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
    case 'SET_DATE_RANGE':
      return {
        ...state,
        dateRange: action.payload,
      };
    case 'SET_SEARCH':
      return {
        ...state,
        search: action.payload,
      };
    case 'SET_CHANNEL':
      return {
        ...state,
        channel: action.payload, // array of selected channels
      };

    case PROFITABILITY_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PROFITABILITY_SUCCESS:
      return {
        ...state,
        loading: false,
        profitData: action.data,
      };

    case PROFITABILITY_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case PROFITMODAL_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PROFITMODAL_SUCCESS:
      return {
        ...state,
        loading: false,
        profitData: action.data,
      };

    case PROFITMODAL_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case ESTIMATED_FEES_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ESTIMATED_FEES_SUCCESS:
      return {
        ...state,
        loading: false,
        estimatefees: action.data,
      };

    case ESTIMATED_FEES_ERR:
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
