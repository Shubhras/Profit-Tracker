import React, { useState } from 'react';
import { Button, Typography, Row, Col, List, Tag, message, Descriptions, Empty } from 'antd';
import { useDispatch } from 'react-redux';

import CampaignBuilderService from '../services/CampaignBuilderService';

const { Text } = Typography;

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
    <div className="w-full space-y-5">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12}>
          <div className="rounded-2xl bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 shadow-sm h-full">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
              Campaign
            </h3>
            <Descriptions
              column={1}
              size="small"
              className="[&_.ant-descriptions-item-label]:!text-gray-500 [&_.ant-descriptions-item-content]:!font-medium"
            >
              <Descriptions.Item label="Name">{wizardData.campaign.name}</Descriptions.Item>
              <Descriptions.Item label="Portfolio">{wizardData.campaign.portfolioName || 'None'}</Descriptions.Item>
              <Descriptions.Item label="State">{wizardData.campaign.state}</Descriptions.Item>
              <Descriptions.Item label="Targeting">{wizardData.campaign.targetingType}</Descriptions.Item>
              <Descriptions.Item label="Budget">₹{wizardData.campaign.budget}</Descriptions.Item>
              <Descriptions.Item label="Bidding">
                {biddingStrategyLabels[wizardData.campaign.biddingStrategy]}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <div className="rounded-2xl bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 shadow-sm h-full">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
              Ad Group
            </h3>
            <Descriptions
              column={1}
              size="small"
              className="[&_.ant-descriptions-item-label]:!text-gray-500 [&_.ant-descriptions-item-content]:!font-medium"
            >
              <Descriptions.Item label="Name">{wizardData.adGroup.name}</Descriptions.Item>
              <Descriptions.Item label="Default Bid">₹{wizardData.adGroup.defaultBid}</Descriptions.Item>
              <Descriptions.Item label="State">{wizardData.adGroup.state}</Descriptions.Item>
            </Descriptions>
          </div>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <div className="rounded-2xl bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 shadow-sm h-full">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
              Products ({wizardData.products.length})
            </h3>
            {wizardData.products.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No products selected" />
            ) : (
              <>
                <List
                  dataSource={wizardData.products.slice(0, 3)}
                  renderItem={(product) => (
                    <List.Item className="!py-2">
                      <Text strong className="text-xs text-gray-800 dark:text-white truncate max-w-[200px]">
                        {product.sku || product.item_name}
                      </Text>
                      <Tag className="font-mono text-xs">{product.asin}</Tag>
                    </List.Item>
                  )}
                />

                {wizardData.products.length > 3 && (
                  <div className="text-xs text-gray-400 mt-2">+{wizardData.products.length - 3} more products</div>
                )}
              </>
            )}
          </div>
        </Col>

        <Col xs={24} sm={24} md={12} lg={12}>
          <div className="rounded-2xl bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 shadow-sm h-full">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
              Targeting
            </h3>
            {wizardData.campaign.targetingType === 'AUTO' ? (
              <>
                <Text strong className="text-sm text-gray-800 dark:text-white">
                  Automatic Targeting
                </Text>
                <div className="text-xs text-gray-500 mt-1">Amazon will automatically generate targeting.</div>
              </>
            ) : (
              <>
                <Text strong className="text-sm text-gray-800 dark:text-white">
                  {wizardData.targeting?.method === 'KEYWORD' ? 'Keyword Targeting' : 'Product Targeting'}
                </Text>

                <div className="mt-3">
                  {wizardData.targeting?.method === 'KEYWORD' && (
                    <>
                      <List
                        dataSource={wizardData.targeting.keywords.slice(0, 3)}
                        renderItem={(keyword) => (
                          <List.Item className="!py-2">
                            <Text className="text-xs text-gray-800 dark:text-white">{keyword.keywordText}</Text>
                            <div className="flex items-center gap-1">
                              <Tag className="text-xs">{keyword.matchType}</Tag>
                              <Tag color="green" className="text-xs">
                                ₹{keyword.bid}
                              </Tag>
                            </div>
                          </List.Item>
                        )}
                      />

                      {wizardData.targeting.keywords.length > 3 && (
                        <div className="text-xs text-gray-400 mt-2">
                          +{wizardData.targeting.keywords.length - 3} more keywords
                        </div>
                      )}
                    </>
                  )}

                  {wizardData.targeting?.method === 'PRODUCT' && (
                    <>
                      <List
                        dataSource={wizardData.targeting.targets.slice(0, 3)}
                        renderItem={(target) => (
                          <List.Item className="!py-2">
                            <Text className="text-xs text-gray-800 dark:text-white">
                              {target.expression?.[0]?.value || target.categoryName || '-'}
                            </Text>
                            <Tag color="green" className="text-xs">
                              ₹{target.bid}
                            </Tag>
                          </List.Item>
                        )}
                      />

                      {wizardData.targeting.targets.length > 3 && (
                        <div className="text-xs text-gray-400 mt-2">
                          +{wizardData.targeting.targets.length - 3} more targets
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </Col>

        <Col xs={24}>
          <div className="rounded-2xl bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-white/10">
              Negative Targeting
            </h3>
            {negativeKeywords.length === 0 && negativeTargets.length === 0 ? (
              <div className="text-xs text-gray-400">No negative targeting configured</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {negativeKeywords.length > 0 && (
                  <div>
                    <Text strong className="text-xs text-gray-700 dark:text-gray-300">
                      Negative Keywords
                    </Text>
                    <List
                      className="mt-2"
                      dataSource={negativeKeywords.slice(0, 3)}
                      renderItem={(keyword) => (
                        <List.Item className="!py-1.5">
                          <Text className="text-xs text-gray-800 dark:text-white">{keyword.keywordText}</Text>
                          <Tag color="red" className="text-xs">
                            {keyword.matchType}
                          </Tag>
                        </List.Item>
                      )}
                    />
                    {negativeKeywords.length > 3 && (
                      <div className="text-xs text-gray-400 mt-1">
                        +{negativeKeywords.length - 3} more negative keywords
                      </div>
                    )}
                  </div>
                )}

                {negativeTargets.length > 0 && (
                  <div>
                    <Text strong className="text-xs text-gray-700 dark:text-gray-300">
                      Negative Product Targets
                    </Text>
                    <List
                      className="mt-2"
                      dataSource={negativeTargets.slice(0, 3)}
                      renderItem={(target) => (
                        <List.Item className="!py-1.5">
                          <Text className="text-xs text-gray-800 dark:text-white font-mono">
                            {target.expression?.[0]?.value || '-'}
                          </Text>
                        </List.Item>
                      )}
                    />
                    {negativeTargets.length > 3 && (
                      <div className="text-xs text-gray-400 mt-1">
                        +{negativeTargets.length - 3} more negative targets
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
        <Button className="h-10 px-6 rounded-lg font-medium" onClick={onBack}>
          Back
        </Button>

        <Button type="primary" className="h-10 px-6 rounded-lg font-medium" loading={creating} onClick={handleCreate}>
          Create Campaign
        </Button>
      </div>
    </div>
  );
}

export default ReviewStep;
