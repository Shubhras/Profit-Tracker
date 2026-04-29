import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Card, Table, Tabs, Button, Spin, Modal, Select } from 'antd';
import { UploadOutlined, CloseOutlined } from '@ant-design/icons';
import { getInvoiceReconciliation } from '../../redux/reconcilePayment/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';
import meeshoIcon from '../../assets/icons/meesho.png';
import flipkartIcon from '../../assets/icons/flipkart.svg';

const { TabPane } = Tabs;

export default function InvoiceReconciliation() {
  const PageRoutes = [
    {
      path: '',
      breadcrumbName: 'Reconcile',
    },
    {
      path: '',
      breadcrumbName: 'B2C Reconciliation',
    },
    {
      path: '',
      breadcrumbName: 'Invoice Reconciliation',
    },
  ];
  const [activeTab, setActiveTab] = useState('meesho');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [type, setType] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const dispatch = useDispatch();
  const payload = {
    channel: {
      IN: activeTab === 'meesho' ? ['Meesho'] : ['Amazon-India'],
    },
    startDate: '2025-12-31T18:30:00Z',
    endDate: '2026-04-30T18:29:59Z',
  };
  useEffect(() => {
    dispatch(getInvoiceReconciliation(payload));
  }, [activeTab]);
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'upload') {
        setUploadModal(true);
      }
    };

    window.addEventListener('headerAction', handler);

    return () => {
      window.removeEventListener('headerAction', handler);
    };
  }, []);

  /* -------------------- MOCK API -------------------- */
  const fetchData = (channel) => {
    setLoading(true);

    setTimeout(() => {
      if (channel === 'meesho') {
        setData([
          {
            key: 'jan',
            month: 'Jan 2026',
            invoiceSales: 0,
            invoiceFees: 0,
            fsSales: 322128,
            fsFees: -102245,
            varianceSales: -322128,
            varianceFees: 102245,
          },
          {
            key: 'total',
            month: 'Total',
            invoiceSales: 0,
            invoiceFees: 0,
            fsSales: 322128,
            fsFees: -102245,
            varianceSales: -322128,
            varianceFees: 102245,
          },
        ]);
      } else {
        setData([
          {
            key: 'jan',
            month: 'Jan 2026',
            invoiceSales: 120000,
            invoiceFees: -25000,
            fsSales: 118500,
            fsFees: -26000,
            varianceSales: 1500,
            varianceFees: 1000,
          },
          {
            key: 'total',
            month: 'Total',
            invoiceSales: 120000,
            invoiceFees: -25000,
            fsSales: 118500,
            fsFees: -26000,
            varianceSales: 1500,
            varianceFees: 1000,
          },
        ]);
      }
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  /* -------------------- COLUMNS -------------------- */
  const columns = [
    {
      title: 'Invoice Dates to Orders',
      dataIndex: 'month',
      fixed: 'left',
      width: 200,
      render: (v) => <span className="font-medium">{v}</span>,
      // ❌ NO SORTER here
    },
    {
      title: 'Invoice Sales',
      dataIndex: 'invoiceSales',
      align: 'left',
      sorter: (a, b) => a.invoiceSales - b.invoiceSales,
      render: (v) => v.toLocaleString(),
    },
    {
      title: 'Invoice Fees',
      dataIndex: 'invoiceFees',
      align: 'left',
      sorter: (a, b) => a.invoiceFees - b.invoiceFees,
      render: (v) => v.toLocaleString(),
    },
    {
      title: 'FS Sales',
      dataIndex: 'fsSales',
      align: 'left',
      sorter: (a, b) => a.fsSales - b.fsSales,
      render: (v) => v.toLocaleString(),
    },
    {
      title: 'FS Fees',
      dataIndex: 'fsFees',
      align: 'left',
      sorter: (a, b) => a.fsFees - b.fsFees,
      render: (v) => v.toLocaleString(),
    },
    {
      title: 'Variance Sales',
      dataIndex: 'varianceSales',
      align: 'left',
      sorter: (a, b) => a.varianceSales - b.varianceSales,
      render: (v) => v.toLocaleString(),
    },
    {
      title: 'Variance Fees',
      dataIndex: 'varianceFees',
      align: 'left',
      sorter: (a, b) => a.varianceFees - b.varianceFees,
      render: (v) => v.toLocaleString(),
    },
    {
      title: 'Export Data',
      align: 'center',
      fixed: 'right',
      width: 130,
      // ❌ NO SORTER here
      render: () => (
        <Button type="primary" icon={<UploadOutlined />} size="small">
          Export
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Invoice Reconciliation"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Card bordered={false}>
          {/* -------------------- TABS -------------------- */}
          <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
            <TabPane
              key="meesho"
              tab={
                <span className="flex items-center gap-2 text-sm font-medium">
                  <img src={meeshoIcon} alt="Meesho" className="w-4 h-4" />
                  Meesho
                </span>
              }
            />
            <TabPane
              key="flipkart"
              tab={
                <span className="flex items-center gap-2 text-sm font-medium">
                  <img src={flipkartIcon} alt="Flipkart" className="w-4 h-4" />
                  Flipkart
                </span>
              }
            />
          </Tabs>

          {/* -------------------- TABLE -------------------- */}
          <Spin spinning={loading}>
            <Table columns={columns} dataSource={data} pagination={false} size="small" scroll={{ x: 1200 }} />
          </Spin>
        </Card>
      </main>
      <Modal
        open={uploadModal}
        onCancel={() => setUploadModal(false)}
        footer={null}
        centered
        width={420}
        closeIcon={<CloseOutlined style={{ fontSize: '16px', color: '#6b7280' }} />}
      >
        <h3 className="text-[16px] font-semibold mb-4">File Upload</h3>

        <Select
          placeholder="Select Type"
          className="w-full mb-4"
          size="large"
          value={type}
          onChange={(val) => setType(val)}
          options={[
            { label: 'MTR', value: 'mtr' },
            { label: 'TRANSACTION', value: 'transaction' },
          ]}
        />
        <input
          type="file"
          id="invoiceFileInput"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files[0];
            setSelectedFile(file);
          }}
        />
        <Button
          onClick={() => document.getElementById('invoiceFileInput').click()}
          className="mb-4 flex items-center gap-2 bg-[#e6f0ff] text-[#1d4ed8] border-none hover:bg-[#dbeafe] w-full justify-center"
        >
          {selectedFile ? selectedFile.name : 'Invoice Upload'}
          <UploadOutlined />
        </Button>

        <div className="flex justify-between mt-2">
          <Button onClick={() => setUploadModal(false)} className="border border-gray-300 text-gray-700">
            Cancel
          </Button>

          <Button type="primary" className="bg-[#1e3a8a]">
            Submit
          </Button>
        </div>
      </Modal>
    </>
  );
}
