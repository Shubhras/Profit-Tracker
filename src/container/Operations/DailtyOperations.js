import React from 'react';

import {
  InfoCircleOutlined,
  ClockCircleOutlined,
  ShoppingCartOutlined,
  DropboxOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  // FileSearchOutlined,
  // CloseCircleOutlined,
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
    <div className="min-h-screen bg-[#f8fafc] py-3 px-3">
      {/* HEADER */}
      <div className="mb-2 flex items-start justify-between lg:flex-col lg:gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] md:text-[18px] sm:text-[16px] font-bold mb-0">Daily Operations Dashboard</h1>

            <InfoCircleOutlined className="mb-[1px] text-[12px] text-[#9ca3af]" />
          </div>

          <p className="text-[11px] leading-[17px] text-[#6b7280]">
            Process orders, sync inventory and manage auto claims across all marketplaces in one place.
          </p>
        </div>

        <div className="flex items-center gap-3 lg:w-full lg:flex-col lg:items-start">
          <div className="flex items-center gap-2 text-[10px] text-[#6b7280]">
            <ClockCircleOutlined className="text-[10px]" />

            <span>Last Updated: 31 May 2026, 09:00 AM</span>
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-[#16a34a] px-4 py-2 text-[11px] font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#15803d] lg:w-full lg:justify-center"
          >
            <ArrowRightOutlined className="text-[10px]" />
            Run Daily Operations
          </button>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-12 gap-3">
        {/* SUMMARY CARDS */}
        {summaryCards.map((item, index) => (
          <div
            key={index}
            className="col-span-3 lg:col-span-6 md:col-span-12 flex min-h-[165px] flex-col rounded-2xl border border-[#e5e7eb] p-3"
            style={{
              background: item.bg,
            }}
          >
            {/* TOP */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                {/* ICON */}
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-[17px]"
                  style={{
                    background: item.bg,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>

                {/* CONTENT */}
                <div className="flex flex-1 items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold leading-[15px] text-[#374151]">{item.title}</p>

                    <h2 className="mt-[2px] text-[19px] font-bold leading-none text-[#111827]">{item.value}</h2>

                    <p className="mt-[1px] text-[11px] text-[#9ca3af]">{item.sub}</p>

                    <p className="mt-2 text-[11px] font-semibold text-[#16a34a]">{item.growth}</p>
                  </div>

                  {/* STATUS ICON */}
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full"
                    style={{
                      background: item.bg,
                      color: item.color,
                    }}
                  >
                    <CheckCircleOutlined className="text-[11px]" />
                  </div>
                </div>
              </div>
            </div>

            {/* LINK */}
            <button
              type="button"
              className="mt-2 flex items-center gap-1 text-[11px] font-semibold"
              style={{
                color: item.color,
              }}
            >
              {item.link}

              <ArrowRightOutlined className="text-[10px]" />
            </button>
          </div>
        ))}

        {/* OPERATION STATUS */}
        <div className="col-span-3 lg:col-span-6 md:col-span-12 flex min-h-[165px] flex-col rounded-2xl border border-[#e5e7eb] bg-white p-3">
          {/* TOP */}
          <div className="flex-1">
            {/* HEADER */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[13px] font-semibold text-[#92400e]">Operations Status</h2>

                <h3 className="mt-1 text-[17px] font-bold text-[#16a34a] mb-0">Completed</h3>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff7ed] text-[#f97316]">
                <CheckCircleOutlined className="text-[14px]" />
              </div>
            </div>

            {/* STATUS LIST */}
            <div className="mt-2 space-y-1">
              {['Order Processing', 'Inventory Sync', 'Auto Claims'].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-[11px] text-[#16a34a]" />

                    <span className="text-[11px] font-medium text-[#374151]">{item}</span>
                  </div>

                  <span className="rounded-md border border-[#dcfce7] bg-[#f0fdf4] px-2 py-[3px] text-[9px] font-semibold text-[#16a34a]">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <button type="button" className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#f97316]">
            View Logs
            <ArrowRightOutlined className="text-[10px]" />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-4 flex items-center gap-6 overflow-x-auto border-b border-[#e5e7eb] whitespace-nowrap">
        {' '}
        {['Order', 'Inventory Sync', 'Auto Claims'].map((item, index) => (
          <button
            type="button"
            key={index}
            className={`border-b-2 pb-2 text-[13px] font-medium ${
              index === 0 ? 'border-[#16a34a] text-[#16a34a]' : 'border-transparent text-[#6b7280]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* TABLE SECTION */}
      <div className="mt-3 grid grid-cols-12 gap-3">
        {/* ORDER TABLE */}
        <div className="col-span-6 lg:col-span-12 rounded-2xl border border-[#e5e7eb] bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#111827]">Order Summary by Marketplace</h2>

              <InfoCircleOutlined className="text-[11px] text-[#9ca3af]" />
            </div>

            <select className="rounded-lg border border-[#e5e7eb] px-2 py-1 text-[10px] outline-none">
              <option>Today</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[750px] w-full border-collapse">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {['Marketplace', 'New', 'Processed', 'Shipped', 'Cancelled', 'Pending', 'Total'].map(
                    (head, index) => (
                      <th key={index} className="pb-2 text-left text-[11px] font-semibold text-[#6b7280]">
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {orderTable.map((row, index) => (
                  <tr key={index} className="border-b border-[#f9fafb]">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img src={row.logo} alt={row.marketplace} className="h-4 w-4 object-contain" />

                        <span className="text-[11px] font-medium text-[#111827]">{row.marketplace}</span>
                      </div>
                    </td>

                    <td className="text-[11px] text-[#374151]">{row.newOrders}</td>

                    <td className="text-[11px] text-[#374151]">{row.processed}</td>

                    <td className="text-[11px] text-[#374151]">{row.shipped}</td>

                    <td className="text-[11px] text-[#374151]">{row.cancelled}</td>

                    <td className="text-[11px] text-[#374151]">{row.pending}</td>

                    <td className="text-[11px] font-semibold text-[#111827]">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="mt-4 flex items-center gap-1 text-[11px] font-medium text-[#2563eb]">
            View all orders
            <ArrowRightOutlined className="text-[10px]" />
          </button>
        </div>

        {/* INVENTORY TABLE */}
        <div className="col-span-6 lg:col-span-12 rounded-2xl border border-[#e5e7eb] bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#111827]">Inventory Sync Summary</h2>

              <InfoCircleOutlined className="text-[11px] text-[#9ca3af]" />
            </div>

            <select className="rounded-lg border border-[#e5e7eb] px-2 py-1 text-[10px] outline-none">
              <option>Today</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  {['Marketplace', 'Total', 'Updated', 'Success', 'Failed', 'Not Changed', 'Last Sync'].map(
                    (head, index) => (
                      <th key={index} className="pb-2 text-left text-[11px] font-semibold text-[#6b7280]">
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {inventoryTable.map((row, index) => (
                  <tr key={index} className="border-b border-[#f9fafb]">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img src={row.logo} alt={row.marketplace} className="h-4 w-4 object-contain" />

                        <span className="text-[11px] font-medium text-[#111827]">{row.marketplace}</span>
                      </div>
                    </td>

                    <td className="text-[11px] text-[#374151]">{row.totalSkus}</td>

                    <td className="text-[11px] text-[#374151]">{row.updated}</td>

                    <td className="text-[11px] font-medium text-[#16a34a]">{row.success}</td>

                    <td className="text-[11px] text-[#ef4444]">{row.failed}</td>

                    <td className="text-[11px] text-[#374151]">{row.notChanged}</td>

                    <td className="text-[10px] text-[#6b7280]">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" className="mt-4 flex items-center gap-1 text-[11px] font-medium text-[#2563eb]">
            View inventory sync logs
            <ArrowRightOutlined className="text-[10px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DailtyOperations;
