import React from 'react';
import { Card, Table, Empty } from 'antd';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { PageHeader } from '../../components/page-headers/page-headers';

/* ---------- Dummy Chart Data ---------- */
const finalAmountData = [
  { name: 'Jan-25', value: 0 },
  { name: 'Feb-25', value: 0 },
  { name: 'Mar-25', value: 0 },
];

const outstandingAmountData = [
  { name: 'Jan-25', value: 0 },
  { name: 'Feb-25', value: 0 },
  { name: 'Mar-25', value: 0 },
];

/* ---------- Table Columns ---------- */
const invoiceColumns = [
  { title: 'Invoice ID', dataIndex: 'invoiceId', sorter: true },
  { title: 'Invoice Date', dataIndex: 'invoiceDate', sorter: true },
  { title: 'Invoice Amount', dataIndex: 'invoiceAmount', align: 'right', sorter: true },
  { title: 'Deductions', dataIndex: 'deductions', align: 'right', sorter: true },
  { title: 'TCS/TDS', dataIndex: 'tcsTds', align: 'right', sorter: true },
  { title: 'Returns', dataIndex: 'returns', align: 'right', sorter: true },
  { title: 'Final Amount', dataIndex: 'finalAmount', align: 'right', sorter: true },
  { title: 'Bank Settled', dataIndex: 'bankSettled', align: 'right', sorter: true },
];

export default function Others() {
  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Reconcile',
    },
    {
      path: '',
      breadcrumbName: 'B2B Reconciliation',
    },
    {
      path: '',
      breadcrumbName: 'Others',
    },
  ];
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] flex-1 px-8 xl:px-[15px] pb-[30px] bg-transparent space-y-6">
        {/* ---------- Top Section ---------- */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-6">
          {/* Final Amount Chart */}
          <Card className="rounded-xl">
            <h3 className="text-sm font-medium mb-3">Final Amount</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={finalAmountData}>
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

          {/* Outstanding Amount Chart */}
          <Card className="rounded-xl">
            <h3 className="text-sm font-medium mb-3">Outstanding Amount</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={outstandingAmountData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Invoice Summary */}
          <Card className="rounded-xl">
            <h3 className="text-sm font-medium mb-3">Invoice Summary</h3>
            <div className="text-sm space-y-2">
              {[
                ['Invoice Amount', '₹0'],
                ['Deductions', '₹0'],
                ['TCS/TDS', '₹0'],
                ['Returns', '₹0'],
                ['Final Amount', '₹0'],
                ['Bank Settled', '₹0'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b py-1">
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ---------- Invoice Table ---------- */}
        <Card className="rounded-xl">
          <Table
            rowKey="invoiceId"
            columns={invoiceColumns}
            dataSource={[]}
            pagination={false}
            scroll={{ x: true }}
            locale={{
              emptyText: <Empty description="No data" />,
            }}
          />
        </Card>
      </main>
    </>
  );
}
