import actions from './actions';

const initialState = {
  productRankingData: {},
  loading: false,
  error: null,
};

const { PRODUCT_RANK_BEGIN, PRODUCT_RANK_SUCCESS, PRODUCT_RANK_ERR } = actions;

const organicPerformanceReducer = (state = initialState, action) => {
  const { type, data, err } = action;
  switch (type) {
    case PRODUCT_RANK_BEGIN:
      return {
        ...state,
        loading: true,
      };

    case PRODUCT_RANK_SUCCESS:
      return {
        ...state,
        productRankingData: data,
        loading: false,
      };

    case PRODUCT_RANK_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };
    default:
      return state;
  }
  // default:
  //   return state;
};

export default organicPerformanceReducer;
