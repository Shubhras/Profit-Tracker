import React, { useState } from 'react';
import { Table, DatePicker, Input, Button, Breadcrumb } from 'antd';
import {
  DownloadOutlined,
  SearchOutlined,
  ReloadOutlined,
  FilterOutlined,
  InboxOutlined,
  GiftOutlined,
  SyncOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;

function ReturnRefundFees() {
  const [search, setSearch] = useState('');
  const [marketplace, setMarketplace] = useState('amazon');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');

  /* ---------------- Stat cards ---------------- */
  const cards = [
    {
      title: 'Total Returned Orders',
      value: '48',
      growth: '+5.32%',
      trend: 'up',
      icon: <InboxOutlined />,
      bg: 'bg-[#f3f8ff]',
      border: 'border-[#dbe9ff]',
      iconBg: 'bg-[#e2edff]',
      iconColor: 'text-[#2f6fed]',
    },
    {
      title: 'Courier Returns',
      value: '62',
      growth: '+8.70%',
      trend: 'up',
      icon: <GiftOutlined />,
      bg: 'bg-[#f2fbf6]',
      border: 'border-[#d6f2e2]',
      iconBg: 'bg-[#dcf5e7]',
      iconColor: 'text-[#17a562]',
    },
    {
      title: 'Customer Return Refund',
      value: '₹4,567',
      growth: '+8.35%',
      trend: 'up',
      icon: <span className="text-[16px] font-semibold leading-none">₹</span>,
      bg: 'bg-[#fff5f3]',
      border: 'border-[#ffdfd8]',
      iconBg: 'bg-[#ffe5df]',
      iconColor: 'text-[#f2612c]',
    },
    {
      title: 'Customer Return Replacement',
      value: '12',
      growth: '-0.12%',
      trend: 'down',
      icon: <SyncOutlined />,
      bg: 'bg-[#f7f5ff]',
      border: 'border-[#e5e0ff]',
      iconBg: 'bg-[#ebe6ff]',
      iconColor: 'text-[#6d4aff]',
    },
  ];

  /* ---------------- Table ---------------- */
  const columns = [
    { title: 'OrderId', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Transaction Id', dataIndex: 'transactionId', key: 'transactionId', align: 'center' },
    { title: 'Return Amount', dataIndex: 'returnAmount', key: 'returnAmount', align: 'center' },
    { title: 'Return Items', dataIndex: 'returnItems', key: 'returnItems', align: 'center' },
    { title: 'Item Qty', dataIndex: 'itemQty', key: 'itemQty', align: 'center' },
    { title: 'Tax', dataIndex: 'tax', key: 'tax', align: 'center' },
    { title: 'Shipping', dataIndex: 'shipping', key: 'shipping', align: 'center' },
  ];

  const dataSource = [
    {
      key: 1,
      orderId: 'ORD001',
      transactionId: 'TXN987654',
      returnAmount: '₹1,250',
      returnItems: 'T-Shirt',
      itemQty: 2,
      tax: '₹125',
      shipping: '₹50',
    },
    {
      key: 2,
      orderId: 'ORD002',
      transactionId: 'TXN987655',
      returnAmount: '₹2,800',
      returnItems: 'Shoes',
      itemQty: 1,
      tax: '₹280',
      shipping: '₹80',
    },
    {
      key: 3,
      orderId: 'ORD003',
      transactionId: 'TXN987656',
      returnAmount: '₹950',
      returnItems: 'Headphones',
      itemQty: 1,
      tax: '₹95',
      shipping: '₹40',
    },
    {
      key: 4,
      orderId: 'ORD004',
      transactionId: 'TXN987657',
      returnAmount: '₹3,450',
      returnItems: 'Smart Watch',
      itemQty: 1,
      tax: '₹345',
      shipping: '₹100',
    },
  ];
  const handleReset = () => {
    setSearch('');
    setMarketplace('amazon');
    setStatus('all');
    setType('all');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-3 px-4">
      {/* Breadcrumb + Title + Export */}
      <div className="mb-3 flex flex-col gap-3 min-lg:flex-row min-lg:items-start min-lg:justify-between">
        <div className="min-w-0 flex-1">
          <Breadcrumb
            className="mb-1 [&_*]:!text-[11px]"
            items={[{ title: 'Profit' }, { title: <span className="text-[#111827]">Return Tracker</span> }]}
          />
          <h1 className="mb-0 text-[20px] font-semibold leading-tight text-[#111827]">Return Tracker</h1>
          <p className="mt-1 mb-0 text-[12px] text-[#6b7280]">
            Track and manage all returned orders with complete details.
          </p>
        </div>

        <Button
          icon={<DownloadOutlined style={{ fontSize: 14 }} />}
          className="!h-[34px] !rounded-lg !border-[#e5e7eb] !text-[12px] !font-medium !text-[#374151] !shadow-sm"
        >
          Export
          {/* <DownOutlined style={{ fontSize: 9 }} /> */}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3 lg:grid-cols-2 sm:grid-cols-1">
        {cards.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 rounded-2xl border-4 border-white shadow-md ${item.bg} px-3 py-3`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor} text-[18px]`}
            >
              {item.icon}
            </div>

            <div className="min-w-0">
              <h3 className="mb-1 truncate text-[12px] font-medium text-[#6b7280]">{item.title}</h3>
              <h2 className="mb-0 text-[20px] font-bold leading-none tracking-tight text-[#111827]">{item.value}</h2>
              <p
                className={`mt-1.5 mb-0 text-[10px] font-semibold ${item.trend === 'up' ? 'text-[#ef4444]' : 'text-[#16a34a]'
                  }`}
              >
                {item.trend === 'up' ? '↑' : '↓'} {item.growth}
                <span className="ml-1 font-normal text-[#9ca3af]">vs previous period</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="mt-3 rounded-lg border border-[#e5e7eb] bg-white px-3 py-3 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-[230px] flex-col gap-1 sm:w-full">
            <label className="text-[12px] font-medium text-[#111827]">Return Date</label>

            <RangePicker
              format="DD/MM/YYYY"
              suffixIcon={<CalendarOutlined className="!text-[#2f6fed]" />}
              className="!h-[34px] !w-full !rounded-lg !border-[#e5e7eb] !text-[12px]"
            />
          </div>

          <div className="flex w-[150px] flex-col gap-1 sm:w-full">
            <label className="text-[12px] font-medium text-[#111827]">Marketplace</label>
            <select
              value={marketplace}
              onChange={(event) => setMarketplace(event.target.value)}
              className="h-[34px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-[12px] text-[#374151] outline-none"
            >
              <option value="amazon">Amazon</option>
              <option value="flipkart">Flipkart</option>
              <option value="meesho">Meesho</option>
            </select>
          </div>

          <div className="flex w-[150px] flex-col gap-1 sm:w-full">
            <label className="text-[12px] font-medium text-[#111827]">Return Status</label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-[34px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-[12px] text-[#374151] outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="received">Received</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex w-[150px] flex-col gap-1 sm:w-full">
            <label className="text-[12px] font-medium text-[#111827]">Return Type</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-[34px] w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-[12px] text-[#374151] outline-none"
            >
              <option value="all">All Types</option>
              <option value="customer">Customer Return</option>
              <option value="courier">Courier Return</option>
            </select>
          </div>
          <div className="min-w-[220px] flex-1 sm:w-full">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<SearchOutlined className="!text-[#9ca3af]" />}
              placeholder="Search by Order ID, Product ID or SKU..."
              className="!h-[34px] !rounded-lg !border-[#e5e7eb] !text-[12px]"
            />
          </div>

          <div className="flex items-center gap-2 sm:w-full">
            <Button
              onClick={handleReset}
              icon={<ReloadOutlined style={{ fontSize: 14 }} />}
              className="!h-[34px] !rounded-lg !border-[#e5e7eb] !text-[12px] !font-medium !text-[#374151] flex items-center"
            >
              Reset
            </Button>

            <Button
              type="primary"
              icon={<FilterOutlined style={{ fontSize: 14 }} />}
              className="flex items-center !h-[34px] !rounded-lg !border-none !bg-gradient-to-r !from-[#16a34a] !to-[#0d9488] !text-[12px] !font-medium !shadow-sm"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm">
        <h2 className="mb-3 text-[14px] font-semibold text-[#111827]">Recent Orders</h2>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          size="small"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 900 }}
          className="
            [&_.ant-table-thead>tr>th]:!bg-[#f9fafb]
            [&_.ant-table-thead>tr>th]:!text-[12px]
            [&_.ant-table-thead>tr>th]:!font-semibold
            [&_.ant-table-tbody>tr>td]:!text-[12px]
          "
        />
      </div>
    </div>
  );
}

export default ReturnRefundFees;
