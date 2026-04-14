import React, { useEffect } from 'react';
import { Table, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getProfitData } from '../../redux/dashboard/actionCreator';

export default function ProfitTableView() {
  const dispatch = useDispatch();
  const { loading, profitData, dateRange, search } = useSelector((state) => state.dashboard);
  const totals = profitData?.totals || {};
  const payload = {
    filters: {
      channel: { IN: ['Amazon-India'] },
      fromDate: dateRange?.fromDate || null,
      toDate: dateRange?.endDate || null,
      search,
    },
    // metric: {
    //   expense: 'withExpense',
    //   ads: 'withAds',
    //   account_charges: 'withAccountCharges',
    //   gst: 'withGst',
    //   payment: 'withEstimate',
    //   summarymetric: 'channel',
    // },
    pagination: {
      pageNo: 0,
      pageSize: 25,
    },
  };

  useEffect(() => {
    dispatch(getProfitData(payload));
  }, [dispatch, dateRange]);

  // console.log(data);
  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Profit',
    },
    {
      path: '',
      breadcrumbName: 'Profit Table View',
    },
  ];

  const tableData =
    profitData?.response?.map((item, index) => ({
      key: index,
      channel: item.channel1,
      view: item.grosssales,
      qty: item.grossqty,
      netQty: item.netqty,
      net_discount: item.net_discount,
      returnPercent: item.retpercent,
      netsales: item.netsales,
      netasp: item.netasp,
      mpfees: item.mpfees,
      shipping: item.shippingfees,
      adSpend: item.ads,
      gst: item.gsttopay,
      profit: item.profit,
      grossprofit: item.grossprofit,
      profitPercent: item.profitmargin,
      returnqty: item.returnqty,
      settledamount: item.profit_settled_amount,
    })) || [];

  const columns = [
    {
      title: '',
      dataIndex: 'channel',
      width: 150,
      fixed: 'left',
      render: (value) => <span>{value}</span>,
    },
    {
      title: 'View',
      dataIndex: 'view',
      align: 'center',
      sorter: (a, b) => a.view - b.view,
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      align: 'center',
      sorter: (a, b) => a.qty - b.qty,
    },
    {
      title: 'Net Qty',
      dataIndex: 'netQty',
      align: 'center',
      sorter: (a, b) => a.netQty - b.netQty,
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnqty',
      align: 'center',
      sorter: (a, b) => a.returnqty - b.returnqty,
    },
    {
      title: 'Return %',
      dataIndex: 'returnPercent',
      align: 'center',
      sorter: (a, b) => a.returnPercent - b.returnPercent,
    },
    {
      title: 'Net Sales',
      dataIndex: 'netsales',
      align: 'center',
      sorter: (a, b) => a.netsales - b.netsales,
    },
    {
      title: 'Net asp',
      dataIndex: 'netasp',
      align: 'center',
      sorter: (a, b) => a.netasp - b.netasp,
    },
    {
      title: 'Net discount',
      dataIndex: 'net_discount',
      align: 'center',
      sorter: (a, b) => a.net_discount - b.net_discount,
    },
    {
      title: 'MP fees',
      dataIndex: 'mpfees',
      align: 'center',
      sorter: (a, b) => a.mpfees - b.mpfees,
    },
    {
      title: 'Shipping',
      dataIndex: 'shipping',
      align: 'center',
      sorter: (a, b) => a.shipping - b.shipping,
    },
    {
      title: 'Ad Spend',
      dataIndex: 'adSpend',
      align: 'center',
      sorter: (a, b) => a.adSpend - b.adSpend,
    },
    {
      title: 'GST',
      dataIndex: 'gst',
      align: 'center',
      sorter: (a, b) => a.gst - b.gst,
    },
    {
      title: 'Gross Profit',
      dataIndex: 'grossprofit',
      align: 'center',
      sorter: (a, b) => a.grossprofit - b.grossprofit,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      align: 'center',
      sorter: (a, b) => a.profit - b.profit,
      render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>₹{v}</span>,
    },
    {
      title: 'Profit %',
      dataIndex: 'profitPercent',
      align: 'center',
      sorter: (a, b) => a.profitPercent - b.profitPercent,
    },
    {
      title: 'Settled amount',
      dataIndex: 'settledamount',
      align: 'center',
      sorter: (a, b) => a.profit_settled_amount - b.profit_settled_amount,
    },
  ];
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit Table"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Card bordered={false} className="sales-table-wrapper">
          <Table
            bordered
            columns={columns}
            dataSource={tableData}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
            summary={() => (
              <Table.Summary.Row className="font-semibold bg-gray-50">
                <Table.Summary.Cell index={0} fixed="left">
                  Total
                </Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.grosssales || 0}</Table.Summary.Cell>
                <Table.Summary.Cell align="center">{totals.grossqty || 0}</Table.Summary.Cell>
                <Table.Summary.Cell align="center">{totals.netqty || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">{totals.returnqty || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">{totals.retpercent || 0}%</Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.netsales || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.netasp || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.net_discount || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.mpfees || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.shippingfees || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.ads || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.gsttopay || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.grossprofit || 0}</Table.Summary.Cell>

                <Table.Summary.Cell align="center">
                  <span style={{ color: totals.profit < 0 ? 'red' : 'green' }}>₹{totals.profit || 0}</span>
                </Table.Summary.Cell>

                <Table.Summary.Cell align="center">
                  {totals.profitmargin?.toFixed?.(2) || totals.profitmargin || 0}%
                </Table.Summary.Cell>

                <Table.Summary.Cell align="center">₹{totals.profit_settled_amount || 0}</Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />{' '}
        </Card>
      </main>
    </>
  );
}
