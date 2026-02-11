import React from 'react';
import PricingBanner from './components/PricingBanner';
import PricingCards from './components/PricingCards';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import ScrollToTopButton from '../home/components/ScrollToTopButton';

function Pricing() {
  return (
    <>
      <Navbar />
      <PricingBanner />
      <PricingCards />
      <Footer />
      <ScrollToTopButton />
    </>
  );
}
export default Pricing;
