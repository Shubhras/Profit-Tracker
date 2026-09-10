import React, { useEffect, useCallback } from 'react';
import { Row, Col, Spin } from 'antd';
import {
  ShoppingCartOutlined,
  RiseOutlined,
  FileDoneOutlined,
  FileExclamationOutlined,
  NotificationOutlined,
  InboxOutlined,
  ReloadOutlined,
  CarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { amazonAction } from '../../redux/amazonAPI/actionCreator';
import { getDashboard } from '../../redux/dashboard/actionCreator';

const parseOverviewCurrency = (val) => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
};

const formatSalesOverviewUnits = (qty, mode) => {
  const num = Math.abs(parseInt(qty, 10) || 0);
  if (mode === 'negative') {
    return `-${num}`;
  }
  if (mode === 'positive_sign') {
    return `+${num}`;
  }
  return `${num}`;
};

const formatSalesOverviewAmount = (val, mode) => {
  const num = parseOverviewCurrency(val);
  const absNum = Math.abs(num);
  const formattedAbs = absNum === 0 ? '0.0' : absNum.toFixed(2);

  if (mode === 'negative') {
    return `-₹${formattedAbs}`;
  }
  if (mode === 'positive_sign') {
    return `+₹${formattedAbs}`;
  }
  if (mode === 'net') {
    return num < 0 ? `-₹${formattedAbs}` : `₹${formattedAbs}`;
  }
  return `₹${formattedAbs}`;
};

const formatCirclePercent = (val) => {
  if (val === null || val === undefined || Number.isNaN(val) || val === 0) return '0%';
  if (val === 100) return '100%';
  return `${val.toFixed(2)}%`;
};

