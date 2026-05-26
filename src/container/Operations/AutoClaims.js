import React from 'react';
import {
  ReloadOutlined,
  PlusOutlined,
  FilterOutlined,
  // AppstoreOutlined,
  DollarCircleOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  SyncOutlined,
  SearchOutlined,
  InfoCircleFilled,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

function AutoClaims() {
  const stats = [
    {
      title: 'Total Claimable Amount',
      value: '₹2,45,680.75',
      growth: '+12.45%',
      icon: <DollarCircleOutlined />,
      bg: 'bg-[#eef4ff]',
      iconColor: 'text-[#2563eb]',
      growthColor: 'text-[#16a34a]',
    },
    {
      title: 'Claims Approved',
      value: '₹1,62,430.50',
      growth: '+18.31%',
      icon: <CheckCircleFilled />,
      bg: 'bg-[#ecfdf3]',
      iconColor: 'text-[#16a34a]',
      growthColor: 'text-[#16a34a]',
    },
    {
      title: 'Claims Pending',
      value: '₹58,760.25',
      growth: '-6.21%',
      icon: <ClockCircleFilled />,
      bg: 'bg-[#fff7ed]',
      iconColor: 'text-[#f59e0b]',
      growthColor: 'text-[#dc2626]',
    },
    {
      title: 'Claims Rejected',
      value: '₹14,520.00',
      growth: '+8.12%',
      icon: <CloseCircleFilled />,
      bg: 'bg-[#fef2f2]',
      iconColor: 'text-[#ef4444]',
      growthColor: 'text-[#dc2626]',
    },
    {
      title: 'Recovery Success Rate',
      value: '84.13%',
      growth: '+6.72%',
      icon: <SyncOutlined />,
      bg: 'bg-[#f5f3ff]',
      iconColor: 'text-[#8b5cf6]',
      growthColor: 'text-[#16a34a]',
    },
  ];

  // const marketplaces = [
  //   { name: 'Amazon', value: '₹95,430', width: '95%' },
  //   { name: 'Flipkart', value: '₹56,780', width: '70%' },
  //   { name: 'Myntra', value: '₹32,640', width: '45%' },
  //   { name: 'Meesho', value: '₹28,550', width: '38%' },
  //   { name: 'Nykaa', value: '₹21,450', width: '30%' },
  //   { name: 'Others', value: '₹10,830', width: '18%' },
  // ];
  const claimTypeData = [
    { name: 'Customer Returns', value: 124780, color: '#3b82f6' },
    { name: 'Lost In Transit', value: 68420, color: '#10b981' },
    { name: 'Damaged / Defective', value: 31560, color: '#f59e0b' },
    { name: 'Missing Item', value: 12430, color: '#8b5cf6' },
    { name: 'Other Claims', value: 8488, color: '#ef476f' },
  ];

  const statusData = [
    { name: 'Approved', value: 1542, color: '#10b981' },
    { name: 'Pending', value: 872, color: '#f59e0b' },
    { name: 'Rejected', value: 231, color: '#ef4444' },
    { name: 'Under Review', value: 200, color: '#3b82f6' },
  ];

  const marketplaceChartData = [
    { name: 'Amazon', amount: 95430 },
    { name: 'Flipkart', amount: 56780 },
    { name: 'Myntra', amount: 32640 },
    { name: 'Meesho', amount: 28550 },
    { name: 'Nykaa', amount: 21450 },
    { name: 'Others', amount: 10830 },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-5">
      <div className="rounded-[28px] border border-[#e5e7eb] bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between">
          {/* Left */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[28px] font-bold text-[#111827] mb-1">Auto Claims</h1>

              <InfoCircleFilled className="text-[#94a3b8]" />
            </div>

            <p className="max-w-[850px] text-sm leading-7 text-[#6b7280]">
              Track, manage and recover your eligible refunds for returns, lost orders, damaged items and other claim
              types across all marketplaces.
            </p>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[#d1fae5] bg-white px-4 py-2.5 text-sm font-medium text-[#16a34a] transition-all hover:bg-[#f0fdf4]"
            >
              <ReloadOutlined />
              Refresh
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-[#16a34a] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#15803d]"
            >
              <PlusOutlined />
              Create Claim
            </button>
          </div>
        </div>
        {/* Stats */}
        <div className="mt-7">
          <div className="grid grid-cols-5 gap-4">
            {stats.map((item, index) => (
              <div
                key={index}
                className="min-w-0 rounded-2xl border border-[#edf0f2] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-[20px] ${item.bg} ${item.iconColor}`}
                  >
                    {item.icon}
                  </div>

                  <span className={`text-[15px] font-semibold ${item.growthColor}`}>{item.growth}</span>
                </div>

                <div className="mt-4">
                  <p className="text-[14px] font-medium text-[#6b7280]">{item.title}</p>

                  <h2 className="mt-1 text-[22px] font-bold text-[#111827] break-words">{item.value}</h2>

                  <p className="mt-1 text-xs text-[#9ca3af] font-semibold">vs last 30 days</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-wrap gap-3">
            <select className="min-w-[100px] rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#374151] outline-none">
              <option>All Marketplaces</option>
            </select>

            <select className="min-w-[100px] rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#374151] outline-none">
              <option>All Claim Types</option>
            </select>

            <select className="min-w-[100px] rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#374151] outline-none">
              <option>All Status</option>
            </select>

            <input
              type="text"
              value="01/05/2026 - 31/05/2026"
              readOnly
              className="min-w-[220px] rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#374151] outline-none"
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Order ID, ASIN, SKU..."
                className="w-[180px] rounded-xl border border-[#e5e7eb] bg-white py-3 pl-4 pr-10 text-sm outline-none"
              />

              <SearchOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#374151] transition-all hover:bg-[#f9fafb]"
            >
              <FilterOutlined />
              Filters
            </button>
          </div>

          {/* <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#374151] transition-all hover:bg-[#f9fafb]"
            >
              <FilterOutlined />
              Filters
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm font-medium text-[#374151] transition-all hover:bg-[#f9fafb]"
            >
              <AppstoreOutlined />
              Columns
            </button>
          </div> */}
        </div>

        {/* Charts */}
        {/* Charts */}
        <div className="mt-7 grid grid-cols-3 gap-5">
          {/* Chart 1 */}
          <div className="rounded-2xl border border-[#edf0f2] bg-white p-5">
            <h3 className="text-[13px] font-semibold text-[#111827]">Claim Amount by Type</h3>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="relative h-[230px] w-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={claimTypeData} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={2}>
                      {claimTypeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <span className="text-[21px] font-bold text-[#111827]">₹2,45,680</span>

                  <span className="text-xs text-[#6b7280]">Total Claimable</span>
                </div>
              </div>

              <div className="space-y-3">
                {claimTypeData.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-[5px] h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />

                    <div>
                      <p className="text-xs font-medium text-[#111827]">{item.name}</p>

                      <p className="text-[11px] text-[#6b7280]">₹{item.value.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="rounded-2xl border border-[#edf0f2] bg-white p-5">
            <h3 className="text-[16px] font-semibold text-[#111827]">Claim Status Overview</h3>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="relative h-[230px] w-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" innerRadius={62} outerRadius={88} paddingAngle={2}>
                      {statusData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <span className="text-[21px] font-bold text-[#111827]">2,845</span>

                  <span className="text-xs text-[#6b7280]">Total Claims</span>
                </div>
              </div>

              <div className="space-y-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-[5px] h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />

                    <div>
                      <p className="text-xs font-medium text-[#111827]">{item.name}</p>

                      <p className="text-[11px] text-[#6b7280]">{item.value} Claims</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3 */}
          <div className="rounded-2xl border border-[#edf0f2] bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#111827]">Claim Amount by Marketplace</h3>

              <select className="rounded-lg border border-[#e5e7eb] px-2 py-1 text-xs outline-none">
                <option>Amount</option>
              </select>
            </div>

            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketplaceChartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />

                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />

                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />

                  <Tooltip />

                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#10b981" barSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Claims Table Section */}
        <div className="mt-7 rounded-2xl border border-[#edf0f2] bg-white">
          {/* Top Tabs */}
          <div className="flex items-center gap-8 border-b border-[#edf0f2] px-5 py-4 overflow-x-auto">
            {[
              'All Claims (2,845)',
              'Customer Returns (1,456)',
              'Lost In Transit (672)',
              'Damaged / Defective (365)',
              'Missing Item (198)',
              'Other Claims (154)',
              'Lost Orders (324)',
            ].map((item, index) => (
              <button
                type="button"
                key={index}
                className={`whitespace-nowrap text-[14px] font-semibold transition-all ${
                  index === 0 ? 'text-[#10b981]' : 'text-[#6b7280] hover:text-[#111827]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between border-b border-[#edf0f2] px-5 py-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-[13px] text-[#374151]">
                <input type="checkbox" className="rounded border-[#d1d5db]" />
                Select All
              </label>

              <span className="text-[13px] text-[#6b7280]">2,845 claims selected</span>

              <button
                type="button"
                className="rounded-lg bg-[#16a34a] px-4 py-2 text-xs font-medium text-white hover:bg-[#15803d]"
              >
                Process All Claims
              </button>

              <button
                type="button"
                className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-xs font-medium text-[#374151] hover:bg-[#f9fafb]"
              >
                Mark as Reviewed
              </button>
            </div>

            <button
              type="button"
              className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-xs font-medium text-[#374151] hover:bg-[#f9fafb]"
            >
              Export
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px]">
              <thead>
                <tr className="border-b border-[#edf0f2] bg-[#fafafa]">
                  {[
                    '',
                    'Master SKU',
                    'Order ID',
                    'Marketplace',
                    'Claim Type',
                    'Reason',
                    'Claim Date',
                    'Claim Amount',
                    'Status',
                    'Expected Payout',
                    'Action',
                  ].map((head, index) => (
                    <th
                      key={index}
                      className="whitespace-nowrap px-5 py-4 text-left text-[13px] font-semibold text-dark"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    sku: 'TS-KT-2-BLK',
                    order: '403-1001325-6457112',
                    marketplace: 'Amazon',
                    type: 'Customer Returns',
                    reason: 'Item Defective',
                    date: '31 May 2026',
                    amount: '₹1,299.00',
                    status: 'Approved',
                    payout: '₹1,299.00',
                  },
                  {
                    sku: 'TS-KT-WHT',
                    order: '405-2112845-7789123',
                    marketplace: 'Flipkart',
                    type: 'Lost In Transit',
                    reason: 'Lost by Courier',
                    date: '31 May 2026',
                    amount: '₹849.00',
                    status: 'Pending',
                    payout: '₹849.00',
                  },
                  {
                    sku: 'NL-SIZZ-AT',
                    order: '408-3123456-8891024',
                    marketplace: 'Myntra',
                    type: 'Damaged / Defective',
                    reason: 'Item Damaged',
                    date: '30 May 2026',
                    amount: '₹1,599.00',
                    status: 'Under Review',
                    payout: '₹1,599.00',
                  },
                  {
                    sku: 'COMB-AT-SGL',
                    order: '407-4123456-9912035',
                    marketplace: 'Meesho',
                    type: 'Missing Item',
                    reason: 'Item Missing in Package',
                    date: '30 May 2026',
                    amount: '₹699.00',
                    status: 'Rejected',
                    payout: '₹0.00',
                  },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-[#f1f5f9] hover:bg-[#fafafa]">
                    <td className="px-5 py-4">
                      <label className="flex items-center">
                        <input type="checkbox" aria-label="Select claim" className="rounded border-[#d1d5db]" />
                      </label>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[13px] font-medium text-[#111827]">{row.sku}</td>

                    <td className="whitespace-nowrap px-5 py-4 text-[13px] text-[#374151]">{row.order}</td>

                    <td className="whitespace-nowrap px-5 py-4 text-[13px] text-[#374151]">{row.marketplace}</td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[11px] font-medium text-[#4f46e5]">
                        {row.type}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[13px] text-[#374151]">{row.reason}</td>

                    <td className="whitespace-nowrap px-5 py-4 text-[13px] text-[#374151]">{row.date}</td>

                    <td className="whitespace-nowrap px-5 py-4 text-[13px] font-medium text-[#111827]">{row.amount}</td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                          row.status === 'Approved'
                            ? 'bg-[#ecfdf3] text-[#16a34a]'
                            : row.status === 'Pending'
                            ? 'bg-[#fff7ed] text-[#f59e0b]'
                            : row.status === 'Rejected'
                            ? 'bg-[#fef2f2] text-[#ef4444]'
                            : 'bg-[#eff6ff] text-[#2563eb]'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-[13px] font-medium text-[#111827]">{row.payout}</td>

                    <td className="px-5 py-4">
                      <button type="button" className="text-[#94a3b8] hover:text-[#111827]">
                        ⋮
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-[12px] text-[#6b7280]">Showing 1 to 4 of 2,845 claims</p>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                    page === 1 ? 'bg-[#16a34a] text-white' : 'border border-[#e5e7eb] text-[#374151]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutoClaims;
