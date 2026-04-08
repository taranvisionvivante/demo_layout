import React from 'react';
import { Routes, Route, useRoutes, Navigate } from "react-router-dom";
import Homepage from "../components/homepage/Homepage.jsx"
import ScanerView from '../components/scanerView/Index.jsx';
import EditView from '../components/editView/Index.jsx'
import LightPlacement from '../components/lightPlacementView/Index.jsx';
import EstimateView from '../components/estimate/Index.jsx';
import Login from '../components/auth/Index.jsx';
import { useSelector } from 'react-redux';
import AdminLayout from '../components/admin/layout/Index.jsx';
import SaveData from '../components/admin/savedData/Index.jsx';

const AdminRoutes = () => useRoutes([
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <SaveData /> },
      { path: '/editview', element: <EditView /> },
      { path: 'lightplacementview', element: <LightPlacement /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ]
  },
]);

const OtherRoutes = () => useRoutes([
  { path: '/', element: <ScanerView /> },
  { path: '/login', element: <Login /> },
  { path: '/editview', element: <EditView /> },
  { path: '/lightplacementview', element: <LightPlacement /> },
  { path: '/estimate', element: <EstimateView /> },
  { path: '*', element: <Navigate to="/" replace /> }
]);

const Routing = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <>
      {user ? <AdminRoutes /> : <OtherRoutes />}
    </>
  )
}

export default Routing;
