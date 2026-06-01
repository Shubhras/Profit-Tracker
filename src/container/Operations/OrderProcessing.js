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
  MoreOutlined,
  FilterOutlined,
  EyeOutlined,
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

import amazon from '../../assets/icons/amazon.svg';
import flipkart from '../../assets/icons/flipkart.png';
import myntra from '../../assets/icons/myntra.png';
import meesho from '../../assets/icons/meesho.png';
import nykaa from '../../assets/icons/nykaa.png';

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
  const ordersData = [
    {
      orderId: '405-1001925-654789',
      marketplace: 'Amazon',
      channel: 'Amazon.in',
      orderDate: '31 May 2026',
      customer: 'Rahul Sharma',
      product: 'Top Selling T-Shirt Black',
      status: 'Delivered',
      value: '1,299',
      shipBy: '02 Jun 2026',
      delivery: '04 Jun 2026',
    },

    {
      orderId: '405-2112845-778912',
      marketplace: 'Flipkart',
      channel: 'Flipkart',
      orderDate: '31 May 2026',
      customer: 'Neha Verma',
      product: 'Sports Shoes',
      status: 'Shipped',
      value: '849',
      shipBy: '01 Jun 2026',
      delivery: '-',
    },

    {
      orderId: '406-3123456-889024',
      marketplace: 'Myntra',
      channel: 'Myntra',
      orderDate: '30 May 2026',
      customer: 'Amit Singh',
      product: 'New List Sneakers',
      status: 'Pending',
      value: '1,599',
      shipBy: '02 Jun 2026',
      delivery: '-',
    },

    {
      orderId: '407-4123456-901236',
      marketplace: 'Meesho',
      channel: 'Meesho',
      orderDate: '30 May 2026',
      customer: 'Pooja Mehta',
      product: 'Printed Kurti',
      status: 'Cancelled',
      value: '699',
      shipBy: '-',
      delivery: '-',
    },

    {
      orderId: '408-5123456-102346',
      marketplace: 'Amazon',
      channel: 'Amazon.in',
      orderDate: '29 May 2026',
      customer: 'Vikram Patel',
      product: 'All New Mixer',
      status: 'Delivered',
      value: '2,199',
      shipBy: '31 May 2026',
      delivery: '02 Jun 2026',
    },

    {
      orderId: '409-6123456-113457',
      marketplace: 'Flipkart',
      channel: 'Flipkart',
      orderDate: '29 May 2026',
      customer: 'Sneha Iyer',
      product: 'Combo T-Shirt',
      status: 'Shipped',
      value: '949',
      shipBy: '31 May 2026',
      delivery: '01 Jun 2026',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-3 px-3">
      <div className="shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold mb-0">Order Processing</h1>

              <InfoCircleFilled className="text-[#94a3b8] text-[13px]" />
            </div>

            <p className="mt-[2px] text-[13px] leading-[18px] text-[#6b7280]">
              Track and manage the complete order lifecycle across all your marketplaces.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select className="rounded-l border border-[#e5e7eb] px-3 py-1 text-[11px] outline-none">
              <option>All Marketplaces</option>
            </select>

            <select className="rounded-l border border-[#e5e7eb] px-3 py-1 text-[11px] outline-none">
              <option>All Channels</option>
            </select>

            <button
              type="button"
              className="flex items-center gap-2 rounded-l bg-[#ecfdf3] px-3 py-1 text-[11px] font-medium text-[#16a34a]"
            >
              <ReloadOutlined className="text-[11px]" />
              Refresh
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-2 grid grid-cols-6 gap-2">
          {stats.map((item, index) => (
            <div key={index} className="rounded-xl border border-[#edf0f2] px-2 py-3 bg-white">
              <div className="flex items-center gap-2">
                {/* Icon */}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] ${item.bg} ${item.iconColor}`}
                >
                  {item.icon}
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <p className="text-[11px] leading-[11px] font-medium text-[#6b7280] truncate">{item.title}</p>

                  <h2 className="mt-[1px] text-[16px] font-bold leading-none text-[#111827]">{item.value}</h2>

                  <p className={`mt-[1px] text-[11px] leading-none font-medium ${item.subColor}`}>{item.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="mt-2 grid grid-cols-[2fr_1.2fr_1fr] gap-2">
          {/* Line Chart */}
          <div className="rounded-2xl border border-[#edf0f2] bg-white p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#111827]">Order Processing Timeline</h3>

              <select className="rounded-lg border border-[#e5e7eb] px-2 py-1 text-[10px] outline-none">
                <option>Daily</option>
              </select>
            </div>

            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />

                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />

                  <Tooltip />

                  <Line type="monotone" dataKey="received" stroke="#60a5fa" strokeWidth={2} dot={false} />

                  <Line type="monotone" dataKey="shipped" stroke="#22c55e" strokeWidth={2} dot={false} />

                  <Line type="monotone" dataKey="delivered" stroke="#a78bfa" strokeWidth={2} dot={false} />

                  <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="rounded-2xl border border-[#edf0f2] bg-white p-3">
            <h3 className="text-[15px] font-semibold text-[#111827]">Order Status Breakdown</h3>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="relative h-[220px] w-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={58} outerRadius={82} paddingAngle={2}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <span className="text-[22px] font-bold text-[#111827]">5,482</span>

                  <span className="text-[10px] text-[#6b7280]">Total Orders</span>
                </div>
              </div>

              <div className="space-y-2">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-[5px] h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />

                    <div>
                      <p className="text-[11px] font-medium text-[#111827] mb-[2px]">{item.name}</p>

                      <p className="text-[10px] text-[#6b7280]">{item.value} Orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="rounded-2xl border border-[#edf0f2] bg-white p-3">
            <h3 className="text-[15px] font-semibold text-[#111827]">Order Insights</h3>

            <div className="mt-2 space-y-2">
              {insights.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-[14px] ${item.bg}`}>
                    {item.icon}
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#111827] mb-[1px]">{item.title}</p>

                    <p className="text-[10px] leading-[16px] text-[#6b7280]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="mt-3 text-[11px] font-medium text-[#3b82f6] hover:text-[#2563eb]">
              View All Insights →
            </button>
          </div>
        </div>

        {/* Marketplace Overview */}
        <div className="mt-2 rounded-2xl border border-[#edf0f2] bg-white px-3 py-2">
          {/* Heading */}
          <div className="mb-2 flex items-center gap-1">
            <h3 className="text-[15px] font-semibold text-[#111827]">Marketplace Overview</h3>

            {/* <InfoCircleFilled className="text-[10px] text-[#94a3b8]" /> */}
          </div>

          {/* Marketplace Cards */}
          <div className="grid grid-cols-6 gap-2">
            {[
              {
                name: 'All Marketplaces',
                value: '5,482',
                icon: null,
                active: true,
              },
              {
                name: 'Amazon',
                value: '2,845',
                icon: amazon,
              },
              {
                name: 'Flipkart',
                value: '1,358',
                icon: flipkart,
              },
              {
                name: 'Myntra',
                value: '756',
                icon: myntra,
              },
              {
                name: 'Meesho',
                value: '318',
                icon: meesho,
              },
              {
                name: 'Nykaa',
                value: '125',
                icon: nykaa,
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`rounded-lg border px-3 py-2 ${
                  item.active ? 'border-[#bbf7d0] bg-[#f0fdf4]' : 'border-[#edf0f2] bg-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {item.icon && <img src={item.icon} alt={item.name} className="h-5 w-5 object-contain" />}

                  <p className="text-[11px] mb-1 font-medium text-[#6b7280]">{item.name}</p>
                </div>

                <h2 className="mt-[2px] text-[14px] font-bold leading-none text-[#111827]">{item.value}</h2>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom Table Section */}
        <div className="mt-2 rounded-2xl border border-[#edf0f2] bg-white">
          {/* Top Filters */}
          <div className="flex items-center justify-between border-b border-[#edf0f2] px-3 py-2">
            <div className="flex items-center gap-2">
              <select className="rounded-md border border-[#e5e7eb] px-2 py-[5px] text-[10px] font-medium text-[#374151] outline-none">
                <option>Marketplace Wise</option>
              </select>

              <select className="rounded-md border border-[#e5e7eb] px-2 py-[5px] text-[10px] font-medium text-[#374151] outline-none">
                <option>SKU Wise</option>
              </select>

              <button
                type="button"
                className="flex items-center gap-1 rounded-md border border-[#e5e7eb] px-2 py-[5px] text-[10px] font-medium text-[#374151]"
              >
                <FilterOutlined className="text-[10px]" />
                Filters
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-md bg-[#16a34a] px-3 py-[6px] text-[10px] font-semibold text-white"
              >
                One Click Order Processing
              </button>

              <button
                type="button"
                className="rounded-md border border-[#e5e7eb] px-3 py-[6px] text-[10px] font-medium text-[#374151]"
              >
                Print / Mark & Dispatch
              </button>

              <button
                type="button"
                className="rounded-md border border-[#e5e7eb] px-3 py-[6px] text-[10px] font-medium text-[#374151]"
              >
                Export
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-[#edf0f2] bg-[#fafafa]">
                  {[
                    'Order ID',
                    'Marketplace',
                    'Channel',
                    'Order Date',
                    'Customer',
                    'ASN / Product',
                    'Order Status',
                    'Order Value',
                    'Ship By',
                    'Delivery',
                    'Actions',
                  ].map((head, index) => (
                    <th
                      key={index}
                      className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold text-[#6b7280]"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {ordersData.map((item, index) => (
                  <tr key={index} className="border-b border-[#f1f5f9] hover:bg-[#fafafa]">
                    <td className="whitespace-nowrap px-3 py-2 text-[11px] font-medium text-[#374151]">
                      {item.orderId}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] font-medium text-[#111827]">
                      {item.marketplace}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[#6b7280]">{item.channel}</td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[#6b7280]">{item.orderDate}</td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] font-medium text-[#111827]">
                      {item.customer}
                    </td>

                    <td className="min-w-[170px] px-3 py-2 text-[11px] text-[#374151]">{item.product}</td>

                    <td className="whitespace-nowrap px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-[3px] text-[11px] font-semibold ${
                          item.status === 'Delivered'
                            ? 'bg-[#ecfdf3] text-[#16a34a]'
                            : item.status === 'Shipped'
                            ? 'bg-[#eff6ff] text-[#2563eb]'
                            : item.status === 'Pending'
                            ? 'bg-[#fff7ed] text-[#ea580c]'
                            : 'bg-[#fef2f2] text-[#dc2626]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] font-medium text-[#111827]">
                      ₹{item.value}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[#6b7280]">{item.shipBy}</td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[#6b7280]">{item.delivery}</td>

                    <td className="whitespace-nowrap px-3 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded-md border border-[#e5e7eb] p-[4px] text-[#6b7280] hover:bg-[#f8fafc]"
                        >
                          <EyeOutlined className="text-[11px]" />
                        </button>

                        <button
                          type="button"
                          className="rounded-md border border-[#e5e7eb] p-[4px] text-[#6b7280] hover:bg-[#f8fafc]"
                        >
                          <MoreOutlined className="text-[11px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-[9px] text-[#6b7280]">Showing 1 to 10 of 5,482 entries</p>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`flex h-5 w-5 items-center justify-center rounded-md text-[9px] font-medium ${
                    page === 1 ? 'bg-[#ecfdf3] text-[#16a34a]' : 'text-[#6b7280]'
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

export default OrderProcessing;
