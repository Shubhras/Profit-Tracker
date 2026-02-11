import React from 'react';
import { Card, Table, Empty } from 'antd';
import { PageHeader } from '../../components/page-headers/page-headers';

/* ---------------- Ledger Summary ---------------- */
const ledgerSummaryData = [
  {
    key: '1',
    label: 'Forward Amount',
    mp: 0,
    ledger: 0,
    difference: 0,
  },
  {
    key: '2',
    label: 'Reverse Amount',
    mp: 0,
    ledger: 0,
    difference: 0,
  },
  {
    key: '3',
    label: 'Total Amount',
    mp: 0,
    ledger: 0,
    difference: 0,
  },
  {
    key: '4',
    label: 'Remitted Amount',
    mp: 0,
    ledger: 0,
    difference: 0,
  },
];

const ledgerSummaryColumns = [
  { title: '', dataIndex: 'label' },
  {
    title: 'MP',
    dataIndex: 'mp',
    align: 'right',
    render: (v) => `₹${v}`,
  },
  {
    title: 'Your Ledger',
    dataIndex: 'ledger',
    align: 'right',
    render: (v) => `₹${v}`,
  },
  {
    title: 'Difference',
    dataIndex: 'difference',
    align: 'right',
    render: (v) => `₹${v}`,
  },
];

/* ---------------- Summary Cards ---------------- */
const summaryCards = [
  'Only Customer Ledger Invoices',
  'Only MP Invoices',
  'Forward Amount Difference Invoices',
  'Reverse Amount Difference Invoices',
  'Total Amount Difference Invoices',
  'Remitted Amount Difference Invoices',
  'MP Pending Payment Invoices',
  'Ledger Pending Payment Invoices',
];

/* ---------------- Invoice Table ---------------- */
const invoiceColumns = [
  { title: 'Invoice ID', dataIndex: 'invoiceId', sorter: true },
  { title: 'MP Date', dataIndex: 'mpDate', sorter: true },
  { title: 'Ledger Date', dataIndex: 'ledgerDate', sorter: true },
  { title: 'MP Forward', dataIndex: 'mpForward', align: 'right', sorter: true },
  { title: 'Ledger Forward', dataIndex: 'ledgerForward', align: 'right', sorter: true },
  { title: 'MP Reverse', dataIndex: 'mpReverse', align: 'right', sorter: true },
  { title: 'Ledger Reverse', dataIndex: 'ledgerReverse', align: 'right', sorter: true },
  { title: 'MP Total', dataIndex: 'mpTotal', align: 'right', sorter: true },
  { title: 'Ledger Total', dataIndex: 'ledgerTotal', align: 'right', sorter: true },
  { title: 'MP Remitted', dataIndex: 'mpRemitted', align: 'right', sorter: true },
  { title: 'Ledger Remitted', dataIndex: 'ledgerRemitted', align: 'right', sorter: true },
];

export default function CustLedger() {
  const PageRoutes = [
    { path: '', breadcrumbName: 'Reconcile' },
    { path: '', breadcrumbName: 'B2B Reconciliation' },
    { path: '', breadcrumbName: 'Cust. Ledger' },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="QC Ledger Reconciliation"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:flex-col bg-transparent"
      />

      <main className="min-h-[715px] flex-1 px-8 xl:px-[15px] pb-[30px] bg-transparent space-y-6">
        {/* -------- Ledger Summary Table -------- */}
        <Card className="rounded-xl">
          <Table
            columns={ledgerSummaryColumns}
            dataSource={ledgerSummaryData}
            pagination={false}
            size="small"
            scroll={{ x: true }}
          />
        </Card>

        {/* -------- Summary Cards -------- */}
        <div className="grid grid-cols-4 lg:grid-cols-2 sm:grid-cols-1 gap-4">
          {summaryCards.map((title) => (
            <Card key={title} className="rounded-xl cursor-pointer">
              <div className="flex justify-between items-center gap-5 ">
                <span className="text-sm font-medium text-blue-700">{title}</span>
                <span className="text-xl font-semibold">0</span>
              </div>
            </Card>
          ))}
        </div>

        {/* -------- Invoice Table -------- */}
        <Card className="rounded-xl">
          <Table
            rowKey="invoiceId"
            columns={invoiceColumns}
            dataSource={[]}
            pagination={false}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: <Empty description="No data" />,
            }}
          />
        </Card>
      </main>
    </>
  );
}
