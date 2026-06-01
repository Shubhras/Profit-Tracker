import React from 'react';
import { Button, Table, Select, DatePicker, Input, Tag } from 'antd';
import {
  FileTextOutlined,
  CheckSquareOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  WalletOutlined,
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  CustomerServiceOutlined,
  MoreOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;

function InvoicesBilling() {
  const billingStats = [
    {
      title: 'Total Invoices',
      value: '32',
      sub: 'All time invoices',
      icon: <FileTextOutlined />,
      color: '#16a34a',
      bg: '#ecfdf5',
    },
    {
      title: 'Paid Invoices',
      value: '26',
      sub: '₹ 2,35,000',
      icon: <CheckSquareOutlined />,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      title: 'Pending Invoices',
      value: '4',
      sub: '₹ 45,000',
      icon: <ClockCircleOutlined />,
      color: '#f97316',
      bg: '#fff7ed',
    },
    {
      title: 'Overdue Invoices',
      value: '2',
      sub: '₹ 15,000',
      icon: <WarningOutlined />,
      color: '#9333ea',
      bg: '#faf5ff',
    },
    {
      title: 'Total Paid',
      value: '₹ 2,35,000',
      sub: 'All time payments',
      icon: <WalletOutlined />,
      color: '#16a34a',
      bg: '#ecfdf5',
    },
  ];
  const data = [
    {
      key: 1,
      invoice: 'INV-2026-00032',
      service: 'Payment Reconciliation',
      type: 'TrackMyProfit Service',
      period: '01 May 2026 - 31 May 2026',
      invoiceDate: '01 May 2026',
      dueDate: '31 May 2026',
      amount: '₹ 10,000',
      status: 'Paid',
    },
    {
      key: 2,
      invoice: 'INV-2026-00031',
      service: 'Advertising Management',
      type: 'TrackMyProfit Service',
      period: '01 May 2026 - 31 May 2026',
      invoiceDate: '01 May 2026',
      dueDate: '31 May 2026',
      amount: '₹ 15,000',
      status: 'Paid',
    },
    {
      key: 3,
      invoice: 'INV-2026-00030',
      service: 'Other TrackMyProfit Services',
      type: 'TrackMyProfit Service',
      period: '01 May 2026 - 31 May 2026',
      invoiceDate: '01 May 2026',
      dueDate: '31 May 2026',
      amount: '₹ 8,000',
      status: 'Pending',
    },
    {
      key: 4,
      invoice: 'INV-2026-00029',
      service: 'Amazon Account Management',
      type: 'Account Management',
      period: '01 May 2026 - 31 May 2026',
      invoiceDate: '01 May 2026',
      dueDate: '31 May 2026',
      amount: '₹ 20,000',
      status: 'Paid',
    },
    {
      key: 5,
      invoice: 'INV-2026-00028',
      service: 'Google Account Management',
      type: 'Digital Marketing',
      period: '01 May 2026 - 31 May 2026',
      invoiceDate: '01 May 2026',
      dueDate: '31 May 2026',
      amount: '₹ 25,000',
      status: 'Paid',
    },
  ];

  const columns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoice',
      width: 140,
      render: (text) => <span className="text-[#2563eb] font-semibold text-[11px]">{text}</span>,
    },

    {
      title: 'Service',
      dataIndex: 'service',
      width: 180,
      render: (text) => <span className="text-[11px] font-medium">{text}</span>,
    },

    {
      title: 'Service Type',
      dataIndex: 'type',
      width: 150,
      render: (text) => <Tag color="green">{text}</Tag>,
    },

    {
      title: 'Billing Period',
      dataIndex: 'period',
      width: 180,
      render: (text) => <span className="text-[11px] font-medium">{text}</span>,
    },

    {
      title: 'Invoice Date',
      dataIndex: 'invoiceDate',
      width: 120,
      render: (text) => <span className="text-[11px] font-medium">{text}</span>,
    },

    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      width: 120,
      render: (text) => <span className="text-[11px] font-medium">{text}</span>,
    },

    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 120,
      render: (text) => <span className="font-semibold text-[11px]">{text}</span>,
    },

    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const color = status === 'Paid' ? 'green' : status === 'Pending' ? 'orange' : 'red';

        return <Tag color={color}>{status}</Tag>;
      },
    },

    {
      title: 'Actions',
      width: 100,
      render: () => (
        <div className="flex gap-2">
          <Button size="small" icon={<EyeOutlined />} />

          <Button size="small" icon={<DownloadOutlined />} />
        </div>
      ),
    },
  ];

  return (
    <div className="p-2 px-3 shadow-sm mt-3 mb-3">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-[20px] font-bold text-[#111827] mb-0">Invoices & Billing</h1>

        <p className="text-[12px] text-[#6b7280]">
          View, download and manage all your invoices and billing history for value added services.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-5 gap-2 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
        {billingStats.map((item) => (
          <div key={item.title} className="border border-[#edf0f2] rounded-xl px-2 py-1.5 bg-white">
            <div className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[16px]"
                style={{
                  background: item.bg,
                  color: item.color,
                }}
              >
                {item.icon}
              </div>

              <div className="flex-1">
                <p className="text-[12px] text-[#6b7280] mb-0.5">{item.title}</p>

                <h3 className="text-[18px] font-bold text-[#111827] leading-none">{item.value}</h3>

                <p className="text-[10px] text-[#6b7280] mt-1">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-12 gap-2 mt-3">
        {/* LEFT CONTENT */}
        <div className="col-span-9 xl:col-span-8 lg:col-span-12">
          <div className="bg-white border border-[#edf0f2] rounded-xl overflow-hidden">
            {/* TOP BAR */}
            <div className="px-4 py-3 border-b border-[#edf0f2]">
              {/* TABS */}
              <div className="flex items-center gap-6 overflow-x-auto mb-3">
                <button type="button" className="text-[#16a34a] font-semibold text-[12px] border-b-2 border-[#16a34a]">
                  All Invoices
                </button>

                <button type="button" className="text-[12px] text-[#64748b]">
                  Paid
                </button>

                <button type="button" className="text-[12px] text-[#64748b]">
                  Pending
                </button>

                <button type="button" className="text-[12px] text-[#64748b]">
                  Overdue
                </button>
              </div>

              {/* FILTERS */}
              <div className="flex justify-end">
                <div className="flex items-center gap-2 flex-wrap">
                  <Select size="small" placeholder="All Services" className="!w-[140px] !h-[28px] text-[11px]" />

                  <RangePicker size="small" className="!w-[220px] !h-[28px] text-[11px]" />

                  <Input
                    size="small"
                    placeholder="Search invoices..."
                    prefix={<SearchOutlined />}
                    className="!w-[180px] !h-[28px] text-[11px]"
                  />

                  <Button size="small" icon={<FilterOutlined />} />
                </div>
              </div>
            </div>

            {/* TABLE */}
            <Table
              className="[&_.ant-table-thead>tr>th]:text-[11px] [&_.ant-table-thead>tr>th]:font-medium"
              columns={columns}
              dataSource={data}
              size="small"
              pagination={{
                pageSize: 10,
                size: 'small',
                showSizeChanger: true,
              }}
              scroll={{ x: 1500 }}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-3 xl:col-span-4 lg:col-span-12">
          <div className="flex flex-col gap-2">
            {/* BILLING SUMMARY */}

            <div className="bg-white border border-[#edf0f2] rounded-xl p-3">
              <h3 className="text-[15px] font-semibold text-[#111827] mb-2">Billing Summary</h3>

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span>Total Invoices</span>
                  <span className="font-semibold">32</span>
                </div>

                <div className="flex justify-between">
                  <span>Paid Invoices</span>
                  <span className="font-semibold">26</span>
                </div>

                <div className="flex justify-between">
                  <span>Pending Invoices</span>
                  <span className="font-semibold">4</span>
                </div>

                <div className="flex justify-between">
                  <span>Overdue Invoices</span>
                  <span className="font-semibold">2</span>
                </div>
              </div>

              <div className="my-4 border-t border-[#edf0f2]" />

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span>Total Paid</span>
                  <span className="font-semibold">₹ 2,35,000</span>
                </div>

                <div className="flex justify-between">
                  <span>Total Outstanding</span>
                  <span className="font-semibold">₹ 60,000</span>
                </div>
              </div>

              <Button block className="mt-2 text-[12px] !bg-[#16a34a] text-white">
                Download Statement
              </Button>
            </div>

            {/* PAYMENT METHODS */}

            <div className="bg-white border border-[#edf0f2] rounded-xl p-3">
              <h3 className="text-[15px] font-semibold mb-2">Payment Methods</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium text-[12px]">HDFC Bank</div>

                    <div className="text-[11px] text-[#6b7280]">**** 1234</div>
                  </div>

                  <Tag color="blue">Primary</Tag>
                </div>

                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <div className="font-medium text-[12px]">Axis Bank</div>

                    <div className="text-[11px] text-[#6b7280]">**** 5678</div>
                  </div>

                  <MoreOutlined />
                </div>
              </div>

              <Button block className="mt-3 text-[12px] !bg-[#16a34a] text-white">
                Manage Payment Methods
              </Button>
            </div>

            {/* SUPPORT */}

            <div className="bg-white border border-[#edf0f2] rounded-xl p-3">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ecfdf5] flex items-center justify-center">
                  <CustomerServiceOutlined className="text-[#16a34a]" />
                </div>

                <div>
                  <h3 className="font-semibold text-[15px] mb-1">Need Help?</h3>

                  <p className="text-[11px] text-[#6b7280]">
                    Our billing team is here to help with invoices and payments.
                  </p>
                </div>
              </div>

              <Button block className="mt-3 text-[12px] !bg-[#16a34a] text-white">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicesBilling;
