import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';
import Placements from '../../container/advertising/Placements';

const Overview = lazy(() => import('../../container/advertising/Overview'));
const CreateCampaign = lazy(() => import('../../container/advertising/CreateCampaign'));
const Campaigns = lazy(() => import('../../container/advertising/Campaigns'));
const AdGroups = lazy(() => import('../../container/advertising/AdGroups'));
const AdProducts = lazy(() => import('../../container/advertising/AdProducts'));
const SearchTerms = lazy(() => import('../../container/advertising/SearchTerms'));
const CampaignDetails = lazy(() => import('../../container/advertising/CampaignDetails'));
const CampaignSecondDetails = lazy(() => import('../../container/advertising/CampaignSecondDetails'));
const Keywords = lazy(() => import('../../container/advertising/Keywords'));
const AdProductsSecond = lazy(() => import('../../container/advertising/AdProductsSecond'));
const AdsProductsThird = lazy(() => import('../../container/advertising/AdsProductsThird'));

const NegativeKey = lazy(() => import('../../container/advertising/NegativeKey'));
const Targets = lazy(() => import('../../container/advertising/Targets'));

const RulesAutomationPage = lazy(() => import('../../container/advertising/RulesAutomation'));

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
        path="create-campaign"
        element={
          <SubscriptionGate allowFree>
            <CreateCampaign />
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
        path="targets"
        element={
          <SubscriptionGate allowFree>
            <Targets />
          </SubscriptionGate>
        }
      />

      <Route
        path="rulesAuto"
        element={
          <SubscriptionGate allowFree>
            <RulesAutomationPage />
          </SubscriptionGate>
        }
      />

      <Route
        path="AdProducts"
        element={
          <SubscriptionGate allowFree>
            <AdProducts />
          </SubscriptionGate>
        }
      />

      <Route
        path="campaign-details/:id"
        element={
          <SubscriptionGate allowFree>
            <CampaignDetails />
          </SubscriptionGate>
        }
      />
      <Route
        path="campaign-second-details/:id"
        element={
          <SubscriptionGate allowFree>
            <CampaignSecondDetails />
          </SubscriptionGate>
        }
      />

      <Route
        path="AdProduct-Details/:sku"
        element={
          <SubscriptionGate allowFree>
            <AdProductsSecond />
          </SubscriptionGate>
        }
      />

      <Route
        path="AdsProducts/:id"
        element={
          <SubscriptionGate allowFree>
            <AdsProductsThird />
          </SubscriptionGate>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AdvertisingRoutes;
