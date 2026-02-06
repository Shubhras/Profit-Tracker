import React from 'react';
import Navbar from '../home/components/Navbar';
import TestimonialsSection from '../home/components/TestimonialsSection';
import Footer from '../home/components/Footer';
import ScrollToTopButton from '../home/components/ScrollToTopButton';

function Testimonials() {
  return (
    <>
      <Navbar />
      <TestimonialsSection />
      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default Testimonials;
