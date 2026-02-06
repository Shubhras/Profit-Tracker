import React from 'react';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <div className="pt-32 pb-12 px-[5%] max-w-7xl mx-auto">
        <h1 className="text-4xl min-md:text-5xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-lg text-gray-600">
          <p className="mb-4">Last Updated: February 2026</p>
          <p className="mb-6">
            Welcome to Profit-Tracker. We are committed to protecting your personal information and your right to
            privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to
            your personal information, please contact us at hello@profit-tracker.in.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect personal information that you voluntarily provide to us when you register on the website, express
            an interest in obtaining information about us or our products and services, when you participate in
            activities on the website or otherwise when you contact us.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            2. How We Use Your Information
          </h2>
          <p className="mb-4">
            We use personal information collected via our website for a variety of business purposes described below. We
            process your personal information for these purposes in reliance on our legitimate business interests, in
            order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal
            obligations.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            3. Sharing Your Information
          </h2>
          <p className="mb-4">
            We only share information with your consent, to comply with laws, to provide you with services, to protect
            your rights, or to fulfill business obligations.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            4. Security of Your Information
          </h2>
          <p className="mb-4">
            We use administrative, technical, and physical security measures to help protect your personal information.
            While we have taken reasonable steps to secure the personal information you provide to us, please be aware
            that despite our efforts, no security measures are perfect or impenetrable, and no method of data
            transmission can be guaranteed against any interception or other type of misuse.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
