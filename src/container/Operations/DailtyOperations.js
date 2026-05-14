import React from 'react';

import {
  InfoCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  DropboxOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  FileSearchOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import Amazon from '../../assets/icons/amazon.svg';
import Flipkart from '../../assets/icons/flipkart.svg';
import Meesho from '../../assets/icons/meesho.png';
import Myntra from '../../assets/icons/myntra.png';
import Others from '../../assets/icons/others.png';

function DailtyOperations() {
  const summaryCards = [
    {
      title: 'Orders Processed',
      value: '1,248',
      sub: 'Orders',
      growth: '+12.35% vs yesterday',
      color: '#2563eb',
      bg: '#eff6ff',
      icon: <ShoppingCartOutlined />,
      link: 'View Orders',
    },
    {
      title: 'Inventory Synced',
      value: '18,560',
      sub: 'SKUs Updated',
      growth: '+8.42% vs yesterday',
      color: '#16a34a',
      bg: '#ecfdf5',
      icon: <DropboxOutlined />,
      link: 'View Inventory',
    },
    {
      title: 'Auto Claims Processed',
      value: '325',
      sub: 'Claims',
      growth: '+6.18% vs yesterday',
      color: '#7c3aed',
      bg: '#faf5ff',
      icon: <SafetyCertificateOutlined />,
      link: 'View Claims',
    },
  ];

  const orderTable = [
    {
      marketplace: 'Amazon',
      logo: Amazon,
      newOrders: 528,
      processed: 504,
      shipped: 462,
      cancelled: 12,
      pending: 24,
      total: 528,
    },
    {
      marketplace: 'Flipkart',
      logo: Flipkart,
      newOrders: 268,
      processed: 252,
      shipped: 235,
      cancelled: 8,
      pending: 25,
      total: 268,
    },
    {
      marketplace: 'Meesho',
      logo: Meesho,
      newOrders: 192,
      processed: 184,
      shipped: 170,
      cancelled: 6,
      pending: 22,
      total: 192,
    },
    {
      marketplace: 'Myntra',
      logo: Myntra,
      newOrders: 88,
      processed: 84,
      shipped: 80,
      cancelled: 2,
      pending: 6,
      total: 88,
    },
    {
      marketplace: 'Others',
      logo: Others,
      newOrders: 172,
      processed: 160,
      shipped: 150,
      cancelled: 6,
      pending: 16,
      total: 172,
    },
  ];

  const inventoryTable = [
    {
      marketplace: 'Amazon',
      logo: Amazon,
      totalSkus: '8,245',
      updated: '7,856',
      success: '7,623',
      failed: '112',
      notChanged: '121',
      time: '31 May, 08:45 AM',
    },
    {
      marketplace: 'Flipkart',
      logo: Flipkart,
      totalSkus: '3,642',
      updated: '3,412',
      success: '3,298',
      failed: '56',
      notChanged: '58',
      time: '31 May, 08:45 AM',
    },
    {
      marketplace: 'Meesho',
      logo: Meesho,
      totalSkus: '2,950',
      updated: '2,745',
      success: '2,668',
      failed: '40',
      notChanged: '37',
      time: '31 May, 08:45 AM',
    },
    {
      marketplace: 'Myntra',
      logo: Myntra,
      totalSkus: '1,205',
      updated: '1,103',
      success: '1,062',
      failed: '18',
      notChanged: '23',
      time: '31 May, 08:45 AM',
    },
    {
      marketplace: 'Others',
      logo: Others,
      totalSkus: '2,510',
      updated: '2,321',
      success: '2,245',
      failed: '35',
      notChanged: '41',
      time: '31 May, 08:45 AM',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-5">
      {/* HEADER */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-semibold text-[#111827]">Daily Operations Dashboard</h1>

            <InfoCircleOutlined className="text-[#9ca3af] mb-2" />
          </div>

          <p className="text-sm text-[#6b7280]">
            Process orders, sync inventory and manage auto claims across all marketplaces in one place.
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-xs text-[#6b7280]">
            <ClockCircleOutlined />

            <span>Last Updated: 31 May 2026, 09:00 AM</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-[#16a34a] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#15803d]"
          >
            <ArrowRightOutlined />
            Run Daily Operations (All in One)
          </button>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-12 gap-4">
        {/* SUMMARY CARDS */}
        {summaryCards.map((item, index) => (
          <div
            key={index}
            className="col-span-3 flex min-h-[235px] flex-col rounded-2xl border border-[#e5e7eb] p-5"
            style={{
              background: item.bg,
            }}
          >
            {/* TOP CONTENT */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {/* LEFT ICON */}
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-[26px]"
                  style={{
                    background: item.bg,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>

                {/* RIGHT CONTENT */}
                <div className="flex flex-1 items-start justify-between">
                  <div>
                    {/* TITLE */}
                    <p className="text-[15px] font-semibold text-[#374151]">{item.title}</p>

                    {/* VALUE */}
                    <h2 className="mt-2 text-[28px] font-bold leading-none text-[#111827]">{item.value}</h2>

                    {/* SUB TEXT */}
                    <p className="mt-2 text-[13px] text-[#9ca3af]">{item.sub}</p>

                    {/* GROWTH */}
                    <p className="mt-3 text-[12px] font-semibold text-[#16a34a]">{item.growth}</p>
                  </div>

                  {/* TOP RIGHT ICON */}
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      background: item.bg,
                      color: item.color,
                    }}
                  >
                    <CheckCircleOutlined className="text-[14px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM LINK */}
            <button
              type="button"
              className="mt-auto flex items-center gap-2 text-[14px] font-semibold"
              style={{
                color: item.color,
              }}
            >
              {item.link}

              <ArrowRightOutlined className="text-[12px]" />
            </button>
          </div>
        ))}

        {/* OPERATION STATUS */}
        <div className="col-span-3 flex min-h-[235px] flex-col rounded-2xl border border-[#e5e7eb] bg-white p-5">
          {/* TOP CONTENT */}
          <div className="flex-1">
            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[16px] font-semibold text-[#92400e]">Operations Status</h2>

                <h3 className="mt-2 text-[28px] font-bold text-[#16a34a]">Completed</h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff7ed] text-[#f97316]">
                <CheckCircleOutlined className="text-[18px]" />
              </div>
            </div>

            {/* STATUS LIST */}
            <div className="space-y-3">
              {['Order Processing', 'Inventory Sync', 'Auto Claims'].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-[#16a34a]" />

                    <span className="text-[13px] font-medium text-[#374151]">{item}</span>
                  </div>

                  <span className="rounded-md border border-[#dcfce7] bg-[#f0fdf4] px-3 py-[5px] text-[11px] font-semibold text-[#16a34a]">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER BUTTON */}
          <button type="button" className="mt-auto flex items-center gap-2 text-[13px] font-semibold text-[#f97316]">
            View Logs
            <ArrowRightOutlined className="text-[12px]" />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-6 flex items-center gap-8 border-b border-[#e5e7eb]">
        {['Order', 'Inventory Sync', 'Auto Claims'].map((item, index) => (
          <button
            type="button"
            key={index}
            className={`border-b-2 pb-3 text-sm font-medium ${
              index === 0 ? 'border-[#16a34a] text-[#16a34a]' : 'border-transparent text-[#6b7280]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="mt-5 grid grid-cols-12 gap-4">
        {/* ORDER TABLE */}
        <div className="col-span-6 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold text-[#111827]">Order Summary by Marketplace</h2>
              <InfoCircleOutlined className="text-[#9ca3af] mb-2" />
            </div>
            <select className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none">
              <option>Today</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {['Marketplace', 'New Orders', 'Processed', 'Shipped', 'Cancelled', 'Pending', 'Total Orders'].map(
                    (head, index) => (
                      <th key={index} className="pb-3 text-left text-[11px] font-semibold text-[#6b7280]">
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {orderTable.map((row, index) => (
                  <tr key={index} className="border-b border-[#f9fafb]">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={row.logo} alt={row.marketplace} className="h-5 w-5 object-contain" />

                        <span className="text-sm font-medium text-[#111827]">{row.marketplace}</span>
                      </div>
                    </td>

                    <td className="text-sm text-[#374151]">{row.newOrders}</td>

                    <td className="text-sm text-[#374151]">{row.processed}</td>

                    <td className="text-sm text-[#374151]">{row.shipped}</td>

                    <td className="text-sm text-[#374151]">{row.cancelled}</td>

                    <td className="text-sm text-[#374151]">{row.pending}</td>

                    <td className="text-sm font-semibold text-[#111827]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="mt-5 flex items-center gap-2 text-sm font-medium text-[#2563eb]">
            View all orders
            <ArrowRightOutlined />
          </button>
        </div>

        {/* INVENTORY TABLE */}
        <div className="col-span-6 rounded-2xl border border-[#e5e7eb] bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] font-semibold text-[#111827]">Inventory Sync Summary by Marketplace</h2>
              <InfoCircleOutlined className="text-[#9ca3af] mb-2" />
            </div>

            <select className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none">
              <option>Today</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {['Marketplace', 'Total SKUs', 'Updated', 'Success', 'Failed', 'Not Changed', 'Last Sync'].map(
                    (head, index) => (
                      <th key={index} className="pb-3 text-left text-[11px] font-semibold text-[#6b7280]">
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {inventoryTable.map((row, index) => (
                  <tr key={index} className="border-b border-[#f9fafb]">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={row.logo} alt={row.marketplace} className="h-5 w-5 object-contain" />

                        <span className="text-sm font-medium text-[#111827]">{row.marketplace}</span>
                      </div>
                    </td>

                    <td className="text-sm text-[#374151]">{row.totalSkus}</td>

                    <td className="text-sm text-[#374151]">{row.updated}</td>

                    <td className="text-sm font-medium text-[#16a34a]">{row.success}</td>

                    <td className="text-sm text-[#ef4444]">{row.failed}</td>

                    <td className="text-sm text-[#374151]">{row.notChanged}</td>

                    <td className="text-sm text-[#374151]">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="mt-5 flex items-center gap-2 text-sm font-medium text-[#2563eb]">
            View inventory sync logs
            <ArrowRightOutlined />
          </button>
        </div>
      </div>
      {/* THIRD ROW - AUTO CLAIMS SUMMARY */}
      <div className="mt-5 rounded-2xl border border-[#e5e7eb] bg-white p-5">
        {/* HEADER */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-semibold text-[#111827]">Auto Claims Summary</h2>

            <InfoCircleOutlined className="text-[#9ca3af]" />
          </div>

          <select className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm outline-none">
            <option>Today</option>
          </select>
        </div>

        {/* TOP SUMMARY BOXES */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              title: 'Total Claims Found',
              value: '402',
              growth: '+9.31% vs yesterday',
              color: '#16a34a',
              bg: '#ecfdf5',
              icon: <FileSearchOutlined />,
            },
            {
              title: 'Claims Processed',
              value: '325',
              growth: '+6.18% vs yesterday',
              color: '#2563eb',
              bg: '#eff6ff',
              icon: <SafetyCertificateOutlined />,
            },
            {
              title: 'Successful Claims',
              value: '298',
              growth: '+7.02% vs yesterday',
              color: '#f59e0b',
              bg: '#fff7ed',
              icon: <CheckCircleOutlined />,
            },
            {
              title: 'Failed Claims',
              value: '27',
              growth: '-3.57% vs yesterday',
              color: '#ef4444',
              bg: '#fef2f2',
              icon: <CloseCircleOutlined />,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#f3f4f6] p-4"
              style={{
                background: item.bg,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className="text-[15px] font-semibold"
                    style={{
                      color: item.color,
                    }}
                  >
                    {item.title}
                  </p>

                  <h3
                    className="mt-2 text-[28px] font-bold leading-none"
                    style={{
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </h3>
                </div>

                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-[18px]"
                  style={{
                    background: item.bg,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>
              </div>

              <p
                className="text-[13px] font-medium"
                style={{
                  color: item.color,
                }}
              >
                ↑ {item.growth}
              </p>
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse">
            {/* TABLE HEAD */}
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                {[
                  'Marketplace',
                  'Claims Found',
                  'Processed',
                  'Successful',
                  'Failed',
                  'Amount Recovered',
                  'Last Run',
                  '',
                ].map((head, index) => (
                  <th key={index} className="pb-3 text-left text-[13px] font-semibold text-[#111827]">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {[
                {
                  marketplace: 'Amazon',
                  found: '226',
                  processed: '182',
                  success: '168',
                  failed: '14',
                  amount: '₹ 45,230.50',
                },
                {
                  marketplace: 'Flipkart',
                  found: '102',
                  processed: '84',
                  success: '76',
                  failed: '8',
                  amount: '₹ 18,450.20',
                },
                {
                  marketplace: 'Meesho',
                  found: '48',
                  processed: '38',
                  success: '36',
                  failed: '2',
                  amount: '₹ 7,860.75',
                },
                {
                  marketplace: 'Others',
                  found: '26',
                  processed: '21',
                  success: '18',
                  failed: '3',
                  amount: '₹ 3,125.30',
                },
              ].map((row, index) => (
                <tr key={index} className="border-b border-[#f9fafb]">
                  <td className="py-4 text-sm font-medium text-[#111827]">{row.marketplace}</td>

                  <td className="text-sm text-[#374151]">{row.found}</td>

                  <td className="text-sm text-[#374151]">{row.processed}</td>

                  <td className="text-sm font-medium text-[#16a34a]">{row.success}</td>

                  <td className="text-sm text-[#ef4444]">{row.failed}</td>

                  <td className="text-sm font-semibold text-[#111827]">{row.amount}</td>

                  <td className="text-sm text-[#6b7280]">31 May, 08:50 AM</td>

                  <td aria-label="empty-cell">
                    <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                  </td>
                </tr>
              ))}

              {/* TOTAL ROW */}
              <tr className="bg-[#fafafa]">
                <td className="py-4 text-sm font-bold text-[#111827]">Total</td>

                <td className="text-sm font-bold text-[#111827]">402</td>

                <td className="text-sm font-bold text-[#111827]">325</td>

                <td className="text-sm font-bold text-[#16a34a]">298</td>

                <td className="text-sm font-bold text-[#ef4444]">27</td>

                <td className="text-sm font-bold text-[#111827]">₹ 74,666.75</td>

                <td aria-label="empty-cell" />

                <td aria-label="empty-cell" />
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER LINK */}
        <button type="button" className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-[#2563eb]">
          View all claims
          <ArrowRightOutlined className="text-[12px]" />
        </button>
      </div>
    </div>
  );
}

export default DailtyOperations;
