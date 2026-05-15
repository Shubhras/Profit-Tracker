import React, { useEffect } from 'react';
import { Table, Card, Modal, Tooltip, Checkbox, Button } from 'antd';
import { EyeOutlined, SettingOutlined, FilterOutlined, SearchOutlined, BarChartOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import ProfitFilterBar from './component/ProfitFilterBar';
import ProfitModal from './component/ProfitModal';
import { getProfitDetailsByParentId } from '../../redux/dashboard/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';
import amazon from '../../assets/icons/amazon.svg';

export default function ProfitDetailsView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [openSettings, setOpenSettings] = React.useState(false);
  const [detailModal, setDetailModal] = React.useState({
    open: false,
    record: null,
    type: '',
  });
  const [selectedColumns, setSelectedColumns] = React.useState([
    'netqty',
    'returnqty',
    'returnPercent',
    'mp_gst',
    'tcs',
    'netsales',
    'shipping',
    'adSpend',
    'gst',
    'mpfees',
    'std',
    'profit',
    'profitPercent',
  ]);
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

  const channelLogoMap = {
    'Amazon-India': amazon,
  };

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Profit' },
    { path: '', breadcrumbName: 'Profit Details' },
  ];

  const apipayload = {
    filters: {
      fromDate: dateRange?.fromDate || null,
      endDate: dateRange?.endDate || null,
      channel: {
        IN: globalChannel,
      },
      parentProductId: id,
    },
    //   "metric": {
    //     "ctaaction": "(profit != 0)",
    //     "expense": "withExpense",
    //     "ads": "withAds"
    //   },
    pagination: {
      // pageNo: 0,
      // pageSize: 25,
      pageNo: pagination.current - 1,
      pageSize: pagination.pageSize,
    },
  };

  useEffect(() => {
    if (!id) return;
    dispatch(getProfitDetailsByParentId(apipayload));
  }, [id, dateRange, globalChannel, pagination]);

  const dataSource =
    profitData?.response?.map((item, index) => ({
      key: index,
      channel: 'Amazon-India',
      image: item.image,
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
      gst: item.gst,
      std: item.stdcost,
      profit: item.profit,
      profitPercent: item.grossprofitper || 0,
      grossqty: item.grossqty || 0,
      netasp: item.netasp || 0,
      mrp: item.mrp || 0,
      mrpNetDiscount: item.mrp_net_discount || 0,
      grossSales: item.grosssales || 0,
      mpfees: item.estimatefees || 0,
      accountCharges: item.account_charges || 0,
      otherExpenses: item.other_expenses || 0,
      grossProfit: item.grossprofit || 0,
      settledAmount: item.settled_amount || 0,
      tacos: item.tacos || 0,
      grossProfitPercent: item.grossprofit_percent || 0,
      percentOfSales: item.percent_of_sales || 0,
      drr: item.drr || 0,
      lastOrderDate: item.last_order_date || '',
    })) || [];

  const allColumnOptions = [
    { label: 'Description', key: 'description' },
    { label: 'Gross Qty', key: 'grossqty' },
    { label: 'Net Qty', key: 'netqty' },

    { label: 'Return Qty', key: 'returnqty' },
    { label: 'Return %', key: 'returnPercent' },
    { label: 'Net ASP', key: 'netasp' },

    { label: 'MRP', key: 'mrp' },
    { label: 'MRP Net Discount%', key: 'mrpNetDiscount' },
    { label: 'Gross Sales', key: 'grossSales' },

    { label: 'Net Sales', key: 'netsales' },
    { label: 'MP-GST', key: 'mp_gst' },
    { label: 'MP fees', key: 'mpfees' },
    { label: 'Shipping', key: 'shipping' },

    { label: 'Ad spend', key: 'adSpend' },
    { label: 'Product Cost', key: 'std' },
    { label: 'Account Charges', key: 'accountCharges' },

    { label: 'Other Expenses', key: 'otherExpenses' },
    { label: 'GST to Pay', key: 'gst' },
    { label: 'Gross Profit', key: 'grossProfit' },

    { label: 'Profit', key: 'profit' },
    { label: 'Settled Amount', key: 'settledAmount' },
    { label: 'TACOS', key: 'tacos' },

    { label: 'Gross Profit %', key: 'grossProfitPercent' },
    { label: 'Profit %', key: 'profitPercent' },
    { label: '% of Sales', key: 'percentOfSales' },

    { label: 'DRR(Daily Run Rate)', key: 'drr' },
    { label: 'Last Order Date', key: 'lastOrderDate' },
  ];

  const columns = [
    {
      title: '',
      dataIndex: 'image',
      width: 60,
      fixed: 'left',
      render: (value) => {
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
          </div>
        );
      },
    },
    {
      title: 'View',
      dataIndex: 'view',
      align: 'center',
      sorter: (a, b) => a.view - b.view,
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
              maxWidth: 80,
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
      title: 'Net Qty',
      dataIndex: 'netqty',
      align: 'center',
      sorter: (a, b) => a.netqty - b.netqty,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
            setDetailModal({ open: true, record, type: 'returns', modalLabel: 'OrderId', modalValue: record.view })
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
            setDetailModal({ open: true, record, type: 'returns', modalLabel: 'OrderId', modalValue: record.view })
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
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
          {v ?? 0}
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
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'ASIN', modalValue: record.asin })
          }
        >
          {v ?? 0}
        </button>
      ),
    },

    {
      title: 'TCS',
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
          {v ?? 0}
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
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'GST to Pay',
      dataIndex: 'gst',
      align: 'center',
      sorter: (a, b) => a.gst - b.gst,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },
    {
      title: 'Product Cost',
      dataIndex: 'std',
      align: 'center',
      sorter: (a, b) => a.std - b.std,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
        >
          {v}
        </button>
      ),
    },

    {
      title: 'Profit',
      dataIndex: 'profit',
      align: 'center',
      sorter: (a, b) => a.profit - b.profit,
      // render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>{v}</span>,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className={`cursor-pointer bg-transparent border-none font-semibold ${
            v > 0 ? 'text-green-600' : v < 0 ? 'text-red-600' : 'text-gray-600'
          }`}
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
        >
          {v}%
        </button>
      ),
    },
    {
      title: 'Gross Qty',
      dataIndex: 'grossqty',
      align: 'center',
      // render: (v) => v ?? 0,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Net ASP',
      dataIndex: 'netasp',
      align: 'center',
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      align: 'center',
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Gross Profit',
      dataIndex: 'grossProfit',
      align: 'center',
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Settled Amount',
      dataIndex: 'settledAmount',
      align: 'center',
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
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
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() =>
            setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
          }
        >
          {v ?? '-'}
        </button>
      ),
    },
    // {
    //   title: (
    //     <button
    //       type="button"
    //       onClick={() => setOpenSettings(true)}
    //       className="flex justify-center items-center w-full cursor-pointer text-black"
    //     >
    //       <SettingOutlined />
    //     </button>
    //   ),
    //   key: 'action',
    //   fixed: 'right',
    //   width: 60,
    //   render: (_, record) => (
    //     <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
    //       <button
    //         type="button"
    //         onClick={() =>
    //           setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
    //         }
    //         style={{
    //           border: '1px solid #ffc0cb',
    //           background: '#ffe4e9',
    //         }}
    //         className="w-[30px] h-[30px] rounded-[4px] cursor-pointer flex-items-center  justify-center mx-auto"
    //       >
    //         <BarChartOutlined style={{ fontSize: 14, color: '#ff4d6d' }} />
    //       </button>
    //     </div>
    //   ),
    // },
  ];
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

    dispatch(getProfitDetailsByParentId(payload));
    setShowFilters(false);
  };

  const fixedColumns = ['image', 'channel', 'view'];

  const filteredColumns = columns.filter((col) => {
    if (fixedColumns.includes(col.dataIndex)) return true; // always show
    if (!col.dataIndex) return true; // action column

    return selectedColumns.some((key) => key === col.dataIndex || key.toLowerCase() === col.dataIndex?.toLowerCase());
  });
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

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        // title={`Profit Third Table - ${id}`}
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

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-[42px] px-4 rounded-xl border border-[#e5e7eb] bg-white flex items-center gap-2 text-[13px] font-medium shadow-sm transition-all"
                >
                  <FilterOutlined style={{ fontSize: 15 }} />

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

                {showFilters && (
                  <div className="absolute right-0 top-[50px] w-[260px] bg-white border border-[#ebecef] rounded-2xl shadow-xl p-4 z-50">
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

              <button
                type="button"
                onClick={() => setOpenSettings(true)}
                className="h-[42px] px-4 rounded-xl border border-[#e5e7eb] bg-white flex items-center gap-2 text-[15px] font-medium shadow-sm transition-all"
              >
                <SettingOutlined style={{ fontSize: 14 }} />
                Manage Columns
              </button>
            </div>
          </div>

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
            summary={() => {
              const summaryItems = filteredColumns
                .filter(
                  (col) => !['image', 'channel', 'view', 'lastOrderDate', 'action'].includes(col.dataIndex || col.key),
                )
                .map((col) => {
                  const keyMap = {
                    netqty: 'total_netquantity',
                    returnqty: 'total_returns',
                    returnPercent: 'total_ret_percent',
                    netsales: 'netsales',
                    tcs: 'tcs',
                    mp_gst: 'mp_gst',
                    shipping: 'shipping',
                    adSpend: 'adSpend',
                    gst: 'gst',
                    std: 'cost',
                    mpfees: 'estimatefees',
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
                  };

                  return {
                    label: col.title,
                    dataIndex: col.dataIndex,
                    value: profitData?.totals?.[keyMap[col.dataIndex]],
                  };
                });

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={filteredColumns.length}
                      style={{
                        background: '#fff',
                        zIndex: 20,
                        minWidth: 220,
                        left: 0,
                        position: 'sticky',
                        padding: '14px',
                      }}
                    >
                      <div
                        className="
              w-full rounded-2xl border border-dashed border-[#8b5cf6]
              bg-gradient-to-r from-[#faf7ff] to-[#ffffff]
              px-4 py-1
            "
                      >
                        <div className="flex items-center gap-4 overflow-x-auto">
                          {/* Left Summary Card */}
                          <div
                            className="
                  min-w-[280px] h-[88px] rounded-2xl bg-white
                  border border-[#ede9fe]
                  flex items-center gap-3 px-4 shadow-sm
                "
                          >
                            <div
                              className="
                    w-11 h-11 rounded-xl bg-[#f3e8ff]
                    flex items-center justify-center
                  "
                            >
                              <BarChartOutlined
                                style={{
                                  color: '#7c3aed',
                                  fontSize: 18,
                                }}
                              />
                            </div>

                            <div>
                              <h3 className="text-[17px] font-semibold text-[#111827] mb-1">Total Summary</h3>

                              <p className="text-[12px] text-[#6b7280]">For selected period</p>
                            </div>
                          </div>

                          {/* Summary Metrics */}
                          <div className="flex items-stretch gap-3">
                            {summaryItems
                              .filter((item) => item.dataIndex !== 'lastOrderDate')
                              .map((item, index) => {
                                const isNegative = Number(item.value) < 0;

                                const isPercent = [
                                  'profitPercent',
                                  'grossProfitPercent',
                                  'mrpNetDiscount',
                                  'percentOfSales',
                                  'tacos',
                                  'returnPercent',
                                ].includes(item.dataIndex);

                                return (
                                  <Table.Summary.Cell
                                    key={index}
                                    index={index + 3}
                                    align="center"
                                    style={{
                                      background: '#fff',
                                      padding: '10px 8px',
                                      minWidth: 140,
                                    }}
                                  >
                                    <button
                                      type="button"
                                      className="
                            min-w-[135px] h-[88px]
                            rounded-2xl bg-white border border-[#f3f4f6]
                            px-4 py-3 flex flex-col justify-center
                            shadow-sm hover:shadow-md transition-all
                            cursor-pointer
                          "
                                      onClick={() =>
                                        setDetailModal({
                                          open: true,
                                          record: profitData?.totals,
                                          type: 'qty',
                                          modalLabel: 'OrderId',
                                          modalValue: 'Total',
                                        })
                                      }
                                    >
                                      <div
                                        className={`text-[18px] font-bold mb-1 ${
                                          isNegative
                                            ? 'text-[#ef4444]'
                                            : item.dataIndex === 'profit'
                                            ? 'text-[#16a34a]'
                                            : 'text-[#111827]'
                                        }`}
                                      >
                                        {item.value ?? 0}
                                        {isPercent ? '%' : ''}
                                      </div>

                                      <div className="text-[12px] font-medium text-[#6b7280] whitespace-nowrap">
                                        {item.label}
                                      </div>
                                    </button>
                                  </Table.Summary.Cell>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
            // summary={() => (
            //   <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
            //     <Table.Summary.Cell index={0} fixed="left">
            //       Total
            //     </Table.Summary.Cell>
            //     <Table.Summary.Cell index={1} fixed="left" />
            //     <Table.Summary.Cell index={2} fixed="left" />
            //     {filteredColumns
            //       .filter((col) => !['image', 'channel', 'view'].includes(col.dataIndex))
            //       .map((col, index) => {
            //         const keyMap = {
            //           // view: 'view',
            //           netqty: 'total_netquantity',
            //           returnqty: 'total_returns',
            //           returnPercent: 'total_ret_percent',
            //           netsales: 'netsales',
            //           tcs: 'tcs',
            //           shipping: 'shipping',
            //           adSpend: 'adSpend',
            //           gst: 'gst',
            //           std: 'cost',
            //           mpfees: 'estimatefees',
            //           profit: 'profit',
            //           profitPercent: 'totalprofitmargin',
            //           grossqty: 'grossqty',
            //           netasp: 'netasp',
            //           mrp: 'mrp',
            //           mrpNetDiscount: 'mrpNetDiscount',
            //           grossSales: 'grosssales',
            //           accountCharges: 'accountCharges',
            //           otherExpenses: 'otherExpenses',
            //           grossProfit: 'grossProfit',
            //           grossProfitPercent: 'grossProfitPercent',
            //           percentOfSales: 'percentOfSales',
            //           drr: 'drr',
            //           lastOrderDate: 'lastOrderDate',
            //         };

            //         const value = profitData?.totals?.[keyMap[col.dataIndex]];

            //         return (
            //           <Table.Summary.Cell key={index} index={index + 3} align="center" fixed={col.fixed}>
            //             {col.key === 'action' ? (
            //               <div className="flex gap-2 justify-center">
            //                 <button
            //                   type="button"
            //                   onClick={() =>
            //                     setDetailModal({
            //                       open: true,
            //                       record: profitData?.totals,
            //                       type: 'qty',
            //                       modalLabel: 'OrderId',
            //                       modalValue: 'Total',
            //                     })
            //                   }
            //                   className="w-[30px] h-[30px] border border-[#ffc0cb] rounded-[4px] bg-[#ffe4e9] flex items-center justify-center"
            //                 >
            //                   <BarChartOutlined style={{ fontSize: 14, color: '#ff4d6d' }} />
            //                 </button>
            //               </div>
            //             ) : col.dataIndex === 'profitPercent' ? (
            //               <span
            //                 className={`font-semibold ${
            //                   Number(value) > 0
            //                     ? 'text-green-600'
            //                     : Number(value) < 0
            //                     ? 'text-red-600'
            //                     : 'text-gray-600'
            //                 }`}
            //               >
            //                 {Number(value || 0).toFixed(2)}%
            //               </span>
            //             ) : (
            //               <button
            //                 type="button"
            //                 className="cursor-pointer bg-transparent border-none"
            //                 onClick={() =>
            //                   setDetailModal({
            //                     open: true,
            //                     record: profitData?.totals,
            //                     type: 'qty',
            //                     modalLabel: ' OrderId',
            //                     modalValue: 'Total',
            //                   })
            //                 }
            //               >
            //                 {value ?? 0}
            //               </button>
            //             )}
            //           </Table.Summary.Cell>
            //         );
            //       })}
            //   </Table.Summary.Row>
            // )}
          />
        </Card>
      </main>
      <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)} centered>
        <img src={previewImage} alt="preview" style={{ width: '100%', borderRadius: 8 }} />
      </Modal>
      <Modal
        title="Customize Your Columns"
        open={openSettings}
        onCancel={() => setOpenSettings(false)}
        footer={null}
        width={700}
      >
        {/* Select All */}
        <div className="mb-3 p-2 bg-gray-100 rounded flex items-center">
          <input
            type="checkbox"
            checked={selectedColumns.length === allColumnOptions.length}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedColumns(allColumnOptions.map((c) => c.key));
              } else {
                setSelectedColumns([]);
              }
            }}
          />
          <span className="ml-2 font-medium">Select All</span>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {allColumnOptions.map((col) => (
            <div
              key={col.key}
              className="flex items-center justify-between p-2 rounded bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(col.key)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedColumns((prev) => [...prev, col.key]);
                    } else {
                      setSelectedColumns((prev) => prev.filter((item) => item !== col.key));
                    }
                  }}
                />
                <span className="text-sm">{col.label}</span>
              </div>

              <span className="text-blue-500 text-xs cursor-pointer">i</span>
            </div>
          ))}
        </div>
      </Modal>
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
