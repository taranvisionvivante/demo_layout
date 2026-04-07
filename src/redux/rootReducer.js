import { combineReducers } from 'redux';
import productReducer from './productReducer';
import adminReducer from './adminReducer';
// Import other reducers if you have them

const rootReducer = combineReducers({
  products: productReducer,
  auth: adminReducer
  // Add other reducers here if needed
});

export default rootReducer;


