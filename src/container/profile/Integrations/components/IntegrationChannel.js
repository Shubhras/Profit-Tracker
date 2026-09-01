import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from 'antd';
import {
  ShopOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  BankOutlined,
  ArrowRightOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';

const categories = [
  {
    id: 'marketplaces',
    name: 'Marketplaces',
    icon: <ShopOutlined />,
    color: 'orange',
    platforms: [
      { name: 'Amazon', logo: '', status: 'coming' },
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
    color: 'violet',
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
    color: 'rose',
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
    color: 'blue',
    platforms: [
      { name: 'Tally', logo: '/icons/tally.png', status: 'coming' },
      { name: 'Zoho Books', logo: '/icons/zoho.png', status: 'coming' },
    ],
  },
];

// Tailwind-safe color config per category — keep classnames literal (not built with string concat)
const COLOR_MAP = {
  orange: {
    iconBg: 'bg-orange-50 border-orange-100 text-orange-500',
    cardBorder: 'shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50',
    letter: 'text-orange-500',
    button: 'bg-orange-500 border-orange-500',
  },
  violet: {
    iconBg: 'bg-violet-50 border-violet-100 text-violet-500',
    cardBorder: 'shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50',
    letter: 'text-violet-500',
    button: 'bg-violet-500 border-violet-500',
  },
  rose: {
    iconBg: 'bg-rose-50 border-rose-100 text-rose-500',
    cardBorder: 'shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50',
    letter: 'text-rose-500',
    button: 'bg-rose-500 border-rose-500',
  },
  blue: {
    iconBg: 'bg-blue-50 border-blue-100 text-blue-500',
    cardBorder: 'shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50',
    letter: 'text-blue-500',
    button: 'bg-blue-500 border-blue-500',
  },
  slate: {
    iconBg: 'bg-slate-50 border-slate-100 text-slate-500',
    cardBorder: 'shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50',
    letter: 'text-slate-500',
    button: 'bg-slate-800 border-slate-800',
  },
};

// Combine all platforms for the grid, tagging each with its category's color
const allPlatforms = categories.flatMap((cat) =>
  cat.platforms.map((p) => ({ ...p, categoryName: cat.name, color: cat.color })),
);

function IntegrationCard({ platform }) {
  const isLive = platform.status === 'live';
  const colors = COLOR_MAP[platform.color] || COLOR_MAP.slate;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-center p-5 bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 ${colors.cardBorder}`}
    >
      {/* Logo Section */}
      <div
        className={`flex-shrink-0 w-16 h-16 p-2 rounded-xl border flex items-center justify-center mr-5 group-hover:scale-105 transition-transform duration-300 ${colors.iconBg}`}
      >
        {platform.logo ? (
          <img src={platform.logo} alt={platform.name} className="max-w-full max-h-full object-contain" />
        ) : (
          <div className={`text-2xl font-bold ${colors.letter}`}>{platform.name.charAt(0)}</div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-grow min-w-0 pr-6">
        <h3 className="text-[16px] font-bold text-gray-900 truncate mb-0.5">{platform.name}</h3>
        <p className="text-[12px] text-gray-400 font-medium truncate mb-0">{platform.categoryName}</p>
      </div>

      {/* Action (Visible on Hover for Desktop, always for Mobile) */}
      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
        <Button
          type="primary"
          shape="circle"
          size="small"
          icon={<ArrowRightOutlined />}
          className={isLive ? colors.button : 'bg-gray-200 border-gray-200 text-gray-400'}
          disabled={!isLive}
        />
      </div>
    </motion.div>
  );
}

export default function IntegrationChannel() {
  return (
    <section className="w-full bg-gray-50 py-10 px-[3%]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
            <NodeIndexOutlined className="text-emerald-600 text-sm" />

            <h2 className="text-emerald-700 font-bold text-xs tracking-wide uppercase mb-0">Integration Channels</h2>
          </div>
          <p className="block text-[15px] mx-auto leading-relaxed mb-10 mt-2">
            Connect the platforms your business already runs on
          </p>
        </div>

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
