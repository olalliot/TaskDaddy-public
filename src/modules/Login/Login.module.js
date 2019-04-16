import DB from '../../model/db';

export const SET_PENDING = 'SET_PENDING_LOGIN';
export function setPending(isPending) {
  return () => ({
    type: SET_PENDING,
    isPending
  });
}

export const SET_USER = 'SET_USER';
export function setUser(user) {
  return async dispatch => {
    dispatch({
      type: SET_USER,
      user
    });
  };
}

export function logIn(phoneNumber, password) {
  const db = new DB();
  return async dispatch => {
    dispatch(setPending(true));
    return db
      .logIn(phoneNumber, password)
      .then(u => {
        dispatch(setUser(u));
        dispatch(setPending(false));
      })
      .catch(e => {
        dispatch(setPending(false));
        throw e;
      });
  };
}

export function signUp(phoneNumber, password) {
  const db = new DB();
  return async dispatch => {
    dispatch(setPending(true));
    return db
      .signUp(phoneNumber, password)
      .then(u => {
        dispatch(setUser(u));
        dispatch(setPending(false));
      })
      .catch(e => {
        dispatch(setPending(false));
        console.error(e);
        throw e;
      });
  };
}

export function signOut() {
  return async dispatch => {
    const db = new DB();
    dispatch(setPending(true));
    return db
      .signOut()
      .then(() => {
        dispatch(setUser(null));
        dispatch(setPending(false));
      })
      .catch(e => {
        console.error(e);
        dispatch(setPending(false));
      });
  };
}

const initialState = { pending: false, user: null };
export default (state = initialState, action) => {
  switch (action.type) {
    case 'SET_PENDING_LOGIN':
      return { ...state, pending: action.isPending };

    case 'SET_USER':
      return { ...state, user: action.user };

    default:
      return state;
  }
};
