import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getOutstandingPayments } from '../../redux/reconcilePayment/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function OsPayment() {
  const dispatch = useDispatch();
  const { outstandingData, outstandingLoading } = useSelector((state) => state.reconcilePayment);
  const { dateRange } = useSelector((state) => state.dashboard);

  const apiData = outstandingData?.table_response || [];
  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Profit' },
    { path: '', breadcrumbName: 'O/s Payment' },
  ];

  useEffect(() => {
    dispatch(
      getOutstandingPayments({
        filters: {
          fromDate: dateRange?.fromDate || null,
          toDate: dateRange?.toDate || null,
        },
      }),
    );
  }, [dispatch]);
  const totalChannel = apiData.find((item) => item.channel === 'zzzTotal');
  const otherChannels = apiData.filter((item) => item.channel !== 'zzzTotal');

  const tableColumns = [
    {
      title: '',
      dataIndex: 'label',
      fixed: 'left',
      width: 200,
    },

    {
      title: 'Total',
      dataIndex: 'zzzTotal',
      fixed: 'left',
      width: 150,
      align: 'center',
      render: (val) => (val !== null && val !== undefined ? `₹${Number(val).toLocaleString('en-IN')}` : '-'),
    },

    ...otherChannels.map((item) => ({
      title: item.channel,
      dataIndex: item.channel,
      key: item.channel,
      width: 150,
      align: 'center',
      render: (val) => (val !== null && val !== undefined ? `₹${Number(val).toLocaleString('en-IN')}` : '-'),
    })),
  ];
  const paymentTableData = [
    {
      key: '1',
      label: 'Settled Not Paid',
      zzzTotal: totalChannel?.settlednotpaidamount,
      ...Object.fromEntries(otherChannels.map((item) => [item.channel, item.settlednotpaidamount])),
    },
    {
      key: '2',
      label: 'Settled Adjustment',
      zzzTotal: totalChannel?.settledadjamount,
      ...Object.fromEntries(otherChannels.map((item) => [item.channel, item.settledadjamount])),
    },
    {
      key: '3',
      label: 'Unsettled Variance',
      zzzTotal: totalChannel?.unsettledvarianceamount,
      ...Object.fromEntries(otherChannels.map((item) => [item.channel, item.unsettledvarianceamount])),
    },
    {
      key: '4',
      label: 'Cashback Pending',
      zzzTotal: totalChannel?.cashback_pending,
      ...Object.fromEntries(otherChannels.map((item) => [item.channel, item.cashback_pending])),
    },
  ];

  const settledGraphData = outstandingData?.settledadjgraph || [];
  const unsettledGraphData = outstandingData?.unsettled_graph || [];

  const formatGraphData = (data, keyName) => {
    const result = {};

    data.forEach((item) => {
      const key = item.month || item.date;

      if (!result[key]) {
        result[key] = { name: key };
      }

      result[key][item.channel] = item[keyName] || 0;
    });

    return Object.values(result);
  };

  const settledData = formatGraphData(settledGraphData, 'settledadjamount');
  const unsettledData = formatGraphData(unsettledGraphData, 'unsettledvarianceamount');

  const colors = ['#8884d8', '#82ca9d', '#ff7f7f', '#ffc658'];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Outstanding Payments"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Card className="mb-6">
          <Table
            columns={tableColumns}
            dataSource={paymentTableData}
            loading={outstandingLoading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />{' '}
        </Card>{' '}
        <Card className="mb-6">
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '50%' }}>
              <h3>Unsettled Orders - Outstanding Payments</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={unsettledData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {otherChannels.map((item, index) => (
                    <Bar key={item.channel} dataKey={item.channel} fill={colors[index % colors.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ width: '50%' }}>
              <h3>Settled Orders - Outstanding Payments</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={settledData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {otherChannels.map((item, index) => (
                    <Bar key={item.channel} dataKey={item.channel} fill={colors[index % colors.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}
