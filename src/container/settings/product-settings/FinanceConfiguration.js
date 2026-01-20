import React, { useEffect, useState } from 'react';
import { Spin, Tabs } from 'antd';
import OtherExpenses from './finance-configuration-tabs/OtherExpenses';
import Cashback from './finance-configuration-tabs/Cashback';
import InventoryConfig from './finance-configuration-tabs/InventoryConfig';
import Rule from './finance-configuration-tabs/Rule';
import FeeWaiverConfig from './finance-configuration-tabs/FeeWaiverConfig';
import SettledAmountConfig from './finance-configuration-tabs/SettledAmountConfig';
import { PageHeader } from '../../../components/page-headers/page-headers';

const { TabPane } = Tabs;

export default function FinanceConfiguration() {
  const [activeTab, setActiveTab] = useState('otherExpenses');
  const [loading, setLoading] = useState(false);

  const PageRoutes = [
    {
      path: '',
      breadcrumbName: 'Settings',
    },
    {
      path: '',
      breadcrumbName: 'Product Settings',
    },
    {
      path: '',
      breadcrumbName: 'Finance Configuration',
    },
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
      case 'otherExpenses':
        return <OtherExpenses />;
      case 'cashback':
        return <Cashback />;
      case 'inventoryConfig':
        return <InventoryConfig />;
      case 'rule':
        return <Rule />;
      case 'feeWaiverConfig':
        return <FeeWaiverConfig />;
      case 'settledAmountConfig':
        return <SettledAmountConfig />;

      default:
        return null;
    }
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Finance Configuration"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="bg-white rounded-lg" tabBarGutter={24}>
          <TabPane tab="Other Expenses" key="otherExpenses" />
          <TabPane tab="Cashback" key="cashback" />
          <TabPane tab="Inventory Config" key="inventoryConfig" />
          <TabPane tab="Rule" key="rule" />
          <TabPane tab="Fee Waiver Config" key="feeWaiverConfig" />
          <TabPane tab="Settled Amount Config" key="settledAmountConfig" />
        </Tabs>
        <div className="mt-4 bg-white rounded-lg p-4 ">
          <Spin spinning={loading}>{renderTabContent()}</Spin>
        </div>
      </main>
    </>
  );
}
