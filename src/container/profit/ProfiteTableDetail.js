import React, { useEffect } from 'react';
import { Table, Card, Modal, Checkbox, Tooltip } from 'antd';
import { RightOutlined, SearchOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import ProfitFilterBar from './component/ProfitFilterBar';
// import ProfitModal from './component/ProfitModal'
import CalculationModal from './component/Calculations';
import amazon from '../../assets/icons/amazon.svg';
// import flipkart from "../../assets/icons/flipkart.png";
import { getProfitDetails } from '../../redux/dashboard/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function ProfitDetailsView() {
  const { channel } = useParams();
  const location = useLocation();
  const decodedChannel = decodeURIComponent(channel);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dateRange, profitData, loading, channel: globalChannel } = useSelector((state) => state.dashboard);
  const totals = profitData?.totals || {};
  const profitType = location.state?.profitType || 'all';
  const channels = location.state?.channels?.length > 0 ? location.state.channels : globalChannel || [];
  // const [openSettings, setOpenSettings] = React.useState(false);
  // const [detailModal, setDetailModal] = React.useState({
  //   open: false,
  //   record: null,
  //   type: '',
  // });

  const [calculationModal, setCalculationModal] = React.useState({
    open: false,
    type: '',
    record: null,
  });

  const [previewImage, setPreviewImage] = React.useState('');
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  // const [columnSearch, setColumnSearch] = React.useState('');

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
          IN: channels,
          // IN: globalChannel,
        },
        ...(profitType === 'profitable' && {
          profit: { GT: 0 },
        }),

        ...(profitType === 'losing' && {
          Profit: { LT: 0 },
        }),

        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
      },
      metric: getMetricFromFilters(),
      pagination: {
        pageNo: 0,
        pageSize: 1000,
      },
    };
  };
  useEffect(() => {
    if (decodedChannel) {
      dispatch(getProfitDetails(buildPayload()));
    }
  }, [dateRange, decodedChannel]);

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

        view: item.asin || 0,
        name: item.name,
        asin: item.asin,
        redirecturl: item.redirecturl,
        netQty: item.netqty || 0,
        returnqty: item.returnqty || 0,
        settleAmount: item.exp_settlement,
        returnPercent: item.retpercent || 0,

        netsales: item.netsales || 0,
        tcs: item.tcs || 0,
        mp_gst: item.mp_gst,
        mpfees: item.estimatefees || 0,
        taxableValue: item.taxable_value || 0,
        // netasp: Number(item.netasp) || 0,
        // net_discount: Number(item.net_discount) || 0,

        stdcost: item.stdcost || 0,
        shipping: item.shippingfees || 0,
        adSpend: item.ads || 0,
        gst_to_pay_amount: item.gst_to_pay_amount || 0,
        gst_to_pay_perc: item.gst_to_pay_perc || 0,
        referral_fee: item.referral_fee || 0,
        closing_fee: item.closing_fee || 0,
        per_item_fee: item.per_item_fee || 0,
        fba_fee: item.fba_fee || 0,
        fba_pick_pack_fee: item.fba_pick_pack_fee || 0,
        fba_weight_handling_fee: item.fba_weight_handling_fee || 0,
        tax_amount: item.tax_amount || 0,
        other_charges: item.other_charges || 0,

        // grossprofit: Number(sitem.grossprofit) || 0,
        profit: item.profit || 0,
        // profitPercent: Number(item.grossprofitper) || 0,
        profitPercent: Math.round(Number(item.grossprofitper)) || 0,

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
        // if (record.key === 'total') {
        //   return <span>Total</span>;
        // }

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
          <Tooltip title={record.name} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <button
              type="button"
              onClick={() => window.open(record.redirecturl, '_blank')}
              className="text-blue-500 hover:text-blue-600 underline font-medium bg-transparent border-none p-0 cursor-pointer"
            >
              {v}
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
    // {
    //   title: 'Gross Qty',
    //   dataIndex: 'grossQty',
    //   align: 'center',
    //   sorter: (a, b) => a.grossqty - b.grossqty,
    //   // render: (v) => v ?? 0,
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
      render: (v) => <span>{v}%</span>,
    },
    {
      title: 'Net Sales',
      dataIndex: 'netsales',
      align: 'center',
      sorter: (a, b) => a.netsales - b.netsales,
    },
    // {
    //   title: 'TCS-IGST',
    //   dataIndex: 'tcs',
    //   align: 'center',
    //   sorter: (a, b) => a.tcs - b.tcs,
    //   render: (v, record) => (
    //     <button
    //       type="button"
    //       className="cursor-pointer bg-transparent border-none"
    //       onClick={() =>
    //         setDetailModal({ open: true, record, type: 'qty', modalLabel: 'ASIN', modalValue: record.asin })
    //       }
    //     >
    //       {v}
    //     </button>
    //   ),
    // },
    {
      title: 'MP fees',
      dataIndex: 'mpfees',
      align: 'center',
      sorter: (a, b) => a.mpfees - b.mpfees,
      render: (v, record) => (
        <button
          type="button"
          onClick={() =>
            setCalculationModal({
              open: true,
              type: 'mpfees',
              record,
            })
          }
          className="text-[#2563eb] font-medium underline cursor-pointer bg-transparent border-none"
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
          onClick={() =>
            setCalculationModal({
              open: true,
              type: 'shipping',
              record,
            })
          }
          className="text-[#2563eb] font-medium underline cursor-pointer bg-transparent border-none"
        >
          {v}
        </button>
      ),
    },
    {
      title: 'MP-GST',
      dataIndex: 'mp_gst',
      align: 'center',
      sorter: (a, b) => a.mp_gst - b.mp_gst,
    },

    {
      title: 'TCS',
      dataIndex: 'tcs',
      align: 'center',
      sorter: (a, b) => a.tcs - b.tcs,
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
      title: 'Ad Spend',
      dataIndex: 'adSpend',
      align: 'center',
      sorter: (a, b) => a.adSpend - b.adSpend,
    },

    {
      title: 'Taxable Value',
      dataIndex: 'taxableValue',
      align: 'center',
      sorter: (a, b) => a.taxableValue - b.taxableValue,
    },

    {
      title: 'GST to Pay',
      dataIndex: 'gst_to_pay_amount',
      align: 'center',
      sorter: (a, b) => a.gst_to_pay_amount - b.gst_to_pay_amount,
    },
    {
      title: 'GST to Pay %',
      dataIndex: 'gst_to_pay_perc',
      align: 'center',
      sorter: (a, b) => a.gst_to_pay_perc - b.gst_to_pay_perc,
      render: (v) => <span>{v}%</span>,
    },
    {
      title: 'Expected Settlement',
      dataIndex: 'settleAmount',
      align: 'center',
      sorter: (a, b) => a.settleAmount - b.settleAmount,
    },
    {
      title: 'Product Cost',
      dataIndex: 'stdcost',
      align: 'center',
      sorter: (a, b) => a.stdcost - b.stdcost,
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
          onClick={() =>
            setCalculationModal({
              open: true,
              type: 'profit',
              record,
            })
          }
          // className={`font-medium underline cursor-pointer bg-transparent border-none ${
          //   String(v).includes('-') ? 'text-red-500' : 'text-green-600'
          // }`}
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
      render: (v) => {
        const value = Math.round(v || 0);

        return (
          <button type="button" className="cursor-pointer bg-transparent border-none">
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

    // {
    //   title: 'Settled amount',
    //   dataIndex: 'settledamount',
    //   align: 'center',
    //   sorter: (a, b) => a.settledamount - b.settledamount,
    // },
    {
      key: 'action',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => navigate(`../second/${record.asin}`)}
            className="w-[34px] h-[34px] rounded-full border border-[#dbe1e8]
  flex items-center justify-center cursor-pointer hover:text-black transition-all duration-200 mx-auto"
          >
            <RightOutlined style={{ fontSize: 12 }} />
          </button>
          {/* <button
            type="button"
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
                modalLabel: 'ASIN',
                modalValue: record.asin,
              });
            }}
            style={{
              border: '1px solid #ffc0cb',
              background: '#ffe4e9',
            }}
            className="w-[30px] h-[30px] rounded-[4px] cursor-pointer flex-items-center justify-center mx-auto"
          >
            <BarChartOutlined style={{ fontSize: 14, color: '#ff4d6d' }} />
          </button> */}
        </div>
      ),
    },
  ];
  const handleApply = () => {
    dispatch(getProfitDetails(buildPayload()));
    setShowFilters(false);
  };

  // const handleClear = () => {
  //   setFilters({
  //     channel: '',
  //     sku: '',
  //     productId: '',
  //     parentId: '',
  //     mkt: '',

  //     ads: 'without',
  //     gst: 'without',
  //     estimate: 'with',
  //     expenses: 'with',
  //     accountCharges: 'with',
  //   });
  // };

  // const allColumnsList = [
  //   { key: 'grossQty', label: 'Gross Qty' },
  //   { key: 'netQty', label: 'Net Qty' },
  //   { key: 'returnqty', label: 'Return Qty' },
  //   { key: 'returnPercent', label: 'Return %' },

  //   { key: 'netMRP', label: 'Net MRP' },
  //   { key: 'mrpNetDiscount', label: 'MRP Net Discount%' },
  //   { key: 'mrpCustomerDiscount', label: 'MRP Customer Discount%' },

  //   { key: 'grossSales', label: 'Gross Sales' },
  //   { key: 'netsales', label: 'Net Sales' },
  //   { key: 'tcs', label: 'tcs' },
  //   { key: 'mpfees', label: 'mpfees' },
  //   // { key: 'stdcost', label: 'Std Cost' },

  //   { key: 'shipping', label: 'Shipping' },
  //   { key: 'adSpend', label: 'Ad spend' },
  //   { key: 'stdCost', label: 'Product Cost' },

  //   { key: 'stdCostMS', label: 'Std Cost M/S %' },
  //   { key: 'accountCharges', label: 'Account Charges' },
  //   { key: 'otherExpenses', label: 'Other Expenses' },

  //   { key: 'gst', label: 'GST to Pay' },
  //   // { key: 'grossprofit', label: 'Gross Profit' },
  //   { key: 'profit', label: 'Profit' },

  //   { key: 'settledAmount', label: 'Settled Amount' },
  //   { key: 'tacos', label: 'TACOS' },
  //   { key: 'grossProfitPercent', label: 'Gross Profit %' },

  //   { key: 'profitPercent', label: 'Profit %' },
  //   { key: 'percentOfSales', label: '% of Sales' },
  //   { key: 'drr', label: 'DRR (Daily Run Rate)' },

  //   { key: 'lastOrderDate', label: 'Last Order Date' },
  // ];
  // const [visibleColumns, setVisibleColumns] = React.useState([
  //   'view',
  //   'netQty',
  //   'returnqty',
  //   'returnPercent',
  //   'mpfees',
  //   'netsales',
  //   'mp_gst',
  //   'tcs',
  //   'stdcost',
  //   'shipping',
  //   'adSpend',
  //   'gst',
  //   'profit',
  //   'profitPercent',
  // ]);
  // const handleSelectAll = (checked) => {
  //   if (checked) {
  //     setVisibleColumns(allColumnsList.map((col) => col.key));
  //   } else {
  //     setVisibleColumns([]);
  //   }
  // };

  // const filteredColumns = columns.filter((col) => {
  //   if (col.dataIndex === 'image' || col.dataIndex === 'channel' || col.key === 'action') return true;

  //   return visibleColumns.some(
  //     (key) =>
  //       key === col.dataIndex ||
  //       key.toLowerCase() === col.dataIndex.toLowerCase(),
  //   );
  // });
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        // title="Profit Details"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 bg-transparent"
      />

      <main className="min-h-[600px] px-8 pb-[30px]">
        <Card bordered={false}>
          {/* <ProfitFilterBar
            filters={filters}
            setFilters={setFilters}
            handleApply={handleApply}
            handleClear={handleClear}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          /> */}

          <div className="flex items-center justify-between gap-3 mb-5">
            {/* Search */}
            <div className="relative w-[220px]">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-[42px] rounded-xl border border-[#e5e7eb] bg-white pl-4 pr-10 text-[13px] outline-none shadow-sm"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                <SearchOutlined style={{ fontSize: 14 }} />
              </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Filter Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className=" h-[42px] px-4 rounded-xl border border-[#e5e7eb] bg-white flex items-center gap-2 text-[13px] font-medium shadow-sm"
                >
                  <span className="flex items-center">
                    <FilterOutlined style={{ fontSize: 15 }} />
                  </span>
                  <span>Filters</span>

                  <span className="min-w-[20px] h-[20px] rounded-full bg-[#22c55e] text-white text-[12px] font-semibold flex items-center justify-center px-1">
                    {
                      [
                        filters.ads === 'with',
                        filters.gst === 'with',
                        filters.expenses === 'with',
                        filters.accountCharges === 'with',
                        filters.estimate === 'with',
                      ].filter(Boolean).length
                    }
                  </span>
                </button>

                {/* Dropdown */}
                {showFilters && (
                  <div className="absolute right-0 top-[50px] w-[260px] bg-white border border-[#ebecef] rounded-2xl shadow-xl p-4 z-50">
                    <div className="space-y-4">
                      {/* Ads */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={filters.ads === 'with'}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              ads: e.target.checked ? 'with' : 'without',
                            })
                          }
                        />

                        <span className="text-[13px] font-medium text-[#374151]">With Ads</span>
                      </label>

                      {/* GST */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={filters.gst === 'with'}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              gst: e.target.checked ? 'with' : 'without',
                            })
                          }
                        />

                        <span className="text-[13px] font-medium text-[#374151]">With GST</span>
                      </label>

                      {/* Expense */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={filters.expenses === 'with'}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              expenses: e.target.checked ? 'with' : 'without',
                            })
                          }
                        />

                        <span className="text-[13px] font-medium text-[#374151]">With Expense</span>
                      </label>

                      {/* Estimate */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={filters.estimate === 'with'}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              estimate: e.target.checked ? 'with' : 'without',
                            })
                          }
                        />

                        <span className="text-[13px] font-medium text-[#374151]">With Estimate</span>
                      </label>

                      {/* Account Charges */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <Checkbox
                          checked={filters.accountCharges === 'with'}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              accountCharges: e.target.checked ? 'with' : 'without',
                            })
                          }
                        />

                        <span className="text-[13px] font-medium text-[#374151]">With Account Charges</span>
                      </label>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center gap-2 mt-5">
                      <button
                        type="button"
                        onClick={() => setShowFilters(false)}
                        className="flex-1 h-[38px] rounded-xl border border-[#e5e7eb] text-[13px] font-medium hover:bg-gray-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleApply();
                          setShowFilters(false);
                        }}
                        className="flex-1 h-[38px] rounded-xl bg-[#1677ff] text-white text-[13px] font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={dataSource}
            showSorterTooltip={false}
            loading={loading}
            locale={{ emptyText: 'No Data Found' }}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={(pag) => {
              setPagination(pag);
            }}
            size="small"
            scroll={{ x: 'max-content' }}
            summary={() => {
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-[#fafafa] font-semibold">
                    {columns.map((col, index) => {
                      const keyMap = {
                        netQty: 'netqty',
                        returnqty: 'totalreturn',
                        returnPercent: 'totalreturnper',
                        netsales: 'netsales',
                        tcs: 'tcs',
                        mp_gst: 'mp_gst',
                        mpfees: 'estimatefees',
                        stdcost: 'stdcost',
                        shipping: 'shippingfees',
                        adSpend: 'ads',
                        gst_to_pay_amount: 'gst_to_pay_amount',
                        gst_to_pay_perc: 'gst_to_pay_perc',
                        profit: 'profit',
                        profitPercent: 'grossprofitper',
                        taxableValue: 'taxable_value',
                        settleAmount: 'exp_settlement',
                        netmrp: 'netmrp',
                        mrpNetDiscount: 'mrp_net_discount',
                        mrpCustomerDiscount: 'mrpCustomerDiscount',
                        accountCharges: 'account_charges',
                        otherExpenses: 'other_expenses',
                        tacos: 'tacos',
                        grossProfitPercent: 'grossprofit_percent',
                        percentOfSales: 'percent_of_sales',
                        drr: 'drr',
                      };

                      const value = totals?.[keyMap[col.dataIndex]];

                      const isPercent = ['profitPercent'].includes(col.dataIndex);

                      return (
                        <Table.Summary.Cell key={index} index={index} align="center" fixed={col.fixed}>
                          {index === 0 ? (
                            <span className="font-bold text-[#111827]">Total</span>
                          ) : index === 1 || col.dataIndex === 'view' || col.key === 'action' ? (
                            <div />
                          ) : (
                            <span
                              className={`font-semibold ${
                                Number(value) > 0 && ['profitPercent'].includes(col.dataIndex)
                                  ? 'text-green-600'
                                  : Number(value) < 0
                                  ? 'text-red-600'
                                  : 'text-[#111827]'
                              }`}
                            >
                              {value ?? 0}
                              {isPercent ? '%' : ''}
                            </span>
                          )}
                        </Table.Summary.Cell>
                      );
                    })}
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </Card>
        {/* <Modal
          open={openSettings}
          onCancel={() => setOpenSettings(false)}
          footer={null}
          closable={false}
          width={380}
          bodyStyle={{
            padding: 0,
            borderRadius: 18,
            overflow: 'hidden',
          }}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#f1f1f1]">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#111827]">Manage Column</h2>

              <span className="min-w-[22px] h-[22px] rounded-full bg-[#f3f4f6] text-[#6b7280] text-[11px] font-semibold flex items-center justify-center mb-2">
                {visibleColumns.length}
              </span>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-[#f5f5f5]">
            <div
              className="
        h-[38px]
        rounded-xl
        border border-[#e5e7eb] px-3 flex items-center gap-2 bg-white"
            >
              <SearchOutlined
                style={{
                  color: '#9ca3af',
                  fontSize: 14,
                }}
              />

              <input
                type="text"
                placeholder="Search"
                value={columnSearch}
                onChange={(e) => setColumnSearch(e.target.value)}
                className="
          flex-1
          outline-none
          border-none
          text-[13px]
          bg-transparent
        "
              />
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {allColumnsList
              .filter((col) => col.label.toLowerCase().includes(columnSearch.toLowerCase()))
              .map((col) => {
                const isSelected = visibleColumns.includes(col.key);

                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setVisibleColumns(visibleColumns.filter((c) => c !== col.key));
                      } else {
                        setVisibleColumns([...visibleColumns, col.key]);
                      }
                    }}
                    className={`
              w-full flex items-center justify-between
              px-4 py-3 border-b border-[#f5f5f5]
              transition-all text-left hover:bg-[#f9fafb]
              ${isSelected ? 'bg-[#f5f3ff]' : 'bg-white'}
            `}
                  >
                    <span
                      className={`
                text-[13px] font-medium
                ${isSelected ? 'text-[#4f46e5]' : 'text-[#374151]'}
              `}
                    >
                      {col.label}
                    </span>

                    <span>
                      {isSelected ? (
                        <EyeOutlined
                          style={{
                            color: '#4f46e5',
                            fontSize: 15,
                          }}
                        />
                      ) : (
                        <EyeInvisibleOutlined
                          style={{
                            color: '#c4c4c4',
                            fontSize: 15,
                          }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
          </div>
        </Modal> */}
      </main>
      <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)} centered>
        <img src={previewImage} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
      </Modal>

      <CalculationModal
        open={calculationModal.open}
        type={calculationModal.type}
        data={calculationModal.record}
        onClose={() =>
          setCalculationModal({
            open: false,
            type: '',
            record: null,
          })
        }
      />

      {/* <ProfitModal
        open={detailModal.open}
        record={detailModal.record}
        type={detailModal.type}
        modalLabel={detailModal.modalLabel}
        modalValue={detailModal.modalValue}
        onClose={() => setDetailModal({ open: false, record: null, type: '' })}
      /> */}
    </>
  );
}
