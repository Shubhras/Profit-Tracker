import React from 'react';
import IntegrationBanner from './components/IntegrationBanner';
import IntegrationChannel from './components/IntegrationChannel';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import ScrollToTopButton from '../home/components/ScrollToTopButton';

export default function Integrations() {
  return (
    <>
      <Navbar />
      <IntegrationBanner />
      <IntegrationChannel />
      <Footer />
      <ScrollToTopButton />
    </>
  );
}
