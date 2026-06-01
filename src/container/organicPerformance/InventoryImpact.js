import React from 'react';
import { Input, Table } from 'antd';

import {
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  InboxOutlined,
  WarningOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  EyeOutlined,
} from '@ant-design/icons';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

const stats = [
  {
    title: 'Total SKUs',
    value: '4245',
    growth: '+8.9%',
    icon: <AppstoreOutlined />, // Blue Box
    bg: 'bg-blue-50',
  },
  {
    title: 'Total Inventory Value',
    value: '12,45,680',
    growth: '+12.35%',
    icon: <InboxOutlined />, // Green Inventory Box
    bg: 'bg-green-50',
  },
  {
    title: 'Low Stock SKUs',
    value: '32',
    growth: '-5.88%',
    icon: <WarningOutlined />, // Orange Warning Triangle
    bg: 'bg-orange-50',
  },
  {
    title: 'Out of Stock SKUs',
    value: '14',
    growth: '-12.50%',
    icon: <StopOutlined />, // Red Out of Stock
    bg: 'bg-red-50',
  },
  {
    title: 'At Risk SKUs',
    value: '28',
    growth: '-3.45%',
    icon: <ExclamationCircleOutlined />, // Purple Alert
    bg: 'bg-purple-50',
  },
  {
    title: 'Inventory Turnover',
    value: '4.82',
    growth: '+9.12%',
    icon: <SyncOutlined spin={false} />, // Refresh/Turnover
    bg: 'bg-blue-50',
  },
];
const inventoryTrend = [
  { day: 'May 01', value: 9 },
  { day: 'May 03', value: 9 },
  { day: 'May 05', value: 10.2 },
  { day: 'May 07', value: 8.1 },
  { day: 'May 09', value: 9.1 },
  { day: 'May 11', value: 9.8 },
  { day: 'May 13', value: 10.4 },
  { day: 'May 15', value: 11.1 },
  { day: 'May 17', value: 8.9 },
  { day: 'May 19', value: 10.0 },
  { day: 'May 21', value: 10.3 },
  { day: 'May 23', value: 9.5 },
  { day: 'May 25', value: 10.2 },
  { day: 'May 27', value: 8.8 },
  { day: 'May 29', value: 10.4 },
  { day: 'May 31', value: 11.8 },
];

const inventoryHealthData = [
  {
    name: 'In Stock',
    value: 171,
    percent: '69.80%',
    color: '#22c55e',
  },
  {
    name: 'Low Stock',
    value: 32,
    percent: '13.06%',
    color: '#f97316',
  },
  {
    name: 'Out of Stock',
    value: 14,
    percent: '5.71%',
    color: '#ef4444',
  },
  {
    name: 'At Risk',
    value: 28,
    percent: '11.43%',
    color: '#8b5cf6',
  },
];

const inventoryInsights = [
  {
    title: '32 SKUs are low on stock',
    desc: 'These SKUs may run out of stock soon.',
    color: 'bg-orange-100 text-orange-600',
    icon: '⚠',
  },
  {
    title: '14 SKUs are out of stock',
    desc: 'Restock to avoid revenue loss.',
    color: 'bg-red-100 text-red-600',
    icon: '📦',
  },
  {
    title: '28 SKUs are at risk',
    desc: 'High sales velocity compared to available stock.',
    color: 'bg-purple-100 text-purple-600',
    icon: '!',
  },
  {
    title: 'Inventory value increased by 12.35%',
    desc: 'Total inventory value is up by ₹1,36,420.',
    color: 'bg-green-100 text-green-600',
    icon: '↗',
  },
];

const searchColumns = [
  {
    title: 'SKU',
    dataIndex: 'sku',
    width: 120,
    render: (v) => <span className="text-[11px] font-medium text-[#374151]">{v}</span>,
  },

  {
    title: 'Product Title',
    dataIndex: 'title',
    width: 260,
    render: (v) => <span className="text-[11px] text-[#374151]">{v}</span>,
  },

  {
    title: 'ASIN',
    dataIndex: 'asin',
    width: 140,
    render: (v) => <span className="text-[11px] text-[#64748b]">{v}</span>,
  },

  {
    title: 'Available Qty',
    dataIndex: 'status',
    width: 140,
    align: 'center',

    render: (v) => {
      const styles = {
        stock: 'bg-green-50 text-green-600',
        low: 'bg-orange-50 text-orange-600',
        risk: 'bg-purple-50 text-purple-600',
        out: 'bg-red-50 text-red-600',
      };

      const labels = {
        stock: 'In Stock',
        low: 'Low Stock',
        risk: 'At Risk',
        out: 'Out of Stock',
      };

      return <span className={`px-2 py-1 rounded-full text-[10px] ${styles[v]}`}>{labels[v]}</span>;
    },
  },

  {
    title: 'Sales (30 Days)',
    dataIndex: 'sales',
    width: 120,
    align: 'center',
  },

  {
    title: 'Inventory Value',
    dataIndex: 'value',
    width: 140,
    align: 'center',
  },

  {
    title: 'Action',
    width: 80,
    align: 'center',

    render: () => <EyeOutlined className="text-[#64748b] cursor-pointer" />,
  },
];

