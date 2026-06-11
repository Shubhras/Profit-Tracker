import React, { useState } from 'react';
import { Table, Input, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

function SubscriptionTable() {
  const [searchText, setSearchText] = useState('');

  const subscriptions = [
    {
      id: 1,
      user: 'John Doe',
      email: 'john@example.com',
      plan: 'Pro',
      amountPaid: '$49',
      marketplaces: ['Amazon', 'Flipkart'],
      billingCycle: 'Monthly',
      renewalDate: '01 Jun 2026',
      status: 'Active',
    },
    {
      id: 2,
      user: 'Sarah Smith',
      email: 'sarah@example.com',
      plan: 'Basic',
      amountPaid: '$19',
      marketplaces: ['Amazon'],
      billingCycle: 'Monthly',
      renewalDate: '01 May 2026',
      status: 'Expired',
    },
    {
      id: 3,
      user: 'Michael Brown',
      email: 'michael@example.com',
      plan: 'Enterprise',
      amountPaid: '$99',
      marketplaces: ['Amazon', 'Flipkart', 'Meesho'],
      billingCycle: 'Yearly',
      renewalDate: '10 Jun 2026',
      status: 'Active',
    },
    {
      id: 4,
      user: 'Emma Wilson',
      email: 'emma@example.com',
      plan: 'Pro',
      amountPaid: '$49',
      marketplaces: ['Flipkart'],
      billingCycle: 'Monthly',
      renewalDate: '12 Apr 2026',
      status: 'Cancelled',
    },
    {
      id: 5,
      user: 'David Miller',
      email: 'david@example.com',
      plan: 'Basic',
      amountPaid: '$19',
      marketplaces: ['Amazon', 'Meesho'],
      billingCycle: 'Monthly',
      renewalDate: '15 Jun 2026',
      status: 'Active',
    },
  ];

  const filteredData = subscriptions.filter(
    (item) =>
      item.user.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: <span className="text-[12px] font-semibold">User</span>,
      dataIndex: 'user',
      width: 220,
      render: (_, record) => (
        <div>
          {' '}
          <p className="mb-0 text-[12px] font-medium"> {record.user} </p>{' '}
          <p className="mb-0 text-[11px] text-gray-500"> {record.email} </p>{' '}
        </div>
      ),
    },
    { title: <span className="text-[12px] font-semibold">Plan</span>, dataIndex: 'plan', width: 120 },
    {
      title: <span className="text-[12px] font-semibold"> Amount Paid </span>,
      dataIndex: 'amountPaid',
      width: 120,
      render: (amount) => <span className="font-medium"> {amount} </span>,
    },
    {
      title: <span className="text-[12px] font-semibold"> Marketplaces </span>,
      dataIndex: 'marketplaces',
      width: 240,
      render: (marketplaces) => (
        <div className="flex flex-wrap gap-1">
          {' '}
          {marketplaces.map((item) => (
            <Tag key={item}> {item} </Tag>
          ))}{' '}
        </div>
      ),
    },
    {
      title: <span className="text-[12px] font-semibold"> Billing Cycle </span>,
      dataIndex: 'billingCycle',
      width: 120,
    },
    { title: <span className="text-[12px] font-semibold"> Renewal Date </span>, dataIndex: 'renewalDate', width: 140 },
    {
      title: <span className="text-[12px] font-semibold">Status</span>,
      dataIndex: 'status',
      width: 120,
      render: (status) => {
        let color = 'default';
        if (status === 'Active') color = 'green';
        if (status === 'Expired') color = 'red';
        if (status === 'Cancelled') color = 'orange';
        return <Tag color={color}> {status} </Tag>;
      },
    },
  ];

  return (
    <div className="px-3 py-3">
      {/* Header */}
      <div className="mb-3">
        <h2 className="mb-0 text-[20px] font-semibold">Subscription Management</h2>
        <p className="text-[12px] text-gray-500">Manage all user subscriptions</p>
      </div>

      {/* Search */}
      <div className="mb-3 flex justify-between">
        <Input
          allowClear
          placeholder="Search by user or email"
          prefix={<SearchOutlined />}
          className="w-80 h-[30px] text-[12px]"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <div
          className="
            [&_.ant-table-thead>tr>th]:text-[12px]
            [&_.ant-table-thead>tr>th]:font-semibold
            [&_.ant-table-tbody>tr>td]:text-[12px]
            [&_.ant-table-tbody>tr>td]:py-2
          "
        >
          <Table
            size="small"
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
            }}
            scroll={{ x: 900 }}
          />
        </div>
      </div>
    </div>
  );
}

export default SubscriptionTable;
