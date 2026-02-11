import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';

const Overview = lazy(() => import('../../container/settings/product-settings/Overview'));
const ProductConfiguration = lazy(() => import('../../container/settings/product-settings/ProductConfiguration'));
const FinanceConfiguration = lazy(() => import('../../container/settings/product-settings/FinanceConfiguration'));
const AccountSettings = lazy(() => import('../../container/settings/AccountSettings'));
const MarketPlaceSettings = lazy(() => import('../../container/settings/MarketPlaceSettings'));
const MarketplaceConnection = lazy(() => import('../../container/settings/MarketplaceConnection'));
const UserManagement = lazy(() => import('../../container/settings/UserManagement'));
const NotFound = lazy(() => import('../../container/pages/404'));

function SettingsRoutes() {
  return (
    <Routes>
      <Route
        path="product-setting/overview"
        element={
          <SubscriptionGate>
            <Overview />
          </SubscriptionGate>
        }
      />
      <Route
        path="product-setting/product-configuration"
        element={
          <SubscriptionGate>
            <ProductConfiguration />
          </SubscriptionGate>
        }
      />
      <Route
        path="product-setting/finance-configuration"
        element={
          <SubscriptionGate>
            <FinanceConfiguration />
          </SubscriptionGate>
        }
      />
      <Route
        path="user-setting/account-settings"
        element={
          <SubscriptionGate allowFree>
            <AccountSettings />
          </SubscriptionGate>
        }
      />
      <Route
        path="user-setting/marketplace-settings"
        element={
          <SubscriptionGate>
            <MarketPlaceSettings />
          </SubscriptionGate>
        }
      />
      <Route
        path="user-setting/marketplace-connection"
        element={
          <SubscriptionGate>
            <MarketplaceConnection />
          </SubscriptionGate>
        }
      />
      <Route
        path="user-setting/user-management"
        element={
          <SubscriptionGate>
            <UserManagement />
          </SubscriptionGate>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default SettingsRoutes;
