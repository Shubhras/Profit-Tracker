import React from 'react';
import { Card, Row, Col, Typography, Tag, Button } from 'antd';

const { Title, Text } = Typography;

function CampaignTypeStep({ onSelect }) {
  return (
    <Card>
      <Title level={3}>Create Campaign</Title>

      <Text>Select the campaign type.</Text>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card
            hoverable
            onClick={() => onSelect('SP')}
            style={{
              height: '100%',
              cursor: 'pointer',
            }}
          >
            <Title level={4}>Sponsored Products</Title>

            <Text type="secondary">Promote products in Amazon search results.</Text>

            <div style={{ marginTop: 24 }}>
              <Button type="primary">Create Campaign</Button>
            </div>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{
              height: '100%',
            }}
          >
            <Title level={4}>
              Sponsored Brands <Tag color="orange">Coming Soon</Tag>
            </Title>

            <Text type="secondary">Increase brand awareness with custom creatives and featured products.</Text>
          </Card>
        </Col>

        <Col span={8}>
          <Card
            style={{
              height: '100%',
            }}
          >
            <Title level={4}>
              Sponsored Display <Tag color="orange">Coming Soon</Tag>
            </Title>

            <Text type="secondary">Reach shoppers on and off Amazon using audience targeting.</Text>
          </Card>
        </Col>
      </Row>
    </Card>
  );
}

export default CampaignTypeStep;
