import React from 'react';
import { Row, Col, Table } from 'antd';
import { UserOutlined, DollarOutlined, TeamOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

function AdminDashboard() {
  const overviewData = [
    {
      day: 'Sat',
      orders: 120,
      profit: 45,
      marketplaces: 8,
    },
    {
      day: 'Sun',
      orders: 150,
      profit: 60,
      marketplaces: 10,
    },
    {
      day: 'Mon',
      orders: 95,
      profit: 35,
      marketplaces: 7,
    },
    {
      day: 'Tue',
      orders: 200,
      profit: 85,
      marketplaces: 12,
    },
    {
      day: 'Wed',
      orders: 140,
      profit: 55,
      marketplaces: 9,
    },
    {
      day: 'Thu',
      orders: 170,
      profit: 75,
      marketplaces: 11,
    },
    {
      day: 'Fri',
      orders: 110,
      profit: 40,
      marketplaces: 8,
    },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 40 },
    { month: 'Feb', revenue: 60 },
    { month: 'Mar', revenue: 30 },
    { month: 'Apr', revenue: 80 },
    { month: 'May', revenue: 45 },
    { month: 'Jun', revenue: 70 },
    { month: 'Jul', revenue: 50 },
    { month: 'Aug', revenue: 65 },
    { month: 'Sep', revenue: 75 },
    { month: 'Oct', revenue: 68 },
    { month: 'Nov', revenue: 35 },
    { month: 'Dec', revenue: 70 },
  ];

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
    <div className="px-4 py-4 bg-[#f5f7fb] min-h-screen">
      {' '}
      {/* Page Header */}
      <div className="mb-3">
        <h1 className="text-[20px] mb-0 font-semibold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-500 text-[12px]">
          Manage users, monitor platform activity and control system settings.
        </p>
      </div>
      <Row gutter={[16, 16]} className="mb-5">
        {[
          {
            title: 'Total Users',
            value: '2,458',
            growth: '+12.5%',
            icon: <UserOutlined />,
            color: 'bg-blue-50 text-blue-600',
          },
          {
            title: 'Active Users',
            value: '1,874',
            growth: '+8.2%',
            icon: <TeamOutlined />,
            color: 'bg-green-50 text-green-600',
          },
          {
            title: 'Subscriptions',
            value: '982',
            growth: '+5.6%',
            icon: <ShoppingCartOutlined />,
            color: 'bg-purple-50 text-purple-600',
          },
          {
            title: 'Revenue',
            value: '$12,480',
            growth: '+18.4%',
            icon: <DollarOutlined />,
            color: 'bg-orange-50 text-orange-600',
          },
        ].map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs mb-1">{card.title}</p>

                  <h2 className="text-2xl font-bold text-gray-800">{card.value}</h2>

                  <span className="text-green-500 text-xs font-medium">↑ {card.growth}</span>
                </div>

                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} className="mb-5">
        {/* Overview */}
        <Col xs={24} lg={14}>
          <div className="bg-white rounded-2xl shadow-sm p-3 h-[320px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[15px]">Overview</h3>

              <span className="text-xs text-gray-400">Last 7 Days</span>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="day" tick={{ fontSize: 11 }} />

                <YAxis tick={{ fontSize: 11 }} />

                <Tooltip />

                <Legend />

                <Bar dataKey="orders" stackId="a" fill="#7c3aed" />

                <Bar dataKey="profit" stackId="a" fill="#a78bfa" />

                <Bar dataKey="marketplaces" stackId="a" fill="#ddd6fe" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>

        {/* Revenue */}
        <Col xs={24} lg={10}>
          <div className="bg-white rounded-2xl shadow-sm p-3 h-[320px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[15px]">Revenue Statistics</h3>

              <span className="text-xs text-gray-400">Last Month</span>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="month" tick={{ fontSize: 11 }} />

                <YAxis tick={{ fontSize: 11 }} />

                <Tooltip />

                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>
      <div className="bg-white rounded-2xl shadow-sm p-5">
        {' '}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[16px] font-semibold">Recent Activities</h3>

          <span className="text-xs text-gray-400">Latest Updates</span>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          size="middle"
          bordered={false}
          className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
