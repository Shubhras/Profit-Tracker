import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BulbOutlined,
  RocketOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  SyncOutlined,
} from '@ant-design/icons';

const features = [
  {
    icon: <ThunderboltOutlined />,
    title: 'Lightning-Fast Reconciliation',
    description: 'Automate order reconciliation across 50+ platforms in seconds, not hours.',
    color: 'from-yellow-400 to-orange-500',
    delay: 0.1,
  },
  {
    icon: <DashboardOutlined />,
    title: 'Real-Time Dashboard',
    description: 'Monitor profits, inventory, and cash flow with live data synced every minute.',
    color: 'from-emerald-400 to-teal-500',
    delay: 0.2,
  },
  {
    icon: <BulbOutlined />,
    title: 'AI-Powered Insights',
    description: 'Get actionable recommendations to boost margins and reduce waste.',
    color: 'from-purple-400 to-pink-500',
    delay: 0.3,
  },
  {
    icon: <SyncOutlined />,
    title: 'Seamless Integrations',
    description: 'Connect with Shopify, WooCommerce, and 25+ other platforms instantly.',
    color: 'from-blue-400 to-cyan-500',
    delay: 0.4,
  },
  {
    icon: <SafetyOutlined />,
    title: 'Bank-Grade Security',
    description: 'Your data is encrypted with AES-256 and SOC 2 Type II certified infrastructure.',
    color: 'from-green-400 to-emerald-500',
    delay: 0.5,
  },
  {
    icon: <RocketOutlined />,
    title: 'Scale Without Limits',
    description: 'Handle millions of transactions without breaking a sweat or your budget.',
    color: 'from-red-400 to-rose-500',
    delay: 0.6,
  },
];

function ShiftToAISection() {
  const navigate = useNavigate();
  return (
    <section className="relative py-10 min-lg:py-28 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#10b98108_1px,transparent_1px)] bg-[size:48px_48px]" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-[3%]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200">
            <span className="text-emerald-700 text-sm font-bold">WHY CHOOSE US</span>
          </div>
          <h2 className="text-4xl min-md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Everything You Need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
              Supercharge Growth
            </span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            From reconciliation to AI insights, we have built the complete toolkit for modern finance teams
          </p>
        </motion.div>

        {/* Features Grid - Asymmetric Bento Layout */}
        <div className="grid grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white rounded-3xl p-8 border-2 border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-2xl transition-all duration-500 "
            >
              {/* Gradient Background on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Icon */}
              <div className="relative z-10 mb-6">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-emerald-100/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/30">
            <div className="flex-1 text-left text-white">
              <p className="text-2xl font-bold mb-1">Ready to transform your finance operations?</p>
              {/* <p className="text-emerald-100">Start your free 14-day trial. No credit card required.</p> */}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/pricing')}
            >
              See Plans →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ShiftToAISection;
