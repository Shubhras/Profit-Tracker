import propTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
// import { Navigate, Route, Routes } from 'react-router-dom';
import { Navigate, useLocation } from 'react-router-dom';

// =============================================================================
// PREVIOUS CODE (Commented out):
// Did not pass the current location in state when redirecting to /auth/login.
//
// function ProtectedRoute({ Component }) {
//   const isLoggedIn = useSelector((state) => state.auth.login);
//   if (!isLoggedIn) {
//     return <Navigate to="/auth/login" replace />;
//   }
//   return <Component />;
// }
// =============================================================================

// =============================================================================
// NEW CODE:
// Passes state={{ from: location }} so that after the user logs in, the login
// page (SignIn.js) can read location.state.from and automatically navigate the
// user back to the deep link they originally requested (e.g. /admin/pages/billing).
// =============================================================================
function ProtectedRoute({ Component }) {
  const isLoggedIn = useSelector((state) => state.auth.login);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Component />;
}

ProtectedRoute.propTypes = {
  Component: propTypes.elementType.isRequired,
};

export default ProtectedRoute;
