import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Routing from './Routing/index.js';
import {store} from '../src/redux/store.js'
import { Provider } from 'react-redux'

function App() {
  return (
    <Provider store={store}>
    <BrowserRouter>
      <Routing/>
    </BrowserRouter>
   </Provider>
  );
}

export default App;
