import React, { useEffect, useState } from 'react';
import { Table, Tooltip, DatePicker, Modal } from 'antd';
import {
  InfoCircleOutlined,
  SearchOutlined,
  // FilterOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  WarningOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getSettledOrders } from '../../redux/reconcilePayment/actionCreator';

function OrderSettlement() {
  const dispatch = useDispatch();
  const { RangePicker } = DatePicker;
  // const [fullfilment, setFullfilment] = useState('');
  const [dateRange, setDateRange] = useState();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const { settledData, settledLoading } = useSelector((state) => state.reconcilePayment);
  useEffect(() => {
    dispatch(
      getSettledOrders(
        pagination.current,
        pagination.pageSize,
        // filters: {
        //   fulfillment_channel: fullfilment,
        //   search: debouncedSearch,
        //   start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
        //   end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
        // },
      ),
    );
  }, [dispatch, dateRange, pagination.current, pagination.pageSize]);

  const topCards = [
    {
      title: 'Total Orders',
      value: '2,189',
      sub: 'vs Last Month + 8.45%',
      icon: <ShoppingCartOutlined />,
      iconBg: 'bg-[#eff6ff]',
      iconColor: 'text-[#2563eb]',
      valueColor: 'text-[#2563eb]',
    },

    {
      title: 'Total GMV',
      value: '₹ 3,85,420.75',
      sub: 'vs Last Month + 11.2%',
      icon: <DollarOutlined />,
      iconBg: 'bg-[#ecfdf3]',
      iconColor: 'text-[#16a34a]',
      valueColor: 'text-[#16a34a]',
    },

    {
      title: 'Total Settlements',
      value: '₹ 2,20,790.85',
      sub: 'vs Last Month + 9.3%',
      icon: <CheckCircleOutlined />,
      iconBg: 'bg-[#f5f3ff]',
      iconColor: 'text-[#7c3aed]',
      valueColor: 'text-[#7c3aed]',
    },

    {
      title: 'Pending Settlements',
      value: '₹ 65,130.50',
      sub: 'vs Last Month - 14.2%',
      icon: <ClockCircleOutlined />,
      iconBg: 'bg-[#fff7ed]',
      iconColor: 'text-[#f97316]',
      valueColor: 'text-[#f97316]',
    },

    {
      title: 'Settlement Success Rate',
      value: '89.32%',
      sub: 'vs Last Month + 5.67%',
      icon: <RiseOutlined />,
      iconBg: 'bg-[#ecfeff]',
      iconColor: 'text-[#0891b2]',
      valueColor: 'text-[#0891b2]',
    },
  ];

  const dataSource =
    settledData?.results?.map((item, index) => ({
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

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      key: 'transactionId',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.transactionId || '').localeCompare(String(b.transactionId || '')),
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#1677ff] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.orderId || '').localeCompare(String(b.orderId || '')),
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
      title: 'Transaction Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.transactionType || '').localeCompare(String(b.transactionType || '')),
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
      title: 'Status',
      dataIndex: 'transactionStatus',
      key: 'transactionStatus',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.transactionStatus || '').localeCompare(String(b.transactionStatus || '')),
      render: (status) => {
        const color = status === 'DEFERRED' ? '#f59e0b' : status === 'RELEASED' ? '#16a34a' : '#2563eb';

        return (
          <span
            className="px-2 py-1 rounded-full text-[10px] font-semibold"
            style={{
              background: `${color}20`,
              color,
            }}
          >
            {status}
          </span>
        );
      },
    },

    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.description || '').localeCompare(String(b.description || '')),
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
      title: 'Posted Date',
      dataIndex: 'postedDate',
      key: 'postedDate',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.postedDate - b.postedDate,
      render: (date) => {
        const formattedDate = date ? new Date(date).toLocaleString('en-IN') : '-';

        return (
          <Tooltip title={formattedDate} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
              {formattedDate}
            </span>
          </Tooltip>
        );
      },
    },

    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.defaultBid - b.totalAmount,
      render: (amount) => {
        const value = Number(amount || 0);

        return (
          <span className={`font-semibold ${value < 0 ? 'text-red-500' : 'text-green-600'}`}>
            ₹ {Math.abs(value).toFixed(2)}
          </span>
        );
      },
    },

    {
      title: 'Currency',
      dataIndex: 'currencyCode',
      key: 'currencyCode',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.currencyCode || '').localeCompare(String(b.currencyCode || '')),
    },
    {
      title: '',
      key: 'view',
      align: 'center',
      width: 50,
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

  return (
    <>
      <div className="min-h-screen bg-[#f6f8fc] p-3 md:p-2 sm:p-1">
        {' '}
        {/* HEADER */}
        <div className="mb-2 flex items-start justify-between lg:flex-col lg:gap-2">
          {' '}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] md:text-[18px] sm:text-[16px] mb-0 font-semibold text-[#111827] leading-none">
                Order & Settlements
              </h1>
              <InfoCircleOutlined className="text-[12px] text-[#9ca3af]" />
            </div>

            <p className="mt-1 text-[12px] text-[#6b7280]">
              Track order volume, GMV and settlement status across all marketplaces.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#6b7280] lg:flex-wrap">
            {' '}
            <span>Payment Reconciliation</span>
            <span>{'>'}</span>
            <span className="font-semibold text-[#2563eb]">Order & Settlements</span>
          </div>
        </div>
        {/* TOP CARDS */}
        <div className="grid grid-cols-5 lg:grid-cols-2 md:grid-cols-1 gap-2 mb-2">
          {' '}
          {topCards.map((item, index) => (
            <div key={index} className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 sm:px-2">
              <div className="flex items-center gap-2">
                {/* Icon */}
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[12px] ${item.iconBg} ${item.iconColor}`}
                >
                  {item.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Title */}
                  <p className="truncate text-[11px] leading-[11px] font-medium text-[#6b7280]">{item.title}</p>

                  {/* Value */}
                  <h2 className={`mt-[1px] truncate text-[16px] font-bold leading-none ${item.valueColor}`}>
                    {item.value}
                  </h2>

                  {/* Bottom Text */}
                  <p className="mt-[2px] truncate text-[10px] leading-none text-[#9ca3af]">{item.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* MAIN */}
        <div className="grid grid-cols-[1fr_280px] lg:grid-cols-1 gap-2">
          {' '}
          {/* LEFT */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white overflow-hidden">
            {/* TABS */}
            <div className="flex items-center gap-6 border-b border-[#edf0f2] px-2 py-2 sm:gap-3 sm:flex-wrap">
              {' '}
              {['Order Summary', 'Settlement Summary'].map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className={`pb-0 text-[12px] font-semibold ${
                    index === 0 ? 'border-b-2 border-[#16a34a] text-[#16a34a]' : 'text-[#6b7280]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-3 border-b border-[#edf0f2] px-4 py-3 lg:flex-wrap">
              {' '}
              {/* <select className="py-1 rounded-l border border-[#e5e7eb] px-2 text-[11px] outline-none">
              <option>All Marketplaces</option>
            </select> */}
              {/* <select
              value={fullfilment}
              onChange={(e) => setFullfilment(e.target.value)}
              className="h-[30px] w-[150px] md:w-full px-2 rounded-l border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none cursor-pointer"
            >
              <option value="">All Fulfillment</option>
              <option value="AFN">AFN</option>
              <option value="MFN">MFN</option>
            </select> */}
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                format="DD/MM/YYYY"
                allowClear={false}
                className="
    h-[30px] w-[240px] md:w-full
    [&_.ant-picker-input>input]:text-[11px]
    [&_.ant-picker-input>input]:font-normal
    [&_.ant-picker-separator]:text-[11px]
    [&_.ant-picker-suffix]:text-[11px]
  "
              />
              <div className="relative ml-auto md:ml-0 md:w-full">
                <input
                  placeholder="Search Order ID / SKU"
                  className="py-1 w-[180px] md:w-full rounded-l border border-[#e5e7eb] pl-3 pr-9 text-[12px] outline-none"
                />

                <SearchOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9ca3af]" />
              </div>
              {/* <button
              type="button"
              className="flex py-1 items-center gap-2 rounded-l border border-[#e5e7eb] px-2 text-[11px] font-medium text-[#374151]"
            >
              <FilterOutlined className="text-[10px]" />
              Filters
            </button> */}
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto w-full">
              <Table
                columns={columns}
                dataSource={dataSource}
                loading={settledLoading}
                showSorterTooltip={false}
                tableLayout="fixed"
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: settledData?.count || 0,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                }}
                onChange={(pag) => {
                  setPagination({
                    current: pag.current,
                    pageSize: pag.pageSize,
                  });
                }}
                scroll={{ x: 800, y: 500 }}
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
          {/* RIGHT SIDEBAR */}
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0 md:grid-cols-1">
            {/* ORDER STATUS */}
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">Order Status Breakdown</h2>

              <div className="mt-2 flex items-center justify-center">
                <div className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full border-[18px] border-[#16a34a]">
                  <div className="text-center">
                    <h3 className="text-[20px] font-bold text-[#111827]">2,189</h3>

                    <p className="text-[10px] text-[#6b7280]">Total Orders</p>
                  </div>
                </div>
              </div>

              <button type="button" className="mt-2 text-[11px] font-medium text-[#16a34a]">
                View Details →
              </button>
            </div>

            {/* SETTLEMENT STATUS */}
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">Settlement Status Breakdown</h2>

              <div className="mt-2 flex items-center justify-center">
                <div className="relative flex h-[150px] w-[150px] sm:h-[120px] sm:w-[120px] items-center justify-center rounded-full border-[18px] border-[#2563eb]">
                  <div className="text-center">
                    <h3 className="text-[20px] font-bold text-[#111827]">2,059</h3>

                    <p className="text-[10px] text-[#6b7280]">Total Settlements</p>
                  </div>
                </div>
              </div>

              <button type="button" className="mt-2 text-[11px] font-medium text-[#16a34a]">
                View Details →
              </button>
            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
              <h2 className="text-[15px] font-semibold text-[#111827]">Quick Actions</h2>

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  className="flex w-full items-center gap-3 sm:gap-2 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
                >
                  <DownloadOutlined className="text-[13px] text-[#2563eb]" />

                  <div>
                    <p className="text-[11px] font-semibold text-[#111827] mb-1">Download Order Report</p>

                    <p className="text-[10px] text-[#9ca3af]">Export all order data</p>
                  </div>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
                >
                  <WarningOutlined className="text-[13px] text-[#ef4444]" />

                  <div>
                    <p className="text-[11px] font-semibold text-[#111827] mb-1">View All Leaks</p>

                    <p className="text-[10px] text-[#9ca3af]">Analyze losses & pending settlements</p>
                  </div>
                </button>
              </div>
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
        width={500}
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

export default OrderSettlement;
