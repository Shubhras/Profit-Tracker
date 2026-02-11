import React from 'react';
import { Row, Col, Card, Table, Empty } from 'antd';
import FilterBar from './component/FilterBar';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function MinSettLeaks() {
  const varianceSummaryColumns = [
    { title: 'Channel', dataIndex: 'channel' },
    // { title: 'Fee Type', dataIndex: 'feeType' },
    // { title: 'Order Count', dataIndex: 'orderCount', align: 'right' },
    { title: 'SKU Count', dataIndex: 'skuCount', align: 'right' },
    { title: 'Actual Settled', dataIndex: 'actualSettled', align: 'right' },
    { title: 'Settled Calculated', dataIndex: 'settledCalculated', align: 'right' },
    { title: 'Variance', dataIndex: 'variance', align: 'right' },
  ];

  const varianceDetailColumns = [
    { title: 'Channel', dataIndex: 'channel' },
    { title: 'Order ID', dataIndex: 'orderId' },
    { title: 'Order Date', dataIndex: 'orderDate', sorter: true },
    { title: 'SKU', dataIndex: 'sku' },
    { title: 'Product ID', dataIndex: 'productId' },
    {
      title: 'Type',
      dataIndex: 'type',
      filters: [
        { text: 'Select All', value: 'ALL' },
        { text: 'Settled Recon', value: 'SettledRecon' },
        { text: 'Settled Auto', value: 'SettledAuto' },
      ],
      onFilter: (value, record) => {
        if (value === 'ALL') return true;
        return record.type === value;
      },
    },
    { title: 'Invoice Price', dataIndex: 'invoicePrice', sorter: true },
    { title: 'Actual Settled', dataIndex: 'actualSettled', sorter: true },
    { title: 'Settled Calculated', dataIndex: 'settledCalculated', sorter: true },
    { title: 'Variance', dataIndex: 'variance', sorter: true },
    { title: 'Settlement History', dataIndex: 'settlementHistory' },
  ];

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Profit',
    },
    {
      path: '',
      breadcrumbName: 'Min. Sett. Leaks',
    },
  ];
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Settled Amount Recon"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <FilterBar />
        <Row gutter={[16, 16]}>
          {/* LEFT TABLE */}
          <Col xs={24} sm={24} md={24} lg={18}>
            <Card title="Variance Table" bordered={false}>
              <Table
                columns={varianceSummaryColumns}
                dataSource={[]}
                pagination={false}
                scroll={{ x: true }} // mobile safety
                locale={{
                  emptyText: <Empty description="No data" />,
                }}
              />
            </Card>
          </Col>

          {/* RIGHT CARD */}
          <Col xs={24} sm={24} md={24} lg={6}>
            <Card title="Variance" bordered={false} className="h-full" />
          </Col>
        </Row>

        {/* BOTTOM TABLE */}
        <Row gutter={[16, 16]} className="mt-4">
          <Col xs={24}>
            <Card bordered={false}>
              <Table
                columns={varianceDetailColumns}
                dataSource={[]}
                scroll={{ x: true }} // mobile safety
                locale={{
                  emptyText: <Empty description="No data" />,
                }}
              />
            </Card>
          </Col>
        </Row>
      </main>
    </>
  );
}
