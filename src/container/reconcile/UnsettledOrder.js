import React from 'react';
import { Table, Card, Tooltip } from 'antd';
import ajio from '../../assets/icons/ajio.png';
import flipkart from '../../assets/icons/flipkart.svg';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function UnsettledOrder() {
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
      breadcrumbName: 'Payment Reconciliation',
    },
  ];
  const columns = [
    {
      title: '',
      dataIndex: 'channel',
      width: 50,
      render: (value) =>
        value === 'ajio' ? (
          <img src={ajio} alt="ajio" className="w-5" />
        ) : (
          <img src={flipkart} alt="flipkart" className="w-5" />
        ),
    },
    {
      title: 'Order',
      dataIndex: 'order',
      ellipsis: true,
      sorter: (a, b) => a.order.localeCompare(b.order),
      render: (text) => (
        <Tooltip title={text}>
          <span className="font-medium">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.qty - b.qty,
    },
    {
      title: 'Invoice',
      dataIndex: 'invoice',
      align: 'center',
      sorter: (a, b) => a.invoice - b.invoice,
      render: (v) => `₹${v}`,
    },
    {
      title: 'Channel Fees',
      dataIndex: 'channelFees',
      align: 'center',
      sorter: (a, b) => a.channelFees - b.channelFees,
      render: (v) => <span className="text-red-500">-₹{v}</span>,
    },
    {
      title: 'TCS',
      dataIndex: 'tcs',
      align: 'center',
      sorter: (a, b) => a.tcs - b.tcs,
      responsive: ['md'],
      render: (v) => (v === 0 ? '₹0.00' : <span className="text-red-500">-₹{v}</span>),
    },
    {
      title: 'Ship Fee',
      dataIndex: 'shipFee',
      align: 'center',
      sorter: (a, b) => a.shipFee - b.shipFee,
      render: (v) => (v === 0 ? '₹0.00' : <span className="text-red-500">-₹{v}</span>),
    },
    {
      title: 'Settled Amount',
      dataIndex: 'settled',
      align: 'center',
      sorter: (a, b) => a.settled - b.settled,
      render: (v) => <strong>₹{v}</strong>,
    },
  ];

  const data = [
    {
      key: 1,
      channel: 'ajio',
      order: '2026-01-18 / 01 - SLIP - SKU...',
      qty: 1,
      invoice: 399,
      channelFees: 30,
      tcs: 0,
      shipFee: 42,
      settled: 327,
    },
    {
      key: 2,
      channel: 'flipkart',
      order: '2026-01-18 / 1125_BRWN_C_36',
      qty: 1,
      invoice: 329,
      channelFees: 31.82,
      tcs: 0,
      shipFee: 44.9,
      settled: 257.18,
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
        <Card bordered={false}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            size="small"
            scroll={{ x: 1000 }} // RESPONSIVE
            summary={() => (
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell align="center">1,503</Table.Summary.Cell>
                <Table.Summary.Cell align="center">₹4,92,657</Table.Summary.Cell>
                <Table.Summary.Cell align="center" className="text-red-500">
                  -₹48,186
                </Table.Summary.Cell>
                <Table.Summary.Cell align="center" className="text-red-500">
                  -₹157
                </Table.Summary.Cell>
                <Table.Summary.Cell align="center" className="text-red-500">
                  -₹60,697
                </Table.Summary.Cell>
                <Table.Summary.Cell align="center">₹3,65,424</Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </Card>{' '}
      </main>
    </>
  );
}
