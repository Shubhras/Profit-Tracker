import React, { useState } from 'react';
import { Card, Button, Typography, Row, Col, List, Tag, message, Descriptions, Empty } from 'antd';
import { useDispatch } from 'react-redux';

import CampaignBuilderService from '../services/CampaignBuilderService';

const { Title, Text } = Typography;

const biddingStrategyLabels = {
  AUTO_FOR_SALES: 'Dynamic Bids - Up and Down',
  LEGACY_FOR_SALES: 'Dynamic Bids - Down Only',
  MANUAL: 'Fixed Bids',
};
function ReviewStep({ wizardData, onBack }) {
  const dispatch = useDispatch();

  const [creating, setCreating] = useState(false);

  // ============================================================================================================
  // CREATE CAMPAIGN
  // ============================================================================================================

  const handleCreate = async () => {
    try {
      setCreating(true);

      const result = await CampaignBuilderService.createCampaign(wizardData, dispatch);

      if (result?.status) {
        message.success('Campaign created successfully');

        return;
      }

      if (result?.errors && result.errors.length > 0) {
        result.errors.forEach((error) => {
          message.error(error.message);
          // message.error(
          //   result.errors
          //     .map((error) => error.message)
          //     .join(', '),                       this will joins the errors
          // );
        });

        return;
      }

      message.error(result?.message || 'Campaign creation failed');
    } catch (error) {
      console.error(error);

      message.error(error.message || 'Campaign creation failed');
    } finally {
      setCreating(false);
    }
  };

  const negativeKeywords = wizardData.negatives?.campaignNegativeKeywords || [];

  const negativeTargets = wizardData.negatives?.campaignNegativeTargets || [];

  // ============================================================================================================
  // REVIEW PAGE
  // ============================================================================================================

  return (
    <>
      <Title level={3}>Review Campaign</Title>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Campaign">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{wizardData.campaign.name}</Descriptions.Item>

              <Descriptions.Item label="State">{wizardData.campaign.state}</Descriptions.Item>

              <Descriptions.Item label="Targeting">{wizardData.campaign.targetingType}</Descriptions.Item>

              <Descriptions.Item label="Budget">₹{wizardData.campaign.budget}</Descriptions.Item>

              <Descriptions.Item label="Bidding">
                {biddingStrategyLabels[wizardData.campaign.biddingStrategy]}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Ad Group">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{wizardData.adGroup.name}</Descriptions.Item>

              <Descriptions.Item label="Default Bid">₹{wizardData.adGroup.defaultBid}</Descriptions.Item>

              <Descriptions.Item label="State">{wizardData.adGroup.state}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <Card title={`Products (${wizardData.products.length})`}>
            {wizardData.products.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <>
                <List
                  dataSource={wizardData.products.slice(0, 3)}
                  renderItem={(product) => (
                    <List.Item>
                      <Text strong>{product.sku}</Text>

                      <Tag>{product.asin}</Tag>
                    </List.Item>
                  )}
                />

                {wizardData.products.length > 3 && (
                  <Text type="secondary">+{wizardData.products.length - 3} more products</Text>
                )}
              </>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Targeting">
            {wizardData.campaign.targetingType === 'AUTO' ? (
              <>
                <Text strong>Automatic Targeting</Text>

                <br />

                <Text type="secondary">Amazon will automatically generate targeting.</Text>
              </>
            ) : (
              <>
                <Text strong>
                  {wizardData.targeting?.method === 'KEYWORD' ? 'Keyword Targeting' : 'Product Targeting'}
                </Text>

                <div
                  style={{
                    marginTop: 12,
                  }}
                >
                  {wizardData.targeting?.method === 'KEYWORD' && (
                    <>
                      <List
                        dataSource={wizardData.targeting.keywords.slice(0, 3)}
                        renderItem={(keyword) => (
                          <List.Item>
                            <Text>{keyword.keywordText}</Text>

                            <div>
                              <Tag>{keyword.matchType}</Tag>

                              <Tag>₹{keyword.bid}</Tag>
                            </div>
                          </List.Item>
                        )}
                      />

                      {wizardData.targeting.keywords.length > 3 && (
                        <Text type="secondary">+{wizardData.targeting.keywords.length - 3} more keywords</Text>
                      )}
                    </>
                  )}

                  {wizardData.targeting?.method === 'PRODUCT' && (
                    <>
                      <List
                        dataSource={wizardData.targeting.targets.slice(0, 3)}
                        renderItem={(target) => (
                          <List.Item>
                            <Text>{target.expression?.[0]?.value || '-'}</Text>

                            <Tag>₹{target.bid}</Tag>
                          </List.Item>
                        )}
                      />

                      {wizardData.targeting.targets.length > 3 && (
                        <Text type="secondary">+{wizardData.targeting.targets.length - 3} more targets</Text>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Negative Targeting">
            {negativeKeywords.length === 0 && negativeTargets.length === 0 ? (
              <Text type="secondary">No negative targeting configured</Text>
            ) : (
              <>
                {negativeKeywords.length > 0 && (
                  <>
                    <Text strong>Negative Keywords</Text>

                    <List
                      style={{
                        marginTop: 12,
                      }}
                      dataSource={negativeKeywords.slice(0, 3)}
                      renderItem={(keyword) => (
                        <List.Item>
                          <Text>{keyword.keywordText}</Text>

                          <Tag color="red">{keyword.matchType}</Tag>
                        </List.Item>
                      )}
                    />

                    {negativeKeywords.length > 3 && (
                      <Text type="secondary">+{negativeKeywords.length - 3} more negative keywords</Text>
                    )}
                  </>
                )}

                {negativeTargets.length > 0 && (
                  <>
                    <div
                      style={{
                        marginTop: 16,
                      }}
                    >
                      <Text strong>Negative Product Targets</Text>
                    </div>

                    <List
                      style={{
                        marginTop: 12,
                      }}
                      dataSource={negativeTargets.slice(0, 3)}
                      renderItem={(target) => (
                        <List.Item>
                          <Text>{target.expression?.[0]?.value || '-'}</Text>
                        </List.Item>
                      )}
                    />

                    {negativeTargets.length > 3 && (
                      <Text type="secondary">+{negativeTargets.length - 3} more negative targets</Text>
                    )}
                  </>
                )}
              </>
            )}
          </Card>
        </Col>
      </Row>

      <div
        style={{
          marginTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={onBack}>Back</Button>

        <Button type="primary" loading={creating} onClick={handleCreate}>
          Create Campaign
        </Button>
      </div>
    </>
  );
}

export default ReviewStep;
