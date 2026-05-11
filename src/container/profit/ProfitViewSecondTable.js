import React, { useEffect } from 'react';
import { Table, Card, Modal, Checkbox, Tooltip } from 'antd';
import { RightOutlined, EyeOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfitFilterBar from './component/ProfitFilterBar';
import ProfitModal from './component/ProfitModal';
import amazon from '../../assets/icons/amazon.svg';
// import flipkart from "../../assets/icons/flipkart.png";
import { getSecondDetials, getProfitModalApi } from '../../redux/dashboard/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function ProfitViewSecondTable() {
  const { asin } = useParams();
  const location = useLocation();
  //   const decodedChannel = decodeURIComponent(channel);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dateRange, profitData, loading, channel: globalChannel } = useSelector((state) => state.dashboard);
  const totals = profitData?.totals || {};
  //   const profitType = location.state?.profitType || 'all';
  const channels = location.state?.channels?.length > 0 ? location.state.channels : globalChannel || [];
  const [openSettings, setOpenSettings] = React.useState(false);
  const [detailModal, setDetailModal] = React.useState({
    open: false,
    record: null,
    type: '',
  });
  const [previewImage, setPreviewImage] = React.useState('');
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const channelLogoMap = {
    'Amazon-India': amazon,
    // 'Flipkart-India': flipkart,
  };
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = React.useState({
    channel: '',
    sku: '',
    productId: '',
    parentId: '',
    mkt: '',
    ads: 'with',
    gst: 'with',
    estimate: 'with',
    expenses: 'with',
    accountCharges: 'with',
  });
  //   const getMetricFromFilters = () => {
  //     return {
  //       ads: filters.ads === 'with' ? 'withAds' : 'withoutAds',
  //       gst: filters.gst === 'with' ? 'withGst' : 'withoutGst',
  //       expense: filters.expenses === 'with' ? 'withExpense' : 'withoutExpense',
  //     };
  //   };
  const buildPayload = () => {
    return {
      filters: {
        channel: {
          // IN: [decodedChannel],
          IN: channels,
          // IN: globalChannel,
        },

        parentproductid: {
          IN: [asin],
        },

        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
      },

      pagination: {
        pageNo: pagination.current - 1,
        pageSize: pagination.pageSize,
      },
    };
  };
  useEffect(() => {
    dispatch(getSecondDetials(buildPayload()));
  }, [dispatch]);

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Profit' },
    { path: '', breadcrumbName: 'Profit Details' },
  ];

  const dataSource = React.useMemo(() => {
    const rows =
      profitData?.response?.map((item, index) => ({
        key: index,

        channel: item.channel || '-',
        image: item.image_url,

        view: item.child_sku || 0,
        name: item.name,
        asin: item.asin,
        redirecturl: item.redirecturl,
        grossQty: item.grossqty || 0,
        netQty: Number(item.netqty) || 0,
        returnqty: Number(item.returnqty) || 0,
        returnPercent: item.retpercent || 0,

        netsales: item.netsales || 0,
        tcs: item.tcs || 0,
        mpfees: item.estimatefees || 0,
        // netasp: Number(item.netasp) || 0,
        // net_discount: Number(item.net_discount) || 0,

        stdcost: item.stdcost || 0,
        shipping: item.shippingfees || 0,
        adSpend: item.ads || 0,
        gst: item.gst || 0,

        // grossprofit: Number(sitem.grossprofit) || 0,
        profit: item.profit || 0,
        // profitPercent: Number(item.grossprofitper) || 0,
        profitPercent: Math.round(Number(item.grossprofitper)) || 0,

        grossqty: item.grossqty || 0,
        netasp: item.netasp || 0,
        mrp: item.mrp || 0,
        mrpNetDiscount: item.mrp_net_discount || 0,
        grossSales: item.grosssales || 0,
        // mpfees: item.new_mpfees || 0,
        accountCharges: item.account_charges || 0,
        otherExpenses: item.other_expenses || 0,
        grossProfit: item.grossprofit || 0,
        // settledAmount: item.settled_amount || 0,
        tacos: item.tacos || 0,
        grossProfitPercent: item.grossprofit_percent || 0,
        percentOfSales: item.percent_of_sales || 0,
        drr: item.drr || 0,
        lastOrderDate: item.last_order_date || '',

        // settledamount: Number(item.profit_settled_amount) || 0,
      })) || [];

    // const totalRow = {
    //   key: 'total',
    //   channel: 'Total',

    //   view: Number(totals.view) || 0,
    //   // qty: Number(totals.grossqty) || 0,
    //   netQty: Number(totals.totalqty) || 0,
    //   returnqty: Number(totals.totalreturn) || 0,
    //   returnPercent: Number(totals.totalper) || 0,

    //   netsales: Number(totals.netsales) || 0,
    //   // netasp: 0,
    //   // net_discount: 0,

    //   mpfees: Number(totals.mpfees) || 0,
    //   shipping: Number(totals.shippingfees) || 0,
    //   adSpend: Number(totals.ads) || 0,
    //   gst: Number(totals.gsttopay) || 0,

    //   grossprofit: Number(totals.grossprofit) || 0,
    //   profit: Number(totals.profit) || 0,
    //   profitPercent: Math.round(Number(totals.grossprofitper)) || 0,

    //   // settledamount: 0,
    // };

    return rows;
  }, [profitData]);

  const columns = [
    {
      title: '',
      dataIndex: 'image',
      width: 60,
      fixed: 'left',
      render: (value, record) => {
        if (record.key === 'total') return null;

        return (
          <div className="relative group w-[32px] h-[32px]">
            {value ? (
              <img src={value} alt="product" className="w-full h-full object-cover rounded" />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded" />
            )}

            {value && (
              <button
                type="button"
                onClick={() => {
                  setPreviewImage(value);
                  setPreviewOpen(true);
                }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded transition"
              >
                <EyeOutlined style={{ color: '#fff', fontSize: 16 }} />
              </button>
            )}
          </div>
        );
      },
    },
    {
      title: '',
      dataIndex: 'channel',
      width: 70,
      fixed: 'left',
      render: (value) => {
        const logo = channelLogoMap[value];

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {logo && <img src={logo} alt={value} style={{ width: 24, height: 24, objectFit: 'contain' }} />}
            {/* <span>{value}</span> */}
          </div>
        );
      },
    },
    {
      title: 'View',
      dataIndex: 'view',
      align: 'center',
      sorter: (a, b) => a.view.localeCompare(b.view),
      render: (v, record) => {
        if (!record.redirecturl) return <span>{v}</span>;

        return (
          <Tooltip
            title={
              <div>
                <div className="font-semibold">{v}</div>

                <div>{record.name}</div>
              </div>
            }
            color="black"
            overlayInnerStyle={{ color: '#fff' }}
          >
            <button
              type="button"
              onClick={() => window.open(record.redirecturl, '_blank')}
              className="text-blue-500 hover:text-blue-600 underline font-medium bg-transparent border-none p-0 cursor-pointer"
            >
              {v?.length > 15 ? `${v.slice(0, 15)}...` : v}
            </button>
          </Tooltip>
        );
      },
    },
    // {
    //   title: 'Qty',
    //   dataIndex: 'qty',
    //   align: 'center',
    //   sorter: (a, b) => a.qty - b.qty,
    // },
    {
      title: 'Gross Qty',
      dataIndex: 'grossQty',
      align: 'center',
      sorter: (a, b) => a.grossqty - b.grossqty,
      // render: (v) => v ?? 0,
    },
    {
      title: 'Net Qty',
      dataIndex: 'netQty',
      align: 'center',
      sorter: (a, b) => a.netQty - b.netQty,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnqty',
      align: 'center',
      sorter: (a, b) => a.returnqty - b.returnqty,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'returns', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'Return %',
      dataIndex: 'returnPercent',
      align: 'center',
      sorter: (a, b) => a.returnPercent - b.returnPercent,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'returns', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v}%
        </button>
      ),
    },
    {
      title: 'Net Sales',
      dataIndex: 'netsales',
      align: 'center',
      sorter: (a, b) => a.netsales - b.netsales,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'TCS-IGST',
      dataIndex: 'tcs',
      align: 'center',
      sorter: (a, b) => a.tcs - b.tcs,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'ASIN', modalValue: record.asin })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'MP fees',
      dataIndex: 'mpfees',
      align: 'center',
      sorter: (a, b) => a.mpfees - b.mpfees,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
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
      title: 'Std Cost',
      dataIndex: 'stdcost',
      align: 'center',
      sorter: (a, b) => a.stdcost - b.stdcost,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'Shipping',
      dataIndex: 'shipping',
      align: 'center',
      sorter: (a, b) => a.shipping - b.shipping,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'Ad Spend',
      dataIndex: 'adSpend',
      align: 'center',
      sorter: (a, b) => a.adSpend - b.adSpend,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'Gst to Pay',
      dataIndex: 'gst',
      align: 'center',
      sorter: (a, b) => a.gst - b.gst,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    // {
    //   title: 'Gross Profit',
    //   dataIndex: 'grossprofit',
    //   align: 'center',
    //   sorter: (a, b) => a.grossprofit - b.grossprofit,
    //   render: (v, record) => (
    //     <button
    //       type="button"
    //       className="cursor-pointer bg-transparent border-none"
    //       onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
    //     >
    //       {v}
    //     </button>
    //   ),
    // },
    {
      title: 'Profit',
      dataIndex: 'profit',
      align: 'center',
      sorter: (a, b) => a.profit - b.profit,
      // render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>₹{v}</span>,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: record.channel, modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'Profit %',
      dataIndex: 'profitPercent',
      align: 'center',
      sorter: (a, b) => a.profitPercent - b.profitPercent,
      render: (v, record) => {
        const value = Math.round(v || 0);

        return (
          <button
            type="button"
            className="cursor-pointer bg-transparent border-none"
            onClick={() =>
              setDetailModal({
                open: true,
                record,
                type: 'qty',
                modalLabel: 'SKU',
                modalValue: record.view,
              })
            }
          >
            <span
              style={{
                color: value < 0 ? 'red' : 'green',
              }}
            >
              {value}%
            </span>
          </button>
        );
      },
    },
    {
      title: 'Net MRP',
      dataIndex: 'netmrp',
      align: 'center',
      sorter: (a, b) => a.netmrp - b.netmrp,
      // render: (v) => v ?? 0,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Gross Sales',
      dataIndex: 'grossSales',
      align: 'center',
      sorter: (a, b) => a.grossSales - b.grossSales,
      // render: (v) => v ?? 0,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'MRP Net Discount%',
      dataIndex: 'mrpNetDiscount',
      align: 'center',
      sorter: (a, b) => a.mrpNetDiscount - b.mrpNetDiscount,
      // render: (v) => v ?? 0,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'MRP Customer Discount%',
      dataIndex: 'mrpCustomerDiscount',
      align: 'center',
      sorter: (a, b) => a.mrpCustomerDiscount - b.mrpCustomerDiscount,
      // render: (v) => v ?? 0,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Account Charges',
      dataIndex: 'accountCharges',
      align: 'center',
      sorter: (a, b) => a.accountCharges - b.accountCharges,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Other Expenses',
      dataIndex: 'otherExpenses',
      align: 'center',
      sorter: (a, b) => a.otherExpenses - b.otherExpenses,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'TACOS',
      dataIndex: 'tacos',
      align: 'center',
      sorter: (a, b) => a.tacos - b.tacos,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Gross Profit %',
      dataIndex: 'grossProfitPercent',
      align: 'center',
      sorter: (a, b) => a.grossProfitPercent - b.grossProfitPercent,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: '% of Sales',
      dataIndex: 'percentOfSales',
      align: 'center',
      sorter: (a, b) => a.percentOfSales - b.percentOfSales,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'DRR',
      dataIndex: 'drr',
      align: 'center',
      sorter: (a, b) => a.drr - b.drr,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Last Order Date',
      dataIndex: 'lastOrderDate',
      align: 'center',
      sorter: (a, b) => a.lastOrderDate - b.lastOrderDate,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'SKU', modalValue: record.view })
          }
        >
          {v ?? '-'}
        </button>
      ),
    },

    // {
    //   title: 'Settled amount',
    //   dataIndex: 'settledamount',
    //   align: 'center',
    //   sorter: (a, b) => a.settledamount - b.settledamount,
    // },
    {
      title: (
        <button
          type="button"
          onClick={() => setOpenSettings(true)}
          className="flex justify-center items-center w-full cursor-pointer text-black"
        >
          <SettingOutlined />
        </button>
      ),
      key: 'action',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => navigate(`../third/${record.asin}`)}
            style={{
              border: '1px solid #d9d9d9',
              background: 'rgb(202, 221, 254)',
            }}
            className="w-[30px]  h-[30px] rounded-[4px] cursor-pointer flex-items-center justify-center mx-auto"
          >
            <RightOutlined style={{ fontSize: 12 }} />
          </button>
          <button
            type="button"
            // onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
            onClick={() => {
              const payload = {
                filters: {
                  channel: { IN: globalChannel },
                  fromDate: dateRange?.fromDate || null,
                  toDate: dateRange?.endDate || null,
                },
                metric: {
                  expense: 'withExpense',
                  ads: 'withAds',
                  account_charges: 'withAccountCharges',
                  gst: 'withGst',
                  payment: 'withEstimate',
                  summarymetric: 'channel',
                },
                pagination: {
                  pageNo: 0,
                  pageSize: 25,
                },
                expand: 'channel',
                expandValue: 'Amazon-India',
                tab_name: 'summary',
              };
              dispatch(getProfitModalApi(payload));

              setDetailModal({
                open: true,
                record,
                type: 'qty',
                modalLabel: 'SKU',
                modalValue: record.view,
              });
            }}
            style={{
              border: '1px solid #ffc0cb',
              background: '#ffe4e9',
            }}
            className="w-[30px] h-[30px] rounded-[4px] cursor-pointer flex-items-center justify-center mx-auto"
          >
            <BarChartOutlined style={{ fontSize: 14, color: '#ff4d6d' }} />
          </button>
        </div>
      ),
    },
  ];
  const handleApply = () => {
    dispatch(getSecondDetials(buildPayload()));
    setShowFilters(false);
  };

  const handleClear = () => {
    setFilters({
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
  };

  const allColumnsList = [
    { key: 'grossQty', label: 'Gross Qty' },
    { key: 'netQty', label: 'Net Qty' },
    { key: 'returnqty', label: 'Return Qty' },
    { key: 'returnPercent', label: 'Return %' },

    { key: 'netMRP', label: 'Net MRP' },
    { key: 'mrpNetDiscount', label: 'MRP Net Discount%' },
    { key: 'mrpCustomerDiscount', label: 'MRP Customer Discount%' },

    { key: 'grossSales', label: 'Gross Sales' },
    { key: 'netsales', label: 'Net Sales' },
    { key: 'tcs', label: 'TCS-IGST' },

    { key: 'mpfees', label: 'mpfees' },
    { key: 'stdcost', label: 'Std Cost' },

    { key: 'shipping', label: 'Shipping' },
    { key: 'adSpend', label: 'Ad spend' },
    { key: 'stdCost', label: 'Std Cost' },

    { key: 'stdCostMS', label: 'Std Cost M/S %' },
    { key: 'accountCharges', label: 'Account Charges' },
    { key: 'otherExpenses', label: 'Other Expenses' },

    { key: 'gst', label: 'Gst to Pay' },
    // { key: 'grossprofit', label: 'Gross Profit' },
    { key: 'profit', label: 'Profit' },

    // { key: 'settledAmount', label: 'Settled Amount' },
    { key: 'tacos', label: 'TACOS' },
    { key: 'grossProfitPercent', label: 'Gross Profit %' },

    { key: 'profitPercent', label: 'Profit %' },
    { key: 'percentOfSales', label: '% of Sales' },
    { key: 'drr', label: 'DRR (Daily Run Rate)' },

    { key: 'lastOrderDate', label: 'Last Order Date' },
  ];
  const [visibleColumns, setVisibleColumns] = React.useState([
    'view',
    // 'grossQty',
    'netQty',
    'returnqty',
    'returnPercent',
    'tcs',
    'mpfees',
    'netsales',
    'stdcost',
    'shipping',
    'adSpend',
    'gst',
    // 'grossprofit',
    'profit',
    'profitPercent',
  ]);
  const handleSelectAll = (checked) => {
    if (checked) {
      setVisibleColumns(allColumnsList.map((col) => col.key));
    } else {
      setVisibleColumns([]);
    }
  };
  const filteredColumns = columns.filter((col) => {
    if (col.dataIndex === 'image' || col.dataIndex === 'channel' || col.key === 'action') return true;

    return visibleColumns.some(
      (key) =>
        key === col.dataIndex || // direct match
        key.toLowerCase() === col.dataIndex.toLowerCase(), // handle grossQty vs grossqty
    );
  });
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        // title="Profit Details"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 bg-transparent"
      />

      <main className="min-h-[600px] px-8 pb-[30px]">
        <Card bordered={false}>
          <ProfitFilterBar
            filters={filters}
            setFilters={setFilters}
            handleApply={handleApply}
            handleClear={handleClear}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
          <Table
            columns={filteredColumns}
            dataSource={dataSource}
            showSorterTooltip={false}
            loading={loading}
            locale={{ emptyText: 'No Data Found' }}
            pagination={{
              // ...pagination,
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: profitData?.pagination?.count || 0,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={(pag) => {
              setPagination(pag);
            }}
            size="small"
            scroll={{ x: 'max-content' }}
            summary={() => (
              <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
                <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                <Table.Summary.Cell index={1} fixed="left" />
                <Table.Summary.Cell index={2} fixed="left" />

                {filteredColumns
                  .filter((col) => !['image', 'channel', 'view'].includes(col.dataIndex))
                  .map((col, index) => {
                    const keyMap = {
                      netQty: 'netqty',
                      returnqty: 'totalreturn',
                      returnPercent: 'totalreturnper',
                      netsales: 'netsales',
                      tcs: 'tcs',
                      mpfees: 'estimatefees',
                      stdcost: 'stdcost',
                      shipping: 'shippingfees',
                      adSpend: 'ads',
                      gst: 'totalgst',
                      // grossprofit: 'grossprofit',
                      profit: 'profit',
                      profitPercent: 'grossprofitper',

                      grossQty: 'grossqty',
                      netmrp: 'netmrp',
                      mrpNetDiscount: 'mrp_net_discount',
                      mrpCustomerDiscount: 'mrpCustomerDiscount',
                      accountCharges: 'account_charges',
                      otherExpenses: 'other_expenses',
                      tacos: 'tacos',
                      grossProfitPercent: 'grossprofit_percent',
                      percentOfSales: 'percent_of_sales',
                      drr: 'drr',
                      lastOrderDate: 'lastOrderDate',
                    };

                    const value = totals[keyMap[col.dataIndex]];

                    return (
                      <Table.Summary.Cell key={col.key || index} index={index + 3} fixed={col.fixed} align="center">
                        {col.key === 'action' ? (
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setDetailModal({
                                  open: true,
                                  record: totals,
                                  type: 'qty',
                                  modalLabel: 'SKU',
                                  modalValue: 'Total',
                                })
                              }
                              className="w-[30px] h-[30px] border border-[#ffc0cb] rounded-[4px] bg-[#ffe4e9] flex items-center justify-center"
                            >
                              <BarChartOutlined style={{ fontSize: 14, color: '#ff4d6d' }} />
                            </button>
                          </div>
                        ) : ['profitPercent'].includes(col.dataIndex) ? (
                          <span
                            style={{
                              color: (value ?? 0) >= 0 ? 'green' : 'red',
                              fontWeight: 600,
                            }}
                          >
                            {col.dataIndex === 'profitPercent' ? `${value ?? 0}%` : value ?? 0}
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="cursor-pointer bg-transparent border-none"
                            onClick={() =>
                              setDetailModal({
                                open: true,
                                record: totals,
                                type: 'qty',
                                modalLabel: ' SKU',
                                modalValue: 'Total',
                              })
                            }
                          >
                            {value ?? 0}
                          </button>
                        )}
                      </Table.Summary.Cell>
                    );
                  })}
              </Table.Summary.Row>
            )}
          />
        </Card>
        <Modal
          title="Customize Your Columns"
          open={openSettings}
          onCancel={() => setOpenSettings(false)}
          footer={null}
          width={900}
        >
          {/* Select All */}
          <div className="mb-3 flex items-center gap-2">
            <Checkbox
              checked={visibleColumns.length === allColumnsList.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
            >
              Select All
            </Checkbox>
          </div>

          <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {allColumnsList.map((col) => (
              <div
                key={col.key}
                className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded whitespace-nowrap"
              >
                <Checkbox
                  className="whitespace-nowrap"
                  checked={visibleColumns.includes(col.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setVisibleColumns([...visibleColumns, col.key]);
                    } else {
                      setVisibleColumns(visibleColumns.filter((c) => c !== col.key));
                    }
                  }}
                >
                  {col.label}
                </Checkbox>

                {/* info icon */}
                {/* <span className="text-blue-500 text-xs cursor-pointer">i</span> */}
              </div>
            ))}
          </div>
        </Modal>
      </main>
      <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)} centered>
        <img src={previewImage} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
      </Modal>
      <ProfitModal
        open={detailModal.open}
        record={detailModal.record}
        type={detailModal.type}
        modalLabel={detailModal.modalLabel}
        modalValue={detailModal.modalValue}
        onClose={() => setDetailModal({ open: false, record: null, type: '' })}
      />
    </>
  );
}
