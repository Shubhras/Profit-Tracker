import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Table, Empty, Divider } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
// import { globalizeLocalizer } from 'react-big-calendar';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getReconcilePaymentSummary, getBankTransferSummary } from '../../redux/reconcilePayment/actionCreator';

/* ================= DATA OBJECTS ================= */

const leakSummary = [
  { title: 'Shipping Leaks', value: 0 },
  { title: 'Other Leaks', value: 0 },
  { title: 'Total Leaks', value: 0 },
];

const tableColumns = [
  { title: 'Channel', dataIndex: 'channel' },
  { title: 'Fee Type', dataIndex: 'feeType' },
  { title: 'SKU Count', dataIndex: 'skuCount' },
  { title: 'Received Fees', dataIndex: 'receivedFees' },
  { title: 'Calculated Fees', dataIndex: 'calculatedFees' },
  { title: 'Variance', dataIndex: 'variance' },
];

const tableData = []; // No data as per image

/* ================= COMPONENT ================= */

export default function ReconcileSummary() {
  const navigate = useNavigate();
  const [bankWorkflowData, setBankWorkflowData] = useState([]);
  const [cashflowData, setCashflowData] = useState([
    {
      title: 'Unsettled Not Paid',
      orders: 0,
      amount: '',
      bg: 'bg-blue-50',
    },
    {
      title: 'Settled Not Paid',
      orders: 0,
      amount: '',
      bg: 'bg-purple-50',
    },
    {
      title: 'Settled Adjustment',
      orders: 0,
      amount: '',
      bg: 'bg-gray-50',
    },
  ]);

  const PageRoutes = [
    { path: '', breadcrumbName: 'Reconcile' },
    { path: '', breadcrumbName: 'Summary' },
  ];

  const dispatch = useDispatch();
  const { reconcileData, bankTransferData } = useSelector((state) => state.reconcilePayment);
  const { dateRange, channel: globalChannel } = useSelector((state) => state.dashboard);

  useEffect(() => {
    const payload = {
      filters: {
        channel: {
          IN: globalChannel,
        },
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
      },
      // metric: {},
      pagination: {
        pageNo: 0,
        pageSize: 25,
      },
    };
    dispatch(getReconcilePaymentSummary(payload));
  }, [dispatch, dateRange, globalChannel]);

  useEffect(() => {
    if (reconcileData?.data && reconcileData.data.length > 0) {
      const summary = reconcileData.data[0];
      setCashflowData([
        {
          title: 'Unsettled Not Paid',
          orders: summary.unsettledvariancecount || 0,
          amount: summary.unsettledvarianceamount ? Number(summary.unsettledvarianceamount).toFixed(2) : '',
          bg: 'bg-blue-50',
        },
        {
          title: 'Settled Not Paid',
          orders: summary.settledorderscount || 0,
          amount: summary.settledordersamount ? Number(summary.settledordersamount).toFixed(2) : '',
          bg: 'bg-purple-50',
        },
        {
          title: 'Settled Adjustment',
          orders: summary.bankvariancecount || 0,
          amount: summary.bankvarianceamount ? Number(summary.bankvarianceamount).toFixed(2) : '',
          bg: 'bg-gray-50',
        },
      ]);
      console.log('Summary Data:', summary);
    }
  }, [reconcileData]);

  useEffect(() => {
    const payload = {
      filter: {
        channel: {
          IN: globalChannel,
        },
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
      },
    };

    dispatch(getBankTransferSummary(payload));
  }, [dispatch, dateRange, globalChannel]);
  useEffect(() => {
    if (bankTransferData?.data) {
      const d = bankTransferData.data;

      setBankWorkflowData([
        {
          label: 'Remittance Amount',
          value: `₹${Number(d.remittance_amount || 0).toFixed(2)}`,
          highlight: true,
        },
        {
          label: 'Negative Adjustment',
          value: `₹${Number(d.negative_adjustment || 0).toFixed(2)}`,
          negative: d.negative_adjustment < 0,
        },
        {
          label: 'Total',
          value: `₹${Number(d.total || 0).toFixed(2)}`,
          highlight: true,
        },
        {
          label: 'Orders Paid',
          value: `₹${Number(d.orders_paid || 0).toFixed(2)}`,
        },
        {
          label: 'Fees',
          value: `₹${Number(d.fees || 0).toFixed(2)}`,
        },
        {
          label: 'TDS',
          value: `₹${Number(d.tds || 0).toFixed(2)}`,
        },
        {
          label: 'Promotions',
          value: `₹${Number(d.promotions || 0).toFixed(2)}`,
        },
        {
          label: 'Advertisement Cost',
          value: `₹${Number(d.advertisement_cost || 0).toFixed(2)}`,
        },
        {
          label: 'Reserve Adjustment',
          value: `₹${Number(d.reserve_adjustment || 0).toFixed(2)}`,
        },
        {
          label: 'Other Adjustment',
          value: `₹${Number(d.other_adjustment || 0).toFixed(2)}`,
          negative: d.other_adjustment < 0,
        },
      ]);
    }
  }, [bankTransferData]);

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="PAYMENT RECONCILIATION"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        {/* ===== TOP LEAK SUMMARY ===== */}
        <Row gutter={[16, 16]} className="mb-4">
          {leakSummary.map((item) => (
            <Col key={item.title} xs={24} sm={12} lg={8}>
              <Card>
                <p className="text-blue-600 font-semibold">{item.title}</p>
                <h2 className="text-xl font-bold">₹{item.value}</h2>
              </Card>
            </Col>
          ))}
        </Row>

        {/* ===== TABLE ===== */}
        <Card className="mb-6 overflow-x-auto">
          <Table
            columns={tableColumns}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: 800 }}
            locale={{ emptyText: <Empty description="No data" /> }}
            footer={() => (
              <Row justify="space-between">
                <strong>Total</strong>
                <strong>₹0</strong>
              </Row>
            )}
          />
        </Card>

        {/* ===== BOTTOM SECTION ===== */}
        <Row gutter={[16, 16]}>
          {/* VARIANCE */}
          <Col xs={24} lg={6}>
            <Card title="Variance" className="h-full min-h-[250px]" />
          </Col>

          {/* CASHFLOW PLANNING */}
          <Col xs={24} lg={12}>
            <Card title="Cashflow Planning" className="h-full">
              <Row gutter={[16, 16]}>
                {cashflowData.map((item) => (
                  <Col key={item.title} xs={24} sm={12} lg={8}>
                    <Card
                      onClick={() => {
                        if (item.title === 'Unsettled Not Paid') {
                          navigate('/admin/reconcile/b2c-reconciliation/unsettled-order');
                        }

                        if (item.title === 'Settled Not Paid') {
                          navigate('/admin/reconcile/b2c-reconciliation/settled-order');
                        }
                      }}
                      className={`${item.bg} h-full cursor-pointer hover:shadow-md transition`}
                    >
                      <p className="font-semibold">{item.title}</p>
                      <Divider />
                      <p>No. of Orders</p>
                      <h3 className="text-lg font-bold">{item.orders}</h3>
                      <p className="mt-2">Estimated Amount</p>
                      <h3 className="text-lg font-bold">{item.amount}</h3>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          {/* BANK TRANSFER WORKFLOW */}
          <Col xs={24} lg={6}>
            <Card
              className="h-full"
              title={
                <div className="flex items-center justify-between gap-2">
                  <span>Bank Transfer Workflow</span>
                  <DownloadOutlined className="text-blue-600 cursor-pointer" />
                </div>
              }
            >
              {bankWorkflowData.map((item) => (
                <Row key={item.label} justify="space-between" className="py-2 border-b text-sm">
                  <span className="truncate max-w-[70%]">{item.label}</span>
                  <span
                    className={`font-semibold ${item.highlight ? 'text-blue-600' : ''} ${
                      item.negative ? 'text-red-500' : ''
                    }`}
                  >
                    {item.value}
                  </span>
                </Row>
              ))}

              <p className="text-xs text-gray-400 mt-3">* Based on Bank Deposited Date</p>
            </Card>
          </Col>
        </Row>
      </main>
    </>
  );
}
