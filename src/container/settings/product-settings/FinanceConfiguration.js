import React, { useEffect, useState } from 'react';
import { Spin, Tabs, Modal, Input, Button } from 'antd';
import { UploadOutlined, CloseOutlined } from '@ant-design/icons';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [percentage, setPercentage] = useState('');
  const currentValue = 12; // static for now
  const [recalculateModal, setRecalculateModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [savedPercentage, setSavedPercentage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'upload') {
        setUploadModal(true);
      }
      if (e.detail === 'recalculate') {
        setRecalculateModal(true);
      }
    };

    window.addEventListener('headerAction', handler);

    return () => {
      window.removeEventListener('headerAction', handler);
    };
  }, []);

  // const PageRoutes = [
  //   {
  //     path: '',
  //     breadcrumbName: 'Settings',
  //   },
  //   {
  //     path: '',
  //     breadcrumbName: 'Product Settings',
  //   },
  //   {
  //     path: '',
  //     breadcrumbName: 'Finance Configuration',
  //   },
  // ];
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
      {/* <PageHeader
        routes={PageRoutes}
        title="Finance Configuration"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      /> */}
      <div className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px]">
        <PageHeader title="Finance Configuration" className="p-0 bg-transparent" />

        <div className="bg-gray-100 px-4 py-2 rounded-md flex items-center gap-3">
          <span className="text-sm">Min. Claim % to consider as Unsellable in profit</span>

          <span className="font-semibold">{savedPercentage !== null ? `${savedPercentage}%` : '%'}</span>
          <Button type="primary" className="text-white px-3 py-1 rounded-md" onClick={() => setIsModalOpen(true)}>
            Change
          </Button>
        </div>
      </div>
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
      <Modal
        title="Change Configuration Settings"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => {
          setSavedPercentage(percentage);
          setIsModalOpen(false);
        }}
        okText="Submit"
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm">Min. Claim % to consider as Unsellable in profit</label>

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Input
                type="number"
                placeholder="Enter percentage"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="px-3 py-1 outline-none w-[160px]"
              />

              <div className="bg-gray-100 text-black px-2 py-1 text-sm">%</div>
            </div>

            {/* Current value */}
            <span className="text-gray-500 text-sm">Current: {currentValue}%</span>
          </div>
        </div>
      </Modal>

      <Modal
        open={uploadModal}
        onCancel={() => setUploadModal(false)}
        footer={null}
        centered
        width={500}
        closeIcon={<CloseOutlined style={{ fontSize: '16px', color: '#6b7280' }} />}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[16px] font-semibold">File Upload</h3>

          <a href="#" className="text-blue-600 text-sm underline mt-4">
            Upload Sample File
          </a>
        </div>

        {/* UPLOAD BUTTON */}
        <input
          type="file"
          id="expenseFileInput"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            console.log(file);
          }}
        />

        <Button
          type="primary"
          onClick={() => document.getElementById('expenseFileInput').click()}
          className="mb-3 flex items-center gap-2 text-white border-none font-semibold"
        >
          <UploadOutlined style={{ color: '#fff', fontSize: '16px' }} />
          Expense Upload
        </Button>

        {/* INFO TEXT */}
        <p className="text-blue-600 text-sm italic mb-4">
          Once you have updated all settings, click the “Recalculate Expense” button to apply changes older than last
          month. Otherwise, the updates will be applied automatically the next morning.
        </p>

        {/* FOOTER */}
        <div className="flex justify-end gap-2">
          <Button onClick={() => setUploadModal(false)}>Cancel</Button>

          <Button type="primary">Submit</Button>
        </div>
      </Modal>

      <Modal open={recalculateModal} onCancel={() => setRecalculateModal(false)} footer={null} centered width={500}>
        <h3 className="text-[16px] font-semibold mb-4">Select Effective Date</h3>

        <input
          type="date"
          className="w-full border rounded-md px-3 py-2 mb-4"
          value={selectedDate || ''}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <p className="text-blue-600 text-sm italic mb-4">
          Use this for recalculating expenses beyond last month.he changes in front end will reflect only after next
          sync (depending on your agreed sync cycle for each channel)
        </p>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setRecalculateModal(false)}>Cancel</Button>

          <Button type="primary" disabled={!selectedDate}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
}
