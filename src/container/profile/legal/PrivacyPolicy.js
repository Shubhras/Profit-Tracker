import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { getPrivacyPolicy } from '../../../redux/admin/actionCreator';

// function SectionBadge({ number }) {
//   return (
//     <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500 text-white text-[12px] font-bold shrink-0">
//       {number}
//     </span>
//   );
// }

// function SectionHeading({ number, children }) {
//   return (
//     <div className="flex items-center gap-3 mt-12 mb-5">
//       <SectionBadge number={number} />
//       <h2 className="text-2xl min-md:text-2xl font-bold text-gray-900 mb-0">{children}</h2>
//     </div>
//   );
// }

// function SubHeading({ children }) {
//   return <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3">{children}</h3>;
// }

// function SubPointHeading({ number, children }) {
//   return (
//     <h4 className="text-base font-bold text-gray-800 mt-5 mb-2">
//       {number} {children}
//     </h4>
//   );
// }

// function BulletList({ items }) {
//   return (
//     <ul className="space-y-2.5 mb-5">
//       {items.map((item, i) => (
//         <li key={i} className="flex items-start gap-3 text-gray-600">
//           <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
//           <span>{item}</span>
//         </li>
//       ))}
//     </ul>
//   );
// }

function PrivacyPolicy() {
  const dispatch = useDispatch();

  const { privacypolicyData, loading } = useSelector((state) => state.AdminDashboard);
  // const [loading, setLoading] = useState(true);

  const policyContent = privacypolicyData?.data?.[0]?.content || '';

  useEffect(() => {
    dispatch(getPrivacyPolicy('privacy_policy'));
  }, [dispatch]);

  return (
    <>
      <div className="bg-white min-h-screen">
        <Navbar />

        <div className="pt-32 pb-12 px-[3%] max-w-7xl mx-auto">
          {/* <div className="text-base text-gray-600">
          <p className="mb-3">Last Updated: February 2026</p>

          <p className="mb-6">
            This Privacy Policy explains how TrackMyProfit collects, uses, stores, and protects user data. TrackMyProfit
            is committed to data security, transparency, and regulatory compliance.
          </p>

          <SectionHeading number={1}>Information We Collect</SectionHeading>

          <SubHeading>a) Account Information</SubHeading>
          <BulletList items={['Name', 'Email address', 'Company / Brand name']} />

          <SubHeading>b) Seller &amp; Analytics Data</SubHeading>
          <p className="mb-2">With user authorization, we may access:</p>
          <BulletList
            items={[
              'Sales metrics',
              'Orders summary data',
              'Inventory data',
              'Advertising performance data',
              'Brand-level analytics (aggregated and anonymized)',
            ]}
          />

          <SubHeading>c) Technical Information</SubHeading>
          <BulletList items={['IP address', 'Browser type', 'Usage logs', 'Device information']} />

          <SectionHeading number={2}>How We Use Data</SectionHeading>

          <p className="mb-2">We use data only to:</p>
          <BulletList
            items={[
              'Generate analytics dashboards',
              'Display performance reports',
              'Improve product features',
              'Provide customer support',
              'Ensure security and compliance',
            ]}
          />

          <p className="mb-2 font-semibold text-gray-800">We do not:</p>
          <BulletList
            items={[
              'Sell data',
              'Share data with third parties for marketing',
              'Use data for competitive intelligence outside the user’s account',
            ]}
          />

          <SectionHeading number={3}>Brand Analytics Compliance</SectionHeading>
          <BulletList
            items={[
              'Used only for the authenticated user',
              'Displayed in aggregated and analytical form',
              'Never exposed publicly or shared across users',
              'Never used to identify individual sellers or brands',
            ]}
          />

          <SectionHeading number={4}>Data Storage &amp; Security</SectionHeading>
          <BulletList
            items={[
              'Secure cloud infrastructure',
              'Encrypted data storage (at rest & in transit)',
              'Role-based access controls',
              'Audit logging',
              'Regular security reviews',
            ]}
          />
          <p className="mb-4">Only authorized systems and personnel can access user data.</p>

          <SectionHeading number={5}>Personal Data (PII)</SectionHeading>
          <BulletList
            items={[
              'Used strictly for analytics display',
              'Never shared or sold',
              'Retained only as long as necessary',
            ]}
          />
          <SectionHeading number={6}>Data Retention</SectionHeading>
          <BulletList
            items={[
              'Data is retained only while the account is active',
              'Users may disconnect integrations at any time',
              'Upon account deletion, data is permanently removed',
            ]}
          />

          <SectionHeading number={7}>User Rights</SectionHeading>
          <BulletList
            items={[
              'Request data access',
              'Request data deletion',
              'Revoke API permissions',
              'Update account information',
            ]}
          />
          <p className="mb-4">Requests can be submitted via support email.</p>

          <SectionHeading number={8}>Cookies &amp; Tracking</SectionHeading>
          <BulletList items={['Authentication', 'Session management', 'Product analytics']} />
          <p className="mb-4">Cookies do not collect sensitive seller data.</p>

          <SectionHeading number={9}>Third-Party Services</SectionHeading>
          <p className="mb-4">
            We may use trusted infrastructure providers for hosting, logging, and error monitoring. All providers comply
            with strict data protection standards.
          </p>

          <SectionHeading number={10}>No Platform Endorsement</SectionHeading>
          <p className="mb-4">
            TrackMyProfit is an independent analytics application and does not represent any marketplace or platform
            provider.
          </p>

          <SectionHeading number={11}>Policy Updates</SectionHeading>
          <p className="mb-4">We may update this policy periodically. Continued use indicates acceptance.</p>

          <SectionHeading number={12}>Contact</SectionHeading>
          <p className="mb-2">📧 letstalk@trackmyprofit.com</p>
          <p>🌐 https://trackmyprofit.com</p>

          <SectionHeading number={13}>Amazon Selling Partner API (SP-API) Data Practices</SectionHeading>
          <p className="mb-4">
            TrackMyProfit is a Software-as-a-Service (SaaS) platform designed to help e-commerce businesses and Amazon
            sellers manage inventory, orders, shipments, returns, financial analytics, profitability tracking, and
            operational reporting. The following sections explain how we collect, process, store, use, protect, and
            dispose of information obtained through our platform, including information received through Amazon Selling
            Partner API (SP-API).
          </p>

          <SubPointHeading number="13.1">Information Provided by Users</SubPointHeading>
          <BulletList
            items={[
              'Name',
              'Email address',
              'Phone number',
              'Business name',
              'Billing information',
              'Account credentials',
              'Support communications',
            ]}
          />

          <SubPointHeading number="13.2">Information Received from Amazon</SubPointHeading>
          <p className="mb-2">
            When authorized by a seller, TrackMyProfit may access information through Amazon Selling Partner API
            (SP-API), including:
          </p>
          <BulletList
            items={[
              'Product listings',
              'Inventory information',
              'Order information',
              'Shipment information',
              'Return information',
              'Settlement reports',
              'Financial reports',
              'Performance metrics',
              'Fulfillment information',
            ]}
          />

          <SubPointHeading number="13.3">Restricted Amazon Information</SubPointHeading>
          <p className="mb-2">
            Where permitted by Amazon and authorized by the seller, we may access limited Personally Identifiable
            Information (PII) required for:
          </p>
          <BulletList
            items={[
              'Direct-to-Consumer Shipping',
              'Shipment tracking',
              'Return processing',
              'Refund reconciliation',
              'Order fulfillment support',
            ]}
          />
          <p className="mb-2">Such information may include:</p>
          <BulletList
            items={['Customer name', 'Shipping address', 'Order identifiers', 'Contact information where permitted']}
          />
          <p className="mb-4">We access only the minimum data necessary to provide authorized services.</p>

          <SectionHeading number={14}>How We Use Amazon Information</SectionHeading>
          <p className="mb-2">We use information to:</p>
          <BulletList
            items={[
              'Manage seller operations',
              'Synchronize inventory',
              'Process and monitor orders',
              'Track shipments',
              'Support Direct-to-Consumer Shipping workflows',
              'Monitor returns and refunds',
              'Generate profitability reports',
              'Reconcile settlements',
              'Improve platform functionality',
              'Provide customer support',
              'Maintain security and compliance obligations',
            ]}
          />
          <p className="mb-4 font-semibold text-gray-800">We do not sell Amazon Information or customer data.</p>

          <SectionHeading number={15}>Legal Basis for Processing</SectionHeading>
          <p className="mb-2">Information is processed only:</p>
          <BulletList
            items={[
              'With seller authorization',
              'To provide contracted services',
              'To comply with legal obligations',
              'To maintain security and fraud prevention',
            ]}
          />

          <SectionHeading number={16}>Security Controls</SectionHeading>
          <p className="mb-2">
            TrackMyProfit implements industry-standard security controls to protect Amazon Information and customer
            data. Our controls include:
          </p>
          <BulletList
            items={[
              'AES-256 encryption at rest',
              'TLS 1.2+ encryption in transit',
              'AWS Key Management Service (AWS KMS)',
              'Role-Based Access Control (RBAC)',
              'Multi-Factor Authentication (MFA)',
              'Audit logging',
              'Network segmentation',
              'Firewall protection',
              'Intrusion detection and monitoring',
              'Secure development lifecycle practices',
            ]}
          />
          <p className="mb-4">
            Access to Amazon Information is restricted to authorized personnel on a need-to-know basis.
          </p>

          <SectionHeading number={17}>Storage and Encryption</SectionHeading>
          <p className="mb-4">Amazon Information is stored using encrypted cloud infrastructure.</p>

          <SubPointHeading number="17.1">Encryption at Rest</SubPointHeading>
          <BulletList
            items={[
              'AES-256 encryption',
              'AWS KMS managed encryption keys',
              'Automatic key rotation',
              'Strict access control policies',
            ]}
          />

          <SubPointHeading number="17.2">Encryption in Transit</SubPointHeading>
          <p className="mb-2">All communications are protected using:</p>
          <BulletList items={['HTTPS', 'TLS 1.2 or higher']} />

          <SectionHeading number={18}>Backup and Disaster Recovery</SectionHeading>
          <p className="mb-2">To ensure business continuity:</p>
          <BulletList
            items={[
              'Encrypted backups are created daily',
              'Backups are stored in geographically separated AWS regions',
              'Backup integrity is regularly verified',
            ]}
          />

          <SubPointHeading number="18.1">Recovery Objectives</SubPointHeading>
          <BulletList items={['Recovery Time Objective (RTO): 4 Hours', 'Recovery Point Objective (RPO): 24 Hours']} />
          <p className="mb-4">Backup restoration procedures are tested quarterly.</p>

          <SectionHeading number={19}>Amazon Data Retention</SectionHeading>

          <SubPointHeading number="19.1">Amazon Restricted Data</SubPointHeading>
          <p className="mb-4">
            Personally Identifiable Information (PII) obtained through Amazon SP-API is retained for less than 30 days
            unless a longer retention period is legally required.
          </p>

          <SubPointHeading number="19.2">Non-PII Business Data</SubPointHeading>
          <p className="mb-4">
            Operational and reporting information may be retained for legitimate business purposes, legal compliance,
            auditing, and financial reporting. When data is no longer required, it is securely deleted.
          </p>

          <SectionHeading number={20}>Amazon Data Sharing</SectionHeading>
          <p className="mb-2">TrackMyProfit does not:</p>
          <BulletList
            items={[
              'Sell Amazon Information',
              'Rent Amazon Information',
              'Trade customer information',
              'Share Amazon Information with unauthorized third parties',
            ]}
          />
          <p className="mb-2">Information may only be disclosed:</p>
          <BulletList
            items={[
              'To comply with legal obligations',
              'To respond to lawful government requests',
              'To protect rights, security, and integrity of our services',
            ]}
          />

          <SectionHeading number={21}>Access Controls</SectionHeading>
          <p className="mb-2">We enforce strict access controls including:</p>
          <BulletList
            items={[
              'Individual employee accounts',
              'Role-based permissions',
              'Principle of least privilege',
              'MFA enforcement',
              'Periodic access reviews',
              'Logging of administrative activities',
            ]}
          />
          <p className="mb-4">Unauthorized access attempts are monitored and investigated.</p>

          <SectionHeading number={22}>Logging and Monitoring</SectionHeading>
          <p className="mb-2">TrackMyProfit maintains centralized security logging systems. We monitor:</p>
          <BulletList
            items={[
              'Authentication events',
              'User activity',
              'API access',
              'Administrative actions',
              'Security events',
            ]}
          />

          <SectionHeading number={23}>Incident Response</SectionHeading>
          <p className="mb-4">TrackMyProfit maintains a documented Incident Response Plan.</p>

          <p className="mb-2">In the event of:</p>
          <BulletList items={['Unauthorized access', 'Data breach', 'Database compromise', 'Security incident']} />

          <p className="mb-2">We will:</p>
          <BulletList
            items={[
              'Detect and contain the incident',
              'Investigate root causes',
              'Remediate affected systems',
              'Restore services securely',
              'Conduct post-incident reviews',
            ]}
          />

          <SubPointHeading number="24.1">Amazon Notification</SubPointHeading>
          <p className="mb-4">
            Any security incident involving Amazon Information will be reported to Amazon at security@amazon.com within
            24 hours of detection, in accordance with Amazon SP-API requirements.
          </p>

          <SectionHeading number={24}>International Data Transfers</SectionHeading>
          <p className="mb-4">
            Information may be processed in secure cloud environments located in multiple regions for redundancy,
            disaster recovery, and service delivery. All transfers are protected using appropriate technical and
            organizational safeguards.
          </p>

          <SectionHeading number={25}>Additional User Rights</SectionHeading>
          <p className="mb-2">Users may request:</p>
          <BulletList
            items={[
              'Access to their information',
              'Correction of inaccurate information',
              'Deletion of eligible information',
              'Restriction of processing where applicable',
            ]}
          />
          <p className="mb-4">Requests may be submitted through our contact information below.</p>


          <SectionHeading number={26}>Contact Information</SectionHeading>
          <p className="mb-1">TrackMyProfit</p>
          <p className="mb-1">Website: https://trackmyprofit.com</p>
          <p className="mb-4">Email: letstalk@trackmyprofit.com</p>
        </div> */}
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

export default PrivacyPolicy;
