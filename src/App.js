import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from 'styled-components';
// import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import store from './redux/store';
import Admin from './routes/admin';
import Auth from './routes/auth';
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
            {/* 1️⃣ AUTH ROUTES - Must come before catch-all */}
            {!isLoggedIn && <Route path="/auth/*" element={<Auth />} />}

            {/* 2️⃣ ADMIN ROUTES - Protected */}
            {isLoggedIn && <Route path="/admin/*" element={<ProtectedRoute Component={Admin} />} />}

            {/* 3️⃣ PUBLIC ROUTES (includes home, pricing, checkout, etc.) */}
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
