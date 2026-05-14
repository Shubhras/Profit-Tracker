import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';
import Placements from '../../container/advertising/Placements';

const Overview = lazy(() => import('../../container/advertising/Overview'));
const Campaigns = lazy(() => import('../../container/advertising/Campaigns'));
const AdGroups = lazy(() => import('../../container/advertising/AdGroups'));

const SearchTerms = lazy(() => import('../../container/advertising/SearchTerms'));

const Keywords = lazy(() => import('../../container/advertising/Keywords'));

const NegativeKey = lazy(() => import('../../container/advertising/NegativeKey'));

const RulesAutomation = lazy(() => import('../../container/advertising/RulesAutomation'));

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
        path="campaigns"
        element={
          <SubscriptionGate allowFree>
            <Campaigns />
          </SubscriptionGate>
        }
      />

      <Route
        path="adsgroup"
        element={
          <SubscriptionGate allowFree>
            <AdGroups />
          </SubscriptionGate>
        }
      />

      <Route
        path="searchTerms"
        element={
          <SubscriptionGate allowFree>
            <SearchTerms />
          </SubscriptionGate>
        }
      />

      <Route
        path="keywords"
        element={
          <SubscriptionGate allowFree>
            <Keywords />
          </SubscriptionGate>
        }
      />

      <Route
        path="placements"
        element={
          <SubscriptionGate allowFree>
            <Placements />
          </SubscriptionGate>
        }
      />

      <Route
        path="negativeKey"
        element={
          <SubscriptionGate allowFree>
            <NegativeKey />
          </SubscriptionGate>
        }
      />

      <Route
        path="rulesAuto"
        element={
          <SubscriptionGate allowFree>
            <RulesAutomation />
          </SubscriptionGate>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AdvertisingRoutes;
