import React, { useEffect } from 'react';
import { Table, Card, Modal, Checkbox, Tooltip } from 'antd';
import { RightOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfitFilterBar from './component/ProfitFilterBar';
import amazon from '../../assets/icons/amazon.svg';
// import flipkart from "../../assets/icons/flipkart.png";
import { getProfitDetails } from '../../redux/dashboard/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function ProfitDetailsView() {
  const { channel } = useParams();
  const decodedChannel = decodeURIComponent(channel);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dateRange, profitData, loading } = useSelector((state) => state.dashboard);
  const totals = profitData?.totals || {};
  const [openSettings, setOpenSettings] = React.useState(false);

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
          IN: [decodedChannel],
          // IN: globalChannel,
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
      render: (value, record) => {
        if (record.key === 'total') {
          return <span>Total</span>;
        }

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
      // render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>₹{v}</span>,
    },
    {
      title: 'Profit %',
      dataIndex: 'profitPercent',
      align: 'center',
      sorter: (a, b) => a.profitPercent - b.profitPercent,
      render: (v) => {
        const value = Math.round(v || 0);

        return <span style={{ color: value < 0 ? 'red' : 'green' }}>{value}%</span>;
      },
    },
    {
      title: 'Gross Qty',
      dataIndex: 'grossqty',
      align: 'center',
      render: (v) => v ?? 0,
    },
    {
      title: 'Net MRP',
      dataIndex: 'netmrp',
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
      title: 'MRP Customer Discount%',
      dataIndex: 'mrpCustomerDiscount',
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
        <button
          type="button"
          onClick={() => navigate(`../profitThirdtable/${record.asin}`)}
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
    { key: 'mpfees', label: 'MP fees' },

    { key: 'shipping', label: 'Shipping' },
    { key: 'adSpend', label: 'Ad spend' },
    { key: 'stdCost', label: 'Std Cost' },

    { key: 'stdCostMS', label: 'Std Cost M/S %' },
    { key: 'accountCharges', label: 'Account Charges' },
    { key: 'otherExpenses', label: 'Other Expenses' },

    { key: 'gst', label: 'Gst to Pay' },
    { key: 'grossprofit', label: 'Gross Profit' },
    { key: 'profit', label: 'Profit' },

    { key: 'settledAmount', label: 'Settled Amount' },
    { key: 'tacos', label: 'TACOS' },
    { key: 'grossProfitPercent', label: 'Gross Profit %' },

    { key: 'profitPercent', label: 'Profit %' },
    { key: 'percentOfSales', label: '% of Sales' },
    { key: 'drr', label: 'DRR (Daily Run Rate)' },

    { key: 'lastOrderDate', label: 'Last Order Date' },
  ];
  const [visibleColumns, setVisibleColumns] = React.useState([
    'view',
    'netQty',
    'returnqty',
    'returnPercent',
    'netsales',
    'mpfees',
    'shipping',
    'adSpend',
    'gst',
    'grossprofit',
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
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={(pag) => {
              setPagination(pag);
            }}
            size="small"
            scroll={{ x: 'max-content' }}
            summary={() => (
              <Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
                <Table.Summary.Cell index={0} colSpan={2}>
                  Total
                </Table.Summary.Cell>

                {filteredColumns.slice(2).map((col, index) => {
                  if (col.key === 'action') return <Table.Summary.Cell key={index} />;

                  const keyMap = {
                    netQty: 'netqty',
                    returnqty: 'totalreturn',
                    returnPercent: 'totalreturnper',
                    netsales: 'netsales',
                    mpfees: 'mpfees',
                    shipping: 'shippingfees',
                    adSpend: 'ads',
                    gst: 'totalgst',
                    grossprofit: 'grossprofit',
                    profit: 'profit',
                    profitPercent: 'grossprofitper',

                    grossqty: 'grossqty',
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

                  const value = totals[keyMap[col.dataIndex]];

                  return (
                    <Table.Summary.Cell key={index} align="center">
                      {value ?? 0}
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
    </>
  );
}
