import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';

const Overview = lazy(() => import('../../container/organicPerformance/Overview'));
const TrafficVisbility = lazy(() => import('../../container/organicPerformance/TrafficVisbility'));
const SalesDrivers = lazy(() => import('../../container/organicPerformance/SalesDrivers'));
const KeywordPerformance = lazy(() => import('../../container/organicPerformance/KeywordPerformance'));
const ProductRanking = lazy(() => import('../../container/organicPerformance/ProductRanking'));
const ReviewRanking = lazy(() => import('../../container/organicPerformance/ReviewRanking'));
const InventoryImpact = lazy(() => import('../../container/organicPerformance/InventoryImpact'));
const Reports = lazy(() => import('../../container/organicPerformance/Reports'));

const NotFound = lazy(() => import('../../container/pages/404'));

function OrganicPerformRoutes() {
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
        path="trafficVisibility"
        element={
          <SubscriptionGate allowFree>
            <TrafficVisbility />
          </SubscriptionGate>
        }
      />

      <Route
        path="salesDrivers"
        element={
          <SubscriptionGate allowFree>
            <SalesDrivers />
          </SubscriptionGate>
        }
      />
      <Route
        path="Keyperformance"
        element={
          <SubscriptionGate allowFree>
            <KeywordPerformance />
          </SubscriptionGate>
        }
      />

      <Route
        path="productranking"
        element={
          <SubscriptionGate allowFree>
            <ProductRanking />
          </SubscriptionGate>
        }
      />

      <Route
        path="reviewRating"
        element={
          <SubscriptionGate allowFree>
            <ReviewRanking />
          </SubscriptionGate>
        }
      />
      <Route
        path="inventoryImpact"
        element={
          <SubscriptionGate allowFree>
            <InventoryImpact />
          </SubscriptionGate>
        }
      />

      <Route
        path="reports"
        element={
          <SubscriptionGate allowFree>
            <Reports />
          </SubscriptionGate>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default OrganicPerformRoutes;
