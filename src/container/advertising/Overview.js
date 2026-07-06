import React, { useEffect } from 'react';
import { Spin } from 'antd';
import {
  ReloadOutlined,
  BulbOutlined,
  SearchOutlined,
  LineChartOutlined,
  DownOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { getAdvertisingOverview } from '../../redux/advertising/actionCreator';

function Overview() {
  const dispatch = useDispatch();

  const { advertiseOverview, loading } = useSelector((state) => state.advertising);

  const { dateRange } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(
      getAdvertisingOverview({
        start_date: dateRange?.fromDate,
        end_date: dateRange?.endDate,
      }),
    );
  }, [dispatch, dateRange]);

  const dashboard = advertiseOverview?.data || {};

  const summaryCards = dashboard.summary_cards || {};

  const performanceTrend = dashboard.performance_trend || [];

  const performanceBreakdown = dashboard.performance_breakdown || [];

  const performanceByType = dashboard.performance_by_type || [];

  const topCampaigns = dashboard.top_campaigns || [];

  const data = performanceTrend.map((item) => ({
    name: item.date,
    acos: item.acos,
    tacos: item.tacos,
    roas: item.roas,
  }));

  const cards = [
    {
      title: 'ACOS',
      value: `${summaryCards?.acos?.value ?? 0}%`,
      growth: summaryCards?.acos?.change?.formatted ?? '0%',
    },
    {
      title: 'TACOS',
      value: `${summaryCards?.tacos?.value ?? 0}%`,
      growth: summaryCards?.tacos?.change?.formatted ?? '0%',
    },
    {
      title: 'ROAS',
      value: summaryCards?.roas?.value ?? 0,
      growth: summaryCards?.roas?.change?.formatted ?? '0%',
    },
    {
      title: 'Ad Spend',
      value: `₹ ${summaryCards?.ad_spend?.value ?? 0}`,
      growth: summaryCards?.ad_spend?.change?.formatted ?? '0%',
    },
    {
      title: 'Sales from Ads',
      value: `₹ ${summaryCards?.sales_from_ads?.value ?? 0}`,
      growth: summaryCards?.sales_from_ads?.change?.formatted ?? '0%',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-3 px-3">
      <Spin spinning={loading}>
        {/* Header */}
        <div className="mb-2 flex flex-col gap-3 min-lg:flex-row min-lg:items-start min-lg:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="mb-0 text-[20px] font-semibold text-[#111827]">Advertising Dashboard</h1>

            <p className="text-[11px] text-gray-500">
              Overview of your advertising performance and opportunities to improve.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium">
              <span className="text-gray-500">Ad Account:</span>

              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-[#edf4ff] px-3 py-1.5 text-[#2563eb]"
              >
                <span className="font-semibold">All Accounts</span>
                <DownOutlined className="text-[10px]" />
              </button>
            </div>

            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700"
            >
              <ReloadOutlined />
              Refresh
            </button>

            <div className="flex items-center gap-1 text-[11px] text-gray-600">
              <InfoCircleOutlined />
              Last Updated: 31 May 2025
            </div>
          </div>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-5 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2">
          {cards.map((item, index) => (
            <div key={index} className="rounded-2xl border border-[#e5e7eb] bg-white px-3 py-3">
              {/* Top */}
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[12px] font-semibold text-gray-600">{item.title}</h3>

                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${item.tagColor}`}>{item.tag}</span>
              </div>

              {/* Value */}
              <h2 className="text-[18px] font-bold leading-none tracking-tight text-[#111827]">{item.value}</h2>

              {/* Growth */}
              <p className="mt-2 text-[10px] font-medium text-green-600">↑ {item.growth}</p>

              {/* Mini Graph */}
              {/* <div className="mt-4 flex items-end gap-[3px]">
              {[20, 12, 18, 15, 25, 22, 32, 18, 28, 20].map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-full ${item.line}`}
                  style={{
                    height: `${h}px`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div> */}
            </div>
          ))}
        </div>

        {/* Middle Section */}
        <div className="mt-2 grid grid-cols-12 gap-2">
          {/* PERFORMANCE TREND */}

          <div className="col-span-4 xl:col-span-12 rounded-xl border border-[#e5e7eb] bg-white p-3">
            <div className="mb-3 flex flex-col gap-2 min-lg:flex-row min-lg:items-center min-lg:justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-[#111827]">Performance Trend</h2>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    ACOS (%)
                  </span>

                  <span className="flex items-center gap-1 text-[11px] text-blue-600">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    TACOS (%)
                  </span>

                  <span className="flex items-center gap-1 text-[11px] text-purple-600">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    ROAS
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600"
              >
                Daily
              </button>
            </div>

            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{
                    top: 5,
                    right: 5,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />

                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />

                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />

                  <Tooltip />

                  <Line type="monotone" dataKey="acos" stroke="#10b981" strokeWidth={2} dot={false} />

                  <Line type="monotone" dataKey="tacos" stroke="#3b82f6" strokeWidth={2} dot={false} />

                  <Line type="monotone" dataKey="roas" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PERFORMANCE BREAKDOWN */}

          <div className="col-span-4 xl:col-span-6 md:col-span-12 rounded-xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="mb-3 text-[15px] font-semibold text-[#111827]">Performance Breakdown</h2>

            <div className="flex flex-col items-center gap-3 min-lg:flex-row">
              <div className="relative flex-shrink-0">
                <svg width="150" height="150" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="20"
                    strokeDasharray="290 150"
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />

                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="20"
                    strokeDasharray="95 345"
                    strokeDashoffset="-300"
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />

                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="20"
                    strokeDasharray="70 370"
                    strokeDashoffset="-405"
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] text-gray-500">Total Ad Spend</p>

                  <h3 className="mt-1 text-[12px] font-bold text-[#111827]">₹ {summaryCards?.ad_spend?.value}</h3>
                </div>
              </div>

              <div className="w-full space-y-3">
                {performanceBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />

                      <span className="text-[11px] font-medium text-gray-700">{item.campaign_type}</span>
                    </div>

                    <p className="mt-1 pl-4 text-[11px] font-semibold text-[#111827]">
                      ₹ {item.spend} ({item.percentage}%)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CAMPAIGN TYPE TABLE */}

          <div className="col-span-4 xl:col-span-6 md:col-span-12 rounded-xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="mb-3 text-[15px] font-semibold text-[#111827]">Performance by Campaign Type</h2>

            <div className="overflow-x-auto">
              <table className="min-w-[450px] w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-[11px] text-gray-500">
                    <th className="pb-3">Campaign Type</th>
                    <th className="pb-3">Ad Spend</th>
                    <th className="pb-3">Sales</th>
                    <th className="pb-3">ACOS</th>
                  </tr>
                </thead>

                <tbody className="text-[11px]">
                  {performanceByType.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3">{item.campaign_type}</td>

                      <td>₹ {item.spend}</td>

                      <td>₹ {item.sales}</td>

                      <td>{item.acos}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-2 grid grid-cols-12 gap-3">
          {/* TOP CAMPAIGNS */}

          <div className="col-span-6 xl:col-span-12 rounded-xl border border-[#e5e7eb] bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#111827]">Top Campaigns</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="bg-[#f8fafc] text-left text-[11px] font-semibold text-gray-500">
                    <th className="rounded-l-lg px-2 py-2">Campaign</th>
                    <th className="px-2 py-2">Ad Spend</th>
                    <th className="px-2 py-2">Sales</th>
                    <th className="px-2 py-2">ACOS</th>
                    <th className="px-2 py-2">ROAS</th>
                    <th className="rounded-r-lg px-2 py-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {topCampaigns.map((item) => (
                    <tr key={item.campaign_id} className="border-b border-gray-100 text-[11px] text-gray-700">
                      <td className="px-2 py-2 font-medium">{item.name}</td>

                      <td className="px-2 py-2">₹ {item.spend}</td>

                      <td className="px-2 py-2">₹ {item.sales}</td>

                      <td className="px-2 py-2">{item.acos}%</td>

                      <td className="px-2 py-2">{item.roas}</td>

                      <td className="px-2 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold
            ${
              item.status === 'Excellent'
                ? 'bg-green-100 text-green-600'
                : item.status === 'Good'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-yellow-100 text-yellow-600'
            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" className="mt-3 flex items-center gap-1 text-[11px] font-medium text-blue-600">
              View all campaigns →
            </button>
          </div>

          {/* AI RECOMMENDATIONS */}

          <div className="col-span-6 xl:col-span-6 md:col-span-12 rounded-xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="mb-2 text-[15px] font-semibold text-[#111827]">AI Recommendations</h2>

            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-start justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                      {item === 1 && <LineChartOutlined className="text-[13px] text-green-600" />}

                      {item === 2 && <SearchOutlined className="text-[13px] text-purple-600" />}

                      {item === 3 && <BulbOutlined className="text-[13px] text-yellow-600" />}
                    </div>

                    <div>
                      <h4 className="text-[11px] font-semibold text-[#111827]">
                        Increase bids for high converting keywords
                      </h4>

                      <p className="mt-1 text-[10px] text-gray-500">Improve ad performance and conversions.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-600"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>

            <button type="button" className="mt-3 flex items-center gap-1 text-[11px] font-medium text-blue-600">
              View all recommendations →
            </button>
          </div>
        </div>
      </Spin>
    </div>
  );
}

export default Overview;
