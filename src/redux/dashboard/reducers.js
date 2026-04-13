const initialState = {
  loading: false,
  data: null,
  error: null,
};

const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'DASHBOARD_BEGIN':
      return { ...state, loading: true };

    case 'DASHBOARD_SUCCESS':
      return { loading: false, data: action.data };

    case 'DASHBOARD_ERR':
      return { loading: false, error: action.err };

    default:
      return state;
  }
};

export default dashboardReducer;
