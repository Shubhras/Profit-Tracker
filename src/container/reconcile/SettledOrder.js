import React, { useState, useEffect } from 'react';
import { Table, Card, Spin } from 'antd';
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
  const data = [
    {
      key: 1,
      orderId: '2026-04-15 / 01- SLIP - BABY…408-6646947-4332304',
      date: '2026-04-10',
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
      orderId: '2026-04-10 / 01- SLIP - BABY…408-6642447-2332304',
      date: '2026-04-11',
      qty: 2,
      invoice: 0,
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
      title: 'Date',
      dataIndex: 'date',
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
    },
    {
      title: 'Chanel Fees',
      dataIndex: 'fees',
      align: 'center',
      sorter: (a, b) => a.fees - b.fees,
    },
    {
      title: 'TCS',
      dataIndex: 'tcs',
      align: 'center',
      sorter: (a, b) => a.tax - b.tax,
    },
    {
      title: 'Ship Fee',
      dataIndex: 'shipfee',
      align: 'center',
    },
    {
      title: 'Return',
      dataIndex: 'return',
      align: 'center',
    },
    {
      title: 'Settled',
      dataIndex: 'settled',
      align: 'center',
    },
    {
      title: 'Ship Fee',
      dataIndex: 'shipfee',
      align: 'center',
    },
    {
      title: 'Return',
      dataIndex: 'return',
      align: 'center',
    },
    {
      title: 'Settled',
      dataIndex: 'settled',
      align: 'center',
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
            />
          </Card>
        </Spin>
      </main>
    </>
  );
}
