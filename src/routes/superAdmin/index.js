import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SubscriptionRoutes from './Subscription';
import UserRoutes from './User';
import AdminDashboard from '../../container/admin/AdminDashboard';
// import Subscription from '../../container/admin/Subscription';
import CouponCode from '../../container/admin/CouponCode';
import Users from '../../container/admin/Users';
import MarketplaceIntegration from '../../container/admin/MarketplaceIntegration';
import HelpSupport from '../../container/admin/HelpSupport';
import PrivacyPolicy from '../../container/admin/PrivacyPolicy';
import Module from '../../container/admin/Module';
import Notification from '../../container/admin/Notifications';
import SubModule from '../../container/admin/SubModule';
import AdminUsers from '../../container/admin/AdminUsers';
import withAdminLayout from '../../layout/withAdminLayout';
import AddSubscription from '../../container/admin/AddSubscription';

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      {/* <Route path="subscription" element={<Subscription />} /> */}

      <Route path="subscription/*" element={<SubscriptionRoutes />} />
      <Route path="user/*" element={<UserRoutes />} />

      <Route path="add" element={<AddSubscription />} />

      <Route path="CouponCode" element={<CouponCode />} />
      <Route path="notifications" element={<Notification />} />
      <Route path="support" element={<HelpSupport />} />
      <Route path="module" element={<Module />} />
      <Route path="submodule" element={<SubModule />} />
      <Route path="admin-users" element={<AdminUsers />} />

      <Route path="privacy-policy" element={<PrivacyPolicy />} />
      <Route path="marketplaceIntegration" element={<MarketplaceIntegration />} />
      <Route path="users" element={<Users />} />
    </Routes>
  );
}

export default withAdminLayout(SuperAdminRoutes);
