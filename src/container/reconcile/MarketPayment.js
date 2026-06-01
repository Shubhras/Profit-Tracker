import React from 'react';
import {
  InfoCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  // CloseCircleOutlined,
  DollarOutlined,
  DownloadOutlined,
  EyeOutlined,
  WarningOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { ResponsiveContainer, LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

function MarketPayment() {
  const topCards = [
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
      title: 'Net Payout',
      value: '₹ 2,42,150.45',
      sub: 'vs Last Month + 8.41%',
      icon: <DollarOutlined />,
      iconBg: 'bg-[#f5f3ff]',
      iconColor: 'text-[#7c3aed]',
      valueColor: 'text-[#7c3aed]',
    },

    {
      title: 'Refunds Received',
      value: '₹ 12,450.00',
      sub: 'vs Last Month - 2.9%',
      icon: <ClockCircleOutlined />,
      iconBg: 'bg-[#fff7ed]',
      iconColor: 'text-[#f97316]',
      valueColor: 'text-[#f97316]',
    },

    {
      title: 'Fees & Deductions',
      value: '₹ 23,809.60',
      sub: 'vs Last Month + 6.52%',
      icon: <RiseOutlined />,
      iconBg: 'bg-[#eff6ff]',
      iconColor: 'text-[#2563eb]',
      valueColor: 'text-[#2563eb]',
    },
  ];

  const paymentData = [
    {
      id: 'PMT-250531-0001',
      marketplace: 'Amazon',
      type: 'Payout',
      date: '31 May 2026',
      ref: 'AMZP-X51-9D8K',
      expected: '₹ 1,21,450.20',
      received: '₹ 94,320.20',
      fees: '-₹ 28,130.00',
      net: '₹ 94,320.20',
      status: 'Settled',
    },

    {
      id: 'PMT-250530-0007',
      marketplace: 'Flipkart',
      type: 'Payout',
      date: '30 May 2026',
      ref: 'FKP-3B2-7Y6L',
      expected: '₹ 59,660.00',
      received: '₹ 48,920.00',
      fees: '-₹ 10,740.00',
      net: '₹ 48,920.00',
      status: 'Settled',
    },

    {
      id: 'PMT-250529-0013',
      marketplace: 'Meesho',
      type: 'Payout',
      date: '29 May 2026',
      ref: 'MEO-8J2-K3L9',
      expected: '₹ 22,290.65',
      received: '₹ 17,450.65',
      fees: '-₹ 4,840.00',
      net: '₹ 17,450.65',
      status: 'Settled',
    },

    {
      id: 'PMT-250528-0004',
      marketplace: 'Amazon',
      type: 'Refund',
      date: '28 May 2026',
      ref: 'AMZF-RD9-K2L',
      expected: '₹ 2,450.00',
      received: '₹ 2,450.00',
      fees: '₹ 0.00',
      net: '₹ 2,450.00',
      status: 'Settled',
    },

    {
      id: 'PMT-250527-0011',
      marketplace: 'Flipkart',
      type: 'Adjustment',
      date: '27 May 2026',
      ref: 'FKP-7H1-J9M3',
      expected: '₹ 8,120.30',
      received: '₹ 6,900.30',
      fees: '-₹ 1,220.00',
      net: '₹ 6,900.30',
      status: 'In Transit',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-3 px-2">
      {/* HEADER */}
      <div className="flex items-start justify-between px-3 py-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-semibold text-[#111827] leading-none mb-1">Marketplace Payments</h1>

            <InfoCircleOutlined className="text-[12px] text-[#9ca3af]" />
          </div>

          <p className="mt-1 text-[12px] text-[#6b7280]">
            Track all payments received from marketplaces including payouts, refunds, fees and adjustments.
          </p>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-4 gap-3 mb-2">
        {topCards.map((item, index) => (
          <div key={index} className="rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}>
                {item.icon}
              </div>

              <div>
                <p className="text-[12px] font-medium text-[#6b7280]">{item.title}</p>

                <h2 className={`mt-1 text-[18px] font-bold leading-none ${item.valueColor}`}>{item.value}</h2>

                <p className="text-[11px] text-[#9ca3af]">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-[1fr_280px] gap-3">
        {/* LEFT */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
          {/* FILTERS */}
          <div className="flex items-center gap-2 border-b border-[#edf0f2] px-2 py-3">
            <select className="py-2 rounded-l border border-[#e5e7eb] px-2 text-[11px] outline-none">
              <option>All Marketplaces</option>
            </select>

            <select className="py-2 rounded-l border border-[#e5e7eb] px-2 text-[11px] outline-none">
              <option>All Types</option>
            </select>

            <select className="py-2 rounded-l border border-[#e5e7eb] px-2 text-[11px] outline-none">
              <option>All Status</option>
            </select>

            <input
              type="text"
              value="01/05/2026 - 31/05/2026"
              readOnly
              className="py-2 w-[170px] rounded-l border border-[#e5e7eb] px-2 text-[11px] outline-none"
            />

            <div className="relative ml-auto">
              <input
                placeholder="Search Payment ID / Reference ID"
                className="py-2 w-[230px] rounded-l border border-[#e5e7eb] pl-3 pr-9 text-[11px] outline-none"
              />

              <SearchOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9ca3af]" />
            </div>

            <button
              type="button"
              className="flex py-2 items-center gap-2 rounded-l border border-[#e5e7eb] px-2 text-[11px] font-medium text-[#374151]"
            >
              <FilterOutlined className="text-[10px]" />
              Filters
            </button>

            {/* <button
              type="button"
              className="flex h-[34px] items-center gap-2 rounded-xl border border-[#e5e7eb] px-3 text-[11px] font-medium text-[#374151]"
            >
              <DownloadOutlined className="text-[10px]" />
              Download Payments
            </button> */}
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-2 gap-3 border-b border-[#edf0f2] p-3">
            <div className="rounded-2xl border border-[#edf0f2] p-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#111827]">Payments Trend</h2>

                {/* Legends */}
                <div className="flex items-center gap-4 text-[10px]">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#22c55e]" />
                    <span className="text-[#6b7280]">Payouts</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#2563eb]" />
                    <span className="text-[#6b7280]">Refunds</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    <span className="text-[#6b7280]">Fees & Deductions</span>
                  </div>
                </div>
              </div>

              {/* Graph */}
              <div className="mt-4 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: '01 May', payouts: 65000, refunds: 26000, fees: 12000 },
                      { day: '03 May', payouts: 59000, refunds: 22000, fees: 10000 },
                      { day: '06 May', payouts: 67000, refunds: 28000, fees: 14000 },
                      { day: '08 May', payouts: 62000, refunds: 21000, fees: 11000 },
                      { day: '11 May', payouts: 82000, refunds: 30000, fees: 13000 },
                      { day: '13 May', payouts: 89000, refunds: 29000, fees: 12000 },
                      { day: '16 May', payouts: 76000, refunds: 34000, fees: 15000 },
                      { day: '18 May', payouts: 81000, refunds: 29000, fees: 13000 },
                      { day: '21 May', payouts: 58000, refunds: 22000, fees: 10000 },
                      { day: '24 May', payouts: 79000, refunds: 30000, fees: 12000 },
                      { day: '26 May', payouts: 72000, refunds: 27000, fees: 11000 },
                      { day: '29 May', payouts: 98000, refunds: 42000, fees: 16000 },
                      { day: '31 May', payouts: 93000, refunds: 38000, fees: 14000 },
                    ]}
                    margin={{ top: 5, right: 5, left: -18, bottom: 0 }}
                  >
                    {/* Gradient */}
                    <defs>
                      <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    {/* Grid */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f2" />

                    {/* Axis */}
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />

                    <YAxis
                      tick={{ fontSize: 9, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value / 1000}K`}
                    />

                    {/* Tooltip */}
                    <Tooltip
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                        fontSize: '11px',
                      }}
                    />

                    {/* Green Area */}
                    <Area type="monotone" dataKey="payouts" stroke="none" fill="url(#greenFill)" />

                    {/* Lines */}
                    <Line type="monotone" dataKey="payouts" stroke="#22c55e" strokeWidth={2} dot={false} />

                    <Line type="monotone" dataKey="refunds" stroke="#2563eb" strokeWidth={2} dot={false} />

                    <Line type="monotone" dataKey="fees" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-[#edf0f2] p-3">
              <h2 className="text-[14px] font-semibold text-[#111827]">Payment Type Breakdown</h2>

              <div className="mt-5 flex items-center justify-center">
                <div className="relative flex h-[170px] w-[170px] items-center justify-center rounded-full border-[18px] border-[#16a34a]">
                  <div className="text-center">
                    <h3 className="text-[22px] font-bold text-[#111827]">₹ 2.20L</h3>

                    <p className="text-[10px] text-[#6b7280]">Total Received</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px]">
              <thead>
                <tr className="border-b border-[#edf0f2] bg-[#fafafa]">
                  {[
                    'Payment ID',
                    'Marketplace',
                    'Payment Type',
                    'Transaction Date',
                    'Reference ID',
                    'Expected Amount',
                    'Received Amount',
                    'Fees & Deductions',
                    'Net Received',
                    'Status',
                    'Actions',
                  ].map((head, index) => (
                    <th
                      key={index}
                      className="whitespace-nowrap px-4 py-2 text-left text-[11px] font-semibold text-[#6b7280]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paymentData.map((row, index) => (
                  <tr key={index} className="border-b border-[#f3f4f6] hover:bg-[#fafafa]">
                    <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-[#2563eb]">{row.id}</td>

                    <td className="px-4 py-2 text-[11px] font-medium text-[#111827]">{row.marketplace}</td>

                    <td className="px-4 py-2 text-[11px] text-[#374151]">{row.type}</td>

                    <td className="whitespace-nowrap px-4 py-2 text-[11px] text-[#374151]">{row.date}</td>

                    <td className="whitespace-nowrap px-4 py-2 text-[11px] text-[#6b7280]">{row.ref}</td>

                    <td className="whitespace-nowrap px-4 py-2 text-[11px] font-medium text-[#111827]">
                      {row.expected}
                    </td>

                    <td className="whitespace-nowrap px-4 py-2 text-[11px] font-medium text-[#111827]">
                      {row.received}
                    </td>

                    <td className="whitespace-nowrap px-4 py-2 text-[11px] font-semibold text-[#ef4444]">{row.fees}</td>

                    <td className="whitespace-nowrap px-4 py-2 text-[11px] font-semibold text-[#16a34a]">{row.net}</td>

                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-[4px] text-[10px] font-semibold ${
                          row.status === 'Settled' ? 'bg-[#ecfdf3] text-[#16a34a]' : 'bg-[#eff6ff] text-[#2563eb]'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="px-4 py-2">
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
          {/* MARKETPLACE SUMMARY */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[14px] font-semibold text-[#111827]">Marketplace Summary</h2>

            <div className="mt-4 space-y-3">
              {[
                ['Amazon', '₹ 1,23,456.00'],
                ['Flipkart', '₹ 59,440.00'],
                ['Meesho', '₹ 22,190.00'],
                ['Myntra', '₹ 11,500.00'],
                ['Others', '₹ 5,450.00'],
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#374151]">{item[0]}</span>

                  <span className="text-[12px] font-semibold text-[#111827]">{item[1]}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#edf0f2] pt-3 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#111827]">Total</span>

              <span className="text-[11px] font-bold text-[#16a34a]">₹ 2,20,790.85</span>
            </div>
          </div>

          {/* PAYMENT STATUS */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[14px] font-semibold text-[#111827]">Payment Status</h2>

            <div className="mt-4 space-y-3">
              {[
                ['Settled', '₹ 2,01,950.95'],
                ['In Transit', '₹ 12,920.00'],
                ['Pending', '₹ 4,700.00'],
                ['Failed', '-₹ 2,790.00'],
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#374151]">{item[0]}</span>

                  <span className="text-[12px] font-semibold text-[#111827]">{item[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[14px] font-semibold text-[#111827]">Quick Actions</h2>

            <div className="mt-4 space-y-4">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
              >
                <DownloadOutlined className="text-[13px] text-[#2563eb]" />

                <div>
                  <p className="text-[12px] font-semibold text-[#111827] mb-1">Download Payments</p>

                  <p className="text-[12px] text-[#9ca3af]">Export payment reports</p>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
              >
                <WarningOutlined className="text-[13px] text-[#ef4444]" />

                <div>
                  <p className="text-[12px] font-semibold text-[#111827] mb-1">View All Leaks</p>

                  <p className="text-[12px] text-[#9ca3af]">Analyze losses & deductions</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketPayment;
