import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Tag, Select, Divider, Checkbox, Button } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { amazonAction } from '../../redux/amazonAPI/actionCreator';
import { PageHeader } from '../../components/page-headers/page-headers';

const { Option } = Select;

export default function Summary() {
  const [viewType, setViewType] = useState('percentage');
  // const [amazonParams, setAmazonParams] = useState({
  //   callbackUri: '',
  //   state: '',
  //   sellingPartnerId: '',
  // });
  const location = useLocation();
  const dispatch = useDispatch();

  const loginAmazon = useCallback(
    (params) => {
      dispatch(amazonAction(params));
    },
    [dispatch],
  );

  const connectAmazon = () => {
    window.location.href = 'https://api.trackmyprofit.com/api/amazon/connect';
  };

  // const getAuthCodAmazon = () => {
  //   const callbackUri = encodeURIComponent('http://localhost:3001/admin/profit/summary'); // your frontend callback
  //   const state = Math.random().toString(36).substring(2); // random state for security
  //   const sellingPartnerId = '1234567'; // replace with actual seller ID if needed
  //   window.location.href = `http://192.168.1.29:8000/api/amazon/login/?amazon_callback_uri=${callbackUri}&amazon_state=${state}&selling_partner_id=${sellingPartnerId}`;
  //   // window.location.href = `http://192.168.1.29:8000/api/amazon/login/?amazon_callback_uri=${callbackUri}&amazon_state=${state}&selling_partner_id=${sellingPartnerId}`;
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

    // if (amazonState && stateNew && spapiOauthCode) {
    if (stateNew && spapiOauthCode) {
      loginAmazon({ spapi_oauth_code: spapiOauthCode, state: stateNew, selling_partner_id: sellingPartnerId });
      console.log('dddddddddddddddddddddddddddd');
    }
  }, [location, loginAmazon]);

  const PageRoutes = [
    { path: 'index', breadcrumbName: 'Profit' },
    { path: '', breadcrumbName: 'Summary' },
  ];

  /* ---------- RIGHT STACKED CHART ---------- */
  const stackedData = [
    { date: '01/01', cancelled: 0, rto: 0, returned: 0 },
    { date: '02/01', cancelled: 0, rto: 0, returned: 0 },
    { date: '03/01', cancelled: 0, rto: 0, returned: 0 },
    { date: '04/01', cancelled: 0, rto: 0, returned: 0 },
    { date: '05/01', cancelled: 0, rto: 0, returned: 0 },
    { date: '06/01', cancelled: 0, rto: 0, returned: 0 },
    { date: '07/01', cancelled: 0, rto: 0, returned: 0 },
  ];

  /* ---------- BOTTOM CHART DATA ---------- */
  const bottomChartData = [
    { name: 'North', value: 0 },
    { name: 'South', value: 0 },
    { name: 'East', value: 0 },
    { name: 'West', value: 0 },
  ];

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Profit"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        {/* ================= FILTER BAR ================= */}
        <Card className="mb-4">
          <Row gutter={16} align="middle">
            <Col>
              <Checkbox defaultChecked>With Ads</Checkbox>
            </Col>
            <Col>
              <Checkbox defaultChecked>With GST</Checkbox>
            </Col>
            <Col>
              <Checkbox defaultChecked>With Estimate</Checkbox>
            </Col>
            <Col>
              <Checkbox defaultChecked>With Expenses</Checkbox>
            </Col>
            <Col>
              <Button type="primary" onClick={connectAmazon}>
                Connect Amazon
              </Button>
            </Col>
            {/* <Col>
              <Button type="primary" onClick={getAuthCodAmazon}>
                Login Amazon
              </Button>
            </Col> */}
          </Row>
        </Card>

        {/* ================= TOP SECTION ================= */}
        <Row gutter={[16, 16]}>
          {/* SALES */}
          <Col xs={24} lg={6}>
            <Card>
              <Statistic title="Sales" value={0} prefix="₹" />
              <Tag color="blue" className="mt-2">
                Units: 0
              </Tag>

              <Divider />

              <Row justify="space-between">
                <span>Gross</span>
                <span>0</span>
              </Row>
              <Row justify="space-between">
                <span>Cancelled</span>
                <span>0</span>
              </Row>
              <Row justify="space-between">
                <span>Returned</span>
                <span>0</span>
              </Row>
              <Divider />
              <Row justify="space-between">
                <strong>Net</strong>
                <strong>0</strong>
              </Row>
            </Card>
          </Col>

          {/* PROFIT */}
          <Col xs={24} lg={6}>
            <Card>
              <Statistic title="Profit" value={0} prefix="₹" />
              <Tag color="gold">Margin: 0%</Tag>
              <Tag color="green">ROI: 0%</Tag>
            </Card>

            <Row gutter={8} className="mt-3">
              <Col span={12}>
                <Card size="small" className="bg-green-50">
                  <p className="text-green-700">Profit IDs</p>
                  <strong>#0</strong>
                  <p>₹0</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" className="bg-red-50">
                  <p className="text-red-600">Loss IDs</p>
                  <strong>#0</strong>
                  <p>₹0</p>
                </Card>
              </Col>
            </Row>
          </Col>

          {/* AD SPEND */}
          <Col xs={24} lg={6}>
            <Card>
              <Statistic title="Ad Spend" value={0} prefix="₹" />
              <Tag color="magenta">TACOS: 0%</Tag>
            </Card>
          </Col>

          {/* STACKED BAR (RIGHT) */}
          <Col xs={24} lg={6}>
            <Card>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stackedData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cancelled" stackId="a" fill="#f28b82" />
                  <Bar dataKey="rto" stackId="a" fill="#a7f3a0" />
                  <Bar dataKey="returned" stackId="a" fill="#fbc687" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

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
