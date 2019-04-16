import DB from '../../model/db';

export const itemSort = (itemA, itemB) => {
  if (!itemA || !itemB) {
    return 0;
  }
  return itemA.dueDate - itemB.dueDate;
};

export const SET_PENDING = 'SET_PENDING';
export function setPending(isPending) {
  return dispatch =>
    dispatch({
      type: SET_PENDING,
      isPending
    });
}

export const SET_ITEMS = 'SET_ITEMS';
export function setItems(items) {
  return dispatch =>
    dispatch({
      type: SET_ITEMS,
      items
    });
}

export function setNewItems(items) {
  return (dispatch, getState) => {
    const oldItems = getState().home.items;

    if (oldItems.length === 0) {
      dispatch(setItems(items));
      return;
    }

    // dedup
    // console.log(oldItems.map(t => t.id));
    // console.log(items.map(t => t.id));
    let uniqueItems = items.reduce((theMap, t) => {
      theMap[t.id] = t;
      return theMap;
    }, {});

    uniqueItems = oldItems.reduce((theMap, t) => {
      theMap[t.id] = t;
      return theMap;
    }, uniqueItems);

    uniqueItems = Object.entries(uniqueItems).map(entry => entry[1]);


    dispatch(setItems(uniqueItems));
  };
}

export const ADD_ITEM = 'ADD_ITEM';
export function addItem(item) {
  return dispatch =>
    dispatch({
      type: ADD_ITEM,
      item
    });
}

// fetches count items after start id or now if no startID
export function fetchItems(count = 20, startId = null) {
  const db = new DB();

  return (dispatch, getState) => {
    dispatch(setPending(true));
    db.getTaskItems(count, startId)
      .then(items => {
        dispatch(setNewItems(items));
        setPending(false);
      })
      .catch(e => {
        dispatch(setPending(false));
        throw e;
      });
  };
}

// fetches count items before start id or now if no startID
export function fetchPreviousItems(count = 20, startId = null) {
  const db = new DB();

  return dispatch => {
    dispatch(setPending(true));
    db.getTaskItems(count, startId, true)
      .then(items => {
        // console.log(items);
        dispatch(setNewItems(items));
        setPending(false);
      })
      .catch(e => {
        dispatch(setPending(false));
        throw e;
      });
  };
}

export function addTaskToFeed(feedTask) {
	const db = new DB();
	return dispatch => {
		dispatch(setPending(true));
		return db
			.addTaskToFeed(feedTask)
			.then(() => {
				setPending(false);
			})
			.catch(e => {
				setPending(false);
				throw e;
			});
	};
}

export function addTask(task) {
  const db = new DB();
  return dispatch => {
    dispatch(setPending(true));
    return db
      .addTask(task)
      .then(t => {
        dispatch(addItem(t));
        setPending(false);
      })
      .catch(e => {
        setPending(false);
        throw e;
      });
  };
}

export function updateTask(task) {
  const db = new DB();
  return async (dispatch, getState) => {
    dispatch(setPending(true));
    return db
      .updateTask(task)
      .then(t => {
        const oldTasks = getState().home.items;
        const index = oldTasks.findIndex(tf => tf.id === t.id);
        if (index > -1) {
          oldTasks[index] = t;
        } else {
          throw new Error('task not downloaded');
        }

        dispatch(setPending(false));
      })
      .catch(e => {
        dispatch(setPending(false));
        console.error(e);
        throw e;
      });
  };
}

export function completeTask(task) {
  const db = new DB();
  return async (dispatch, getState) => {
    dispatch(setPending(true));
    return db
      .completeTask(task)
      .then(t => {
        const oldTasks = getState().home.items;
        const index = oldTasks.findIndex(tf => tf.id === t.id);
        if (index > -1) {
          oldTasks[index] = t;
        } else {
          throw new Error('task not downloaded');
        }

        dispatch(setPending(false));
      })
      .catch(e => {
        dispatch(setPending(false));
        console.error(e);
        throw e;
      });
  };
}

const initialState = { pending: false, items: [] };
export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PENDING':
      return { ...state, pending: action.isPending };

    case 'SET_ITEMS':
      if (true) {
        const newItems = action.items;
        newItems.sort(itemSort);
        return { ...state, items: newItems };
      }
      break;

    case 'ADD_ITEM':
      if (true) {
        const newItems = state.items;
        newItems.push(action.item);
        newItems.sort(itemSort);
        return { ...state, items: newItems };
      }
      break;

    default:
      return state;
  }
};
