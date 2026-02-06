import React from 'react';
import AboutSection from './components/AboutSection';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import ScrollToTopButton from '../home/components/ScrollToTopButton';

function About() {
  return (
    <>
      <Navbar />
      <AboutSection />
      <Footer />
      <ScrollToTopButton />
    </>
  );
}

export default About;
