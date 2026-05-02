import React, { useEffect, useState } from 'react';
import { Table, Card, Modal, Checkbox, Tooltip } from 'antd';
import { RightOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfitFilterBar from './component/ProfitFilterBar';
import ProfitModal from './component/ProfitModal';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getProfitData } from '../../redux/dashboard/actionCreator';
import amazon from '../../assets/icons/amazon.svg';
// import flipkartLogo from '../../assets/flipkart.png';

export default function ProfitTableView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, profitData, dateRange, search, channel: globalChannel } = useSelector((state) => state.dashboard);
  const totals = profitData?.totals || {};
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [openSettings, setOpenSettings] = React.useState(false);
  const [detailModal, setDetailModal] = React.useState({
    open: false,
    record: null,
    type: '',
  });

  const getLogo = (channel) => {
    if (channel?.includes('Amazon-India')) return amazon;
    // if (channel?.toLowerCase().includes('flipkart')) return flipkartLogo;
    return null;
  };

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
      ads: filters.ads ? (filters.ads === 'with' ? 'withAds' : 'withoutAds') : '',

      gst: filters.gst ? (filters.gst === 'with' ? 'withGst' : 'withoutGst') : '',

      payment: filters.estimate ? (filters.estimate === 'with' ? 'withEstimate' : 'withoutEstimate') : '',

      expense: filters.expenses ? (filters.expenses === 'with' ? 'withExpense' : 'withoutExpense') : '',

      account_charges: filters.accountCharges
        ? filters.accountCharges === 'with'
          ? 'withAccountCharges'
          : 'withoutAccountCharges'
        : '',

      // channel: 'channel',
    };
  };
  const buildPayload = () => {
    return {
      filters: {
        channel: { IN: globalChannel },
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
        search,
      },
      metric: getMetricFromFilters(),
      pagination: {
        pageNo: 0,
        pageSize: 25,
      },
    };
  };
  // useEffect(() => {
  //   dispatch(
  //     getProfitData({
  //       filters: {
  //         channel: { IN: ['Amazon-India'] },
  //         fromDate: dateRange?.fromDate || null,
  //         toDate: dateRange?.endDate || null,
  //         search,
  //       },
  //       metric: getMetricFromFilters(),
  //       pagination: {
  //         pageNo: 0,
  //         pageSize: 25,
  //       },
  //     }),
  //   );
  // }, [dispatch, dateRange]);
  useEffect(() => {
    const payload = buildPayload();
    dispatch(getProfitData(payload));
  }, [dispatch, dateRange, search, globalChannel]);

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
      channel: item.channel,
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
      stdCost: item.stdCost || 0,
      gst: item.gsttopay,
      profit: item.profit,
      grossprofit: item.grossprofit,
      profitPercent: item.profitmargin,
      returnqty: item.returnqty,
      settledamount: item.profit_settled_amount,
      grossqty: item.grossqty,
      netmrp: item.netmrp,
      mrpNetDiscount: item.mrp_net_discount,
      mrp_customer_discount: item.mrp_customer_discount,
      accountCharges: item.account_charges,
      otherExpenses: item.other_expenses,
      tacos: item.tacos,
      grossProfitPercent: item.grossprofit_percent,
      percentOfSales: item.percent_of_sales,
      drr: item.drr,
      lastOrderDate: item.last_order_date,
    })) || [];

  const columns = [
    {
      title: '',
      dataIndex: 'channel',
      width: 70,
      fixed: 'left',
      align: 'center',
      render: (value, record) => {
        if (record.key === 'total') return null;

        const logo = getLogo(value);

        return (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            {logo && <img src={logo} alt={value} style={{ width: 28, height: 28, objectFit: 'contain' }} />}
          </div>
        );
      },
    },
    {
      title: 'View',
      dataIndex: 'channel',
      align: 'center',
      sorter: (a, b) => a.channel - b.channel,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <button type="button" className="text-blue-500 cursor-pointer bg-transparent border-none">
            {v}
          </button>
        </Tooltip>
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      align: 'center',
      sorter: (a, b) => a.qty - b.qty,
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
      title: 'Net Qty',
      dataIndex: 'netQty',
      align: 'center',
      sorter: (a, b) => a.netQty - b.netQty,
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
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
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
          {v}
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
      title: 'Net asp',
      dataIndex: 'netasp',
      align: 'center',
      sorter: (a, b) => a.netasp - b.netasp,
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
      title: 'Net discount',
      dataIndex: 'net_discount',
      align: 'center',
      sorter: (a, b) => a.net_discount - b.net_discount,
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
      title: 'MP fees',
      dataIndex: 'mpfees',
      align: 'center',
      sorter: (a, b) => a.mpfees - b.mpfees,
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
          onClick={() => setDetailModal({ open: true, record, type: 'returns' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'ads' })}
        >
          {v}
        </button>
      ),
    },
    {
      title: 'Std Cost',
      dataIndex: 'stdCost',
      align: 'center',
      sorter: (a, b) => a.stdCost - b.stdCost,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() => setDetailModal({ open: true, record, type: 'stdcost' })}
        >
          {v}
        </button>
      ),
    },
    {
      title: 'GST',
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
      title: 'Gross Profit',
      dataIndex: 'grossprofit',
      align: 'center',
      sorter: (a, b) => a.grossprofit - b.grossprofit,
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
      render: (v) => <span style={{ color: v < 0 ? 'red' : 'green' }}>₹{v}</span>,
    },
    {
      title: 'Profit %',
      dataIndex: 'profitPercent',
      align: 'center',
      sorter: (a, b) => a.profitPercent - b.profitPercent,
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
      title: 'Gross Qty',
      dataIndex: 'grossqty',
      align: 'center',
      sorter: (a, b) => a.grossqty - b.grossqty,
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Net MRP',
      dataIndex: 'netmrp',
      align: 'center',
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'MRP Net Discount %',
      dataIndex: 'mrpNetDiscount',
      align: 'center',
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'MRP Customer Discount %',
      dataIndex: 'mrp_customer_discount',
      align: 'center',
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() => setDetailModal({ open: true, record, type: 'qty' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'charges' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'expenses' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'ads' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'profit' })}
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
          onClick={() => setDetailModal({ open: true, record, type: 'sales' })}
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'DRR (Daily Run Rate)',
      dataIndex: 'drr',
      align: 'center',
      render: (v, record) => (
        <button
          type="button"
          className="cursor-pointer bg-transparent border-none"
          onClick={() => setDetailModal({ open: true, record, type: 'drr' })}
        >
          {v ?? 0}
        </button>
      ),
    },
    {
      title: 'Last Order Date',
      dataIndex: 'lastOrderDate',
      align: 'center',
      render: (v) => <span>{v ?? 0}</span>, // date pe modal nahi chahiye usually
    },
    // {
    //   title: 'Settled amount',
    //   dataIndex: 'settledamount',
    //   align: 'center',
    //   sorter: (a, b) => a.profit_settled_amount - b.profit_settled_amount,
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
            onClick={() =>
              navigate('/admin/profit/profittabledetails', {
                state: { channels: [record.channel], type: 'single' },
              })
            }
            // onClick={() => navigate(`../profittabledetails/${record.channel}`)}
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
    // { label: 'Settled Amount', key: 'settledamount' },

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
  // const handleChange = (key, value) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     [key]: value,
  //   }));
  // };

  const handleApply = () => {
    const payload = buildPayload();
    dispatch(getProfitData(payload));
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
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit Table"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Card bordered={false} className="sales-table-wrapper">
          <ProfitFilterBar
            filters={filters}
            setFilters={setFilters}
            handleApply={handleApply}
            handleClear={handleClear}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
          <Table
            bordered
            columns={filteredColumns}
            dataSource={tableData}
            showSorterTooltip={false}
            loading={loading}
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
              <Table.Summary.Row className="font-semibold bg-gray-50">
                <Table.Summary.Cell index={0} fixed="left">
                  Total
                </Table.Summary.Cell>

                {filteredColumns.slice(1).map((col, index) => {
                  // if (col.key === 'action') {
                  //   return <Table.Summary.Cell key={index} />;
                  // }

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
                    stdCost: 'stdCost' || 0,
                    gst: 'gsttopay',
                    grossprofit: 'grossprofit',
                    profit: 'profit',
                    profitPercent: 'profitmargin',
                    settledamount: 'profit_settled_amount',
                    lastOrderDate: 'lastorderdate' || 0,
                  };

                  const value = totals[keyMap[col.dataIndex]];

                  return (
                    <Table.Summary.Cell key={col.key || index} index={index + 1} fixed={col.fixed} align="center">
                      {/* {value !== undefined ? value : ''} */}
                      {col.key === 'action' ? null : value ?? ''}
                    </Table.Summary.Cell>
                  );
                })}
              </Table.Summary.Row>
            )}
          />{' '}
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
      <ProfitModal
        open={detailModal.open}
        record={detailModal.record}
        type={detailModal.type}
        onClose={() => setDetailModal({ open: false, record: null, type: '' })}
      />
    </>
  );
}
