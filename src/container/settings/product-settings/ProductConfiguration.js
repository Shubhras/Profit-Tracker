import React, { useEffect, useState } from 'react';
import { Tabs, Spin } from 'antd';
import ProductConfigTab from './ProductConfigurationTabs/ProductConfigTab';
import InventoryMastertab from './ProductConfigurationTabs/InventoryMastertab';
import PincodeTab from './ProductConfigurationTabs/PincodeTab';
import { PageHeader } from '../../../components/page-headers/page-headers';

export default function ProductConfiguration() {
  const [activeTab, setActiveTab] = useState('product');
  const [loading, setLoading] = useState(false);

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Settings' },
    { path: '', breadcrumbName: 'Product Settings' },
    { path: '', breadcrumbName: 'Product Configuration' },
  ];

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'product':
        return <ProductConfigTab />;
      case 'inventory':
        return <InventoryMastertab />;
      case 'pincode':
        return <PincodeTab />;
      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Product Configuration"
        className="flex justify-between items-center px-8 pt-2 pb-6 bg-transparent"
      />

      <main className="min-h-[715px] px-8 pb-[30px]">
        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="bg-white rounded-lg"
          tabBarGutter={24}
          items={[
            { key: 'product', label: 'Product Configuration' },
            { key: 'inventory', label: 'Inventory Master Configuration' },
            { key: 'pincode', label: 'Pincode' },
          ]}
        />

        {/* Content */}
        <div className="mt-3 bg-white rounded-lg">
          <Spin spinning={loading}>{renderTabContent()}</Spin>
        </div>
      </main>
    </>
  );
}
