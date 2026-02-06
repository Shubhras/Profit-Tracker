import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';

const Summary = lazy(() => import('../../container/profit/Summary'));
const SalesTrend = lazy(() => import('../../container/profit/SalesTrend'));
const ProfitTableView = lazy(() => import('../../container/profit/ProfitTableView'));
const ProfitMonthlyView = lazy(() => import('../../container/profit/ProfitMonthlyView'));
const CanvasMYOR = lazy(() => import('../../container/profit/CanvasMYOR'));
const NotFound = lazy(() => import('../../container/pages/404'));

function ProfitRoutes() {
  return (
    <Routes>
      <Route
        path="summary"
        element={
          <SubscriptionGate allowFree>
            <Summary />
          </SubscriptionGate>
        }
      />
      <Route
        path="salestrend"
        element={
          <SubscriptionGate>
            <SalesTrend />
          </SubscriptionGate>
        }
      />
      <Route
        path="profittableview"
        element={
          <SubscriptionGate>
            <ProfitTableView />
          </SubscriptionGate>
        }
      />
      <Route
        path="profitmonthlyview"
        element={
          <SubscriptionGate>
            <ProfitMonthlyView />
          </SubscriptionGate>
        }
      />
      <Route
        path="canvasmyor"
        element={
          <SubscriptionGate>
            <CanvasMYOR />
          </SubscriptionGate>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default ProfitRoutes;
