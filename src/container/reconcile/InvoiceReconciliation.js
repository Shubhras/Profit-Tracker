import React, { useEffect, useState } from 'react';
import { Card, Table, Tabs, Button, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import amazonIcon from '../../assets/icons/amazon.svg';
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
  const [activeTab, setActiveTab] = useState('amazon');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  /* -------------------- MOCK API -------------------- */
  const fetchData = (channel) => {
    setLoading(true);

    setTimeout(() => {
      if (channel === 'amazon') {
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
              key="amazon"
              tab={
                <span className="flex items-center gap-2 text-sm font-medium">
                  <img src={amazonIcon} alt="Amazon" className="w-4 h-4" />
                  Amazon-India
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
    </>
  );
}
