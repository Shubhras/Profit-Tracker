import React from 'react';
import { Row, Col, Card, Table, Empty, Divider } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';

/* ================= DATA OBJECTS ================= */

const leakSummary = [
  { title: 'Shipping Leaks', value: 0 },
  { title: 'Other Leaks', value: 0 },
  { title: 'Total Leaks', value: 0 },
];

const tableColumns = [
  { title: 'Channel', dataIndex: 'channel' },
  { title: 'Fee Type', dataIndex: 'feeType' },
  { title: 'SKU Count', dataIndex: 'skuCount' },
  { title: 'Received Fees', dataIndex: 'receivedFees' },
  { title: 'Calculated Fees', dataIndex: 'calculatedFees' },
  { title: 'Variance', dataIndex: 'variance' },
];

const tableData = []; // No data as per image

// const tableTotalRow = {
//   key: 'total',
//   channel: 'Total',
//   skuCount: 0,
//   receivedFees: '₹0',
//   calculatedFees: '₹0',
//   variance: '₹0',
// };

const cashflowData = [
  {
    title: 'Unsettled Not Paid',
    orders: 1485,
    amount: '₹3,77,757',
    bg: 'bg-blue-50',
  },
  {
    title: 'Settled Not Paid',
    orders: 2051,
    amount: '₹3,16,669',
    bg: 'bg-purple-50',
  },
  {
    title: 'Settled Adjustment',
    orders: 37,
    amount: '-117',
    bg: 'bg-gray-50',
  },
];

const bankWorkflowData = [
  { label: 'Remittance Amount', value: '₹4,39,527.77', highlight: true },
  { label: 'Negative Adjustment', value: '₹0.00' },
  { label: 'Total', value: '₹4,39,527.77', highlight: true },
  { label: 'Orders Paid', value: '₹5,29,343.80' },
  { label: 'Advertisement Cost', value: '-₹85,531.57', negative: true },
  { label: 'Reserve Adjustment', value: '₹0.00' },
  { label: 'Other Adjustment', value: '-₹4,284.46', negative: true },
];

/* ================= COMPONENT ================= */

export default function ReconcileSummary() {
  const PageRoutes = [
    { path: '', breadcrumbName: 'Reconcile' },
    { path: '', breadcrumbName: 'Summary' },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="PAYMENT RECONCILIATION"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        {/* ===== TOP LEAK SUMMARY ===== */}
        <Row gutter={[16, 16]} className="mb-4">
          {leakSummary.map((item) => (
            <Col key={item.title} xs={24} sm={12} lg={8}>
              <Card>
                <p className="text-blue-600 font-semibold">{item.title}</p>
                <h2 className="text-xl font-bold">₹{item.value}</h2>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ===== TABLE ===== */}
        <Card className="mb-6 overflow-x-auto">
          <Table
            columns={tableColumns}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: 800 }}
            locale={{ emptyText: <Empty description="No data" /> }}
            footer={() => (
              <Row justify="space-between">
                <strong>Total</strong>
                <strong>₹0</strong>
              </Row>
            )}
          />
        </Card>

        {/* ===== BOTTOM SECTION ===== */}
        <Row gutter={[16, 16]}>
          {/* VARIANCE */}
          <Col xs={24} lg={6}>
            <Card title="Variance" className="h-full min-h-[250px]" />
          </Col>

          {/* CASHFLOW PLANNING */}
          <Col xs={24} lg={12}>
            <Card title="Cashflow Planning" className="h-full">
              <Row gutter={[16, 16]}>
                {cashflowData.map((item) => (
                  <Col key={item.title} xs={24} sm={12} lg={8}>
                    <Card className={`${item.bg} h-full`}>
                      <p className="font-semibold">{item.title}</p>
                      <Divider />
                      <p>No. of Orders</p>
                      <h3 className="text-lg font-bold">{item.orders}</h3>
                      <p className="mt-2">Estimated Amount</p>
                      <h3 className="text-lg font-bold">{item.amount}</h3>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          {/* BANK TRANSFER WORKFLOW */}
          <Col xs={24} lg={6}>
            <Card
              className="h-full"
              title={
                <div className="flex items-center justify-between gap-2">
                  <span>Bank Transfer Workflow</span>
                  <DownloadOutlined className="text-blue-600 cursor-pointer" />
                </div>
              }
            >
              {bankWorkflowData.map((item) => (
                <Row key={item.label} justify="space-between" className="py-2 border-b text-sm">
                  <span className="truncate max-w-[70%]">{item.label}</span>
                  <span
                    className={`font-semibold ${item.highlight ? 'text-blue-600' : ''} ${
                      item.negative ? 'text-red-500' : ''
                    }`}
                  >
                    {item.value}
                  </span>
                </Row>
              ))}

              <p className="text-xs text-gray-400 mt-3">* Based on Bank Deposited Date</p>
            </Card>
          </Col>
        </Row>
      </main>
    </>
  );
}
