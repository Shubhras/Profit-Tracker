import React, { useState } from 'react';
import { Card, Table, Checkbox, Popover, Empty, Pagination, Switch } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from 'recharts';
import ReturnFilterBar from './component/ReturnFilterBar';

import { PageHeader } from '../../components/page-headers/page-headers';

/* ================= MOCK DATA ================= */
const channelSummaryData = [
  { channel: 'Amazon-India', rto: 17, cret: 218, total: 235, yet: 59, received: 152, notInHand: 24 },
  { channel: 'Flipkart', rto: 22, cret: 5, total: 27, yet: 16, received: 5, notInHand: 6 },
  { channel: 'Meesho', rto: 32, cret: 31, total: 63, yet: 47, received: 11, notInHand: 5 },
];

const waterfallData = [
  {
    name: 'Yet to be Received',
    value: 122,
    type: 'increase',
  },
  {
    name: 'Received but not in Hand',
    value: 35,
    type: 'increase',
  },
  {
    name: 'Total',
    value: 325,
    type: 'total',
  },
];

const invoiceData = [
  {
    key: '1',
    channel: 'Amazon',
    orderId: 'OD43645435886535100',
    orderItemId: 'ITEM-101',
    orderDate: '06-01-2026',
    returnAppDate: '12-01-2026',
    returnDelDate: '16-01-2026',
    returnMarkedDate: '10-01-2026',
    returnStatus: 'RTO TRANSIT',
    fulfillmentChannel: 'Amazon FC',
    productId: 'PID-889',
    sku: 'cami-Black-White',
    qty: 1,
    trackingId1: 'TRK-001',
    trackingId2: '-',
    trackingId3: '-',
    trackingId4: '-',
    returnReason: 'Damaged',
    returnSubReason: 'Packaging',
    inYourHand: false,
    notSellable: false,
    resolvedClaimed: false,
  },
];

/* ================= ALL TABLE COLUMNS ================= */
const ALL_COLUMNS = [
  // Channel / Order
  { key: 'channel', title: 'Channel', dataIndex: 'channel' },

  { key: 'orderId', title: 'Order Id', dataIndex: 'orderId' },

  { key: 'orderItemId', title: 'Order Item Id', dataIndex: 'orderItemId' },

  { key: 'orderDate', title: 'Order Date', dataIndex: 'orderDate' },

  // Return Dates
  { key: 'returnAppDate', title: 'Return App. Date', dataIndex: 'returnAppDate' },

  { key: 'returnDelDate', title: 'Return Del Date', dataIndex: 'returnDelDate' },

  { key: 'returnMarkedDate', title: 'Return Marked Date', dataIndex: 'returnMarkedDate' },

  // Status
  {
    key: 'returnStatus',
    title: 'Return Status',
    dataIndex: 'returnStatus',
    render: (status) => (
      <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">{status || '-'}</span>
    ),
  },

  // Fulfillment / Product
  { key: 'fulfillmentChannel', title: 'Fulfillment Channel', dataIndex: 'fulfillmentChannel' },

  { key: 'productId', title: 'Product Id', dataIndex: 'productId' },

  { key: 'sku', title: 'Sku', dataIndex: 'sku' },

  { key: 'qty', title: 'Qty', dataIndex: 'qty' },

  // Tracking
  { key: 'trackingId1', title: 'Tracking ID 1', dataIndex: 'trackingId1' },

  { key: 'trackingId2', title: 'Tracking ID 2', dataIndex: 'trackingId2' },

  { key: 'trackingId3', title: 'Tracking ID 3', dataIndex: 'trackingId3' },

  { key: 'trackingId4', title: 'Tracking ID 4', dataIndex: 'trackingId4' },

  // Return Reason
  { key: 'returnReason', title: 'Return Reason', dataIndex: 'returnReason' },

  { key: 'returnSubReason', title: 'Return Sub Reason', dataIndex: 'returnSubReason' },

  {
    key: 'inYourHand',
    title: 'In Your Hand',
    dataIndex: 'inYourHand',
    align: 'center',
    render: (val) => <Switch checked={val} size="small" />,
  },
  {
    key: 'notSellable',
    title: 'Not Sellable',
    dataIndex: 'notSellable',
    align: 'center',
    render: (val) => <Switch checked={val} size="small" />,
  },
  {
    key: 'resolvedClaimed',
    title: 'Resolved/Claimed',
    dataIndex: 'resolvedClaimed',
    align: 'center',
    render: (val) => (
      <span className={`text-xs font-medium ${val ? 'text-green-600' : 'text-gray-400'}`}>{val ? 'Yes' : 'No'}</span>
    ),
  },
];

