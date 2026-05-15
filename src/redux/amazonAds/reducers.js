import actions from './actions';

const { AMAZON_ADS_ACTION_BEGIN, AMAZON_ADS_ACTION_SUCCESS, AMAZON_ADS_ACTION_ERR } = actions;

const initState = {
  loading: false,
  error: null,
  data: null,
};

const AmazonAdsReducer = (state = initState, action) => {
  const { type, data, err } = action;

  switch (type) {
    case AMAZON_ADS_ACTION_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AMAZON_ADS_ACTION_SUCCESS:
      return {
        ...state,
        loading: false,
        data,
        error: null,
      };

    case AMAZON_ADS_ACTION_ERR:
      return {
        ...state,
        loading: false,
        error: err,
      };

    default:
      return state;
  }
};

export default AmazonAdsReducer;
