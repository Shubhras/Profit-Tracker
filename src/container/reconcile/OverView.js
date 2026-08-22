import React, { useEffect } from 'react';
import { Table, Card, Modal, Checkbox, Tooltip, Dropdown, Button } from 'antd';
import {
  RightOutlined,
  SearchOutlined,
  EyeOutlined,
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
// import ProfitModal from './component/ProfitModal'
import CalculationModal from '../profit/component/Calculations';
// import flipkart from "../../assets/icons/flipkart.png";
import { getPaymentReconcileDetails, exportProfitabilityDetails } from '../../redux/dashboard/actionCreator';

// import { PageHeader } from '../../components/page-headers/page-headers';

export default function ProfitDetailsView() {
  const { channel } = useParams();
  const location = useLocation();
  const decodedChannel = channel ? decodeURIComponent(channel) : null;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dateRange, profitData, loading, channel: globalChannel } = useSelector((state) => state.dashboard);
  const totals = profitData?.totals || {};
  const profitType = location.state?.profitType || 'all';
  // const channels = location.state?.channels?.length > 0 ? location.state.channels : globalChannel || [];
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
  const [visibleColumns, setVisibleColumns] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  // const [columnSearch, setColumnSearch] = React.useState('');

  const channelLogoMap = {
    // 'Amazon-India': amazon,
    // 'Myntra-India': myntra,
    // Myntra: myntra,
    'Amazon-India': '/icons/amazon.svg',
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

  const buildPayload = () => {
    return {
      filters: {
        ...(debouncedSearch.trim() && {
          search: debouncedSearch.trim(),
        }),

        channel: {
          // IN: [decodedChannel],
          // IN: channels,
          IN: globalChannel,
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
      pagination: {
        pageNo: pagination.current - 1,
        pageSize: pagination.pageSize,
      },
    };
  };
  const [exportLoading, setExportLoading] = React.useState(false);
  const handleExport = async (format = 'xlsx') => {
    try {
      setExportLoading(true);
      const payload = buildPayload();
      await dispatch(exportProfitabilityDetails(payload, format, '/amazon/payment-reconcile/details/export/'));
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
    dispatch(getPaymentReconcileDetails(buildPayload()));
  }, [dateRange, decodedChannel, globalChannel, pagination, debouncedSearch]);

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

        view: item.asin || 0,
        name: item.name,
        asin: item.asin,
        redirecturl: item.redirecturl,
        netQty: item.netqty || 0,
        final_net_qty: item.final_net_qty || 0,
        returnqty: item.returnqty || 0,
        settleAmount: item.exp_settlement,
        returnPercent: item.retpercent || 0,

        netsales: item.netsales || 0,
        final_net_sales: item.final_net_sales || 0,
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
        return_type: item.return_type || '-',
        claim_amount: item.claim_amount || 0,
        promo_discount: item.promo_discount || 0,
        courier_return_price: item.courier_return_price || 0,
        customer_return_price: item.customer_return_price || 0,
        courier_return_count: item.courier_return_count || 0,
        customer_return_count: item.customer_return_count || 0,

        // grossprofit: Number(sitem.grossprofit) || 0,
        profit: item.profit || 0,
        // profitPercent: Number(item.grossprofitper) || 0,
        profitPercent: item.grossprofitper || 0,

        // Reconcile metrics
        actual_fees: item.actual_fees || '₹0.0',
        fees_leaks: item.fees_leaks || '₹0.0',
        actual_shipping_charges: item.actual_shipping_charges || '₹0.0',
        shipping_leaks: item.shipping_leaks || '₹0.0',
        actual_mp_gst: item.actual_mp_gst || '₹0.0',
        actual_tcs: item.actual_tcs || '₹0.0',
        tcs_leaks: item.tcs_leaks || '₹0.0',
        expected_settlement: item.expected_settlement || item.exp_settlement || '₹0.0',
        settlement_paid_in_bank: item.settlement_paid_in_bank || '₹0.0',
        unsettled_not_paid: item.unsettled_not_paid || '₹0.0',
      })) || [];

    return rows;
  }, [profitData]);

  const getDynamicWidth = (dataIndex, defaultWidth = 70) => {
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
      claim_amount: 'total_claim_amount',
      promo_discount: 'total_promo_discount',
      courier_return_count: 'courier_return_count',
      customer_return_count: 'customer_return_count',
      final_net_qty: 'total_final_net_qty',
      final_net_sales: 'total_final_net_sales',
      actual_fees: 'total_actual_fees',
      fees_leaks: 'total_fees_leaks',
      actual_shipping_charges: 'total_actual_shipping',
      shipping_leaks: 'total_shipping_leaks',
      actual_mp_gst: 'total_actual_mp_gst',
      actual_tcs: 'total_actual_tcs',
      tcs_leaks: 'total_tcs_leaks',
      expected_settlement: 'total_expected_settlement',
      settlement_paid_in_bank: 'total_settlement_paid_in_bank',
      unsettled_not_paid: 'total_unsettled_not_paid',
    };

    const value = totals?.[keyMap[dataIndex]];

    if (value == null) return defaultWidth;

    const text = String(value);

    return Math.max(defaultWidth, text.length * 10 + 30);
  };

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
      // render: (value) => {
      //   const logo = channelLogoMap[value] || (value && value.toLowerCase().includes('myntra') ? myntra : null);

      //   return (
      //     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      //       {logo && <img src={logo} alt={value} style={{ width: 24, height: 24, objectFit: 'contain' }} />}
      //       {/* <span>{value}</span> */}
      //     </div>
      //   );
      // },
      render: (value) => {
        const logo =
          channelLogoMap[value] || (value && value.toLowerCase().includes('myntra') ? '/icons/myntraLogo.jpg' : null);

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
      ellipsis: true,
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
      title: 'Gross Qty',
      dataIndex: 'netQty',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('netQty', 70),
      ellipsis: true,
      sorter: (a, b) => a.netQty - b.netQty,
    },
    {
      title: 'Net Qty',
      dataIndex: 'final_net_qty',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('final_net_qty', 70),
      ellipsis: true,
      sorter: (a, b) => a.final_net_qty - b.final_net_qty,
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnqty',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('returnqty', 70),
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
      // width: 70,
      width: getDynamicWidth('courier_return_count', 70),
      ellipsis: true,
      sorter: (a, b) => a.courier_return_count - b.courier_return_count,
    },
    {
      title: 'Customer Return Count',
      dataIndex: 'customer_return_count',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('customer_return_count', 70),
      ellipsis: true,
      sorter: (a, b) => a.customer_return_count - b.customer_return_count,
    },
    {
      title: 'Return %',
      dataIndex: 'returnPercent',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('returnPercent', 70),
      ellipsis: true,
      sorter: (a, b) => a.returnPercent - b.returnPercent,
      render: (v) => <span>{v}%</span>,
    },
    {
      title: 'Promo Discount',
      dataIndex: 'promo_discount',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('promo_discount', 70),
      ellipsis: true,
      sorter: (a, b) => a.promo_discount - b.promo_discount,
    },
    {
      title: 'Gross Sales',
      dataIndex: 'netsales',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('netsales', 70),
      ellipsis: true,
      sorter: (a, b) => a.netsales - b.netsales,
    },
    {
      title: 'Net Sales',
      dataIndex: 'final_net_sales',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('final_net_sales', 70),
      ellipsis: true,
      sorter: (a, b) => a.final_net_sales - b.final_net_sales,
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
      // width: 70,
      width: getDynamicWidth('mpfees', 70),
      ellipsis: true,
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
      title: 'Actual MP Fees',
      dataIndex: 'actual_fees',
      align: 'center',
      width: getDynamicWidth('actual_fees', 90),
      ellipsis: true,
      sorter: (a, b) => (parseFloat(a.actual_fees) || 0) - (parseFloat(b.actual_fees) || 0),
    },
    {
      title: 'Fee Leaks',
      dataIndex: 'fees_leaks',
      align: 'center',
      width: getDynamicWidth('fees_leaks', 80),
      ellipsis: true,
      sorter: (a, b) => (parseFloat(a.fees_leaks) || 0) - (parseFloat(b.fees_leaks) || 0),
      render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
    },
    {
      title: 'Shipping',
      dataIndex: 'shipping',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('shipping', 70),
      ellipsis: true,
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
      title: 'Actual Shipping',
      dataIndex: 'actual_shipping_charges',
      align: 'center',
      width: getDynamicWidth('actual_shipping_charges', 90),
      ellipsis: true,
      sorter: (a, b) => (parseFloat(a.actual_shipping_charges) || 0) - (parseFloat(b.actual_shipping_charges) || 0),
    },
    {
      title: 'Shipping Leaks',
      dataIndex: 'shipping_leaks',
      align: 'center',
      width: getDynamicWidth('shipping_leaks', 80),
      ellipsis: true,
      sorter: (a, b) => (parseFloat(a.shipping_leaks) || 0) - (parseFloat(b.shipping_leaks) || 0),
      render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
    },
    {
      title: 'MP-GST',
      dataIndex: 'mp_gst',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('mp_gst', 70),
      ellipsis: true,
      sorter: (a, b) => a.mp_gst - b.mp_gst,
    },
    {
      title: 'Actual MP-GST',
      dataIndex: 'actual_mp_gst',
      align: 'center',
      width: getDynamicWidth('actual_mp_gst', 80),
      ellipsis: true,
      sorter: (a, b) => (parseFloat(a.actual_mp_gst) || 0) - (parseFloat(b.actual_mp_gst) || 0),
    },

    {
      title: 'TCS',
      dataIndex: 'tcs',
      align: 'center',
      // width: 100,
      width: getDynamicWidth('tcs', 70),
      ellipsis: true,
      sorter: (a, b) => a.tcs - b.tcs,
    },
    {
      title: 'Actual TCS',
      dataIndex: 'actual_tcs',
      align: 'center',
      width: getDynamicWidth('actual_tcs', 80),
      ellipsis: true,
      sorter: (a, b) => (parseFloat(a.actual_tcs) || 0) - (parseFloat(b.actual_tcs) || 0),
    },
    {
      title: 'TCS Leaks',
      dataIndex: 'tcs_leaks',
      align: 'center',
      width: getDynamicWidth('tcs_leaks', 80),
      ellipsis: true,
      sorter: (a, b) => (parseFloat(a.tcs_leaks) || 0) - (parseFloat(b.tcs_leaks) || 0),
      render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
    },
    {
      title: 'Expected Settlement',
      dataIndex: 'settleAmount',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('settleAmount', 70),
      ellipsis: true,
      sorter: (a, b) => a.settleAmount - b.settleAmount,
    },

    {
      title: 'Bank Settled Amount',
      dataIndex: 'settlement_paid_in_bank',
      align: 'center',
      width: getDynamicWidth('settlement_paid_in_bank', 100),
      ellipsis: true,
      sorter: (a, b) => (parseFloat(a.settlement_paid_in_bank) || 0) - (parseFloat(b.settlement_paid_in_bank) || 0),
    },
    {
      title: 'Unsettled Amount',
      dataIndex: 'unsettled_not_paid',
      align: 'center',
      width: getDynamicWidth('unsettled_not_paid', 100),
      ellipsis: true,
      sorter: (a, b) => (parseFloat(a.unsettled_not_paid) || 0) - (parseFloat(b.unsettled_not_paid) || 0),
      render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
    },

    {
      title: 'Ad Spend',
      dataIndex: 'adSpend',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('adSpend', 70),
      ellipsis: true,
      sorter: (a, b) => a.adSpend - b.adSpend,
    },

    {
      title: 'Taxable Value',
      dataIndex: 'taxableValue',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('taxableValue', 70),
      ellipsis: true,
      sorter: (a, b) => a.taxableValue - b.taxableValue,
    },

    {
      title: 'GST to Pay',
      dataIndex: 'gst_to_pay_amount',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('gst_to_pay_amount', 70),
      ellipsis: true,
      sorter: (a, b) => a.gst_to_pay_amount - b.gst_to_pay_amount,
    },
    {
      title: 'GST to Pay %',
      dataIndex: 'gst_to_pay_perc',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('gst_to_pay_perc', 70),
      ellipsis: true,
      sorter: (a, b) => a.gst_to_pay_perc - b.gst_to_pay_perc,
      render: (v) => <span>{v}%</span>,
    },
    {
      title: 'Claim Amount',
      dataIndex: 'claim_amount',
      align: 'center',
      // width: 70,
      width: getDynamicWidth('claim_amount', 70),
      ellipsis: true,
      sorter: (a, b) => a.claim_amount - b.claim_amount,
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
      key: 'action',
      fixed: 'right',
      width: 60,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => navigate(`/admin/reconcile/second/${record.asin}`, { state: { isReconcile: true } })}
            className="w-[28px] h-[28px] rounded-full border border-[#dbe1e8]
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

  const manageColumnsDropdown = (
    <div className="w-[260px] bg-white rounded-xl shadow-xl border border-[#e5e7eb]">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-medium text-[14px]">Manage Columns</span>

        <button
          type="button"
          className="text-[#6366f1] text-[12px]"
          onClick={() => setVisibleColumns(columnOptions.map((item) => item.key))}
        >
          Restore
        </button>
      </div>

      <div className="max-h-[350px] overflow-y-auto">
        {columnOptions.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-4 py-2 hover:bg-[#f9fafb]">
            <span className="text-[13px]">{item.label}</span>

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
      col.key === 'action'
    ) {
      return true;
    }

    return visibleColumns.includes(key);
  });
  const tableWidth = filteredColumns.reduce((total, col) => total + (col.width || 120), 0);

  return (
    <>
      {/* <PageHeader
        routes={PageRoutes}
        // title="Profit Details"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 bg-transparent"
      /> */}

      <main className="min-h-[600px] px-3 pb-[30px] py-3">
        {/* <div className="mb-3">
          <h1 className="text-[20px] font-semibold text-[#111827]">Sales Details</h1>
        </div> */}

        <Card bordered={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            {/* Search */}
            <div className="relative w-[220px] lg:w-full md:w-full sm:w-full">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[35px] rounded-lg border border-[#e5e7eb] bg-white pl-4 pr-10 text-[12px] outline-none shadow-sm"
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

            {/* Right Actions */}
            <div className="flex items-center gap-2 flex-wrap lg:w-full lg:justify-end md:w-full md:justify-between sm:w-full sm:justify-between">
              <Dropdown trigger={['click']} dropdownRender={() => manageColumnsDropdown} placement="bottomRight">
                <Button
                  icon={<SettingOutlined style={{ fontSize: 14 }} />}
                  className="flex items-center !h-[35px] !rounded-lg !border-[#e5e7eb] whitespace-nowrap"
                >
                  <span className="text-[#4B5563] text-[13px]">Manage Columns</span>
                </Button>
              </Dropdown>
              <Dropdown menu={{ items: exportMenuItems }} trigger={['click']} placement="bottomRight">
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  loading={exportLoading}
                  className="bg-[#10b981] hover:bg-[#059669] border-none text-white font-medium px-4 h-[35px] rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  Export <DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Dropdown>
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
              ...pagination,
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
            // scroll={{ x: 'true' }}
            scroll={{ x: tableWidth }}
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-[6px]
  "
            summary={() => {
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row className="bg-[#fafafa] font-semibold">
                    {filteredColumns.map((col, index) => {
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
                        claim_amount: 'total_claim_amount',
                        return_type: 'return_type',
                        promo_discount: 'total_promo_discount',
                        courier_return_price: 'courier_return_price',
                        customer_return_price: 'customer_return_price',
                        courier_return_count: 'courier_return_count',
                        customer_return_count: 'customer_return_count',
                        final_net_qty: 'total_final_net_qty',
                        final_net_sales: 'total_final_net_sales',
                        actual_fees: 'total_actual_fees',
                        fees_leaks: 'total_fees_leaks',
                        actual_shipping_charges: 'total_actual_shipping',
                        shipping_leaks: 'total_shipping_leaks',
                        actual_mp_gst: 'total_actual_mp_gst',
                        actual_tcs: 'total_actual_tcs',
                        tcs_leaks: 'total_tcs_leaks',
                        expected_settlement: 'total_expected_settlement',
                        settlement_paid_in_bank: 'total_settlement_paid_in_bank',
                        unsettled_not_paid: 'total_unsettled_not_paid',
                      };

                      const value = totals?.[keyMap[col.dataIndex]];

                      const isPercent = ['profitPercent'].includes(col.dataIndex);

                      return (
                        <Table.Summary.Cell
                          key={index}
                          index={index}
                          align="center"
                          fixed={col.fixed}
                          // style={{
                          //   whiteSpace: 'nowrap',
                          //   overflow: 'visible',
                          //   whiteSpace: 'nowrap',
                          //   paddingLeft: '14px',
                          //   paddingRight: '14px',
                          //   paddingInline: '18px',
                          // }}
                        >
                          {index === 0 ? (
                            <span className="font-bold text-[13px] text-[#111827]">Total</span>
                          ) : index === 1 || col.dataIndex === 'view' || col.key === 'action' ? (
                            <div />
                          ) : (
                            <span
                              className={`text-[13px] font-semibold ${
                                // className={`inline-block min-w-[90px] text-[13px] font-semibold ${
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
    </>
  );
}
