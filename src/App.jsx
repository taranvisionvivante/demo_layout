// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'
// import "bootstrap/dist/css/bootstrap.min.css";
// import 'bootstrap-icons/font/bootstrap-icons.css';
// import "bootstrap/dist/js/bootstrap.bundle.min";
// import FloorPlan from './FloorPlan'
// import GridAnalyzer from './GridAnalyzer'
// import NewFloorPlan from './NewFloorPan'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//      {/* <FloorPlan /> */}
//      {/* <GridAnalyzer /> */}
//      <NewFloorPlan />
//     </>
//   )
// }

// export default App

import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Routing from './Routing/index.jsx';
import {store} from './redux/store.js';
import { Provider } from 'react-redux'
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import NewFloorPlan from './NewFloorPan.jsx';

function App() {
  return (
    <Provider store={store}>
    <BrowserRouter>
      <Routing/>
       {/* <NewFloorPlan /> */}
    </BrowserRouter>
   </Provider>
  );
}

export default App;

