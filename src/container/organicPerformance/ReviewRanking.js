import React from 'react';
import { Select, DatePicker, Input, Table } from 'antd';

import {
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
import dummy from '../../assets/icons/dummy.jpeg';

const { RangePicker } = DatePicker;

const stats = [
  {
    title: 'Average Ratings',
    value: '4.26',
    growth: '+0.08%',
    icon: <EyeOutlined />,
    bg: 'bg-green-50',
  },
  {
    title: 'Total Reviews',
    value: '3,562',
    growth: '+16%',
    icon: <ArrowUpOutlined />,
    bg: 'bg-purple-50',
  },
  {
    title: '5 Star Reviews %',
    value: '6.28%',
    growth: '+5%',
    icon: <PercentageOutlined />,
    bg: 'bg-yellow-50',
  },
  {
    title: '4 Star Reviews %',
    value: '22.4%',
    growth: '-26%',
    icon: <UsergroupAddOutlined />,
    bg: 'bg-blue-50',
  },
  {
    title: '3 Star Reviews %',
    value: '8.7%',
    growth: '-1%',
    icon: <SearchOutlined />,
    bg: 'bg-red-50',
  },
  {
    title: '1-2 Start Reviews',
    value: '6.1%',
    growth: '+2%',
    icon: <RiseOutlined />,
    bg: 'bg-green-50',
  },
];

const ratingDistribution = [
  { star: '5 Star', value: 62.8, count: 2236, color: '#10b981' },
  { star: '4 Star', value: 22.4, count: 798, color: '#3b82f6' },
  { star: '3 Star', value: 8.7, count: 310, color: '#f59e0b' },
  { star: '2 Star', value: 3.3, count: 118, color: '#fb923c' },
  { star: '1 Star', value: 2.8, count: 100, color: '#ef4444' },
];

const ratingTrend = [
  { day: 'May 01', rating: 4.1 },
  { day: 'May 04', rating: 4.15 },
  { day: 'May 06', rating: 4.22 },
  { day: 'May 09', rating: 4.12 },
  { day: 'May 12', rating: 4.1 },
  { day: 'May 15', rating: 4.05 },
  { day: 'May 18', rating: 4.18 },
  { day: 'May 21', rating: 4.0 },
  { day: 'May 24', rating: 4.17 },
  { day: 'May 27', rating: 3.92 },
  { day: 'May 31', rating: 4.1 },
];

const sentimentData = [
  {
    name: 'Positive',
    value: 2801,
    percent: '78.6%',
    color: '#10b981',
  },
  {
    name: 'Neutral',
    value: 541,
    percent: '15.2%',
    color: '#facc15',
  },
  {
    name: 'Negative',
    value: 220,
    percent: '6.2%',
    color: '#ef4444',
  },
];

const searchColumns = [
  {
    title: 'Product',
    dataIndex: 'product',
    width: 260,
    render: (_, record) => (
      <div className="flex items-center gap-3">
        <img src={dummy} alt="product" className="w-10 h-10 rounded object-cover border border-[#e5e7eb]" />

        <span className="text-[11px] font-medium text-[#374151] truncate max-w-[170px]">{record.product}</span>
      </div>
    ),
  },

  {
    title: 'ASIN',
    dataIndex: 'asin',
    width: 120,
    render: (v) => <span className="text-[11px] font-medium text-[#2563eb]">{v}</span>,
  },

  {
    title: 'Total Reviews',
    dataIndex: 'reviews',
    align: 'center',
    width: 100,
  },

  {
    title: 'Average Rating',
    dataIndex: 'rating',
    align: 'center',
    width: 120,

    render: (v) => <span className="text-[11px] font-medium text-[#f59e0b]">★ {v}</span>,
  },

  {
    title: '5 Star %',
    dataIndex: 'fiveStar',
    align: 'center',
    width: 90,
  },

  {
    title: '1-2 Star %',
    dataIndex: 'lowStar',
    align: 'center',
    width: 100,
  },

  {
    title: 'Review Trend (last 30 days)',
    dataIndex: 'trend',
    align: 'center',
    width: 160,

    render: (v) => {
      const positive = v.startsWith('+');

      return (
        <span className={`text-[11px] font-semibold ${positive ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          {positive ? '↑' : '↓'} {v.replace('+', '').replace('-', '')}
        </span>
      );
    },
  },

  {
    title: 'Actions',
    width: 70,
    align: 'center',
    render: () => <span className="cursor-pointer text-[16px] text-[#6b7280]">⋮</span>,
  },
];

const searchData = [
  {
    key: 1,
    product: 'WOODYWOW Neem Wooden Spoon Set',
    asin: 'B0FP941T5J',
    reviews: 856,
    rating: 4.5,
    fiveStar: '68.2%',
    lowStar: '4.3%',
    trend: '+18%',
  },

  {
    key: 2,
    product: 'WOODYWOW Premium Sheesham Board',
    asin: 'B0G3P922B6',
    reviews: 642,
    rating: 4.3,
    fiveStar: '61.0%',
    lowStar: '6.5%',
    trend: '+12%',
  },

  {
    key: 3,
    product: 'WOODYWOW Square Sizzler Plate',
    asin: 'B0GLNCDWG',
    reviews: 512,
    rating: 4.2,
    fiveStar: '58.6%',
    lowStar: '7.0%',
    trend: '+8%',
  },

  {
    key: 4,
    product: 'WOODYWOW Handcrafted Wooden Tray',
    asin: 'B0G7JN28T9',
    reviews: 478,
    rating: 4.1,
    fiveStar: '56.1%',
    lowStar: '8.2%',
    trend: '-4%',
  },

  {
    key: 5,
    product: 'Premium Sheesham Wood Tray',
    asin: 'B0G2YCGNZD',
    reviews: 365,
    rating: 4.4,
    fiveStar: '64.1%',
    lowStar: '5.2%',
    trend: '+15%',
  },
];

function ReviewRanking() {
  return (
    <div className="space-y-2 mt-3 mb-3 px-3">
      {/* HEADER */}

      <div className="flex items-start justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-[20px] font-bold mb-0">Reviews & Ratings</h1>

          <p className="text-[12px] text-[#6b7280]">
            Monitor customer feedback and ratings to understand product satisfaction,review trend, and area of
            improvement. High ratings and positive reviews help boost trust and conversions.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-6 gap-2 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {stats.map((item) => (
          <div key={item.title} className="bg-white border border-[#edf0f2] rounded-xl px-3 py-2 min-h-[78px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-[#6b7280] mb-0 leading-[14px]">{item.title}</p>

                <h2 className="text-[15px] font-semibold text-[#111827] leading-[18px] mt-2">{item.value}</h2>

                <p className="text-[11px] text-[#16a34a] font-medium mt-0.5 leading-[12px]">
                  ↑ {item.growth}vs last 30 days
                </p>
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
        {/* RATING DISTRIBUTION */}

        <div className="col-span-4 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Rating Distribution</h3>

          <div className="space-y-4">
            {ratingDistribution.map((item) => (
              <div key={item.star}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="text-[#6b7280]">{item.star}</span>

                  <span className="font-medium text-[#374151]">
                    {item.value}% ({item.count})
                  </span>
                </div>

                <div className="h-[8px] bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[10px] text-[#94a3b8] mt-4">
            <span>0%</span>
            <span>20%</span>
            <span>40%</span>
            <span>60%</span>
            <span>80%</span>
            <span>100%</span>
          </div>
        </div>

        {/* AVERAGE RATING TREND */}

        <div className="col-span-4 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-[#111827]">Average Rating Trend</h3>

            <select className="text-[11px] border border-[#e5e7eb] rounded-md px-2 py-1">
              <option>Daily</option>
            </select>
          </div>

          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingTrend}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />

                <XAxis dataKey="day" fontSize={10} tickLine={false} axisLine={false} />

                <YAxis domain={[3.2, 4.8]} fontSize={10} tickLine={false} axisLine={false} />

                <Tooltip />

                <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* REVIEW SENTIMENT */}

        <div className="col-span-4 lg:col-span-1 bg-white border border-[#edf0f2] rounded-xl p-3">
          <h3 className="text-[15px] font-semibold text-[#111827] mb-3">Review Sentiment</h3>

          <div className="flex items-center justify-between">
            <div className="relative">
              <ResponsiveContainer width={150} height={160}>
                <PieChart>
                  <Pie data={sentimentData} dataKey="value" innerRadius={50} outerRadius={75}>
                    {sentimentData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[20px] font-bold text-[#111827]">3,562</div>

                <div className="text-[11px] text-[#6b7280]">Total Reviews</div>
              </div>
            </div>

            <div className="space-y-4">
              {sentimentData.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-6 text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />

                    <span>{item.name}</span>
                  </div>

                  <span className="font-medium">
                    {item.percent} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-3 mt-3">
        {/* TABLE */}

        <div className="col-span-8 lg:col-span-12 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-[#111827]">Top Products by Reviews</h3>
          </div>

          <Table
            className="[&_.ant-table-thead>tr>th]:text-[11px]"
            size="small"
            pagination={{
              pageSize: 5,
            }}
            columns={searchColumns}
            dataSource={searchData}
            scroll={{ x: 1100 }}
          />
        </div>

        {/* RECENT REVIEWS */}

        <div className="col-span-4 lg:col-span-12 bg-white border border-[#edf0f2] rounded-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-[#111827]">Recent Reviews</h3>

            <button type="button" className="text-[11px] text-[#2563eb] font-medium">
              View All
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-[#f8fafc] rounded-lg p-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-green-100 text-green-600 flex items-center justify-center text-[11px] font-bold">
                  5★
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold mb-1">Excellent Quality!</h4>

                  <p className="text-[11px] text-[#6b7280] mb-1">
                    Very good quality wood and finish. Highly recommended.
                  </p>

                  <span className="text-[10px] text-[#9ca3af]">Reviewed on 28 May 2026</span>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-lg p-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center text-[11px] font-bold">
                  4★
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold mb-1">Good product</h4>

                  <p className="text-[11px] text-[#6b7280] mb-1">Nice product, value for money.</p>

                  <span className="text-[10px] text-[#9ca3af]">Reviewed on 27 May 2026</span>
                </div>
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-lg p-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center text-[11px] font-bold">
                  2★
                </div>

                <div>
                  <h4 className="text-[12px] font-semibold mb-1">Not as expected</h4>

                  <p className="text-[11px] text-[#6b7280] mb-1">The size was smaller than expected.</p>

                  <span className="text-[10px] text-[#9ca3af]">Reviewed on 26 May 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewRanking;
