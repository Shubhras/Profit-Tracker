import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const AddSubscription = lazy(() => import('../../container/admin/AddSubscription'));
const Subscription = lazy(() => import('../../container/admin/Subscription'));

const NotFound = lazy(() => import('../../container/pages/404'));

function SubscriptionRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route index element={<Subscription />} />
        <Route path="add" element={<AddSubscription />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default SubscriptionRoutes;
