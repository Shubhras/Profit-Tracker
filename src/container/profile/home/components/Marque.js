import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  '/brand-logo/accentz.jpg',
  '/brand-logo/aparna.jpeg',
  '/brand-logo/aromala.png',
  '/brand-logo/clay-karma.png',
  '/brand-logo/decopix.png',
  '/brand-logo/doctor.jpg',
  '/brand-logo/doggo.jpeg',
  '/brand-logo/excent.jpeg',
  '/brand-logo/expresso.jpg',
  '/brand-logo/fshway.jpeg',
  '/brand-logo/gruti.jpg',
  '/brand-logo/happy-herbs.png',
  '/brand-logo/hhm.jpg',
  '/brand-logo/jj.jpeg',
  '/brand-logo/maha-sakthi.png',
  '/brand-logo/meshear.jpeg',
  '/brand-logo/nikira.png',
  '/brand-logo/paperly.jpg',
  '/brand-logo/parent.jpeg',
  '/brand-logo/psvm.jpg',
  '/brand-logo/rawa.jpeg',
  '/brand-logo/remarkable.jpeg',
  '/brand-logo/secure-steps.png',
  '/brand-logo/stickme.jpg',
  '/brand-logo/swaroop.png',
  '/brand-logo/syutam.jpeg',
  '/brand-logo/tweak.jpeg',
  '/brand-logo/woody.png',
];

// const logos = [
//   accentz,
//   aparna,
//   aromala,
//   clay,
//   decopix,
//   doctor,
//   doggo,
//   excent,
//   expresso,
//   fishway,
//   gruti,
//   happy,
//   hhm,
//   jj,
//   maha,
//   meshear,
//   nikira,
//   paperly,
//   parent,
//   psvm,
//   rawa,
//   remarkable,
//   secure,
//   stickme,
//   swaroop,
//   syutam,
//   tweak,
//   woody,
// ];

function Marque() {
  return (
    <section className="relative py-8 min-lg:py-20 bg-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 max-w-7xl mx-auto px-[3%]"
        >
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-3">Trusted Worldwide</p>
          <h2 className="text-3xl min-md:text-4xl font-bold text-gray-900">
            Join 100+ Brands Growing with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              TrackMyProfit
            </span>
          </h2>
        </motion.div>

        {/* Infinite Marquee Container */}
        <div className="relative w-full overflow-hidden fade-mask-x">
          <div className="flex animate-marquee gap-12 min-w-max">
            {/* First Set */}
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className=" w-32 h-20 min-md:w-44 min-md:h-24 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center p-2 hover:shadow-md transition-all hover:scale-110"
              >
                <img src={logo} alt="Brand Partner" className="w-full h-full object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section Wrapper (to keep max-w constraint for stats) */}
        {/* <div className="max-w-7xl mx-auto px-[3%]">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-1 min-sm:grid-cols-3 gap-6"
          >
            {[
              { value: '50+', label: 'Active Users', gradient: 'from-emerald-500 to-teal-500' },
              { value: '₹10+', label: 'Lakh Revenue Tracked', gradient: 'from-teal-500 to-cyan-500' },
              { value: '99.9%', label: 'Platform Uptime', gradient: 'from-cyan-500 to-blue-500' },
            ].map((stat, index) => (
              <motion.div key={index} whileHover={{ y: -4 }} className="relative group">
                <div
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                  style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                />
                <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 group-hover:border-emerald-200 shadow-sm group-hover:shadow-lg transition-all duration-300">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} mb-4`}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {index === 0 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      )}
                      {index === 1 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                      {index === 2 && (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                    </svg>
                  </div>
                  <p className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div> */}
      </div>
    </section>
  );
}

export default Marque;
