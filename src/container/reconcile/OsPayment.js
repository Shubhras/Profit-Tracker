import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Table } from 'antd';
import { getOutstandingPayments } from '../../redux/reconcilePayment/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function OsPayment() {
  const dispatch = useDispatch();
  const { outstandingData, outstandingLoading } = useSelector((state) => state.reconcilePayment);
  const apiData = outstandingData?.table_response || [];
  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Profit' },
    { path: '', breadcrumbName: 'O/s Payment' },
  ];

  useEffect(() => {
    dispatch(
      getOutstandingPayments({
        filters: {
          fromDate: '2026-01-01',
          toDate: '2026-01-03',
        },
      }),
    );
  }, [dispatch]);
  const channels = apiData.map((item) => item.channel);

  const tableColumns = [
    { title: '', dataIndex: 'label', fixed: 'left' },

    ...channels.map((ch) => ({
      title: ch === 'zzzTotal' ? 'Total' : ch,
      dataIndex: ch,
      align: 'center',
      render: (val) => (val !== null && val !== undefined ? `₹${Number(val).toLocaleString('en-IN')}` : '-'),
    })),
  ];
  const paymentTableData = [
    {
      key: '1',
      label: 'Settled Not Paid',
      ...Object.fromEntries(apiData.map((item) => [item.channel, item.settlednotpaidamount])),
    },
    {
      key: '2',
      label: 'Settled Adjustment',
      ...Object.fromEntries(apiData.map((item) => [item.channel, item.settledadjamount])),
    },
    {
      key: '3',
      label: 'Unsettled Variance',
      ...Object.fromEntries(apiData.map((item) => [item.channel, item.unsettledvarianceamount])),
    },
  ];

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
      </main>
    </>
  );
}
