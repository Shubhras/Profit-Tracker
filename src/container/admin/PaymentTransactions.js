import React, { useEffect, useState } from 'react';
import { Table, Tag, Row, Col, Spin } from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TransactionOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { DataService } from '../../config/dataService/dataService';

function PaymentTransactions() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      total_transactions: 0,
      total_revenue: 0,
      successful_payments: 0,
      pending_payments: 0,
    },
    transactions: [],
  });

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await DataService.get('user/admin/payment-transactions/');
      if (response?.data?.status && response?.data?.data) {
        setData(response.data.data);
      }
    } catch (err) {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = data.transactions.filter((item) => {
    const matchesSearch =
      item.user?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.user_email?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.company?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.transaction_code?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.razorpay_order_id?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.razorpay_payment_id?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: <span className="text-[11px] font-semibold">Txn Code</span>,
      dataIndex: 'transaction_code',
      key: 'transaction_code',
      width: 100,
      render: (text) => <span className="text-[11px] font-mono font-medium text-blue-600">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">User</span>,
      dataIndex: 'user',
      key: 'user',
      width: 150,
      render: (text, record) => (
        <div>
          <p className="text-[11px] font-medium mb-0">{text}</p>
          <p className="text-[10px] text-[#6b7280] mb-0">{record.user_email}</p>
        </div>
      ),
    },
    {
      title: <span className="text-[11px] font-semibold">Company / Business</span>,
      dataIndex: 'company',
      key: 'company',
      width: 150,
      render: (text) => <span className="text-[11px] text-[#4b5563]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Plan</span>,
      dataIndex: 'plan_name',
      key: 'plan_name',
      width: 160,
      render: (text, record) => (
        <div className="flex flex-col items-start gap-1">
          <span className="text-[11px] font-semibold text-[#111827]">{text}</span>
          <Tag className="text-[9px] px-1 py-[1px] m-0 rounded border-0 bg-blue-50 text-blue-600 font-medium">
            {record.billing_cycle}
          </Tag>
        </div>
      ),
    },
    {
      title: <span className="text-[11px] font-semibold">Amount</span>,
      dataIndex: 'amount',
      key: 'amount',
      width: 110,
      render: (amount) => (
        <span className="text-[11px] font-bold text-[#111827]">₹{amount.toLocaleString('en-IN')}</span>
      ),
    },
    {
      title: <span className="text-[11px] font-semibold">Status</span>,
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status, record) => {
        const colorMap = {
          active: 'green',
          created: 'orange',
          cancelled: 'red',
          expired: 'gray',
          inactive: 'volcano',
        };

        return (
          <Tag
            color={colorMap[status.toLowerCase()] || 'blue'}
            className="text-[10px] px-2 py-[2px] rounded-full capitalize"
          >
            {record.is_paid ? 'Paid' : status}
          </Tag>
        );
      },
    },
    {
      title: <span className="text-[11px] font-semibold">Order ID</span>,
      dataIndex: 'razorpay_order_id',
      key: 'razorpay_order_id',
      width: 160,
      render: (text) => <span className="text-[10px] font-mono text-[#4b5563]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Payment ID</span>,
      dataIndex: 'razorpay_payment_id',
      key: 'razorpay_payment_id',
      width: 160,
      render: (text) => <span className="text-[10px] font-mono text-[#4b5563]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Date</span>,
      dataIndex: 'created_at',
      key: 'created_at',
      width: 140,
      render: (text) => <span className="text-[11px] text-[#6b7280]">{text}</span>,
    },
  ];

  const summaryCards = [
    {
      title: 'Total Transactions',
      value: data.summary.total_transactions,
      sub: 'All time subscriptions',
      color: '#3b82f6',
      icon: <TransactionOutlined style={{ color: '#3b82f6', fontSize: '18px' }} />,
    },
    {
      title: 'Total Revenue Collected',
      value: `₹${data.summary.total_revenue.toLocaleString('en-IN')}`,
      sub: 'Successful payments',
      color: '#22c55e',
      icon: <DollarOutlined style={{ color: '#22c55e', fontSize: '18px' }} />,
    },
    {
      title: 'Successful Payments',
      value: data.summary.successful_payments,
      sub: 'Active / Paid',
      color: '#10b981',
      icon: <CheckCircleOutlined style={{ color: '#10b981', fontSize: '18px' }} />,
    },
    {
      title: 'Pending Orders',
      value: data.summary.pending_payments,
      sub: 'Awaiting completion',
      color: '#f59e0b',
      icon: <ClockCircleOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />,
    },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen px-5 py-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] mb-0">Payment Transactions</h1>
          <p className="text-[#6b7280] text-[12px]">View and track all user subscription payment transactions.</p>
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

          {/* Table Container */}
          {/* Table Container */}
          <div className="bg-white shadow-sm p-3 rounded-xl">
            <div
              className="
      flex
      items-start
      justify-between
      gap-4
      mb-4

      lg:flex-col
      lg:items-stretch
    "
            >
              {/* LEFT CONTENT */}
              <div className="min-w-0">
                <h3 className="text-[16px] leading-[22px] font-semibold text-[#111827] mb-0">Transactions Log</h3>

                <p className="text-[12px] leading-[18px] text-[#6B7280] mb-0 mt-[2px]">
                  Complete list of subscription billing history.
                </p>
              </div>

              {/* SEARCH + FILTER */}
              <div
                className="
        flex
        items-center
        gap-2
        shrink-0

        lg:w-full
        lg:justify-end

        sm:flex-col
        sm:items-stretch
        sm:w-full
      "
              >
                {/* SEARCH */}
                <div
                  className="
          relative
          w-[260px]

          lg:w-[260px]

          sm:w-full
        "
                >
                  <input
                    type="text"
                    placeholder="Search user, email, order..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="
            w-full
            h-[34px]
            rounded-[6px]
            border
            border-[#D9DEE7]
            bg-white
            pl-3
            pr-9
            text-[12px]
            text-[#374151]
            outline-none
            transition-all
            placeholder:text-[#98A2B3]

            hover:border-[#B8C0CC]
            focus:border-[#22C55E]
            focus:ring-1
            focus:ring-[#22C55E]/10
          "
                  />

                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {searchText ? (
                      <button
                        type="button"
                        onClick={() => setSearchText('')}
                        className="
                flex
                items-center
                justify-center
                text-[#9CA3AF]
                hover:text-[#4B5563]
              "
                      >
                        <CloseCircleOutlined className="text-[13px]" />
                      </button>
                    ) : (
                      <SearchOutlined className="text-[13px] text-[#9CA3AF]" />
                    )}
                  </div>
                </div>

                {/* STATUS FILTER */}
                <div
                  className="
          relative
          w-[145px]

          lg:w-[145px]

          sm:w-full
        "
                >
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="
            appearance-none
            w-full
            h-[34px]
            rounded-[6px]
            border
            border-[#D9DEE7]
            bg-white
            pl-3
            pr-8
            text-[12px]
            text-[#4B5563]
            outline-none
            cursor-pointer
            transition-all

            hover:border-[#B8C0CC]
            focus:border-[#22C55E]
            focus:ring-1
            focus:ring-[#22C55E]/10
          "
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active / Paid</option>
                    <option value="created">Created</option>
                    <option value="inactive">Inactive</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <DownOutlined
                    className="
    pointer-events-none
    absolute
    right-3
    top-1/2
    -translate-y-1/2
    text-[10px]
    text-[#98A2B3]
  "
                  />
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={filteredTransactions}
              rowKey="id"
              pagination={{ pageSize: 10, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}` }}
              scroll={{ x: 1100 }}
              size="small"
              className="
    [&_.ant-table-thead>tr>th]:!text-[13px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[13px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-[6px]
  "
            />
          </div>
        </>
      )}
    </div>
  );
}

export default PaymentTransactions;
