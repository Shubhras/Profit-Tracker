import React, { useState } from 'react';
import { Table, Input, Avatar, Tag, Switch, Dropdown, Modal, Button, Select } from 'antd';
import { SearchOutlined, UserOutlined, MoreOutlined } from '@ant-design/icons';

function UsersList() {
  const [searchText, setSearchText] = useState('');
  const [passwordModal, setPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [editModal, setEditModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    plan: '',
    status: true,
  });

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@gmail.com',
      phone: '+91 9876543210',
      plan: 'Premium',
      status: true,
      joinedAt: '12 Jan 2026',
      lastLogin: '11 Jun 2026, 10:30 AM',
    },
    {
      id: 2,
      name: 'Sarah Smith',
      email: 'sarah@gmail.com',
      phone: '+91 9988776655',
      plan: 'Basic',
      status: false,
      joinedAt: '25 Feb 2026',
      lastLogin: '10 Jun 2026, 04:04 AM',
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael@gmail.com',
      phone: '+91 8877665544',
      plan: 'Pro',
      status: true,
      joinedAt: '10 Mar 2026',
      lastLogin: '4 Jun 2026, 10:00 AM',
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
    },
    {
      title: 'Plan',
      dataIndex: 'plan',
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
      render: (_, record) => <Switch checked={record.status} size="small" />,
    },
    {
      title: 'Joined Date',
      dataIndex: 'joinedAt',
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
    },
    {
      title: '',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Edit User',
                onClick: () => {
                  setSelectedUser(record);
                  setEditForm({
                    name: record.name,
                    phone: record.phone,
                    plan: record.plan,
                    status: record.status,
                  });

                  setEditModal(true);
                },
              },
              {
                key: 'password',
                label: 'Change Password',
                onClick: () => {
                  setSelectedUser(record);
                  setPasswordModal(true);
                },
              },
              {
                key: 'history',
                label: 'Login History',
                onClick: () => {
                  setSelectedUser(record);
                  setHistoryModal(true);
                },
              },
              {
                key: 'delete',
                danger: true,
                label: 'Delete User',
              },
            ],
          }}
        >
          <MoreOutlined className="cursor-pointer text-[18px]" />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <div className="p-3 px-2">
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
      <Modal
        title="Change Password"
        open={passwordModal}
        onCancel={() => setPasswordModal(false)}
        footer={null}
        width={420}
      >
        <div className="space-y-4">
          <div className="bg-[#f8fafc] p-3 rounded-lg">
            <p className="mb-0 font-medium">{selectedUser?.name}</p>

            <p className="mb-0 text-gray-500 text-[12px]">{selectedUser?.email}</p>
          </div>

          <Input.Password placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <Input.Password
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <Button onClick={() => setPasswordModal(false)}>Cancel</Button>

            <Button type="primary">Update Password</Button>
          </div>
        </div>
      </Modal>

      <Modal title="Edit User" open={editModal} onCancel={() => setEditModal(false)} footer={null} width={500}>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium mb-1">Full Name</label>

            <Input
              value={editForm.name}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1">Mobile Number</label>

            <Input
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  phone: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-1">Subscription Plan</label>

            <Select
              value={editForm.plan}
              style={{ width: '100%' }}
              onChange={(value) =>
                setEditForm({
                  ...editForm,
                  plan: value,
                })
              }
              options={[
                { value: 'Basic', label: 'Basic' },
                { value: 'Premium', label: 'Premium' },
                { value: 'Pro', label: 'Pro' },
              ]}
            />
          </div>

          <div className="flex items-center justify-between bg-[#f8fafc] p-3 rounded-lg">
            <div>
              <p className="mb-0 font-medium">User Status</p>

              <p className="mb-0 text-[12px] text-gray-500">Enable or disable account</p>
            </div>

            <Switch
              checked={editForm.status}
              onChange={(checked) =>
                setEditForm({
                  ...editForm,
                  status: checked,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setEditModal(false)}>Cancel</Button>

            <Button type="primary">Save Changes</Button>
          </div>
        </div>
      </Modal>

      <Modal
        title="Login History"
        open={historyModal}
        footer={null}
        onCancel={() => setHistoryModal(false)}
        width={500}
      >
        <div className="space-y-3">
          <div className="border rounded-lg p-3">
            <div className="font-medium">Chrome - Windows</div>

            <div className="text-gray-500 text-[12px]">11 Jun 2026, 10:30 AM</div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="font-medium">Mobile App</div>

            <div className="text-gray-500 text-[12px]">10 Jun 2026, 08:12 PM</div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="font-medium">Chrome - Mac</div>

            <div className="text-gray-500 text-[12px]">09 Jun 2026, 11:40 AM</div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default UsersList;
