import { Spin } from 'antd';
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('../container/profile/home/Index'));
const Contact = lazy(() => import('../container/profile/contactus/Index'));
const Pricing = lazy(() => import('../container/profile/pricing/Index'));
const Integrations = lazy(() => import('../container/profile/Integrations/Index'));

function PublicRoutes() {
  return (
    <Suspense
      fallback={
        <div className="spin flex items-center justify-center bg-white dark:bg-dark h-screen w-full fixed z-[999] ltr:left-0 rtl:right-0 top-0">
          <Spin />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Suspense>
  );
}

export default PublicRoutes;
