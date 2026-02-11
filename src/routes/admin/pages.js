import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import SubscriptionGate from '../../components/utilities/SubscriptionGate';

const NotFound = lazy(() => import('../../container/pages/404'));
const Pricing = lazy(() => import('../../container/pages/PricingTable'));
const Maintenance = lazy(() => import('../../container/pages/Maintenance'));
const Faq = lazy(() => import('../../container/pages/Faq'));
const Search = lazy(() => import('../../container/pages/SearchResult'));
const ComingSoon = lazy(() => import('../../container/pages/ComingSoon'));
const TermsCondition = lazy(() => import('../../container/pages/TermsConditions'));
const Wizards = lazy(() => import('../../container/pages/wizards/Wizards'));
const BlogOne = lazy(() => import('../../container/pages/blog/BlogOne'));
const BlogTwo = lazy(() => import('../../container/pages/blog/BlogTwo'));
const BlogThree = lazy(() => import('../../container/pages/blog/BlogThree'));
const BlogDetails = lazy(() => import('../../container/pages/blog/BlogDetails'));
const BlankPage = lazy(() => import('../../container/pages/BlankPage'));
const Settings = lazy(() => import('../../container/profile/settings/Settings'));
const ChangeLog = lazy(() => import('../../container/pages/ChangeLog'));
const Banners = lazy(() => import('../../container/pages/Banners'));
const Testimonials = lazy(() => import('../../container/pages/Testimonials'));
const ActionsRequired = lazy(() => import('../../container/pages/ActionsRequired'));
const Download = lazy(() => import('../../container/pages/Download'));
const Billing = lazy(() => import('../../container/pages/Billing'));

function PagesRoute() {
  return (
    <Routes>
      <Route
        index
        element={
          <SubscriptionGate>
            <ActionsRequired />
          </SubscriptionGate>
        }
      />
      <Route
        path="actionsrequired"
        element={
          <SubscriptionGate>
            <ActionsRequired />
          </SubscriptionGate>
        }
      />
      <Route
        path="download"
        element={
          <SubscriptionGate>
            <Download />
          </SubscriptionGate>
        }
      />
      <Route
        path="changelog"
        element={
          <SubscriptionGate>
            <ChangeLog />
          </SubscriptionGate>
        }
      />
      <Route
        path="settings/*"
        element={
          <SubscriptionGate allowFree>
            <Settings />
          </SubscriptionGate>
        }
      />
      <Route
        path="billing"
        element={
          <SubscriptionGate allowFree>
            <Billing />
          </SubscriptionGate>
        }
      />
      <Route
        path="Pricing"
        element={
          <SubscriptionGate allowFree>
            <Pricing />
          </SubscriptionGate>
        }
      />
      <Route
        path="banners"
        element={
          <SubscriptionGate>
            <Banners />
          </SubscriptionGate>
        }
      />
      <Route
        path="testimonials"
        element={
          <SubscriptionGate>
            <Testimonials />
          </SubscriptionGate>
        }
      />
      <Route
        path="faq"
        element={
          <SubscriptionGate>
            <Faq />
          </SubscriptionGate>
        }
      />
      <Route
        path="search"
        element={
          <SubscriptionGate>
            <Search />
          </SubscriptionGate>
        }
      />
      <Route
        path="starter"
        element={
          <SubscriptionGate>
            <BlankPage />
          </SubscriptionGate>
        }
      />
      <Route
        path="comingSoon"
        element={
          <SubscriptionGate>
            <ComingSoon />
          </SubscriptionGate>
        }
      />
      <Route
        path="termCondition"
        element={
          <SubscriptionGate>
            <TermsCondition />
          </SubscriptionGate>
        }
      />
      <Route
        path="wizards/*"
        element={
          <SubscriptionGate>
            <Wizards />
          </SubscriptionGate>
        }
      />
      <Route
        path="blog/blogone"
        element={
          <SubscriptionGate>
            <BlogOne />
          </SubscriptionGate>
        }
      />
      <Route
        path="blog/blogtwo"
        element={
          <SubscriptionGate>
            <BlogTwo />
          </SubscriptionGate>
        }
      />
      <Route
        path="blog/blogthree"
        element={
          <SubscriptionGate>
            <BlogThree />
          </SubscriptionGate>
        }
      />
      <Route
        path="blog/details"
        element={
          <SubscriptionGate>
            <BlogDetails />
          </SubscriptionGate>
        }
      />
      <Route path="*" element={<NotFound />} />
      <Route path="maintenance" element={<Maintenance />} />
    </Routes>
  );
}

export default PagesRoute;
