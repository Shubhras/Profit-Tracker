import React from 'react';
import { FiTrendingUp, FiDollarSign, FiBox, FiCheckCircle } from 'react-icons/fi';
import PropTypes from 'prop-types';

function FinanceEngineSection() {
  return (
    <section className="w-full py-10 px-[3%] bg-white">
      <div className="w-full">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-3xl font-extrabold text-gray-900">
            Your Finance Engine — <br className="hidden md:block" />
            Now AI Powered
          </h2>
          <p className="mt-4 text-lg text-gray-700 mx-auto">
            A comprehensive platform that unifies all your commerce financial data
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 md:grid-cols-1 gap-8">
          {/* Card 1 */}
          <FeatureCard
            icon={<FiTrendingUp size={22} />}
            title="SKU-Level Profit Intelligence"
            points={[
              'True profit - One source of profit',
              'Marketplace + D2C + Q-commerce in one view',
              'AI-driven margin analysis per SKU',
            ]}
          />

          {/* Card 2 */}
          <FeatureCard
            icon={<FiDollarSign size={22} />}
            title="Automated Payment Recovery"
            points={[
              'Detect overcharges automatically',
              'Recover fees in clicks',
              'Cut reconcile time from days to minutes',
            ]}
            highlight
          />

          {/* Card 3 */}
          <FeatureCard
            icon={<FiBox size={22} />}
            title="Inventory Planning Copilot"
            points={['AI demand forecasting', 'Restock recommendations', 'Optimize working capital use']}
          />
        </div>
      </div>
    </section>
  );
}

/* ---------- Reusable Card ---------- */

function FeatureCard({ icon, title, points, highlight }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Icon */}
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white">{icon}</div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>

        {/* Points */}
        <ul className="space-y-4">
          {points.map((item, index) => (
            <li key={index} className="flex items-start gap-3 text-lg text-gray-700">
              <FiCheckCircle className="text-blue-600 mt-1" size={18} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Mock chart */}
      <div className="mt-10 rounded-xl bg-gray-50 p-5">
        <div className="flex justify-between items-center mb-4 text-lg font-medium text-gray-700">
          <span>Profit Analysis</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              highlight ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
            }`}
          >
            LIVE ON 4 CHANNELS
          </span>
        </div>

        <div className="flex items-end gap-2 h-24">
          {[30, 50, 35, 45, 38, 48, 55].map((h, i) => (
            <div key={i} style={{ height: `${h}%` }} className="w-4 rounded bg-blue-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  points: PropTypes.arrayOf(PropTypes.string).isRequired,
  highlight: PropTypes.bool,
};

export default FinanceEngineSection;
