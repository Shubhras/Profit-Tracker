import { Spin } from 'antd';
import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AmazonAdsCallback from '../container/profit/AmazonAdsCallback';

const Home = lazy(() => import('../container/profile/home/Index'));
const Contact = lazy(() => import('../container/profile/contactus/Index'));
const Pricing = lazy(() => import('../container/profile/pricing/Index'));
const RefundFees = lazy(() => import('../container/profile/refundFees/Index'));
const Integrations = lazy(() => import('../container/profile/Integrations/Index'));
const Checkout = lazy(() => import('../container/pages/Checkout'));
const About = lazy(() => import('../container/profile/about/Index'));
const Testimonials = lazy(() => import('../container/profile/testimonials/Index'));
const PrivacyPolicy = lazy(() => import('../container/profile/legal/PrivacyPolicy'));
const TermsConditions = lazy(() => import('../container/profile/legal/TermsConditions'));
const AmazonCallback = lazy(() => import('../container/profit/AmazonCallback'));

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
        <Route path="/api/amazon/callback" element={<AmazonCallback />} />
        <Route path="/api/amazon/callback/advertise" element={<AmazonAdsCallback />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<RefundFees />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/about" element={<About />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
      </Routes>
    </Suspense>
  );
}

export default PublicRoutes;
