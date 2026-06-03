import React from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  HourglassOutlined,
  SearchOutlined,
  // FilterOutlined,
  EyeOutlined,
  WarningOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

function PaymentReconcile() {
  return (
    <div className="min-h-screen bg-[#f6f8fc] p-3">
      {/* HEADER */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-semibold text-[#111827] leading-none mb-1">Payments</h1>

          <p className="mt-1 text-[11px] text-[#6b7280]">
            View all payments transferred by marketplaces. Track expected vs received and identify gaps.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#6b7280]">
          <span>Payment Reconciliation</span>

          <span>{'>'}</span>

          <span className="font-semibold text-[#2563eb]">Payments</span>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {[
          {
            title: 'Total Expected',
            value: '₹ 2,85,420.75',
            sub: 'From 2,189 Orders',
            color: 'text-[#2563eb]',
            bg: 'bg-[#eff6ff]',
            icon: <FileTextOutlined />,
          },

          {
            title: 'Total Received',
            value: '₹ 2,20,790.85',
            sub: '77.34% of Expected',
            color: 'text-[#16a34a]',
            bg: 'bg-[#ecfdf3]',
            icon: <CheckCircleOutlined />,
          },

          {
            title: 'Pending In Transit',
            value: '₹ 29,480.00',
            sub: '10 Payments',
            color: 'text-[#7c3aed]',
            bg: 'bg-[#f5f3ff]',
            icon: <ClockCircleOutlined />,
          },

          {
            title: 'Shortfall / Unreconciled',
            value: '₹ 35,149.90',
            sub: '12.32% of Expected',
            color: 'text-[#ef4444]',
            bg: 'bg-[#fef2f2]',
            icon: <CloseCircleOutlined />,
          },

          {
            title: 'Avg. Settlement Time',
            value: '3.6 Days',
            sub: 'vs Last Month 3.2 Days',
            color: 'text-[#ca8a04]',
            bg: 'bg-[#fefce8]',
            icon: <HourglassOutlined />,
          },
        ].map((item, index) => (
          <div key={index} className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              {/* Icon */}
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[13px] ${item.bg} ${item.color}`}
              >
                {item.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 mt-1">
                {/* Heading */}
                <p className="truncate text-[11px] font-medium leading-[11px] text-[#6b7280]">{item.title}</p>

                {/* Value */}
                <h2 className={`mt-[1px] truncate text-[16px] font-bold leading-none ${item.color}`}>{item.value}</h2>

                {/* Bottom Text */}
                <p className="mt-[2px] truncate text-[10px] leading-none text-[#9ca3af]">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-[1fr_280px] gap-3">
        {/* LEFT */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
          {/* TABS */}
          <div className="flex items-center gap-6 border-b border-[#edf0f2] px-3 py-2">
            {['All Payments', 'Unreconciled Payments'].map((item, index) => (
              <button
                key={index}
                type="button"
                className={`pb-0 text-[12px] font-semibold ${
                  index === 0 ? 'border-b-2 border-[#16a34a] text-[#16a34a]' : 'text-[#6b7280]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-3 border-b border-[#edf0f2] px-4 py-3">
            <select className="py-1 rounded-l border border-[#e5e7eb] px-2 text-[10px] outline-none">
              <option>All Marketplaces</option>
            </select>

            <select className="py-1 rounded-l border border-[#e5e7eb] px-2 text-[10px] outline-none">
              <option>All Types</option>
            </select>

            <select className="py-1 rounded-l border border-[#e5e7eb] px-2 text-[10px] outline-none">
              <option>All Status</option>
            </select>

            <input
              type="text"
              value="01/05/2026 - 31/05/2026"
              readOnly
              className="h-[30px] w-[170px] rounded-l border border-[#e5e7eb] px-2 text-[10px] outline-none"
            />

            <div className="relative ml-auto">
              <input
                placeholder="Search Payment ID / Reference ID"
                className="h-[34px] w-[200px] rounded-l border border-[#e5e7eb] pl-3 pr-9 text-[11px] outline-none"
              />

              <SearchOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9ca3af]" />
            </div>

            {/* <button
              type="button"
              className="flex py-1 items-center gap-2 rounded-l border border-[#e5e7eb] px-3 text-[10px] font-medium text-[#374151]"
            >
              <FilterOutlined className="text-[10px]" />
              Filters
            </button> */}
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1300px]">
              <thead>
                <tr className="border-b border-[#edf0f2] bg-[#fafafa]">
                  {[
                    'Payment ID',
                    'Marketplace',
                    'Payment Type',
                    'Transaction Date',
                    'Expected Amount',
                    'Received Amount',
                    'Fees & Deductions',
                    'Net Received',
                    'Status',
                    'Reference ID',
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
                {[
                  {
                    id: 'PAY-250531-0001',
                    market: 'Amazon',
                    type: 'Payout',
                    date: '31 May 2026',
                    expected: '₹ 1,22,450.20',
                    received: '₹ 94,320.20',
                    fees: '-₹ 28,130.00',
                    net: '₹ 94,320.20',
                    status: 'Settled',
                    ref: 'AMZP-X51-9D8K',
                  },

                  {
                    id: 'PAY-250530-0007',
                    market: 'Flipkart',
                    type: 'Payout',
                    date: '30 May 2026',
                    expected: '₹ 59,660.00',
                    received: '₹ 48,920.00',
                    fees: '-₹ 10,740.00',
                    net: '₹ 48,920.00',
                    status: 'Settled',
                    ref: 'FKP-3B2-7Y6L',
                  },

                  {
                    id: 'PAY-250529-0013',
                    market: 'Meesho',
                    type: 'Payout',
                    date: '29 May 2026',
                    expected: '₹ 22,290.65',
                    received: '₹ 17,450.65',
                    fees: '-₹ 4,840.00',
                    net: '₹ 17,450.65',
                    status: 'Settled',
                    ref: 'MEO-8J2-K3L9',
                  },

                  {
                    id: 'PAY-250528-0004',
                    market: 'Amazon',
                    type: 'Fee Refund',
                    date: '28 May 2026',
                    expected: '₹ 2,450.00',
                    received: '₹ 2,450.00',
                    fees: '₹ 0.00',
                    net: '₹ 2,450.00',
                    status: 'Settled',
                    ref: 'AMZF-RD9-K2L',
                  },

                  {
                    id: 'PAY-250527-0011',
                    market: 'Flipkart',
                    type: 'Payout',
                    date: '27 May 2026',
                    expected: '₹ 31,210.30',
                    received: '₹ 25,870.30',
                    fees: '-₹ 5,340.00',
                    net: '₹ 25,870.30',
                    status: 'Settled',
                    ref: 'FKP-7H1-J9M3',
                  },

                  {
                    id: 'PAY-250526-0006',
                    market: 'Meesho',
                    type: 'Payout',
                    date: '26 May 2026',
                    expected: '₹ 8,120.00',
                    received: '₹ 0.00',
                    fees: '₹ 0.00',
                    net: '₹ 0.00',
                    status: 'In Transit',
                    ref: 'MEO-P2L-7H3K',
                  },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-[#f3f4f6] hover:bg-[#fafafa]">
                    <td className="whitespace-nowrap px-4 py-2 text-[11px] font-semibold text-[#2563eb]">{row.id}</td>

                    <td className="px-4 py-2 text-[11px] font-medium text-[#111827]">{row.market}</td>

                    <td className="px-4 py-2 text-[11px] text-[#374151]">{row.type}</td>

                    <td className="whitespace-nowrap px-4 py-2 text-[11px] text-[#374151]">{row.date}</td>

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

                    <td className="whitespace-nowrap px-4 py-2 text-[11px] text-[#6b7280]">{row.ref}</td>

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
          {/* SUMMARY */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[15px] font-semibold text-[#111827]">Payment Summary</h2>

            <div className="mt-3 space-y-3">
              {[
                ['Total Expected', '₹ 2,85,420.75'],
                ['Total Received', '₹ 2,20,790.85'],
                ['Pending In Transit', '₹ 29,480.00'],
                ['Shortfall / Unreconciled', '₹ 35,149.90'],
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#6b7280]">{item[0]}</span>

                  <span className="text-[11px] font-semibold text-[#111827]">{item[1]}</span>
                </div>
              ))}
            </div>

            <button type="button" className="mt-4 text-[11px] font-medium text-[#16a34a]">
              View Summary →
            </button>
          </div>

          {/* BREAKDOWN */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[15px] font-semibold text-[#111827]">Payment Type Breakdown</h2>

            <div className="mt-3 space-y-3">
              {[
                ['Payout', '₹ 2,42,150.45 (84.84%)'],
                ['Fee Refund', '₹ 12,450.00 (4.36%)'],
                ['Adjustments', '₹ 8,120.30 (2.85%)'],
                ['Incentives', '₹ 4,700.00 (1.65%)'],
                ['Others', '₹ 17,999.00 (6.30%)'],
              ].map((item, index) => (
                <div key={index} className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="mt-[5px] h-2 w-2 rounded-full bg-[#2563eb]" />

                    <span className="text-[12px] text-[#374151]">{item[0]}</span>
                  </div>

                  <span className="text-[10px] font-medium text-[#111827]">{item[1]}</span>
                </div>
              ))}
            </div>

            <button type="button" className="mt-4 text-[11px] font-medium text-[#16a34a]">
              View All →
            </button>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[15px] font-semibold text-[#111827]">Quick Actions</h2>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
              >
                <DownloadOutlined className="text-[15px] text-[#2563eb]" />

                <div>
                  <p className="text-[12px] font-semibold text-[#111827] mb-0">Download All Payments</p>

                  <p className="text-[11px] text-[#9ca3af]">Export complete payment data</p>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
              >
                <WarningOutlined className="text-[15px] text-[#ef4444]" />

                <div>
                  <p className="text-[12px] font-semibold text-[#111827] mb-0">View All Leaks</p>

                  <p className="text-[11px] text-[#9ca3af]">Analyze and claim reimbursements</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentReconcile;
