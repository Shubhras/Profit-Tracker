import React from 'react';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />

      <div className="pt-32 pb-12 px-[3%] max-w-7xl mx-auto">
        <h1 className="text-4xl min-md:text-5xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="text-base text-gray-600">
          <p className="mb-4">Last Updated: February 2026</p>

          <p className="mb-6">
            This Privacy Policy explains how TrackMyProfit collects, uses, stores, and protects user data. TrackMyProfit
            is committed to data security, transparency, and regulatory compliance.
          </p>

          {/* 1 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">1. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">a) Account Information</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Company / Brand name</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">b) Seller & Analytics Data</h3>
          <p className="mb-2">With user authorization, we may access:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Sales metrics</li>
            <li>Orders summary data</li>
            <li>Inventory data</li>
            <li>Advertising performance data</li>
            <li>Brand-level analytics (aggregated and anonymized)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">c) Technical Information</h3>
          <ul className="list-disc ml-6 mb-4">
            <li>IP address</li>
            <li>Browser type</li>
            <li>Usage logs</li>
            <li>Device information</li>
          </ul>

          {/* 3 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">2. How We Use Data</h2>

          <p className="mb-2">We use data only to:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Generate analytics dashboards</li>
            <li>Display performance reports</li>
            <li>Improve product features</li>
            <li>Provide customer support</li>
            <li>Ensure security and compliance</li>
          </ul>

          <p className="mb-2 font-semibold">We do not:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Sell data</li>
            <li>Share data with third parties for marketing</li>
            <li>Use data for competitive intelligence outside the user’s account</li>
          </ul>

          {/* 4 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            3. Brand Analytics Compliance
          </h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Used only for the authenticated user</li>
            <li>Displayed in aggregated and analytical form</li>
            <li>Never exposed publicly or shared across users</li>
            <li>Never used to identify individual sellers or brands</li>
          </ul>

          {/* 5 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">4. Data Storage & Security</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Secure cloud infrastructure</li>
            <li>Encrypted data storage (at rest & in transit)</li>
            <li>Role-based access controls</li>
            <li>Audit logging</li>
            <li>Regular security reviews</li>
          </ul>
          <p className="mb-4">Only authorized systems and personnel can access user data.</p>

          {/* 6 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">5. Personal Data (PII)</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Used strictly for analytics display</li>
            <li>Never shared or sold</li>
            <li>Retained only as long as necessary</li>
          </ul>

          {/* 7 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">6. Data Retention</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Data is retained only while the account is active</li>
            <li>Users may disconnect integrations at any time</li>
            <li>Upon account deletion, data is permanently removed</li>
          </ul>

          {/* 8 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">7. User Rights</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Request data access</li>
            <li>Request data deletion</li>
            <li>Revoke API permissions</li>
            <li>Update account information</li>
          </ul>
          <p className="mb-4">Requests can be submitted via support email.</p>

          {/* 9 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">8. Cookies & Tracking</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Authentication</li>
            <li>Session management</li>
            <li>Product analytics</li>
          </ul>
          <p className="mb-4">Cookies do not collect sensitive seller data.</p>

          {/* 10 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">9. Third-Party Services</h2>
          <p className="mb-4">
            We may use trusted infrastructure providers for hosting, logging, and error monitoring. All providers comply
            with strict data protection standards.
          </p>

          {/* 11 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            10. No Platform Endorsement
          </h2>
          <p className="mb-4">
            TrackMyProfit is an independent analytics application and does not represent any marketplace or platform
            provider.
          </p>

          {/* 12 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">11. Policy Updates</h2>
          <p className="mb-4">We may update this policy periodically. Continued use indicates acceptance.</p>

          {/* 13 */}
          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">12. Contact</h2>
          <p className="mb-2">📧 privacy@trackmyprofit.com</p>
          <p>🌐 https://trackmyprofit.com/privacy-policy</p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default PrivacyPolicy;
