import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
// import { ArrowRightOutlined, PlayCircleOutlined } from '@ant-design/icons';
import dashboardPreview from '../../../../assets/images/home/banner.png';

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative px-[3%] pt-24 pb-12 min-lg:pt-32 min-lg:pb-16 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Gradient Blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98114_1px,transparent_1px),linear-gradient(to_bottom,#10b98114_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-1 max-w-7xl mx-auto px-[3%]">
        <div className="grid grid-cols-1 min-lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center min-lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-emerald-100 border border-emerald-200 shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-emerald-700 text-sm font-semibold">AI-Powered Financial Platform</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl min-md:text-6xl min-2xl:text-7xl font-extrabold mb-6 leading-tight tracking-tight"
            >
              <span className="text-gray-900">The Future of </span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600">
                Smart Finance
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg min-md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto min-lg:mx-0 leading-relaxed"
            >
              Automate reconciliation, forecast inventory, and boost profit margins with AI-driven insights. Join 25+
              brands growing with Profit-Tracker.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col min-sm:flex-row gap-4 justify-center min-lg:justify-start"
            >
              <Button
                type="primary"
                size="large"
                className="h-14 px-8 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all group"
                onClick={() => navigate('/pricing')}
              >
                See Plans
                <ArrowRightOutlined className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              {/* <Button
                size="large"
                className="h-14 px-8 text-base font-semibold rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 shadow-sm hover:shadow transition-all"
              >
                <PlayCircleOutlined className="mr-2" />
                Watch Demo
              </Button> */}
            </motion.div>

            {/* Trust Indicators */}
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="mt-12 flex items-center gap-6 justify-center min-lg:justify-start text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">14-day free trial</span>
              </div>
            </motion.div> */}
          </motion.div>

          {/* Right Column - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-300/30 via-teal-300/30 to-blue-300/30 rounded-3xl blur-2xl opacity-60" />

              {/* Dashboard Image */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200/50 p-2 overflow-hidden">
                <img src={dashboardPreview} alt="Profit Tracker Dashboard" className="w-full h-auto rounded-xl" />
              </div>

              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 lg:-left-12 bg-white rounded-xl shadow-xl border border-gray-100 p-3 hidden min-md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-0">+34%</p>
                    <p className="text-xs text-gray-500">Profit Growth</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -top-6 -right-6 lg:-right-12 bg-white rounded-xl shadow-xl border border-gray-100 p-3 hidden min-md:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 mb-0">98%</p>
                    <p className="text-xs text-gray-500">Accuracy</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
