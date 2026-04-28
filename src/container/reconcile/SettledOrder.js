import React, { useState, useEffect } from 'react';
import { Table, Card, Spin } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import ajio from '../../assets/icons/ajio.png';
import flipkart from '../../assets/icons/flipkart.svg';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function SettledOrder() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);
  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Reconcile',
    },
    {
      path: '',
      breadcrumbName: 'B2C Reconciliation',
    },
    {
      path: '',
      breadcrumbName: 'Payment Reconciliation',
    },
  ];
  const expandedRowRender = (record) => {
    if (record.type === 'fees') {
      return (
        <div className="flex gap-4">
          <Card size="small" style={{ width: 260 }}>
            <div className="flex justify-between font-medium mb-2">
              <span>Invoice Price</span>
              <span>{record.channel || 'Flipkart'}</span>
            </div>

            <div className="bg-gray-50 p-2 flex justify-between">
              <span>Sale Amount</span>
              <span>₹{record.invoice || 0}</span>
            </div>

            <div className="bg-gray-100 p-2 flex justify-between">
              <span>Total Offer Amount</span>
              <span>₹{record.offer || 0}</span>
            </div>

            <div className="bg-gray-50 p-2 flex justify-between">
              <span>My Share</span>
              <span>-₹{record.share || 0}</span>
            </div>
          </Card>

          <Card size="small" style={{ width: 260 }}>
            <div className="font-medium mb-2">Channel Fees</div>

            <div className="bg-gray-50 p-2 flex justify-between">
              <span>Taxes</span>
              <span>-₹{record.tcs || 0}</span>
            </div>

            <div className="bg-gray-100 p-2 flex justify-between">
              <span>Fixed Fee</span>
              <span>-₹{record.fees || 0}</span>
            </div>

            <div className="bg-gray-50 p-2 flex justify-between">
              <span>Other Fees</span>
              <span>₹0.00</span>
            </div>
          </Card>
        </div>
      );
    }

    // 🔵 CASE 2 → Screenshot wala UI (Invoice breakdown)
    if (record.type === 'invoice') {
      return (
        <div className="flex gap-4">
          <Card size="small" style={{ width: 260 }}>
            <div className="flex justify-between font-medium mb-2">
              <span>Invoice Price</span>
              <span>{record.channel || 'Flipkart'}</span>
            </div>

            <div className="bg-gray-50 p-2 flex justify-between">
              <span>Sale Amount</span>
              <span>₹{record.invoice || 0}</span>
            </div>

            <div className="bg-gray-100 p-2 flex justify-between">
              <span>Total Offer Amount</span>
              <span>₹{record.offer || 0}</span>
            </div>

            <div className="bg-gray-50 p-2 flex justify-between">
              <span>My Share</span>
              <span>-₹{record.share || 0}</span>
            </div>
          </Card>
        </div>
      );
    }

    return null;
  };
  const data = [
    {
      key: 1,
      type: 'fees',
      orderId: '2026-04-15 / 01- SLIP - BABY…408-6646947-4332304',
      status: 'Shipped',
      qty: 12,
      invoice: 0,
      fees: 50,
      tcs: 3,
      shipfee: 3.12,
      return: 3,
      settled: 1,
    },
    {
      key: 2,
      type: 'invoice',
      orderId: '2026-04-10 / 01- SLIP - BABY…408-6642447-2332304',
      status: 'Shipped',
      qty: 2,
      invoice: 140,
      fees: 100,
      tcs: 5,
      shipfee: 2.0,
      return: 2,
      settled: 3,
    },
  ];

  const columns = [
    {
      title: '',
      dataIndex: 'channel',
      width: 50,
      fixed: 'left',
      render: (value) =>
        value === 'ajio' ? (
          <img src={ajio} alt="ajio" className="w-5" />
        ) : (
          <img src={flipkart} alt="flipkart" className="w-5" />
        ),
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      // fixed: 'left',
      width: 250,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      align: 'center',
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Invoice',
      dataIndex: 'invoice',
      align: 'center',
      sorter: (a, b) => a.settlement - b.settlement,
      render: (v) => `₹${v}`,
    },
    {
      title: 'Chanel Fees',
      dataIndex: 'fees',
      align: 'center',
      sorter: (a, b) => a.fees - b.fees,
      render: (v) => `₹${v}`,
    },
    {
      title: 'TCS',
      dataIndex: 'tcs',
      align: 'center',
      sorter: (a, b) => a.tax - b.tax,
      render: (v) => `₹${v}`,
    },
    {
      title: 'Ship Fee',
      dataIndex: 'shipfee',
      align: 'center',
      sorter: (a, b) => new Date(a.shipfee) - new Date(b.shipfee),
      render: (v) => `₹${v}`,
    },
    {
      title: 'Return',
      dataIndex: 'return',
      align: 'center',
      sorter: (a, b) => new Date(a.return) - new Date(b.return),
      render: (v) => `₹${v}`,
    },
    {
      title: 'Settled Amount',
      dataIndex: 'settled',
      align: 'center',
      sorter: (a, b) => new Date(a.settled) - new Date(b.settled),
      render: (v) => `₹${v}`,
    },
  ];
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Payment Reconciliation"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Spin spinning={loading} size="large">
          <Card bordered={false} className="sales-table-wrapper">
            <Table
              columns={columns}
              dataSource={data}
              bordered
              size="small"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'max-content' }}
              expandable={{
                expandedRowRender,
                expandIconColumnIndex: 0,
                expandIcon: ({ expanded, onExpand, record }) => (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => onExpand(record, e)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onExpand(record, e);
                      }
                    }}
                    className="w-5 h-5 flex items-center justify-center border rounded-md bg-gray-100 cursor-pointer"
                  >
                    {expanded ? <DownOutlined style={{ fontSize: 10 }} /> : <RightOutlined style={{ fontSize: 10 }} />}
                  </div>
                ),
              }}
              summary={() => (
                <Table.Summary.Row className="font-semibold">
                  <Table.Summary.Cell />

                  <Table.Summary.Cell>Total</Table.Summary.Cell>

                  <Table.Summary.Cell />

                  <Table.Summary.Cell />

                  <Table.Summary.Cell align="center">14</Table.Summary.Cell>

                  <Table.Summary.Cell align="center">₹140</Table.Summary.Cell>

                  <Table.Summary.Cell align="center">₹150</Table.Summary.Cell>

                  <Table.Summary.Cell align="center">₹7</Table.Summary.Cell>

                  <Table.Summary.Cell align="center">₹5.12</Table.Summary.Cell>

                  <Table.Summary.Cell align="center">₹5</Table.Summary.Cell>

                  <Table.Summary.Cell align="center">₹4</Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Spin>
      </main>
    </>
  );
}
