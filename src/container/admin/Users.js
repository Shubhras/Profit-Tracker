import React, { useState, useEffect } from 'react';
import { Table, Input, Tag, Switch, Modal, Button, Select, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { SearchOutlined } from '@ant-design/icons';
import { getUsersList } from '../../redux/admin/actionCreator';

function UsersList() {
  const [searchText, setSearchText] = useState('');
  const [passwordModal, setPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [editModal, setEditModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);

  const dispatch = useDispatch();

  const { getuserlist, loading } = useSelector((state) => state.AdminDashboard);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    dispatch(getUsersList(pagination.current, pagination.pageSize));
  }, [dispatch, pagination.current, pagination.pageSize]);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    plan: '',
    status: true,
  });

  const dataSource =
    getuserlist?.data?.map((item) => ({
      key: item.user_id,
      user_id: item.user_id,
      name: item.name,
      email: item.email,
      business_name: item.business_name,
      mobile_number: item.mobile_number,
      address: item.address,
      city: item.city,
      state: item.state,
      pin_code: item.pin_code,
      subscription_active: item.subscription_active,
      is_paid_subscription_active: item.is_paid_subscription_active,
      subscription_status: item.subscription_status,
      subscription_plan: item.subscription_plan,
      trial_start_date: item.trial_start_date,
      trial_end_date: item.trial_end_date,
      created_at: item.created_at,
    })) || [];

  const filteredUsers = dataSource.filter(
    (user) =>
      user?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      user?.mobile_number?.includes(searchText),
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      width: 70,
      align: 'center',
      render: (name) => <span className="font-medium text-[#111827]">{name || '-'}</span>,
    },

    {
      title: 'Email',
      dataIndex: 'email',
      width: 70,
      align: 'center',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Mobile',
      dataIndex: 'mobile_number',
      width: 70,
      align: 'center',
      render: (value) => <span className="font-medium text-[#111827]">{value || '-'}</span>,
    },

    {
      title: 'Business',
      dataIndex: 'business_name',
      width: 70,
      align: 'center',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'City',
      dataIndex: 'city',
      width: 70,
      align: 'center',
      render: (value) => <span className="font-medium text-[#111827]">{value || '-'}</span>,
    },

    {
      title: 'State',
      dataIndex: 'state',
      width: 70,
      align: 'center',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Pin Code',
      dataIndex: 'pin_code',
      width: 70,
      align: 'center',
      render: (value) => <span className="font-medium text-[#111827]"> {value || '-'}</span>,
    },

    {
      title: 'Subscription',
      dataIndex: 'subscription_status',
      width: 70,
      align: 'center',
      render: (status) => <Tag color={status === 'active' ? 'green' : 'red'}>{status || 'inactive'}</Tag>,
    },

    {
      title: 'Plan',
      dataIndex: 'subscription_plan',
      width: 70,
      align: 'center',
      render: (plan) => <Tag color={plan ? 'blue' : 'default'}>{plan || 'Trial'}</Tag>,
    },

    // {
    //   title: 'Status',
    //   width: 100,
    //   align: 'center',
    //   render: (_, record) => <Switch checked={record.subscription_active} size="small" />,
    // },

    {
      title: 'Created',
      dataIndex: 'created_at',
      width: 70,
      align: 'center',
      render: (date) => (date ? new Date(date).toLocaleDateString('en-IN') : '-'),
    },

    // {
    //   title: 'Password',
    //   width: 120,
    //   align: 'center',
    //   render: (_, record) => (
    //     <Button
    //       size="small"
    //       icon={<LockOutlined />}
    //       onClick={() => {
    //         setSelectedUser(record);
    //         setPasswordModal(true);
    //       }}
    //     >
    //       Reset
    //     </Button>
    //   ),
    // },

    // {
    //   title: '',
    //   width: 80,
    //   align: 'center',
    //   render: (_, record) => (
    //     <Dropdown
    //       trigger={['click']}
    //       menu={{
    //         items: [
    //           {
    //             key: 'edit',
    //             label: 'Edit User',
    //             onClick: () => {
    //               setSelectedUser(record);

    //               setEditForm({
    //                 name: record.name,
    //                 phone: record.mobile_number,
    //                 plan: record.subscription_plan || '',
    //                 status: record.subscription_active,
    //               });

    //               setEditModal(true);
    //             },
    //           },
    //           {
    //             key: 'history',
    //             label: 'Login History',
    //             onClick: () => {
    //               setSelectedUser(record);
    //               setHistoryModal(true);
    //             },
    //           },
    //           {
    //             key: 'delete',
    //             danger: true,
    //             label: 'Delete User',
    //           },
    //         ],
    //       }}
    //     >
    //       <MoreOutlined className="cursor-pointer text-[18px]" />
    //     </Dropdown>
    //   ),
    // },
  ];

  return (
    <>
      <div className="p-3 px-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-3">
            <div>
              <h2 className="mb-0 text-[20px] font-semibold">Users Management</h2>

              {/* <p className="mb-0 text-[12px] text-gray-500">Manage all platform users</p> */}
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
              rowKey="user_id"
              columns={columns}
              dataSource={filteredUsers}
              loading={loading}
              size="small"
              scroll={{ x: 1000 }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: getuserlist?.pagination?.total_records || 0,
                pageSizeOptions: ['10', '20', '50', '100'],
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
              }}
              onChange={(pag) => {
                setPagination({
                  current: pag.current,
                  pageSize: pag.pageSize,
                });
              }}
            />
          </div>
        </div>
      </div>
      <Modal
        title={null}
        open={passwordModal}
        onCancel={() => setPasswordModal(false)}
        footer={null}
        width={480}
        centered
      >
        <div className="py-1">
          <h2 className="text-[22px] font-semibold text-[#111827] mb-5">Change Password</h2>

          {/* User Info */}
          <div className="mb-5 p-3 rounded-xl border border-[#e5e7eb] bg-[#fafafa]">
            {/* <p className="mb-0 text-[14px] font-semibold text-[#111827]">{selectedUser?.name}</p> */}

            {/* <p className="mb-0 text-[12px] text-[#6b7280]">{selectedUser?.email}</p> */}
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label className="block text-[12px] font-medium text-[#111827] mb-2">New Password</label>

            <Input.Password
              size="large"
              value={password}
              placeholder="Enter new password"
              onChange={(e) => setPassword(e.target.value)}
              className="h-[42px] rounded-xl"
            />

            <div className="mt-2 space-y-1">
              <p className="text-[11px] text-[#ef4444] mb-2">
                Please add all necessary characters to create safe password.
              </p>

              <div className="flex items-center gap-2 text-[11px] text-[#9ca3af]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bdbdbd]" />
                <span>Minimum characters 12</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#ef4444]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                <span>One uppercase character</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#9ca3af]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bdbdbd]" />
                <span>One lowercase character</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#9ca3af]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bdbdbd]" />
                <span>One special character</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-[#9ca3af]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bdbdbd]" />
                <span>One number</span>
              </div>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-[12px] font-medium text-[#111827] mb-2">Confirm New Password</label>

            <Input.Password
              size="large"
              value={confirmPassword}
              placeholder="Enter confirm password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-[42px] rounded-xl"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2">
            <Button className="rounded-lg" onClick={() => setPasswordModal(false)}>
              Cancel
            </Button>

            <Button type="primary" className="rounded-lg px-6">
              Change Password
            </Button>
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
