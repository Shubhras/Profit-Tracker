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
    title: 'Total Keywords',
    value: '12,856',
    growth: '+8%',
    icon: <EyeOutlined />,
    bg: 'bg-green-50',
  },
  {
    title: 'Total 10 Keywords',
    value: '2,348',
    growth: '+11%',
    icon: <ArrowUpOutlined />,
    bg: 'bg-purple-50',
  },
  {
    title: 'Organic Impressions',
    value: '9.82M',
    growth: '+16%',
    icon: <PercentageOutlined />,
    bg: 'bg-yellow-50',
  },
  {
    title: 'Organic Clicks',
    value: '1.24M',
    growth: '+16%',
    icon: <UsergroupAddOutlined />,
    bg: 'bg-blue-50',
  },
  {
    title: 'Average CTR',
    value: '12.63%',
    growth: '+4%',
    icon: <SearchOutlined />,
    bg: 'bg-red-50',
  },
  {
    title: 'Average Position',
    value: '18.24%',
    growth: '-6%',
    icon: <RiseOutlined />,
    bg: 'bg-green-50',
  },
];

const rankingData = [
  { name: 'Top 3', value: 756, color: '#22c55e' },
  { name: '4 - 10', value: 1592, color: '#2563eb' },
  { name: '11 - 20', value: 2381, color: '#facc15' },
  { name: '21 - 50', value: 4123, color: '#8b5cf6' },
  { name: '51 - 100', value: 4004, color: '#06b6d4' },
];

const positionTrend = [
  { day: 'May 01', pos: 15 },
  { day: 'May 04', pos: 13 },
  { day: 'May 07', pos: 18 },
  { day: 'May 10', pos: 12 },
  { day: 'May 13', pos: 17 },
  { day: 'May 16', pos: 14 },
  { day: 'May 19', pos: 21 },
  { day: 'May 22', pos: 24 },
  { day: 'May 25', pos: 27 },
  { day: 'May 28', pos: 19 },
  { day: 'May 31', pos: 22 },
];

