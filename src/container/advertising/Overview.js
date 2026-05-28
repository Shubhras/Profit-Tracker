import React from 'react';
import { Switch } from 'antd';
import {
  ReloadOutlined,
  BulbOutlined,
  SearchOutlined,
  LineChartOutlined,
  DownOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

function Overview() {
  const data = [
    { name: 'May 01', acos: 16, tacos: 7, roas: 24 },
    { name: 'May 05', acos: 17, tacos: 7.5, roas: 26 },
    { name: 'May 09', acos: 15, tacos: 7, roas: 31 },
    { name: 'May 13', acos: 17, tacos: 8, roas: 27 },
    { name: 'May 17', acos: 14, tacos: 7, roas: 33 },
    { name: 'May 21', acos: 16, tacos: 7.5, roas: 25 },
    { name: 'May 25', acos: 15, tacos: 7, roas: 24 },
    { name: 'May 31', acos: 16, tacos: 6.5, roas: 22 },
  ];
  const cards = [
    {
      title: 'ACOS',
      value: '20.27%',
      growth: '+5.32%',
      tag: 'Good',
      tagColor: 'text-green-600 bg-green-100',
      //   line: 'bg-green-500',
    },
    {
      title: 'TACOS',
      value: '8.65%',
      growth: '+1.25%',
      tag: 'Good',
      tagColor: 'text-green-600 bg-green-100',
      //   line: 'bg-blue-500',
    },
    {
      title: 'ROAS',
      value: '4.94',
      growth: '+8.35%',
      tag: 'Excellent',
      tagColor: 'text-purple-600 bg-purple-100',
      //   line: 'bg-purple-500',
    },
    {
      title: 'Ad Spend',
      value: '₹ 2,20,790.85',
      growth: '+5.32%',
      tag: 'Moderate',
      tagColor: 'text-yellow-600 bg-yellow-100',
      //   line: 'bg-yellow-500',
    },
    {
      title: 'Sales from Ads',
      value: '₹ 10,89,112.45',
      growth: '+8.32%',
      tag: 'Good',
      tagColor: 'text-green-600 bg-green-100',
      //   line: 'bg-green-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-3">
      {/* Header */}
      {/* Header */}
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-[26px] font-bold text-[#111827]">Advertising Dashboard</h1>

          <p className="text-sm text-gray-500">
            Overview of your advertising performance and opportunities to improve.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Ad Account */}
          <div className="flex items-center gap-3 text-sm font-medium">
            <span className="text-gray-500">Ad Account:</span>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-[#edf4ff] px-4 py-2.5 text-[#2563eb] border border-gray-300"
            >
              <span className="font-semibold">All Accounts</span>

              <DownOutlined className="text-xs" />
            </button>
          </div>

          {/* Refresh */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700"
          >
            <ReloadOutlined />
            Refresh
          </button>

          {/* Last Updated */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-gray-700"
          >
            <InfoCircleOutlined className="text-gray-600" />
            Last Updated: 31 May 2025
          </button>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-5 gap-2">
        {cards.map((item, index) => (
          <div key={index} className="rounded-2xl border border-[#e5e7eb] bg-white px-5 py-4">
            {/* Top */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-600">{item.title}</h3>

              <span className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${item.tagColor}`}>{item.tag}</span>
            </div>

            {/* Value */}
            <h2 className="text-[22px] font-bold leading-none tracking-tight text-[#111827]">{item.value}</h2>

            {/* Growth */}
            <p className="mt-2 text-xs font-medium text-green-600">↑ {item.growth} vs 07 Apr - 30 Apr</p>

            {/* Mini Graph */}
            {/* <div className="mt-4 flex items-end gap-[3px]">
              {[20, 12, 18, 15, 25, 22, 32, 18, 28, 20].map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-full ${item.line}`}
                  style={{
                    height: `${h}px`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div> */}
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="mt-2 grid grid-cols-12 gap-2">
        <div className="col-span-4 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">Performance Trend</h2>

              <div className="mt-2 flex items-center gap-5 text-sm">
                <span className="flex items-center gap-2 text-green-600 text-[12px]">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  ACOS (%)
                </span>

                <span className="flex items-center gap-2 text-blue-600 text-[12px]">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  TACOS (%)
                </span>

                <span className="flex items-center gap-2 text-purple-600 text-[12px]">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  ROAS
                </span>
              </div>
            </div>

            <button
              type="button"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600"
            >
              Daily
            </button>
          </div>

          {/* Graph */}
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                    fill: '#9ca3af',
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                    fill: '#9ca3af',
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Line type="monotone" dataKey="acos" stroke="#10b981" strokeWidth={3} dot={false} />

                <Line type="monotone" dataKey="tacos" stroke="#3b82f6" strokeWidth={3} dot={false} />

                <Line type="monotone" dataKey="roas" stroke="#8b5cf6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown */}
        <div className="col-span-4 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <h2 className="mb-6 text-lg font-semibold text-[#111827]">Performance Breakdown</h2>

          {/* Main Layout */}
          <div className="flex items-center">
            {/* Donut Chart */}
            <div className="relative flex-shrink-0">
              <svg width="190" height="190" viewBox="0 0 200 200">
                {/* Blue */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray="290 150"
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />

                {/* Green */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="20"
                  strokeDasharray="95 345"
                  strokeDashoffset="-300"
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />

                {/* Purple */}
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="20"
                  strokeDasharray="70 370"
                  strokeDashoffset="-405"
                  strokeLinecap="round"
                  transform="rotate(-90 100 100)"
                />
              </svg>

              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <p className="text-xs text-gray-500">Total Ad Spend</p>

                <h3 className="mt-1 text-sm font-bold text-[#111827]">₹ 2,20,790.85</h3>
              </div>
            </div>

            {/* Labels */}
            <div className="mt-6 w-full px-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />

                  <span className="text-sm font-medium text-gray-700">Sponsored Products</span>
                </div>

                <p className="mt-1 pl-5 text-sm font-semibold text-[#111827]">₹ 1,45,230.40 (65.8%)</p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />

                  <span className="text-sm font-medium text-gray-700">Sponsored Brands</span>
                </div>

                <p className="mt-1 pl-5 text-sm font-semibold text-[#111827]">₹ 45,671.22 (20.7%)</p>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />

                  <span className="text-sm font-medium text-gray-700">Sponsored Display</span>
                </div>

                <p className="mt-1 pl-5 text-sm font-semibold text-[#111827]">₹ 29,889.23 (13.5%)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Table */}
        <div className="col-span-4 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <h2 className="mb-6 text-lg font-semibold text-[#111827]">Performance by Campaign Type</h2>

          <div className="overflow-x-auto">
            <table className="min-w-[500px] w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                  <th className="pb-4">Campaign Type</th>
                  <th className="pb-4">Ad Spend</th>
                  <th className="pb-4">Sales</th>
                  <th className="pb-4">ACOS</th>
                </tr>
              </thead>

              <tbody className="text-sm">
                <tr className="border-b border-gray-100">
                  <td className="py-4">Sponsored Products</td>
                  <td>₹ 1,41,326</td>
                  <td>₹ 7,42,418</td>
                  <td>19.02%</td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4">Sponsored Brands</td>
                  <td>₹ 45,673</td>
                  <td>₹ 2,63,564</td>
                  <td>17.31%</td>
                </tr>

                <tr>
                  <td className="py-4">Sponsored Display</td>
                  <td>₹ 33,791</td>
                  <td>₹ 1,83,129</td>
                  <td>18.45%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-2 grid grid-cols-12 gap-2">
        {/* Top Campaigns */}
        <div className="col-span-5 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#111827]">Top Campaigns</h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8fafc] text-left text-xs font-semibold text-gray-500">
                  <th className="rounded-l-xl px-3 py-3">Campaign</th>
                  <th className="px-3 py-4">Ad Spend</th>
                  <th className="px-3 py-4">Sales</th>
                  <th className="px-3 py-4">ACOS</th>
                  <th className="px-3 py-4">ROAS</th>
                  <th className="rounded-r-xl px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    campaign: 'SP - Auto - Best Sellers',
                    spend: '₹52,348.21',
                    sales: '₹3,284.60',
                    acos: '15.17%',
                    roas: '6.59',
                    status: 'Good',
                    color: 'bg-green-100 text-green-600',
                  },
                  {
                    campaign: 'SP - Manual - High Convert',
                    spend: '₹31,245.60',
                    sales: '₹2,25,640.80',
                    acos: '13.85%',
                    roas: '7.22',
                    status: 'Excellent',
                    color: 'bg-emerald-100 text-emerald-600',
                  },
                  {
                    campaign: 'SB - Brand - Exact',
                    spend: '₹18,765.44',
                    sales: '₹1,02,456.60',
                    acos: '18.32%',
                    roas: '5.45',
                    status: 'Good',
                    color: 'bg-green-100 text-green-600',
                  },
                  {
                    campaign: 'SD - Product Targeting',
                    spend: '₹16,232.15',
                    sales: '₹62,431.20',
                    acos: '26.01%',
                    roas: '3.84',
                    status: 'Moderate',
                    color: 'bg-yellow-100 text-yellow-600',
                  },
                ].map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 text-[12px] text-gray-700">
                    {' '}
                    <td className="px-4 py-3 font-medium text-gray-700"> {item.campaign}</td>
                    <td className="px-4 py-3 text-gray-600">{item.spend}</td>
                    <td className="px-4 py-3 text-gray-600">{item.sales}</td>
                    <td className="px-4 py-3 text-gray-600">{item.acos}</td>
                    <td className="px-4 py-3 text-gray-600">{item.roas}</td>
                    <td className="px-4 py-3">
                      {' '}
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.color}`}>
                        {' '}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <button type="button" className="mt-5 flex items-center gap-1 text-sm font-medium text-blue-600">
            View all campaigns
            <span>→</span>
          </button>
        </div>

        {/* AI Recommendations */}
        <div className="col-span-4 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <h2 className="mb-2 text-lg font-semibold text-[#111827]">AI Recommendations</h2>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-start justify-between rounded-xl border border-gray-200 p-4 bg-gray-50"
              >
                <div className="flex gap-3">
                  <div className="flex h-fit w-fit items-center justify-center rounded-lg bg-green-100 p-2">
                    {' '}
                    {item === 1 && <LineChartOutlined className="text-green-600 text-[18px]" />}
                    {item === 2 && <SearchOutlined className="text-purple-600 text-[18px]" />}
                    {item === 3 && <BulbOutlined className="text-yellow-600 text-[18px]" />}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">Increase bids for high converting keywords</h4>

                    <p className="mt-1 text-xs text-gray-500">Improve ad performance and conversions.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="mt-5 flex items-center gap-1 text-sm font-medium text-blue-600">
            View all recommendations
            <span>→</span>
          </button>
        </div>

        {/* Auto Rules */}
        <div className="col-span-3 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#111827]">Auto Optimization Rules</h2>

            {/* <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[10px] text-gray-500">
              i
            </div> */}
          </div>

          {/* Table Header */}
          <div className="mb-2 grid grid-cols-[1fr_auto] border-b border-gray-200 pb-3 text-xs font-medium text-gray-400">
            <span>Campaign</span>
            <span>Status</span>
          </div>

          {/* Rules */}
          <div className="space-y-4">
            {[
              'Pause keywords with ACOS > 60%',
              'Increase bids for ACOS < 15%',
              'Reduce bids for ACOS > 40%',
              'Daily budget reallocation',
            ].map((rule, index) => (
              <div key={index} className="grid grid-cols-[1fr_auto] items-center border-b border-gray-100 pb-4">
                {/* Left */}
                <div>
                  <h4 className="text-sm font-medium text-[#111827]">{rule}</h4>
                </div>

                {/* Right */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-500">Active</span>

                  <Switch defaultChecked size="small" />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <button type="button" className="mt-5 flex items-center gap-1 text-sm font-medium text-blue-600">
            Manage all rules
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Overview;