export default function Summary() {
  // const path = '/admin';
  const navigate = useNavigate();
  // const [viewType, setViewType] = useState('percentage');
  // const [viewTypes, setViewTypes] = useState({
  //   'Quantity Sold': 'percentage',
  //   Return: 'percentage',
  //   Shipping: 'percentage',
  //   Profit: 'percentage',
  // });
  const { dashboardData, dateRange, channel: globalChannel, search, loading } = useSelector((state) => state.dashboard);
  // const [amazonParams, setAmazonParams] = useState({
  //   callbackUri: '',
  //   state: '',
  //   sellingPartnerId: '',
  // });
  const location = useLocation();
  const dispatch = useDispatch();
  // const [showFilters, setShowFilters] = useState(false);
  // const gstLabel = appliedFilters.withGST ? 'GST Included' : 'GST Excluded';
  // const buildMetric = (filtersData) => {
  //   return {
  //     ads: filtersData.withAds ? 'withAds' : 'withoutAds',
  //     gst: filtersData.withGST ? 'withGst' : 'withoutGst',
  //     expense: filtersData.withExpenses ? 'withExpense' : 'withoutExpense',
  //     estimate: filtersData.withEstimate ? 'withEstimate' : 'withoutEstimate',
  //   };
  // };

  const payload = {
    filters: {
      channel: {
        IN: globalChannel,
      },
      fromDate: dateRange?.fromDate || null,
      toDate: dateRange?.endDate || null,
      search,
    },
    // metric: buildMetric(appliedFilters),
  };

  useEffect(() => {
    dispatch(getDashboard(payload));
  }, [dispatch, dateRange, globalChannel]);

  const loginAmazon = useCallback(
    (params) => {
      dispatch(amazonAction(params));
    },
    [dispatch],
  );

  // const connectAmazon = () => {
  //   window.location.href = 'http://192.168.1.10:8000/amazon/connect';
  // };

  // const getAuthCodAmazon = () => {
  //   const callbackUri = encodeURIComponent('http://localhost:3001/admin/profit/summary'); // your frontend callback
  //   const state = Math.random().toString(36).substring(2); // random state for security
  //   const sellingPartnerId = '1234567'; // replace with actual seller ID if needed
  //   window.location.href = `http://192.168.1.10:8000/amazon/login/?amazon_callback_uri=${callbackUri}&amazon_state=${state}&selling_partner_id=${sellingPartnerId}`;
  //   // window.location.href = `http://192.168.1.10:8000/api/amazon/login/?amazon_callback_uri=${callbackUri}&amazon_state=${state}&selling_partner_id=${sellingPartnerId}`;
  // };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const amazonCallbackUri = searchParams.get('amazon_callback_uri');
    const amazonState = searchParams.get('amazon_state');
    const sellingPartnerId = searchParams.get('selling_partner_id');
    const stateNew = searchParams.get('state');
    const spapiOauthCode = searchParams.get('spapi_oauth_code');

    if (amazonCallbackUri || amazonState || sellingPartnerId) {
      // setAmazonParams({
      //   callbackUri: amazonCallbackUri || '',
      //   state: amazonState || '',
      //   sellingPartnerId: sellingPartnerId || '',
      // });
      // console.log('Amazon Callback URI:', amazonCallbackUri);
      // console.log('Amazon State:', amazonState);
      // console.log('Selling Partner ID:', sellingPartnerId);
    }

    if (amazonState && stateNew && spapiOauthCode) {
      loginAmazon({ state: stateNew, spapi_oauth_code: spapiOauthCode });
    }
  }, [location, loginAmazon]);

  // const PageRoutes = [
  //   { path: 'index', breadcrumbName: 'Profit' },
  //   { path: '', breadcrumbName: 'Summary' },
  // ];
  // const handleViewTypeChange = (title, value) => {
  //   setViewTypes((prev) => ({
  //     ...prev,
  //     [title]: value,
  //   }));
  // };

  /* ---------- RIGHT STACKED CHART ---------- */
  // const stackedData = [
  //   { date: '01/01', cancelled: 0, rto: 0, returned: 0 },
  //   { date: '02/01', cancelled: 0, rto: 0, returned: 0 },
  //   { date: '03/01', cancelled: 0, rto: 0, returned: 0 },
  //   { date: '04/01', cancelled: 0, rto: 0, returned: 0 },
  //   { date: '05/01', cancelled: 0, rto: 0, returned: 0 },
  //   { date: '06/01', cancelled: 0, rto: 0, returned: 0 },
  //   { date: '07/01', cancelled: 0, rto: 0, returned: 0 },
  // ];

  // const bottomChartData = [
  //   { name: 'North', value: 0 },
  //   { name: 'South', value: 0 },
  //   { name: 'East', value: 0 },
  //   { name: 'West', value: 0 },
  // ];
  const stackedData =
    dashboardData?.trends?.map((item) => ({
      date: item.date,
      sales: item.sales || 0,
      qty: item.qty || 0,
      profit: item.estimated_profit || 0,
    })) || [];

  // const bottomChartData = dashboardData?.geography?.length
  //   ? dashboardData.geography
  //       .map((item) => ({
  //         name: item.id || 'Unknown',
  //         value: Number(item.revenue) || 0,
  //         qty: Number(item.grossqty) || 0,
  //       }))
  //       .sort((a, b) => b.value - a.value)
  //       .slice(0, 4)
  //   : [];
  return (
    <>
      {/* <PageHeader
        routes={PageRoutes}
        title={
        
        }
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-2 sm:pb-[30px] bg-transparent sm:flex-col"
      /> */}

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-4 xl:px-[15px] pb-[10px] bg-transparent py-3">
        <div className="flex items-start gap-3 mt-2 mb-3">
          <div
            className="w-[35px] h-[35px] rounded-xl flex items-center justify-center shadow-sm mt-1"
            style={{
              background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(15, 118, 110) 100%)',
            }}
          >
            <BarChartOutlined className="text-white text-[20px]" />
          </div>

          <div>
            <h1 className="text-[20px] font-bold text-[#111827] leading-none mb-0">Profit Summary</h1>

            <p className="text-[13px] text-gray-500 font-medium mb-0">
              Track sales, profit, returns & performance insights
            </p>
          </div>
        </div>
        {/* ================= FILTER BAR ================= */}
        {/* <Card className="mb-4">
          <Row gutter={16} align="middle">
            <Col>
              <Checkbox
                checked={filters.withAds}
                onChange={(e) => setFilters({ ...filters, withAds: e.target.checked })}
              >
                With Ads
              </Checkbox>{' '}
            </Col>
            <Col>
              <Checkbox
                checked={filters.withGST}
                onChange={(e) => setFilters({ ...filters, withGST: e.target.checked })}
              >
                With GST
              </Checkbox>{' '}
            </Col>
            <Col>
              <Checkbox
                checked={filters.withEstimate}
                onChange={(e) => setFilters({ ...filters, withEstimate: e.target.checked })}
              >
                With Estimate
              </Checkbox>{' '}
            </Col>
            <Col>
              <Checkbox
                checked={filters.withExpenses}
                onChange={(e) => setFilters({ ...filters, withExpenses: e.target.checked })}
              >
                With Expenses
              </Checkbox>{' '}
            </Col> */}
        {/* <Col>
              <Button type="primary" onClick={connectAmazon}>
                Connect Amazon
              </Button>
            </Col> */}
        {/* <Col>
              <Button type="primary" onClick={getAuthCodAmazon}>
                Login Amazon
              </Button>
            </Col> */}

        {/* <Card className="mb-4 border rounded-xl px-0 py-0 bg-[#f9fafb]">
          <button
            type="button"
            className="flex items-center justify-between gap-4 mb-0 text-sm w-full"
          >
            <span className="text-gray-500">{selectedFilters.length} Filter Selected</span>

            {selectedFilters.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{item.label}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-4">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="flex items-center gap-1"
              >
                <span>Clear</span>
                <CloseOutlined className="text-gray-500" />
              </Button>

              <Button
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApply();
                }}
                className="flex items-center gap-1"
              >
                <span>Apply</span>
                <CheckOutlined />
              </Button>
              <Button
                type="text"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilters((prev) => !prev);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                {showFilters ? (
                  <CaretUpOutlined className="text-[#0B3A6E] text-xs leading-none" />
                ) : (
                  <CaretDownOutlined className="text-[#0B3A6E] text-xs leading-none" />
                )}
              </Button>
            </div>
          </button>

          {showFilters && (
            <>
              <div className="flex items-end gap-3 mb-3 flex-nowrap mt-3">
                {[
                  { label: 'SKU', key: 'sku', placeholder: 'Sku' },
                  { label: 'ProductId', key: 'productId', placeholder: 'ProductId' },
                  { label: 'ParentId', key: 'parentId', placeholder: 'ParentId' },
                ].map((item) => (
                  <div key={item.key} className="flex flex-col w-[160px]">
                    <span className="text-s text-gray-500 mb-1">{item.label}:</span>
                    <Input
                      size="small"
                      placeholder={item.placeholder}
                      value={filters[item.key]}
                      onChange={(e) => setFilters({ ...filters, [item.key]: e.target.value })}
                    />
                  </div>
                ))}

                <div className="flex flex-col w-[160px]">
                  <span className="text-s text-gray-500 mb-1">MKT category:</span>
                  <Select
                    size="small"
                    placeholder="MktCategory"
                    value={filters.mktCategory}
                    onChange={(val) => setFilters({ ...filters, mktCategory: val })}
                  >
                    <Option value="cat1">Category 1</Option>
                  </Select>
                </div>

                <div className="flex flex-col w-[160px]">
                  <span className="text-s text-gray-500 mb-1">Inv MasterSku:</span>
                  <Input
                    size="small"
                    placeholder="Inv mastersku"
                    value={filters.invMasterSku}
                    onChange={(e) => setFilters({ ...filters, invMasterSku: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] leading-none">
                {' '}
                <div className="flex gap-1 items-center text-xs">
                  <Checkbox
                    checked={filters.withAds}
                    onChange={() => setFilters({ ...filters, withAds: true, withoutAds: false })}
                  >
                    With Ads
                  </Checkbox>

                  <Checkbox
                    checked={filters.withoutAds}
                    onChange={() => setFilters({ ...filters, withAds: false, withoutAds: true })}
                  >
                    Without Ads
                  </Checkbox>
                </div>
                <div className="flex gap-[2px] items-center text-[11px]">
                  {' '}
                  <Checkbox
                    checked={filters.withGST}
                    onChange={() => setFilters({ ...filters, withGST: true, withoutGST: false })}
                  >
                    With Gst
                  </Checkbox>
                  <Checkbox
                    checked={filters.withoutGST}
                    onChange={() => setFilters({ ...filters, withGST: false, withoutGST: true })}
                  >
                    Without Gst
                  </Checkbox>
                </div>
                <div className="flex gap-[2px] items-center text-[11px]">
                  {' '}
                  <Checkbox
                    checked={filters.withEstimate}
                    onChange={() =>
                      setFilters({
                        ...filters,
                        withEstimate: true,
                        withoutEstimate: false,
                      })
                    }
                  >
                    With Estimate
                  </Checkbox>
                  <Checkbox
                    checked={filters.withoutEstimate}
                    onChange={() =>
                      setFilters({
                        ...filters,
                        withEstimate: false,
                        withoutEstimate: true,
                      })
                    }
                  >
                    Without Estimate
                  </Checkbox>
                </div>
                <div className="flex gap-[2px] items-center text-[11px]">
                  {' '}
                  <Checkbox
                    checked={filters.withExpenses}
                    onChange={() =>
                      setFilters({
                        ...filters,
                        withExpenses: true,
                        withoutExpenses: false,
                      })
                    }
                  >
                    With Expenses
                  </Checkbox>
                  <Checkbox
                    checked={filters.withoutExpenses}
                    onChange={() =>
                      setFilters({
                        ...filters,
                        withExpenses: false,
                        withoutExpenses: true,
                      })
                    }
                  >
                    Without Expenses
                  </Checkbox>
                </div>
              </div>
            </>
          )}
        </Card> */}

        {/* <Spin spinning={loading} size="large">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={9}>
              <Card
                onClick={() =>
                  navigate('/admin/profit/profitTableView/details', {
                    state: { channels: globalChannel, type: 'all' },
                  })
                }
                hoverable
                style={{ cursor: 'pointer' }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Sales</span>

                  <Tag color={appliedFilters.withGST ? 'green' : 'red'}>{gstLabel}</Tag>
                </div>
                <Statistic value={dashboardData?.header_metrics?.sales || 0} prefix="₹" />{' '}
                <Tag color="blue" className="mt-2">
                  Units: {dashboardData?.breakdown_table?.net?.qty || 0}
                </Tag>
                <Divider />
                <Row className="font-semibold mb-1">
                  <Col span={10} />
                  <Col span={7} className="text-center">
                    Qty
                  </Col>
                  <Col span={7} className="text-right">
                    Sales
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Gross</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.gross?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    {dashboardData?.breakdown_table?.gross?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Cancelled</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.cancelled?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    {dashboardData?.breakdown_table?.cancelled?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Returned(RTO)</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.returned?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    {dashboardData?.breakdown_table?.returned?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Cancelled(RTO)</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.cancelledrtosummaryqty?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    {dashboardData?.breakdown_table?.cancelledrtosummarysales?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Returned(CReF)</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.creturnsummaryqty?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    {dashboardData?.breakdown_table?.returnedcref?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Claimed</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.claim?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    {dashboardData?.breakdown_table?.claim?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Standard Cost</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.claimqty?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    {dashboardData?.breakdown_table?.claimsales?.amount || 0}
                  </Col>
                </Row>
                <Divider className="mt-2" />
                <Row>
                  <Col span={10}>
                    <strong>Net</strong>
                  </Col>
                  <Col span={7} className="text-center">
                    <strong>{dashboardData?.breakdown_table?.net?.qty || 0}</strong>
                  </Col>
                  <Col span={7} className="text-right">
                    <strong>{dashboardData?.breakdown_table?.net?.amount || 0}</strong>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col xs={24} lg={6}>
              <Card
        
              >
                <Statistic title="Profit" value={dashboardData?.header_metrics?.profit || 0} prefix="₹" />
                <Tag color="gold">Margin: {dashboardData?.header_metrics?.margin || '0%'}</Tag>
                <Tag color="green">ROI: {dashboardData?.header_metrics?.roi || '0%'}</Tag>
              </Card>

              <Row gutter={8} className="mt-1">
                <Col
                  span={12}
                  onClick={() =>
                    navigate('/admin/profit/profitTableView/details', {
                      state: { channels: globalChannel, type: 'all', profitType: 'profitable' },
                    })
                  }
                  hoverable
                  style={{ cursor: 'pointer' }}
                >
                  <Card size="small" className="bg-green-50">
                    <p className="text-green-700">Profit IDs</p>
                    <strong>#{dashboardData?.top_orders?.profitable?.total_count || 0}</strong>

                    <p>{dashboardData?.top_orders?.profitable?.total_amount || 0}</p>
                  </Card>
                </Col>
                <Col
                  span={12}
                  onClick={() =>
                    navigate('/admin/profit/profitTableView/details', {
                      state: { channels: globalChannel, type: 'all', profitType: 'losing' },
                    })
                  }
                  hoverable
                  style={{ cursor: 'pointer' }}
                >
                  <Card size="small" className="bg-red-50">
                    <p className="text-red-600">Loss IDs</p>
                    <strong>#{dashboardData?.top_orders?.losing?.total_count || 0}</strong>

                    <p>{dashboardData?.top_orders?.losing?.total_amount || 0}</p>
                  </Card>
                </Col>
              </Row>
              <Card size="small" className="mt-1 py-0">
                <div>
                  <Statistic
                    title="Ad Spend"
                    value={dashboardData?.header_metrics?.ad_spend || 0}
                    prefix="₹"
                  />
                </div>

                <Tag color="magenta" className="mt-1 w-fit">
                  TACOS: {dashboardData?.header_metrics?.tacos || '0%'}
                </Tag>
              </Card>
            </Col>


            <Col xs={24} lg={9}>
              <Card>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stackedData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" stackId="a" fill="#f28b82" />
                    <Bar dataKey="qty" stackId="a" fill="#a7f3a0" />
                    <Bar dataKey="profit" stackId="a" fill="#fbc687" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </Spin> */}

        {/* <Row gutter={[16, 16]} className="mt-6">
          {['Quantity Sold', 'Return', 'Shipping', 'Profit'].map((title) => (
            <Col xs={24} lg={6} key={title}>
              <Card
                title={title}
                extra={
                  <Select
                    size="small"
                    value={viewTypes[title]}
                    onChange={(value) => handleViewTypeChange(title, value)}
                    style={{ width: 120 }}
                  >
                    <Option value="percentage">Percentage</Option>
                    <Option value="amount">Amount</Option>
                  </Select>
                }
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={bottomChartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          ))}
        </Row> */}

        <Spin spinning={loading} size="large">
          <Row gutter={[18, 8]}>
            {/* ================= LEFT SECTION ================= */}
            <Col xs={24} lg={14}>
              <Row gutter={[18, 18]}>
                {/* ================= SALES CARD ================= */}
                <Col xs={24} md={12}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate('/admin/profit/profitTableView/details', {
                        state: { channels: globalChannel, type: 'all' },
                      })
                    }
                    className="relative overflow-hidden rounded-[20px] bg-white p-3 shadow-sm w-full text-left border-0 h-[140px]"
                  >
                    <div className="flex items-start gap-3">
                      {/* ICON */}
                      <div className="w-9 h-9 rounded-xl mt-[2px] bg-[#eef2ff] flex items-center justify-center shadow-sm shrink-0">
                        <ShoppingCartOutlined className="text-[#4f46e5] text-[16px]" />
                      </div>

                      {/* CONTENT */}
                      <div className="flex flex-col justify-start flex-1 pt-[2px]">
                        <p className="text-gray-500 text-[14px] font-semibold leading-none mb-3">Net Sales</p>

                        <h2 className="text-[19px] font-semibold leading-tight text-[#111827] mt-[2px]">
                          {' '}
                          ₹ {dashboardData?.header_metrics?.sales || 0}
                        </h2>

                        <div className="mt-2 inline-flex w-fit items-center px-2 py-[3px] rounded-lg bg-[#dcfce780] border border-[#bbf7d0] text-[#166534] text-[10px] font-semibold whitespace-nowrap">
                          Units: {dashboardData?.breakdown_table?.net?.qty || 0}
                        </div>
                      </div>
                    </div>
                  </button>
                </Col>

                {/* ================= PROFIT CARD ================= */}
                <Col xs={24} md={12}>
                  <div className="relative overflow-hidden rounded-[20px] bg-white p-3 shadow-sm h-[140px]">
                    <div className="flex items-start gap-3 mt-3">
                      {/* ICON */}
                      <div className="w-9 h-9 rounded-xl mt-[2px] bg-[#ecfdf5] flex items-center justify-center shadow-sm shrink-0">
                        <RiseOutlined className="text-[#10b981] text-[16px]" />
                      </div>

                      {/* CONTENT */}
                      <div className="flex flex-col justify-start flex-1 pt-[2px]">
                        <p className="text-gray-500 text-[14px] font-semibold leading-none mb-3">Total Profit</p>

                        <h2 className="text-[19px] font-semibold leading-tight text-[#111827] mt-[2px]">
                          {' '}
                          ₹ {dashboardData?.header_metrics?.profit || 0}
                        </h2>

                        <div className="flex items-center gap-1 mt-2">
                          <div className="inline-flex items-center px-2 py-[2px] rounded-lg bg-[#dcfce780] border border-[#bbf7d0] text-[#166534] text-[10px] font-semibold whitespace-nowrap">
                            Margin: {dashboardData?.header_metrics?.margin || '0%'}
                          </div>

                          <div className="inline-flex items-center px-2 py-[2px] rounded-lg bg-[#dcfce780] border border-[#bbf7d0] text-[#166534] text-[10px] font-semibold whitespace-nowrap">
                            ROI: {dashboardData?.header_metrics?.roi || '0%'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* ================= SMALL CARDS ================= */}
                <Col xs={24}>
                  <Row gutter={[18, 18]}>
                    {/* PROFIT IDS */}
                    <Col xs={24} md={8}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate('/admin/profit/profitTableView/sku-profit', {
                            state: {
                              channels: globalChannel,
                              type: 'all',
                              profitType: 'profitable',
                            },
                          })
                        }
                        className="bg-white rounded-[22px] p-5 border border-[#edf0f7] shadow-sm w-full text-left"
                        style={{
                          background: 'linear-gradient(135deg, #f4fff8 0%, #ecfdf3 100%)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-2xl bg-[#dcfce7] flex items-center justify-center">
                            <FileDoneOutlined className="text-[#16a34a] text-[20px]" />
                          </div>

                          <p className="text-[13px] font-semibold text-[#16a34a]">Profit SKU IDs</p>
                        </div>

                        <h2 className="text-[19px] font-semibold mb-1 text-[#111827]">
                          {dashboardData?.top_orders?.profitable?.total_count || 0}
                        </h2>

                        <p className="text-[#4b5563] text-[13px]">
                          {dashboardData?.top_orders?.profitable?.total_amount || 0}
                        </p>
                      </button>
                    </Col>

                    {/* LOSS IDS */}
                    <Col xs={24} md={8}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate('/admin/profit/profitTableView/sku-profit', {
                            state: {
                              channels: globalChannel,
                              type: 'all',
                              profitType: 'losing',
                            },
                          })
                        }
                        className="bg-white rounded-[22px] p-5 border border-[#edf0f7] shadow-sm w-full text-left"
                        style={{
                          background: 'linear-gradient(135deg, #fff7f7 0%, #fff1f2 100%)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-2xl bg-[#fee2e2] flex items-center justify-center">
                            <FileExclamationOutlined className="text-[#ef4444] text-[20px]" />
                          </div>

                          <p className="text-[13px] font-semibold text-[#ef4444]">Loss SKU IDs</p>
                        </div>

                        <h2 className="text-[19px] font-semibold mb-1 text-[#111827]">
                          {dashboardData?.top_orders?.losing?.total_count || 0}
                        </h2>

                        <p className="text-[#4b5563] text-[13px]">
                          {dashboardData?.top_orders?.losing?.total_amount || 0}
                        </p>
                      </button>
                    </Col>

                    {/* AD SPEND */}
                    <Col xs={24} md={8}>
                      <div
                        className="bg-white rounded-[22px] p-5 border border-[#edf0f7] shadow-sm h-full"
                        style={{
                          background: 'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 100%)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-2xl bg-[#ede9fe] flex items-center justify-center">
                            <NotificationOutlined className="text-[#7c3aed] text-[20px]" />
                          </div>

                          <p className="text-[13px] font-semibold text-[#111827]">Ad Spend</p>
                        </div>

                        <h2 className="text-[19px] font-semibold mb-1 text-[#111827]">
                          {dashboardData?.header_metrics?.ad_spend || 0}
                        </h2>

                        <div className="inline-flex mt-0 px-3 py-1 rounded-lg bg-[#fdf2f8] text-[#db2777] text-[12px]">
                          TACOS: {dashboardData?.header_metrics?.tacos || '0%'}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>

            <Col xs={24} lg={10} className="flex flex-col">
              <div className="bg-white rounded-[22px] border border-[#edf0f7] shadow-sm p-3.5 sm:p-4 h-full flex flex-col justify-between">
                <div>
                  {/* HEADER */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#ede9fe] flex items-center justify-center text-[#7c3aed] shrink-0">
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>

                    <h3 className="text-[17px] font-bold text-[#111827] tracking-tight mb-0">Sales Overview</h3>
                  </div>

                  {/* SINGLE TABLE */}
                  <div>
                    <div className="grid grid-cols-12 bg-[#f8fafc] rounded-xl px-3.5 py-1.5 text-[12px] font-bold text-[#111827] mb-1">
                      <span className="col-span-6">Category</span>
                      <span className="col-span-3 text-center">Units</span>
                      <span className="col-span-3 text-right">Amount</span>
                    </div>

                    {[
                      {
                        label: 'Total Sales (Gross)',
                        qty: dashboardData?.breakdown_table?.gross?.qty,
                        amount: dashboardData?.breakdown_table?.gross?.amount,
                        mode: 'gross',
                      },
                      {
                        label: 'Order Cancellations',
                        qty: dashboardData?.breakdown_table?.cancelled?.qty,
                        amount: dashboardData?.breakdown_table?.cancelled?.amount,
                        mode: 'negative',
                      },
                      {
                        label: 'Courier Returns (RTO)',
                        qty:
                          dashboardData?.breakdown_table?.returned_courier?.qty ??
                          dashboardData?.breakdown_table?.['returned(RTO)']?.qty,
                        amount:
                          dashboardData?.breakdown_table?.returned_courier?.amount ??
                          dashboardData?.breakdown_table?.['returned(RTO)']?.amount,
                        mode: 'negative',
                      },
                      {
                        label: 'Refund & Replacement',
                        subLabel: '(Customer Returns)',
                        qty:
                          dashboardData?.breakdown_table?.returned_customer?.qty ??
                          dashboardData?.breakdown_table?.['returned(CRef)']?.qty,
                        amount:
                          dashboardData?.breakdown_table?.returned_customer?.amount ??
                          dashboardData?.breakdown_table?.['returned(CRef)']?.amount,
                        mode: 'negative',
                      },
                      {
                        label: 'Claims Processed',
                        qty: dashboardData?.breakdown_table?.claim?.qty,
                        amount: dashboardData?.breakdown_table?.claim?.amount,
                        mode: 'positive_sign',
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="grid grid-cols-12 px-3.5 py-[6px] text-[12px] border-b border-[#f3f4f6] items-center"
                      >
                        <span className="col-span-6 font-medium text-[#111827] leading-snug">
                          <div>{row.label}</div>
                          {row.subLabel && (
                            <div className="text-[10.5px] text-[#4b5563] leading-none mt-[1px]">{row.subLabel}</div>
                          )}
                        </span>

                        <span className="col-span-3 text-center font-medium text-[#111827]">
                          {formatSalesOverviewUnits(row.qty, row.mode)}
                        </span>

                        <span className="col-span-3 text-right font-medium text-[#111827]">
                          {formatSalesOverviewAmount(row.amount, row.mode)}
                        </span>
                      </div>
                    ))}

                    {/* NET */}
                    <div className="grid grid-cols-12 px-3.5 py-2 mt-1.5 bg-[#f0fdf4] rounded-xl text-[13px] font-bold text-[#15803d] items-center">
                      <span className="col-span-6">Net Sales (Total)</span>

                      <span className="col-span-3 text-center">
                        {formatSalesOverviewUnits(dashboardData?.breakdown_table?.net?.qty, 'gross')}
                      </span>

                      <span className="col-span-3 text-right">
                        {formatSalesOverviewAmount(dashboardData?.breakdown_table?.net?.amount, 'net')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>

            {/* ================= RIGHT CHART ================= */}
          </Row>
        </Spin>
        <Row gutter={[16, 16]} className="mt-2">
          <Col xs={24} lg={10}>
            <div
              className="bg-white rounded-[24px] border border-[#edf0f7] shadow-sm p-3 sm:p-4"
              style={{
                height: '415px',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-semibold text-[#111827]">Sales, Quantity & Profit Overview</h3>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stackedData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Bar dataKey="sales" stackId="a" fill="#8e9fff" radius={[5, 5, 0, 0]} />

                  {/* QUANTITY - SOFT GREEN */}
                  <Bar dataKey="qty" stackId="a" fill="#7be0d4" radius={[5, 5, 0, 0]} />

                  {/* PROFIT - DARK GREEN */}
                  <Bar dataKey="profit" stackId="a" fill="#5aa892" radius={[5, 5, 0, 0]} />

                  {/* <Bar dataKey="sales" stackId="a" fill="#fb7185" radius={[5, 5, 0, 0]} />

                    <Bar dataKey="qty" stackId="a" fill="#86efac" radius={[5, 5, 0, 0]} />

                    <Bar dataKey="profit" stackId="a" fill="#fdba74" radius={[5, 5, 0, 0]} /> */}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Col>
          {/* ================= RIGHT 4 CHARTS ================= */}
          <Col xs={24} lg={14}>
            <Row gutter={[12, 12]}>
              {(() => {
                const netQty = Number(dashboardData?.breakdown_table?.net?.qty) || 0;
                const grossQty = Number(dashboardData?.breakdown_table?.gross?.qty) || 0;
                const totalReturnCount = Number(dashboardData?.header_metrics?.total_return_count) || 0;
                const totalProfitNum = parseOverviewCurrency(dashboardData?.header_metrics?.profit);
                const netSalesNum =
                  parseOverviewCurrency(dashboardData?.header_metrics?.sales) ||
                  parseOverviewCurrency(dashboardData?.breakdown_table?.net?.amount) ||
                  0;
                const shippingNum = Math.abs(parseOverviewCurrency(dashboardData?.header_metrics?.shipping));

                const qtyPerc = grossQty > 0 ? (netQty / grossQty) * 100 : 0;
                const returnPerc = grossQty > 0 ? (totalReturnCount / grossQty) * 100 : 0;
                const profitPerc = netSalesNum > 0 ? (totalProfitNum / netSalesNum) * 100 : 0;
                const shippingPerc = netSalesNum > 0 ? (shippingNum / netSalesNum) * 100 : 0;

                return [
                  {
                    title: 'Quantity',
                    color: '#3b82f6',
                    value: netQty,
                    percentage: qtyPerc,
                    percentageStr: formatCirclePercent(qtyPerc),
                    icon: <InboxOutlined />,
                    label: 'Total Quantity',
                  },
                  {
                    title: 'Return',
                    color: '#ef4444',
                    value: totalReturnCount,
                    percentage: returnPerc,
                    percentageStr: formatCirclePercent(returnPerc),
                    icon: <ReloadOutlined />,
                    label: 'Total Return',
                  },
                  {
                    title: 'Shipping',
                    color: '#f59e0b',
                    value: dashboardData?.header_metrics?.shipping || 0,
                    percentage: shippingPerc,
                    percentageStr: formatCirclePercent(shippingPerc),
                    icon: <CarOutlined />,
                    label: 'Total Shipping',
                  },
                  {
                    title: 'Profit',
                    color: '#67c96d',
                    value: dashboardData?.header_metrics?.profit || 0,
                    percentage: profitPerc,
                    percentageStr: formatCirclePercent(profitPerc),
                    icon: <BarChartOutlined />,
                    label: 'Total Profit',
                  },
                ].map((item) => {
                  const circlePct = Math.min(Math.max(item.percentage, 0), 100);
                  return (
                    <Col xs={24} sm={12} key={item.title}>
                      <div className="bg-white rounded-[18px] border border-[#edf0f7] shadow-sm p-2 sm:p-4">
                        {/* HEADER */}
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-[15px]"
                            style={{
                              background: `${item.color}15`,
                              color: item.color,
                            }}
                          >
                            {item.icon}
                          </div>

                          <h3 className="text-[15px] font-semibold text-[#111827]">{item.title}</h3>
                        </div>

                        {/* CIRCLE */}
                        <div className="flex justify-center">
                          <div className="relative w-[68px] h-[68px]">
                            <div
                              className="w-full h-full rounded-full"
                              style={{
                                background: `conic-gradient(${item.color} 0% ${circlePct}%, #eef2f7 ${circlePct}% 100%)`,
                              }}
                            />
                          </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-[12px] text-[#6b7280]">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />

                            {item.label}
                          </div>

                          <p className="text-[14px] font-semibold text-[#111827] mt-2">
                            {item.value} ({item.percentageStr})
                          </p>
                        </div>
                      </div>
                    </Col>
                  );
                });
              })()}
            </Row>
          </Col>
        </Row>
      </main>
    </>
  );
}
