import React from 'react';
import { Button, Input, Select, Table, Tabs, Progress, Tag } from 'antd';

import { FilterOutlined, DownloadOutlined, SearchOutlined } from '@ant-design/icons';

import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Amazon from '../../assets/icons/amazon.svg';

import Flipkart from '../../assets/icons/flipkart.png';
import Meesho from '../../assets/icons/meesho.png';
import Myntra from '../../assets/icons/myntra.png';

function ReimbursementPlan() {
  const summaryCards = [
    {
      title: 'Total Claims Amount',
      value: '₹ 1,25,430.50',
      sub: 'From 185 Claims',
      color: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      title: 'Claims Submitted',
      value: '₹ 78,850.20',
      sub: '102 Claims',
      color: '#9333ea',
      bg: '#faf5ff',
    },
    {
      title: 'Approved Amount',
      value: '₹ 52,620.30',
      sub: '72 Claims',
      color: '#16a34a',
      bg: '#f0fdf4',
    },
    {
      title: 'Received Amount',
      value: '₹ 31,560.10',
      sub: '48 Claims',
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      title: 'Pending Amount',
      value: '₹ 46,290.40',
      sub: '54 Claims',
      color: '#f59e0b',
      bg: '#fffbeb',
    },
  ];

  const claimTabs = [
    'All Claims',
    'Submitted',
    'Approved',
    'In Review',
    'Partially Approved',
    'Rejected',
    'Received',
    'Closed',
  ];

  const columns = [
    {
      title: 'Claim ID',
      dataIndex: 'claimId',
      width: 80,
      render: (v) => <span className="text-[11px] text-[#1677ff] font-medium">{v}</span>,
    },

    {
      title: 'Marketplace',
      dataIndex: 'marketplace',
      width: 70,
      align: 'center',

      render: (value) => {
        const marketplaceIcons = {
          Amazon,
          Flipkart,
          Meesho,
          Myntra,
        };

        return <img src={marketplaceIcons[value]} alt={value} className="w-5 h-5 object-contain mx-auto" />;
      },
    },

    {
      title: 'Leak Type / Reason',
      dataIndex: 'reason',
      width: 100,
      render: (v) => <span className="text-[11px]">{v}</span>,
    },

    {
      title: 'Order ID',
      dataIndex: 'orderId',
      width: 70,
      render: (v) => <span className="text-[11px]">{v}</span>,
    },

    {
      title: 'Claim Amount',
      dataIndex: 'claimAmount',
      width: 70,
      align: 'center',
      render: (v) => <span className="text-[11px]">{v}</span>,
    },

    {
      title: 'Approved Amount',
      dataIndex: 'approvedAmount',
      width: 80,
      align: 'center',
      render: (v) => <span className="text-[11px]">{v}</span>,
    },

    {
      title: 'Received Amount',
      dataIndex: 'receivedAmount',
      width: 80,
      align: 'center',
      render: (v) => <span className="text-[11px] text-[#16a34a] font-medium">{v}</span>,
    },

    {
      title: 'Status',
      dataIndex: 'status',
      width: 110,
      render: (v) => (
        <Tag className="text-[11px]" color="green">
          {v}
        </Tag>
      ),
    },
  ];

  const tableData = [
    {
      key: 1,
      claimId: 'CLM-245115',
      marketplace: 'Amazon',
      reason: 'Shipping Leak',
      orderId: '405-12345',
      claimAmount: '₹ 1,250',
      approvedAmount: '₹ 1,250',
      receivedAmount: '₹ 1,250',
      status: 'Received',
    },
    {
      key: 2,
      claimId: 'CLM-245116',
      marketplace: 'Flipkart',
      reason: 'Return Leak',
      orderId: 'OD334521',
      claimAmount: '₹ 2,450',
      approvedAmount: '₹ 2,450',
      receivedAmount: '₹ 2,450',
      status: 'Received',
    },
    {
      key: 3,
      claimId: 'CLM-245117',
      marketplace: 'Meesho',
      reason: 'Commission Leak',
      orderId: 'MS876543',
      claimAmount: '₹ 620',
      approvedAmount: '₹ 620',
      receivedAmount: '₹ 0',
      status: 'Approved',
    },
    {
      key: 4,
      claimId: 'CLM-215117',
      marketplace: 'Meesho',
      reason: 'Commission',
      orderId: 'MS875643',
      claimAmount: '₹ 320',
      approvedAmount: '₹ 320',
      receivedAmount: '₹ 1',
      status: 'Approved',
    },
    {
      key: 5,
      claimId: 'CLM-245118',
      marketplace: 'Amazon',
      reason: 'Shipping Damage',
      orderId: '405-65432',
      claimAmount: '₹ 1,850',
      approvedAmount: '₹ 1,650',
      receivedAmount: '₹ 1,650',
      status: 'Received',
    },
    {
      key: 6,
      claimId: 'CLM-245119',
      marketplace: 'Flipkart',
      reason: 'Weight Discrepancy',
      orderId: 'OD445621',
      claimAmount: '₹ 980',
      approvedAmount: '₹ 850',
      receivedAmount: '₹ 0',
      status: 'In Review',
    },
    {
      key: 7,
      claimId: 'CLM-245120',
      marketplace: 'Amazon',
      reason: 'Lost Shipment',
      orderId: '405-88991',
      claimAmount: '₹ 3,450',
      approvedAmount: '₹ 3,450',
      receivedAmount: '₹ 0',
      status: 'Approved',
    },
    {
      key: 8,
      claimId: 'CLM-245121',
      marketplace: 'Myntra',
      reason: 'Return Processing Fee',
      orderId: 'MY554321',
      claimAmount: '₹ 760',
      approvedAmount: '₹ 760',
      receivedAmount: '₹ 760',
      status: 'Received',
    },
    {
      key: 9,
      claimId: 'CLM-245122',
      marketplace: 'Jiomart',
      reason: 'Incorrect Fee Charge',
      orderId: 'JM887541',
      claimAmount: '₹ 1,120',
      approvedAmount: '₹ 950',
      receivedAmount: '₹ 0',
      status: 'Submitted',
    },
    {
      key: 10,
      claimId: 'CLM-245123',
      marketplace: 'Meesho',
      reason: 'RTO Adjustment',
      orderId: 'MS667781',
      claimAmount: '₹ 540',
      approvedAmount: '₹ 540',
      receivedAmount: '₹ 540',
      status: 'Received',
    },
    {
      key: 11,
      claimId: 'CLM-245124',
      marketplace: 'Amazon',
      reason: 'Tax Adjustment',
      orderId: '405-11223',
      claimAmount: '₹ 2,240',
      approvedAmount: '₹ 1,980',
      receivedAmount: '₹ 0',
      status: 'In Review',
    },
    {
      key: 12,
      claimId: 'CLM-245125',
      marketplace: 'Flipkart',
      reason: 'Commission Mismatch',
      orderId: 'OD998871',
      claimAmount: '₹ 890',
      approvedAmount: '₹ 890',
      receivedAmount: '₹ 890',
      status: 'Received',
    },
  ];

  return (
    <div className="mt-3 mb-3 space-y-3 px-2">
      {/* HEADER */}

      <div>
        <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start">
          <div>
            <h1 className="text-[20px] font-semibold text-dark mb-0">Reimbursement Tracker</h1>

            <p className="text-[13px] text-light">Track your reimbursement claims, approvals and recoveries.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button icon={<FilterOutlined />} className="h-[32px] text-[13px]">
              Filters
            </Button>

            <Button type="primary" icon={<DownloadOutlined />} className="h-[32px] text-[13px]">
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-5 gap-3 xl:grid-cols-3 lg:grid-cols-2 sm:grid-cols-1">
        {summaryCards.map((item) => (
          <div key={item.title} className="rounded-10 border border-normal px-3 py-3" style={{ background: item.bg }}>
            <p className="text-[12px] font-medium leading-none mb-2" style={{ color: item.color }}>
              {item.title}
            </p>

            <h3 className="text-[18px] font-semibold leading-none mb-2" style={{ color: item.color }}>
              {item.value}
            </h3>

            <p className="text-[10px] text-light leading-none">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* FILTERS */}

      <div className="bg-white rounded-10 border border-normal shadow-regular px-2 py-1.5">
        <div className="grid grid-cols-6 gap-2 xl:grid-cols-3 sm:grid-cols-1">
          <Select
            size="small"
            className="text-[11px]"
            defaultValue="All Marketplaces"
            options={[
              { label: 'All Marketplaces', value: 'all' },
              { label: 'Amazon', value: 'amazon' },
              { label: 'Flipkart', value: 'flipkart' },
            ]}
          />

          <Select
            size="small"
            className="text-[11px]"
            defaultValue="All Status"
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Submitted', value: 'submitted' },
              { label: 'Approved', value: 'approved' },
            ]}
          />

          <Select
            size="small"
            defaultValue="All Types"
            className="text-[11px]"
            options={[
              { label: 'All Types', value: 'all' },
              { label: 'Shipping Leak', value: 'shipping' },
              { label: 'Return Leak', value: 'return' },
            ]}
          />
          <Input size="small" value="01/05/2026 - 31/05/2026" readOnly className="h-[30px] text-[11px]" />

          <Input
            size="small"
            prefix={<SearchOutlined className="text-[10px]" />}
            placeholder="Search Claim ID / Order ID"
            className="h-[30px] text-[11px]"
          />
          <Button icon={<FilterOutlined />} className="h-[30px] text-[11px]">
            Filters
          </Button>
        </div>
      </div>

      {/* CONTENT */}

      <div className="grid grid-cols-4 gap-2 xl:grid-cols-1">
        {/* TABLE */}

        <div className="col-span-3 xl:col-span-1 bg-white rounded-10 border border-normal shadow-regular p-3">
          <Tabs
            size="small"
            className="[&_.ant-tabs-nav]:mb-3
               [&_.ant-tabs-tab]:px-0
               [&_.ant-tabs-tab]:mr-7
               [&_.ant-tabs-tab-btn]:text-[11px]
               [&_.ant-tabs-tab-btn]:font-medium"
            items={claimTabs.map((tab, index) => ({
              key: String(index),
              label: tab,
            }))}
          />

          <Table
            className="[&_.ant-table-thead_th]:text-[11px] [&_.ant-table-thead_th]:font-semibold"
            size="small"
            pagination={false}
            scroll={{ x: 800 }}
            columns={columns}
            dataSource={tableData}
          />
        </div>
        {/* SIDEBAR */}

        <div className="bg-white rounded-10 border border-normal shadow-regular p-3">
          {/* SUMMARY */}

          <h3 className="text-[13px] font-semibold text-dark mb-3">Reimbursement Summary</h3>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-[100px] h-[100px] flex-shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Received', value: 31560, color: '#10b981' },
                      { name: 'Approved', value: 21060, color: '#3b82f6' },
                      { name: 'In Review', value: 18450, color: '#f59e0b' },
                      { name: 'Submitted', value: 27840, color: '#8b5cf6' },
                      { name: 'Rejected', value: 9120, color: '#ef4444' },
                      { name: 'Partially Received', value: 17400, color: '#d1d5db' },
                    ]}
                    innerRadius={34}
                    outerRadius={50}
                    dataKey="value"
                  >
                    {['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#d1d5db'].map((color, index) => (
                      <Cell key={index} fill={color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[8px] text-light">Total Claimable</span>

                <span className="text-[12px] font-semibold text-dark">₹ 25,430.50</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              {[
                ['Received', '₹ 31,560.10', '#10b981'],
                ['Approved', '₹ 21,060.20', '#3b82f6'],
                ['In Review', '₹ 18,450.00', '#f59e0b'],
                ['Submitted', '₹ 27,840.00', '#8b5cf6'],
                ['Rejected', '₹ 9,120.00', '#ef4444'],
                ['Partially Received', '₹ 17,400.00', '#d1d5db'],
              ].map(([label, amount, color]) => (
                <div key={label} className="flex items-center justify-between text-[9px]">
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full" style={{ background: color }} />

                    <span>{label}</span>
                  </div>

                  <span className="font-medium">{amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* REASONS */}

          <div className="border-t border-normal pt-3">
            <h3 className="text-[13px] font-semibold text-dark mb-3">Top Reasons by Claim Amount</h3>

            <div className="space-y-2">
              {[
                ['Shipping & Delivery Leaks', '₹ 32,450.20', 92],
                ['Refund / Return Leaks', '₹ 28,560.20', 80],
                ['Fee / Commission Leaks', '₹ 21,890.30', 68],
                ['Tax / VAT Leaks', '₹ 18,320.45', 55],
                ['Adjustments', '₹ 16,890.15', 48],
                ['Others', '₹ 7,319.20', 22],
              ].map(([label, amount, percent]) => (
                <div key={label}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span>{label}</span>
                    <span className="font-medium">{amount}</span>
                  </div>

                  <Progress percent={percent} showInfo={false} strokeWidth={5} />
                </div>
              ))}

              <button type="button" className="text-[10px] font-medium text-[#1677ff]">
                View All Reasons →
              </button>
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div className="border-t border-normal pt-3 mt-3">
            <h3 className="text-[13px] font-semibold text-dark mb-3">Quick Actions</h3>

            <div className="space-y-2">
              <div className="flex gap-2 cursor-pointer">
                <DownloadOutlined className="text-[13px]" />
                <div>
                  <p className="text-[11px] font-medium mb-0">Download Reimbursement Report</p>
                  <p className="text-[10px] text-light">Export all reimbursement claims</p>
                </div>
              </div>

              <div className="flex gap-2 cursor-pointer">
                <SearchOutlined className="text-[13px]" />
                <div>
                  <p className="text-[11px] font-medium mb-0">Track Pending Claims</p>
                  <p className="text-[10px] text-light">View claims awaiting response</p>
                </div>
              </div>

              <div className="flex gap-2 cursor-pointer">
                <FilterOutlined className="text-[13px]" />
                <div>
                  <p className="text-[11px] font-medium mb-0">Create New Claim</p>
                  <p className="text-[10px] text-light">Raise a new reimbursement claim</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReimbursementPlan;
