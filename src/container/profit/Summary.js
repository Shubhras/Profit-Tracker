import React, { useState } from 'react';
import { Row, Col, Card, Statistic, Tag, Select, Divider, Checkbox } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PageHeader } from '../../components/page-headers/page-headers';

const { Option } = Select;

export default function Summary() {
  const [viewType, setViewType] = useState('percentage');

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Profit' },
    { path: '', breadcrumbName: 'Summary' },
  ];

  /* ---------- RIGHT STACKED CHART ---------- */
  const stackedData = [
    { date: '01/01', cancelled: 10, rto: 5, returned: 4 },
    { date: '02/01', cancelled: 14, rto: 7, returned: 6 },
    { date: '03/01', cancelled: 18, rto: 9, returned: 8 },
    { date: '04/01', cancelled: 16, rto: 8, returned: 7 },
    { date: '05/01', cancelled: 12, rto: 6, returned: 5 },
    { date: '06/01', cancelled: 11, rto: 6, returned: 4 },
    { date: '07/01', cancelled: 13, rto: 7, returned: 6 },
  ];

  /* ---------- BOTTOM CHART DATA ---------- */
  const bottomChartData = [
    { name: 'North', value: 45 },
    { name: 'South', value: 70 },
    { name: 'East', value: 30 },
    { name: 'West', value: 55 },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        {/* ================= FILTER BAR ================= */}
        <Card className="mb-4">
          <Row gutter={16} align="middle">
            <Col>
              <Checkbox defaultChecked>With Ads</Checkbox>
            </Col>
            <Col>
              <Checkbox defaultChecked>With GST</Checkbox>
            </Col>
            <Col>
              <Checkbox defaultChecked>With Estimate</Checkbox>
            </Col>
            <Col>
              <Checkbox defaultChecked>With Expenses</Checkbox>
            </Col>
          </Row>
        </Card>

        {/* ================= TOP SECTION ================= */}
        <Row gutter={[16, 16]}>
          {/* SALES */}
          <Col xs={24} lg={6}>
            <Card>
              <Statistic title="Sales" value={977289} prefix="₹" />
              <Tag color="blue" className="mt-2">
                Units: 3650
              </Tag>

              <Divider />

              <Row justify="space-between">
                <span>Gross</span>
                <span>4034</span>
              </Row>
              <Row justify="space-between">
                <span>Cancelled</span>
                <span>-73</span>
              </Row>
              <Row justify="space-between">
                <span>Returned</span>
                <span>-176</span>
              </Row>
              <Divider />
              <Row justify="space-between">
                <strong>Net</strong>
                <strong>3650</strong>
              </Row>
            </Card>
          </Col>

          {/* PROFIT */}
          <Col xs={24} lg={6}>
            <Card>
              <Statistic title="Profit" value={208638} prefix="₹" />
              <Tag color="gold">Margin: 21%</Tag>
              <Tag color="green">ROI: 49%</Tag>
            </Card>

            <Row gutter={8} className="mt-3">
              <Col span={12}>
                <Card size="small" className="bg-green-50">
                  <p className="text-green-700">Profit IDs</p>
                  <strong>#55</strong>
                  <p>₹2,09,859</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="bg-red-50">
                  <p className="text-red-600">Loss IDs</p>
                  <strong>#24</strong>
                  <p>-₹5,905</p>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* AD SPEND */}
          <Col xs={24} lg={6}>
            <Card>
              <Statistic title="Ad Spend" value={98316} prefix="₹" />
              <Tag color="magenta">TACOS: -10%</Tag>
            </Card>
          </Col>

          {/* STACKED BAR (RIGHT) */}
          <Col xs={24} lg={6}>
            <Card>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stackedData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cancelled" stackId="a" fill="#f28b82" />
                  <Bar dataKey="rto" stackId="a" fill="#a7f3a0" />
                  <Bar dataKey="returned" stackId="a" fill="#fbc687" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* ================= BOTTOM 4 PANELS ================= */}
        <Row gutter={[16, 16]} className="mt-6">
          {['Quantity Sold', 'Return', 'Shipping', 'Profit'].map((title) => (
            <Col xs={24} lg={6} key={title}>
              <Card
                title={title}
                extra={
                  <Select size="small" value={viewType} onChange={setViewType} style={{ width: 120 }}>
                    <Option value="percentage">Percentage</Option>
                    <Option value="amount">Amount</Option>
                  </Select>
                }
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={bottomChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          ))}
        </Row>
      </main>
    </>
  );
}
