import React, { useState } from 'react';
import { Table, Input, Avatar, Tag, Switch, Tooltip } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';

function UsersList() {
  const [searchText, setSearchText] = useState('');

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@gmail.com',
      phone: '+91 9876543210',
      plan: 'Premium',
      status: true,
      joinedAt: '12 Jan 2026',
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@gmail.com',
      phone: '+91 9988776655',
      plan: 'Basic',
      status: false,
      joinedAt: '25 Feb 2026',
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael@gmail.com',
      phone: '+91 8877665544',
      plan: 'Pro',
      status: true,
      joinedAt: '10 Mar 2026',
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: 'User',
      width: 250,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} />

          <div>
            <p className="mb-0 text-[12px] font-medium">{record.name}</p>

            <p className="mb-0 text-[11px] text-gray-500">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: 180,
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
      width: 140,
      render: (plan) => {
        let color = 'default';

        if (plan === 'Premium') color = 'gold';
        if (plan === 'Pro') color = 'blue';
        if (plan === 'Basic') color = 'default';

        return <Tag color={color}>{plan}</Tag>;
      },
    },
    {
      title: 'Status',
      width: 120,
      render: (_, record) => <Switch checked={record.status} size="small" />,
    },
    {
      title: 'Joined Date',
      dataIndex: 'joinedAt',
      width: 180,
    },
    {
      title: 'Actions',
      width: 120,
      render: () => (
        <div className="flex items-center gap-3">
          <Tooltip title="Edit">
            <EditOutlined className="cursor-pointer text-gray-500 hover:text-blue-500" />
          </Tooltip>

          <Tooltip title="Delete">
            <DeleteOutlined className="cursor-pointer text-red-400 hover:text-red-600" />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="p-3">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3">
          <div>
            <h2 className="mb-0 text-[20px] font-semibold">Users Management</h2>

            <p className="mb-0 text-[12px] text-gray-500">Manage all platform users</p>
          </div>

          {/* <Button
            type="primary"
            className="h-[30px] text-[12px] font-semibold flex items-center"
            icon={<PlusOutlined />}
          >
            Add User
          </Button> */}
        </div>

        {/* Search */}
        <div className="p-2 border-b">
          <Input
            allowClear
            placeholder="Search user..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-80 h-[30px] text-[12px]"
            size="small"
          />
        </div>

        {/* Table */}
        <div
          className="
            [&_.ant-table-thead>tr>th]:text-[12px]
            [&_.ant-table-thead>tr>th]:font-semibold
            [&_.ant-table-tbody>tr>td]:text-[12px]
          "
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredUsers}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            size="small"
            scroll={{ x: 1000 }}
          />
        </div>
      </div>
    </div>
  );
}

export default UsersList;
