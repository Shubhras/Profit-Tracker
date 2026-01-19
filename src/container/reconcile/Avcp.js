import React from 'react';
import { Card, Empty, Table } from 'antd';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { PageHeader } from '../../components/page-headers/page-headers';

const overdueData = [
  { name: 'Week 1', receivables: 0, deductions: 0, net: 0 },
  { name: 'Week 2', receivables: 0, deductions: 0, net: 0 },
  { name: 'Week 3', receivables: 0, deductions: 0, net: 0 },
];

const paymentExpectation = [
  { name: 'Jan', value: 0 },
  { name: 'Feb', value: 0 },
  { name: 'Mar', value: 0 },
];
const remittanceSummaryColumns = [
  {
    title: 'Invoice Type',
    dataIndex: 'invoiceType',
    key: 'invoiceType',
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: 'Remittance Amount',
    dataIndex: 'amount',
    key: 'amount',
    align: 'right',
    render: (value) => (value ? `₹ ${value}` : '-'),
  },
];

const invoiceColumns = [
  {
    title: 'Invoice ID',
    dataIndex: 'invoiceId',
    sorter: (a, b) => a.invoiceId.localeCompare(b.invoiceId),
  },
  {
    title: 'Invoice',
    dataIndex: 'invoice',
    sorter: (a, b) => a.invoice.localeCompare(b.invoice),
  },
  {
    title: 'Invoice Type',
    dataIndex: 'invoiceType',
    filters: [
      { text: 'GST', value: 'GST' },
      { text: 'Non-GST', value: 'Non-GST' },
    ],
    onFilter: (value, record) => record.invoiceType === value,
  },
  {
    title: 'Invoice Amount',
    dataIndex: 'invoiceAmount',
    sorter: (a, b) => a.invoiceAmount - b.invoiceAmount,
  },
  {
    title: 'Debit Amount',
    dataIndex: 'debitAmount',
    sorter: (a, b) => a.debitAmount - b.debitAmount,
  },
  {
    title: 'Final Receivables',
    dataIndex: 'finalReceivables',
    sorter: (a, b) => a.finalReceivables - b.finalReceivables,
  },
  {
    title: 'Remitted Amount',
    dataIndex: 'remittedAmount',
    sorter: (a, b) => a.remittedAmount - b.remittedAmount,
  },
  {
    title: 'Invoice Category',
    dataIndex: 'invoiceCategory',
  },
  {
    title: 'Payment Status',
    dataIndex: 'paymentStatus',
  },
  {
    title: 'Payment Due Date',
    dataIndex: 'paymentDueDate',
    sorter: (a, b) => new Date(a.paymentDueDate) - new Date(b.paymentDueDate),
  },
  {
    title: 'Original Invoice',
    dataIndex: 'originalInvoice',
  },
];

export default function Avcp() {
  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Reconcile' },
    { path: '', breadcrumbName: 'B2B Reconciliation' },
    { path: '', breadcrumbName: 'AVCP' },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="AmazonVCP Reconciliation"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-4 md:px-8 xl:px-[15px] pb-[30px] bg-transparent space-y-6">
        {/* Top Summary Cards */}
        <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {[
            'PO Invoice Outstanding',
            'DF Invoice Outstanding',
            'Contra/Cogs Invoice Outstanding',
            'Returns Invoice Outstanding',
          ].map((title) => (
            <Card key={title} className="rounded-2xl shadow-sm">
              <p className="text-base text-blue-500 font-semibold">{title}</p>
              <h2 className="text-3xl font-semibold mt-2">₹0</h2>
            </Card>
          ))}
        </div>

        {/* Graph Section */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-5">
          {/* Current Overdue */}
          <Card className="rounded-2xl shadow-sm">
            <h3 className="text-lg font-medium mb-4">Current Overdue</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overdueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="receivables" />
                  <Bar dataKey="deductions" />
                  <Bar dataKey="net" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Next Payment Expectation */}
          <Card className="rounded-2xl shadow-sm">
            <h3 className="text-lg font-medium mb-4">Next Payment Expectation</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paymentExpectation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Invoice & Remittance Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
          <Card className="rounded-2xl shadow-sm">
            <div className="text-sm space-y-2">
              <h3 className="text-lg font-medium mb-3">Invoice Summary</h3>
              {[
                'Total Invoice',
                'Debit (Contra, Cancel, Return)',
                'Final Receivables',
                'Remittance Amount',
                'Net Outstanding',
              ].map((item) => (
                <div key={item} className="flex justify-between border-b py-1">
                  <span>{item}</span>
                  <span>₹0</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Remittance Summary" bordered={false}>
            <Table
              columns={remittanceSummaryColumns}
              dataSource={[]}
              pagination={false}
              scroll={{ x: true }} // important for mobile
              locale={{
                emptyText: <Empty description="No remittance data" />,
              }}
            />
          </Card>
        </div>

        {/* Invoice Table */}
        <Card className="rounded-2xl shadow-sm overflow-x-auto">
          <Table
            rowKey="invoiceId"
            columns={invoiceColumns}
            size="small"
            dataSource={[]}
            pagination={false}
            locale={{
              emptyText: <Empty description="No data" />,
            }}
            scroll={{ x: true }}
          />
        </Card>
      </main>
    </>
  );
}
