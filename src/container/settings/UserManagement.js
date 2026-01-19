import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Spin, Empty } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';

const { Option } = Select;

export default function UserManagement() {
  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Settings' },
    { path: '', breadcrumbName: 'User Settings' },
    { path: '', breadcrumbName: 'User Management' },
  ];

  const [users, setUsers] = useState([]); // table data
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  /* ================= TABLE ================= */

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            status === 'Active' ? 'bg-success-transparent text-success' : 'bg-danger-transparent text-danger'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Roles',
      dataIndex: 'role',
      key: 'role',
    },
  ];

  /* ================= CREATE USER ================= */

  const handleCreateUser = async () => {
    try {
      const values = await form.validateFields();
      console.log('Create User Payload 👉', values);

      setLoading(true);

      setTimeout(() => {
        setUsers((prev) => [
          ...prev,
          {
            key: Date.now(),
            name: values.name,
            email: values.email,
            mobile: values.mobile,
            status: 'Active',
            role: values.role,
          },
        ]);

        setLoading(false);
        setOpen(false);
        form.resetFields();
      }, 1000);
    } catch (error) {
      console.log('Validation Failed', error);
    }
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="User Management"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 bg-transparent"
      />

      <main className="min-h-[715px] flex-1 px-8 xl:px-[15px] pb-[30px]">
        <div className="bg-white dark:bg-white10 rounded-[10px] p-[20px]">
          {/* HEADER ACTION */}
          <div className="flex justify-end mb-4">
            <Button type="primary" onClick={() => setOpen(true)}>
              Add New User
            </Button>
          </div>

          {/* TABLE */}
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={users}
              pagination={false}
              locale={{
                emptyText: <Empty description="No users found" className="py-10" />,
              }}
            />
          </Spin>
        </div>
      </main>

      {/* ================= MODAL ================= */}

      <Modal title="Add New User" open={open} onCancel={() => setOpen(false)} footer={null} centered>
        <p className="text-gray-500 mb-4">Enter the following details to create new user</p>

        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Enter name' }]}>
            <Input placeholder="Enter Name" />
          </Form.Item>

          <Form.Item
            label="Email address"
            name="email"
            rules={[
              { required: true, message: 'Enter email' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input placeholder="Enter Email" />
          </Form.Item>

          <Form.Item label="Mobile Number" name="mobile" rules={[{ required: true, message: 'Enter mobile number' }]}>
            <Input placeholder="Enter Mobile number" />
          </Form.Item>

          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Enter password' }]}>
            <Input.Password placeholder="Enter Password" />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true, message: 'Select role' }]}>
            <Select placeholder="Select Role">
              <Option value="Admin">Admin</Option>
              <Option value="Manager">Manager</Option>
              <Option value="Viewer">Viewer</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" loading={loading} onClick={handleCreateUser}>
              Create User
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
