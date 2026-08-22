import React, { useEffect, useState } from 'react';
import { Table, Tag, Progress, Row, Col, Spin } from 'antd';
import { ApiOutlined, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { DataService } from '../../config/dataService/dataService';

function MarketplaceIntegrations() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    summary: {
      total_requests: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      connection_rate: 0,
      connected_users_count: 0,
    },
    channel_activity: [],
    insights: {
      top_marketplace: '-',
      success_rate: '0%',
      avg_setup_time: '-',
    },
    connections: [],
  });

  const fetchMarketplaceIntegrations = async () => {
    setLoading(true);
    try {
      const response = await DataService.get('user/admin/marketplace-integrations/');
      if (response?.data?.status && response?.data?.data) {
        setStatsData(response.data.data);
      }
    } catch (err) {
      // Failed to fetch marketplace integrations
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceIntegrations();
  }, []);

  const columns = [
    {
      title: <span className="text-[11px] font-semibold">Request ID</span>,
      dataIndex: 'request_id',
      key: 'request_id',
      width: 100,
      render: (text) => <span className="text-[11px] font-mono">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">User</span>,
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (text) => <span className="text-[11px] font-medium">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Company / Business</span>,
      dataIndex: 'company',
      key: 'company',
      width: 160,
      render: (text) => <span className="text-[11px] text-[#595959]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Marketplace</span>,
      dataIndex: 'marketplace',
      key: 'marketplace',
      width: 130,
      render: (text) => <span className="text-[11px] font-semibold text-blue-600">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Requested Date</span>,
      dataIndex: 'requested_date',
      key: 'requested_date',
      width: 120,
      render: (text) => <span className="text-[11px]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Status</span>,
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const colorMap = {
          Completed: 'green',
          Pending: 'orange',
          'In Progress': 'blue',
          Failed: 'red',
        };

        return (
          <Tag color={colorMap[status] || 'green'} className="text-[10px] px-2 py-[2px] rounded-full">
            {status}
          </Tag>
        );
      },
    },
    {
      title: <span className="text-[11px] font-semibold">Completion Date</span>,
      dataIndex: 'completion_date',
      key: 'completion_date',
      width: 120,
      render: (text) => <span className="text-[11px]">{text}</span>,
    },
  ];

  const summaryCards = [
    {
      title: 'Total Requests',
      value: statsData.summary.total_requests,
      sub: `${statsData.summary.connected_users_count || 0} active client accounts`,
      color: '#22c55e',
      icon: <ApiOutlined style={{ color: '#22c55e', fontSize: '18px' }} />,
    },
    {
      title: 'Pending Onboarding',
      value: statsData.summary.pending,
      sub: 'Needs Attention',
      color: '#f59e0b',
      icon: <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />,
    },
    {
      title: 'In Progress',
      value: statsData.summary.in_progress,
      sub: 'Assigned',
      color: '#3b82f6',
      icon: <SyncOutlined style={{ color: '#3b82f6', fontSize: '18px' }} />,
    },
    {
      title: 'Completed',
      value: statsData.summary.completed,
      sub: `${statsData.summary.connection_rate}% Success`,
      color: '#22c55e',
      icon: <CheckCircleOutlined style={{ color: '#22c55e', fontSize: '18px' }} />,
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen px-5 py-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] mb-0">Marketplace Integrations</h1>
          <p className="text-[#6b7280] text-[12px]">Track, manage and monitor all marketplace onboarding requests.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]} className="mb-3">
            {summaryCards.map((item) => (
              <Col xs={24} sm={12} xl={6} key={item.title}>
                <div className="bg-white shadow-md rounded-xl p-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[#6b7280] text-[13px] mb-0">{item.title}</p>
                      <h2 className="text-[20px] font-bold mt-2">{item.value}</h2>
                      <p className="text-[12px] mt-2 font-medium" style={{ color: item.color }}>
                        {item.sub}
                      </p>
                    </div>

                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${item.color}15`,
                      }}
                    >
                      {item.icon}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* Analytics */}
          <Row gutter={[16, 16]} className="mb-3">
            <Col xs={24} xl={16}>
              <div className="bg-white shadow-sm rounded-xl p-3">
                <div className="mb-2 border-b border-[#f0f0f0] pb-2">
                  <h3 className="text-[16px] font-semibold text-[#111827] mb-0">Channel Connection Activity</h3>
                  <p className="text-[13px] text-[#6b7280]">Track total connected accounts by marketplace channel.</p>
                </div>
                <div className="space-y-1">
                  {statsData.channel_activity.map((item) => (
                    <div key={item.marketplace} className="flex justify-between items-center border-b pb-3">
                      <div>
                        <p className="font-medium mb-1">{item.marketplace}</p>
                        <p className="text-[#6b7280] text-xs">Total Connected: {item.week}</p>
                      </div>

                      <Tag color="green">{item.today} Active</Tag>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col xs={24} xl={8}>
              <div className="bg-white shadow-sm rounded-xl p-3">
                <div className="mb-4 border-b border-[#f0f0f0] pb-3">
                  <h3 className="text-[16px] font-semibold text-[#111827] mb-0">Marketplace Insights</h3>
                </div>
                <div className="space-y-5">
                  <div>
                    <p className="text-[#6b7280] text-xs">Top Marketplace</p>
                    <h3 className="text-lg font-semibold">{statsData.insights.top_marketplace}</h3>
                  </div>

                  <div>
                    <p className="text-[#6b7280] text-xs">Success Rate</p>
                    <h3 className="text-lg font-semibold text-green-600">{statsData.insights.success_rate}</h3>
                  </div>

                  <div>
                    <p className="text-[#6b7280] text-xs">Avg Setup Time</p>
                    <h3 className="text-lg font-semibold">{statsData.insights.avg_setup_time}</h3>
                  </div>

                  <Progress percent={parseFloat(statsData.insights.success_rate) || 0} strokeColor="#22c55e" />
                </div>
              </div>
            </Col>
          </Row>

          {/* Table */}
          <div className="bg-white shadow-sm p-3 rounded-xl">
            <div className="mb-2">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-0">Recent Integration Activity</h3>
              <p className="text-[13px] text-[#6b7280]">Detailed list of all client marketplace connected accounts.</p>
            </div>
            <Table
              columns={columns}
              dataSource={statsData.connections}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default MarketplaceIntegrations;
