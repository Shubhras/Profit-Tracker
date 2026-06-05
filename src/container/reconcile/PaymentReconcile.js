import React, { useEffect } from 'react';
import { Table, Tag, Tooltip } from 'antd';

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  HourglassOutlined,
  SearchOutlined,
  // FilterOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAmazonTransactionDetail, getAllSettlement } from '../../redux/reconcilePayment/actionCreator';

function PaymentReconcile() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = React.useState('payments');

  // const transactionData = useSelector((state) => state.reconcilePayment?.amazontransation);
  const transactionData = useSelector((state) => state.reconcilePayment?.amazontransation);
  console.log('transactionData', transactionData);
  const reduxState = useSelector((state) => state);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  console.log(reduxState);
  const loading = useSelector((state) => state.reconcilePayment?.loading);
  const settlementData = useSelector((state) => state.reconcilePayment?.allsettlementData);

  useEffect(() => {
    if (activeTab === 'payments') {
      dispatch(getAmazonTransactionDetail(pagination.current, pagination.pageSize));
    } else {
      dispatch(getAllSettlement());
    }
  }, [dispatch, activeTab, pagination.current, pagination.pageSize]);

  // const tableData = activeTab === 'payments' ? transactionData : settlementData;

  // const dataSource =
  //   tableData?.data?.map((item) => ({
  //     key: item.id,

  //     id: item.id,
  //     transactionId: item.transaction_id,
  //     transactionType: item.transaction_type,
  //     transactionStatus: item.transaction_status,
  //     description: item.description,
  //     postedDate: item.posted_date,
  //     totalAmount: item.total_amount,
  //     currencyCode: item.currency_code,
  //   })) || [];

  const dataSource =
    activeTab === 'payments'
      ? transactionData?.results?.flatMap((group) =>
          group.transactions.map((item) => ({
            key: item.id,
            transactionId: item.transaction_id,
            transactionType: item.transaction_type,
            transactionStatus: item.transaction_status,
            description: item.description,
            postedDate: item.posted_date,
            totalAmount: item.total_amount,
            currencyCode: item.currency_code,
          })),
        ) || []
      : settlementData?.results?.map((item, index) => ({
          key: index,
          statementPeriod: item.statement_period,
          startDate: item.start_date,
          endDate: item.end_date,
          beginningBalance: item.beginning_balance,
          sales: item.sales,
          refunds: item.refunds,
          expenses: item.expenses,
          payoutAmount: item.payout_amount,
          totalTransactions: item.total_transactions,
        })) || [];

  const paymentColumns = [
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   width: 30,
    //   align: 'center',
    //   ellipsis: true,
    // },

    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      width: 70,
      ellipsis: true,
      align: 'center',
      sorter: (a, b) => String(a.transactionId).localeCompare(String(b.transactionId)),

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
      width: 70,
      align: 'center',
      ellipsis: true,
      sorter: (a, b) => String(a.transactionType).localeCompare(String(b.transactionType)),
    },

    {
      title: 'Status',
      dataIndex: 'transactionStatus',
      width: 70,
      align: 'center',
      sorter: (a, b) => String(a.transactionStatus).localeCompare(String(b.transactionStatus)),
      ellipsis: true,
      render: (status) => (
        <Tag
          className="h-[20px] text-[10px] px-1"
          color={status === 'SUCCESS' ? 'success' : status === 'DEFERRED' ? 'processing' : 'error'}
        >
          {status}
        </Tag>
      ),
    },

    {
      title: 'Description',
      dataIndex: 'description',
      width: 70,
      align: 'center',
      sorter: (a, b) => String(a.description).localeCompare(String(b.description)),
    },

    {
      title: 'Posted Date',
      dataIndex: 'postedDate',
      width: 70,
      align: 'center',
      ellipsis: true,
      render: (date) => (date ? new Date(date).toLocaleString() : '-'),
      sorter: (a, b) => a.postedDate - b.postedDate,
    },

    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      width: 70,
      align: 'center',
      ellipsis: true,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (value) => <span className="font-medium text-green-600">₹ {value}</span>,
    },

    {
      title: 'Currency',
      dataIndex: 'currencyCode',
      width: 70,
      align: 'center',
      ellipsis: true,
      sorter: (a, b) => a.currencyCode - b.currencyCode,
    },
  ];

  const settlementColumns = [
    {
      title: 'Statement Period',
      dataIndex: 'statementPeriod',
      align: 'center',
      ellipsis: true,
      sorter: (a, b) => a.statementPeriod - b.statementPeriod,
      width: 70,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.startDate - b.startDate,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.endDate - b.endDate,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Beginning Balance',
      dataIndex: 'beginningBalance',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.beginningBalance - b.beginningBalance,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {`₹ ${Number(v).toFixed(2)}`}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.sales - b.sales,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {`₹ ${Number(v).toFixed(2)}`}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Refunds',
      dataIndex: 'refunds',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.refunds - b.refunds,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {`₹ ${Number(v).toFixed(2)}`}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.expenses - b.expenses,
      render: (value) => <span className="text-red-600 font-medium">₹ {Number(value).toFixed(2)}</span>,
    },
    {
      title: 'Payout Amount',
      dataIndex: 'payoutAmount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.payoutAmount - b.payoutAmount,
      render: (value) => <span className="text-green-700 font-semibold">₹ {Number(value).toFixed(2)}</span>,
    },
    {
      title: 'Transactions',
      dataIndex: 'totalTransactions',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.totalTransactions - b.totalTransactions,
    },
  ];

  const columns = activeTab === 'payments' ? paymentColumns : settlementColumns;

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-3 md:p-2 sm:p-1">
      {' '}
      {/* HEADER */}
      <div className="mb-2 flex items-start justify-between lg:flex-col lg:gap-2">
        <div>
          <h1 className="text-[24px] md:text-[20px] sm:text-[18px] font-semibold text-[#111827] leading-none mb-1">
            Payments
          </h1>

          <p className="mt-1 text-[11px] text-[#6b7280]">
            View all payments transferred by marketplaces. Track expected vs received and identify gaps.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[#6b7280] lg:flex-wrap">
          <span>Payment Reconciliation</span>

          <span>{'>'}</span>

          <span className="font-semibold text-[#2563eb]">Payments</span>
        </div>
      </div>
      {/* TOP CARDS */}
      <div className="grid grid-cols-5 lg:grid-cols-2 md:grid-cols-1 gap-2 mb-3">
        {' '}
        {[
          {
            title: 'Total Expected',
            value: '₹ 2,85,420.75',
            sub: 'From 2,189 Orders',
            color: 'text-[#2563eb]',
            bg: 'bg-[#eff6ff]',
            icon: <FileTextOutlined />,
          },

          {
            title: 'Total Received',
            value: '₹ 2,20,790.85',
            sub: '77.34% of Expected',
            color: 'text-[#16a34a]',
            bg: 'bg-[#ecfdf3]',
            icon: <CheckCircleOutlined />,
          },

          {
            title: 'Pending In Transit',
            value: '₹ 29,480.00',
            sub: '10 Payments',
            color: 'text-[#7c3aed]',
            bg: 'bg-[#f5f3ff]',
            icon: <ClockCircleOutlined />,
          },

          {
            title: 'Shortfall / Unreconciled',
            value: '₹ 35,149.90',
            sub: '12.32% of Expected',
            color: 'text-[#ef4444]',
            bg: 'bg-[#fef2f2]',
            icon: <CloseCircleOutlined />,
          },

          {
            title: 'Avg. Settlement Time',
            value: '3.6 Days',
            sub: 'vs Last Month 3.2 Days',
            color: 'text-[#ca8a04]',
            bg: 'bg-[#fefce8]',
            icon: <HourglassOutlined />,
          },
        ].map((item, index) => (
          <div key={index} className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 sm:px-2">
            {' '}
            <div className="flex items-center gap-2">
              {/* Icon */}
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[13px] ${item.bg} ${item.color}`}
              >
                {item.icon}
              </div>

              {/* Content */}
              <div className="min-w-0 mt-1">
                {/* Heading */}
                <p className="truncate text-[11px] font-medium leading-[11px] text-[#6b7280]">{item.title}</p>

                {/* Value */}
                <h2 className={`mt-[1px] truncate text-[16px] font-bold leading-none ${item.color}`}>{item.value}</h2>

                {/* Bottom Text */}
                <p className="mt-[2px] truncate text-[10px] leading-none text-[#9ca3af]">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* MAIN */}
      <div className="grid grid-cols-1">
        {' '}
        {/* LEFT */}
        <div className="rounded-l border border-[#e5e7eb] bg-white overflow-hidden">
          {/* TABS */}
          <div className="flex items-center gap-6 border-b border-[#edf0f2] px-3 py-2 sm:flex-wrap sm:gap-3">
            {' '}
            {[
              { label: 'All Payments', value: 'payments' },
              { label: 'All Settlements', value: 'settlements' },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setActiveTab(item.value);

                  setPagination({
                    current: 1,
                    pageSize: 10,
                  });
                }}
                className={`pb-0 text-[12px] font-semibold ${
                  activeTab === item.value ? 'border-b-2 border-[#16a34a] text-[#16a34a]' : 'text-[#6b7280]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* FILTERS */}
          <div className="flex items-center gap-3 border-b border-[#edf0f2] px-4 py-3 lg:flex-wrap">
            {' '}
            <select
              className="py-1 rounded-l border border-[#e5e7eb] bg-white px-2 text-[10px] outline-none md:w-full
"
            >
              <option>All Marketplaces</option>
            </select>
            <select
              className="py-1 rounded-l border border-[#e5e7eb] bg-white px-2 text-[10px] outline-none md:w-full
"
            >
              <option>All Types</option>
            </select>
            <select
              className="py-1 rounded-l border border-[#e5e7eb] bg-white px-2 text-[10px] outline-none md:w-full
"
            >
              <option>All Status</option>
            </select>
            <input
              type="text"
              value="01/05/2026 - 31/05/2026"
              readOnly
              className="h-[30px] w-[170px] rounded-l border border-[#e5e7eb] px-2 text-[10px] outline-none md:w-full
"
            />
            <div className="relative ml-auto md:ml-0 md:w-full">
              <input
                placeholder="Search Payment ID...."
                className="h-[34px] w-[180px] md:w-full rounded-l border border-[#e5e7eb] pl-3 pr-9 text-[11px] outline-none"
              />

              <SearchOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9ca3af]" />
            </div>
            {/* <button
              type="button"
              className="flex py-1 items-center gap-2 rounded-l border border-[#e5e7eb] px-3 text-[10px] font-medium text-[#374151]"
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
              loading={loading}
              showSorterTooltip={false}
              tableLayout="fixed"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: activeTab === 'payments' ? dataSource.length : settlementData?.count || 0,

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
              scroll={{ x: 800 }}
              size="middle"
              bordered={false}
              className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
  "
            />
          </div>
        </div>
        {/* RIGHT SIDEBAR */}
        {/* <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-2 lg:space-y-0 md:grid-cols-1">
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[15px] font-semibold text-[#111827]">Payment Summary</h2>

            <div className="mt-3 space-y-3">
              {[
                ['Total Expected', '₹ 2,85,420.75'],
                ['Total Received', '₹ 2,20,790.85'],
                ['Pending In Transit', '₹ 29,480.00'],
                ['Shortfall / Unreconciled', '₹ 35,149.90'],
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-2">
                  <span className="text-[12px] text-[#6b7280]">{item[0]}</span>

                  <span className="text-[11px] font-semibold text-[#111827]">{item[1]}</span>
                </div>
              ))}
            </div>

            <button type="button" className="mt-4 text-[11px] font-medium text-[#16a34a]">
              View Summary →
            </button>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[15px] font-semibold text-[#111827]">Payment Type Breakdown</h2>

            <div className="mt-3 space-y-3">
              {[
                ['Payout', '₹ 2,42,150.45 (84.84%)'],
                ['Fee Refund', '₹ 12,450.00 (4.36%)'],
                ['Adjustments', '₹ 8,120.30 (2.85%)'],
                ['Incentives', '₹ 4,700.00 (1.65%)'],
                ['Others', '₹ 17,999.00 (6.30%)'],
              ].map((item, index) => (
                <div key={index} className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="mt-[5px] h-2 w-2 rounded-full bg-[#2563eb]" />

                    <span className="text-[12px] text-[#374151]">{item[0]}</span>
                  </div>

                  <span className="text-[10px] font-medium text-[#111827]">{item[1]}</span>
                </div>
              ))}
            </div>

            <button type="button" className="mt-4 text-[11px] font-medium text-[#16a34a]">
              View All →
            </button>
          </div>

          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="text-[15px] font-semibold text-[#111827]">Quick Actions</h2>

            <div className="mt-3 space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-3 sm:gap-2 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
              >
                <DownloadOutlined className="text-[15px] text-[#2563eb]" />

                <div>
                  <p className="text-[12px] font-semibold text-[#111827] mb-0">Download All Payments</p>

                  <p className="text-[11px] text-[#9ca3af]">Export complete payment data</p>
                </div>
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border border-[#e5e7eb] px-3 py-2 text-left hover:bg-[#fafafa]"
              >
                <WarningOutlined className="text-[15px] text-[#ef4444]" />

                <div>
                  <p className="text-[12px] font-semibold text-[#111827] mb-0">View All Leaks</p>

                  <p className="text-[11px] text-[#9ca3af]">Analyze and claim reimbursements</p>
                </div>
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default PaymentReconcile;
