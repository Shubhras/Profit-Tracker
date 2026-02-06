import React, { useState } from 'react';
import { Button, Modal, Form, Input } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/page-headers/page-headers';

// Import Local Icons (Mapping needed to show correct logo)
import flipkartIcon from '../../assets/icons/flipkart.png';
import meeshoIcon from '../../assets/icons/meesho.png';
import myntraIcon from '../../assets/icons/myntra.png';
import ajioIcon from '../../assets/icons/ajio.png';
import nykaaIcon from '../../assets/icons/nykaa.png';
import shopifyIcon from '../../assets/icons/shopify.png';
import wooIcon from '../../assets/icons/woo.png';
import magentoIcon from '../../assets/icons/magento.png';
import blinkitIcon from '../../assets/icons/blinkit.png';
import zeptoIcon from '../../assets/icons/zepto.png';
import swiggyIcon from '../../assets/icons/swiggy.png';
import tallyIcon from '../../assets/icons/tally.png';
import zohoIcon from '../../assets/icons/zoho.png';

const iconMap = {
  flipkart: flipkartIcon,
  meesho: meeshoIcon,
  myntra: myntraIcon,
  ajio: ajioIcon,
  nykaa: nykaaIcon,
  shopify: shopifyIcon,
  woocommerce: wooIcon,
  magento: magentoIcon,
  blinkit: blinkitIcon,
  zepto: zeptoIcon,
  swiggy: swiggyIcon,
  tally: tallyIcon,
  zoho: zohoIcon,
};

export default function MarketplaceConnection() {
  const [searchParams] = useSearchParams();
  const marketId = searchParams.get('market');
  const marketStatus = searchParams.get('status');

  const [modalVisible, setModalVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(marketStatus === 'connected'); // Toggle logic
  const [form] = Form.useForm();

  // Mock Market Data (In real app, fetch from API)
  const marketName = marketId ? marketId.charAt(0).toUpperCase() + marketId.slice(1) : 'Marketplace';
  const marketLogo = iconMap[marketId] || null;

  const handleModalClose = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleFormSubmit = (values) => {
    console.log('Connecting...', values);
    handleModalClose();
    setIsConnected(true); // Simulate successful connection
  };

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Settings',
    },
    {
      path: '',
      breadcrumbName: 'Marketplace Connection',
    },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Marketplace Connection"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[400px] relative">
          {/* Top Right Action Button - Visible mainly when connected, but good to have always accessible if needed */}
          {isConnected && (
            <div className="absolute top-8 right-8">
              <Button
                type="primary"
                className="bg-blue-800 hover:bg-blue-900 border-none font-bold flex items-center gap-2 h-10 px-6 rounded-md shadow-sm"
                onClick={() => setModalVisible(true)}
              >
                <span>+</span> NEW CONNECTION
              </Button>
            </div>
          )}

          {!isConnected ? (
            /* Empty State / Initial View */
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] max-w-md mx-auto text-center">
              <div className="mb-6 text-gray-200">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="40" width="80" height="60" rx="8" fill="#F3F4F6" />
                  <path
                    d="M30 40V30C30 24.4772 34.4772 20 40 20H80C85.5228 20 90 24.4772 90 30V40"
                    stroke="#E5E7EB"
                    strokeWidth="4"
                  />
                  <circle cx="60" cy="70" r="12" fill="#D1D5DB" />
                  <path d="M40 90H80" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-gray-900 mb-2">No connections found.</h2>
              <p className="text-gray-500 mb-8">
                You haven&apos;t connected any account yet. Click the button below to add your first connection.
              </p>

              <Button
                type="primary"
                size="large"
                className="bg-blue-800 hover:bg-blue-900 border-none px-8 h-12 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/10"
                onClick={() => setModalVisible(true)}
              >
                <span>+</span> ADD NEW CONNECTION
              </Button>
            </div>
          ) : (
            /* Connected State View */
            <div className="pt-4">
              <div className="bg-white border text-center border-gray-200 rounded-xl p-6 w-full max-w-[300px] shadow-sm relative ">
                {/* Logo */}
                <div className="w-12 h-12 mb-4 mx-auto">
                  <img
                    src={marketLogo || (marketId ? `https://logo.clearbit.com/${marketId}.com` : '')}
                    alt={marketName}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Market Name */}
                <h3 className="text-lg font-bold text-gray-800 mb-4">{marketName}</h3>

                {/* Disconnect Button */}
                <div className="mb-6">
                  <Button
                    className="bg-emerald-400 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded uppercase tracking-wide transition-colors"
                    onClick={() => setIsConnected(false)}
                  >
                    Disconnect
                  </Button>
                </div>

                {/* Form Fields */}
                <div className="text-left">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Display Name</label>
                  <Input
                    className="bg-gray-50 border-gray-200 text-gray-500 text-sm h-10 rounded-md"
                    defaultValue="Fshway"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Connection Modal */}
        <Modal title={null} footer={null} visible={modalVisible} onCancel={handleModalClose} width={500} centered>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Add New Connection</h3>
            <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
              <Form.Item
                name="username"
                label="Username / Email"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input size="large" className="rounded-lg" placeholder="Enter username" />
              </Form.Item>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please enter password' }]}
              >
                <Input.Password size="large" className="rounded-lg" placeholder="Enter password" />
              </Form.Item>
              <Form.Item className="mb-0 mt-8">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg font-bold h-11"
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Modal>
      </main>
    </>
  );
}
