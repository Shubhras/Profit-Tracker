import React, { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

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
      <Route path="product-setting/overview" element={<Overview />} />
      <Route path="product-setting/product-configuration" element={<ProductConfiguration />} />
      <Route path="product-setting/finance-configuration" element={<FinanceConfiguration />} />
      <Route path="user-setting/account-settings" element={<AccountSettings />} />
      <Route path="user-setting/marketplace-settings" element={<MarketPlaceSettings />} />
      <Route path="user-setting/marketplace-connection" element={<MarketplaceConnection />} />
      <Route path="user-setting/user-management" element={<UserManagement />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default SettingsRoutes;