const searchData = [
  {
    key: 1,
    sku: 'TS-KT-2-BLK',
    title: 'Top Selling -KT-2 Black',
    asin: 'B0D12345ABC',
    status: 'stock',
    sales: '420',
    value: '₹98,550',
  },

  {
    key: 2,
    sku: 'TS-KT-WHT',
    title: 'Top Selling -KT White',
    asin: 'B0D12345ABD',
    status: 'low',
    sales: '210',
    value: '₹12,375',
  },

  {
    key: 3,
    sku: 'NL-SIZZ-AT',
    title: 'New List - Sizzlers/ Tray-AT',
    asin: 'B0D12345ABE',
    status: 'risk',
    sales: '180',
    value: '₹15,600',
  },

  {
    key: 4,
    sku: 'NPA-APR',
    title: 'non potential ad - April',
    asin: 'B0D12345ABF',
    status: 'out',
    sales: '90',
    value: '₹0',
  },

  {
    key: 5,
    sku: 'ANM-MIX-KT',
    title: 'All New Mix - KT',
    asin: 'B0D12345ABG',
    status: 'stock',
    sales: '310',
    value: '₹67,895',
  },

  {
    key: 6,
    sku: 'COMB-AT-SGL',
    title: 'Comb-AT-Single',
    asin: 'B0D12345ABH',
    status: 'low',
    sales: '18',
    value: '₹9,450',
  },

  {
    key: 7,
    sku: 'COMB-AUTO',
    title: 'Comb ad - auto march end',
    asin: 'B0D12345ABI',
    status: 'risk',
    sales: '40',
    value: '₹11,280',
  },

  {
    key: 8,
    sku: 'AUTO-TOP-MAR',
    title: 'Auto - Top Selling Ad - March',
    asin: 'B0D12345ABJ',
    status: 'stock',
    sales: '520',
    value: '₹1,35,720',
  },

  {
    key: 9,
    sku: 'COMB-SET-KT',
    title: 'Comb Set - KT',
    asin: 'B0D12345ABK',
    status: 'low',
    sales: '22',
    value: '₹6,820',
  },

  {
    key: 10,
    sku: 'SP-TOPPERS-KT',
    title: 'SP- TOPPERS - KT',
    asin: 'B0D12345ABL',
    status: 'stock',
    sales: '230',
    value: '₹54,670',
  },
];

function InventoryImpact() {
  return (
    <div className="space-y-2 mt-3 mb-3 px-2">
      {/* HEADER */}

      <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-[19px] font-bold text-[#111827] mb-0">Inventory Impact</h1>

          <p className="text-[12px] text-[#6b7280]">
            Manage your inventory to avoid stock out and overstock. Track your inventory, active listings, performance
            metrics and plan your business with useful insights based on your sales.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-6 gap-2 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {stats.map((item) => (
          <div key={item.title} className="bg-white border border-[#edf0f2] rounded-xl px-3 py-2 min-h-[78px]">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Fixed height title area */}
                <div className="h-[30px]">
                  <p className="text-[12px] text-[#6b7280] leading-[14px] line-clamp-2">{item.title}</p>
                </div>

                <h2 className="text-[15px] font-semibold text-[#111827] leading-[18px] mt-1">{item.value}</h2>

                <p className="text-[11px] text-[#16a34a] font-medium mt-0.5 leading-[12px]">↑ {item.growth}</p>
              </div>

              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHART SECTION */}

      <div className="grid grid-cols-12 gap-3 lg:grid-cols-1">
        {/* INVENTORY VALUE TREND */}

        <div className="col-span-5 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-[#111827]">Inventory Value Trend</h3>

            <select className="text-[11px] border border-[#e5e7eb] rounded-md px-2 py-1">
              <option>Daily</option>
            </select>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inventoryTrend}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />

                <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />

                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />

                <Tooltip />

                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INVENTORY HEALTH */}

        <div className="col-span-4 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Inventory Health</h3>

          <div className="flex items-center gap-3">
            <div className="relative">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={inventoryHealthData} dataKey="value" innerRadius={45} outerRadius={70}>
                    {inventoryHealthData.map((item, index) => (
                      <Cell key={index} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[24px] font-bold text-[#111827]">245</div>

                <div className="text-[11px] text-[#6b7280]">Total SKUs</div>
              </div>
            </div>

            <div className="space-y-2">
              {inventoryHealthData.map((item) => (
                <div key={item.name} className="text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />

                    <span>{item.name}</span>
                  </div>

                  <div className="ml-4 text-[#6b7280]">
                    {item.value} ({item.percent})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* INVENTORY INSIGHTS */}

        <div className="col-span-3 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-[#111827]">Inventory Insights</h3>

            <button type="button" className="text-[10px] text-[#2563eb] font-medium">
              View All Insights
            </button>
          </div>

          <div className="space-y-2">
            {inventoryInsights.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-[12px] font-semibold ${item.color}`}
                >
                  {item.icon}
                </div>

                <div>
                  <div className="text-[12px] font-semibold text-[#111827]">{item.title}</div>

                  <div className="text-[11px] text-[#6b7280] mt-1">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            size="small"
            prefix={<SearchOutlined className="text-[#94a3b8]" />}
            placeholder="Search by SKU, ASIN, or Title..."
            className="!w-[250px] !h-[34px] text-[11px]"
          />

          <button
            type="button"
            className="h-[34px] px-4 border border-[#dbe1e8] rounded-md bg-white text-[12px] font-medium flex items-center gap-2"
          >
            <FilterOutlined />
            Filters
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-[34px] px-4 border border-[#dbe1e8] rounded-md bg-white text-[12px] font-medium"
          >
            Columns
          </button>

          <button type="button" className="h-[34px] px-4 rounded-md bg-[#16a34a] text-white text-[12px] font-medium">
            Export
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#edf0f2] rounded-xl p-3 mt-3 w-full">
        <Table
          className="[&_.ant-table-thead>tr>th]:text-[11px]"
          size="small"
          columns={searchColumns}
          dataSource={searchData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
          }}
          scroll={{ x: 1200 }}
        />
      </div>
    </div>
  );
}

export default InventoryImpact;
