import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
// import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import store from './redux/store';
import Admin from './routes/admin';
import Auth from './routes/auth';
import SuperAdmin from './routes/superAdmin';
import './static/css/style.css';
import config from './config/config';
import ProtectedRoute from './components/utilities/protectedRoute';
import ScrollToTop from './components/utilities/ScrollToTop';
import 'antd/dist/antd.less';
import PublicRoutes from './routes/public';

const { theme } = config;

function ProviderConfig() {
  const { rtl, isLoggedIn, topMenu, mainContent } = useSelector((state) => {
    return {
      rtl: state.ChangeLayoutMode.rtlData,
      topMenu: state.ChangeLayoutMode.topMenu,
      mainContent: state.ChangeLayoutMode.mode,
      isLoggedIn: state.auth.login,
    };
  });

  return (
    <ConfigProvider direction={rtl ? 'rtl' : 'ltr'}>
      <ThemeProvider theme={{ ...theme, rtl, topMenu, mainContent }}>
        <Router basename={process.env.PUBLIC_URL}>
          <ScrollToTop />
          <Routes>
            {/* ========================================================================= */}
            {/* PREVIOUS CODE (Commented out):                                           */}
            {/* This conditionally rendered /admin/* only when isLoggedIn was true.      */}
            {/* When an unauthenticated user opened a shared deep link                   */}
            {/* (like /admin/pages/billing in Incognito), the route was missing from      */}
            {/* the router table, falling through to PublicRoutes and causing a blank    */}
            {/* white screen because nothing matched.                                    */}
            {/*                                                                           */}
            {/* {!isLoggedIn && <Route path="/auth/*" element={<Auth />} />}            */}
            {/* {isLoggedIn && <Route path="/admin/*" element={<ProtectedRoute Component={Admin} />} />} */}
            {/* {isLoggedIn && <Route path="/super-admin/*" element={<ProtectedRoute Component={SuperAdmin} />} />} */}
            {/* ========================================================================= */}

            {/* ========================================================================= */}
            {/* NEW CODE:                                                                 */}
            {/* Always register /admin/* and /super-admin/* using ProtectedRoute.        */}
            {/* When not logged in, ProtectedRoute intercepts the user and smoothly       */}
            {/* redirects them to /auth/login with state: { from: location } so they can  */}
            {/* log in and land right back on their shared link.                          */}
            {/* ========================================================================= */}

            {/* 1️⃣ AUTH ROUTES */}
            <Route path="/auth/*" element={isLoggedIn ? <Navigate to="/admin" replace /> : <Auth />} />
            <Route path="/login" element={<Navigate to="/auth/login" replace />} />
            <Route path="/register" element={<Navigate to="/auth/register" replace />} />

            {/* 2️⃣ ADMIN ROUTES - Protected: Always rendered so ProtectedRoute redirects unauthenticated users to login */}
            <Route path="/admin/*" element={<ProtectedRoute Component={Admin} />} />

            {/* 3️⃣ SUPER ADMIN ROUTES - Protected */}
            <Route path="/super-admin/*" element={<ProtectedRoute Component={SuperAdmin} />} />

            {/* 4️⃣ PUBLIC ROUTES (includes home, pricing, checkout, etc.) */}
            <Route path="/*" element={<PublicRoutes />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <Provider store={store} stabilityCheck="never">
      <ProviderConfig />
    </Provider>
  );
}

export default App;
