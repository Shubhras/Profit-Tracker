import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Tag, Select, Divider, Checkbox, Input, Button, Spin } from 'antd';
import { CheckOutlined, CloseOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { amazonAction } from '../../redux/amazonAPI/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';
import { getDashboard } from '../../redux/dashboard/actionCreator';

const { Option } = Select;

export default function Summary() {
  // const path = '/admin';
  const navigate = useNavigate();
  const [viewType, setViewType] = useState('percentage');
  const { dashboardData, dateRange, channel: globalChannel, search, loading } = useSelector((state) => state.dashboard);
  const [filters, setFilters] = useState({
    withAds: true,
    withoutAds: false,
    withGST: true,
    withoutGST: false,
    withEstimate: true,
    withoutEstimate: false,
    withExpenses: true,
    withoutExpenses: false,

    sku: '',
    productId: '',
    parentId: '',
    mktCategory: '',
    invMasterSku: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  // const [amazonParams, setAmazonParams] = useState({
  //   callbackUri: '',
  //   state: '',
  //   sellingPartnerId: '',
  // });
  const location = useLocation();
  const dispatch = useDispatch();
  const [showFilters, setShowFilters] = useState(false);
  const gstLabel = appliedFilters.withGST ? 'GST Included' : 'GST Excluded';
  const buildMetric = (filtersData) => {
    return {
      ads: filtersData.withAds ? 'withAds' : 'withoutAds',
      gst: filtersData.withGST ? 'withGst' : 'withoutGst',
      expense: filtersData.withExpenses ? 'withExpense' : 'withoutExpense',
      estimate: filtersData.withEstimate ? 'withEstimate' : 'withoutEstimate',
    };
  };

  const payload = {
    filters: {
      channel: {
        IN: globalChannel,
      },
      fromDate: dateRange?.fromDate || null,
      toDate: dateRange?.endDate || null,
      search,
    },
    metric: buildMetric(appliedFilters),
  };

  useEffect(() => {
    dispatch(getDashboard(payload));
  }, [dispatch, dateRange, appliedFilters, globalChannel]);

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

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Profit' },
    { path: '', breadcrumbName: 'Summary' },
  ];

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

  const bottomChartData = dashboardData?.geography?.length
    ? dashboardData.geography
        .map((item) => ({
          name: item.id || 'Unknown',
          value: Number(item.revenue) || 0,
          qty: Number(item.grossqty) || 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 4)
    : [];
  const selectedFilters = [
    filters.withAds && { label: 'With Ads', color: 'green' },
    filters.withoutAds && { label: 'Without Ads', color: 'red' },
    filters.withGST && { label: 'With GST', color: 'green' },
    filters.withoutGST && { label: 'Without GST', color: 'red' },
    filters.withEstimate && { label: 'With Estimate', color: 'green' },
    filters.withoutEstimate && { label: 'Without Estimate', color: 'red' },
    filters.withExpenses && { label: 'With Expenses', color: 'green' },
    filters.withoutExpenses && { label: 'Without Expenses', color: 'red' },
  ].filter(Boolean);
  const handleApply = () => {
    // setAppliedFilters(filters);
    dispatch(getDashboard(payload)); //
    setShowFilters(false);
  };
  const handleClear = () => {
    const resetFilters = {
      withAds: false,
      withoutAds: true,
      withGST: false,
      withoutGST: true,
      withEstimate: true,
      withoutEstimate: false,
      withExpenses: true,
      withoutExpenses: false,
      sku: '',
      productId: '',
      parentId: '',
      mktCategory: '',
      invMasterSku: '',
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
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

        <Card className="mb-4 border rounded-xl px-0 py-0 bg-[#f9fafb]">
          <button
            type="button"
            className="flex items-center justify-between gap-4 mb-0 text-sm w-full"
            // onClick={() => setShowFilters((prev) => !prev)}
          >
            <span className="text-gray-500">{selectedFilters.length} Filter Selected</span>

            {selectedFilters.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{item.label}</span>
              </div>
            ))}
            {/* RIGHT BUTTONS */}
            <div className="ml-auto flex items-center gap-4">
              <Button
                // type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="flex items-center gap-1"
                // className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 bg-white hover:bg-gray-100 transition"
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
                // className="flex items-center gap-2 px-4 py-1.5 text-sm bg-green-600 text-white hover:bg-blue-700 transition"
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
                {/* ADS */}
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
        </Card>
        <Spin spinning={loading} size="large">
          <Row gutter={[16, 16]}>
            {/* SALES */}
            <Col xs={24} lg={9}>
              <Card
                onClick={() => navigate(`/admin/profit/profittabledetails/${globalChannel?.[0] || 'all'}`)}
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
                    ₹{dashboardData?.breakdown_table?.gross?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Cancelled</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.cancelled?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    ₹{dashboardData?.breakdown_table?.cancelled?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Returned(RTO)</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.returned?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    ₹{dashboardData?.breakdown_table?.returned?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Cancelled(RTO)</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.cancelledrtosummaryqty?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    ₹{dashboardData?.breakdown_table?.cancelledrtosummarysales?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Returned(CReF)</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.creturnsummaryqty?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    ₹{dashboardData?.breakdown_table?.returnedcref?.amount || 0}
                  </Col>
                </Row>
                <Row>
                  <Col span={10}>Claimed</Col>
                  <Col span={7} className="text-center">
                    {dashboardData?.breakdown_table?.claimqty?.qty || 0}
                  </Col>
                  <Col span={7} className="text-right">
                    ₹{dashboardData?.breakdown_table?.claimsales?.amount || 0}
                  </Col>
                </Row>
                <Divider />
                <Row>
                  <Col span={10}>
                    <strong>Net</strong>
                  </Col>
                  <Col span={7} className="text-center">
                    <strong>{dashboardData?.breakdown_table?.net?.qty || 0}</strong>
                  </Col>
                  <Col span={7} className="text-right">
                    <strong>₹{dashboardData?.breakdown_table?.net?.amount || 0}</strong>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* PROFIT */}
            <Col xs={24} lg={6}>
              <Card
                onClick={() => navigate(`/admin/profit/profittabledetails/${globalChannel?.[0] || 'all'}`)}
                hoverable
                style={{ cursor: 'pointer' }}
              >
                <Statistic title="Profit" value={dashboardData?.header_metrics?.profit || 0} prefix="₹" />
                <Tag color="gold">Margin: {dashboardData?.header_metrics?.margin || '0%'}</Tag>
                <Tag color="green">ROI: {dashboardData?.header_metrics?.roi || '0%'}</Tag>
              </Card>

              <Row gutter={8} className="mt-1">
                <Col span={12}>
                  <Card size="small" className="bg-green-50">
                    <p className="text-green-700">Profit IDs</p>
                    <strong>#{dashboardData?.top_orders?.profitable?.total_count || 0}</strong>

                    <p>{dashboardData?.top_orders?.profitable?.total_amount || 0}</p>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" className="bg-red-50">
                    <p className="text-red-600">Loss IDs</p>
                    <strong>#{dashboardData?.top_orders?.losing?.total_count || 0}</strong>

                    <p>{dashboardData?.top_orders?.losing?.total_amount || 0}</p>
                  </Card>
                </Col>
              </Row>
              <Card size="small" className="mt-1 py-0">
                {/* <div className="flex flex-col justify-between h-full"> */}
                <div>
                  {/* <p className="text-gray-500 text-xs mb-1">Ad Spend</p> */}
                  <Statistic
                    // className="mt-0"
                    title="Ad Spend"
                    value={dashboardData?.header_metrics?.ad_spend || 0}
                    prefix="₹"
                  />
                  {/* <strong className="text-lg block">₹{dashboardData?.header_metrics?.ad_spend || 0}</strong> */}
                </div>

                <Tag color="magenta" className="mt-1 w-fit">
                  TACOS: {dashboardData?.header_metrics?.tacos || '0%'}
                </Tag>
                {/* </div> */}
              </Card>
            </Col>

            {/* AD SPEND */}
            {/* <Col xs={24} lg={4}>
            <Card>
              <Statistic title="Ad Spend" value={dashboardData?.header_metrics?.ad_spend || 0} prefix="₹" />
              <Tag color="magenta">TACOS: {dashboardData?.header_metrics?.tacos || '0%'}</Tag>
            </Card>
          </Col> */}

            {/* STACKED BAR (RIGHT) */}
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
        </Spin>

        {/* ================= BOTTOM 4 PANELS ================= */}
        <Row gutter={[16, 16]} className="mt-6">
          {['Quantity Sold', 'Return', 'Shipping', 'Profit'].map((title) => (
            <Col xs={24} lg={6} key={title}>
              <Card
                title={title}
                extra={
                  <Select size="small" value={viewType} onChange={setViewType} style={{ width: 120 }}>
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
        </Row>
      </main>
    </>
  );
}
