import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminDashboard from '../../container/admin/AdminDashboard';
import Subscription from '../../container/admin/Subscription';
import CouponCode from '../../container/admin/CouponCode';
import Users from '../../container/admin/Users';
import withAdminLayout from '../../layout/withAdminLayout';

function SuperAdminRoutes() {
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="subscription" element={<Subscription />} />

      <Route path="CouponCode" element={<CouponCode />} />
      <Route path="users" element={<Users />} />
    </Routes>
  );
}

export default withAdminLayout(SuperAdminRoutes);