/* ================= SUMMARY TABLE ================= */
const summaryColumns = [
  { title: 'Channel', dataIndex: 'channel' },
  { title: 'RTO', dataIndex: 'rto' },
  { title: 'CRET', dataIndex: 'cret' },
  { title: 'Total', dataIndex: 'total' },
  { title: 'Yet to be Received', dataIndex: 'yet' },
  { title: 'Received', dataIndex: 'received' },
  { title: 'Received but not In Hand', dataIndex: 'notInHand' },
  { title: 'Resolved/Claimed', render: () => '-' },
];

export default function ReturnLedger() {
  const PageRoutes = [
    { path: '', breadcrumbName: 'Reconcile' },
    { path: '', breadcrumbName: 'Returns' },
    { path: '', breadcrumbName: 'Returns Tracker' },
  ];

  const [selectedCols, setSelectedCols] = useState(ALL_COLUMNS.map((c) => c.key));
  const [page, setPage] = useState(1);

  const visibleColumns = ALL_COLUMNS.filter((c) => selectedCols.includes(c.key));

  const getWaterfallChartData = (data) => {
    let runningTotal = 0;

    return data.map((item) => {
      if (item.type === 'total') {
        return {
          ...item,
          start: 0,
          end: item.value,
        };
      }

      const start = runningTotal;
      runningTotal += item.value;

      return {
        ...item,
        start,
        end: runningTotal,
      };
    });
  };

  /* ================= COLUMN SETTINGS POPOVER ================= */
  const columnSelector = (
    <div className="w-[720px] max-w-[95vw] max-h-[420px] overflow-y-auto p-2">
      <h4 className="text-center font-medium mb-3">Customize Your Columns</h4>

      <div className="mb-3">
        <Checkbox
          checked={selectedCols.length === ALL_COLUMNS.length}
          onChange={(e) => setSelectedCols(e.target.checked ? ALL_COLUMNS.map((c) => c.key) : [])}
        >
          Select All
        </Checkbox>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-1 gap-3">
        {ALL_COLUMNS.map((col) => (
          <div key={col.key} className="flex items-center gap-2 bg-gray-50 rounded-md px-2 py-1">
            <Checkbox
              checked={selectedCols.includes(col.key)}
              onChange={(e) => {
                setSelectedCols((prev) => (e.target.checked ? [...prev, col.key] : prev.filter((k) => k !== col.key)));
              }}
            />
            <span className="text-sm">{col.title}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Returns Tracker"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:flex-col bg-transparent"
      />

      <main className="min-h-[715px] flex-1 px-8 xl:px-[15px] pb-[30px] bg-transparent space-y-5">
        {/* -------- Filters -------- */}
        <ReturnFilterBar />

        <div className="grid grid-cols-2 md:grid-cols-1 gap-5">
          {/* -------- Channel Summary -------- */}
          <Card className="rounded-xl">
            <Table
              size="small"
              columns={summaryColumns}
              dataSource={channelSummaryData}
              rowKey="channel"
              pagination={false}
              scroll={{ x: true }}
            />
          </Card>

          {/* -------- Chart Placeholder -------- */}
          <Card className="rounded-xl h-[320px]">
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={getWaterfallChartData(waterfallData)}
                margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />

                {/* Invisible offset bar */}
                <Bar dataKey="start" stackId="a" fill="transparent" />

                {/* Actual waterfall bars */}
                <Bar dataKey="end" stackId="a">
                  {getWaterfallChartData(waterfallData).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.type === 'total'
                          ? '#4096ff' // blue (Total)
                          : entry.type === 'increase'
                          ? '#fa7d63' // red (Increase)
                          : '#22c55e' // green (Decrease)
                      }
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* -------- Invoice Table -------- */}
        <Card className="rounded-xl">
          {/* Settings Button */}
          <div className="flex justify-start mb-2">
            <Popover content={columnSelector} trigger="click" placement="bottomLeft">
              <SettingOutlined className="text-lg cursor-pointer" />
            </Popover>
          </div>

          <Table
            columns={visibleColumns}
            size="small"
            dataSource={invoiceData}
            pagination={false}
            rowKey="orderId"
            scroll={{ x: 1200 }}
            locale={{ emptyText: <Empty description="No data" /> }}
          />

          {/* Pagination */}
          <div className="flex justify-end mt-4">
            <Pagination current={page} total={0} pageSize={10} onChange={(p) => setPage(p)} showSizeChanger={false} />
          </div>
        </Card>
      </main>
    </>
  );
}
