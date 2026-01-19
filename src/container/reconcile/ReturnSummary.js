import React from 'react';
import { Table, Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function ReturnSummary() {
  const PageRoutes = [
    { path: '', breadcrumbName: 'Reconcile' },
    { path: '', breadcrumbName: 'Returns' },
    { path: '', breadcrumbName: 'Returns Summary' },
  ];

  // Table Data
  const returnsData = [
    { key: 1, channel: 'Amazon-India', yetToReceive: 0, receivedNotInHand: 113, resolvedClaimed: 542 },
    { key: 2, channel: 'Flipkart', yetToReceive: 33, receivedNotInHand: 51, resolvedClaimed: 3 },
    { key: 3, channel: 'Meesho', yetToReceive: 110, receivedNotInHand: 204, resolvedClaimed: 64 },
  ];

  const columns = [
    { title: 'Channel', dataIndex: 'channel', key: 'channel' },
    { title: 'Yet to Receive', dataIndex: 'yetToReceive', key: 'yetToReceive', align: 'center' },
    { title: 'Received not In Hand', dataIndex: 'receivedNotInHand', key: 'receivedNotInHand', align: 'center' },
    { title: 'Resolved/Claimed', dataIndex: 'resolvedClaimed', key: 'resolvedClaimed', align: 'center' },
  ];

  // Charts Data
  const yetToReceiveChartData = [
    { date: 'Jan-25', Flipkart: 1, Meesho: 5, 'Amazon-India': 0 },
    { date: 'Feb-25', Flipkart: 1, Meesho: 5, 'Amazon-India': 0 },
    { date: 'Mar-25', Flipkart: 3, Meesho: 4, 'Amazon-India': 1 },
    { date: 'Apr-25', Flipkart: 2, Meesho: 5, 'Amazon-India': 0 },
    { date: 'May-25', Flipkart: 2, Meesho: 15, 'Amazon-India': 2 },
    { date: 'Jun-25', Flipkart: 2, Meesho: 40, 'Amazon-India': 8 },
    { date: 'Jul-25', Flipkart: 1, Meesho: 50, 'Amazon-India': 2 },
    { date: 'Aug-25', Flipkart: 2, Meesho: 20, 'Amazon-India': 4 },
    { date: 'Sep-25', Flipkart: 2, Meesho: 18, 'Amazon-India': 4 },
    { date: 'Oct-25', Flipkart: 1, Meesho: 12, 'Amazon-India': 2 },
    { date: 'Nov-25', Flipkart: 5, Meesho: 12, 'Amazon-India': 3 },
    { date: 'Dec-25', Flipkart: 20, Meesho: 25, 'Amazon-India': 5 },
    { date: 'Jan-26', Flipkart: 20, Meesho: 50, 'Amazon-India': 10 },
  ];

  const receivedNotInHandChartData = [
    { date: 'Jan-25', 'Amazon-India': 3, Meesho: 8, Flipkart: 4 },
    { date: 'Feb-25', 'Amazon-India': 3, Meesho: 8, Flipkart: 4 },
    { date: 'Mar-25', 'Amazon-India': 2, Meesho: 5, Flipkart: 12 },
    { date: 'Apr-25', 'Amazon-India': 1, Meesho: 7, Flipkart: 3 },
    { date: 'May-25', 'Amazon-India': 3, Meesho: 12, Flipkart: 4 },
    { date: 'Jun-25', 'Amazon-India': 8, Meesho: 45, Flipkart: 7 },
    { date: 'Jul-25', 'Amazon-India': 2, Meesho: 50, Flipkart: 5 },
    { date: 'Aug-25', 'Amazon-India': 3, Meesho: 18, Flipkart: 2 },
    { date: 'Sep-25', 'Amazon-India': 3, Meesho: 15, Flipkart: 5 },
    { date: 'Oct-25', 'Amazon-India': 2, Meesho: 12, Flipkart: 4 },
    { date: 'Nov-25', 'Amazon-India': 3, Meesho: 15, Flipkart: 7 },
    { date: 'Dec-25', 'Amazon-India': 5, Meesho: 20, Flipkart: 15 },
    { date: 'Jan-26', 'Amazon-India': 10, Meesho: 22, Flipkart: 30 },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Returns Tracker"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
          {/* Returns Table */}
          <Card title="Returns Data">
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                dataSource={[
                  ...returnsData,
                  {
                    key: 'total',
                    channel: 'Total',
                    yetToReceive: returnsData.reduce((a, b) => a + b.yetToReceive, 0),
                    receivedNotInHand: returnsData.reduce((a, b) => a + b.receivedNotInHand, 0),
                    resolvedClaimed: returnsData.reduce((a, b) => a + b.resolvedClaimed, 0),
                  },
                ]}
                size="small"
                pagination={false}
                scroll={{ x: 'max-content' }} // ✅ horizontal scroll on small screens
              />
            </div>
          </Card>

          {/* Yet to Receive Chart */}
          <Card title="Yet to Receive">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={yetToReceiveChartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="Meesho" stackId="a" fill="#86efac" />
                <Bar dataKey="Flipkart" stackId="a" fill="#fca5a5" />
                <Bar dataKey="Amazon-India" stackId="a" fill="#a5b4fc" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Received not in hand Chart */}
        <Card title="Received but not in hand">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={receivedNotInHandChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="Amazon-India" stackId="a" fill="#fca5a5" />
              <Bar dataKey="Meesho" stackId="a" fill="#86efac" />
              <Bar dataKey="Flipkart" stackId="a" fill="#a5b4fc" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </main>
    </>
  );
}
