import DB from '../../model/db';

export const feedSort = (itemA, itemB) => {
  if (!itemA || !itemB) {
    return 0;
  }
  return -(itemA.completionDate - itemB.completionDate);
};

export const SET_PENDING = 'SET_PENDING_FEED';
export function setPending(isPending) {
  return dispatch =>
    dispatch({
      type: SET_PENDING,
      isPending
    });
}

export const SET_ITEMS = 'SET_ITEMS_FEED';
export function setItems(items) {
  return dispatch =>
    dispatch({
      type: SET_ITEMS,
      items
    });
}

export function getFeedItems(count = 20, startItemId = null) {
	const db = new DB();

	return (dispatch, getState) => {
		dispatch(setPending(true));
		db.getFeedItems(count, startItemId)
			.then(items => {
				dispatch(setItems(items));
				setPending(false);
			})
			.catch(e => {
				dispatch(setPending(false));
				throw e;
			})
	}
}

const initialState = { pending: false, feedItems: [] };
export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PENDING_FEED':
      return { ...state, pending: action.isPending };

    case 'SET_ITEMS_FEED':
      if (true) {
        const newItems = action.items;
        newItems.sort(feedSort);
        return { ...state, feedItems: newItems };
      }
      break;

    default:
      return state;
  }
};