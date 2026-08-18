import React, { useState, useEffect } from 'react';
import { Table, Input, Tag, Button, Modal, Select, Tooltip, Row, Col } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  ApiOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { DataService } from '../../config/dataService/dataService';

function ApiCallLogs() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    summary: {
      total_users: 0,
      total_amazon_accounts: 0,
      total_ads_accounts: 0,
      total_myntra_accounts: 0,
      total_orders: 0,
      total_api_calls: 0,
    },
    user_account_dashboard: [],
    logs: [],
    pagination: {
      current_page: 1,
      total_pages: 1,
      total_records: 0,
      limit: 10,
    },
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('ALL');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [breakdownModal, setBreakdownModal] = useState({
    open: false,
    title: '',
    data: {},
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await DataService.get(
        `user/admin/api-logs/?search=${debouncedSearch}&service_type=${serviceTypeFilter}&page=${pagination.current}&limit=${pagination.pageSize}`,
      );
      if (response.data?.status || response.data?.summary) {
        setData(response.data);
      }
    } catch (err) {
      console.error('Error fetching API logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, serviceTypeFilter, pagination.current, pagination.pageSize]);

  const handleOpenBreakdown = (title, breakdownDict) => {
    setBreakdownModal({
      open: true,
      title,
      data: breakdownDict || {},
    });
  };

  // KPI summary metrics
  const summary = data.summary || {};
  const totalAccounts =
    (summary.total_amazon_accounts || 0) + (summary.total_ads_accounts || 0) + (summary.total_myntra_accounts || 0);

  // Table Columns for User Account Usage Dashboard
  const dashboardColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      width: 180,
      render: (v, record) => (
        <div>
          <span className="font-semibold text-[#111827] block text-[13px]">{v || 'User'}</span>
          <span className="text-[11px] text-gray-500">{record.email}</span>
        </div>
      ),
    },
    ...(serviceTypeFilter === 'ALL' || serviceTypeFilter === 'SP-API'
      ? [
          {
            title: 'Amazon SP-API Accounts',
            dataIndex: 'amazon_accounts',
            width: 280,
            render: (accounts) => {
              if (!accounts || accounts.length === 0)
                return <span className="text-gray-400 text-[11px]">No Connected Account</span>;
              return (
                <div className="space-y-2">
                  {accounts.map((acc, i) => (
                    <div key={i} className="p-2 rounded-lg bg-orange-50/60 border border-orange-100 text-[11px]">
                      <div className="flex items-center justify-between font-semibold text-orange-900 mb-1">
                        <span>📦 {acc.account_name}</span>
                        <Tag color="orange" className="mr-0 text-[10px]">
                          SP-API
                        </Tag>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-700">
                        <span>
                          Orders: <strong>{acc.order_count}</strong>
                        </span>
                        <span>
                          API Calls: <strong className="text-blue-600">{acc.api_call_count}</strong>
                        </span>
                        <span>
                          Required: <strong className="text-purple-600">{acc.required_api_calls}</strong>
                        </span>
                      </div>
                      <div className="mt-1 flex justify-end">
                        <Button
                          type="link"
                          size="small"
                          className="p-0 text-[11px] h-auto flex items-center gap-1 text-orange-600"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            handleOpenBreakdown(`SP-API Calls: ${acc.account_name}`, acc.endpoint_breakdown)
                          }
                        >
                          API Call Breakdown
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            },
          },
        ]
      : []),
    ...(serviceTypeFilter === 'ALL' || serviceTypeFilter === 'Amazon-Ads'
      ? [
          {
            title: 'Amazon Ads Accounts',
            dataIndex: 'ads_accounts',
            width: 250,
            render: (accounts) => {
              if (!accounts || accounts.length === 0)
                return <span className="text-gray-400 text-[11px]">No Ads Account</span>;
              return (
                <div className="space-y-2">
                  {accounts.map((acc, i) => (
                    <div key={i} className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px]">
                      <div className="flex items-center justify-between font-semibold text-blue-900 mb-1">
                        <span>📢 {acc.account_name}</span>
                        <Tag color="blue" className="mr-0 text-[10px]">
                          Ads API
                        </Tag>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-700">
                        <span>
                          Records: <strong>{acc.record_count || 0}</strong>
                        </span>
                        <span>
                          API Calls: <strong className="text-blue-600">{acc.api_call_count}</strong>
                        </span>
                        <span>
                          Required: <strong className="text-purple-600">{acc.required_api_calls}</strong>
                        </span>
                      </div>
                      <div className="mt-1 flex justify-end">
                        <Button
                          type="link"
                          size="small"
                          className="p-0 text-[11px] h-auto flex items-center gap-1 text-blue-600"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            handleOpenBreakdown(`Ads API Calls: ${acc.account_name}`, acc.endpoint_breakdown)
                          }
                        >
                          API Call Breakdown
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            },
          },
        ]
      : []),
    ...(serviceTypeFilter === 'ALL' || serviceTypeFilter === 'Myntra'
      ? [
          {
            title: 'Myntra Accounts',
            dataIndex: 'myntra_accounts',
            width: 250,
            render: (accounts) => {
              if (!accounts || accounts.length === 0)
                return <span className="text-gray-400 text-[11px]">No Myntra Account</span>;
              return (
                <div className="space-y-2">
                  {accounts.map((acc, i) => (
                    <div key={i} className="p-2 rounded-lg bg-purple-50/60 border border-purple-100 text-[11px]">
                      <div className="flex items-center justify-between font-semibold text-purple-900 mb-1">
                        <span>🛍️ {acc.account_name}</span>
                        <Tag color="purple" className="mr-0 text-[10px]">
                          Myntra API
                        </Tag>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-700">
                        <span>
                          Orders: <strong>{acc.order_count}</strong>
                        </span>
                        <span>
                          API Calls: <strong className="text-blue-600">{acc.api_call_count}</strong>
                        </span>
                        <span>
                          Required: <strong className="text-purple-600">{acc.required_api_calls}</strong>
                        </span>
                      </div>
                      <div className="mt-1 flex justify-end">
                        <Button
                          type="link"
                          size="small"
                          className="p-0 text-[11px] h-auto flex items-center gap-1 text-purple-600"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            handleOpenBreakdown(`Myntra API Calls: ${acc.account_name}`, acc.endpoint_breakdown)
                          }
                        >
                          API Call Breakdown
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            },
          },
        ]
      : []),
    {
      title: 'Total Orders',
      dataIndex: 'total_orders',
      width: 110,
      align: 'center',
      render: (v) => <span className="font-bold text-[#111827] text-[13px]">{v || 0}</span>,
    },
    {
      title: 'Total API Calls',
      dataIndex: 'total_api_calls',
      width: 120,
      align: 'center',
      render: (v) => (
        <Tag color="cyan" className="font-semibold text-[12px] px-2 py-0.5">
          {v || 0} Calls
        </Tag>
      ),
    },
  ];

  // Table Columns for Detailed Call Logs
  const logColumns = [
    {
      title: 'Log ID',
      dataIndex: 'id',
      width: 80,
      align: 'center',
      render: (v) => <span className="text-gray-500 font-mono text-[11px]">#{v}</span>,
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      width: 150,
      render: (v, record) => (
        <div>
          <span className="font-medium text-[#111827] block truncate">{v}</span>
          <span className="text-[11px] text-gray-400 block truncate">{record.user_email}</span>
        </div>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service_type',
      width: 120,
      align: 'center',
      render: (v) => {
        let color = 'orange';
        if (v === 'Amazon-Ads') color = 'blue';
        if (v === 'Myntra') color = 'purple';
        return (
          <Tag color={color} className="font-medium">
            {v}
          </Tag>
        );
      },
    },
    {
      title: 'Account',
      dataIndex: 'account_name',
      width: 160,
      ellipsis: true,
      render: (v, record) => (
        <Tooltip title={`Account ID: ${record.account_id}`}>
          <span className="font-medium text-gray-800 text-[12px]">{v || record.account_id || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: 'API Endpoint',
      dataIndex: 'api_endpoint',
      width: 230,
      render: (v) => (
        <code className="bg-gray-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px] font-mono border border-gray-200">
          {v}
        </code>
      ),
    },
    {
      title: 'Calls',
      dataIndex: 'call_count',
      width: 80,
      align: 'center',
      render: (v) => <span className="font-bold text-gray-900">{v}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 95,
      align: 'center',
      render: (v) => (
        <Tag color={v === 'SUCCESS' ? 'green' : 'red'} className="text-[11px]">
          {v}
        </Tag>
      ),
    },
    {
      title: 'Orders Processed',
      dataIndex: 'orders_processed',
      width: 120,
      align: 'center',
      render: (v) => <span className="font-medium text-gray-700">{v || 0}</span>,
    },
    {
      title: 'Response Time',
      dataIndex: 'response_time_ms',
      width: 110,
      align: 'center',
      render: (v) => <span className="text-gray-500 text-[11px]">{v ? `${v} ms` : '-'}</span>,
    },
    {
      title: 'Timestamp',
      dataIndex: 'created_at',
      width: 150,
      align: 'center',
      render: (v) => <span className="text-gray-500 text-[11px]">{v}</span>,
    },
  ];

  return (
    <div className="p-3 px-2 min-h-screen">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <div>
            <h2 className="mb-0 text-[20px] font-semibold text-gray-900 flex items-center gap-2">
              <ApiOutlined className="text-blue-600" /> SP-API & Channel API Call Logs
            </h2>
            <p className="mb-0 text-[12px] text-gray-500 mt-0.5">
              Monitor SP-API, Amazon Ads, and Myntra call frequencies, order counts, and API requirements per user.
            </p>
          </div>
          <Button
            type="default"
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
            className="h-[32px] text-[12px] font-medium rounded-lg"
          >
            Refresh Logs
          </Button>
        </div>

        {/* Summary Stat Cards */}
        <div className="p-4 bg-slate-50/50 border-b border-gray-100">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between h-full">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Total Users
                  </span>
                  <span className="text-[22px] font-bold text-gray-900">{summary.total_users || 0}</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-[20px] shrink-0">
                  <UserOutlined />
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between h-full">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Connected Accounts
                  </span>
                  <span className="text-[22px] font-bold text-gray-900">{totalAccounts}</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-[20px] shrink-0">
                  <AppstoreOutlined />
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between h-full">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Total Orders Tracked
                  </span>
                  <span className="text-[22px] font-bold text-gray-900">{summary.total_orders || 0}</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-[20px] shrink-0">
                  <ShoppingCartOutlined />
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs flex items-center justify-between h-full">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block mb-1">
                    Total API Calls Logged
                  </span>
                  <span className="text-[22px] font-bold text-cyan-600">{summary.total_api_calls || 0}</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-[20px] shrink-0">
                  <ApiOutlined />
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              allowClear
              placeholder="Search user, account, endpoint..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-72 h-[32px] text-[12px] rounded-lg"
              size="small"
            />
            <Select
              value={serviceTypeFilter}
              onChange={(val) => setServiceTypeFilter(val)}
              className="w-40 h-[32px] text-[12px]"
              size="small"
              options={[
                { value: 'ALL', label: 'All Services' },
                { value: 'SP-API', label: 'Amazon SP-API' },
                { value: 'Amazon-Ads', label: 'Amazon Ads API' },
                { value: 'Myntra', label: 'Myntra API' },
              ]}
            />
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Account Usage Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'logs' ? 'bg-white text-blue-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Detailed Call Logs ({data.pagination?.total_records || 0})
            </button>
          </div>
        </div>

        {/* Main Content View */}
        {activeTab === 'dashboard' ? (
          <Table
            rowKey="user_id"
            columns={dashboardColumns}
            dataSource={data.user_account_dashboard || []}
            loading={loading}
            size="small"
            scroll={{ x: 1000 }}
            pagination={false}
            className="
              [&_.ant-table-thead>tr>th]:!text-[12px]
              [&_.ant-table-thead>tr>th]:!font-semibold
              [&_.ant-table-tbody>tr>td]:!text-[12px]
              [&_.ant-table-cell]:!px-3
              [&_.ant-table-cell]:!py-3
            "
          />
        ) : (
          <Table
            rowKey="id"
            columns={logColumns}
            dataSource={data.logs || []}
            loading={loading}
            size="small"
            scroll={{ x: 1100 }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: data.pagination?.total_records || 0,
              pageSizeOptions: ['10', '20', '50', '100'],
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} logs`,
            }}
            onChange={(pag) => {
              setPagination({
                current: pag.current,
                pageSize: pag.pageSize,
              });
            }}
            className="
              [&_.ant-table-thead>tr>th]:!text-[12px]
              [&_.ant-table-thead>tr>th]:!font-semibold
              [&_.ant-table-tbody>tr>td]:!text-[12px]
              [&_.ant-table-cell]:!px-3
              [&_.ant-table-cell]:!py-2.5
            "
          />
        )}
      </div>

      {/* Endpoint Call Breakdown Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[15px] font-semibold text-gray-900 border-b pb-2">
            <ApiOutlined className="text-orange-500" />
            {breakdownModal.title}
          </div>
        }
        open={breakdownModal.open}
        onCancel={() => setBreakdownModal({ open: false, title: '', data: {} })}
        footer={[
          <Button
            key="close"
            type="primary"
            className="rounded-lg text-[12px]"
            onClick={() => setBreakdownModal({ open: false, title: '', data: {} })}
          >
            Close
          </Button>,
        ]}
        width={540}
        centered
      >
        <div className="py-2">
          <p className="text-[12px] text-gray-500 mb-3">Individual call frequencies per specific API endpoint:</p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {Object.keys(breakdownModal.data).length > 0 ? (
              Object.entries(breakdownModal.data).map(([endpoint, count], idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-200/80"
                >
                  <code className="text-[11px] font-mono text-slate-800 font-semibold break-all">{endpoint}</code>
                  <Tag color="blue" className="font-bold text-[12px] px-2 py-0.5 ml-2 mr-0">
                    {count} Calls
                  </Tag>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400 text-[12px]">No API breakdown data available</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ApiCallLogs;
