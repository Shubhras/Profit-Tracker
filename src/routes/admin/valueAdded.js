import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';

const Overview = lazy(() => import('../../container/valueAdded/Overview'));
const AccountManage = lazy(() => import('../../container/valueAdded/AccountManage'));
const DigitalMarket = lazy(() => import('../../container/valueAdded/DigitalMarket'));
const QuickCommerce = lazy(() => import('../../container/valueAdded/QuickCommerce'));
const MyService = lazy(() => import('../../container/valueAdded/MyService'));
const InvoicesBilling = lazy(() => import('../../container/valueAdded/InvoicesBilling'));
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
      <Route
        path="accountmanage"
        element={
          <SubscriptionGate allowFree>
            <AccountManage />
          </SubscriptionGate>
        }
      />

      <Route
        path="digitalmarketing"
        element={
          <SubscriptionGate allowFree>
            <DigitalMarket />
          </SubscriptionGate>
        }
      />
      <Route
        path="QuickCommerce"
        element={
          <SubscriptionGate allowFree>
            <QuickCommerce />
          </SubscriptionGate>
        }
      />
      <Route
        path="myservices"
        element={
          <SubscriptionGate allowFree>
            <MyService />
          </SubscriptionGate>
        }
      />
      <Route
        path="invoicebilling"
        element={
          <SubscriptionGate allowFree>
            <InvoicesBilling />
          </SubscriptionGate>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AdvertisingRoutes;
