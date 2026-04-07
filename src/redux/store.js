import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../src/redux/rootReducer.js'

export const store = configureStore({
  reducer: rootReducer, // Pass your combined reducers here
});

