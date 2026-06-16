import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';

const Summary = lazy(() => import('../../container/profit/Summary'));
const SalesTrend = lazy(() => import('../../container/profit/SalesTrend'));
const ProfitTableView = lazy(() => import('../../container/profit/ProfitTableView'));
const ProfitMonthlyView = lazy(() => import('../../container/profit/ProfitMonthlyView'));
const CanvasMYOR = lazy(() => import('../../container/profit/CanvasMYOR'));
const EstimatedFees = lazy(() => import('../../container/profit/EstimatedFees'));
const SkuWise = lazy(() => import('../../container/profit/SkuWise'));
const MarketplaceFees = lazy(() => import('../../container/profit/MarketplaceFees'));
const ShippingEstimate = lazy(() => import('../../container/profit/ShippingEstimate'));
const Claims = lazy(() => import('../../container/profit/Claims'));
const ReturnRefundFees = lazy(() => import('../../container/profit/ReturnRefundFees'));
const TaxCalulation = lazy(() => import('../../container/profit/TaxCalulation'));

const SalesDetails = lazy(() => import('../../container/profit/SalesDetails'));
const ProfitTableDetails = lazy(() => import('../../container/profit/ProfiteTableDetail'));
const ProfitViewThirdTable = lazy(() => import('../../container/profit/ProfitViewThirdTable'));
const ProfitViewSecondTable = lazy(() => import('../../container/profit/ProfitViewSecondTable'));
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
      {/* <Route
        path="profittableview"
        element={
          <SubscriptionGate>
            <ProfitTableView />
          </SubscriptionGate>
        }
      /> */}
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
      <Route
        path="estimatedfees"
        element={
          <SubscriptionGate>
            <EstimatedFees />
          </SubscriptionGate>
        }
      />

      <Route
        path="skuwise"
        element={
          <SubscriptionGate>
            <SkuWise />
          </SubscriptionGate>
        }
      />

      <Route
        path="estimatedfees"
        element={
          <SubscriptionGate>
            <MarketplaceFees />
          </SubscriptionGate>
        }
      />
      <Route
        path="shippingestimate"
        element={
          <SubscriptionGate>
            <ShippingEstimate />
          </SubscriptionGate>
        }
      />
      <Route
        path="claims"
        element={
          <SubscriptionGate>
            <Claims />
          </SubscriptionGate>
        }
      />

      <Route
        path="returnfees"
        element={
          <SubscriptionGate>
            <ReturnRefundFees />
          </SubscriptionGate>
        }
      />
      <Route
        path="taxcalculation"
        element={
          <SubscriptionGate>
            <TaxCalulation />
          </SubscriptionGate>
        }
      />
      <Route
        path="salesdetails/:id"
        element={
          <SubscriptionGate>
            <SalesDetails />
          </SubscriptionGate>
        }
      />
      <Route path="profitTableView">
        <Route
          index
          element={
            <SubscriptionGate>
              <ProfitTableView />
            </SubscriptionGate>
          }
        />

        <Route
          path="details"
          element={
            <SubscriptionGate>
              <ProfitTableDetails />
            </SubscriptionGate>
          }
        />

        <Route
          path="second/:asin"
          element={
            <SubscriptionGate>
              <ProfitViewSecondTable />
            </SubscriptionGate>
          }
        />

        <Route
          path="third/:id"
          element={
            <SubscriptionGate>
              <ProfitViewThirdTable />
            </SubscriptionGate>
          }
        />
      </Route>
      {/* <Route
        path="details"
        element={
          <SubscriptionGate>
            <ProfitTableDetails />
          </SubscriptionGate>
        }
      />
      <Route
        path="profitThirdtable/:id"
        element={
          <SubscriptionGate>
            <ProfitViewThirdTable />
          </SubscriptionGate>
        }
      />
      <Route
        path="profitSecondtable/:asin"
        element={
          <SubscriptionGate>
            <ProfitViewSecondTable />
          </SubscriptionGate>
        }
      /> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default ProfitRoutes;
