import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const ViewUser = lazy(() => import('../../container/admin/ViewUser'));
const Users = lazy(() => import('../../container/admin/Users'));

const NotFound = lazy(() => import('../../container/pages/404'));

function UserRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<Users />} />
        <Route path="view" element={<ViewUser />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default UserRoutes;
