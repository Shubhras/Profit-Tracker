import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const Summary = lazy(() => import('../../container/profit/Summary'));
const SalesTrend = lazy(() => import('../../container/profit/SalesTrend'));
const ProfitTableView = lazy(() => import('../../container/profit/ProfitTableView'));
const ProfitMonthlyView = lazy(() => import('../../container/profit/ProfitMonthlyView'));
const CanvasMYOR = lazy(() => import('../../container/profit/CanvasMYOR'));
const NotFound = lazy(() => import('../../container/pages/404'));

function ProfitRoutes() {
  return (
    <Routes>
      <Route path="summary" element={<Summary />} />
      <Route path="salestrend" element={<SalesTrend />} />
      <Route path="profittableview" element={<ProfitTableView />} />
      <Route path="profitmonthlyview" element={<ProfitMonthlyView />} />
      <Route path="canvasmyor" element={<CanvasMYOR />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default ProfitRoutes;
