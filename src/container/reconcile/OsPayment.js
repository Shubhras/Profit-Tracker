import React from 'react';
import { Card, Table, Row, Col } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function OsPayment() {
  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Profit',
    },
    {
      path: '',
      breadcrumbName: 'O/s Payment',
    },
  ];
  const paymentTableData = [
    {
      key: '1',
      label: 'Settled Not Paid',
      total: '₹3,47,429',
      amazon: '₹1,76,662',
      flipkart: '₹58,097',
      meesho: '₹1,12,670',
    },
    {
      key: '2',
      label: 'Settled Adjustment',
      total: '-₹14,168',
      amazon: '-₹3,590',
      flipkart: '₹433',
      meesho: '-₹11,012',
    },
    {
      key: '3',
      label: 'Unsettled Not Paid',
      total: '₹3,78,931',
      amazon: '₹3,73,130',
      flipkart: '₹5,800',
      meesho: '₹0',
    },
    {
      key: '4',
      label: 'Cashback Pending',
      total: '₹0',
      amazon: '₹0',
      flipkart: '₹0',
      meesho: '₹0',
    },
    {
      key: '5',
      label: 'Last Payment Date',
      total: '-',
      amazon: '12-01-2026',
      flipkart: '14-01-2026',
      meesho: '14-01-2026',
    },
    {
      key: '6',
      label: <strong>Total</strong>,
      total: <strong>₹7,12,192</strong>,
      amazon: <strong>₹5,46,202</strong>,
      flipkart: <strong>₹64,331</strong>,
      meesho: <strong>₹1,01,658</strong>,
    },
    {
      key: '7',
      label: 'Current Reserve',
      total: '',
      amazon: '₹0',
      flipkart: '',
      meesho: '',
    },
    {
      key: '8',
      label: 'Cashback Discrepancy',
      total: '',
      amazon: '₹0',
      flipkart: '₹0',
      meesho: '₹0',
    },
  ];

  const tableColumns = [
    { title: '', dataIndex: 'label' },
    { title: 'Total', dataIndex: 'total' },
    { title: 'Amazon', dataIndex: 'amazon' },
    { title: 'Flipkart', dataIndex: 'flipkart' },
    { title: 'Meesho', dataIndex: 'meesho' },
  ];

  const unsettledChartData = [
    { date: '25/10', Amazon: 370000, Flipkart: 8000 },
    { date: '25/11', Amazon: 3700, Flipkart: 800 },
    { date: '25/12', Amazon: 37000, Flipkart: 80 },
    { date: '26/01', Amazon: 370000, Flipkart: 80000 },
  ];

  const settledChartData = [
    { date: '26/01', Amazon: 150000, Flipkart: 60000, Meesho: 110000 },
    { date: '25/12', Amazon: 30000, Flipkart: 0, Meesho: 5000 },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Outstanding Payments"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Card className="mb-6">
          <Table columns={tableColumns} dataSource={paymentTableData} pagination={false} scroll={{ x: 900 }} />
        </Card>
        {/* ===== CHARTS ===== */}
        <Row gutter={[16, 16]}>
          {/* Unsettled Orders */}
          <Col xs={24} lg={12}>
            <Card title="Unsettled Orders - Outstanding Payments">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={unsettledChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Flipkart" stackId="a" fill="#86efac" />
                  <Bar dataKey="Amazon" stackId="a" fill="#fca5a5" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Settled Orders */}
          <Col xs={24} lg={12}>
            <Card title="Settled Orders - Outstanding Payments">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={settledChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Meesho" stackId="a" fill="#a5b4fc" />
                  <Bar dataKey="Flipkart" stackId="a" fill="#86efac" />
                  <Bar dataKey="Amazon" stackId="a" fill="#fca5a5" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Cashback */}
          <Col span={24}>
            <Card title="Cashback - Outstanding Payments">
              <div className="h-[200px] flex items-center justify-center text-gray-400">No data available</div>
            </Card>
          </Col>
        </Row>{' '}
      </main>
    </>
  );
}