const topKeywords = [
  {
    keyword: 'bluetooth headset',
    prev: 32,
    current: 12,
    gain: '+20',
  },
  {
    keyword: 'wireless earbuds',
    prev: 25,
    current: 8,
    gain: '+17',
  },
  {
    keyword: 'noise cancelling headphones',
    prev: 35,
    current: 18,
    gain: '+17',
  },
  {
    keyword: 'over ear headphones',
    prev: 28,
    current: 13,
    gain: '+15',
  },
  {
    keyword: 'gaming headphones',
    prev: 40,
    current: 25,
    gain: '+15',
  },
];
const searchColumns = [
  {
    title: 'Keyword',
    dataIndex: 'keyword',
    width: 240,
    render: (v) => <span className="text-[11px] font-medium text-[#374151]">{v}</span>,
  },

  {
    title: 'Search Volume',
    dataIndex: 'searchVolume',
    align: 'center',
    width: 120,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Impressions',
    dataIndex: 'impressions',
    align: 'center',
    width: 120,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Clicks',
    dataIndex: 'clicks',
    align: 'center',
    width: 100,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'CTR',
    dataIndex: 'ctr',
    align: 'center',
    width: 90,
    render: (v) => <span className="text-[11px] font-medium">{v}</span>,
  },

  {
    title: 'Average Position',
    dataIndex: 'avgPosition',
    align: 'center',
    width: 130,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Top Position',
    dataIndex: 'topPosition',
    align: 'center',
    width: 110,
    render: (v) => <span className="text-[11px]">{v}</span>,
  },

  {
    title: 'Change',
    dataIndex: 'change',
    align: 'center',
    width: 100,
    render: (v) => {
      const positive = v.startsWith('+');

      return (
        <span className={`text-[11px] font-semibold ${positive ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          {positive ? `↑ ${v.replace('+', '')}` : `↓ ${v.replace('-', '')}`}
        </span>
      );
    },
  },

  {
    title: 'Actions',
    dataIndex: 'actions',
    align: 'center',
    width: 80,
    render: () => <span className="text-[16px] text-[#6b7280] cursor-pointer">⋮</span>,
  },
];
const searchData = [
  {
    key: 1,
    keyword: 'wireless bluetooth headphones',
    searchVolume: '12,450',
    impressions: '125,431',
    clicks: '25,431',
    ctr: '20.26%',
    avgPosition: '9.8',
    topPosition: '1',
    change: '+5',
  },

  {
    key: 2,
    keyword: 'noise cancelling headphones',
    searchVolume: '9,810',
    impressions: '98,224',
    clicks: '19,842',
    ctr: '20.23%',
    avgPosition: '11.2',
    topPosition: '2',
    change: '+3',
  },

  {
    key: 3,
    keyword: 'over ear headphones',
    searchVolume: '8,760',
    impressions: '85,746',
    clicks: '16,502',
    ctr: '19.24%',
    avgPosition: '12.6',
    topPosition: '2',
    change: '+4',
  },

  {
    key: 4,
    keyword: 'bluetooth headset',
    searchVolume: '7,650',
    impressions: '76,512',
    clicks: '13,102',
    ctr: '17.14%',
    avgPosition: '14.3',
    topPosition: '3',
    change: '+6',
  },

  {
    key: 5,
    keyword: 'gaming headphones',
    searchVolume: '6,430',
    impressions: '64,325',
    clicks: '12,354',
    ctr: '19.18%',
    avgPosition: '15.7',
    topPosition: '3',
    change: '+7',
  },

  {
    key: 6,
    keyword: 'jbl headphones',
    searchVolume: '6,120',
    impressions: '58,976',
    clicks: '9,986',
    ctr: '16.94%',
    avgPosition: '16.1',
    topPosition: '4',
    change: '-2',
  },

  {
    key: 7,
    keyword: 'sony wh-1000xm5',
    searchVolume: '5,890',
    impressions: '45,231',
    clicks: '8,123',
    ctr: '17.97%',
    avgPosition: '17.5',
    topPosition: '5',
    change: '+1',
  },

  {
    key: 8,
    keyword: 'cheap headphones',
    searchVolume: '5,210',
    impressions: '36,487',
    clicks: '6,432',
    ctr: '17.63%',
    avgPosition: '18.9',
    topPosition: '5',
    change: '-1',
  },
];

function KeywordPerformance() {
  return (
    <div className="space-y-2 mt-3 mb-3 px-3">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3 lg:flex-col">
        <div>
          <h1 className="text-[20px] font-semibold mb-0 text-dark">Keyword Performance</h1>
          <p className="text-[12px] text-light max-w-[700px]">
            Track the performance of your organic keywords on Amazon,Monitor rankings,clicks,impressions and conversion
            to indentify high-performing keywords and growth opportunities.
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
        <div className="col-span-3 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Keyword Ranking Distribution</h3>

          <div className="flex items-center gap-4">
            <div className="relative">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={rankingData} dataKey="value" innerRadius={42} outerRadius={60} paddingAngle={2}>
                    {rankingData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[18px] font-bold text-[#111827]">12,856</div>

                <div className="text-[10px] text-[#6b7280]">Total Keywords</div>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {rankingData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />

                    <span>{item.name}</span>
                  </div>

                  <span className="text-[#6b7280]">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="w-full mt-3 border border-[#e5e7eb] rounded-lg py-1.5 text-[11px] font-medium"
          >
            View Details
          </button>
        </div>

        {/* POSITION TREND */}

        <div className="col-span-5 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-[#111827]">Average Position Trend</h3>

            <select className="text-[11px] border border-[#e5e7eb] rounded-md px-2 py-1">
              <option>Daily</option>
            </select>
          </div>

          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={positionTrend}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />

                <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />

                <YAxis fontSize={10} tickLine={false} axisLine={false} reversed />

                <Tooltip />

                <Line type="monotone" dataKey="pos" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP GAINING KEYWORDS */}

        <div className="col-span-4 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Top Gaining Keywords</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Keyword</th>
                  <th className="text-center py-2">Prev</th>
                  <th className="text-center py-2">Current</th>
                  <th className="text-center py-2">Change</th>
                </tr>
              </thead>

              <tbody>
                {topKeywords.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-2 text-[#374151]">{item.keyword}</td>

                    <td className="text-center">{item.prev}</td>

                    <td className="text-center">{item.current}</td>

                    <td className="text-center font-medium text-[#16a34a]">↑ {item.gain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            className="w-full mt-3 border border-[#e5e7eb] rounded-lg py-1.5 text-[11px] font-medium"
          >
            View All
          </button>
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
