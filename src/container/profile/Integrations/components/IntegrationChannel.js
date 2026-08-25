import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'antd';
import {
  ShopOutlined,
  AppstoreOutlined,
  // RocketOutlined,
  ThunderboltOutlined,
  BankOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';

const categories = [
  {
    id: 'marketplaces',
    name: 'Marketplaces',
    icon: <ShopOutlined />,
    platforms: [
      { name: 'Amazon', logo: '/icons/amazon.svg', status: 'coming' },
      { name: 'Flipkart', logo: '/icons/flipkart.png', status: 'coming' },
      { name: 'Myntra', logo: '/icons/myntra.png', status: 'coming' },
      { name: 'Meesho', logo: '/icons/meesho.png', status: 'coming' },
      { name: 'Ajio', logo: '/icons/ajio.png', status: 'coming' },
      { name: 'Nykaa', logo: '/icons/nykaa.png', status: 'coming' },
    ],
  },
  {
    id: 'd2c',
    name: 'D2C Platforms',
    icon: <AppstoreOutlined />,
    platforms: [
      { name: 'Shopify', logo: '/icons/shopify.png', status: 'coming' },
      { name: 'WooCommerce', logo: '/icons/woo.png', status: 'coming' },
      { name: 'Magento', logo: '/icons/magento.png', status: 'coming' },
    ],
  },
  {
    id: 'quick',
    name: 'Quick Commerce',
    icon: <ThunderboltOutlined />,
    platforms: [
      { name: 'Blinkit', logo: '/icons/blinkit.png', status: 'coming' },
      { name: 'Zepto', logo: '/icons/zepto.png', status: 'coming' },
      { name: 'Swiggy Instamart', logo: '/icons/swiggy.png', status: 'coming' },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: <BankOutlined />,
    platforms: [
      { name: 'Tally', logo: '/icons/tally.png', status: 'coming' },
      { name: 'Zoho Books', logo: '/icons/zoho.png', status: 'coming' },
    ],
  },
];

// Combine all platforms for "All" view
const allPlatforms = categories.flatMap((cat) => cat.platforms.map((p) => ({ ...p, category: cat.name })));

function IntegrationCard({ platform }) {
  const isLive = platform.status === 'live';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-center p-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 ${
        !isLive && 'opacity-70'
      }`}
    >
      {/* Logo Section */}
      <div className="flex-shrink-0 w-16 h-16 p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mr-5 group-hover:scale-105 transition-transform duration-300">
        {platform.logo ? (
          <img
            src={platform.logo}
            alt={platform.name}
            className={`max-w-full max-h-full object-contain ${!isLive ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="text-2xl font-bold text-gray-300">{platform.name.charAt(0)}</div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{platform.name}</h3>
          {isLive && <CheckCircleFilled className="text-emerald-500 text-sm" />}
        </div>
        {/* <p className="text-xs text-gray-500 font-medium truncate">{isLive ? 'Full Sync Active' : 'Adding Soon'}</p> */}
      </div>

      {/* Action (Visible on Hover for Desktop, always for Mobile?) */}
      <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
        <Button
          type="primary"
          shape="circle"
          icon={<ArrowRightOutlined />}
          className={isLive ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-300 border-gray-300'}
          disabled={!isLive}
        />
      </div>
    </motion.div>
  );
}

export default function IntegrationChannel() {
  return (
    <section className="w-full bg-gray-50 py-20 px-[3%]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        {/* <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Integration Channels</h2>
        </div> */}

        {/* All Integration Cards */}
        <motion.div layout className="grid grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-3 min-xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {allPlatforms.map((platform) => (
              <IntegrationCard key={platform.name} platform={platform} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
