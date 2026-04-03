const amazonActions = {
  // Define your action types here
  AMAZON_ACTION_BEGIN: 'AMAZON_ACTION_BEGIN',
  AMAZON_ACTION_SUCCESS: 'AMAZON_ACTION_SUCCESS',
  AMAZON_ACTION_ERR: 'AMAZON_ACTION_ERR',

  amazonActionBegin: () => ({
    type: amazonActions.AMAZON_ACTION_BEGIN,
  }),

  amazonActionSuccess: (data) => ({
    type: amazonActions.AMAZON_ACTION_SUCCESS,
    data,
  }),

  amazonActionErr: (err) => ({
    type: amazonActions.AMAZON_ACTION_ERR,
    err,
  }),
};

export default amazonActions;
