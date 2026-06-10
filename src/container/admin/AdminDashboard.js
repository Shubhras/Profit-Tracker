import React from 'react';
import { Row, Col, Table, Button } from 'antd';

function AdminDashboard() {
  const columns = [
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  const data = [
    {
      key: '1',
      activity: 'New User Registered',
      user: 'John Doe',
      date: '10 Jun 2026',
    },
    {
      key: '2',
      activity: 'Plan Updated',
      user: 'Sarah',
      date: '09 Jun 2026',
    },
    {
      key: '3',
      activity: 'Account Created',
      user: 'Michael',
      date: '08 Jun 2026',
    },
  ];

  return (
    <div className="px-3 py-3">
      {/* Page Header */}
      <div className="mb-3">
        <h1 className="text-[20px] mb-0 font-semibold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-500 text-[12px]">
          Manage users, monitor platform activity and control system settings.
        </p>
      </div>

      <Row gutter={[16, 16]} className="mb-3">
        <Col xs={24} md={12} lg={6}>
          <div className=" bg-white rounded-xl shadow-sm p-3">
            <p className="text-gray-500">Total Users</p>
            <h2 className="text-[16px] font-bold mt-2">2,458</h2>
          </div>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <div className="bg-white rounded-xl shadow-sm p-3">
            <p className="text-gray-500">Active Users</p>
            <h2 className="text-[16px] font-bold mt-2">1,874</h2>
          </div>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <div className="bg-white rounded-xl shadow-sm p-3">
            <p className="text-gray-500">Subscriptions</p>
            <h2 className="text-[16px] font-bold mt-2">982</h2>
          </div>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <div className="bg-white rounded-xl shadow-sm p-3">
            <p className="text-gray-500">Revenue</p>
            <h2 className="text-[16px] font-bold mt-2">$12,480</h2>
          </div>
        </Col>
      </Row>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm mb-3 p-3">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

        <div className="flex flex-wrap gap-3">
          <Button type="primary" className="h-[30px] text-[13px] px-2 font-semibold">
            Manage Users
          </Button>

          <Button className="h-[30px] text-[13px] px-2">View Reports</Button>

          <Button className="h-[30px] text-[13px] px-2">Subscription Plans</Button>

          <Button className="h-[30px] text-[13px] px-2">System Settings</Button>
        </div>
      </div>

      <div className=" bg-white rounded-xl shadow-sm p-3">
        <div className="mb-4">
          <h3 className="text-[17px] font-semibold">Recent Activities</h3>
        </div>

        <Table columns={columns} dataSource={data} pagination={false} />
      </div>
    </div>
  );
}

export default AdminDashboard;
