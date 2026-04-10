/* eslint-disable camelcase */
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Spin, Card, Row, Col, message } from 'antd';
import { amazonAction } from '../../redux/amazonAPI/actionCreator';

function AmazonCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const spapiOauthCode = searchParams.get('spapi_oauth_code');
    const state = searchParams.get('state');
    const sellingPartnerId = searchParams.get('selling_partner_id');

    if (spapiOauthCode && state) {
      dispatch(
        amazonAction(
          {
            spapi_oauth_code: spapiOauthCode,
            state,
            selling_partner_id: sellingPartnerId,
          },
          () => {
            message.success('Amazon connected successfully');
            navigate('/admin/profit/summary');
          },
        ),
      );
    }
  }, [location, dispatch, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f4f7f6',
      }}
    >
      <Card
        style={{
          width: 400,
          textAlign: 'center',
          borderRadius: '15px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Row gutter={[16, 16]} justify="center">
          <Col span={24}>
            <Spin size="large" />
          </Col>
          <Col span={24}>
            <h2 style={{ color: '#1890ff' }}>Connecting to Amazon</h2>
            <p>Please wait while we authorize your Selling Partner account...</p>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default AmazonCallback;
