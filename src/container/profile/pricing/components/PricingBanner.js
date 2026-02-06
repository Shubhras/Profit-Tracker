import React from 'react';
import { motion } from 'framer-motion';
import { Typography } from 'antd';
import { CrownOutlined, CheckCircleFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

function PricingBanner() {
  return (
    <div className="relative px-[3%] pt-24 pb-12 min-lg:pt-32 min-lg:pb-16 bg-white overflow-hidden">
      {/* Background Blobs - Light & Fresh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-100/40 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[70%] rounded-full bg-teal-100/40 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[50%] rounded-full bg-blue-100/30 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-block mb-6"
        >
          <span className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-sm border border-emerald-100 flex items-center gap-2 shadow-sm">
            <CrownOutlined /> Flexible Pricing for Everyone
          </span>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Title
            level={1}
            className="text-4xl min-md:text-5xl !font-extrabold !text-gray-900 !leading-[1.1] !mb-6 tracking-tight"
          >
            Simple plans that grow <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
              with your business
            </span>
          </Title>
        </motion.div>

        {/* Subtitle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Text className="block text-lg min-md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Choose the perfect plan for your needs. Always know what you&apos;ll pay. No hidden fees, ever.
          </Text>
        </motion.div>

        {/* Trust Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 text-gray-600 font-medium"
        >
          {['14-day free trial', 'Cancel anytime', 'No credit card required'].map((text, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <CheckCircleFilled className="text-emerald-500" /> {text}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default PricingBanner;
