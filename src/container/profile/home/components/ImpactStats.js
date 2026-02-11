import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import { TrophyOutlined, RocketOutlined, ThunderboltOutlined, TeamOutlined } from '@ant-design/icons';

function CountUp({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView) {
      let startTime;
      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    }
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

const stats = [
  {
    icon: <TeamOutlined />,
    value: 200,
    suffix: '+',
    label: 'Active Users',
    description: 'Finance teams trust us',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
  },
  {
    icon: <TrophyOutlined />,
    value: 2,
    suffix: '+',
    label: 'Cr Revenue Tracked',
    description: 'Processed monthly',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
  },
  {
    icon: <ThunderboltOutlined />,
    value: 95,
    suffix: '%',
    label: 'Time Saved',
    description: 'On manual work',
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
  },
  {
    icon: <RocketOutlined />,
    value: 99.9,
    suffix: '%',
    label: 'Uptime SLA',
    description: 'Always available',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
  },
];

function ImpactStats() {
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const navigate = useNavigate();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <section className="relative py-10 min-lg:py-28 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-[3%]">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200">
            <span className="text-emerald-700 text-sm font-bold">REAL IMPACT</span>
          </div>
          <h2 className="text-4xl min-md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            The Numbers{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              Speak for Themselves
            </span>
          </h2>
          <p className="min-md:text-xl text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of businesses that have transformed their finance operations
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 min-sm:grid-cols-2 min-lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.1,
                ease: 'easeOut',
              }}
              whileHover={{ y: -12, scale: 1.05 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-white rounded-3xl p-8 border-2 border-gray-100 group-hover:border-transparent shadow-lg group-hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Gradient Border on Hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}
                />
                <div className="absolute inset-0.5 bg-white rounded-3xl" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-500`}
                    >
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                  </div>

                  {/* Value */}
                  <div
                    className={`text-4xl min-md:text-5xl font-extrabold mb-3 text-transparent bg-clip-text bg-gradient-to-br ${stat.gradient}`}
                  >
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>

                  {/* Label */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{stat.label}</h3>

                  {/* Description */}
                  <p className="text-gray-600">{stat.description}</p>
                </div>

                {/* Decorative Element */}
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-gray-50 to-transparent rounded-tl-full opacity-50 group-hover:opacity-0 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl blur-xl opacity-30" />
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 border border-gray-700">
              <h3 className="text-2xl min-md:text-3xl font-bold text-white mb-4">
                Ready to see these results for yourself?
              </h3>
              <p className="text-gray-300 mb-6 text-lg">Start your free trial today. No credit card required.</p>
              <div className="flex flex-col min-sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/70 transition-all duration-300"
                  onClick={() => navigate('/pricing')}
                >
                  Get Started Free
                </motion.button>
                {/* <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/20 hover:border-white/40 transition-all duration-300"
                >
                  Schedule Demo
                </motion.button> */}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default ImpactStats;
