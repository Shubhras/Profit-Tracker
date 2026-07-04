import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message } from 'antd';
import { PlusOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getSubUsers, createSubUsers } from '../../redux/admin/actionCreator';

function AdminUsers() {
  const [createModal, setCreateModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const [permissions, setPermissions] = useState([]);

  const dispatch = useDispatch();

  const { getSubUserslist, loading } = useSelector((state) => state.AdminDashboard);

  useEffect(() => {
    dispatch(getSubUsers());
  }, [dispatch]);

  const handleSubmit = () => {
    const payload = {
      name,
      email,
      password,
      mobile_number: mobileNumber,
      permissions,
    };

    dispatch(
      createSubUsers(payload, (success, res) => {
        if (success) {
          message.success(res.message);

          setCreateModal(false);

          setName('');
          setEmail('');
          setPassword('');
          setMobileNumber('');
          setPermissions([]);

          dispatch(getSubUsers());
        } else {
          message.error(res?.message || 'Something went wrong');
        }
      }),
    );
  };

  const userData =
    getSubUserslist?.results?.data?.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      mobile_number: item.mobile_number,
      username: item.username,
      permissions: item.permissions,
      created_at: item.created_at,
    })) || [];

  const columns = [
    {
      title: '#',
      render: (_, __, index) => index + 1,
      width: 70,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'User Name',
      dataIndex: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile_number',
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
    },

    {
      title: '',
      key: 'action',
      align: 'center',
      width: 120,
      render: () => (
        <div className="flex items-center justify-center gap-1">
          <Button
            type="text"
            icon={<FormOutlined className="text-blue-600 text-[16px]" />}
            // onClick={() => handleEdit(record)}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined className="text-red-500 text-[16px]" />}
            // onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-semibold text-gray-800">Admin Users</h2>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="h-8 px-2 rounded-lg text-[14px] font-semibold flex items-center"
              onClick={() => {
                setName('');
                setEmail('');
                setPassword('');
                setMobileNumber('');
                setPermissions([]);
                setCreateModal(true);
              }}
            >
              Create SubUsers
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={userData}
            rowKey="id"
            loading={loading}
            size="small"
            className="
    [&_.ant-table-thead>tr>th]:!text-[13px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[13px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
          />
        </div>
      </div>

      <Modal
        open={createModal}
        footer={null}
        centered
        width={650}
        destroyOnClose
        onCancel={() => setCreateModal(false)}
      >
        <div className="p-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Create Admin User</h2>

            <p className="text-gray-500 text-sm mt-1">Fill in the details below to create a new admin user.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Full Name</label>

              <Input
                placeholder="Enter full name"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Email Address</label>

              <Input placeholder="Enter email" size="small" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>

              <Input.Password
                size="small"
                className="h-8"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Mobile Number</label>

              <Input
                size="small"
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-7 border-t pt-4">
            <Button onClick={() => setCreateModal(false)}>Cancel</Button>

            <Button type="primary" className="font-semibold px-4" onClick={handleSubmit}>
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AdminUsers;
