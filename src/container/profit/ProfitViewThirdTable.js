import React, { useEffect } from 'react';
import { Table, Card, Modal, Tooltip, Checkbox, Button, Dropdown } from 'antd';
import {
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  SettingOutlined,
  CloseCircleOutlined,
  ExportOutlined,
  DownOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfitModal from './component/ProfitModal';
import CalculationModal from './component/Calculations';
import {
  getProfitDetailsByParentId,
  getPaymentReconcileDetailsByParentProductId,
  exportProfitabilityDetails,
} from '../../redux/dashboard/actionCreator';
import amazon from '../../assets/icons/amazon.svg';
import myntra from '../../assets/icons/myntraLogo.jpg';

export default function ProfitDetailsView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const sku = location.state?.sku || '';

  const isReconcile = location.state?.isReconcile || location.pathname.includes('/reconcile');

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

  const [showFilters, setShowFilters] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const { profitData, dateRange, channel: globalChannel, loading } = useSelector((state) => state.dashboard);

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
  const [previewImage, setPreviewImage] = React.useState('');
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [exportLoading, setExportLoading] = React.useState(false);

  const channelLogoMap = {
    'Amazon-India': amazon,
    'Myntra-India': myntra,
  };

  const apipayload = {
    filters: {
      ...(debouncedSearch.trim() && {
        search: debouncedSearch.trim(),
      }),
      fromDate: dateRange?.fromDate || null,
      toDate: dateRange?.endDate || null,
      endDate: dateRange?.endDate || null,
      channel: {
        IN: globalChannel,
      },
      parentProductId: id,
      sku,
    },
    pagination: {
      pageNo: pagination.current - 1,
      pageSize: pagination.pageSize,
    },
  };

  const handleExport = async (format = 'xlsx') => {
    try {
      setExportLoading(true);
      const exportEndpoint = isReconcile
        ? '/amazon/payment-reconcile/details/by-parentproductid/export/'
        : '/amazon/profitability/details/by-parentproductid/export/';
      await dispatch(exportProfitabilityDetails(apipayload, format, exportEndpoint));
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
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!id) return;
    if (isReconcile) {
      dispatch(getPaymentReconcileDetailsByParentProductId(apipayload));
    } else {
      dispatch(getProfitDetailsByParentId(apipayload));
    }
  }, [id, dateRange, globalChannel, pagination, debouncedSearch, isReconcile]);

  const dataSource =
    profitData?.response?.map((item, index) => ({
      key: index,
      channel: item.channel,
      image: item.image || item.image_url,
      view: item.order_id,
      redirecturl: item.redirecturl,
      netqty: item.qty || 0,
      returnqty: item.returnqty || 0,
      returnPercent: item.retpercent || 0,
      netsales: item.netsales,
      tcs: item.tcs || 0,
      mp_gst: item.mp_gst,
      shipping: item.shippingfees,
      adSpend: item.ads,
      gst_to_pay_amount: item.gst_to_pay_amount,
      taxableValue: item.taxable_value,
      gst_to_pay_perc: item.gst_to_pay_perc || 0,
      std: item.stdcost,
      profit: item.profit,
      profitPercent: item.grossprofitper || 0,
      grossqty: item.grossqty || 0,
      netasp: item.netasp || 0,
      mrp: item.mrp || 0,
      mrpNetDiscount: item.mrp_net_discount || 0,
      grossSales: item.grosssales || 0,
      settleAmount: item.exp_settlement,
      mpfees: item.estimatefees || 0,
      accountCharges: item.account_charges || 0,
      otherExpenses: item.other_expenses || 0,
      grossProfit: item.grossprofit || 0,
      settledAmount: item.exp_settlement || 0,
      tacos: item.tacos || 0,
      grossProfitPercent: item.grossprofit_percent || 0,
      percentOfSales: item.percent_of_sales || 0,
      drr: item.drr || 0,
      lastOrderDate: item.last_order_date || '',
      referral_fee: item.referral_fee || 0,
      closing_fee: item.closing_fee || 0,
      per_item_fee: item.per_item_fee || 0,
      fba_fee: item.fba_fee || 0,
      claim_amount: item.claim_amount || 0,
      promo_discount: item.promo_discount || 0,
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
    })) || [];

  const columns = [
    {
      title: '',
      dataIndex: 'image',
      width: 60,
      fixed: 'left',
      render: (value) => (
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
      ),
    },
    {
      title: '',
      dataIndex: 'channel',
      width: 60,
      fixed: 'left',
      render: (value) => {
        const logo = channelLogoMap[value];
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {logo && <img src={logo} alt={value} style={{ width: 24, height: 24, objectFit: 'contain' }} />}
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
      sorter: (a, b) => (a.view || '').localeCompare(b.view || ''),
      render: (v, record) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <button
            type="button"
            onClick={() => {
              if (record.redirecturl) {
                window.open(record.redirecturl, '_blank');
              }
            }}
            style={{
              maxWidth: 90,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
            className="text-blue-500 underline"
          >
            {v}
          </button>
        </Tooltip>
      ),
    },
    {
      title: 'Gross Qty',
      dataIndex: 'netqty',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.netqty - b.netqty,
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
      render: (v) => <span>{v}%</span>,
    },
    {
      title: 'Promo Discount',
      dataIndex: 'promo_discount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.promo_discount - b.promo_discount,
    },
    {
      title: 'Gross Sales',
      dataIndex: 'netsales',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.netsales - b.netsales,
    },
    {
      title: 'Net Sales',
      dataIndex: 'final_net_sales',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.final_net_sales - b.final_net_sales,
    },
    {
      title: 'MP fees',
      dataIndex: 'mpfees',
      align: 'center',
      width: 70,
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
      title: 'Shipping',
      dataIndex: 'shipping',
      align: 'center',
      width: 70,
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
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.mp_gst - b.mp_gst,
    },
    {
      title: 'TCS',
      dataIndex: 'tcs',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.tcs - b.tcs,
    },
    ...(isReconcile
      ? [
          {
            title: 'Actual MP Fees',
            dataIndex: 'actual_fees',
            align: 'center',
            width: 90,
            ellipsis: true,
            sorter: (a, b) => (parseFloat(a.actual_fees) || 0) - (parseFloat(b.actual_fees) || 0),
          },
          {
            title: 'Fee Leaks',
            dataIndex: 'fees_leaks',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => (parseFloat(a.fees_leaks) || 0) - (parseFloat(b.fees_leaks) || 0),
            render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
          },
          {
            title: 'Actual Shipping',
            dataIndex: 'actual_shipping_charges',
            align: 'center',
            width: 90,
            ellipsis: true,
            sorter: (a, b) =>
              (parseFloat(a.actual_shipping_charges) || 0) - (parseFloat(b.actual_shipping_charges) || 0),
          },
          {
            title: 'Shipping Leaks',
            dataIndex: 'shipping_leaks',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => (parseFloat(a.shipping_leaks) || 0) - (parseFloat(b.shipping_leaks) || 0),
            render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
          },
          {
            title: 'Actual MP-GST',
            dataIndex: 'actual_mp_gst',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => (parseFloat(a.actual_mp_gst) || 0) - (parseFloat(b.actual_mp_gst) || 0),
          },
          {
            title: 'Actual TCS',
            dataIndex: 'actual_tcs',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => (parseFloat(a.actual_tcs) || 0) - (parseFloat(b.actual_tcs) || 0),
          },
          {
            title: 'TCS Leaks',
            dataIndex: 'tcs_leaks',
            align: 'center',
            width: 80,
            ellipsis: true,
            sorter: (a, b) => (parseFloat(a.tcs_leaks) || 0) - (parseFloat(b.tcs_leaks) || 0),
            render: (v) => <span style={{ color: parseFloat(v) !== 0 ? '#dc2626' : '#16a34a' }}>{v}</span>,
          },
          {
            title: 'Bank Settled Amount',
            dataIndex: 'settlement_paid_in_bank',
            align: 'center',
            width: 100,
            ellipsis: true,
            sorter: (a, b) =>
              (parseFloat(a.settlement_paid_in_bank) || 0) - (parseFloat(b.settlement_paid_in_bank) || 0),
          },
          {
            title: 'Unsettled Amount',
            dataIndex: 'unsettled_not_paid',
            align: 'center',
            width: 100,
            ellipsis: true,
            sorter: (a, b) => (parseFloat(a.unsettled_not_paid) || 0) - (parseFloat(b.unsettled_not_paid) || 0),
          },
        ]
      : []),
    {
      title: 'Ad Spend',
      dataIndex: 'adSpend',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.adSpend - b.adSpend,
    },
    {
      title: 'Taxable Value',
      dataIndex: 'taxableValue',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.taxableValue - b.taxableValue,
    },
    {
      title: 'GST to Pay',
      dataIndex: 'gst_to_pay_amount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.gst_to_pay_amount - b.gst_to_pay_amount,
    },
    {
      title: 'GST to Pay %',
      dataIndex: 'gst_to_pay_perc',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.gst_to_pay_perc - b.gst_to_pay_perc,
      render: (v) => <span>{v}%</span>,
    },
    {
      title: 'Claim Amount',
      dataIndex: 'claim_amount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.claim_amount - b.claim_amount,
    },
    {
      title: 'Expected Settlement',
      dataIndex: 'settleAmount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.settleAmount - b.settleAmount,
    },
    {
      title: 'Product Cost',
      dataIndex: 'std',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.std - b.std,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.profit - b.profit,
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
        >
          {v}
        </button>
      ),
    },
    {
      title: 'Profit %',
      dataIndex: 'profitPercent',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.profitPercent - b.profitPercent,
      render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>{v}%</span>,
    },
  ];

  useEffect(() => {
    if (columns.length && visibleColumns.length === 0) {
      setVisibleColumns(columns.map((col) => col.dataIndex || col.key || col.title));
    }
  }, [columns]);

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
          onClick={() => setVisibleColumns(columnOptions.map((c) => c.key))}
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

  const handleApply = () => {
    const payload = {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      channel: filters.channel ? { IN: [filters.channel] } : undefined,
      sku: filters.sku,
      productId: filters.productId,
      parentProductId: filters.parentId,
      mkt: filters.mkt,
      ads: filters.ads,
      gst: filters.gst,
      estimate: filters.estimate,
      expenses: filters.expenses,
      accountCharges: filters.accountCharges,
    };

    if (isReconcile) {
      dispatch(getPaymentReconcileDetailsByParentProductId(payload));
    } else {
      dispatch(getProfitDetailsByParentId(payload));
    }
    setShowFilters(false);
  };

  return (
    <>
      <main className="min-h-[600px] px-3 py-3 pb-[10px]">
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
              <div className="flex flex-wrap items-center gap-2 lg:w-full lg:justify-end md:w-full md:justify-between sm:w-full sm:justify-between">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-[35px] px-3 rounded-lg border border-[#e5e7eb] bg-white flex items-center gap-2 text-[12px] font-medium shadow-sm transition-all whitespace-nowrap"
                  >
                    <FilterOutlined style={{ fontSize: 14 }} />
                    <span>Filters</span>
                    <span className="min-w-[18px] h-[18px] rounded-full bg-[#22c55e] text-white text-[11px] font-semibold flex items-center justify-center px-1">
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

                  {showFilters && (
                    <div className="absolute right-0 top-[50px] w-[260px] max-w-[calc(100vw-24px)] bg-white border border-[#ebecef] rounded-2xl shadow-xl p-4 z-50">
                      <div className="space-y-4">
                        {[
                          ['ads', 'With Ads'],
                          ['gst', 'With GST'],
                          ['expenses', 'With Expense'],
                          ['estimate', 'With Estimate'],
                          ['accountCharges', 'With Account Charges'],
                        ].map(([key, label]) => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                              checked={filters[key] === 'with'}
                              onChange={(e) =>
                                setFilters({
                                  ...filters,
                                  [key]: e.target.checked ? 'with' : 'without',
                                })
                              }
                            />
                            <span className="text-[13px] font-medium text-[#374151]">{label}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mt-5">
                        <button
                          type="button"
                          onClick={() => setShowFilters(false)}
                          className="flex-1 h-[38px] rounded-xl border border-[#e5e7eb] text-[13px] font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <Button
                          type="primary"
                          onClick={() => {
                            handleApply();
                            setShowFilters(false);
                          }}
                          className="flex-1 h-[38px] rounded-xl text-white text-[13px] font-medium"
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
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
            scroll={{ x: isReconcile ? 1800 : 'true' }}
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-[6px]
  "
            summary={() => (
              <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 500, fontSize: '13px', color: 'black' }}>
                <Table.Summary.Cell index={0} fixed="left">
                  Total
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} fixed="left" />
                <Table.Summary.Cell index={2} fixed="left" />
                {filteredColumns
                  .filter((col) => !['image', 'channel', 'view'].includes(col.dataIndex))
                  .map((col, index) => {
                    const keyMap = {
                      netqty: 'total_netquantity',
                      returnqty: 'total_returns',
                      returnPercent: 'total_ret_percent',
                      netsales: 'netsales',
                      tcs: 'tcs',
                      shipping: 'shipping',
                      adSpend: 'adSpend',
                      taxableValue: 'taxable_value',
                      gst_to_pay_amount: 'gst_to_pay_amount',
                      gst_to_pay_perc: 'gst_to_pay_perc',
                      settleAmount: 'exp_settlement',
                      std: 'cost',
                      mpfees: 'estimatefees',
                      mp_gst: 'mp_gst',
                      profit: 'profit',
                      profitPercent: 'totalprofitmargin',
                      grossqty: 'grossqty',
                      netasp: 'netasp',
                      mrp: 'mrp',
                      mrpNetDiscount: 'mrpNetDiscount',
                      grossSales: 'grosssales',
                      accountCharges: 'accountCharges',
                      otherExpenses: 'otherExpenses',
                      grossProfit: 'grossProfit',
                      grossProfitPercent: 'grossProfitPercent',
                      percentOfSales: 'percentOfSales',
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
                      actual_fees: 'actual_fees',
                      fees_leaks: 'fees_leaks',
                      actual_shipping_charges: 'actual_shipping_charges',
                      shipping_leaks: 'shipping_leaks',
                      actual_mp_gst: 'actual_mp_gst',
                      actual_tcs: 'actual_tcs',
                      tcs_leaks: 'tcs_leaks',
                      settlement_paid_in_bank: 'settlement_paid_in_bank',
                      unsettled_not_paid: 'unsettled_not_paid',
                    };

                    const value = profitData?.totals?.[keyMap[col.dataIndex]];

                    return (
                      <Table.Summary.Cell
                        key={index}
                        index={index + 3}
                        align="center"
                        fixed={col.fixed}
                        width={col.width}
                      >
                        <div className="flex items-center justify-center min-h-[40px] whitespace-nowrap">
                          {col.key === 'action' ? (
                            <div className="w-full h-full" />
                          ) : col.dataIndex === 'profitPercent' ? (
                            <span
                              className={`text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis ${
                                Number(value) > 0
                                  ? 'text-green-600'
                                  : Number(value) < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {Number(value || 0).toFixed(2)}%
                            </span>
                          ) : (
                            <span>{value ?? 0}</span>
                          )}
                        </div>
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
      <ProfitModal
        open={detailModal.open}
        record={detailModal.record}
        type={detailModal.type}
        modalLabel={detailModal.modalLabel}
        modalValue={detailModal.modalValue}
        showExtraTabs
        onClose={() => setDetailModal({ open: false, record: null, type: '' })}
      />
    </>
  );
}
