import React, { useState, useEffect } from 'react';

import { Row, Col, Table, Spin, Select, Button } from 'antd';

import { FilterOutlined, DownloadOutlined, BarChartOutlined, DollarOutlined } from '@ant-design/icons';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Area } from 'recharts';

export default function FeeLeaks() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

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

  const varianceSummaryColumns = [
    {
      title: 'Leak ID',
      dataIndex: 'leakId',
      key: 'leakId',
      width: 130,
    },
    {
      title: 'Marketplace',
      dataIndex: 'marketplace',
      key: 'marketplace',
      width: 100,
    },
    {
      title: 'Leak Type',
      dataIndex: 'leakType',
      key: 'leakType',
      width: 120,
    },
    {
      title: 'Category / Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 180,
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 140,
    },
    {
      title: 'SKU / ASIN',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'Leak Date',
      dataIndex: 'leakDate',
      key: 'leakDate',
      width: 120,
    },
    {
      title: 'Expected Amount (₹)',
      dataIndex: 'expectedAmount',
      key: 'expectedAmount',
      width: 140,
      align: 'right',
    },
    {
      title: 'Impact Amount (₹)',
      dataIndex: 'impactAmount',
      key: 'impactAmount',
      width: 140,
      align: 'right',
      render: (text) => <span className="text-red-500 font-medium">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const styles = {
          Open: 'bg-red-100 text-red-600',
          'In Review': 'bg-orange-100 text-orange-600',
          Recovered: 'bg-green-100 text-green-600',
        };

        return <span className={`px-2 py-1 rounded text-[10px] ${styles[status]}`}>{status}</span>;
      },
    },
    {
      title: 'Detect Source',
      dataIndex: 'source',
      key: 'source',
      width: 100,
    },
  ];

  const varianceSummaryData = [
    {
      key: 1,
      leakId: 'LEAK-250531-0001',
      marketplace: 'Amazon',
      leakType: 'Shipping Leak',
      reason: 'Wrong Shipping Charge',
      orderId: '405-1234567-8901234',
      sku: 'B07N2PRFQH',
      leakDate: '31 May 2026',
      expectedAmount: '₹ 1,250.00',
      impactAmount: '- ₹ 1,250.00',
      status: 'Open',
      source: 'System',
    },
    {
      key: 2,
      leakId: 'LEAK-250530-0007',
      marketplace: 'Flipkart',
      leakType: 'Refund Leak',
      reason: 'Customer Return Not Refunded',
      orderId: '00328716509123456',
      sku: 'FKP-3B2-TY6L',
      leakDate: '30 May 2026',
      expectedAmount: '₹ 2,450.00',
      impactAmount: '- ₹ 2,450.00',
      status: 'In Review',
      source: 'System',
    },
    {
      key: 3,
      leakId: 'LEAK-250529-0013',
      marketplace: 'Meesho',
      leakType: 'Commission Leak',
      reason: 'High Commission Charged',
      orderId: 'MSH-9827654-0001',
      sku: 'MEO-B12-KL3J',
      leakDate: '29 May 2026',
      expectedAmount: '₹ 620.00',
      impactAmount: '- ₹ 620.00',
      status: 'Open',
      source: 'System',
    },
    {
      key: 4,
      leakId: 'LEAK-250528-0004',
      marketplace: 'Amazon',
      leakType: 'Cancellation Leak',
      reason: 'Cancelled By Customer',
      orderId: '404-8876543-2109876',
      sku: 'B07N2PRFQH',
      leakDate: '28 May 2026',
      expectedAmount: '₹ 880.00',
      impactAmount: '- ₹ 880.00',
      status: 'Recovered',
      source: 'Manual',
    },
    {
      key: 5,
      leakId: 'LEAK-250528-0004',
      marketplace: 'Amazon',
      leakType: 'Cancellation Leak',
      reason: 'Cancelled By Customer',
      orderId: '404-8876543-2109876',
      sku: 'B07N2PRFQH',
      leakDate: '28 May 2026',
      expectedAmount: '₹ 880.00',
      impactAmount: '- ₹ 880.00',
      status: 'Recovered',
      source: 'Manual',
    },
    {
      key: 6,
      leakId: 'LEAK-250528-0004',
      marketplace: 'Amazon',
      leakType: 'Cancellation Leak',
      reason: 'Cancelled By Customer',
      orderId: '404-8876543-2109876',
      sku: 'B07N2PRFQH',
      leakDate: '28 May 2026',
      expectedAmount: '₹ 880.00',
      impactAmount: '- ₹ 880.00',
      status: 'Recovered',
      source: 'Manual',
    },
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

          <div className="grid grid-cols-4 gap-2 xl:grid-cols-2 sm:grid-cols-1 mb-2">
            <div className="bg-[#fff5f5] border border-[#ffe5e5] rounded-10 p-4">
              <p className="text-[11px] text-[#ef4444] font-medium mb-2">Total Leak Amount</p>

              <h2 className="text-[17px] font-semibold text-[#ef4444] leading-none">₹ 49,150.33</h2>

              <p className="text-[10px] text-light mt-1">▲ 17.37% of Expected</p>
            </div>

            <div className="bg-[#faf5ff] border border-[#f1e4ff] rounded-10 p-4">
              <p className="text-[11px] text-[#9333ea] font-medium mb-2">Open Leaks</p>

              <h2 className="text-[17px] font-semibold text-[#9333ea] leading-none">₹ 38,420.75</h2>

              <p className="text-[10px] text-light mt-1">78.19% of Total Leaks</p>
            </div>

            <div className="bg-[#fffaf0] border border-[#ffeccc] rounded-10 p-4">
              <p className="text-[11px] text-[#f59e0b] font-medium mb-2">In Review</p>

              <h2 className="text-[17px] font-semibold text-[#f59e0b] leading-none">₹ 7,290.20</h2>

              <p className="text-[10px] text-light mt-1">14.84% of Total Leaks</p>
            </div>

            <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-10 p-4">
              <p className="text-[11px] text-[#16a34a] font-medium mb-2">Recovered</p>

              <h2 className="text-[17px] font-semibold text-[#16a34a] leading-none">₹ 3,439.38</h2>

              <p className="text-[10px] text-light mt-1">6.97% of Total Leaks</p>
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

              {/* <Input
                size="small"
                className="text-[10px]"
                placeholder="Search Order ID / SKU"
                prefix={<SearchOutlined />}
              /> */}
            </div>
          </div>

          {/* CHARTS */}

          <div className="grid grid-cols-4 gap-2 xl:grid-cols-2 sm:grid-cols-1 mb-3">
            {/* CATEGORY BREAKDOWN */}

            <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Leak Category Breakdown</h3>

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
                    <span className="text-[10px] text-gray-400">Total Loss</span>

                    <span className="text-[11px] font-bold text-[#111827]">₹49,150.33</span>
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

                      <span className="font-medium">₹{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* TREND */}

            <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
              {' '}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-semibold text-[#111827]">Leak Trend (₹)</h3>

                <div className="flex items-center gap-1 text-[10px] text-[#ff4d9d]">
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
            </div>

            {/* STATUS BREAKDOWN */}

            <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
              {' '}
              <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Leak Status Breakdown</h3>
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
                    <span className="text-[10px] text-[#6b7280]">Total Loss</span>
                    <span className="text-[11px] font-bold text-[#111827]">₹49,150.33</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
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
            </div>

            {/* TYPE BREAKDOWN */}

            <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
              {' '}
              <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Leak Type Breakdown</h3>
              <div className="space-y-2">
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
            </div>
          </div>

          {/* TOP TABLE */}

          <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={18}>
              <div className="rounded-10 shadow-regular">
                <Table
                  columns={varianceSummaryColumns.map((item) => ({
                    ...item,
                    title: <span className="text-[10px] text-light font-semibold">{item.title}</span>,
                  }))}
                  dataSource={varianceSummaryData}
                  pagination={false}
                  size="small"
                  scroll={{ x: 1500 }}
                  className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
                />
              </div>
            </Col>

            <Col xs={24} sm={24} md={24} lg={6}>
              <div className="flex flex-col gap-2">
                <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-[#111827] mb-2">Top Marketplaces by Leaks</h3>

                  {[
                    {
                      name: 'Amazon',
                      amount: '₹ 28,560.20',
                      percentage: '58.12%',
                      logo: '🛒',
                    },
                    {
                      name: 'Flipkart',
                      amount: '₹ 12,340.30',
                      percentage: '25.12%',
                      logo: '🟨',
                    },
                    {
                      name: 'Meesho',
                      amount: '₹ 8,120.00',
                      percentage: '16.53%',
                      logo: '🟪',
                    },
                    {
                      name: 'Myntra',
                      amount: '₹ 1,280.00',
                      percentage: '2.23%',
                      logo: '🟥',
                    },
                    {
                      name: 'Others',
                      amount: '₹ 849.83',
                      percentage: '1.73%',
                      logo: '📦',
                    },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[16px]">{item.logo}</span>

                        <span className="text-[12px] text-[#374151]">{item.name}</span>
                      </div>

                      <span className="text-[12px] font-semibold text-[#374151]">
                        {item.amount} <span className="text-[#6B7280]">({item.percentage})</span>
                      </span>
                    </div>
                  ))}

                  <button type="button" className="text-[#2563EB] text-[12px] font-medium">
                    View All →
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-[#111827] mb-4">Quick Actions</h3>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3 cursor-pointer">
                      <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                        <DownloadOutlined className="text-[14px] text-gray-600" />
                      </div>

                      <div>
                        <p className="text-[12px] font-medium text-[#111827] mb-0">Download Leak Report</p>
                        <p className="text-[11px] text-gray-500">Export complete leak details</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 cursor-pointer">
                      <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                        {' '}
                        <BarChartOutlined className="text-[14px] text-gray-600" />
                      </div>

                      <div>
                        <p className="text-[12px] font-medium text-[#111827] mb-0">View Leak Summary</p>
                        <p className="text-[11px] text-gray-500">Analyze leak summary</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 cursor-pointer">
                      <div className="w-8 h-8 rounded-md bg-green-50 flex items-center justify-center">
                        <DollarOutlined className="text-[14px] text-green-600" />
                      </div>

                      <div>
                        <p className="text-[12px] font-medium text-[#111827] mb-0">Reimbursement Tracker</p>
                        <p className="text-[11px] text-gray-500">Track claims & reimbursements</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Spin>
      </main>
    </>
  );
}
