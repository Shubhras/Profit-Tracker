import React, { useEffect } from 'react';
import { Table, Card, Modal, Tooltip } from 'antd';
import { EyeOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfitFilterBar from './component/ProfitFilterBar';
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

  const { profitData, dateRange, channel: globalChannel, loading } = useSelector((state) => state.dashboard);

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
      toDate: dateRange?.toDate || null,
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
      pageNo: 0,
      pageSize: 25,
    },
  };

  useEffect(() => {
    if (!id) return;
    dispatch(getProfitDetailsByParentId(apipayload));
  }, [id, dateRange, globalChannel]);

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
      mpfees: item.mpfees || 0,
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
    { label: 'MP fees', key: 'mpfees' },
    { label: 'Shipping', key: 'shipping' },

    { label: 'Ad spend', key: 'adSpend' },
    { label: 'Std Cost', key: 'std' },
    { label: 'Account Charges', key: 'accountCharges' },

    { label: 'Other Expenses', key: 'otherExpenses' },
    { label: 'Gst to Pay', key: 'gst' },
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
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'returns' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'returns' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
        >
          {v}
        </button>
      ),
    },
    {
      title: 'GST to pay',
      dataIndex: 'gst',
      align: 'center',
      sorter: (a, b) => a.gst - b.gst,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
        >
          {v}
        </button>
      ),
    },
    {
      title: 'std cost',
      dataIndex: 'std',
      align: 'center',
      sorter: (a, b) => a.std - b.std,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
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
    },
    {
      title: 'Gross Qty',
      dataIndex: 'grossqty',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'Net ASP',
      dataIndex: 'netasp',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'MRP Net Discount%',
      dataIndex: 'mrpNetDiscount',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'Gross Sales',
      dataIndex: 'grossSales',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'MP Fees',
      dataIndex: 'mpfees',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'Account Charges',
      dataIndex: 'accountCharges',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'Other Expenses',
      dataIndex: 'otherExpenses',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'Gross Profit',
      dataIndex: 'grossProfit',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'Settled Amount',
      dataIndex: 'settledAmount',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'TACOS',
      dataIndex: 'tacos',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'Gross Profit %',
      dataIndex: 'grossProfitPercent',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: '% of Sales',
      dataIndex: 'percentOfSales',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'DRR',
      dataIndex: 'drr',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'Last Order Date',
      dataIndex: 'lastOrderDate',
      align: 'center',
      render: (v) => v || '-',
    },
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
            onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
            style={{
              width: 30,
              height: 30,
              border: '1px solid #ffc0cb',
              borderRadius: 4,
              background: '#ffe4e9', // light pink
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChartOutlined style={{ fontSize: 14, color: '#ff4d6d' }} />
          </button>
        </div>
      ),
    },
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

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        // title={`Profit Third Table - ${id}`}
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
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
            summary={() => (
              <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
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
                      shipping: 'shipping',
                      adSpend: 'adSpend',
                      gst: 'gst',
                      std: 'cost',
                      mpfees: 'mpfees',
                      profit: 'profit',
                      profitPercent: 'totalprofitmargin',
                    };

                    const value = profitData?.totals?.[keyMap[col.dataIndex]];

                    return (
                      <Table.Summary.Cell key={index} index={index + 3} align="center" fixed={col.fixed}>
                        {col.key === 'action'
                          ? null
                          : col.dataIndex === 'profitPercent'
                          ? Number(value || 0).toFixed(2)
                          : value ?? 0}
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
        onClose={() => setDetailModal({ open: false, record: null, type: '' })}
      />
    </>
  );
}
