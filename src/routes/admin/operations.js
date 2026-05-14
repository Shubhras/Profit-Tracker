import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';

const DailtyOperations = lazy(() => import('../../container/Operations/DailtyOperations'));
const OrderProcessing = lazy(() => import('../../container/Operations/OrderProcessing'));
const Inventory = lazy(() => import('../../container/Operations/Inventory'));
const AutoClaims = lazy(() => import('../../container/Operations/AutoClaims'));
const LogsHistory = lazy(() => import('../../container/Operations/LogsHistory'));
const Settings = lazy(() => import('../../container/Operations/Settings'));
const NotFound = lazy(() => import('../../container/pages/404'));

function OperationsRoutes() {
  return (
    <Routes>
      <Route
        path="dailyOperations"
        element={
          <SubscriptionGate allowFree>
            <DailtyOperations />
          </SubscriptionGate>
        }
      />
      <Route
        path="orderProcessing"
        element={
          <SubscriptionGate allowFree>
            <OrderProcessing />
          </SubscriptionGate>
        }
      />

      <Route
        path="inventorySync"
        element={
          <SubscriptionGate allowFree>
            <Inventory />
          </SubscriptionGate>
        }
      />

      <Route
        path="autoClaims"
        element={
          <SubscriptionGate allowFree>
            <AutoClaims />
          </SubscriptionGate>
        }
      />

      <Route
        path="logsHistory"
        element={
          <SubscriptionGate allowFree>
            <LogsHistory />
          </SubscriptionGate>
        }
      />

      <Route
        path="settings"
        element={
          <SubscriptionGate allowFree>
            <Settings />
          </SubscriptionGate>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default OperationsRoutes;
