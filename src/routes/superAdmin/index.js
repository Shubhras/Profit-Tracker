import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../../container/admin/AdminDashboard';
import Subscription from '../../container/admin/Subscription';
import CouponCode from '../../container/admin/CouponCode';
import Users from '../../container/admin/Users';
import MarketplaceIntegration from '../../container/admin/MarketplaceIntegration';
import HelpSupport from '../../container/admin/HelpSupport';
import Notification from '../../container/admin/Notifications';
import withAdminLayout from '../../layout/withAdminLayout';

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="subscription" element={<Subscription />} />

      <Route path="CouponCode" element={<CouponCode />} />
      <Route path="notifications" element={<Notification />} />
      <Route path="support" element={<HelpSupport />} />
      <Route path="marketplaceIntegration" element={<MarketplaceIntegration />} />
      <Route path="users" element={<Users />} />
    </Routes>
  );
}

export default withAdminLayout(SuperAdminRoutes);
