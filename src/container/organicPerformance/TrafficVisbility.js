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
  MoreOutlined,
} from '@ant-design/icons';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const { RangePicker } = DatePicker;

const trafficData = [
  { day: 'May 01', impressions: 180, clicks: 90, ctr: 12 },
  { day: 'May 05', impressions: 220, clicks: 110, ctr: 15 },
  { day: 'May 10', impressions: 190, clicks: 95, ctr: 13 },
  { day: 'May 15', impressions: 260, clicks: 120, ctr: 17 },
  { day: 'May 20', impressions: 230, clicks: 105, ctr: 15 },
  { day: 'May 25', impressions: 280, clicks: 130, ctr: 18 },
  { day: 'May 31', impressions: 240, clicks: 115, ctr: 16 },
];

const intentData = [
  { name: 'Informational', value: 44 },
  { name: 'Commercial', value: 36 },
  { name: 'Navigational', value: 13 },
  { name: 'Transactional', value: 7 },
];

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6'];

const stats = [
  {
    title: 'Total Impressions',
    value: '9.82M',
    growth: '+16%',
    icon: <EyeOutlined />,
    bg: 'bg-green-50',
  },
  {
    title: 'Total Clicks',
    value: '1.24M',
    growth: '+14%',
    icon: <ArrowUpOutlined />,
    bg: 'bg-purple-50',
  },
  {
    title: 'CTR',
    value: '12.63%',
    growth: '+4%',
    icon: <PercentageOutlined />,
    bg: 'bg-yellow-50',
  },
  {
    title: 'Unique Visitors',
    value: '785.4K',
    growth: '+11%',
    icon: <UsergroupAddOutlined />,
    bg: 'bg-blue-50',
  },
  {
    title: 'Searches',
    value: '2.45M',
    growth: '+13%',
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
    title: '#',
    dataIndex: 'rank',
    width: 50,
    align: 'center',
  },

  {
    title: 'Search Term',
    dataIndex: 'term',
    width: 200,
    render: (v) => <span className="text-11 font-medium text-[#374151]">{v}</span>,
  },

  {
    title: 'Impressions',
    dataIndex: 'impressions',
    align: 'center',
    width: 120,
    render: (v) => <span className="text-11">{v}</span>,
  },

  {
    title: 'Clicks',
    dataIndex: 'clicks',
    align: 'center',
    width: 100,
    render: (v) => <span className="text-11">{v}</span>,
  },

  {
    title: 'CTR',
    dataIndex: 'ctr',
    align: 'center',
    width: 90,
    render: (v) => <span className="text-11">{v}</span>,
  },

  {
    title: 'Searches',
    dataIndex: 'searches',
    align: 'center',
    width: 120,
    render: (v) => <span className="text-11">{v}</span>,
  },

  {
    title: 'Click Share',
    dataIndex: 'share',
    align: 'center',
    width: 120,
    render: (v) => <span className="text-11">{v}</span>,
  },

  {
    title: 'Actions',
    width: 80,
    align: 'center',
    render: () => <MoreOutlined />,
  },
];
const searchData = [
  {
    key: 1,
    rank: 1,
    term: 'wireless bluetooth headphones',
    impressions: '125,431',
    clicks: '25,431',
    ctr: '20.26%',
    searches: '52,431',
    share: '19.45%',
  },
  {
    key: 2,
    rank: 2,
    term: 'noise cancelling headphones',
    impressions: '98,224',
    clicks: '19,842',
    ctr: '20.23%',
    searches: '41,223',
    share: '18.12%',
  },
  {
    key: 3,
    rank: 3,
    term: 'over ear headphones',
    impressions: '85,746',
    clicks: '16,502',
    ctr: '19.24%',
    searches: '39,451',
    share: '17.63%',
  },
  {
    key: 4,
    rank: 4,
    term: 'bluetooth headset',
    impressions: '76,512',
    clicks: '13,102',
    ctr: '17.14%',
    searches: '28,621',
    share: '16.12%',
  },
  {
    key: 5,
    rank: 5,
    term: 'gaming headphones',
    impressions: '64,325',
    clicks: '12,354',
    ctr: '19.18%',
    searches: '25,631',
    share: '15.42%',
  },
];

