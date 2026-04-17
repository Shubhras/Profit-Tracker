import React, { useEffect } from 'react';
import { Table, Card } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfitFilterBar from './component/ProfitFilterBar';
import { getProfitDetails } from '../../redux/dashboard/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function ProfitDetailsView() {
  // const { channel } = useParams();
  // const decodedChannel = decodeURIComponent(channel);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dateRange, channel: globalChannel, profitData } = useSelector((state) => state.dashboard);
  const totals = profitData?.totals || {};
  const [filters, setFilters] = React.useState({
    channel: '',
    sku: '',
    productId: '',
    parentId: '',
    mkt: '',
    ads: 'without',
    gst: 'without',
    estimate: 'with',
    expenses: 'with',
    accountCharges: 'with',
  });
  const getMetricFromFilters = () => {
    return {
      ads: filters.ads === 'with' ? 'withAds' : 'withoutAds',
      gst: filters.gst === 'with' ? 'withGst' : 'withoutGst',
      expense: filters.expenses === 'with' ? 'withExpense' : 'withoutExpense',
    };
  };
  const buildPayload = () => {
    return {
      filters: {
        channel: {
          // IN: [decodedChannel],
          IN: globalChannel,
        },
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
      },
      metric: getMetricFromFilters(),
      pagination: {
        pageNo: 0,
        pageSize: 25,
      },
    };
  };
  useEffect(() => {
    if (globalChannel?.length > 0) {
      dispatch(getProfitDetails(buildPayload()));
    }
  }, [dateRange, globalChannel]);

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Profit' },
    { path: '', breadcrumbName: 'Profit Details' },
  ];

  const dataSource = React.useMemo(() => {
    const rows =
      profitData?.response?.map((item, index) => ({
        key: index,

        channel: item.channel || '-',

        view: Number(item.grosssales) || 0,
        // qty: Number(item.grossqty) || 0,
        netQty: Number(item.netqty) || 0,
        returnqty: Number(item.returnqty) || 0,
        returnPercent: Number(item.retpercent) || 0,

        netsales: Number(item.netsales) || 0,
        // netasp: Number(item.netasp) || 0,
        // net_discount: Number(item.net_discount) || 0,

        mpfees: Number(item.mpfees) || 0,
        shipping: Number(item.shippingfees) || 0,
        adSpend: Number(item.ads) || 0,
        gst: Number(item.gsttopay) || 0,

        grossprofit: Number(item.grossprofit) || 0,
        profit: Number(item.profit) || 0,
        profitPercent: Number(item.profitmper) || 0,

        // settledamount: Number(item.profit_settled_amount) || 0,
      })) || [];

    const totalRow = {
      key: 'total',
      channel: 'Total',

      view: Number(totals.view) || 0,
      // qty: Number(totals.grossqty) || 0,
      netQty: Number(totals.totalqty) || 0,
      returnqty: Number(totals.totalreturn) || 0,
      returnPercent: Number(totals.totalper) || 0,

      netsales: Number(totals.netsales) || 0,
      // netasp: 0,
      // net_discount: 0,

      mpfees: Number(totals.mpfees) || 0,
      shipping: Number(totals.shippingfees) || 0,
      adSpend: Number(totals.ads) || 0,
      gst: Number(totals.gsttopay) || 0,

      grossprofit: Number(totals.grossprofit) || 0,
      profit: Number(totals.profit) || 0,
      profitPercent: Number(totals.profitper) || 0,

      // settledamount: 0,
    };

    return [...rows, totalRow];
  }, [profitData]);

  const columns = [
    {
      title: '',
      dataIndex: 'channel',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'View',
      dataIndex: 'view',
      align: 'center',
      sorter: (a, b) => a.view - b.view,
    },
    // {
    //   title: 'Qty',
    //   dataIndex: 'qty',
    //   align: 'center',
    //   sorter: (a, b) => a.qty - b.qty,
    // },
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
    // {
    //   title: 'Net asp',
    //   dataIndex: 'netasp',
    //   align: 'center',
    //   sorter: (a, b) => a.netasp - b.netasp,
    // },
    // {
    //   title: 'Net discount',
    //   dataIndex: 'net_discount',
    //   align: 'center',
    //   sorter: (a, b) => a.net_discount - b.net_discount,
    // },
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
    // {
    //   title: 'Settled amount',
    //   dataIndex: 'settledamount',
    //   align: 'center',
    //   sorter: (a, b) => a.settledamount - b.settledamount,
    // },
    {
      title: '',
      key: 'action',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <button
          type="button"
          onClick={() => navigate(`../profitThirdtable/${record.key}`)}
          style={{
            width: 30,
            height: 30,
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            background: 'rgb(202, 221, 254)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto',
          }}
        >
          <RightOutlined style={{ fontSize: 12 }} />
        </button>
      ),
    },
  ];
  const handleApply = () => {
    dispatch(getProfitDetails(buildPayload()));
  };

  const handleClear = () => {
    setFilters({
      channel: '',
      sku: '',
      productId: '',
      parentId: '',
      mkt: '',
      ads: '',
      gst: '',
      estimate: '',
      expenses: '',
      accountCharges: '',
    });
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit Details"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 bg-transparent"
      />

      <main className="min-h-[600px] px-8 pb-[30px]">
        <Card bordered={false}>
          <ProfitFilterBar
            filters={filters}
            setFilters={setFilters}
            handleApply={handleApply}
            handleClear={handleClear}
          />
          <Table
            columns={columns}
            dataSource={dataSource}
            showSorterTooltip={false}
            locale={{ emptyText: 'No Data Found' }}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Card>
      </main>
    </>
  );
}
