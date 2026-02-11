import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from 'antd';
import {
  RocketOutlined,
  TeamOutlined,
  GlobalOutlined,
  ThunderboltOutlined,
  HeartFilled,
  SafetyCertificateFilled,
  ExperimentFilled,
} from '@ant-design/icons';
import { HiOutlineChartBar, HiOutlineLightBulb } from 'react-icons/hi2';
import { Link } from 'react-router-dom';

// const values = [
//   {
//     icon: <HiOutlineLightBulb />,
//     title: 'Innovation First',
//     description: 'We push boundaries with AI models that are trained on billions of transaction data points.',
//     color: 'from-amber-400 to-orange-500',
//     bg: 'bg-amber-50',
//     border: 'border-amber-100',
//   },
//   {
//     icon: <HeartFilled />,
//     title: 'Customer Obsession',
//     description: 'Every feature we build starts with a conversation. We solve real pain points, not imaginary ones.',
//     color: 'from-rose-400 to-pink-500',
//     bg: 'bg-rose-50',
//     border: 'border-rose-100',
//   },
//   {
//     icon: <SafetyCertificateFilled />,
//     title: 'Bank-Grade Security',
//     description: 'Your financial data is encrypted with AES-256. We take security as seriously as you take profit.',
//     color: 'from-blue-400 to-indigo-500',
//     bg: 'bg-blue-50',
//     border: 'border-blue-100',
//   },
//   {
//     icon: <ExperimentFilled />,
//     title: 'Data Accuracy',
//     description: 'We obsess over every decimal point. In finance, close enough is not good enough.',
//     color: 'from-emerald-400 to-teal-500',
//     bg: 'bg-emerald-50',
//     border: 'border-emerald-100',
//   },
// ];
const values = [
  {
    icon: <HiOutlineLightBulb />,
    title: 'Innovation First',
    description: 'We continuously innovate with smart automation and AI-driven financial analytics.',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: <HeartFilled />,
    title: 'Customer Obsession',
    description: 'Every feature starts with real customer feedback. We solve real problems, not assumptions.',
    color: 'from-rose-400 to-pink-500',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: <SafetyCertificateFilled />,
    title: 'Enterprise-Grade Security',
    description: 'Your financial data is protected with encryption and secure infrastructure best practices.',
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: <ExperimentFilled />,
    title: 'Data Accuracy',
    description: 'We obsess over precision because every decimal matters in financial reporting.',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
];

const milestones = [
  {
    year: '2026',
    title: 'Product Launch',
    description: 'Launching our eCommerce reconciliation platform for D2C brands.',
    icon: <RocketOutlined />,
  },
  {
    year: '2026 Q1',
    title: 'Early Adoption',
    description: 'Onboarding early users and refining the platform based on feedback.',
    icon: <TeamOutlined />,
  },
  {
    year: '2026 Q3',
    title: 'Platform Growth',
    description: 'Adding deeper reporting, integrations, and automation.',
    icon: <ThunderboltOutlined />,
  },
  {
    year: '2026',
    title: 'Advanced Capabilities',
    description: 'Releasing smart insights and scalable enterprise features.',
    icon: <GlobalOutlined />,
  },
];

const teamMembers = [
  'https://i.pravatar.cc/100?img=33',
  'https://i.pravatar.cc/100?img=47',
  'https://i.pravatar.cc/100?img=12',
  'https://i.pravatar.cc/100?img=5',
  'https://i.pravatar.cc/100?img=3',
];

function AboutSection() {
  const containerRef = useRef(null);
  // const { scrollYProgress } = useScroll({
  //   target: containerRef,
  //   offset: ['start end', 'end start'],
  // });

  // const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <div ref={containerRef} className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] px-[3%] pt-24 pb-12 min-lg:pt-32 min-lg:pb-16 flex items-center justify-center  overflow-hidden bg-white">
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-emerald-50 border border-emerald-100 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-600 text-sm font-semibold tracking-wide">OUR STORY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl min-md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight"
          >
            Building the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              Financial OS
            </span>{' '}
            for the Future.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className=" text-lg min-md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto"
          >
            We are a team of finance geeks, engineers, and data scientists obsessed with solving the most complex
            problem in commerce: <strong>Where did the money go?</strong>
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-12 px-6 min-lg:px-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 min-lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl min-md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              We&apos;re replacing spreadsheets with{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-emerald-600">Intelligence</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-emerald-100 -z-0" />
              </span>
            </h2>
            <div className="space-y-6 text-lg text-gray-600">
              <p>
                Finance teams have spent too long buried in spreadsheets, wasting hours on manual reconciliation, broken
                formulas, and delayed insights.
              </p>

              <p>
                TrackMyProfit changes that. We built a platform that ingests millions of rows of data, reconciles them
                instantly, and gives you actionable insights in plain English.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <RocketOutlined className="text-emerald-500 text-xl" />
                <span className="font-bold text-gray-900">100% Growth</span>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-xl border border-gray-100">
                <TeamOutlined className="text-blue-500 text-xl" />
                <span className="font-bold text-gray-900">50+ Experts</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-3xl transform rotate-3 blur-2xl" />
            <div className="relative bg-white p-8 rounded-3xl shadow-xl overflow-hidden border border-gray-200">
              {/* Decorative HUD Elements - Light Mode */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent" />
              <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-blue-500 to-transparent" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <HiOutlineChartBar className="text-emerald-500 text-2xl" />
                    <span className="text-gray-900 font-bold text-lg">Live Metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Recording</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-500 text-xs mb-1">Reconciled Today</p>
                    <p className="text-2xl font-mono font-bold text-gray-900">र4.2M</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-500 text-xs mb-1">Accuracy</p>
                    <p className="text-2xl font-mono font-bold text-emerald-600">99.99%</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '75%' }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '45%' }}
                      transition={{ duration: 1.5, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
                    />
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '90%' }}
                      transition={{ duration: 1.5, delay: 0.4 }}
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <Avatar.Group maxCount={4} size="small">
                    {teamMembers.map((src, i) => (
                      <Avatar key={i} src={src} className="border-2 border-white" />
                    ))}
                  </Avatar.Group>
                  <span className="text-gray-500 text-sm">Join the team &rarr;</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 min-lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Principles that guide our decisions, our code, and our culture.
            </p>
          </div>

          <div className="grid grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-4 gap-6">
            {values.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`p-8 rounded-3xl bg-white border ${item.border} shadow-lg hover:shadow-xl transition-all duration-300 group`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-2xl mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-20 px-6 min-lg:px-12 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">Our Journey So Far</h2>
        </div>

        <div className="relative border-l-2 border-emerald-100 ml-4 md:mx-auto md:max-w-2xl space-y-12 pl-8 md:pl-12">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative"
            >
              {/* Timeline Dot */}
              <div className="absolute top-0 -left-[calc(2rem_+_1px)] md:-left-[calc(3rem_+_1px)] w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-4 border-emerald-500 shadow-md flex items-center justify-center transform -translate-x-1/2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              </div>

              {/* Content Card */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 text-xl">{milestone.icon}</div>
                  <div>
                    <span className="block text-emerald-600 text-sm font-bold tracking-wide uppercase">
                      {milestone.year}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                  </div>
                </div>
                <p className="text-gray-500 leading-relaxed text-base">{milestone.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-20 px-[3%]">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-[3rem] overflow-hidden p-5 min-lg:p-18 text-center bg-white border border-gray-100 shadow-2xl"
          >
            {/* Glow Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <h2 className="text-4xl min-md:text-5xl font-bold text-gray-900 mb-6">
                Join the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                  Revolution
                </span>
              </h2>
              <p className="text-gray-500 text-xl mb-10 max-w-2xl mx-auto">
                Stop reconciling manually. Start growing profitably. Join 100+ D2C brands today.
              </p>
              <div className="flex flex-col min-sm:flex-row justify-center gap-4">
                <Link to="/pricing">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-2 min-md:px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all text-lg"
                  >
                    See Plans
                  </motion.button>
                </Link>
                <Link to="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-2 min-md:px-10 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all text-lg shadow-sm"
                  >
                    Contact Us
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default AboutSection;
