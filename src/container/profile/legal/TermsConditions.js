import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { getPrivacyPolicy } from '../../../redux/admin/actionCreator';

function TermsConditions() {
  const dispatch = useDispatch();

  const { privacypolicyData, loading } = useSelector((state) => state.AdminDashboard);
  // const [loading, setLoading] = useState(true);

  const policyContent = privacypolicyData?.data?.[0]?.content || '';

  useEffect(() => {
    dispatch(getPrivacyPolicy('terms'));
  }, [dispatch]);

  return (
    <>
      <div className="bg-white min-h-screen">
        <Navbar />

        {/* <div className="pt-32 pb-12 px-[3%] max-w-7xl mx-auto">
        <h1 className="text-4xl min-md:text-5xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>

        <div className="text-base text-gray-600">
          <p className="mb-4">Last Updated: February 2026</p>

          <p className="mb-6">
            These Terms and Conditions constitute a legally binding agreement made between you, whether personally or on
            behalf of an entity (“you”) and TrackMyProfit (“we,” “us” or “our”), concerning your access to and use of
            the TrackMyProfit website and software platform (collectively, the “Service”).
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">1. About TrackMyProfit</h2>
          <p className="mb-4">
            TrackMyProfit is a self-serve, cloud-based SaaS analytics platform designed for online marketplace sellers.
            The application provides automated dashboards, reports, and performance analytics to help sellers understand
            sales trends, profitability, advertising performance, and brand-level insights.
          </p>
          <p className="mb-4">
            TrackMyProfit is a software product and does not provide consulting, agency, or managed account services.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">2. Eligibility</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>You are a legitimate seller or brand owner</li>
            <li>You have legal rights to access and analyze your seller data</li>
            <li>You are authorized to connect third-party APIs to your seller account</li>
          </ul>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            3. Nature of the Service (SaaS Clarification)
          </h2>
          <p className="mb-2">TrackMyProfit operates as:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>A publicly available software application</li>
            <li>A self-service platform with user-managed access</li>
            <li>A subscription-based analytics product</li>
          </ul>

          <p className="mb-2 font-semibold">TrackMyProfit does not:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Perform manual account operations</li>
            <li>Act on behalf of sellers</li>
            <li>Provide consulting or agency services</li>
            <li>Modify seller accounts or listings</li>
          </ul>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">4. Data Access & API Usage</h2>
          <p className="mb-4">
            Users may connect their seller accounts to enable sales analytics, profit analysis, inventory insights, and
            brand-level analytics. All data access is read-only and used solely to generate analytics for the
            authenticated user.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            5. Brand & Market Analytics Usage
          </h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Display aggregated performance metrics</li>
            <li>Generate trend analysis dashboards</li>
            <li>Provide category and brand-level insights</li>
            <li>Enable brand performance comparison over time</li>
          </ul>
          <p className="mb-4">TrackMyProfit does not resell, redistribute, or publicly expose analytics data.</p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            6. Subscription, Pricing & Billing
          </h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Free trial plans</li>
            <li>Tiered monthly or annual subscriptions</li>
            <li>Feature-based pricing tiers</li>
          </ul>
          <p className="mb-4">Pricing details are publicly available and may change with prior notice.</p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">7. User Responsibilities</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Not misuse the platform</li>
            <li>Not share login credentials</li>
            <li>Not attempt reverse engineering</li>
            <li>Not use the platform for unlawful purposes</li>
          </ul>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">8. Intellectual Property</h2>
          <p className="mb-4">
            All software, dashboards, designs, and documentation are the exclusive property of TrackMyProfit. Users
            receive a limited, non-exclusive license to use the platform.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">9. Limitation of Liability</h2>
          <p className="mb-4">
            TrackMyProfit provides analytics for informational purposes only. We do not guarantee financial outcomes,
            profits, or marketplace performance.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">10. Termination</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Violation of terms</li>
            <li>Unauthorized access detected</li>
            <li>Legal or compliance risks</li>
          </ul>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">
            11. No Affiliation Disclaimer
          </h2>
          <p className="mb-4">
            TrackMyProfit is an independent software provider and is not affiliated with, endorsed by, or sponsored by
            any marketplace or platform provider.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">12. Changes to Terms</h2>
          <p className="mb-4">
            We may update these Terms periodically. Continued use indicates acceptance of updated terms.
          </p>

          <h2 className="text-2xl min-md:text-3xl font-semibold text-gray-800 mt-8 mb-4">13. Contact</h2>
          <p className="mb-2">📧 letstalk@trackmyprofit.com</p>
          <p>🌐 https://trackmyprofit.com</p>
        </div>
      </div> */}
        <div className="pt-32 pb-12 px-[3%] max-w-7xl mx-auto">
          <div className="policy-content">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: policyContent,
                }}
              />
            )}
          </div>
        </div>

        <Footer />
      </div>

      <style>{`
.policy-content h1{
  font-size:40px;
  font-weight:700;
  margin:20px 0;
}

.policy-content h2{
  font-size:32px;
  font-weight:700;
  margin:20px 0 8px;   /* bottom sirf 8px */
}

.policy-content h3{
  font-size:24px;
  font-weight:600;
  margin:8px 0 12px;   /* top bhi kam */
}
.policy-content p{
  font-size:16px;
  line-height:1.8;
  margin-bottom:-4px !important;
  color:#4b5563;
}

.policy-content ul{
  list-style:disc;
  padding-left:25px;
}

.policy-content ol{
  list-style:decimal;
  padding-left:25px;
}

.policy-content li{
  margin:8px 0;
}

.policy-content strong{
  font-weight:700;
}
`}</style>
    </>
  );
}

export default TermsConditions;
