import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import * as reducers from '../src/modules/reducers';

const initialState = {
  loggedUser: 'octave'
};

const composeEnhancers = composeWithDevTools({
  // Specify name here, actionsBlacklist, actionsCreators and other options if needed
});
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'setLoggedUser':
      return { ...state, loggedUser: action.value };
    case 'setNewTaskName':
      return { ...state, newTask: action.value };
    default:
      return state;
  }
};

// const composeEnhancers = composeWithDevTools({});
const store = createStore(
  combineReducers(reducers),
  composeEnhancers(applyMiddleware(thunkMiddleware))
);

export { store };

const setLoggedUser = loggedUser => {
  return {
    type: 'setLoggedUser',
    value: loggedUser
  };
};

const setNewTaskName = newTaskName => {
  return {
    type: 'setNewTaskName',
    value: newTaskName
  };
};

export { setLoggedUser };
