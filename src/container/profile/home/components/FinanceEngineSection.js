import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const workflows = [
  {
    step: '01',
    title: 'Connect Your Platforms',
    description:
      'Link all your sales channels, payment gateways, and logistics partners in minutes with our one-click integrations.',
    icon: '🔗',
  },
  {
    step: '02',
    title: 'Automated Data Sync',
    description: 'Watch as TrackMyProfit automatically pulls and reconciles data from all sources in real-time.',
    icon: '⚡',
  },
  {
    step: '03',
    title: 'AI Analysis & Insights',
    description: 'Our AI engine analyzes patterns, detects discrepancies, and suggests profit optimization strategies.',
    icon: '🧠',
  },
  {
    step: '04',
    title: 'Actionable Decisions',
    description: 'Make data-driven decisions with clear dashboards, alerts, and automated reports.',
    icon: '📊',
  },
];

const benefits = [
  'Reduce manual work by 95%',
  'Spot discrepancies instantly',
  'Forecast inventory needs',
  'Optimize profit margins',
  'Scale without hiring',
  'Real-time cash flow tracking',
];

function FinanceEngineSection() {
  return (
    <section className="relative py-10 min-lg:py-28 bg-white overflow-hidden">
      {/* Decorative Background */}
      <div className="hidden min-lg:block absolute inset-0 overflow-hidden pointer-events-none opacity-40 ">
        <svg className="absolute top-0 right-0 w-1/2 h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.1 }} />
              <stop offset="100%" style={{ stopColor: '#14b8a6', stopOpacity: 0.05 }} />
            </linearGradient>
          </defs>
          <path d="M0,0 L100,0 L100,100 Q50,50 0,100 Z" fill="url(#grad1)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-[3%]">
        <div className="grid grid-cols-1 min-lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200">
              <span className="text-emerald-700 text-sm font-bold">HOW IT WORKS</span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl min-md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              The Finance Engine
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Built for Scale
              </span>
            </h2>

            <p className="min-md:text-xl text-lg text-gray-600 mb-10 leading-relaxed">
              Our platform does the heavy lifting so your team can focus on growth, not spreadsheets.
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 min-md:grid-cols-2 gap-4 mb-10">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircleOutlined className="text-emerald-500 text-lg mt-1 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <Link to="/pricing">
              <motion.button
                whileHover={{ scale: 1.05, x: 5 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 transition-all duration-300"
              >
                See Plans
                <ArrowRightOutlined className="group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Right Column - Workflow Steps */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Connector Line */}
            <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-emerald-200 via-teal-200 to-cyan-200 min-lg:hidden block" />

            {/* Steps */}
            <div className="space-y-6">
              {workflows.map((workflow, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                  whileHover={{ x: 10 }}
                  className="relative group"
                >
                  <div className="flex items-start gap-6 bg-white rounded-2xl p-6 border-2 border-gray-100 group-hover:border-emerald-200 shadow-sm group-hover:shadow-xl transition-all duration-500">
                    {/* Step Number Icon */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                          {workflow.icon}
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                          {workflow.step}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                        {workflow.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{workflow.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default FinanceEngineSection;
