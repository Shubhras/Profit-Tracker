import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';

const Overview = lazy(() => import('../../container/advertising/Overview'));
const NotFound = lazy(() => import('../../container/pages/404'));

function AdvertisingRoutes() {
  return (
    <Routes>
      <Route
        path="overview"
        element={
          <SubscriptionGate allowFree>
            <Overview />
          </SubscriptionGate>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AdvertisingRoutes;
