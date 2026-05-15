import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Spin, Card, Row, Col, message } from 'antd';
import { amazonAdsAction } from '../../redux/amazonAds/actionCreator';

function AmazonAdsCallback() {
  const hasCalled = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (hasCalled.current) return;

    hasCalled.current = true;

    const searchParams = new URLSearchParams(location.search);

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (code && state) {
      dispatch(
        amazonAdsAction(
          {
            code,
            state,
          },
          () => {
            message.success('Amazon Ads connected successfully');

            navigate('/admin/advertising/overview');
            // navigate('/admin/profit/summary');
          },
        ),
      );
    }
  }, [location, dispatch, navigate]);

  //   return <div>Connecting Amazon Ads...</div>;
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

export default AmazonAdsCallback;
