import React, { useEffect, useState } from 'react';
import { Spin, Tabs } from 'antd';
import ProductTab from './overviewtabs/ProductTab';
import B2BProductTab from './overviewtabs/B2BProductTab';
import StandardCostTab from './overviewtabs/StandardCostTab';
import OthersTab from './overviewtabs/OthersTab';
import RecentUpdatesTab from './overviewtabs/RecentUpdatesTab';
import { PageHeader } from '../../../components/page-headers/page-headers';

const { TabPane } = Tabs;

export default function Overview() {
  const [activeTab, setActiveTab] = useState('product');
  const [loading, setLoading] = useState(false);

  const PageRoutes = [
    { path: '', breadcrumbName: 'Settings' },
    { path: '', breadcrumbName: 'Product Setting' },
    { path: '', breadcrumbName: 'Overview' },
  ];

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [activeTab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'product':
        return <ProductTab />;
      case 'b2b':
        return <B2BProductTab />;
      case 'standardCost':
        return <StandardCostTab />;
      case 'others':
        return <OthersTab />;
      case 'updates':
        return <RecentUpdatesTab />;
      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Overview"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="bg-white rounded-lg" tabBarGutter={24}>
          <TabPane tab="Product" key="product" />
          <TabPane tab="B2B Product" key="b2b" />
          <TabPane tab="Standard Cost" key="standardCost" />
          <TabPane tab="Others" key="others" />
          <TabPane tab="Recent Updates" key="updates" />
        </Tabs>

        <div className="mt-4 bg-white rounded-lg p-4">
          <Spin spinning={loading}>{renderTabContent()}</Spin>
        </div>
      </main>
    </>
  );
}
