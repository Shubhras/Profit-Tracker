import React from 'react';
import {
  InfoCircleOutlined,
  ReloadOutlined,
  StarOutlined,
  BarChartOutlined,
  RiseOutlined,
  EyeOutlined,
  BulbOutlined,
  TrophyOutlined,
  TagOutlined,
  ShopOutlined,
} from '@ant-design/icons';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

function Overview() {
  const cards = [
    {
      title: 'Organic Sales',
      value: '₹28,45,678.45',
      growth: '+12.34%',
      color: '#16a34a',
    },
    {
      title: 'Organic Orders',
      value: '2,485',
      growth: '+9.21%',
      color: '#2563eb',
    },
    {
      title: 'Units Sold',
      value: '3,876',
      growth: '+10.55%',
      color: '#9333ea',
    },
    {
      title: 'Organic Conversion Rate',
      value: '12.85%',
      growth: '+1.23%',
      color: '#d97706',
    },
    {
      title: 'Avg. Order Value',
      value: '₹1,14,523.10',
      growth: '+3.18%',
      color: '#059669',
    },
    {
      title: 'Buy Box Win Rate',
      value: '82.42%',
      growth: '+5.67%',
      color: '#2563eb',
    },
  ];

  const pieData = [
    { name: 'Coupons', value: 28, color: '#8b5cf6' },
    { name: 'Listing', value: 24, color: '#3b82f6' },
    { name: 'Keyword', value: 18, color: '#22c55e' },
    { name: 'Deals', value: 15, color: '#ec4899' },
    { name: 'Others', value: 15, color: '#f59e0b' },
  ];

  //   const graphData = [
  //     { name: '01', sales: 5000 },
  //     { name: '05', sales: 7000 },
  //     { name: '09', sales: 6500 },
  //     { name: '13', sales: 8200 },
  //     { name: '17', sales: 7600 },
  //     { name: '21', sales: 8800 },
  //     { name: '25', sales: 7900 },
  //     { name: '31', sales: 9500 },
  //   ];

  return (
    <div className="bg-[#f5f7fb] p-5">
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-semibold text-[#111827]">Organic Performance Dashboard</h1>

            <InfoCircleOutlined className="text-[#9ca3af] mb-2" />
          </div>

          <p className="mt-1 text-sm text-[#6b7280]">Track your organic sales performance and key growth drivers.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm">Channel : Amazon</div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm"
          >
            <ReloadOutlined />
            Refresh
          </button>

          <span className="text-xs text-[#6b7280]">Last Updated : 31 May 2026, 09:00 AM</span>
        </div>
      </div>

      {/* FIRST ROW - 6 CARDS */}
      <div className="grid grid-cols-6 gap-2">
        {cards.map((item, index) => (
          <div key={index} className="rounded-xl border border-[#e5e7eb] bg-white px-4 pt-4 pb-2">
            <p className="text-[17px] font-medium text-[#111827]">{item.title}</p>

            <h2 className="mt-3 text-[20px] font-bold" style={{ color: item.color }}>
              {item.value}
            </h2>

            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: item.color }}>
                {item.growth}
              </span>

              <span className="text-xs text-[#9ca3af]">vs 01 Apr - 30 Apr</span>
            </div>

            {/* MINI GRAPH */}
            <div className="mt-4 h-[32px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { value: 12 },
                    { value: 18 },
                    { value: 15 },
                    { value: 22 },
                    { value: 17 },
                    { value: 26 },
                    { value: 20 },
                    { value: 28 },
                    { value: 24 },
                    { value: 32 },
                  ]}
                  margin={{
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <Line type="monotone" dataKey="value" stroke={item.color} strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* SECOND ROW */}
      <div className="mt-5 grid grid-cols-12 gap-4">
        {/* PIE CHART */}
        {/* PIE CHART */}
        <div className="col-span-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="mb-4">
            <h2 className="text-[17px] font-semibold text-[#111827]">Organic Sales by Source / Driver</h2>
          </div>

          {/* PIE CHART TOP */}
          <div className="flex justify-center">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LIST BELOW PIE CHART */}
          <div className="mt-2 space-y-0">
            {pieData.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <div
                    className="mt-[5px] h-[8px] w-[8px] rounded-full"
                    style={{
                      background: item.color,
                    }}
                  />

                  <span className="text-[12px] font-medium text-[#4b5563]">{item.name}</span>
                </div>

                <div className="text-right">
                  <p className="text-[12px] font-semibold text-[#111827]">₹ {(item.value * 100000).toLocaleString()}</p>

                  {/* <span className="text-[11px] text-[#9ca3af]">({item.value}%)</span> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GRAPH */}
        {/* GRAPH */}
        <div className="col-span-6 rounded-xl border border-[#e5e7eb] bg-white p-4">
          {/* HEADER */}
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-[#111827]">Sales Drivers Trend</h2>

              {/* LEGENDS */}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                {[
                  {
                    name: 'Coupons & Promotions',
                    color: '#3b82f6',
                  },
                  {
                    name: 'Listing Optimisation',
                    color: '#22c55e',
                  },
                  {
                    name: 'Keyword Optimisation',
                    color: '#06b6d4',
                  },
                  {
                    name: 'Deals / Offers',
                    color: '#7c3aed',
                  },
                  {
                    name: 'Warehouse Opt-in',
                    color: '#111827',
                  },
                  {
                    name: 'Others',
                    color: '#a855f7',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="h-[8px] w-[8px] rounded-full"
                      style={{
                        background: item.color,
                      }}
                    />

                    <span className="text-[11px] font-medium text-[#6b7280]">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DROPDOWN */}
            <select className="rounded-md border border-[#e5e7eb] bg-white px-3 py-[6px] text-sm text-[#374151] outline-none">
              <option>Daily</option>
            </select>
          </div>

          {/* CHART */}
          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  {
                    name: 'May 01',
                    blue: 9000,
                    green: 6500,
                    cyan: 4200,
                    purple: 3000,
                    violet: 1500,
                  },
                  {
                    name: 'May 05',
                    blue: 10500,
                    green: 7200,
                    cyan: 4500,
                    purple: 3200,
                    violet: 1700,
                  },
                  {
                    name: 'May 09',
                    blue: 8700,
                    green: 6000,
                    cyan: 3900,
                    purple: 2800,
                    violet: 1400,
                  },
                  {
                    name: 'May 13',
                    blue: 11000,
                    green: 7600,
                    cyan: 4700,
                    purple: 3500,
                    violet: 1900,
                  },
                  {
                    name: 'May 17',
                    blue: 9200,
                    green: 6700,
                    cyan: 4300,
                    purple: 3100,
                    violet: 1600,
                  },
                  {
                    name: 'May 21',
                    blue: 9800,
                    green: 7100,
                    cyan: 4600,
                    purple: 3400,
                    violet: 1800,
                  },
                  {
                    name: 'May 25',
                    blue: 8200,
                    green: 5900,
                    cyan: 3900,
                    purple: 2600,
                    violet: 1300,
                  },
                  {
                    name: 'May 31',
                    blue: 10800,
                    green: 7300,
                    cyan: 4900,
                    purple: 3600,
                    violet: 2000,
                  },
                ]}
                margin={{
                  top: 5,
                  right: 10,
                  left: -10,
                  bottom: 0,
                }}
              >
                {/* GRID */}
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />

                {/* X AXIS */}
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#9ca3af',
                    fontSize: 11,
                  }}
                />

                {/* Y AXIS */}
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#9ca3af',
                    fontSize: 11,
                  }}
                  ticks={[0, 3000, 6000, 9000, 12000]}
                  tickFormatter={(value) => (value === 0 ? '0' : `${value / 1000}K`)}
                />

                {/* TOOLTIP */}
                <Tooltip />

                {/* LINES */}
                <Line type="monotone" dataKey="blue" stroke="#3b82f6" strokeWidth={2.5} dot={false} />

                <Line type="monotone" dataKey="green" stroke="#22c55e" strokeWidth={2} dot={false} />

                <Line type="monotone" dataKey="cyan" stroke="#06b6d4" strokeWidth={2} dot={false} />

                <Line type="monotone" dataKey="purple" stroke="#7c3aed" strokeWidth={2} dot={false} />

                <Line type="monotone" dataKey="black" stroke="#111827" strokeWidth={2} dot={false} />

                <Line type="monotone" dataKey="violet" stroke="#a855f7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT SIDE DATA BOX */}
        <div className="col-span-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <h2 className="mb-5 text-[17px] font-semibold text-[#111827]">Sales from Coupons & Promotions</h2>

          <div className="flex h-[320px] flex-col justify-between">
            <div className="border-b border-[#f3f4f6] pb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6b7280]">Total Sales</span>

                <span className="text-sm font-semibold text-[#111827]">₹ 8,45,230.10</span>
              </div>
            </div>

            <div className="border-b border-[#f3f4f6] pb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6b7280]">Orders</span>

                <span className="text-sm font-semibold text-[#111827]">745</span>
              </div>
            </div>

            <div className="border-b border-[#f3f4f6] pb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6b7280]">Units Sold</span>

                <span className="text-sm font-semibold text-[#111827]">1,025</span>
              </div>
            </div>

            <div className="border-b border-[#f3f4f6] pb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6b7280]">Avg. Discount</span>

                <span className="text-sm font-semibold text-[#111827]">₹ 118.65</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#6b7280]">Redemption Rate</span>

              <div className="flex items-center gap-3">
                {/* <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecfdf5] text-[#16a34a]">
                  %
                </div> */}

                <span className="text-lg font-bold text-[#111827]">21.45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* THIRD ROW */}
      <div className="mt-5 grid grid-cols-12 gap-4">
        {/* REVIEWS & RATINGS */}
        <div className="col-span-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
          {/* HEADER */}
          <div className="mb-4 flex items-center gap-2">
            <StarOutlined className="text-[15px] text-[#f59e0b] mb-2" />

            <h2 className="text-[17px] font-semibold text-[#111827]">Reviews & Ratings</h2>
          </div>

          {/* TOP STATS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-[#9ca3af]">Average Rating</p>

              <h3 className="mt-1 text-[24px] font-bold text-[#111827]">4.3</h3>

              <p className="mt-1 text-[11px] font-medium text-[#16a34a]">+0.12 vs 01 Apr - 30 Apr</p>
            </div>

            <div>
              <p className="text-[11px] text-[#9ca3af]">Total Reviews</p>

              <h3 className="mt-1 text-[24px] font-bold text-[#111827]">1,258</h3>

              <p className="mt-1 text-[11px] font-medium text-[#16a34a]">+8.45% vs 01 Apr - 30 Apr</p>
            </div>
          </div>

          {/* POSITIVE / NEGATIVE */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#9ca3af]">Positive Reviews</p>

              <h4 className="mt-1 text-[18px] font-semibold text-[#111827]">
                1,032 <span className="text-sm">(82%)</span>
              </h4>
            </div>

            <div>
              <p className="text-[11px] text-[#9ca3af]">Negative Reviews</p>

              <h4 className="mt-1 text-[18px] font-semibold text-[#111827]">
                226 <span className="text-sm">(18%)</span>
              </h4>
            </div>
          </div>

          {/* RATING DISTRIBUTION */}
          <div className="mt-3">
            <p className="mb-3 text-[12px] font-semibold text-[#374151]">Rating Distribution</p>

            {[
              {
                star: '5 Star',
                width: '100%',
                color: '#22c55e',
                value: 712,
              },
              {
                star: '4 Star',
                width: '70%',
                color: '#84cc16',
                value: 320,
              },
              {
                star: '3 Star',
                width: '40%',
                color: '#facc15',
                value: 126,
              },
              {
                star: '2 Star',
                width: '20%',
                color: '#fb923c',
                value: 55,
              },
              {
                star: '1 Star',
                width: '12%',
                color: '#ef4444',
                value: 45,
              },
            ].map((item, index) => (
              <div key={index} className="mb-2 flex items-center gap-3">
                <span className="w-[45px] text-[11px] text-[#6b7280]">{item.star}</span>

                <div className="h-[6px] flex-1 rounded-full bg-[#f3f4f6]">
                  <div
                    className="h-[6px] rounded-full"
                    style={{
                      width: item.width,
                      background: item.color,
                    }}
                  />
                </div>

                <span className="w-[28px] text-right text-[11px] text-[#6b7280]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCT RANKING */}
        <div className="col-span-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <BarChartOutlined className="text-[15px] text-[#2563eb] mb-2" />

            <h2 className="text-[17px] font-semibold text-[#111827]">Product Ranking Overview</h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#f3f4f6]">
            {/* HEADER */}
            <div className="grid grid-cols-3 border-b border-[#f3f4f6] bg-[#f9fafb] px-3 py-2">
              <span className="text-[11px] font-semibold text-[#6b7280]">Rank Position</span>

              <span className="text-center text-[11px] font-semibold text-[#6b7280]">No. of Products</span>

              <span className="text-right text-[11px] font-semibold text-[#6b7280]">%</span>
            </div>

            {[
              ['#1 - #3', '48', '16.0%'],
              ['#4 - #10', '92', '30.7%'],
              ['#11 - #20', '78', '26.0%'],
              ['#21 - #50', '64', '21.3%'],
              ['#51+', '18', '6.0%'],
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-3 border-b border-[#f9fafb] px-3 py-3">
                <span className="text-[12px] font-medium text-[#374151]">{item[0]}</span>

                <span className="text-center text-[12px] text-[#374151]">{item[1]}</span>

                <span className="text-right text-[12px] text-[#374151]">{item[2]}</span>
              </div>
            ))}

            {/* TOTAL */}
            <div className="grid grid-cols-3 bg-[#f9fafb] px-3 py-3">
              <span className="text-[12px] font-semibold text-[#111827]">Total</span>

              <span className="text-center text-[12px] font-semibold text-[#111827]">300</span>

              <span className="text-right text-[12px] font-semibold text-[#111827]">100%</span>
            </div>
          </div>
        </div>

        {/* TOP GAINING KEYWORDS */}
        <div className="col-span-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <RiseOutlined className="text-[15px] text-[#16a34a] mb-2" />

            <h2 className="text-[17px] font-semibold text-[#111827]">Top Gaining Keywords (Organic)</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                keyword: 'wireless earphones',
                volume: '12,540',
                change: '+15',
                clicks: '1,245',
              },
              {
                keyword: 'bluetooth headphone',
                volume: '8,920',
                change: '+12',
                clicks: '985',
              },
              {
                keyword: 'noise cancelling headset',
                volume: '6,130',
                change: '+10',
                clicks: '654',
              },
              {
                keyword: 'gaming headphones',
                volume: '5,210',
                change: '+8',
                clicks: '512',
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b border-[#f9fafb] pb-1">
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">{item.keyword}</p>

                  <p className="mt-1 text-[13px] text-[#9ca3af]">Search Volume : {item.volume}</p>
                </div>

                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#16a34a]">Rank: {item.change}</p>

                  <p className="mt-1 text-[13px] text-[#9ca3af]">Clicks : {item.clicks}</p>
                </div>
              </div>
            ))}
          </div>

          <button type="button" className="text-[13px] font-semibold text-[#2563eb]">
            View all keywords →
          </button>
        </div>

        {/* TRAFFIC & VISIBILITY */}
        <div className="col-span-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="mb-5 flex items-center gap-2">
            <EyeOutlined className="text-[15px] text-[#7c3aed] mb-2" />

            <h2 className="text-[17px] font-semibold text-[#111827]">Traffic & Visibility</h2>
          </div>

          {[
            {
              title: 'Impressions',
              value: '12,85,430',
              growth: '+11.25%',
              color: '#16a34a',
            },
            {
              title: 'Clicks',
              value: '1,98,745',
              growth: '+14.32%',
              color: '#22c55e',
            },
            {
              title: 'CTR',
              value: '15.46%',
              growth: '+2.45%',
              color: '#10b981',
            },
          ].map((item, index) => (
            <div key={index} className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold mb-1">{item.title}</p>

                <h3 className="text-[20px] font-bold text-[#111827] mb-1">{item.value}</h3>

                <p
                  className="text-[13px] font-medium"
                  style={{
                    color: item.color,
                  }}
                >
                  {item.growth} vs 01 Apr - 30 Apr
                </p>
              </div>

              {/* MINI GRAPH */}
              <div className="flex items-end gap-[2px]">
                {[8, 10, 7, 14, 12, 18, 10, 20].map((h, i) => (
                  <div
                    key={i}
                    className="w-[6px] rounded-full"
                    style={{
                      height: `${h}px`,
                      background: '#22c55e',
                      opacity: 0.2 + i * 0.08,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* FOURTH ROW */}
      <div className="mt-5 rounded-xl border border-[#e5e7eb] bg-white p-4">
        {/* HEADER */}
        <div className="mb-4 flex items-center gap-2">
          <BulbOutlined className="text-[16px] text-[#f59e0b] mb-2" />

          <h2 className="text-[17px] font-semibold text-[#111827]">Insights & Recommendations</h2>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              icon: <TrophyOutlined />,
              title: 'Top Opportunity',
              desc: 'Improve ranking for 68 products in position 21-50 to increase organic sales potential.',
              bg: '#ecfdf5',
              color: '#16a34a',
            },
            {
              icon: <TagOutlined />,
              title: 'Coupon Impact',
              desc: 'Coupons & Promotions driving 29.7% of organic sales. Optimize discount strategy.',
              bg: '#f5f3ff',
              color: '#7c3aed',
            },
            {
              icon: <StarOutlined />,
              title: 'Reviews Boost',
              desc: 'Increase reviews to 1,500+ to improve conversion and rankings.',
              bg: '#ecfeff',
              color: '#06b6d4',
            },
            {
              icon: <ShopOutlined />,
              title: 'Warehouse Opt-in',
              desc: 'Enable more products for local warehouse to increase buy box win rate.',
              bg: '#faf5ff',
              color: '#9333ea',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-[#f3f4f6] p-4 transition-all duration-200 hover:shadow-sm"
            >
              {/* TOP */}
              <div className="flex items-start gap-3">
                {/* ICON */}
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[15px]"
                  style={{
                    background: item.bg,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>

                {/* CONTENT */}
                <div>
                  <h3 className="text-[15px] font-semibold text-[#111827]">{item.title}</h3>

                  <p className="mt-1 text-[13px] leading-5 text-[#6b7280]">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Overview;
