import React, { useEffect, useState } from 'react';
import { Table, Tooltip, DatePicker } from 'antd';
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
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getSettledOrders } from '../../redux/reconcilePayment/actionCreator';
import Amazon from '../../assets/icons/amazon.svg';

function OrderSettlement() {
  const dispatch = useDispatch();
  const { RangePicker } = DatePicker;
  const [fullfilment, setFullfilment] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState();
  const { settledData, settledLoading } = useSelector((state) => state.reconcilePayment);
  const marketplaceIcons = {
    'Amazon-India': Amazon,
  };
  useEffect(() => {
    dispatch(
      getSettledOrders({
        filters: {
          fulfillment_channel: fullfilment,
          search: debouncedSearch,
          start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
          end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
        },
      }),
    );
  }, [dispatch, fullfilment, debouncedSearch, dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

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
    settledData?.data?.orders?.map((item, index) => ({
      key: index,
      marketplace: item.marketplace,
      orderId: item.order_id,
      orderDate: item.order_date,
      orderStatus: item.order_status,
      fulfillmentType: item.fulfillment_type,
      skuCount: item.sku_count,
      unitsSold: item.units_sold,
      gmv: item.gmv,
      settlementStatus: item.settlement_status,
      expectedSettlement: item.expected_settlement,
      settledAmount: item.settled_amount,
      pendingAmount: item.pending,
    })) || [];

  const columns = [
    {
      title: 'Marketplace',
      dataIndex: 'marketplace',
      key: 'marketplace',
      align: 'center',
      width: 70,
      render: (marketplace) => {
        const icon = marketplaceIcons[marketplace];

        return icon ? <img src={icon} alt={marketplace} className="h-6 w-6 object-contain mx-auto" /> : marketplace;
      },
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.orderId - b.orderId,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '200px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.orderDate - b.orderDate,
      render: (date) => (date ? new Date(date).toLocaleDateString('en-IN') : '-'),
    },

    {
      title: 'Order Status',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.orderStatus - b.orderStatus,
      render: (status) => (
        <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-[10px] font-semibold text-[#16a34a]">{status}</span>
      ),
    },

    {
      title: 'Fulfillment Type',
      dataIndex: 'fulfillmentType',
      key: 'fulfillmentType',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.fulfillmentType).localeCompare(String(b.fulfillmentType)),
    },

    {
      title: 'SKU Count',
      dataIndex: 'skuCount',
      key: 'skuCount',
      width: 70,
      align: 'center',
      sorter: (a, b) => a.skuCount - b.skuCount,
    },

    {
      title: 'Units Sold',
      dataIndex: 'unitsSold',
      key: 'unitsSold',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.unitsSold - b.unitsSold,
    },

    {
      title: 'GMV',
      dataIndex: 'gmv',
      key: 'gmv',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (value) => `₹ ${Number(value || 0).toFixed(2)}`,
      sorter: (a, b) => a.gmv - b.gmv,
    },

    {
      title: 'Settlement Status',
      dataIndex: 'settlementStatus',
      key: 'settlementStatus',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.settlementStatus - b.settlementStatus,
      render: (status) => (
        <span className="rounded-full bg-[#eff6ff] px-2 py-1 text-[10px] font-semibold text-[#2563eb]">{status}</span>
      ),
    },

    {
      title: 'Expected Settlement',
      dataIndex: 'expectedSettlement',
      key: 'expectedSettlement',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.expectedSettlement - b.expectedSettlement,
      render: (value) => `₹ ${Number(value || 0).toFixed(2)}`,
    },

    {
      title: 'Settled Amount',
      dataIndex: 'settledAmount',
      key: 'settledAmount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.settledAmount - b.settledAmount,
      render: (value) => <span className="font-semibold text-[#16a34a]">₹ {Number(value || 0).toFixed(2)}</span>,
    },

    {
      title: 'Pending Amount',
      dataIndex: 'pendingAmount',
      key: 'pendingAmount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.pendingAmount - b.pendingAmount,
      render: (value) => <span className="font-semibold text-[#ef4444]">₹ {Number(value || 0).toFixed(2)}</span>,
    },

    // {
    //   title: 'Actions',
    //   key: 'actions',
    //   align: 'center',
    //   width: 70,
    //   ellipsis: true,
    //   render: () => (
    //     <div className="flex items-center gap-2">
    //       <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e7eb]">
    //         <EyeOutlined />
    //       </button>

    //       <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e5e7eb]">
    //         <DownloadOutlined />
    //       </button>
    //     </div>
    //   ),
    // },
  ];

  return (
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
          <div className="flex items-center gap-6 border-b border-[#edf0f2] px-4 py-3 sm:gap-3 sm:flex-wrap">
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
            <select
              value={fullfilment}
              onChange={(e) => setFullfilment(e.target.value)}
              className="h-[30px] w-[150px] md:w-full px-2 rounded-xl border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none cursor-pointer"
            >
              <option value="">All Fulfillment</option>
              <option value="AFN">AFN</option>
              <option value="MFN">MFN</option>
            </select>
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
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
                pageSize: 10,
                showSizeChanger: true,
              }}
              scroll={{ x: 1200 }}
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
  );
}

export default OrderSettlement;
