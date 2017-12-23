import firebase from 'firebase';
import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { reactReduxFirebase, getFirebase } from 'react-redux-firebase';

import { fbConfig } from './firebase.config';
import { rootReducer } from './reducers';

// react-redux-firebase options
const config = {
  userProfile: 'users', // firebase root where user profiles are stored
  attachAuthIsReady: true, // attaches auth is ready promise to store
};

export const createInitialStore = (initialState = {}) => {
  // Initialize Firebase instance
  firebase.initializeApp(fbConfig);

  // Add redux Firebase to compose
  const createStoreWithFirebase = compose(
    reactReduxFirebase(firebase, config),
    applyMiddleware(thunk.withExtraArgument(getFirebase))
  )(createStore);

  // Create store with reducers and initial state
  const store = createStoreWithFirebase(rootReducer, initialState);

  // Listen for auth ready (promise available on store thanks to attachAuthIsReady: true config option)
  store.firebaseAuthIsReady.then(() => {
    console.log('Auth has loaded'); // eslint-disable-line no-console
  });

  return store;
};