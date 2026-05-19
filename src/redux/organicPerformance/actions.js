const actions = {
  PRODUCT_RANK_BEGIN: 'PRODUCT_RANK_BEGIN',
  PRODUCT_RANK_SUCCESS: 'PRODUCT_RANK_SUCCESS',
  PRODUCT_RANK_ERR: 'PRODUCT_RANK_ERR',

  productRankBegin: () => {
    return {
      type: actions.PRODUCT_RANK_BEGIN,
    };
  },

  productRankSuccess: (data) => {
    return {
      type: actions.PRODUCT_RANK_SUCCESS,
      data,
    };
  },

  productRankErr: (err) => {
    return {
      type: actions.PRODUCT_RANK_ERR,
      err,
    };
  },
};

export default actions;
