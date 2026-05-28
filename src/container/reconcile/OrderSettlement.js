import React from 'react';
import {
  InfoCircleOutlined,
  SearchOutlined,
  // FilterOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  EyeOutlined,
  DownloadOutlined,
  WarningOutlined,
} from '@ant-design/icons';

function OrderSettlement() {
  const topCards = [
    {
      title: 'Total Orders',
      value: '2,189',
      sub: 'vs Last Month + 8.45%',
      icon: <ShoppingCartOutlined />,
      iconBg: 'bg-[#eff6ff]',
      iconColor: 'text-[#2563eb]',
      valueColor: 'text-[#2563eb]',
    },

    {
      title: 'Total GMV',
      value: '₹ 3,85,420.75',
      sub: 'vs Last Month + 11.2%',
      icon: <DollarOutlined />,
      iconBg: 'bg-[#ecfdf3]',
      iconColor: 'text-[#16a34a]',
      valueColor: 'text-[#16a34a]',
    },

    {
      title: 'Total Settlements',
      value: '₹ 2,20,790.85',
      sub: 'vs Last Month + 9.3%',
      icon: <CheckCircleOutlined />,
      iconBg: 'bg-[#f5f3ff]',
      iconColor: 'text-[#7c3aed]',
      valueColor: 'text-[#7c3aed]',
    },

    {
      title: 'Pending Settlements',
      value: '₹ 65,130.50',
      sub: 'vs Last Month - 14.2%',
      icon: <ClockCircleOutlined />,
      iconBg: 'bg-[#fff7ed]',
      iconColor: 'text-[#f97316]',
      valueColor: 'text-[#f97316]',
    },

    {
      title: 'Settlement Success Rate',
      value: '89.32%',
      sub: 'vs Last Month + 5.67%',
      icon: <RiseOutlined />,
      iconBg: 'bg-[#ecfeff]',
      iconColor: 'text-[#0891b2]',
      valueColor: 'text-[#0891b2]',
    },
  ];

  const tableData = [
    {
      marketplace: 'Amazon',
      orderId: '409-1234567-8901234',
      date: '31 May 2026',
      status: 'Delivered',
      type: 'FBA',
      sku: 12,
      units: 18,
      gmv: '₹ 24,550.00',
      settlement: 'Settled',
      expected: '24,550.00',
      amount: '24,150.00',
      pending: '410.00',
    },

    {
      marketplace: 'Flipkart',
      orderId: 'OD3298759382456',
      date: '30 May 2026',
      status: 'Shipped',
      type: 'FBF',
      sku: 9,
      units: 10,
      gmv: '₹ 12,340.10',
      settlement: 'Pending',
      expected: '12,340.10',
      amount: '12,340.10',
      pending: '0.00',
    },

    {
      marketplace: 'Meesho',
      orderId: 'MSHP-9871234-0001',
      date: '29 May 2026',
      status: 'In Transit',
      type: 'FBS',
      sku: 5,
      units: 6,
      gmv: '₹ 8,120.00',
      settlement: 'Partially Settled',
      expected: '8,120.00',
      amount: '6,900.00',
      pending: '1,220.00',
    },

    {
      marketplace: 'Amazon',
      orderId: '408-9876543-2109876',
      date: '28 May 2026',
      status: 'Delivered',
      type: 'FBA',
      sku: 15,
      units: 21,
      gmv: '₹ 28,550.20',
      settlement: 'Settled',
      expected: '28,550.20',
      amount: '28,150.20',
      pending: '400.00',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-3">
      {/* HEADER */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[20px] mb-1 font-semibold text-[#111827] leading-none">Order & Settlements</h1>

            <InfoCircleOutlined className="text-[12px] text-[#9ca3af]" />
          </div>

          <p className="mt-1 text-[11px] text-[#6b7280]">
            Track order volume, GMV and settlement status across all marketplaces.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#6b7280]">
          <span>Payment Reconciliation</span>

          <span>{'>'}</span>

          <span className="font-semibold text-[#2563eb]">Order & Settlements</span>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-5 gap-2 mb-2">
        {topCards.map((item, index) => (
          <div key={index} className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2">
            <div className="flex items-center gap-2">
              {/* Icon */}
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[12px] ${item.iconBg} ${item.iconColor}`}
              >
                {item.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {/* Title */}
                <p className="truncate text-[11px] leading-[11px] font-medium text-[#6b7280]">{item.title}</p>

                {/* Value */}
                <h2 className={`mt-[1px] truncate text-[15px] font-bold leading-none ${item.valueColor}`}>
                  {item.value}
                </h2>

                {/* Bottom Text */}
                <p className="mt-[2px] truncate text-[10px] leading-none text-[#9ca3af]">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-[1fr_280px] gap-2">
        {/* LEFT */}
        <div className="rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
          {/* TABS */}
          <div className="flex items-center gap-6 border-b border-[#edf0f2] px-4 py-3">
            {['Order Summary', 'Settlement Summary'].map((item, index) => (
              <button
                key={index}
                type="button"
                className={`pb-2 text-[12px] font-semibold ${
                  index === 0 ? 'border-b-2 border-[#16a34a] text-[#16a34a]' : 'text-[#6b7280]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-3 border-b border-[#edf0f2] px-4 py-3">
            <select className="py-1 rounded-l border border-[#e5e7eb] px-2 text-[11px] outline-none">
              <option>All Marketplaces</option>
            </select>

            <select className="py-1 rounded-l border border-[#e5e7eb] px-2 text-[11px] outline-none">
              <option>All Status</option>
            </select>

            <select className="py-1 rounded-l border border-[#e5e7eb] px-2 text-[11px] outline-none">
              <option>All Types</option>
            </select>

            <input
              type="text"
              value="01/05/2026 - 31/05/2026"
              readOnly
              className="py-1 w-[170px] rounded-l border border-[#e5e7eb] px-3 text-[11px] outline-none"
            />

            <div className="relative ml-auto">
              <input
                placeholder="Search Order ID / SKU / ASIN"
                className="py-1 w-[180px] rounded-l border border-[#e5e7eb] pl-3 pr-9 text-[11px] outline-none"
              />

              <SearchOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9ca3af]" />
            </div>

            {/* <button
              type="button"
              className="flex py-1 items-center gap-2 rounded-l border border-[#e5e7eb] px-2 text-[11px] font-medium text-[#374151]"
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
                    'Marketplace',
                    'Order ID',
                    'Order Date',
                    'Order Status',
                    'Fulfillment Type',
                    'SKU Count',
                    'Units Sold',
                    'GMV',
                    'Settlement Status',
                    'Expected Settlement',
                    'Settled Amount',
                    'Pending',
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
                {tableData.map((row, index) => (
                  <tr key={index} className="border-b border-[#f3f4f6] hover:bg-[#fafafa]">
                    <td className="px-4 py-3 text-[11px] font-medium text-[#111827]">{row.marketplace}</td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-[#2563eb]">
                      {row.orderId}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-[#374151]">{row.date}</td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#ecfdf3] px-2 py-[4px] text-[10px] font-semibold text-[#16a34a]">
                        {row.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[11px] text-[#374151]">{row.type}</td>

                    <td className="px-4 py-3 text-[11px] text-[#374151]">{row.sku}</td>

                    <td className="px-4 py-3 text-[11px] text-[#374151]">{row.units}</td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-[#111827]">{row.gmv}</td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-[#eff6ff] px-2 py-[4px] text-[10px] font-semibold text-[#2563eb]">
                        {row.settlement}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] text-[#111827]">₹ {row.expected}</td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-[#16a34a]">
                      ₹ {row.amount}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[11px] font-semibold text-[#ef4444]">
                      ₹ {row.pending}
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
          {/* ORDER STATUS */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[13px] font-semibold text-[#111827]">Order Status Breakdown</h2>

            <div className="mt-2 flex items-center justify-center">
              <div className="relative flex h-[170px] w-[170px] items-center justify-center rounded-full border-[18px] border-[#16a34a]">
                <div className="text-center">
                  <h3 className="text-[22px] font-bold text-[#111827]">2,189</h3>

                  <p className="text-[10px] text-[#6b7280]">Total Orders</p>
                </div>
              </div>
            </div>

            <button type="button" className="mt-2 text-[11px] font-medium text-[#16a34a]">
              View Details →
            </button>
          </div>

          {/* SETTLEMENT STATUS */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[13px] font-semibold text-[#111827]">Settlement Status Breakdown</h2>

            <div className="mt-2 flex items-center justify-center">
              <div className="relative flex h-[170px] w-[170px] items-center justify-center rounded-full border-[18px] border-[#2563eb]">
                <div className="text-center">
                  <h3 className="text-[22px] font-bold text-[#111827]">2,059</h3>

                  <p className="text-[10px] text-[#6b7280]">Total Settlements</p>
                </div>
              </div>
            </div>

            <button type="button" className="mt-2 text-[11px] font-medium text-[#16a34a]">
              View Details →
            </button>
          </div>

          {/* QUICK ACTIONS */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[13px] font-semibold text-[#111827]">Quick Actions</h2>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
              >
                <DownloadOutlined className="text-[13px] text-[#2563eb]" />

                <div>
                  <p className="text-[11px] font-semibold text-[#111827] mb-1">Download Order Report</p>

                  <p className="text-[10px] text-[#9ca3af]">Export all order data</p>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
              >
                <WarningOutlined className="text-[13px] text-[#ef4444]" />

                <div>
                  <p className="text-[11px] font-semibold text-[#111827] mb-1">View All Leaks</p>

                  <p className="text-[10px] text-[#9ca3af]">Analyze losses & pending settlements</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSettlement;
