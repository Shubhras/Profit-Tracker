import React, { useEffect } from 'react';
import { Table, Card, Modal, Tooltip, Button, Dropdown } from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  ExportOutlined,
  DownOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
// import ProfitFilterBar from './component/ProfitFilterBar';
// import ProfitModal from './component/ProfitModal'
import CalculationModal from './component/Calculations';
import { getProfitSKUId, exportProfitabilityDetails } from '../../redux/dashboard/actionCreator';
// import { PageHeader } from '../../components/page-headers/page-headers';

export default function ProfitSKUIdPage() {
  const { channel } = useParams();
  const location = useLocation();
  const decodedChannel = decodeURIComponent(channel);
  const dispatch = useDispatch();
  const { dateRange, getProfitSkuData, loading, channel: globalChannel } = useSelector((state) => state.dashboard);
  const totals = getProfitSkuData?.totals || {};
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
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

  // const [columnSearch, setColumnSearch] = React.useState('');

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

  const buildPayload = () => ({
    filters: {
      ...(debouncedSearch.trim() && {
        search: debouncedSearch.trim(),
      }),
      fromDate: dateRange?.fromDate,
      toDate: dateRange?.endDate,

      channel: {
        IN: globalChannel?.length > 0 ? globalChannel : channels,
      },

      profit_filter: profitType === 'profitable' ? 'GT_0' : profitType === 'losing' ? 'LT_0' : undefined,
    },

    pagination: {
      pageNo: pagination.current - 1,
      pageSize: pagination.pageSize,
    },
  });

  const [exportLoading, setExportLoading] = React.useState(false);
  const handleExport = async (format = 'xlsx') => {
    try {
      setExportLoading(true);
      const payload = buildPayload();
      await dispatch(exportProfitabilityDetails(payload, format, '/amazon/profitability/list/by-sku/filtered/export/'));
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
    if (decodedChannel) {
      dispatch(getProfitSKUId(buildPayload()));
    }
  }, [dateRange, decodedChannel, pagination.current, pagination.pageSize, debouncedSearch, globalChannel, channels]);

  // const PageRoutes = [
  //   { path: 'index', breadcrumbName: 'Profit' },
  //   { path: '', breadcrumbName: 'Profit Details' },
  // ];

  const dataSource = React.useMemo(() => {
    const rows =
      getProfitSkuData?.response?.map((item, index) => ({
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
        courier_return_count: item.courier_return_count,
        customer_return_count: item.customer_return_count,
        promo_discount: item.promo_discount || 0,

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
  }, [getProfitSkuData]);

  const parseAmount = (value) => {
    if (value === null || value === undefined || value === '') return 0;

    const cleaned = String(value).replace(/[₹,\s]/g, '');

    return Number(cleaned) || 0;
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
      render: (value) => {
        // if (record.key === 'total') {
        //   return <span>Total</span>;
        // }

        const logo =
          channelLogoMap[value] ||
          (value && value.toLowerCase().includes('myntra')
            ? '/icons/myntraLogo.jpg'
            : value && value.toLowerCase().includes('amazon')
            ? '/icons/amazon.svg'
            : null);

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
    // },
    {
      title: 'Gross Qty',
      dataIndex: 'netQty',
      align: 'center',
      // width: 70,
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.netQty - b.netQty,
    },
    {
      title: 'Net Qty',
      dataIndex: 'netQty',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.netQty - b.netQty,
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
      // width: 70,
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.courier_return_count - b.courier_return_count,
    },
    {
      title: 'Customer Return Count',
      dataIndex: 'customer_return_count',
      align: 'center',
      // width: 70,
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
      // width: 70,
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.promo_discount) - parseAmount(b.promo_discount),
    },
    {
      title: 'Gross Sales',
      dataIndex: 'netsales',
      align: 'center',
      // width: 70,
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.netsales) - parseAmount(b.netsales),
    },
    {
      title: 'Net Sales',
      dataIndex: 'netsales',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.netsales) - parseAmount(b.netsales),
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
    {
      title: 'MP-GST',
      dataIndex: 'mp_gst',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.mp_gst) - parseAmount(b.mp_gst),
    },

    {
      title: 'TCS',
      dataIndex: 'tcs',
      align: 'center',
      width: 100,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.tcs) - parseAmount(b.tcs),
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
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.adSpend) - parseAmount(b.adSpend),
    },

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
      title: 'Expected Settlement',
      dataIndex: 'settleAmount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.settleAmount) - parseAmount(b.settleAmount),
    },
    {
      title: 'Product Cost',
      dataIndex: 'stdcost',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => parseAmount(a.stdcost) - parseAmount(b.stdcost),
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
      width: 100,
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
      sorter: (a, b) => parseAmount(a.profitPercent) - parseAmount(b.profitPercent),
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
  ];

  return (
    <>
      <main className="min-h-[600px] px-3 pb-[30px] py-3">
        <Card bordered={false}>
          <div className="flex items-center justify-between gap-3 mb-5">
            {/* Search */}
            <div className="relative w-[220px]">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-[30px] rounded-lg border border-[#e5e7eb] bg-white pl-4 pr-10 text-[12px] outline-none shadow-sm "
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
            <div className="flex items-center gap-3">
              {/* Export Button */}
              <Dropdown menu={{ items: exportMenuItems }} trigger={['click']} placement="bottomRight">
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  loading={exportLoading}
                  className="bg-[#10b981] hover:bg-[#059669] border-none text-white font-medium px-4 h-[30px] rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  Export <DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Dropdown>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={dataSource}
            showSorterTooltip={false}
            loading={loading}
            tableLayout="fixed"
            locale={{ emptyText: 'No Data Found' }}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: getProfitSkuData?.pagination?.count || 0,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={(pag, filters, sorter, extra) => {
              if (extra.action === 'paginate') {
                setPagination({
                  current: pag.current,
                  pageSize: pag.pageSize,
                });
              }
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
                        courier_return_price: 'courier_return_price',
                        customer_return_price: 'customer_return_price',
                        courier_return_count: 'courier_return_count',
                        customer_return_count: 'customer_return_count',
                        promo_discount: 'total_promo_discount',
                      };

                      const value = totals?.[keyMap[col.dataIndex]];

                      const isPercent = ['profitPercent'].includes(col.dataIndex);

                      return (
                        <Table.Summary.Cell key={index} index={index} align="center" fixed={col.fixed}>
                          {index === 0 ? (
                            <span className="font-bold text-[13px] text-[#111827]">Total</span>
                          ) : index === 1 || col.dataIndex === 'view' || col.key === 'action' ? (
                            <div />
                          ) : (
                            <span
                              // className={`text-[13px] font-semibold ${
                              className={`text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis ${
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
