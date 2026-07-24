import React, { useEffect } from 'react';
import { Table, Card, Modal, Tooltip, Checkbox, Button, Dropdown } from 'antd';
import { EyeOutlined, FilterOutlined, SearchOutlined, ArrowLeftOutlined, SettingOutlined } from '@ant-design/icons';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import ProfitFilterBar from './component/ProfitFilterBar';
import ProfitModal from './component/ProfitModal';
import CalculationModal from './component/Calculations';
import { getProfitDetailsByParentId } from '../../redux/dashboard/actionCreator';
// import { PageHeader } from '../../components/page-headers/page-headers';
import amazon from '../../assets/icons/amazon.svg';

export default function ProfitDetailsView() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const sku = location.state?.sku || '';
  // const [openSettings, setOpenSettings] = React.useState(false);
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
  // const [selectedColumns, setSelectedColumns] = React.useState([
  //   'netqty',
  //   'returnqty',
  //   'returnPercent',
  //   'mp_gst',
  //   'tcs',
  //   'netsales',
  //   'shipping',
  //   'adSpend',
  //   'gst',
  //   'mpfees',
  //   'std',
  //   'profit',
  //   'profitPercent',
  // ]);
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

  const channelLogoMap = {
    'Amazon-India': amazon,
  };

  // const PageRoutes = [
  //   { path: 'index', breadcrumbName: 'Profit' },
  //   { path: '', breadcrumbName: 'Profit Details' },
  // ];

  const apipayload = {
    filters: {
      fromDate: dateRange?.fromDate || null,
      endDate: dateRange?.endDate || null,
      channel: {
        IN: globalChannel,
      },
      parentProductId: id,
      sku,
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
    })) || [];

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
      width: 70,
      ellipsis: true,
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
      // render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>{v}</span>,
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
    {
      title: 'Profit %',
      dataIndex: 'profitPercent',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.profitPercent - b.profitPercent,
      render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>{v}%</span>,
    },
    // {
    //   title: 'Gross Qty',
    //   dataIndex: 'grossqty',
    //   align: 'center',
    //   // render: (v) => v ?? 0,
    //   render: (v, record) => (
    //     <button
    //       type="button"
    //       className="cursor-pointer bg-transparent border-none"
    //       onClick={() =>
    //         setDetailModal({ open: true, record, type: 'qty', modalLabel: 'OrderId', modalValue: record.view })
    //       }
    //     >
    //       {v ?? 0}
    //     </button>
    //   ),
    // },

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

  useEffect(() => {
    if (columns.length && visibleColumns.length === 0) {
      setVisibleColumns(columns.map((col) => col.dataIndex || col.key || col.title));
    }
  }, [columns]);

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

    dispatch(getProfitDetailsByParentId(payload));
    setShowFilters(false);
  };

  return (
    <>
      <main className="min-h-[600px] px-3 py-3 pb-[10px]">
        <Card bordered={false}>
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-[35px] h-[35px] rounded-xl border border-[#dbe1e8] bg-white flex items-center justify-center hover:bg-[#f8fafc] transition-all duration-200 shadow-sm"
            >
              <ArrowLeftOutlined className="text-[#374151]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative w-[220px]">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-[35px] rounded-xl border border-[#e5e7eb] bg-white pl-4 pr-10 text-[12px] outline-none shadow-sm"
                />

                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                  <SearchOutlined style={{ fontSize: 14 }} />
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilters(!showFilters)}
                    className="h-[35px] px-2 rounded-xl border border-[#e5e7eb] bg-white flex items-center gap-2 text-[12px] font-medium shadow-sm transition-all"
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
                <Dropdown trigger={['click']} dropdownRender={() => manageColumnsDropdown} placement="bottomRight">
                  <Button
                    icon={<SettingOutlined />}
                    className="flex items-center !h-[35px] !rounded-xl !border-[#e5e7eb]"
                  >
                    Manage Columns
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
              setPagination(pag);
            }}
            size="small"
            scroll={{ x: 'true' }}
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
                      // view: 'view',
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
                              // className={`font-semibold ${
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
