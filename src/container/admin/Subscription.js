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
      amount: '$49',
      status: 'Active',
      startDate: '2026-05-01',
      endDate: '2026-06-01',
    },
    {
      id: 2,
      user: 'Sarah Smith',
      email: 'sarah@example.com',
      plan: 'Basic',
      amount: '$19',
      status: 'Expired',
      startDate: '2026-04-01',
      endDate: '2026-05-01',
    },
    {
      id: 3,
      user: 'Michael Brown',
      email: 'michael@example.com',
      plan: 'Enterprise',
      amount: '$99',
      status: 'Active',
      startDate: '2026-05-10',
      endDate: '2026-06-10',
    },
    {
      id: 4,
      user: 'Emma Wilson',
      email: 'emma@example.com',
      plan: 'Pro',
      amount: '$49',
      status: 'Cancelled',
      startDate: '2026-03-12',
      endDate: '2026-04-12',
    },
    {
      id: 5,
      user: 'David Miller',
      email: 'david@example.com',
      plan: 'Basic',
      amount: '$19',
      status: 'Active',
      startDate: '2026-05-15',
      endDate: '2026-06-15',
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
      key: 'user',
      width: 220,
      render: (_, record) => (
        <div>
          <p className="mb-0 text-[12px] font-medium">{record.user}</p>
          <p className="mb-0 text-[11px] text-gray-500">{record.email}</p>
        </div>
      ),
    },
    {
      title: <span className="text-[12px] font-semibold">Plan</span>,
      dataIndex: 'plan',
      key: 'plan',
      width: 120,
      render: (text) => <span className="text-[12px]">{text}</span>,
    },
    {
      title: <span className="text-[12px] font-semibold">Amount</span>,
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (text) => <span className="text-[12px]">{text}</span>,
    },
    {
      title: <span className="text-[12px] font-semibold">Start Date</span>,
      dataIndex: 'startDate',
      key: 'startDate',
      width: 140,
      render: (text) => <span className="text-[12px]">{text}</span>,
    },
    {
      title: <span className="text-[12px] font-semibold">End Date</span>,
      dataIndex: 'endDate',
      key: 'endDate',
      width: 140,
      render: (text) => <span className="text-[12px]">{text}</span>,
    },
    {
      title: <span className="text-[12px] font-semibold">Status</span>,
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status) => {
        let color = 'default';

        if (status === 'Active') color = 'green';
        if (status === 'Expired') color = 'red';
        if (status === 'Cancelled') color = 'orange';

        return (
          <Tag color={color} className="text-[11px] px-2 py-[1px] rounded-md">
            {status}
          </Tag>
        );
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
