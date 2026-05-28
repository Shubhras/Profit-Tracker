import React from 'react';
import {
  InfoCircleFilled,
  SyncOutlined,
  // ReloadOutlined,
  FilterOutlined,
  AppstoreOutlined,
  SearchOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleFilled,
  DropboxOutlined,
} from '@ant-design/icons';

function Inventory() {
  const stats = [
    {
      title: 'Total SKUs',
      value: '2,845',
      sub: 'Active SKUs',
      icon: <DropboxOutlined />,
      bg: 'bg-[#eef4ff]',
      iconColor: 'text-[#2563eb]',
      subColor: 'text-[#16a34a]',
      lightBg: 'bg-[#f8fbff]',
      glowBg: 'bg-[#bfdbfe]',
    },
    {
      title: 'Total Synced',
      value: '2,512',
      sub: '88.31% of total SKUs',
      icon: <SyncOutlined />,
      bg: 'bg-[#ecfdf3]',
      iconColor: 'text-[#16a34a]',
      subColor: 'text-[#16a34a]',
      lightBg: 'bg-[#f6fef9]',
      glowBg: 'bg-[#bbf7d0]',
    },
    {
      title: 'Pending Sync',
      value: '162',
      sub: '5.69% of total SKUs',
      icon: <ClockCircleFilled />,
      bg: 'bg-[#fff7ed]',
      iconColor: 'text-[#f59e0b]',
      subColor: 'text-[#f97316]',
      lightBg: 'bg-[#fffaf5]',
      glowBg: 'bg-[#fed7aa]',
    },
    {
      title: 'Failed Sync',
      value: '171',
      sub: '6.00% of total SKUs',
      icon: <CloseCircleFilled />,
      bg: 'bg-[#fef2f2]',
      iconColor: 'text-[#ef4444]',
      subColor: 'text-[#ef4444]',
      lightBg: 'bg-[#fff7f7]',
      glowBg: 'bg-[#fecaca]',
    },
    {
      title: 'Success Rate',
      value: '94.00%',
      sub: '+3.25%',
      icon: <CheckCircleFilled />,
      bg: 'bg-[#f5f3ff]',
      iconColor: 'text-[#8b5cf6]',
      subColor: 'text-[#16a34a]',
      lightBg: 'bg-[#faf7ff]',
      glowBg: 'bg-[#ddd6fe]',
    },
  ];

  const tableData = [
    {
      sku: 'TS-KT-2-BLK',
      title: 'Top Selling Kt-2 Black',
      marketplace: 'Amazon',
      channel: 'INR',
      mapped: 'BOD12345ABC',
      qty: 450,
      synced: '31 May 2026, 08:45 AM',
      status: 'Synced',
      message: 'Inventory updated successfully',
    },
    {
      sku: 'TS-KT-WHT',
      title: 'Top Selling - KT White',
      marketplace: 'Amazon',
      channel: 'INR',
      mapped: 'BOD12345ABD',
      qty: 25,
      synced: '31 May 2026, 08:43 AM',
      status: 'Synced',
      message: 'Inventory updated successfully',
    },
    {
      sku: 'NL-SIZZ-AT',
      title: 'New List - Sizzlers Tray',
      marketplace: 'Flipkart',
      channel: 'INR',
      mapped: 'BOD12345ABE',
      qty: 60,
      synced: '31 May 2026, 08:42 AM',
      status: 'Pending',
      message: 'Sync in progress',
    },
    {
      sku: 'NPA-APR',
      title: 'non potential ad',
      marketplace: 'Meesho',
      channel: 'INR',
      mapped: 'BOD12345ABF',
      qty: 0,
      synced: '31 May 2026, 08:40 AM',
      status: 'Failed',
      message: 'Inventory limit exceeded',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-3 px-2 text-[12px]">
      <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-3 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-[#111827] mb-1">Inventory Sync</h1>

              <InfoCircleFilled className="text-[#94a3b8] text-[13px]" />
            </div>

            <p className="mt-[2px] text-[12px] leading-[18px] text-[#6b7280]">
              Sync inventory across all marketplaces in real-time. View sync status, success, failed and pending counts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#6b7280]">Last Sync: 31 May 2026, 08:45 AM</span>

            <button
              type="button"
              className="flex items-center gap-2 rounded-l bg-[#16a34a] px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-[#15803d]"
            >
              <SyncOutlined className="text-[11px]" />
              Sync All Marketplaces
            </button>
          </div>
        </div>

        {/* Top Cards */}
        <div className="mt-1 grid grid-cols-5 gap-3">
          {stats.map((item, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl border border-[#edf0f2] px-3 py-3 ${item.lightBg}`}
            >
              {/* Glow */}
              <div className={`absolute -right-6 -top-6 h-16 w-16 rounded-full blur-3xl opacity-40 ${item.glowBg}`} />

              <div className="relative flex items-center gap-2">
                {/* Icon */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[15px] ${item.bg} ${item.iconColor}`}
                >
                  {item.icon}
                </div>

                {/* Content */}
                <div>
                  <p className="mb-[1px] text-[11px] font-medium text-[#6b7280]">{item.title}</p>

                  <h2 className="text-[20px] font-bold leading-none text-[#111827]">{item.value}</h2>

                  <p className={`mt-[2px] text-[10px] font-medium ${item.subColor}`}>{item.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <select className="rounded-xl border border-[#e5e7eb] px-3 py-1 text-[10px] outline-none">
              <option>All Marketplaces</option>
            </select>

            <select className="rounded-xl border border-[#e5e7eb] px-3 py-1 text-[10px] outline-none">
              <option>All Channels</option>
            </select>

            <select className="rounded-xl border border-[#e5e7eb] px-3 py-1 text-[10px] outline-none">
              <option>All Status</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by SKU, Title, ASIN..."
                className="w-[240px] rounded-xl border border-[#e5e7eb] py-1 pl-3 pr-9 text-[11px] outline-none"
              />

              <SearchOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#94a3b8]" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3 py-1 text-[10px] font-medium text-[#374151]"
            >
              <FilterOutlined className="text-[11px]" />
              Filters
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] px-3 py-1 text-[10px] font-medium text-[#374151]"
            >
              <AppstoreOutlined className="text-[11px]" />
              Columns
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="mt-2 overflow-hidden rounded-2xl border border-[#edf0f2]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-[#fafafa]">
                <tr className="border-b border-[#edf0f2]">
                  {[
                    'Master SKU',
                    'SKU Title',
                    'Marketplace',
                    'Channels',
                    'Mapped SKU',
                    'Available Qty',
                    'Last Synced',
                    'Sync Status',
                    'Sync Message',
                    'Action',
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
                {tableData.map((row, index) => (
                  <tr key={index} className="border-b border-[#f1f5f9] hover:bg-[#fafafa]">
                    <td className="whitespace-nowrap px-3 py-2 text-[11px] font-medium text-[#111827]">{row.sku}</td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[#374151]">{row.title}</td>

                    <td className="px-3 py-2 text-[11px]">{row.marketplace}</td>

                    <td className="px-3 py-2">
                      <span className="rounded-full bg-[#eef2ff] px-2 py-[3px] text-[10px] font-medium text-[#4f46e5]">
                        {row.channel}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-[11px] text-[#374151]">{row.mapped}</td>

                    <td className="px-3 py-2 text-[11px] font-medium text-[#111827]">{row.qty}</td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[#374151]">{row.synced}</td>

                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-[3px] text-[10px] font-medium ${
                          row.status === 'Synced'
                            ? 'bg-[#ecfdf3] text-[#16a34a]'
                            : row.status === 'Pending'
                            ? 'bg-[#fff7ed] text-[#f59e0b]'
                            : 'bg-[#fef2f2] text-[#ef4444]'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[#6b7280]">{row.message}</td>

                    <td className="px-3 py-2 text-[#94a3b8] text-[14px]">⋮</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[#edf0f2] px-3 py-2">
            <p className="text-[10px] text-[#6b7280]">Showing 1 to 10 of 2,845 entries</p>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] ${
                    page === 1 ? 'bg-[#dcfce7] text-[#16a34a]' : 'border border-[#e5e7eb] text-[#374151]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <select className="rounded-md border border-[#e5e7eb] px-2 py-1 text-[10px] outline-none">
              <option>10 / page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
