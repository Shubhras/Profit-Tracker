import React from 'react';
import { Row, Col, Card } from 'antd';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function Maps() {
  const chartData = [
    { state: 'Delhi', qty: 11, shipping: 18, profit: 22, returns: 6 },
    { state: 'Uttar Pradesh', qty: 28, shipping: 35, profit: 14, returns: 10 },
    { state: 'Maharashtra', qty: 20, shipping: 15, profit: 30, returns: 8 },
    { state: 'Gujarat', qty: 14, shipping: 10, profit: 18, returns: 5 },
  ];

  const graphList = [
    {
      title: 'QTY',
      key: 'qty',
    },
    {
      title: 'Shipping',
      key: 'shipping',
    },
    {
      title: 'Profit',
      key: 'profit',
    },
    {
      title: 'Return',
      key: 'returns',
    },
  ];
  function CustomTooltip({ active, payload }) {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: '#111827',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {payload[0].payload.state}
        </div>
      );
    }

    return null;
  }

  return (
    <Row gutter={[16, 16]}>
      {graphList.map((graph) => (
        <Col xs={24} md={12} lg={6} key={graph.key}>
          <Card
            title={graph.title}
            style={{
              borderRadius: '14px',
            }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 0,
                  left: -28,
                  bottom: 20,
                }}
              >
                <XAxis
                  dataKey="state"
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                  label={{
                    value: 'States',
                    position: 'insideBottom',
                    offset: -10,
                    style: {
                      fill: '#6b7280',
                      fontSize: 12,
                      fontWeight: 500,
                    },
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 11,
                  }}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />

                <Bar dataKey={graph.key} radius={[4, 4, 0, 0]} barSize={24} fill="#cbd5e1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
