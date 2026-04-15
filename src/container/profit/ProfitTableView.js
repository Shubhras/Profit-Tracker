import React, { useEffect } from 'react';
import { Table, Card, Button, Modal, Checkbox } from 'antd';
import { RightOutlined, CheckOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getProfitData } from '../../redux/dashboard/actionCreator';

export default function ProfitTableView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, profitData, dateRange, search } = useSelector((state) => state.dashboard);
  const totals = profitData?.totals || {};
  const [openSettings, setOpenSettings] = React.useState(false);

  const [visibleColumns, setVisibleColumns] = React.useState([
    'view',
    'qty',
    'netQty',
    'returnqty',
    'returnPercent',
    'netsales',
    'mpfees',
    'shipping',
  ]);
  const [filters, setFilters] = React.useState({
    channel: '',
    sku: '',
    productId: '',
  });
  const payload = {
    filters: {
      channel: { IN: ['Amazon-India'] },
      fromDate: dateRange?.fromDate || null,
      toDate: dateRange?.endDate || null,
      search,
    },
    // metric: {
    //   expense: 'withExpense',
    //   ads: 'withAds',
    //   account_charges: 'withAccountCharges',
    //   gst: 'withGst',
    //   payment: 'withEstimate',
    //   summarymetric: 'channel',
    // },
    pagination: {
      pageNo: 0,
      pageSize: 25,
    },
  };

  useEffect(() => {
    dispatch(getProfitData(payload));
  }, [dispatch, dateRange]);

  // console.log(data);
  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Profit',
    },
    {
      path: '',
      breadcrumbName: 'Profit Table View',
    },
  ];

  const tableData =
    profitData?.response?.map((item, index) => ({
      key: index,
      channel: item.channel1,
      view: item.grosssales,
      qty: item.grossqty,
      netQty: item.netqty,
      net_discount: item.net_discount,
      returnPercent: item.retpercent,
      netsales: item.netsales,
      netasp: item.netasp,
      mpfees: item.mpfees,
      shipping: item.shippingfees,
      adSpend: item.ads,
      gst: item.gsttopay,
      profit: item.profit,
      grossprofit: item.grossprofit,
      profitPercent: item.profitmargin,
      returnqty: item.returnqty,
      settledamount: item.profit_settled_amount,
    })) || [];

  const columns = [
    {
      title: '',
      dataIndex: 'channel',
      width: 150,
      fixed: 'left',
      render: (value) => <span>{value}</span>,
    },
    {
      title: 'View',
      dataIndex: 'view',
      align: 'center',
      sorter: (a, b) => a.view - b.view,
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      align: 'center',
      sorter: (a, b) => a.qty - b.qty,
    },
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
    {
      title: 'Net asp',
      dataIndex: 'netasp',
      align: 'center',
      sorter: (a, b) => a.netasp - b.netasp,
    },
    {
      title: 'Net discount',
      dataIndex: 'net_discount',
      align: 'center',
      sorter: (a, b) => a.net_discount - b.net_discount,
    },
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
      render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>₹{v}</span>,
    },
    {
      title: 'Profit %',
      dataIndex: 'profitPercent',
      align: 'center',
      sorter: (a, b) => a.profitPercent - b.profitPercent,
    },
    {
      title: 'Settled amount',
      dataIndex: 'settledamount',
      align: 'center',
      sorter: (a, b) => a.profit_settled_amount - b.profit_settled_amount,
    },
    {
      title: (
        <button
          type="button"
          onClick={() => setOpenSettings(true)}
          className="flex justify-center items-center w-full cursor-pointer"
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
          onClick={() => navigate(`../profittabledetails/${record.key}`)}
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
  const allColumnsList = [
    { label: 'Gross Qty', key: 'grossqty' },
    { label: 'Net Qty', key: 'netQty' },
    { label: 'Return Qty', key: 'returnqty' },
    { label: 'Return %', key: 'returnPercent' },

    { label: 'Net ASP', key: 'netasp' },
    { label: 'Net MRP', key: 'netmrp' },
    { label: 'MRP Net Discount %', key: 'mrpNetDiscount' },
    { label: 'MRP Customer Discount %', key: 'mrp_customer_discount' },

    { label: 'Gross Sales', key: 'grosssales' },
    { label: 'Net Sales', key: 'netsales' },
    { label: 'MP fees', key: 'mpfees' },
    { label: 'Shipping', key: 'shipping' },

    { label: 'Ad spend', key: 'adSpend' },
    { label: 'Std Cost', key: 'stdCost' },
    { label: 'Std Cost M/S %', key: 'stdcost_missing_percentage' },

    { label: 'Account Charges', key: 'accountCharges' },
    { label: 'Other Expenses', key: 'otherExpenses' },
    { label: 'Gst to Pay', key: 'gst' },

    { label: 'Gross Profit', key: 'grossprofit' },
    { label: 'Profit', key: 'profit' },
    { label: 'Settled Amount', key: 'settledamount' },

    { label: 'TACOS', key: 'tacos' },
    { label: 'Gross Profit %', key: 'grossProfitPercent' },
    { label: 'Profit %', key: 'profitPercent' },

    { label: '% of Sales', key: 'percentOfSales' },
    { label: 'DRR (Daily Run Rate)', key: 'drr' },
    { label: 'Last Order Date', key: 'lastOrderDate' },
  ];
  const handleSelectAll = (checked) => {
    if (checked) {
      setVisibleColumns(allColumnsList.map((col) => col.key));
    } else {
      setVisibleColumns([]);
    }
  };
  const filteredColumns = columns.filter(
    (col) => col.dataIndex === 'channel' || col.key === 'action' || visibleColumns.includes(col.dataIndex),
  );
  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => {
    console.log('APPLY FILTERS:', filters);
    // baad me API me bhej dena
  };

  const handleClear = () => {
    setFilters({
      channel: '',
      sku: '',
      productId: '',
    });
  };
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit Table"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Card bordered={false} className="sales-table-wrapper">
          {/* FILTER BAR */}
          <div className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
            {/* TOP ROW */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                onChange={(e) => handleChange('channel', e.target.value)}
              >
                <option value="">Channel</option>
                <option value="Amazon">Amazon</option>
                <option value="Myntra">Myntra</option>
              </select>

              <span className="text-sm text-gray-500">
                {filters.sku || filters.productId ? 'Filters Applied' : 'No Filters'}
              </span>

              {/* RIGHT SIDE BUTTONS */}
              <div className="ml-auto flex items-center gap-2">
                <Button onClick={handleClear} className="flex items-center gap-2">
                  Clear
                  <CloseOutlined />
                </Button>

                <Button type="primary" onClick={handleApply} className="flex items-center gap-2">
                  Apply
                  <CheckOutlined />
                </Button>
              </div>
            </div>

            {/* BOTTOM ROW */}
            <div className="flex items-end gap-4 overflow-x-auto whitespace-nowrap pb-1">
              <div className="min-w-[180px]">
                <label className="text-sm text-gray-600 mb-1 block">SKU</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  placeholder="Sku"
                  onChange={(e) => handleChange('sku', e.target.value)}
                />
              </div>

              <div className="min-w-[180px]">
                <label className="text-sm text-gray-600 mb-1 block">ProductId</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  placeholder="ProductId"
                  onChange={(e) => handleChange('productId', e.target.value)}
                />
              </div>
            </div>
          </div>
          <Table
            bordered
            columns={filteredColumns}
            dataSource={tableData}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            size="small"
            scroll={{ x: 'max-content' }}
            summary={() => (
              <Table.Summary.Row className="font-semibold bg-gray-50">
                <Table.Summary.Cell index={0} fixed="left">
                  Total
                </Table.Summary.Cell>

                {filteredColumns.slice(1).map((col, index) => {
                  if (col.key === 'action') {
                    return <Table.Summary.Cell key={index} />;
                  }

                  const keyMap = {
                    view: 'grosssales',
                    qty: 'grossqty',
                    netQty: 'netqty',
                    returnqty: 'returnqty',
                    returnPercent: 'retpercent',
                    netsales: 'netsales',
                    netasp: 'netasp',
                    net_discount: 'net_discount',
                    mpfees: 'mpfees',
                    shipping: 'shippingfees',
                    adSpend: 'ads',
                    gst: 'gsttopay',
                    grossprofit: 'grossprofit',
                    profit: 'profit',
                    profitPercent: 'profitmargin',
                    settledamount: 'profit_settled_amount',
                  };

                  const value = totals[keyMap[col.dataIndex]];

                  return (
                    <Table.Summary.Cell key={index} align="center">
                      {value !== undefined ? value : ''}
                    </Table.Summary.Cell>
                  );
                })}
              </Table.Summary.Row>
            )}
          />{' '}
        </Card>
        <Modal title="Customize Your Columns" open={openSettings} onCancel={() => setOpenSettings(false)} footer={null}>
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
              <div key={col.key} className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded">
                <Checkbox
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
                <span className="text-blue-500 text-xs cursor-pointer">i</span>
              </div>
            ))}
          </div>
        </Modal>
      </main>
    </>
  );
}
