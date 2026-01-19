import propTypes from 'prop-types';
import React from 'react';
import { useSelector } from 'react-redux';
// import { Navigate, Route, Routes } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

// function ProtectedRoute({ Component, path }) {
//   const isLoggedIn = useSelector((state) => state.auth.login);

//   return isLoggedIn ? (
//     <Routes>
//       {' '}
//       <Route element={<Component />} path={path} />{' '}
//     </Routes>
//   ) : (
//     <Routes>
//       {' '}
//       <Route path="/hexadash-react/admin" element={<Navigate to="/" />} />
//     </Routes>
//   );
// }

// ProtectedRoute.propTypes = {
//   Component: propTypes.object.isRequired,
//   path: propTypes.string.isRequired,
// };

function ProtectedRoute({ Component }) {
  const isLoggedIn = useSelector((state) => state.auth.login);

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Component />;
}

ProtectedRoute.propTypes = {
  Component: propTypes.elementType.isRequired,
};

export default ProtectedRoute;
