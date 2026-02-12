import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input } from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  ShopOutlined,
  // RocketOutlined,
  ThunderboltOutlined,
  BankOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import flipkartLogo from '../../../../assets/icons/flipkart.png';
import myntraLogo from '../../../../assets/icons/myntra.png';
import meeshoLogo from '../../../../assets/icons/meesho.png';
import ajioLogo from '../../../../assets/icons/ajio.png';
import nykaaLogo from '../../../../assets/icons/nykaa.png';

import shopifyLogo from '../../../../assets/icons/shopify.png';
import wooLogo from '../../../../assets/icons/woo.png';
import magentoLogo from '../../../../assets/icons/magento.png';

import blinkitLogo from '../../../../assets/icons/blinkit.png';
import zeptoLogo from '../../../../assets/icons/zepto.png';
import swiggyLogo from '../../../../assets/icons/swiggy.png';

import tallyLogo from '../../../../assets/icons/tally.png';
import zohoLogo from '../../../../assets/icons/zoho.png';

const categories = [
  {
    id: 'marketplaces',
    name: 'Marketplaces',
    icon: <ShopOutlined />,
    platforms: [
      { name: 'Flipkart', logo: flipkartLogo, status: 'coming' },
      { name: 'Myntra', logo: myntraLogo, status: 'coming' },
      { name: 'Meesho', logo: meeshoLogo, status: 'coming' },
      { name: 'Ajio', logo: ajioLogo, status: 'coming' },
      { name: 'Nykaa', logo: nykaaLogo, status: 'coming' },
    ],
  },
  {
    id: 'd2c',
    name: 'D2C Platforms',
    icon: <AppstoreOutlined />,
    platforms: [
      { name: 'Shopify', logo: shopifyLogo, status: 'coming' },
      { name: 'WooCommerce', logo: wooLogo, status: 'coming' },
      { name: 'Magento', logo: magentoLogo, status: 'coming' },
    ],
  },
  {
    id: 'quick',
    name: 'Quick Commerce',
    icon: <ThunderboltOutlined />,
    platforms: [
      { name: 'Blinkit', logo: blinkitLogo, status: 'coming' },
      { name: 'Zepto', logo: zeptoLogo, status: 'coming' },
      { name: 'Swiggy Instamart', logo: swiggyLogo, status: 'coming' },
    ],
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: <BankOutlined />,
    platforms: [
      { name: 'Tally', logo: tallyLogo, status: 'coming' },
      { name: 'Zoho Books', logo: zohoLogo, status: 'coming' },
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
        <p className="text-xs text-gray-500 font-medium truncate">{isLive ? 'Full Sync Active' : 'Adding Soon'}</p>
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
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const getDisplayPlatforms = () => {
    let baseList = [];
    if (activeTab === 'all') {
      baseList = allPlatforms;
    } else {
      const category = categories.find((c) => c.id === activeTab);
      baseList = category ? category.platforms.map((p) => ({ ...p, category: category.name })) : [];
    }

    if (searchQuery) {
      return baseList.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return baseList;
  };

  const displayPlatforms = getDisplayPlatforms();

  return (
    <section className="w-full bg-gray-50 py-20 px-[3%]">
      <div className="max-w-7xl mx-auto">
        {/* Controls Header */}
        <div className="flex flex-col min-lg:flex-row items-start lg:items-center justify-between gap-6 mb-12">
          {/* Tabs Scrollable */}
          <div className="flex-1 overflow-x-auto pb-2 w-full min-lg:w-auto -mx-4 px-4 min-lg:mx-0 min-lg:px-0">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-5 py-2.5 flex items-center justify-center rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 mt-0 ${
                  activeTab === 'all'
                    ? '!bg-gray-900 !text-white hover:!text-white focus:!text-white focus-visible:!text-white active:!text-white hover:!bg-gray-900'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                All Apps
              </button>
              {categories.map((cat) => (
                <button
                  type="button"
                  // type="text"
                  onClick={() => setActiveTab(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-all duration-300 !shadow-none ${
                    activeTab === cat.id
                      ? '!bg-gray-900 !text-white !border-none hover:!text-white focus:!text-white focus-visible:!text-white active:!text-white hover:!bg-gray-900'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {cat.icon}
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="w-full min-lg:w-72">
            <Input
              placeholder="Search integrations..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-full py-2.5 px-4 border-gray-200 hover:border-emerald-500 focus:border-emerald-500 shadow-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content Grid - Horizontal Cards */}
        <motion.div layout className="grid grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-3 min-xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {displayPlatforms.map((platform) => (
              <IntegrationCard key={platform.name} platform={platform} />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {displayPlatforms.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">No integration found</h3>
            <p className="text-gray-500">Try adjusting your search or category filter.</p>
          </div>
        )}

        {/* CTA Footer */}
        {/* <div className="mt-20 pt-10 border-t border-gray-200 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Can&apos;t find what you need?</h3>
          <Button className="text-emerald-600 font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
            <RocketOutlined /> Request a Custom Integration
          </Button>
        </div> */}
      </div>
    </section>
  );
}
