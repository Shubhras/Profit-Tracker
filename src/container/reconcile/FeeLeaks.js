import React from 'react';
import { Row, Col, Card, Table, Empty } from 'antd';
import FilterBar from './component/FilterBar';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function FeeLeaks() {
  const varianceSummaryColumns = [
    { title: 'Channel', dataIndex: 'channel' },
    { title: 'Fee Type', dataIndex: 'feeType' },
    { title: 'Order Count', dataIndex: 'orderCount', align: 'right' },
    { title: 'SKU Count', dataIndex: 'skuCount', align: 'right' },
    { title: 'Received Fees', dataIndex: 'received', align: 'right' },
    { title: 'Calculated Fees', dataIndex: 'calculated', align: 'right' },
    { title: 'Variance', dataIndex: 'variance', align: 'right' },
  ];

  const varianceDetailColumns = [
    { title: 'Channel', dataIndex: 'channel' },
    { title: 'Order ID', dataIndex: 'orderId' },
    { title: 'Order Date', dataIndex: 'orderDate', sorter: true },
    { title: 'SKU', dataIndex: 'sku' },
    { title: 'Product ID', dataIndex: 'productId' },
    { title: 'Fees Type', dataIndex: 'feesType' },
    {
      title: 'Recon type',
      dataIndex: 'reconType',
      filters: [
        { text: 'Select All', value: 'ALL' },
        { text: 'Manual', value: 'Manual' },
        { text: 'FeeAuto', value: 'FeeAuto' },
        { text: 'FeeRecon', value: 'FeeRecon' },
      ],
      onFilter: (value, record) => {
        if (value === 'ALL') return true;
        return record.reconType === value;
      },
    },
    { title: 'Received Fees', dataIndex: 'receivedFees', sorter: true },
    { title: 'Calculated Fees', dataIndex: 'calculatedFees', sorter: true },
    { title: 'Variance', dataIndex: 'variance', sorter: true },
  ];

  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Reconcile',
    },
    {
      path: '',
      breadcrumbName: 'Fee Leaks',
    },
  ];
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Fees Leaks Recon"
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
                scroll={{ x: true }} // important for mobile
                locale={{
                  emptyText: <Empty description="No data" />,
                }}
                summary={() => (
                  <Table.Summary.Row className="bg-blue-50 font-medium">
                    <Table.Summary.Cell>Total</Table.Summary.Cell>
                    <Table.Summary.Cell />
                    <Table.Summary.Cell align="right">0</Table.Summary.Cell>
                    <Table.Summary.Cell align="right">0</Table.Summary.Cell>
                    <Table.Summary.Cell align="right">₹0</Table.Summary.Cell>
                    <Table.Summary.Cell align="right">₹0</Table.Summary.Cell>
                    <Table.Summary.Cell align="right">₹0</Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
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
          <Col span={24}>
            <Card bordered={false}>
              <Table
                columns={varianceDetailColumns}
                dataSource={[]}
                scroll={{ x: true }} // mobile-friendly
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
