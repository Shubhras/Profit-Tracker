import React from 'react';
import {
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  PercentageOutlined,
  FundProjectionScreenOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

function Placements() {
  const trendData = [
    { date: 'May 01', spend: 18000, sales: 5000, acos: 12 },
    { date: 'May 03', spend: 17000, sales: 9000, acos: 18 },
    { date: 'May 05', spend: 21000, sales: 15000, acos: 8 },
    { date: 'May 07', spend: 14000, sales: 12000, acos: 25 },
    { date: 'May 09', spend: 19000, sales: 22000, acos: 15 },
    { date: 'May 11', spend: 12000, sales: 11000, acos: 30 },
    { date: 'May 13', spend: 22000, sales: 26000, acos: 20 },
    { date: 'May 15', spend: 7000, sales: 8000, acos: 35 },
    { date: 'May 17', spend: 15000, sales: 14000, acos: 28 },
    { date: 'May 19', spend: 18000, sales: 20000, acos: 55 },
    { date: 'May 21', spend: 19000, sales: 16000, acos: 32 },
    { date: 'May 23', spend: 13000, sales: 24000, acos: 40 },
    { date: 'May 25', spend: 21000, sales: 12000, acos: 22 },
    { date: 'May 27', spend: 9000, sales: 15000, acos: 30 },
    { date: 'May 29', spend: 8000, sales: 14000, acos: 26 },
    { date: 'May 31', spend: 7000, sales: 9000, acos: 29 },
  ];
  const stats = [
    {
      title: 'Total Spend',
      value: '$54,231.52',
      change: '+18% vs last 30 days',
      icon: <DollarOutlined size={18} />,
      bg: 'bg-[#eefbf3]',
      color: 'text-[#16a34a]',
      changeColor: 'text-[#16a34a]',
    },

    {
      title: 'Impressions',
      value: '9.82M',
      change: '+16% vs last 30 days',
      icon: <FundProjectionScreenOutlined size={18} />,
      bg: 'bg-[#f3f0ff]',
      color: 'text-[#7c3aed]',
      changeColor: 'text-[#16a34a]',
    },

    {
      title: 'Clicks',
      value: '8,742',
      change: '+14% vs last 30 days',
      icon: <SearchOutlined size={18} />,
      bg: 'bg-[#fff7ed]',
      color: 'text-[#ea580c]',
      changeColor: 'text-[#16a34a]',
    },

    {
      title: 'CTR',
      value: '0.90%',
      change: '-2% vs last 30 days',
      icon: <PercentageOutlined size={18} />,
      bg: 'bg-[#eff6ff]',
      color: 'text-[#2563eb]',
      changeColor: 'text-[#dc2626]',
    },

    {
      title: 'Sales',
      value: '$198,421.60',
      change: '+21% vs last 30 days',
      icon: <ShoppingCartOutlined size={18} />,
      bg: 'bg-[#eefbf3]',
      color: 'text-[#16a34a]',
      changeColor: 'text-[#16a34a]',
    },
  ];

  const placements = [
    {
      name: 'Top of search (first page)',
      strategy: 'Dynamic bidding (up and down)',
      bid: '5%',
      impressions: '6',
      clicks: '1',
      ctr: '16.67%',
      cost: '$10.52',
      cpc: '$10.52',
      purchases: '1',
      sales: '$456.19',
      acos: '2.31%',
    },

    {
      name: 'Rest of search',
      strategy: 'Dynamic bidding (up and down)',
      bid: '0%',
      impressions: '533',
      clicks: '2',
      ctr: '0.38%',
      cost: '$21.96',
      cpc: '$10.98',
      purchases: '--',
      sales: '--',
      acos: '--',
    },

    {
      name: 'Product pages',
      strategy: 'Dynamic bidding (up and down)',
      bid: '5%',
      impressions: '740',
      clicks: '5',
      ctr: '0.68%',
      cost: '$49.24',
      cpc: '$9.85',
      purchases: '2',
      sales: '$1,140.96',
      acos: '4.32%',
    },
  ];

  return (
    <div className="bg-[#f8fafc] p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-[#111827] mb-1">Placements</h1>

          <p className="text-sm text-[#6b7280]">
            Analyze where your ads appear across Amazon and partner networks to optimize performance and control spend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="h-10 px-3 rounded-xl border border-[#dbe3ee] bg-white text-sm font-medium text-[#374151] flex items-center gap-2 shadow-sm hover:bg-[#f9fafb]"
          >
            <DownloadOutlined />
            Placement Report
          </button>

          <button
            type="button"
            className="h-10 px-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <PlusOutlined />
            Add / Exclude Placement
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {stats.map((item, index) => (
          <div key={index} className="bg-white border border-[#e5e7eb] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-[#6b7280]">{item.title}</p>

              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
            </div>

            <h2 className="text-[27px] leading-none font-bold text-[#111827]">{item.value}</h2>

            <p className={`text-xs mt-3 font-medium ${item.changeColor}`}>{item.change}</p>
          </div>
        ))}
      </div>

      {/* Bottom Layout */}
      <div className="flex gap-6 items-start">
        {/* LEFT TABLE SECTION */}
        {/* LEFT TABLE SECTION */}
        <div className="flex-1 bg-white border border-[#e5e7eb] rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-[#edf1f5] px-6 pt-5">
            <button type="button" className="pb-4 text-sm font-semibold text-[#10b981] border-b-2 border-[#10b981]">
              All placements
            </button>

            <button type="button" className="pb-4 text-sm font-medium text-[#6b7280]">
              Audiences
            </button>

            <button type="button" className="pb-4 text-sm font-medium text-[#6b7280]">
              Amazon Business placements
            </button>
          </div>

          {/* Filters */}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <select className="h-10 px-4 rounded-xl border border-[#dbe3ee] bg-white text-sm text-[#374151] outline-none">
                <option>All Campaigns</option>
              </select>

              <select className="h-10 px-4 rounded-xl border border-[#dbe3ee] bg-white text-sm text-[#374151] outline-none">
                <option>All Ad Groups</option>
              </select>

              <select className="h-10 px-4 rounded-xl border border-[#dbe3ee] bg-white text-sm text-[#374151] outline-none">
                <option>All Match Types</option>
              </select>

              <select className="h-10 px-4 rounded-xl border border-[#dbe3ee] bg-white text-sm text-[#374151] outline-none">
                <option>All Placement Types</option>
              </select>
            </div>

            {/* <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="01/05/2026 - 31/05/2026"
                className="h-10 px-4 rounded-xl border border-[#dbe3ee] text-sm outline-none w-[210px]"
              />

              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />

                <input
                  type="text"
                  placeholder="Search placement..."
                  className="h-10 pl-10 pr-4 rounded-xl border border-[#dbe3ee] text-sm outline-none w-[220px]"
                />
              </div>
            </div> */}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead className="bg-[#f8fafc] border-y border-[#edf1f5]">
                <tr>
                  {[
                    'Placement name',
                    'Campaign bid strategy',
                    'Bid adj.',
                    'Impressions',
                    'Clicks',
                    'CTR',
                    'Total cost',
                    'CPC',
                    'Purchases',
                    'Sales',
                    'ACOS',
                    'Actions',
                  ].map((item, i) => (
                    <th
                      key={i}
                      className="px-5 py-4 text-left text-[11px] font-semibold uppercase text-[#6b7280] whitespace-nowrap"
                    >
                      {item}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {placements.map((item, index) => (
                  <tr key={index} className="border-b border-[#edf1f5] hover:bg-[#fafafa]">
                    <td className="px-5 py-5 text-sm font-semibold text-[#111827] whitespace-nowrap">{item.name}</td>

                    <td className="px-5 py-5 text-sm text-[#6b7280] whitespace-nowrap">{item.strategy}</td>

                    <td className="px-5 py-5">
                      <span className="px-3 py-1 rounded-full bg-[#ecfdf3] text-[#16a34a] text-xs font-semibold">
                        {item.bid}
                      </span>
                    </td>

                    <td className="px-5 py-5 text-sm text-[#111827]">{item.impressions}</td>

                    <td className="px-5 py-5 text-sm text-[#111827]">{item.clicks}</td>

                    <td className="px-5 py-5 text-sm text-[#111827]">{item.ctr}</td>

                    <td className="px-5 py-5 text-sm font-medium text-[#dc2626]">{item.cost}</td>

                    <td className="px-5 py-5 text-sm text-[#111827]">{item.cpc}</td>

                    <td className="px-5 py-5 text-sm text-[#111827]">{item.purchases}</td>

                    <td className="px-5 py-5 text-sm font-medium text-[#16a34a]">{item.sales}</td>

                    <td className="px-5 py-5 text-sm text-[#111827]">{item.acos}</td>

                    <td className="px-5 py-5">
                      <button
                        type="button"
                        aria-label="More actions"
                        className="w-9 h-9 rounded-xl border border-[#e5e7eb] flex items-center justify-center hover:bg-[#f9fafb]"
                      >
                        <MoreOutlined />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="bg-[#fafafa]">
                  <td className="px-5 py-5 text-sm font-bold text-[#111827]">Total: 3</td>

                  <td colSpan={4}>{null}</td>

                  <td className="px-5 py-5 text-sm font-semibold">0.63%</td>

                  <td className="px-5 py-5 text-sm font-semibold text-[#dc2626]">$81.72</td>

                  <td className="px-5 py-5 text-sm font-semibold">$10.21</td>

                  <td className="px-5 py-5 text-sm font-semibold">3</td>

                  <td className="px-5 py-5 text-sm font-semibold text-[#16a34a]">$1,597.15</td>

                  <td className="px-5 py-5 text-sm font-semibold">5.12%</td>

                  <td>{null}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Analytics Row */}
          <div className="grid grid-cols-[1.35fr_0.9fr] gap-6 p-5 border-t border-[#edf1f5]">
            {/* Placement Performance Trend */}
            {/* Placement Performance Trend */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5 bg-white">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827]">Placement Performance Trend</h3>
                </div>

                <select className="h-9 px-3 rounded-lg border border-[#dbe3ee] text-xs outline-none">
                  <option>Daily</option>
                </select>
              </div>

              {/* Legends */}
              <div className="flex items-center gap-6 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="text-xs text-[#6b7280] font-medium">Spend</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                  <span className="text-xs text-[#6b7280] font-medium">Sales</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#8b5cf6]" />
                  <span className="text-xs text-[#6b7280] font-medium">ACOS</span>
                </div>
              </div>

              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />

                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />

                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 30000]}
                      ticks={[0, 10000, 20000, 30000]}
                      tickFormatter={(v) => (v === 0 ? '$0' : `$${v / 1000}K`)}
                    />

                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 60]}
                      ticks={[0, 20, 40, 60]}
                      tickFormatter={(v) => `${v}%`}
                    />

                    <Tooltip />

                    <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#10b981" strokeWidth={3} dot={false} />

                    <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} dot={false} />

                    <Line yAxisId="right" type="monotone" dataKey="acos" stroke="#8b5cf6" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Placement Performance by Campaign */}
            <div className="border border-[#e5e7eb] rounded-2xl p-5">
              <h3 className="text-[17px] font-semibold text-[#111827] mb-5">Placement Performance by Campaign</h3>

              <div className="space-y-4">
                {[
                  {
                    name: 'Smart Watch - Auto',
                    spend: '$18,543.32',
                    sales: '$66,187.10',
                    acos: '28.00%',
                  },

                  {
                    name: 'Headphones - Exact',
                    spend: '$12,854.21',
                    sales: '$47,612.30',
                    acos: '27.00%',
                  },

                  {
                    name: 'Bluetooth Speaker - Auto',
                    spend: '$10,231.54',
                    sales: '$29,856.40',
                    acos: '31.42%',
                  },

                  {
                    name: 'Charger - Manual',
                    spend: '$6,542.11',
                    sales: '$21,564.80',
                    acos: '30.14%',
                  },
                ].map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 text-sm border-b border-[#f1f5f9] pb-3">
                    <p className="font-medium text-[#111827]">{item.name}</p>

                    <p className="text-[#6b7280]">{item.spend}</p>

                    <p className="text-[#16a34a] font-medium">{item.sales}</p>

                    <p className="text-[#111827] font-medium">{item.acos}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-[320px] bg-white border border-[#e5e7eb] rounded-2xl shadow-sm p-6 sticky top-4">
          <h2 className="text-lg font-semibold text-[#111827] mb-6">Placement Type Split</h2>

          {/* Donut */}
          <div className="flex justify-center">
            <div className="relative w-[210px] h-[210px] rounded-full bg-[conic-gradient(#10b981_0deg_340deg,#3b82f6_340deg_360deg)] flex items-center justify-center">
              <div className="w-[145px] h-[145px] rounded-full bg-white flex flex-col items-center justify-center">
                <h3 className="text-[24px] font-bold text-[#111827]">$54,231</h3>

                <p className="text-xs text-[#6b7280] mt-1">Total Spend</p>
              </div>
            </div>
          </div>

          {/* Legends */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#10b981] mb-2" />

                <p className="text-sm text-[#374151]">Amazon</p>
              </div>

              <p className="text-sm font-semibold text-[#111827]">$52,356.20</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#3b82f6] mb-2" />

                <p className="text-sm text-[#374151]">Publisher</p>
              </div>

              <p className="text-sm font-semibold text-[#111827]">$1,875.32</p>
            </div>
          </div>

          {/* Top Placement */}
          <div className="mt-4 pt-6 border-t border-[#edf1f5]">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Top Performing Placements</h3>

            <div className="space-y-3">
              {[
                {
                  name: 'Top of Search (first page)',
                  acos: '2.31%',
                },

                {
                  name: 'Product pages',
                  acos: '4.32%',
                },

                {
                  name: 'Rest of Search',
                  acos: '--',
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                  <p className="text-sm text-[#111827]">{item.name}</p>

                  <p className="text-sm font-medium text-[#111827]">{item.acos}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-3 pt-6 border-t border-[#edf1f5]">
            <h3 className="text-sm font-semibold text-[#111827] mb-4">Quick Actions</h3>

            <div className="space-y-3">
              {[
                {
                  title: 'Add Placement',
                  desc: 'Target specific placements',
                },

                {
                  title: 'Exclude Placement',
                  desc: 'Block specific placements',
                },

                {
                  title: 'Placement Report',
                  desc: 'Download detailed report',
                },
              ].map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full flex items-center justify-between border border-[#edf1f5] rounded-xl p-4 hover:bg-[#fafafa]"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-[#111827]">{item.title}</p>

                    <p className="text-xs text-[#6b7280] mt-1">{item.desc}</p>
                  </div>

                  <span className="text-[#9ca3af] text-lg">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Bottom Analytics Section */}

      {/* Bottom Recommendation Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#ecfdf3] flex items-center justify-center text-[#16a34a] font-bold">
            ↑
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#111827]">Top of search performs best</h4>

            <p className="text-xs text-[#6b7280] mt-1">Consider increasing bids to improve visibility and sales.</p>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] font-bold">
            i
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#111827]">Product pages moderate ACOS</h4>

            <p className="text-xs text-[#6b7280] mt-1">Optimize bids to reduce ACOS and improve profitability.</p>
          </div>
        </div>

        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#fff7ed] flex items-center justify-center text-[#ea580c] font-bold">
            !
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#111827]">Rest of search low performance</h4>

            <p className="text-xs text-[#6b7280] mt-1">Consider lowering bids or excluding this placement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Placements;
