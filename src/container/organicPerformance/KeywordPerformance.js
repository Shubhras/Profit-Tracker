import React from 'react';
import { Select, DatePicker, Input, Button, Table } from 'antd';

import {
  DownloadOutlined,
  SearchOutlined,
  EyeOutlined,
  // MousePointerClick,
  PercentageOutlined,
  UsergroupAddOutlined,
  // FundViewOutlined,
  RiseOutlined,
  ArrowUpOutlined,
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

const { RangePicker } = DatePicker;

const stats = [
  {
    title: 'Total Sales',
    value: '198,421.60',
    growth: '+21%',
    icon: <EyeOutlined />,
    bg: 'bg-green-50',
  },
  {
    title: 'Total Orders',
    value: '1,824',
    growth: '+9%',
    icon: <ArrowUpOutlined />,
    bg: 'bg-purple-50',
  },
  {
    title: 'Unit Session %',
    value: '7.62%',
    growth: '+6%',
    icon: <PercentageOutlined />,
    bg: 'bg-yellow-50',
  },
  {
    title: 'Average Order Value',
    value: '107.76',
    growth: '+11%',
    icon: <UsergroupAddOutlined />,
    bg: 'bg-blue-50',
  },
  {
    title: 'Conversion Rate',
    value: '3.29%',
    growth: '+4%',
    icon: <SearchOutlined />,
    bg: 'bg-red-50',
  },
  {
    title: 'Search Click Share',
    value: '18.27%',
    growth: '+5%',
    icon: <RiseOutlined />,
    bg: 'bg-green-50',
  },
];

const searchColumns = [
  {
    title: 'Product Group',
    dataIndex: 'productGroup',
    width: 180,
    render: (v) => <span className="text-[11px] font-medium text-[#374151]">{v}</span>,
  },

  {
    title: 'Sessions',
    dataIndex: 'sessions',
    align: 'center',
    width: 110,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Unit Session %',
    dataIndex: 'unitSession',
    align: 'center',
    width: 120,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Conversion Rate %',
    dataIndex: 'conversionRate',
    align: 'center',
    width: 130,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Average Order Value (₹)',
    dataIndex: 'aov',
    align: 'center',
    width: 150,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Total Orders',
    dataIndex: 'orders',
    align: 'center',
    width: 110,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Total Sales (₹)',
    dataIndex: 'sales',
    align: 'center',
    width: 140,
    render: (v) => <span className="text-[11px] font-medium">{v}</span>,
  },

  {
    title: 'Sales Contribution',
    dataIndex: 'contribution',
    align: 'center',
    width: 130,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Trend (Sales)',
    dataIndex: 'trend',
    align: 'center',
    width: 120,
    render: (v) => (
      <span
        className={`text-[16px] ${v === 'up' ? 'text-green-500' : v === 'down' ? 'text-red-500' : 'text-gray-400'}`}
      >
        {v === 'up' ? '↗' : v === 'down' ? '↘' : '—'}
      </span>
    ),
  },
];
const searchData = [
  {
    key: 1,
    productGroup: 'Headphones',
    sessions: '168,254',
    unitSession: '8.45%',
    conversionRate: '3.42%',
    aov: '₹115.30',
    orders: '742',
    sales: '₹85,642.20',
    contribution: '43.12%',
    trend: 'up',
  },

  {
    key: 2,
    productGroup: 'Earphones',
    sessions: '132,891',
    unitSession: '6.78%',
    conversionRate: '3.15%',
    aov: '₹98.65',
    orders: '418',
    sales: '₹41,217.70',
    contribution: '20.75%',
    trend: 'up',
  },

  {
    key: 3,
    productGroup: 'Bluetooth Speakers',
    sessions: '98,732',
    unitSession: '7.12%',
    conversionRate: '2.98%',
    aov: '₹123.40',
    orders: '295',
    sales: '₹36,426.80',
    contribution: '18.34%',
    trend: 'up',
  },

  {
    key: 4,
    productGroup: 'Audio Accessories',
    sessions: '76,543',
    unitSession: '6.23%',
    conversionRate: '2.71%',
    aov: '₹87.90',
    orders: '207',
    sales: '₹18,765.90',
    contribution: '9.45%',
    trend: 'down',
  },

  {
    key: 5,
    productGroup: 'Other Audio',
    sessions: '32,451',
    unitSession: '5.11%',
    conversionRate: '2.42%',
    aov: '₹71.20',
    orders: '180',
    sales: '₹16,369.00',
    contribution: '8.24%',
    trend: 'down',
  },

  {
    key: 6,
    productGroup: 'Total',
    sessions: '508,871',
    unitSession: '7.62%',
    conversionRate: '3.29%',
    aov: '₹107.76',
    orders: '1,842',
    sales: '₹198,421.60',
    contribution: '100%',
    trend: 'neutral',
  },
];
const driverData = [
  {
    name: 'Unit Session Percentage',
    value: 38.2,
    color: '#10b981',
  },
  {
    name: 'Conversion Rate',
    value: 29.4,
    color: '#3b82f6',
  },
  {
    name: 'Average Order Value',
    value: 21.6,
    color: '#f59e0b',
  },
  {
    name: 'Traffic (Sessions)',
    value: 10.8,
    color: '#8b5cf6',
  },
];

const salesData = [
  { day: 'May 01', sales: 13000 },
  { day: 'May 03', sales: 14500 },
  { day: 'May 05', sales: 23000 },
  { day: 'May 07', sales: 16000 },
  { day: 'May 09', sales: 12000 },
  { day: 'May 11', sales: 18000 },
  { day: 'May 13', sales: 11000 },
  { day: 'May 15', sales: 17000 },
  { day: 'May 17', sales: 12500 },
  { day: 'May 19', sales: 13000 },
  { day: 'May 21', sales: 10000 },
  { day: 'May 23', sales: 16500 },
  { day: 'May 25', sales: 14000 },
  { day: 'May 27', sales: 18500 },
  { day: 'May 29', sales: 10000 },
  { day: 'May 31', sales: 23000 },
];

function KeywordPerformance() {
  return (
    <div className="space-y-2 mt-3 mb-3 px-2">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3 lg:flex-col">
        <div>
          <h1 className="text-[20px] font-semibold mb-0 text-dark">Sales Drivers</h1>
          <p className="text-[12px] text-light max-w-[700px]">
            Understand the key factors driving your organic sales. Analyze how traffic, convertion rate, average order
            value, and unit session percentage contribute to overall sales performance.
          </p>
        </div>

        <Button icon={<DownloadOutlined />} className="h-[30px] text-[11px]">
          Download Report
        </Button>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-6 gap-2 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {stats.map((item) => (
          <div key={item.title} className="bg-white border border-[#edf0f2] rounded-xl px-3 py-2 min-h-[78px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-[#6b7280] mb-0 leading-[14px]">{item.title}</p>

                <h2 className="text-[15px] font-semibold text-[#111827] leading-[18px] mt-2">{item.value}</h2>

                <p className="text-[11px] text-[#16a34a] font-medium mt-0.5 leading-[12px]">↑ {item.growth}</p>
              </div>

              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}

      <div className="grid grid-cols-5 gap-2 lg:grid-cols-2 sm:grid-cols-1">
        <Select
          size="small"
          className="h-[32px] text-[11px]"
          defaultValue="All Date Ranges"
          options={[{ value: 'all', label: 'All Date Ranges' }]}
        />

        <Select
          size="small"
          className="h-[32px] text-[11px]"
          defaultValue="All Product Groups"
          options={[{ value: 'all', label: 'All Product Groups' }]}
        />

        <Select
          size="small"
          className="h-[32px] text-[11px]"
          defaultValue="All Categories"
          options={[{ value: 'all', label: 'All Categories' }]}
        />

        <RangePicker size="small" className="w-full h-[30px] text-[11px]" />

        <Input
          size="small"
          className="h-[32px] text-[11px]"
          prefix={<SearchOutlined />}
          placeholder="Search keyword or ASIN..."
        />
      </div>

      {/* CHART SECTION */}

      <div className="grid grid-cols-12 gap-2 lg:grid-cols-1">
        {/* SALES OVER TIME */}

        <div className="col-span-5 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-[#111827] mb-2">Sales Over Time</h3>

            <div className="flex items-center gap-1 text-[11px] text-[#16a34a]">
              <div className="w-2 h-2 rounded-full bg-[#16a34a]" />
              Sales (₹)
            </div>
          </div>

          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />

                <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />

                <YAxis fontSize={10} tickLine={false} axisLine={false} />

                <Tooltip />

                <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DONUT */}

        <div className="col-span-4 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Sales Driver Contribution</h3>

          <div className="flex items-center justify-between gap-3 md:flex-col">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={driverData} dataKey="value" innerRadius={50} outerRadius={80}>
                    {driverData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[15px] font-bold">₹198,421.60</div>

                <div className="text-[11px] text-[#6b7280]">Total Sales</div>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              {driverData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-11">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />

                    <span>{item.name}</span>
                  </div>

                  <span>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KEY INSIGHTS */}

        <div className="col-span-3 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Key Insights</h3>

          <div className="space-y-3">
            <div className="bg-[#f8fafc] rounded-lg p-3 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">↑</div>

              <div>
                <p className="text-[11px] font-medium m-0">Unit Session Percentage is the top driver</p>

                <p className="text-11 text-[#6b7280] m-0">Contributing 38.2% to total sales.</p>
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-lg p-3 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">i</div>

              <div>
                <p className="text-[11px] font-medium m-0">Conversion Rate improved by 4%</p>

                <p className="text-11 text-[#6b7280] m-0">vs last 30 days.</p>
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-lg p-3 flex gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                !
              </div>

              <div>
                <p className="text-[11px] font-medium m-0">Average Order Value improved by 11%</p>

                <p className="text-11 text-[#6b7280] m-0">vs last 30 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#edf0f2] rounded-xl p-3 mt-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-[#111827] m-0">Sales Drivers by Product Groups</h3>

          {/* <Button size="small" className="text-[11px]">
             View All Search Terms
           </Button> */}
        </div>

        <Table
          className="[&_.ant-table-thead>tr>th]:text-[11px] [&_.ant-table-thead>tr>th]:font-medium"
          size="small"
          pagination={false}
          columns={searchColumns}
          dataSource={searchData}
          scroll={{ x: 900 }}
        />
      </div>
    </div>
  );
}

export default KeywordPerformance;
