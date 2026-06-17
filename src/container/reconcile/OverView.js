import React from 'react';
import {
  InfoCircleOutlined,
  DownloadOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  DollarOutlined,
  EyeOutlined,
  RiseOutlined,
} from '@ant-design/icons';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';

function OverView() {
  const topCards = [
    {
      title: 'Total Expected (Orders)',
      value: '₹ 2,85,420.75',
      sub: 'From 2,109 Orders',
      icon: <DollarOutlined />,
      iconBg: 'bg-[#eff6ff]',
      iconColor: 'text-[#2563eb]',
      valueColor: 'text-[#2563eb]',
    },

    {
      title: 'Total Received',
      value: '₹ 2,20,790.85',
      sub: '77.34% of Expected',
      icon: <CheckCircleOutlined />,
      iconBg: 'bg-[#ecfdf3]',
      iconColor: 'text-[#16a34a]',
      valueColor: 'text-[#16a34a]',
    },

    {
      title: 'Pending Settlement',
      value: '₹ 65,130.50',
      sub: 'From 248 Orders',
      icon: <ClockCircleOutlined />,
      iconBg: 'bg-[#f5f3ff]',
      iconColor: 'text-[#9333ea]',
      valueColor: 'text-[#9333ea]',
    },

    {
      title: 'Total Leaks',
      value: '-₹ 49,150.33',
      sub: '17.23% of Expected',
      icon: <WarningOutlined />,
      iconBg: 'bg-[#fef2f2]',
      iconColor: 'text-[#ef4444]',
      valueColor: 'text-[#ef4444]',
    },

    {
      title: 'Net Recoverable',
      value: '₹ 49,150.33',
      sub: 'From 390 Leaks',
      icon: <RiseOutlined />,
      iconBg: 'bg-[#ecfeff]',
      iconColor: 'text-[#0891b2]',
      valueColor: 'text-[#0891b2]',
    },
  ];

  const tableData = [
    {
      marketplace: 'Amazon',
      expected: '₹ 1,59,050.10',
      received: '₹ 1,22,450.20',
      pending: '₹ 28,560.20',
      leaks: '-₹ 28,560.20',
      recoverable: '₹ 28,560.20',
      leaksCount: '1,245',
      percent: '17.7%',
    },

    {
      marketplace: 'Flipkart',
      expected: '₹ 81,230.30',
      received: '₹ 59,660.00',
      pending: '₹ 12,340.30',
      leaks: '-₹ 12,340.30',
      recoverable: '₹ 12,340.30',
      leaksCount: '624',
      percent: '15.1%',
    },

    {
      marketplace: 'Meesho',
      expected: '₹ 32,140.20',
      received: '₹ 22,290.65',
      pending: '₹ 8,120.00',
      leaks: '-₹ 8,120.00',
      recoverable: '₹ 8,120.00',
      leaksCount: '198',
      percent: '25.0%',
    },

    {
      marketplace: 'Others',
      expected: '₹ 11,990.15',
      received: '₹ 9,390.00',
      pending: '₹ 160.00',
      leaks: '-₹ 160.33',
      recoverable: '₹ 160.33',
      leaksCount: '122',
      percent: '1.34%',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fc] py-4 px-3 md:px-2">
      {' '}
      {/* HEADER */}
      <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
        {' '}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] font-semibold text-[#111827] leading-none mb-0">
              Payment Reconciliation Dashboard
            </h1>

            <InfoCircleOutlined className="text-[12px] text-[#9ca3af]" />
          </div>

          <p className="text-[12px] mt-1 text-[#6b7280]">
            Track, analyze and recover every rupee owed to your business across marketplaces.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:w-full">
          {' '}
          <select className="h-[32px] rounded-lg border border-[#e5e7eb] bg-white px-2 text-[11px] outline-none">
            <option>Reconciliation Cycle: Daily</option>
          </select>
          <button
            type="button"
            className="flex h-[32px] items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-3 text-[11px] font-medium text-[#374151]"
          >
            <FilterOutlined className="text-[10px]" />
            Filters
          </button>
          <button
            type="button"
            className="flex h-[32px] items-center gap-1.5 rounded-lg bg-[#16a34a] px-3 text-[11px] font-semibold text-white"
          >
            <DownloadOutlined className="text-[10px]" />
            Download All Leaks
          </button>
        </div>
      </div>
      {/* TOP CARDS */}
      <div className="grid grid-cols-5 2xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-2 mb-2">
        {' '}
        {topCards.map((item, index) => (
          <div key={index} className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}>
                {item.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-[#6b7280]">{item.title}</p>

                <h2
                  className={`mt-[2px] whitespace-nowrap font-bold leading-none ${item.valueColor}`}
                  style={{
                    fontSize: 'clamp(16px, 1.3vw, 20px)',
                  }}
                >
                  {item.value}
                </h2>
                <p className="mt-[4px] text-[10px] text-[#9ca3af]">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* CHARTS */}
      <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr] xl:grid-cols-1 gap-2 mb-2">
        {' '}
        {/* PAYMENT FLOW */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#111827]">Payment Flow Overview</h2>

            <select className="h-[30px] rounded-l border border-[#e5e7eb] px-2 text-[10px] outline-none">
              <option>View By Amount</option>
            </select>
          </div>

          {/* Graph */}
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Total Expected',
                    value: 2.05,
                    fill: '#2563eb',
                  },
                  {
                    name: 'Received',
                    value: 2.21,
                    fill: '#22c55e',
                  },
                  {
                    name: 'Pending Settlement',
                    value: 0.65,
                    fill: '#c084fc',
                  },
                  {
                    name: 'Total Leaks',
                    value: 0.49,
                    fill: '#ef4444',
                  },
                  {
                    name: 'Net Receivable',
                    value: 0.4,
                    fill: '#4ade80',
                  },
                ]}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                {/* Grid */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f2" />

                {/* X Axis */}
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 9,
                    fill: '#6b7280',
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                {/* Y Axis */}
                <YAxis
                  tick={{
                    fontSize: 9,
                    fill: '#9ca3af',
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}L`}
                />

                {/* Tooltip */}
                <Tooltip
                  formatter={(value) => [`₹ ${value}L`, 'Amount']}
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    fontSize: '11px',
                  }}
                />

                {/* Bars */}
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={34}>
                  {['#2563eb', '#22c55e', '#c084fc', '#ef4444', '#4ade80'].map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}

                  {/* Top Labels */}
                  <LabelList
                    dataKey="value"
                    position="top"
                    formatter={(value) => (value > 0 ? `₹ ${value}L` : `-₹ ${Math.abs(value)}L`)}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      fill: '#374151',
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* LEAK CATEGORY */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#111827]">Leak Category Breakdown</h2>

            <button type="button" className="text-[10px] font-medium text-[#2563eb]">
              View All Leaks
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <div className="relative flex h-[140px] w-[140px] sm:h-[120px] sm:w-[120px] items-center justify-center rounded-full border-[18px] border-[#2563eb]">
              <div className="text-center">
                <h3 className="text-[16px] font-bold text-[#111827]">₹ 49,150.33</h3>

                <p className="text-[10px] text-[#6b7280]">Total Leaks</p>
              </div>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            {[
              ['Shipping Leaks', '₹ 12,450.00'],
              ['Order Leaks', '₹ 18,320.45'],
              ['Fee / Commission Leaks', '₹ 10,125.00'],
              ['Tax / VAT Leaks', '₹ 8,254.00'],
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-[11px] text-[#374151]">{item[0]}</span>

                <span className="text-[11px] font-semibold text-[#111827]">{item[1]}</span>
              </div>
            ))}
          </div>
        </div>
        {/* MARKETPLACE LEAKS */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#111827]">Marketplace Wise Leaks</h2>

            <select className="h-[30px] rounded-l border border-[#e5e7eb] px-0 text-[10px] outline-none">
              <option>View By Amount</option>
            </select>
          </div>

          <div className="space-y-4">
            {[
              ['Amazon', '-₹ 28,560.20'],
              ['Flipkart', '-₹ 12,340.30'],
              ['Meesho', '-₹ 8,120.00'],
              ['Others', '-₹ 160.33'],
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b border-[#f3f4f6] pb-3">
                <span className="text-[11px] font-medium text-[#374151]">{item[0]}</span>

                <span className="text-[11px] font-semibold text-[#ef4444]">{item[1]}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-[#edf0f2] pt-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#111827]">Total</span>

            <span className="text-[11px] font-bold text-[#ef4444]">-₹ 49,150.33</span>
          </div>
        </div>
      </div>
      {/* MAIN */}
      <div className="grid grid-cols-[1fr_280px] xl:grid-cols-1 gap-3">
        {/* LEFT TABLE */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
          {/* TOP */}
          <div className="border-b border-[#edf0f2]">
            <div className="flex min-w-[1250px] items-center justify-between px-4 py-3">
              {/* Tabs */}
              <div className="flex items-center gap-5">
                {['Marketplace Summary', 'SKU Summary', 'Order Summary', 'Leak Summary', 'Payment Transactions'].map(
                  (item, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`whitespace-nowrap pb-2 text-[11px] font-semibold ${
                        index === 0 ? 'border-b-2 border-[#16a34a] text-[#16a34a]' : 'text-[#6b7280]'
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}
              </div>

              {/* Filters */}
              {/* <div className="flex items-center gap-2">
                <select className="h-[32px] rounded-lg border border-[#e5e7eb] px-2 text-[10px] outline-none">
                  <option>Group by Marketplace</option>
                </select>

                <div className="relative">
                  <input
                    placeholder="Search marketplace"
                    className="h-[32px] rounded-lg border border-[#e5e7eb] pl-3 pr-8 text-[10px] outline-none"
                  />

                  <SearchOutlined className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#9ca3af]" />
                </div>
              </div> */}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-[#edf0f2] bg-[#fafafa]">
                  {[
                    'Marketplace',
                    'Total Expected',
                    'Total Received',
                    'Pending Settlement',
                    'Total Leaks',
                    'Net Recoverable',
                    'Orders',
                    'Leak %',
                    'Action',
                  ].map((head, index) => (
                    <th
                      key={index}
                      className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-semibold text-[#6b7280]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="border-b border-[#f3f4f6] hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[11px] font-medium text-[#111827]">{row.marketplace}</td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-[#111827]">{row.expected}</td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-[#16a34a]">
                      {row.received}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-[#9333ea]">{row.pending}</td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-[#ef4444]">
                      {row.leaks}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-[#16a34a]">
                      {row.recoverable}
                    </td>

                    <td className="px-4 py-3 text-[11px] text-[#111827]">{row.leaksCount}</td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#fef2f2] px-2 py-[4px] text-[10px] font-semibold text-[#ef4444]">
                        {row.percent}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280]"
                        >
                          <EyeOutlined className="text-[11px]" />
                        </button>

                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280]"
                        >
                          <DownloadOutlined className="text-[11px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* RIGHT SIDEBAR */}
        <div className="space-y-2">
          {/* TRACKER */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#111827]">Reimbursement Tracker</h2>

              <button type="button" className="text-[10px] font-medium text-[#2563eb]">
                View All
              </button>
            </div>

            <div className="space-y-1">
              {[
                ['Claims Raised', '₹ 18,650.00'],
                ['Approved', '₹ 7,850.00'],
                ['Received', '₹ 2,540.00'],
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-[#f3f4f6] px-3 py-2"
                >
                  <span className="text-[11px] text-[#374151]">{item[0]}</span>

                  <span className="text-[11px] font-semibold text-[#111827]">{item[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-[#111827]">Recent Activity</h2>

              <button type="button" className="text-[10px] font-medium text-[#2563eb]">
                View All
              </button>
            </div>

            <div className="space-y-1">
              {[
                'Leak detected in Amazon order',
                'Reimbursement approved by Flipkart',
                'Payment of ₹ 1,22,450 received',
                'New claim raised for Meesho',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-[4px] h-2 w-2 flex-shrink-0 rounded-full bg-[#16a34a]" />

                  <div>
                    <p className="mb-[2px] text-[11px] leading-[14px] text-[#374151]">{item}</p>

                    <p className="text-[10px] leading-none text-[#9ca3af]">Few hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverView;
