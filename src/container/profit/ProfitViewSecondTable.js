import React, { useEffect } from 'react';
import { Table, Card, Modal, Checkbox, Tooltip, Button, Dropdown } from 'antd';
import {
  RightOutlined,
  EyeOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  CloseCircleOutlined,
  ExportOutlined,
  DownOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import ProfitFilterBar from './component/ProfitFilterBar';
import CalculationModal from './component/Calculations';
import ProfitModal from './component/ProfitModal';
import {
  getSecondDetials,
  getPaymentReconcileDetailsByParentAsin,
  exportProfitabilityDetails,
} from '../../redux/dashboard/actionCreator';

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
  const [detailModal, setDetailModal] = React.useState({
    open: false,
    record: null,
    type: '',
  });

  const [calculationModal, setCalculationModal] = React.useState({
    open: false,
    type: '',
    record: null,
  });
  const [previewImage, setPreviewImage] = React.useState('');
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const channelLogoMap = {
    'Amazon-India': '/icons/amazon.svg',
    Amazon: '/icons/amazon.svg',
    'Myntra-India': '/icons/myntraLogo.jpg',
    Myntra: '/icons/myntraLogo.jpg',
  };
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

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
        ...(debouncedSearch.trim() && {
          search: debouncedSearch.trim(),
        }),
        channel: {
          IN: globalChannel?.length > 0 ? globalChannel : channels,
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
  const isReconcile = location.state?.isReconcile || location.pathname.includes('/reconcile');

  const [exportLoading, setExportLoading] = React.useState(false);
  const handleExport = async (format = 'xlsx') => {
    try {
      setExportLoading(true);
      const payload = buildPayload();
      const exportEndpoint = isReconcile
        ? '/amazon/payment-reconcile/details/by-parent-asin/export/'
        : '/amazon/profitability/details/by-parent-asin/export/';
      await dispatch(exportProfitabilityDetails(payload, format, exportEndpoint));
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportMenuItems = [
    {
      key: 'xlsx',
      label: 'Excel (.xlsx)',
      icon: <FileExcelOutlined style={{ color: '#10b981' }} />,
      onClick: () => handleExport('xlsx'),
    },
    {
      key: 'csv',
      label: 'CSV (.csv)',
      icon: <FileTextOutlined style={{ color: '#3b82f6' }} />,
      onClick: () => handleExport('csv'),
    },
  ];

  useEffect(() => {
    if (isReconcile) {
      dispatch(getPaymentReconcileDetailsByParentAsin(buildPayload()));
    } else {
      dispatch(getSecondDetials(buildPayload()));
    }
  }, [dispatch, pagination.current, pagination.pageSize, globalChannel, debouncedSearch, isReconcile, dateRange]);

  // const PageRoutes = [
  //   { path: 'index', breadcrumbName: 'Profit' },
  //   { path: '', breadcrumbName: 'Profit Details' },
  // ];

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
        mp_gst: item.mp_gst,
        mpfees: item.estimatefees || 0,
        // netasp: Number(item.netasp) || 0,
        // net_discount: Number(item.net_discount) || 0,

        stdcost: item.stdcost || 0,
        shipping: item.shippingfees || 0,
        adSpend: item.ads || 0,
        gst_to_pay_amount: item.gst_to_pay_amount || 0,
        taxableValue: item.taxable_value,
        gst_to_pay_perc: item.gst_to_pay_perc || 0,
        settleAmount: item.exp_settlement,

        // grossprofit: Number(sitem.grossprofit) || 0,
        profit: item.profit || 0,
        // profitPercent: Number(item.grossprofitper) || 0,
        profitPercent: item.grossprofitper || 0,
        return_type: item.return_type || '-',
        claim_amount: item.claim_amount || 0,
        promo_discount: item.promo_discount || 0,

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
        referral_fee: item.referral_fee || 0,
        closing_fee: item.closing_fee || 0,
        per_item_fee: item.per_item_fee || 0,
        fba_fee: item.fba_fee || 0,
        fba_pick_pack_fee: item.fba_pick_pack_fee || 0,
        fba_weight_handling_fee: item.fba_weight_handling_fee || 0,
        tax_amount: item.tax_amount || 0,
        other_charges: item.other_charges || 0,
        courier_return_price: item.courier_return_price || 0,
        customer_return_price: item.customer_return_price || 0,
        courier_return_count: item.courier_return_count || 0,
        customer_return_count: item.customer_return_count || 0,
        final_net_qty: item.final_net_qty || 0,
        final_net_sales: item.final_net_sales || 0,
        actual_fees: item.actual_fees || 0,
        fees_leaks: item.fees_leaks || 0,
        actual_shipping_charges: item.actual_shipping_charges || 0,
        shipping_leaks: item.shipping_leaks || 0,
        actual_mp_gst: item.actual_mp_gst || 0,
        actual_tcs: item.actual_tcs || 0,
        tcs_leaks: item.tcs_leaks || 0,
        settlement_paid_in_bank: item.settlement_paid_in_bank || 0,
        unsettled_not_paid: item.unsettled_not_paid || 0,

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

  const parseAmount = (value) => {
    if (value === null || value === undefined || value === '') return 0;

    const cleaned = String(value).replace(/[₹,\s]/g, '');

    return Number(cleaned) || 0;
  };

  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = [
    {
      title: '',
      dataIndex: 'image',
      width: 60,
      fixed: isMobile ? false : 'left',
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
      width: 50,
      fixed: isMobile ? false : 'left',
      // render: (value) => {
      //   const logo = channelLogoMap[value];

      //   return (
      //     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      //       {logo && <img src={logo} alt={value} style={{ width: 24, height: 24, objectFit: 'contain' }} />}
      //     </div>
      //   );
      // },
      render: (value) => {
        const logo =
          channelLogoMap[value] ||
          (value && value.toLowerCase().includes('myntra')
            ? '/icons/myntraLogo.jpg'
            : value && value.toLowerCase().includes('amazon')
            ? '/icons/amazon.svg'
            : null);

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {logo && (
              <img
                src={logo}
                alt={value}
                style={{
                  width: 24,
                  height: 24,
                  objectFit: 'contain',
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      title: 'View',
      dataIndex: 'view',
      align: 'center',
      width: 100,
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
              {v?.length > 7 ? `${v.slice(0, 8)}...` : v}
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
      title: 'Gross Qty',
      dataIndex: 'netQty',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.netQty - b.netQty,
    },
    {
      title: 'Net Qty',
      dataIndex: 'final_net_qty',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.final_net_qty - b.final_net_qty,
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnqty',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.returnqty - b.returnqty,
    },
    // {
    //   title: 'Courier Return Price',
    //   dataIndex: 'courier_return_price',
    //   align: 'center',
    //   width: 70,
    //   ellipsis: true,
    //   sorter: (a, b) => a.courier_return_price - b.courier_return_price,
    // },
    // {
    //   title: 'Customer Return Price',
    //   dataIndex: 'customer_return_price',
    //   align: 'center',
    //   width: 70,
    //   ellipsis: true,
    //   sorter: (a, b) => a.customer_return_price - b.customer_return_price,
    // },

    {
      title: 'Courier Return Count',
      dataIndex: 'courier_return_count',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.courier_return_count - b.courier_return_count,
    },
    {
      title: 'Customer Return Count',
      dataIndex: 'customer_return_count',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.customer_return_count - b.customer_return_count,
    },
    {
      title: 'Return %',
      dataIndex: 'returnPercent',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.returnPercent - b.returnPercent,
      render: (value) => `${Number(value || 0).toFixed(2)}%`,
    },
    {
      title: 'Promo Discount',
      dataIndex: 'promo_discount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.promo_discount) - parseAmount(b.promo_discount),
    },
    {
      title: 'Gross Sales',
      dataIndex: 'netsales',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.netsales) - parseAmount(b.netsales),
    },
    {
      title: 'Net Sales',
      dataIndex: 'final_net_sales',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.final_net_sales) - parseAmount(b.final_net_sales),
    },
    {
      title: 'MP fees',
      dataIndex: 'mpfees',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.mpfees) - parseAmount(b.mpfees),
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
    ...(isReconcile
      ? [
          {
            title: 'Actual MP Fees',
            dataIndex: 'actual_fees',
            align: 'center',
            width: 90,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.actual_fees) - parseAmount(b.actual_fees),
          },
          {
            title: 'Fee Leaks',
            dataIndex: 'fees_leaks',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.fees_leaks) - parseAmount(b.fees_leaks),
            render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
          },
        ]
      : []),
    {
      title: 'Shipping',
      dataIndex: 'shipping',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.shipping) - parseAmount(b.shipping),
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

    ...(isReconcile
      ? [
          {
            title: 'Actual Shipping',
            dataIndex: 'actual_shipping_charges',
            align: 'center',
            width: 90,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.actual_shipping_charges) - parseAmount(b.actual_shipping_charges),
          },
          {
            title: 'Shipping Leaks',
            dataIndex: 'shipping_leaks',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.shipping_leaks) - parseAmount(b.shipping_leaks),
            render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
          },
        ]
      : []),

    {
      title: 'MP-GST',
      dataIndex: 'mp_gst',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.mp_gst) - parseAmount(b.mp_gst),
    },
    ...(isReconcile
      ? [
          {
            title: 'Actual MP-GST',
            dataIndex: 'actual_mp_gst',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.actual_mp_gst) - parseAmount(b.actual_mp_gst),
          },
        ]
      : []),

    {
      title: 'TCS',
      dataIndex: 'tcs',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.tcs) - parseAmount(b.tcs),
    },

    ...(isReconcile
      ? [
          {
            title: 'Actual TCS',
            dataIndex: 'actual_tcs',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.actual_tcs) - parseAmount(b.actual_tcs),
          },
          {
            title: 'TCS Leaks',
            dataIndex: 'tcs_leaks',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.tcs_leaks) - parseAmount(b.tcs_leaks),
            render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
          },
        ]
      : []),

    {
      title: 'Expected Settlement',
      dataIndex: 'settleAmount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.settleAmount) - parseAmount(b.settleAmount),
    },

    ...(isReconcile
      ? [
          {
            title: 'Bank Settled Amount',
            dataIndex: 'settlement_paid_in_bank',
            align: 'center',
            width: 100,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.settlement_paid_in_bank) - parseAmount(b.settlement_paid_in_bank),
          },
          {
            title: 'Unsettled Amount',
            dataIndex: 'unsettled_not_paid',
            align: 'center',
            width: 100,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.unsettled_not_paid) - parseAmount(b.unsettled_not_paid),
            render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
          },
        ]
      : []),

    {
      title: 'Ad Spend',
      dataIndex: 'adSpend',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.adSpend) - parseAmount(b.adSpend),
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
      title: 'Taxable Value',
      dataIndex: 'taxableValue',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.taxableValue) - parseAmount(b.taxableValue),
    },

    {
      title: 'GST to Pay',
      dataIndex: 'gst_to_pay_amount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.gst_to_pay_amount) - parseAmount(b.gst_to_pay_amount),
    },
    {
      title: 'GST to Pay %',
      dataIndex: 'gst_to_pay_perc',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.gst_to_pay_perc) - parseAmount(b.gst_to_pay_perc),
      render: (v) => <span>{v}%</span>,
    },
    {
      title: 'Claim Amount',
      dataIndex: 'claim_amount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.claim_amount) - parseAmount(b.claim_amount),
    },
    ...(isReconcile
      ? []
      : [
          {
            title: 'Product Cost',
            dataIndex: 'stdcost',
            align: 'center',
            width: 70,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.stdcost) - parseAmount(b.stdcost),
          },
        ]),

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
    ...(isReconcile
      ? []
      : [
          {
            title: 'Profit',
            dataIndex: 'profit',
            align: 'center',
            width: 70,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.profit) - parseAmount(b.profit),
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
                className="text-[#2563eb] font-medium underline cursor-pointer bg-transparent border-none"

                // className={`font-medium underline cursor-pointer bg-transparent border-none ${
                //   String(v).includes('-') ? 'text-red-500' : 'text-green-600'
                // }`}
              >
                {v}
              </button>
            ),
          },
        ]),

    ...(isReconcile
      ? []
      : [
          {
            title: 'Profit %',
            dataIndex: 'profitPercent',
            align: 'center',
            width: 70,
            ellipsis: true,
            sorter: (a, b) => parseAmount(a.profitPercent) - parseAmount(b.profitPercent),
            render: (value) => (
              <span
                className={`font-semibold ${
                  Number(value) > 0 ? 'text-green-600' : Number(value) < 0 ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                {Number(value || 0).toFixed(2)}%
              </span>
            ),
          },
        ]),

    // {
    //   title: 'Settled amount',
    //   dataIndex: 'settledamount',
    //   align: 'center',
    //   sorter: (a, b) => a.settledamount - b.settledamount,
    // },
    {
      // title: (
      //   <button
      //     type="button"
      //     onClick={() => setOpenSettings(true)}
      //     className="flex justify-center items-center w-full cursor-pointer text-black"
      //   >
      //     <SettingOutlined />
      //   </button>
      // ),
      key: 'action',
      fixed: isMobile ? false : 'right',
      width: 60,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            // onClick={() => navigate(`../third/${record.asin}`)}
            onClick={() =>
              navigate(`../third/${record.asin}`, {
                state: {
                  sku: record.view,
                  isReconcile,
                },
              })
            }
            // style={{
            //   border: '1px solid #d9d9d9',
            //   background: 'rgb(202, 221, 254)',
            // }}
            className="w-[28px] h-[28px] rounded-full border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:text-black transition-all duration-200 mx-auto"
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
          </button> */}
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (columns.length && visibleColumns.length === 0) {
      setVisibleColumns(columns.map((col) => col.dataIndex || col.key || col.title));
    }
  }, []);

  // const columnOptions = columns
  //   .filter((col) => col.dataIndex !== 'action')
  //   .map((col) => ({
  //     key: col.dataIndex || col.key || col.title,
  //     label: typeof col.title === 'string' ? col.title : col.dataIndex || 'Column',
  //   }));

  const columnOptions = columns
    .filter(
      (col) =>
        col.key !== 'action' && col.dataIndex !== 'image' && col.dataIndex !== 'view' && col.dataIndex !== 'channel',
    )
    .map((col) => ({
      key: col.dataIndex || col.key || col.title,
      label: typeof col.title === 'string' ? col.title : col.dataIndex || col.key,
    }));

  const allColumnKeys = columnOptions.map((item) => item.key);

  const allSelected = allColumnKeys.length > 0 && allColumnKeys.every((key) => visibleColumns.includes(key));

  const someSelected = allColumnKeys.some((key) => visibleColumns.includes(key)) && !allSelected;

  const manageColumnsDropdown = (
    <div className="w-[260px] bg-white rounded-xl shadow-xl border border-[#e5e7eb]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-medium text-[14px]">Manage Columns</span>

        <button type="button" className="text-[#6366f1] text-[12px]" onClick={() => setVisibleColumns(allColumnKeys)}>
          Restore
        </button>
      </div>

      {/* Select All */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-[#f9fafb]">
        <span className="text-[13px] font-medium text-[#374151]">Select All</span>

        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(e) => {
            if (e.target.checked) {
              setVisibleColumns(allColumnKeys);
            } else {
              setVisibleColumns([]);
            }
          }}
        />
      </div>

      {/* Individual Columns */}
      <div className="max-h-[350px] overflow-y-auto">
        {columnOptions.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-4 py-2 hover:bg-[#f9fafb]">
            <span className="text-[13px] text-[#374151]">{item.label}</span>

            <Checkbox
              checked={visibleColumns.includes(item.key)}
              onChange={(e) => {
                if (e.target.checked) {
                  setVisibleColumns((prev) => [...prev, item.key]);
                } else {
                  setVisibleColumns((prev) => prev.filter((c) => c !== item.key));
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const filteredColumns = columns.filter((col) => {
    const key = col.dataIndex || col.key || col.title;

    if (
      col.fixed === 'left' ||
      col.fixed === 'right' ||
      col.dataIndex === 'image' ||
      col.dataIndex === 'channel' ||
      col.dataIndex === 'view' ||
      col.key === 'action'
    ) {
      return true;
    }

    return visibleColumns.includes(key);
  });

  return (
    <>
      <main className="min-h-[600px] px-4 pb-[10px] py-3">
        <Card bordered={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-[35px] h-[35px] rounded-xl border border-[#dbe1e8] bg-white flex items-center justify-center hover:bg-[#f8fafc] transition-all duration-200 shadow-sm"
            >
              <ArrowLeftOutlined className="text-[#374151]" />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              {/* Search */}
              <div className="relative w-[220px] lg:w-full md:w-full sm:w-full">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-[35px] rounded-lg border border-[#e5e7eb] bg-white pl-4 pr-10 text-[12px] outline-none shadow-sm "
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                  {search ? (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="flex items-center justify-center cursor-pointer hover:text-[#374151]"
                    >
                      <CloseCircleOutlined size={16} />
                    </button>
                  ) : (
                    <SearchOutlined style={{ fontSize: 14 }} />
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:w-full lg:justify-end md:w-full md:justify-between sm:w-full sm:justify-between">
                <Dropdown trigger={['click']} dropdownRender={() => manageColumnsDropdown} placement="bottomRight">
                  <Button
                    icon={<SettingOutlined style={{ fontSize: 14 }} />}
                    className="!flex !items-center !h-[35px] !rounded-lg !border-[#e5e7eb] whitespace-nowrap"
                  >
                    <span className="text-[#4B5563] text-[13px]">Manage Columns</span>
                  </Button>
                </Dropdown>
                <Dropdown menu={{ items: exportMenuItems }} trigger={['click']} placement="bottomRight">
                  <Button
                    type="primary"
                    icon={<ExportOutlined />}
                    loading={exportLoading}
                    className="bg-[#10b981] hover:bg-[#059669] border-none text-white font-medium px-2 h-[30px] rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    Export <DownOutlined style={{ fontSize: 10 }} />
                  </Button>
                </Dropdown>
              </div>
            </div>
          </div>
          <Table
            columns={filteredColumns}
            dataSource={dataSource}
            showSorterTooltip={false}
            loading={loading}
            tableLayout="fixed"
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
              setPagination({
                current: pag.current,
                pageSize: pag.pageSize,
              });
            }}
            size="small"
            scroll={{ x: 1800 }}
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-[6px]
  "
            summary={() => (
              <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 500, fontSize: '13px', color: 'black' }}>
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
                      taxableValue: 'taxable_value',
                      gst_to_pay_amount: 'gst_to_pay_amount',
                      gst_to_pay_perc: 'gst_to_pay_perc',
                      settleAmount: 'exp_settlement',
                      profit: 'profit',
                      profitPercent: 'grossprofitper',
                      mp_gst: 'mp_gst',

                      actual_fees: 'actual_fees',
                      fees_leaks: 'fees_leaks',
                      actual_shipping_charges: 'actual_shipping_charges',
                      shipping_leaks: 'shipping_leaks',
                      actual_mp_gst: 'actual_mp_gst',
                      actual_tcs: 'actual_tcs',
                      tcs_leaks: 'tcs_leaks',
                      settlement_paid_in_bank: 'settlement_paid_in_bank',
                      unsettled_not_paid: 'unsettled_not_paid',

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
                      claim_amount: 'total_claim_amount',
                      return_type: 'return_type',
                      promo_discount: 'total_promo_discount',
                      courier_return_price: 'courier_return_price',
                      customer_return_price: 'customer_return_price',
                      courier_return_count: 'courier_return_count',
                      customer_return_count: 'customer_return_count',
                      final_net_qty: 'total_final_net_qty',
                      final_net_sales: 'total_final_net_sales',
                    };

                    const totalKey = keyMap[col.dataIndex] || col.dataIndex;
                    const value = totals[totalKey];

                    return (
                      <Table.Summary.Cell key={col.key || index} index={index + 3} fixed={col.fixed} align="center">
                        {col.key === 'action' ? (
                          <div className="w-full h-full" />
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
                          // <span>{value ?? 0}</span>
                          <span
                            className={`text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis ${
                              Number(value) > 0 && ['profitPercent'].includes(col.dataIndex)
                                ? 'text-green-600'
                                : Number(value) < 0
                                ? 'text-red-600'
                                : 'text-[#111827]'
                            }`}
                          >
                            {value ?? 0}
                            {['profitPercent'].includes(col.dataIndex) ? '%' : ''}
                          </span>
                        )}
                      </Table.Summary.Cell>
                    );
                  })}
              </Table.Summary.Row>
            )}
          />
        </Card>
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
    </>
  );
}
