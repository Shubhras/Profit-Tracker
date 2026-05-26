import React from 'react';
import {
  InfoCircleFilled,
  ReloadOutlined,
  // AppstoreOutlined,
  ShoppingCartOutlined,
  InboxOutlined,
  // CheckCircleFilled,
  ClockCircleFilled,
  StopFilled,
  RollbackOutlined,
  TruckOutlined,
} from '@ant-design/icons';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

function OrderProcessing() {
  const stats = [
    {
      title: 'Orders Received',
      value: '5,482',
      sub: '+8.95%',
      icon: <ShoppingCartOutlined />,
      bg: 'bg-[#eef4ff]',
      iconColor: 'text-[#2563eb]',
      lightBg: 'bg-[#f8fbff]',
      glowBg: 'bg-[#bfdbfe]',
      subColor: 'text-[#16a34a]',
    },
    {
      title: 'Orders Shipped',
      value: '4,237',
      sub: '+8.87%',
      icon: <TruckOutlined />,
      bg: 'bg-[#ecfdf3]',
      iconColor: 'text-[#16a34a]',
      lightBg: 'bg-[#f6fef9]',
      glowBg: 'bg-[#bbf7d0]',
      subColor: 'text-[#16a34a]',
    },
    {
      title: 'Orders Delivered',
      value: '3,912',
      sub: '+9.27%',
      icon: <InboxOutlined />,
      bg: 'bg-[#f5f3ff]',
      iconColor: 'text-[#8b5cf6]',
      lightBg: 'bg-[#faf7ff]',
      glowBg: 'bg-[#ddd6fe]',
      subColor: 'text-[#16a34a]',
    },
    {
      title: 'Pending',
      value: '1,086',
      sub: '+6.27%',
      icon: <ClockCircleFilled />,
      bg: 'bg-[#fffaf5]',
      iconColor: 'text-[#f59e0b]',
      lightBg: 'bg-[#fffaf5]',
      glowBg: 'bg-[#fed7aa]',
      subColor: 'text-[#16a34a]',
    },
    {
      title: 'Cancelled',
      value: '247',
      sub: '+11.9%',
      icon: <StopFilled />,
      bg: 'bg-[#fff7f7]',
      iconColor: 'text-[#ef4444]',
      lightBg: 'bg-[#fff7f7]',
      glowBg: 'bg-[#fecaca]',
      subColor: 'text-[#16a34a]',
    },
    {
      title: 'Return Initiated',
      value: '156',
      sub: '+14.82%',
      icon: <RollbackOutlined />,
      bg: 'bg-[#eef4ff]',
      iconColor: 'text-[#3b82f6]',
      lightBg: 'bg-[#f8fbff]',
      glowBg: 'bg-[#bfdbfe]',
      subColor: 'text-[#16a34a]',
    },
  ];

  const lineData = [
    { day: 'May 1', received: 4200, shipped: 3100, delivered: 2200, cancelled: 200 },
    { day: 'May 5', received: 4800, shipped: 3600, delivered: 2700, cancelled: 240 },
    { day: 'May 10', received: 5200, shipped: 3900, delivered: 3100, cancelled: 280 },
    { day: 'May 15', received: 5000, shipped: 3700, delivered: 2900, cancelled: 260 },
    { day: 'May 20', received: 4600, shipped: 3400, delivered: 2500, cancelled: 210 },
    { day: 'May 25', received: 5100, shipped: 3850, delivered: 3050, cancelled: 300 },
    { day: 'May 31', received: 5600, shipped: 4100, delivered: 3400, cancelled: 350 },
  ];

  const pieData = [
    { name: 'Delivered', value: 3912, color: '#8b5cf6' },
    { name: 'Shipped', value: 4237, color: '#22c55e' },
    { name: 'Pending', value: 1086, color: '#f59e0b' },
    { name: 'Cancelled', value: 247, color: '#ef4444' },
    { name: 'Return Initiated', value: 156, color: '#3b82f6' },
  ];

  const insights = [
    {
      icon: '📦',
      title: '71.33% of orders delivered',
      sub: '3,912 orders successfully delivered',
      bg: 'bg-[#eef4ff]',
    },
    {
      icon: '🧾',
      title: '19.79% pending orders',
      sub: '1,086 orders are pending',
      bg: 'bg-[#fff7ed]',
    },
    {
      icon: '❌',
      title: '4.50% cancellation rate',
      sub: '247 orders cancelled',
      bg: 'bg-[#fff1f2]',
    },
    {
      icon: '↩️',
      title: '2.85% return initiation',
      sub: '156 return requests initiated',
      bg: 'bg-[#f5f3ff]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-5">
      <div className="rounded-[28px] border border-[#e5e7eb] bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[28px] font-bold text-[#111827]">Order Processing</h1>

              <InfoCircleFilled className="text-[#94a3b8]" />
            </div>

            <p className="mt-1 text-sm text-[#6b7280]">
              Track and manage the complete order lifecycle across all your marketplaces.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select className="rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none">
              <option>All Marketplaces</option>
            </select>

            <select className="rounded-xl border border-[#e5e7eb] px-4 py-2.5 text-sm outline-none">
              <option>All Channels</option>
            </select>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-[#ecfdf3] px-4 py-2.5 text-sm font-medium text-[#16a34a]"
            >
              <ReloadOutlined />
              Refresh
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-7 grid grid-cols-3 gap-4">
          {stats.map((item, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border border-[#edf0f2] px-5 py-4 ${item.lightBg}`}
            >
              {/* <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full blur-3xl opacity-40 ${item.glowBg}`} /> */}

              <div className="relative flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-[18px] ${item.bg} ${item.iconColor}`}
                >
                  {item.icon}
                </div>

                <div>
                  <p className="text-[13px] font-medium text-[#6b7280]">{item.title}</p>

                  <h2 className="text-[24px] font-bold leading-none text-[#111827]">{item.value}</h2>

                  <p className={`mt-1 text-[11px] font-medium ${item.subColor}`}>{item.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="mt-7 grid grid-cols-[2fr_1.2fr_1fr] gap-5">
          {/* Line Chart */}
          <div className="rounded-2xl border border-[#edf0f2] bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#111827]">Order Processing Timeline</h3>

              <select className="rounded-lg border border-[#e5e7eb] px-2 py-1 text-xs outline-none">
                <option>Daily</option>
              </select>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />

                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />

                  <Tooltip />

                  <Line type="monotone" dataKey="received" stroke="#60a5fa" strokeWidth={3} dot={false} />

                  <Line type="monotone" dataKey="shipped" stroke="#22c55e" strokeWidth={3} dot={false} />

                  <Line type="monotone" dataKey="delivered" stroke="#a78bfa" strokeWidth={3} dot={false} />

                  <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="rounded-2xl border border-[#edf0f2] bg-white p-5">
            <h3 className="text-[15px] font-semibold text-[#111827]">Order Status Breakdown</h3>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="relative h-[250px] w-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={65} outerRadius={90} paddingAngle={2}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <span className="text-[28px] font-bold text-[#111827]">5,482</span>

                  <span className="text-xs text-[#6b7280]">Total Orders</span>
                </div>
              </div>

              <div className="space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-[5px] h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />

                    <div>
                      <p className="text-xs font-medium text-[#111827] mb-1">{item.name}</p>

                      <p className="text-[11px] text-[#6b7280]">{item.value} Orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-2xl border border-[#edf0f2] bg-white p-5">
            <h3 className="text-[15px] font-semibold text-[#111827]">Order Insights</h3>

            <div className="mt-5 space-y-2">
              {insights.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${item.bg}`}>
                    {item.icon}
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-[#111827] mb-1">{item.title}</p>

                    <p className="mt-1 text-[11px] leading-5 text-[#6b7280]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="mt-3 text-sm font-medium text-[#3b82f6] hover:text-[#2563eb]">
              View All Insights →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderProcessing;
