import React, { useEffect, useState } from 'react';
import { Table, Select, Input, Button, Tag, Progress, Tooltip, Modal } from 'antd';

import {
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined,
  SyncOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { getReturnsAdjustment } from '../../redux/reconcilePayment/actionCreator';

function ReturnAdjust() {
  const dispatch = useDispatch();
  const [status, setStatus] = useState('');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { returnAdjustment, loading } = useSelector((state) => state.reconcilePayment);

  useEffect(() => {
    dispatch(getReturnsAdjustment(pagination.current, pagination.pageSize, debouncedSearch, status));
  }, [dispatch, pagination.current, pagination.pageSize, debouncedSearch, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const summaryCards = [
    {
      title: 'Total Returns',
      value: `₹${Math.abs(Number(returnAdjustment?.total_refund_amount || 0)).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      sub: `${returnAdjustment?.count || 0} Orders`,
      color: '#ef4444',
      bg: '#fef2f2',
    },

    {
      title: 'Refund Issued',
      value: '₹24,320.70',
      sub: '389 Orders',
      color: '#f97316',
      bg: '#fff7ed',
    },

    {
      title: 'Adjustment Offset',
      value: '- ₹8,120.00',
      sub: '158 Transactions',
      color: '#8b5cf6',
      bg: '#faf5ff',
    },

    {
      title: 'Net Impact',
      value: '- ₹32,440.20',
      sub: 'Last Month',
      color: '#16a34a',
      bg: '#f0fdf4',
    },
  ];

  const chartData =
    returnAdjustment?.refund_graph?.map((item) => ({
      name: new Date(item.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
      }),
      refunds: Math.abs(Number(item.refund_amount || 0)),
    })) || [];

  const pieData = [
    { name: 'Returns', value: 55, color: '#ef4444' },
    { name: 'Refunds', value: 30, color: '#f97316' },
    { name: 'Adjustments', value: 15, color: '#8b5cf6' },
  ];

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      width: 100,
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[12px] text-[#1677ff] block truncate font-medium cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Order ID',
      dataIndex: 'orderId',
      width: 100,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[12px] text-[#111827] font-medium block truncate cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Transaction Type',
      dataIndex: 'transactionType',
      width: 70,
      align: 'center',
      render: (v) => (
        <Tag color="blue" className="rounded-full text-[10px] px-2">
          {v}
        </Tag>
      ),
    },

    {
      title: 'Status',
      dataIndex: 'transactionStatus',
      width: 70,
      align: 'center',
      render: (v) => (
        <Tag color={v === 'DEFERRED' ? 'gold' : 'green'} className="rounded-full text-[10px] px-2">
          {v}
        </Tag>
      ),
    },

    {
      title: 'Posted Date',
      dataIndex: 'postedDate',
      width: 80,
      render: (v) => {
        const formattedDate = v ? new Date(v).toLocaleString('en-IN') : '-';

        return (
          <Tooltip title={formattedDate} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span className="text-[12px] text-[#6b7280] cursor-pointer block truncate">{formattedDate}</span>
          </Tooltip>
        );
      },
    },

    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      width: 70,
      align: 'right',
      render: (v) => {
        const amount = Number(v || 0);

        return (
          <span className={`text-[12px] font-semibold ${amount < 0 ? 'text-red-500' : 'text-green-600'}`}>
            ₹ {Math.abs(amount).toFixed(2)}
          </span>
        );
      },
    },

    {
      title: 'Currency',
      dataIndex: 'currencyCode',
      width: 50,
      align: 'center',
      render: (v) => <span className="text-[12px] font-medium text-[#111827]">{v}</span>,
    },

    {
      title: '',
      key: 'view',
      align: 'center',
      width: 40,
      render: (record) => (
        <Tooltip title="View Details" color="black" overlayInnerStyle={{ color: '#fff' }}>
          <EyeOutlined
            style={{
              fontSize: '16px',
              cursor: 'pointer',
              color: '#1677ff',
            }}
            onClick={() => handleView(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const tableData =
    returnAdjustment?.results?.map((item, index) => ({
      key: item.id || index,
      transactionId: item.transaction_id,
      orderId: item.order_id,
      transactionType: item.transaction_type,
      transactionStatus: item.transaction_status,
      description: item.description,
      postedDate: item.posted_date,
      totalAmount: item.total_amount,
      currencyCode: item.currency_code,

      breakdowns: item.breakdowns || [],
      relatedIdentifiers: item.related_identifiers || [],
    })) || [];

  return (
    <>
      <div className="mt-3 mb-3 space-y-2 px-2">
        {/* HEADER */}

        <div className="shadow-regular rounded-10 px-2 py-2">
          <div className="flex items-center justify-between gap-2 md:flex-col md:items-start">
            <div>
              <h1 className="text-[20px] font-semibold text-dark leading-none mb-0">Returns & Adjustments</h1>

              <p className="text-[12px] text-light leading-4 mt-1 max-w-[680px] mb-0">
                Track returns, refunds, reimbursements and adjustment activities across connected marketplaces.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:w-full sm:flex-wrap">
              <Button icon={<FilterOutlined />} className="text-[13px] h-[30px]">
                Filters
              </Button>

              <Button type="primary" icon={<DownloadOutlined />} className="text-[13px] h-[30px] shadow-none">
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-4 gap-2 xl:grid-cols-2 sm:grid-cols-1">
          {summaryCards.map((item, index) => (
            <div key={index} className="bg-white border border-normal rounded-10 shadow-regular px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] text-light font-medium">{item.title}</p>

                  <h2 className="text-[17px] font-semibold text-dark mt-2 leading-none">{item.value}</h2>

                  <p className="text-[12px] text-dark-500 mt-1">{item.sub}</p>
                </div>

                <div
                  className="w-[38px] h-[38px] rounded-xl flex items-center justify-center text-[16px] font-semibold"
                  style={{
                    background: item.bg,
                    color: item.color,
                  }}
                >
                  ₹
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS */}

        <div className="grid grid-cols-3 gap-2 xl:grid-cols-1">
          {/* LINE CHART */}

          <div className="col-span-2 xl:col-span-1 bg-white border border-normal rounded-10 shadow-regular p-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-dark">Returns Trend</h2>

              <div className="flex items-center gap-3 text-[12px] text-light sm:hidden">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                  Returns
                </div>

                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#f97316]" />
                  Refunds
                </div>

                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                  Adjustments
                </div>
              </div>
            </div>

            <div className="w-full h-[170px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />

                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />

                  <ReTooltip />

                  <Line type="monotone" dataKey="returns" stroke="#ef4444" strokeWidth={2} dot={false} />

                  <Line type="monotone" dataKey="refunds" stroke="#f97316" strokeWidth={2} dot={false} />

                  <Line type="monotone" dataKey="adjustments" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE */}

          <div className="bg-white border border-normal rounded-10 shadow-regular p-3">
            <h2 className="text-[15px] font-semibold text-dark mb-4">Breakdown</h2>

            <div className="h-[175px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={72} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-2">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />

                    <span>{item.name}</span>
                  </div>

                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FILTERS */}

        <div className="bg-white shadow-regular px-3 py-1.5 rounded-10">
          <div className="flex items-center justify-between gap-2 lg:flex-col lg:items-start">
            {/* LEFT FILTERS */}

            <div className="flex items-center gap-2 flex-wrap w-full">
              <Input
                placeholder="Search Order ID / SKU"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-[220px] text-[12px] h-[30px] lg:w-full"
              />
              <Select
                placeholder="Status"
                allowClear
                value={status || undefined}
                onChange={(value) => setStatus(value || '')}
                className="w-[140px] text-[12px] sm:w-full [&_.ant-select-selector]:!h-[30px] [&_.ant-select-selector]:!min-h-[30px] [&_.ant-select-selector]:!items-center"
                options={[
                  {
                    value: 'DEFERRED',
                    label: 'Deferred',
                  },
                  {
                    value: 'RELEASED',
                    label: 'Released',
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="bg-white border border-normal rounded-10 shadow-regular p-3 overflow-hidden">
          <Table
            columns={columns}
            dataSource={tableData}
            loading={loading}
            showSorterTooltip={false}
            tableLayout="fixed"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: returnAdjustment?.count || 0,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={(page) =>
              setPagination({
                current: page.current,
                pageSize: page.pageSize,
              })
            }
            size="middle"
            bordered={false}
            scroll={{ x: 900, y: 500 }}
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
          />
        </div>

        {/* BOTTOM */}

        <div className="grid grid-cols-3 gap-3 xl:grid-cols-1">
          {/* INSIGHTS */}

          <div className="bg-white border border-normal rounded-10 shadow-regular p-3 min-h-[180px] flex flex-col">
            <h2 className="text-[16px] font-semibold text-dark mb-2">Insights</h2>

            <div className="space-y-2 mt-1">
              <div>
                <div className="flex items-center justify-between text-[12px] mb-0.5">
                  <span>Refund Success</span>
                  <span>82%</span>
                </div>

                <Progress percent={82} showInfo={false} size="small" />
              </div>

              <div>
                <div className="flex items-center justify-between text-[12px] mb-0.5">
                  <span>Claim Approval</span>
                  <span>68%</span>
                </div>

                <Progress percent={68} showInfo={false} size="small" />
              </div>
            </div>
          </div>

          {/* ALERTS */}

          <div className="bg-white border border-normal rounded-10 shadow-regular p-3 min-h-[180px] flex flex-col">
            <h2 className="text-[16px] font-semibold text-dark mb-2">Alerts</h2>

            <div className="space-y-2">
              <div className="flex gap-2 bg-[#fef2f2] rounded-xl p-2">
                <WarningOutlined className="text-[#dc2626] mt-0.5 text-[14px]" />

                <div>
                  <p className="text-[12px] font-medium text-dark mb-0">Refund Spike</p>

                  <p className="text-[10px] text-light leading-4">Refunds increased by 18% this week.</p>
                </div>
              </div>

              <div className="flex gap-2 bg-[#f0fdf4] rounded-xl p-2">
                <CheckCircleOutlined className="text-[#16a34a] mt-0.5 text-[14px]" />

                <div>
                  <p className="text-[12px] font-medium text-dark mb-0">Claims Settled</p>

                  <p className="text-[10px] text-light leading-4">24 claims processed successfully.</p>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTION */}

          <div className="bg-white border border-normal rounded-10 shadow-regular p-3 min-h-[180px] flex flex-col">
            <h2 className="text-[16px] font-semibold text-dark mb-2">Quick Actions</h2>

            <div className="space-y-2">
              <Button block icon={<SyncOutlined />} className="h-[32px] text-[13px] rounded-xl">
                Sync Marketplace
              </Button>

              <Button block icon={<DownloadOutlined />} className="h-[32px] text-[13px] rounded-xl">
                Export Report
              </Button>

              <Button type="primary" block className="h-[32px] text-[13px] rounded-xl shadow-none">
                Create Claim
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        // title={<div className="text-[15px] font-semibold text-gray-800">Transaction Details</div>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        footer={null}
        width={360}
        styles={{
          body: {
            padding: '12px 15px',
          },
        }}
      >
        {selectedRecord && (
          <div className="space-y-4">
            {/* Breakdown Section */}
            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-gray-800">Breakdown Summary</h3>

              <div className="space-y-2">
                {selectedRecord.breakdowns?.map((item) => (
                  <div key={item.id} className="rounded-md border border-gray-200 p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-gray-800">{item.breakdown_type}</span>

                      <span
                        className={`text-[13px] font-semibold ${
                          Number(item.amount) < 0 ? 'text-red-500' : 'text-green-600'
                        }`}
                      >
                        ₹ {Math.abs(Number(item.amount)).toFixed(2)}
                      </span>
                    </div>

                    {item.children?.length > 0 && (
                      <div className="mt-2 space-y-1 border-l-2 border-gray-200 pl-3">
                        {item.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between">
                            <span className="text-[12px] text-gray-500">{child.breakdown_type}</span>

                            <span
                              className={`text-[12px] font-medium ${
                                Number(child.amount) < 0 ? 'text-red-500' : 'text-green-600'
                              }`}
                            >
                              ₹ {Math.abs(Number(child.amount)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default ReturnAdjust;
