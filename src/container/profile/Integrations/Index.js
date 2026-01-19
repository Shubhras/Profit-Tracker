import React from 'react';
import IntegrationBanner from './components/IntegrationBanner';
import IntegrationChannel from './components/IntegrationChannel';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function Integrations() {
  return (
    <>
      <Navbar />
      <IntegrationBanner />
      <IntegrationChannel />
      <Footer />
    </>
  );
}
