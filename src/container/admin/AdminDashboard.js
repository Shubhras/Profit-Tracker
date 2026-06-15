import React, { useEffect } from 'react';
import { Row, Col, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { UserOutlined, DollarOutlined, TeamOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { getAdminDashboard } from '../../redux/admin/actionCreator';

function AdminDashboard() {
  const dispatch = useDispatch();

  const { getadmindashboard } = useSelector((state) => state.AdminDashboard);
  useEffect(() => {
    dispatch(getAdminDashboard());
  }, [dispatch]);

  useEffect(() => {
    console.log('Dashboard Response:', getadmindashboard);
  }, [getadmindashboard]);

  const overviewData =
    getadmindashboard?.data?.monthly_signups?.graph?.map((item) => ({
      day: item.day,
      count: item.count,
    })) || [];

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

  const dashboardStats = [
    {
      title: 'Total Users',
      value: getadmindashboard?.data?.overview?.total_users || 0,
      growth: `+${getadmindashboard?.data?.overview?.new_this_month || 0}`,
      icon: <UserOutlined />,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Inactive Users',
      value: getadmindashboard?.data?.subscription_summary?.inactive || 0,
      growth: '',
      icon: <TeamOutlined />,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Trial Users',
      value: getadmindashboard?.data?.subscription_summary?.trial || 0,
      growth: '',
      icon: <ShoppingCartOutlined />,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Paid Users',
      value: getadmindashboard?.data?.subscription_summary?.paid || 0,
      growth: '',
      icon: <DollarOutlined />,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <div className="px-4 py-4 bg-[#f5f7fb] min-h-screen">
      {' '}
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-[20px] mb-0 font-semibold text-gray-900">Super Admin Dashboard</h1>
        {/* <p className="text-gray-500 text-[12px]">
          Manage users, monitor platform activity and control system settings.
        </p> */}
      </div>
      <Row gutter={[16, 16]} className="mb-3">
        {dashboardStats.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <div className="bg-white border border-gray-100 rounded-2xl p-3 shadow-md hover:shadow-lg transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs mb-1">{card.title}</p>

                  <h2 className="text-[20px] font-bold text-gray-800 mb-1">{card.value}</h2>

                  <span className="text-green-500 text-xs font-medium">↑ {card.growth}</span>
                </div>

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]} className="mb-5">
        {/* Overview */}
        <Col xs={24} lg={24}>
          <div className="bg-white rounded-2xl shadow-sm p-3 h-[320px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-[15px]"> Monthly Signups</h3>

              <span className="text-xs text-gray-400">Last 30 Days</span>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis dataKey="day" tick={{ fontSize: 11 }} />

                <YAxis tick={{ fontSize: 11 }} />

                <Tooltip />

                <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
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