function TrafficVisibility() {
  const columns = [
    {
      title: <span className="text-11 font-medium">Page Type</span>,
      dataIndex: 'page',
      render: (v) => <span className="text-11 font-medium">{v}</span>,
    },
    {
      title: <span className="text-11 font-medium">Clicks</span>,
      dataIndex: 'clicks',
      align: 'right',
      render: (v) => <span className="text-11">{v}</span>,
    },
  ];

  const tableData = [
    {
      key: 1,
      page: 'Product Detail Pages',
      clicks: '856,241',
    },
    {
      key: 2,
      page: 'Brand Store Pages',
      clicks: '213,654',
    },
    {
      key: 3,
      page: 'Category Pages',
      clicks: '112,483',
    },
    {
      key: 4,
      page: 'Search Result Pages',
      clicks: '48,962',
    },
    {
      key: 5,
      page: 'Other Pages',
      clicks: '6,452',
    },
  ];

  return (
    <div className="space-y-2 mt-3 mb-3 px-3">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-3 lg:flex-col">
        <div>
          <h1 className="text-[20px] font-bold mb-0 text-dark">Traffic & Visibility</h1>

          <p className="text-[12px] text-light max-w-[700px]">
            Track your organic traffic performance and visibility metrics. Analyze impressions, clicks, CTR and search
            trends.
          </p>
        </div>

        <Button icon={<DownloadOutlined />} className="h-[30px] text-[11px]">
          Download Report
        </Button>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-6 gap-2 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {stats.map((item) => (
          <div key={item.title} className="bg-white border border-[#edf0f2] rounded-xl px-3 py-3 min-h-[95px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-[#6b7280] mb-[2px] leading-4">{item.title}</p>

                <h2 className="text-[17px] font-semibold text-[#111827] leading-tight mt-2">{item.value}</h2>

                <p className="text-[11px] text-[#16a34a] font-medium mt-1 leading-4">↑ {item.growth}</p>
              </div>

              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}

      <div className="grid grid-cols-5 gap-3 lg:grid-cols-2 sm:grid-cols-1">
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

        <RangePicker size="small" className="w-full h-[32px] text-[11px]" />

        <Input
          size="small"
          className="h-[32px] text-[11px]"
          prefix={<SearchOutlined />}
          placeholder="Search keyword or ASIN..."
        />
      </div>

      {/* CHART SECTION */}

      <div className="grid grid-cols-12 gap-3 lg:grid-cols-1">
        {/* LINE CHART */}

        <div className="col-span-6 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[15px] font-semibold text-[#111827] m-0">Impressions, Clicks & CTR Trend</h3>

              <Select
                defaultValue="Daily"
                size="small"
                style={{ width: 80 }}
                className="[&_.ant-select-selector]:h-[28px] [&_.ant-select-selector]:min-h-[28px] [&_.ant-select-selection-item]:leading-[26px]"
                options={[{ value: 'Daily', label: 'Daily' }]}
              />
            </div>

            <div className="flex-1 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trafficData}>
                  <XAxis fontSize={10} dataKey="day" />
                  <YAxis fontSize={10} />
                  <Tooltip />

                  <Line type="monotone" dataKey="impressions" stroke="#16a34a" strokeWidth={2} />
                  <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="ctr" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* PIE CHART */}

        <div className="col-span-3 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex flex-col h-full">
            <h3 className="text-[15px] font-semibold text-[#111827] mb-2 m-0">Top Search Intents</h3>
            <div className="h-[180px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={intentData} dataKey="value" innerRadius={45} outerRadius={75}>
                    {intentData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-1">
              {intentData.map((item) => (
                <div key={item.name} className="flex justify-between text-11">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>
              ))}
            </div>{' '}
          </div>
        </div>

        {/* TABLE */}

        <div className="col-span-3 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex flex-col h-full">
            <h3 className="text-[15px] font-semibold text-[#111827] mb-2 m-0">Top Performing Pages</h3>

            <Table size="small" pagination={false} columns={columns} dataSource={tableData} />
          </div>
        </div>
      </div>
      <div className="bg-white border border-[#edf0f2] rounded-xl p-3 mt-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-semibold text-[#111827] m-0">Top Organic Search Terms</h3>

          <Button size="small" className="text-[11px]">
            View All Search Terms
          </Button>
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

export default TrafficVisibility;
