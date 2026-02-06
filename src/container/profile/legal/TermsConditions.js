import React from 'react';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

function TermsConditions() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="pt-32 pb-12 px-[5%] max-w-7xl mx-auto">
        <h1 className="text-4xl min-md:text-5xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">Last Updated: February 2026</p>
          <p className="mb-6">
            These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on
            behalf of an entity (“you”) and Profit-Tracker (“we,” “us” or “our”), concerning your access to and use of
            the Profit-Tracker website as well as any other media form, media channel, mobile website or mobile
            application related, linked, or otherwise connected thereto (collectively, the “Site”).
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">
            By accessing the Site, you agree that you have read, understood, and agreed to be bound by all of these
            Terms and Conditions. If you do not agree with all of these terms and conditions, then you are expressly
            prohibited from using the Site and you must discontinue use immediately.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            2. Intellectual Property Rights
          </h2>
          <p className="mb-4">
            Unless otherwise indicated, the Site is our proprietary property and all source code, databases,
            functionality, software, website designs, audio, video, text, photographs, and graphics on the Site
            (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”)
            are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">3. User Representations</h2>
          <p className="mb-4">
            By using the Site, you represent and warrant that: (1) all registration information you submit will be true,
            accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update
            such registration information as necessary; (3) you have the legal capacity and you agree to comply with
            these Terms and Conditions.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">4. Limitation of Liability</h2>
          <p className="mb-4">
            In no event will we or our directors, employees, or agents be liable to you or any third party for any
            direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit,
            lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised
            of the possibility of such damages.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default TermsConditions;
