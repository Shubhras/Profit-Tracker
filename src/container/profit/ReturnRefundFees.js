import React from 'react';
import { Table } from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

function ReturnRefundFees() {
  const cards = [
    {
      title: 'Total Order',
      value: '12,456',
      growth: '+5.32%',
      //   line: 'bg-green-500',
    },
    {
      title: 'Total Order Return',
      value: '48',
      growth: '+1.25%',
    },
    {
      title: 'Refund Amount',
      value: '4,567',
      growth: '+8.35%',
    },
    {
      title: 'Percentage',
      value: '78%',
      growth: '+5.32%',
    },
  ];

  const columns = [
    {
      title: 'OrderId',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Transaction Id',
      dataIndex: 'transactionId',
      key: 'transactionId',
      align: 'center',
    },
    {
      title: 'Return Amount',
      dataIndex: 'returnAmount',
      key: 'returnAmount',
      align: 'center',
    },
    {
      title: 'Return Items',
      dataIndex: 'returnItems',
      key: 'returnItems',
      align: 'center',
    },
    {
      title: 'Item Qty',
      dataIndex: 'itemQty',
      key: 'itemQty',
      align: 'center',
    },
    {
      title: 'Tax',
      dataIndex: 'tax',
      key: 'tax',
      align: 'center',
    },
    {
      title: 'Shipping',
      dataIndex: 'shipping',
      key: 'shipping',
      align: 'center',
    },
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

  const pieData = [
    { name: 'Returned Orders', value: 48 },
    { name: 'Completed Orders', value: 12408 },
  ];

  const lineData = [
    { month: 'Jan', returns: 12 },
    { month: 'Feb', returns: 18 },
    { month: 'Mar', returns: 24 },
    { month: 'Apr', returns: 15 },
    { month: 'May', returns: 32 },
    { month: 'Jun', returns: 48 },
  ];

  const COLORS = ['#ff7875', '#52c41a'];

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-3 px-3">
      {/* Header */}
      <div className="mb-2 flex flex-col gap-3 min-lg:flex-row min-lg:items-start min-lg:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="mb-0 text-[20px] font-semibold text-[#111827]">Return-Aware Profit Analytics</h1>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-4 xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-3">
        {' '}
        {cards.map((item, index) => (
          <div key={index} className="rounded-2xl border border-[#e5e7eb] bg-white px-3 py-3 shadow-md">
            {/* Top */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[12px] font-semibold text-gray-600">{item.title}</h3>
            </div>

            {/* Value */}
            <h2 className="text-[20px] font-bold leading-none tracking-tight text-[#111827]">{item.value}</h2>

            {/* Growth */}
            <p className="mt-2 text-[10px] font-medium text-green-600">↑ {item.growth} vs 07 Apr - 30 Apr</p>

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

      <div className="flex gap-4 mt-4 lg:flex-col">
        {/* Pie Chart */}
        <div className="w-1/3 lg:w-full bg-white rounded-2xl border border-[#e5e7eb] p-3 shadow-md">
          <h3 className="text-[15px] font-semibold mb-4">Return Distribution</h3>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label={{ fontSize: 11 }}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip />
                <Legend
                  wrapperStyle={{
                    fontSize: '13px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="w-2/3 lg:w-full bg-white rounded-2xl border border-[#e5e7eb] p-3 shadow-md">
          <h3 className="text-[15px] font-semibold mb-4">Monthly Return Trend</h3>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Line type="monotone" dataKey="returns" stroke="#1677ff" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-white p-3">
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          size="small"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 900 }}
          className="
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
