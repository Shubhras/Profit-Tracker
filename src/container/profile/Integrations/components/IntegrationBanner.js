import React from 'react';
import { motion } from 'framer-motion';
import { ApiOutlined, LinkOutlined, ThunderboltOutlined, CheckCircleFilled } from '@ant-design/icons';

export default function IntegrationBanner() {
  return (
    <div className="relative px-[3%] pt-24 pb-12 min-lg:pt-32 min-lg:pb-16 bg-white overflow-hidden">
      {/* Background Gradients - Light & Airy */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-50 blur-[80px]" />
        <div className="absolute bottom-[0%] left-[-10%] w-[30%] h-[40%] rounded-full bg-blue-50 blur-[80px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-block mb-8"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
            <ApiOutlined className="text-emerald-600" />
            <span className="text-emerald-700 font-bold text-xs tracking-wide uppercase">Integration Ecosystem</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-4xl min-md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Seamlessly Connect with
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              Your Favorite Tools
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="block  text-lg min-md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12">
            Supercharge your workflow by syncing data across your entire stack. Fast, secure, and reliable integrations
            for modern finance teams.
          </p>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4"
        >
          {[
            { icon: <LinkOutlined />, text: 'One-Click Connect' },
            { icon: <ThunderboltOutlined />, text: 'Real-time Sync' },
            { icon: <CheckCircleFilled />, text: 'Secure Encryption' },
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -2 }}
              className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-gray-100 shadow-md shadow-gray-200/50 hover:shadow-lg transition-all duration-300"
            >
              <span className="text-emerald-500 text-lg flex items-center">{item.icon}</span>
              <span className="text-gray-700 font-semibold">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
