import React from 'react';
import { Table, Tag, Progress, Button, Row, Col } from 'antd';

function MarketplaceIntegrations() {
  const integrationData = [
    {
      key: 1,
      requestId: 'INT-1001',
      user: 'John Smith',
      company: 'TechStore Pvt Ltd',
      marketplace: 'Amazon',
      integrationType: 'Seller API',
      requestedDate: '05 Jun 2026',
      assignedTo: 'Rahul Sharma',
      status: 'Completed',
      completionDate: '07 Jun 2026',
    },
    {
      key: 2,
      requestId: 'INT-1002',
      user: 'Emma Watson',
      company: 'Fashion Hub',
      marketplace: 'Shopify',
      integrationType: 'Store Sync',
      requestedDate: '06 Jun 2026',
      assignedTo: 'Priya Singh',
      status: 'Pending',
      completionDate: '-',
    },
    {
      key: 3,
      requestId: 'INT-1003',
      user: 'Robert Miller',
      company: 'Electro World',
      marketplace: 'Flipkart',
      integrationType: 'Inventory Sync',
      requestedDate: '07 Jun 2026',
      assignedTo: 'Admin Team',
      status: 'In Progress',
      completionDate: '-',
    },
    {
      key: 4,
      requestId: 'INT-1004',
      user: 'Sophia Lee',
      company: 'Beauty Corner',
      marketplace: 'Meesho',
      integrationType: 'Order Sync',
      requestedDate: '08 Jun 2026',
      assignedTo: 'Rahul Sharma',
      status: 'Completed',
      completionDate: '09 Jun 2026',
    },
    {
      key: 5,
      requestId: 'INT-1005',
      user: 'David Brown',
      company: 'Home Decor',
      marketplace: 'WooCommerce',
      integrationType: 'Catalog Import',
      requestedDate: '09 Jun 2026',
      assignedTo: 'Priya Singh',
      status: 'Failed',
      completionDate: '-',
    },
  ];

  const columns = [
    {
      title: <span className="text-[11px] font-semibold">Request ID</span>,
      dataIndex: 'requestId',
      key: 'requestId',
      width: 100,
      render: (text) => <span className="text-[11px]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">User</span>,
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (text) => <span className="text-[11px]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Company</span>,
      dataIndex: 'company',
      key: 'company',
      width: 150,
      render: (text) => <span className="text-[11px] text-[#595959]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Marketplace</span>,
      dataIndex: 'marketplace',
      key: 'marketplace',
      width: 120,
      render: (text) => <span className="text-[11px]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Integration Type</span>,
      dataIndex: 'integrationType',
      key: 'integrationType',
      width: 140,
      render: (text) => <span className="text-[11px]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Requested Date</span>,
      dataIndex: 'requestedDate',
      key: 'requestedDate',
      width: 120,
      render: (text) => <span className="text-[11px]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Assigned To</span>,
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 130,
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
          <Tag color={colorMap[status]} className="text-[10px] px-2 py-[2px] rounded-full">
            {status}
          </Tag>
        );
      },
    },
    {
      title: <span className="text-[11px] font-semibold">Completion Date</span>,
      dataIndex: 'completionDate',
      key: 'completionDate',
      width: 120,
      render: (text) => <span className="text-[11px]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Action</span>,
      key: 'action',
      width: 90,
      render: () => (
        <Button type="link" size="small" className="text-[11px] p-0 h-auto">
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen px-3 py-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] mb-0">Marketplace Integrations</h1>
          <p className="text-[#6b7280] text-[12px]">Track, manage and monitor all marketplace onboarding requests.</p>
        </div>

        <Button type="primary" size="large" className="h-[30px] text-[12px] px-2 font-semibold">
          New Integration
        </Button>
      </div>

      <Row gutter={[16, 16]} className="mb-3">
        {[
          {
            title: 'Total Requests',
            value: 245,
            sub: '+12% this month',
            color: '#22c55e',
          },
          {
            title: 'Pending',
            value: 42,
            sub: 'Needs Attention',
            color: '#f59e0b',
          },
          {
            title: 'In Progress',
            value: 18,
            sub: 'Assigned',
            color: '#3b82f6',
          },
          {
            title: 'Completed',
            value: 185,
            sub: '92% Success',
            color: '#22c55e',
          },
        ].map((item) => (
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
                  className="w-9 h-9 rounded-xl"
                  style={{
                    background: `${item.color}15`,
                  }}
                />
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Filters */}

      {/* Analytics */}
      <Row gutter={[16, 16]} className="mb-3">
        <Col xs={24} xl={16}>
          <div className="bg-white shadow-sm rounded-xl p-3">
            <div className="mb-2 border-b border-[#f0f0f0] pb-2">
              <h3 className="text-[16px] font-semibold text-[#111827] mb-0">Recent Integration Activity</h3>
              <p className="text-[13px] text-[#6b7280]">Track recent marketplace integration requests and activity.</p>
            </div>
            <div className="space-y-1">
              {[
                {
                  marketplace: 'Amazon',
                  today: '+15',
                  week: '89',
                },
                {
                  marketplace: 'Shopify',
                  today: '+8',
                  week: '42',
                },
                {
                  marketplace: 'Flipkart',
                  today: '+6',
                  week: '31',
                },
                {
                  marketplace: 'Meesho',
                  today: '+4',
                  week: '22',
                },
              ].map((item) => (
                <div key={item.marketplace} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-medium mb-1">{item.marketplace}</p>
                    <p className="text-[#6b7280] text-xs">This week: {item.week}</p>
                  </div>

                  <Tag color="green">{item.today} Today</Tag>
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
                <h3 className="text-lg font-semibold">Amazon</h3>
              </div>

              <div>
                <p className="text-[#6b7280] text-xs">Success Rate</p>
                <h3 className="text-lg font-semibold text-green-600">92%</h3>
              </div>

              <div>
                <p className="text-[#6b7280] text-xs">Avg Setup Time</p>
                <h3 className="text-lg font-semibold">2.3 Days</h3>
              </div>

              <Progress percent={92} strokeColor="#22c55e" />
            </div>
          </div>
        </Col>
      </Row>

      {/* Table */}
      <div className="bg-white shadow-sm p-3">
        <div className="mb-2">
          <h3 className="text-[16px] font-semibold text-[#111827] mb-0">Recent Integration Activity</h3>
          <p className="text-[13px] text-[#6b7280]">Track recent marketplace integration requests and activity.</p>
        </div>
        <Table columns={columns} dataSource={integrationData} pagination={{ pageSize: 5 }} scroll={{ x: 1200 }} />
      </div>
    </div>
  );
}

export default MarketplaceIntegrations;
