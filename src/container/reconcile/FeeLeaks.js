import React, { useState, useEffect } from 'react';

import { Row, Col, Card, Table, Empty, Spin, Select, Button, Input } from 'antd';

import { FilterOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Area } from 'recharts';

export default function FeeLeaks() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);
  const varianceSummaryColumns = [
    { title: 'Channel', dataIndex: 'channel' },
    { title: 'Fee Type', dataIndex: 'feeType' },
    { title: 'Order Count', dataIndex: 'orderCount', align: 'right' },
    { title: 'SKU Count', dataIndex: 'skuCount', align: 'right' },
    { title: 'Received Fees', dataIndex: 'received', align: 'right' },
    { title: 'Calculated Fees', dataIndex: 'calculated', align: 'right' },
    { title: 'Variance', dataIndex: 'variance', align: 'right' },
  ];

  const leakCategoryData = [
    { name: 'Shipping', value: 12450, color: '#3b82f6' },
    { name: 'Other', value: 18320, color: '#9333ea' },
    { name: 'Fee', value: 10125, color: '#f59e0b' },
    { name: 'Tax', value: 8254, color: '#10b981' },
  ];

  const leakTrendData = [
    { name: '01 May', amount: 39000 },
    { name: '06 May', amount: 40000 },
    { name: '11 May', amount: 32000 },
    { name: '16 May', amount: 25000 },
    { name: '21 May', amount: 29000 },
    { name: '26 May', amount: 21000 },
    { name: '31 May', amount: 30000 },
  ];

  const leakStatusData = [
    { name: 'Open', value: 38420, color: '#ff4d6d' },
    { name: 'In Review', value: 7290, color: '#facc15' },
    { name: 'Recovered', value: 3439, color: '#22c55e' },
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

  return (
    <>
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-3 py-2 mt-2 xl:px-[15px] pb-5 bg-transparent">
        <Spin spinning={loading} size="large">
          {/* TOP HEADER */}

          <div className="mb-3">
            <div className="flex items-center justify-between gap-3 md:flex-col md:items-start">
              <div>
                <h1 className="text-[21px] font-semibold text-dark leading-none mb-1">All Leaks</h1>

                <p className="text-[12px] text-light leading-4 mb-0">
                  View, analyze and export all types of leaks identified across marketplaces.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:w-full sm:flex-wrap">
                <Button icon={<FilterOutlined />} className="text-[12px] h-[30px]">
                  Filters
                </Button>

                <Button type="primary" icon={<DownloadOutlined />} className="text-[12px] h-[30px] shadow-none">
                  Download All Leaks
                </Button>
              </div>
            </div>
          </div>

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-4 gap-3 xl:grid-cols-2 sm:grid-cols-1 mb-3">
            <div className="bg-[#fff5f5] border border-[#ffe5e5] rounded-10 p-4">
              <p className="text-[13px] text-[#ef4444] font-medium mb-2">Total Leak Amount</p>

              <h2 className="text-[19px] font-semibold text-[#ef4444] leading-none">₹ 49,150.33</h2>

              <p className="text-[11px] text-light mt-1">▲ 17.37% of Expected</p>
            </div>

            <div className="bg-[#faf5ff] border border-[#f1e4ff] rounded-10 p-4">
              <p className="text-[13px] text-[#9333ea] font-medium mb-2">Open Leaks</p>

              <h2 className="text-[19px] font-semibold text-[#9333ea] leading-none">₹ 38,420.75</h2>

              <p className="text-[11px] text-light mt-1">78.19% of Total Leaks</p>
            </div>

            <div className="bg-[#fffaf0] border border-[#ffeccc] rounded-10 p-4">
              <p className="text-[13px] text-[#f59e0b] font-medium mb-2">In Review</p>

              <h2 className="text-[19px] font-semibold text-[#f59e0b] leading-none">₹ 7,290.20</h2>

              <p className="text-[11px] text-light mt-1">14.84% of Total Leaks</p>
            </div>

            <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-10 p-4">
              <p className="text-[13px] text-[#16a34a] font-medium mb-2">Recovered</p>

              <h2 className="text-[19px] font-semibold text-[#16a34a] leading-none">₹ 3,439.38</h2>

              <p className="text-[11px] text-light mt-1">6.97% of Total Leaks</p>
            </div>
          </div>

          {/* FILTER BAR */}

          <div className="bg-white border border-normal rounded-10 shadow-regular px-2 py-3 mb-2">
            <div className="grid grid-cols-6 gap-2 xl:grid-cols-3 sm:grid-cols-1">
              <Select
                size="small"
                className="text-[10px]"
                defaultValue="All Marketplaces"
                options={[
                  { label: 'All Marketplaces', value: 'all' },
                  { label: 'Amazon', value: 'amazon' },
                ]}
              />

              <Select
                size="small"
                className="text-[10px]"
                defaultValue="All Types"
                options={[
                  { label: 'All Types', value: 'all' },
                  { label: 'Shipping', value: 'shipping' },
                ]}
              />

              <Select
                size="small"
                className="text-[10px]"
                defaultValue="All Categories"
                options={[{ label: 'All Categories', value: 'all' }]}
              />

              <Select
                size="small"
                className="text-[10px]"
                defaultValue="All Status"
                options={[{ label: 'All Status', value: 'all' }]}
              />

              <Input
                size="small"
                className="text-[10px]"
                placeholder="Search Order ID / SKU"
                prefix={<SearchOutlined />}
              />

              <Button icon={<FilterOutlined />} className="text-[10px] h-[26px]">
                Filters
              </Button>
            </div>
          </div>

          {/* CHARTS */}

          <div className="grid grid-cols-4 gap-2 xl:grid-cols-2 sm:grid-cols-1 mb-3">
            {/* CATEGORY BREAKDOWN */}

            <Card bordered={false} className="rounded-10 shadow-regular" bodyStyle={{ padding: 12 }}>
              <h3 className="text-[12px] font-semibold text-[#111827] mb-3">Leak Category Breakdown</h3>

              <div className="flex">
                {/* Pie Chart */}
                <div className="relative w-[110px] h-[110px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={leakCategoryData} dataKey="value" innerRadius={32} outerRadius={48} stroke="none">
                        {leakCategoryData.map((item, index) => (
                          <Cell key={index} fill={item.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[8px] text-gray-400">Total Loss</span>

                    <span className="text-[13px] font-bold text-[#111827]">₹49,150.33</span>
                  </div>
                </div>

                {/* Right Side Data */}
                <div className="ml-2 flex-1">
                  {leakCategoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between mb-3 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />

                        <span>{item.name}</span>
                      </div>

                      <span className="font-medium">₹ {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* TREND */}

            <Card bordered={false} className="rounded-10 shadow-regular h-full" bodyStyle={{ padding: 14 }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-semibold text-[#111827]">Leak Trend (₹)</h3>

                <div className="flex items-center gap-1 text-[9px] text-[#ff4d9d]">
                  <span className="w-2 h-2 rounded-full bg-[#ff4d9d]" />
                  <span>Total Leak Amount</span>
                </div>
              </div>

              <div className="h-[105px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={leakTrendData}>
                    <defs>
                      <linearGradient id="leakGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4d9d" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#ff4d9d" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <XAxis dataKey="name" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />

                    <YAxis tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />

                    <Tooltip />

                    <Area type="monotone" dataKey="amount" stroke="none" fill="url(#leakGradient)" />

                    <Line type="monotone" dataKey="amount" stroke="#ff4d9d" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* STATUS BREAKDOWN */}

            <Card bordered={false} className="rounded-10 shadow-regular h-full" bodyStyle={{ padding: 14 }}>
              <h3 className="text-[11px] font-semibold text-[#111827] mb-3">Leak Status Breakdown</h3>

              <div className="flex items-center gap-3">
                <div className="relative w-[110px] h-[110px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={leakStatusData} dataKey="value" innerRadius={38} outerRadius={52} stroke="none">
                        {leakStatusData.map((item, index) => (
                          <Cell key={index} fill={item.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[8px] text-[#6b7280]">Total Loss</span>
                    <span className="text-[15px] font-bold text-[#111827]">₹49,150.33</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  {leakStatusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-[9px]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />

                        <span>{item.name}</span>
                      </div>

                      <span className="font-medium">₹ {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* TYPE BREAKDOWN */}

            <Card bordered={false} className="rounded-10 shadow-regular h-full" bodyStyle={{ padding: 14 }}>
              <h3 className="text-[11px] font-semibold text-[#111827] mb-3">Leak Type Breakdown</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#374151]">Shipping Leaks</span>
                  <span className="font-medium">₹ 12,450.80 (25.3%)</span>
                </div>

                <div className="flex justify-between text-[10px]">
                  <span className="text-[#374151]">Other Leaks</span>
                  <span className="font-medium">₹ 18,320.45 (37.3%)</span>
                </div>

                <div className="flex justify-between text-[10px]">
                  <span className="text-[#374151]">Fee / Commission Leaks</span>
                  <span className="font-medium">₹ 10,125.06 (20.6%)</span>
                </div>

                <div className="flex justify-between text-[10px]">
                  <span className="text-[#374151]">Tax / VAT Leaks</span>
                  <span className="font-medium">₹ 8,254.00 (16.8%)</span>
                </div>

                <button type="button" className="text-[#2563eb] text-[10px] font-medium mt-2">
                  View All →
                </button>
              </div>
            </Card>
          </div>

          {/* TOP TABLE */}

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={18}>
              <Card
                bordered={false}
                className="rounded-10 shadow-regular"
                bodyStyle={{ padding: 12 }}
                title={<span className="text-[12px] font-semibold">Variance Table</span>}
              >
                <Table
                  columns={varianceSummaryColumns.map((item) => ({
                    ...item,
                    title: <span className="text-[10px] text-light font-semibold">{item.title}</span>,
                  }))}
                  dataSource={[]}
                  pagination={false}
                  size="small"
                  scroll={{ x: 900 }}
                  locale={{
                    emptyText: <Empty description="No data" />,
                  }}
                />
              </Card>
            </Col>

            <Col xs={24} sm={24} md={24} lg={6}>
              <Card
                bordered={false}
                className="rounded-10 shadow-regular h-full"
                bodyStyle={{ padding: 14 }}
                title={<span className="text-[12px] font-semibold">Variance</span>}
              >
                <div className="h-full flex items-center justify-center">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* DETAIL TABLE */}

          <Row gutter={[12, 12]} className="mt-3">
            <Col span={24}>
              <Card
                bordered={false}
                className="rounded-10 shadow-regular"
                bodyStyle={{ padding: 12 }}
                title={<span className="text-[12px] font-semibold">Variance Details</span>}
              >
                <Table
                  columns={varianceDetailColumns.map((item) => ({
                    ...item,
                    title: <span className="text-[10px] text-light font-semibold">{item.title}</span>,
                  }))}
                  dataSource={[]}
                  size="small"
                  scroll={{ x: 1500 }}
                  locale={{
                    emptyText: <Empty description="No data" />,
                  }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </main>
    </>
  );
}
