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

  NOTIFICATION_BEGIN,
  NOTIFICATION_SUCCESS,
  NOTIFICATION_ERR,

  SUPPORT_TICKET_BEGIN,
  SUPPORT_TICKET_SUCCESS,
  SUPPORT_TICKET_ERR,

  GET_SUPPORT_TICKET_BEGIN,
  GET_SUPPORT_TICKET_SUCCESS,
  GET_SUPPORT_TICKET_ERR,

  GET_TICKET_DETAILS_BEGIN,
  GET_TICKET_DETAILS_SUCCESS,
  GET_TICKET_DETAILS_ERR,

  PROFIT_SKU_ID_BEGIN,
  PROFIT_SKU_ID_SUCCESS,
  PROFIT_SKU_ID_ERR,
} = actions;

const initialState = {
  loading: false,
  dashboardData: null,
  pivotData: null,
  profitData: null,
  monthwiseProfitData: null,
  estimatefees: [],
  notifications: [],
  supportTickets: [],
  getsupportTickets: [],
  getTicketsDetails: [],
  getProfitSkuData: [],
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

    case NOTIFICATION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.data.data || [],
      };

    case NOTIFICATION_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case SUPPORT_TICKET_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SUPPORT_TICKET_SUCCESS:
      return {
        ...state,
        loading: false,
        supportTickets: action.data.data || [],
      };

    case SUPPORT_TICKET_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_SUPPORT_TICKET_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_SUPPORT_TICKET_SUCCESS:
      return {
        ...state,
        loading: false,
        getsupportTickets: action.data.data || [],
      };

    case GET_SUPPORT_TICKET_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case GET_TICKET_DETAILS_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_TICKET_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        getTicketsDetails: action.data || [],
      };

    case GET_TICKET_DETAILS_ERR:
      return {
        ...state,
        loading: false,
        error: action.err,
      };

    case PROFIT_SKU_ID_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case PROFIT_SKU_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        getProfitSkuData: action.data,
      };

    case PROFIT_SKU_ID_ERR:
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
