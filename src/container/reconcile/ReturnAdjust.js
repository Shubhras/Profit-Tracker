import React from 'react';
import { Table, Select, Input, Button, Tag, Progress, Tooltip } from 'antd';

import {
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
  SyncOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

function ReturnAdjust() {
  const summaryCards = [
    {
      title: 'Total Returns',
      value: '₹ 26,560.20',
      sub: '420 Orders',
      color: '#ef4444',
      bg: '#fef2f2',
    },

    {
      title: 'Refund Issued',
      value: '₹ 24,320.70',
      sub: '389 Orders',
      color: '#f97316',
      bg: '#fff7ed',
    },

    {
      title: 'Adjustment Offset',
      value: '- ₹ 8,120.00',
      sub: '158 Transactions',
      color: '#8b5cf6',
      bg: '#faf5ff',
    },

    {
      title: 'Net Impact',
      value: '- ₹ 32,440.20',
      sub: 'Last Month',
      color: '#16a34a',
      bg: '#f0fdf4',
    },
  ];

  const chartData = [
    { name: '01', returns: 120, refunds: 90, adjustments: 40 },
    { name: '05', returns: 160, refunds: 120, adjustments: 70 },
    { name: '10', returns: 130, refunds: 100, adjustments: 55 },
    { name: '15', returns: 190, refunds: 150, adjustments: 90 },
    { name: '20', returns: 150, refunds: 110, adjustments: 65 },
    { name: '25', returns: 210, refunds: 170, adjustments: 100 },
    { name: '31', returns: 180, refunds: 140, adjustments: 85 },
  ];

  const pieData = [
    { name: 'Returns', value: 55, color: '#ef4444' },
    { name: 'Refunds', value: 30, color: '#f97316' },
    { name: 'Adjustments', value: 15, color: '#8b5cf6' },
  ];

  const columns = [
    {
      title: <span className="text-[13px] font-semibold text-[#6b7280]">Transaction ID</span>,
      dataIndex: 'transactionId',
      width: 130,

      render: (v) => <span className="text-[12px] text-[#1677ff] font-medium cursor-pointer">{v}</span>,
    },

    {
      title: <span className="text-[13px] font-semibold text-[#6b7280]">Marketplace</span>,
      dataIndex: 'marketplace',
      width: 110,

      render: (v) => <span className="text-[12px] text-[#111827]">{v}</span>,
    },

    {
      title: <span className="text-[13px] font-semibold text-[#6b7280]">Type</span>,
      dataIndex: 'type',
      width: 110,

      render: (v) => (
        <Tag
          className="rounded-full text-[10px] px-2"
          color={v === 'Return' ? 'red' : v === 'Refund' ? 'orange' : 'purple'}
        >
          {v}
        </Tag>
      ),
    },

    {
      title: <span className="text-[13px] font-semibold text-[#6b7280]">Order ID</span>,
      dataIndex: 'orderId',
      width: 130,

      render: (v) => <span className="text-[12px] text-[#6b7280]">{v}</span>,
    },

    {
      title: <span className="text-[13px] font-semibold text-[#6b7280]">Amount</span>,
      dataIndex: 'amount',
      align: 'right',
      width: 100,

      render: (v) => (
        <span className={`text-[12px] font-semibold ${v.includes('-') ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>
          {v}
        </span>
      ),
    },

    {
      title: <span className="text-[13px] font-semibold text-[#6b7280]">Status</span>,
      dataIndex: 'status',
      width: 100,
      align: 'center',

      render: (v) => (
        <Tag className="rounded-full text-[11px] px-2" color={v === 'Completed' ? 'green' : 'gold'}>
          {v}
        </Tag>
      ),
    },

    {
      title: <span className="text-[13px] font-semibold text-[#6b7280]">Reason</span>,
      dataIndex: 'reason',
      width: 170,
      ellipsis: true,

      render: (v) => (
        <Tooltip title={v}>
          <span className="text-[12px] text-[#374151] cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },
  ];

  const tableData = [
    {
      key: 1,
      transactionId: 'RET-10392',
      marketplace: 'Amazon',
      type: 'Return',
      orderId: 'ORD-92832',
      amount: '- ₹ 1,250',
      status: 'Completed',
      reason: 'Wrong Item Delivered',
    },

    {
      key: 2,
      transactionId: 'REF-72822',
      marketplace: 'Flipkart',
      type: 'Refund',
      orderId: 'ORD-87311',
      amount: '- ₹ 890',
      status: 'Completed',
      reason: 'Damaged Product',
    },

    {
      key: 3,
      transactionId: 'ADJ-99382',
      marketplace: 'Meesho',
      type: 'Adjustment',
      orderId: 'ORD-67211',
      amount: '+ ₹ 460',
      status: 'Pending',
      reason: 'Fee Reversal',
    },

    {
      key: 4,
      transactionId: 'RET-88922',
      marketplace: 'Amazon',
      type: 'Return',
      orderId: 'ORD-21128',
      amount: '- ₹ 2,140',
      status: 'Completed',
      reason: 'Customer Return',
    },
  ];

  return (
    <div className="mt-3 mb-3 space-y-2 px-2">
      {/* HEADER */}

      <div className="shadow-regular rounded-10 px-4 py-2">
        <div className="flex items-center justify-between gap-2 md:flex-col md:items-start">
          <div>
            <h1 className="text-[21px] font-semibold text-dark leading-none mb-0">Returns & Adjustments</h1>

            <p className="text-[12px] text-light leading-4 mt-1 max-w-[680px] mb-0">
              Track returns, refunds, reimbursements and adjustment activities across connected marketplaces.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:w-full sm:flex-wrap">
            <Button icon={<FilterOutlined />} className="text-[13px] h-[30px]">
              Filters
            </Button>

            <Button type="primary" icon={<DownloadOutlined />} className="text-[13px] h-[30px] shadow-none">
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-4 gap-2 xl:grid-cols-2 sm:grid-cols-1">
        {summaryCards.map((item, index) => (
          <div key={index} className="bg-white border border-normal rounded-10 shadow-regular px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[14px] text-light font-medium">{item.title}</p>

                <h2 className="text-[20px] font-semibold text-dark mt-2 leading-none">{item.value}</h2>

                <p className="text-[12px] text-dark-500 mt-1">{item.sub}</p>
              </div>

              <div
                className="w-[38px] h-[38px] rounded-xl flex items-center justify-center text-[16px] font-semibold"
                style={{
                  background: item.bg,
                  color: item.color,
                }}
              >
                ₹
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-3 gap-2 xl:grid-cols-1">
        {/* LINE CHART */}

        <div className="col-span-2 xl:col-span-1 bg-white border border-normal rounded-10 shadow-regular p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-dark">Returns Trend</h2>

            <div className="flex items-center gap-3 text-[12px] text-light sm:hidden">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                Returns
              </div>

              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#f97316]" />
                Refunds
              </div>

              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                Adjustments
              </div>
            </div>
          </div>

          <div className="w-full h-[260px] sm:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />

                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />

                <ReTooltip />

                <Line type="monotone" dataKey="returns" stroke="#ef4444" strokeWidth={2} dot={false} />

                <Line type="monotone" dataKey="refunds" stroke="#f97316" strokeWidth={2} dot={false} />

                <Line type="monotone" dataKey="adjustments" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE */}

        <div className="bg-white border border-normal rounded-10 shadow-regular p-4">
          <h2 className="text-[16px] font-semibold text-dark mb-4">Breakdown</h2>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={72} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />

                  <span>{item.name}</span>
                </div>

                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FILTERS */}

      <div className="bg-white shadow-regular px-3 py-1.5 rounded-10">
        <div className="flex items-center justify-between gap-2 lg:flex-col lg:items-start">
          {/* LEFT FILTERS */}

          <div className="flex items-center gap-2 flex-wrap w-full">
            <Select
              defaultValue="all"
              className="w-[145px] text-[12px] sm:w-full"
              size="small"
              options={[
                { value: 'all', label: 'All Marketplace' },
                { value: 'amazon', label: 'Amazon' },
                { value: 'flipkart', label: 'Flipkart' },
              ]}
            />

            <Select
              defaultValue="all"
              className="w-[115px] text-[12px] sm:w-full"
              size="small"
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'return', label: 'Return' },
                { value: 'refund', label: 'Refund' },
              ]}
            />
          </div>

          {/* SEARCH */}

          <Input
            placeholder="Search Order ID / SKU"
            prefix={<SearchOutlined />}
            size="small"
            className="w-[220px] text-[12px] lg:w-full"
          />
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white border border-normal rounded-10 shadow-regular p-3 overflow-hidden">
        <Table columns={columns} dataSource={tableData} pagination={{ pageSize: 5 }} size="small" scroll={{ x: 900 }} />
      </div>

      {/* BOTTOM */}

      <div className="grid grid-cols-3 gap-3 xl:grid-cols-1">
        {/* INSIGHTS */}

        <div className="bg-white border border-normal rounded-10 shadow-regular p-3 min-h-[180px] flex flex-col">
          <h2 className="text-[16px] font-semibold text-dark mb-2">Insights</h2>

          <div className="space-y-2 mt-1">
            <div>
              <div className="flex items-center justify-between text-[12px] mb-0.5">
                <span>Refund Success</span>
                <span>82%</span>
              </div>

              <Progress percent={82} showInfo={false} size="small" />
            </div>

            <div>
              <div className="flex items-center justify-between text-[12px] mb-0.5">
                <span>Claim Approval</span>
                <span>68%</span>
              </div>

              <Progress percent={68} showInfo={false} size="small" />
            </div>
          </div>
        </div>

        {/* ALERTS */}

        <div className="bg-white border border-normal rounded-10 shadow-regular p-3 min-h-[180px] flex flex-col">
          <h2 className="text-[16px] font-semibold text-dark mb-2">Alerts</h2>

          <div className="space-y-2">
            <div className="flex gap-2 bg-[#fef2f2] rounded-xl p-2">
              <WarningOutlined className="text-[#dc2626] mt-0.5 text-[14px]" />

              <div>
                <p className="text-[12px] font-medium text-dark mb-0">Refund Spike</p>

                <p className="text-[10px] text-light leading-4">Refunds increased by 18% this week.</p>
              </div>
            </div>

            <div className="flex gap-2 bg-[#f0fdf4] rounded-xl p-2">
              <CheckCircleOutlined className="text-[#16a34a] mt-0.5 text-[14px]" />

              <div>
                <p className="text-[12px] font-medium text-dark mb-0">Claims Settled</p>

                <p className="text-[10px] text-light leading-4">24 claims processed successfully.</p>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTION */}

        <div className="bg-white border border-normal rounded-10 shadow-regular p-3 min-h-[180px] flex flex-col">
          <h2 className="text-[16px] font-semibold text-dark mb-2">Quick Actions</h2>

          <div className="space-y-2">
            <Button block icon={<SyncOutlined />} className="h-[32px] text-[13px] rounded-xl">
              Sync Marketplace
            </Button>

            <Button block icon={<DownloadOutlined />} className="h-[32px] text-[13px] rounded-xl">
              Export Report
            </Button>

            <Button type="primary" block className="h-[32px] text-[13px] rounded-xl shadow-none">
              Create Claim
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReturnAdjust;
