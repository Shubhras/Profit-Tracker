import { Form, Row, Col, Input, Select, InputNumber, DatePicker, Button, Divider } from 'antd';
import moment from 'moment';

function CampaignStep({ wizardData, setWizardData, onNext }) {
  return (
    <>
      <Form layout="vertical">
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Campaign Name" required>
              <Input
                value={wizardData.campaign.name}
                onChange={(e) =>
                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      name: e.target.value,
                    },
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Campaign Status">
              <Select
                value={wizardData.campaign.state}
                options={[
                  {
                    label: 'Enabled',
                    value: 'ENABLED',
                  },
                  {
                    label: 'Paused',
                    value: 'PAUSED',
                  },
                ]}
                onChange={(value) =>
                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      state: value,
                    },
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Targeting Type">
              <Select
                value={wizardData.campaign.targetingType}
                options={[
                  {
                    label: 'Manual',
                    value: 'MANUAL',
                  },
                  {
                    label: 'Auto',
                    value: 'AUTO',
                  },
                ]}
                onChange={(value) =>
                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      targetingType: value,
                    },
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Daily Budget" required extra="Minimum budget: ₹50">
              <InputNumber
                // min={50}
                style={{ width: '100%', paddingTop: '0' }}
                value={wizardData.campaign.budget}
                onChange={(value) =>
                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      budget: value,
                    },
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Start Date">
              <DatePicker
                style={{ width: '100%' }}
                value={wizardData?.campaign?.startDate ? moment(wizardData.campaign.startDate) : moment()}
                disabledDate={(current) => current && current < moment().startOf('day')}
                onChange={(date, dateString) => {
                  const endDate = wizardData?.campaign?.endDate;

                  const shouldClearEndDate = endDate && moment(endDate, 'YYYY-MM-DD').isBefore(date, 'day');

                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      startDate: dateString,
                      endDate: shouldClearEndDate ? '' : endDate,
                    },
                  });
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="End Date">
              <DatePicker
                style={{ width: '100%' }}
                value={wizardData?.campaign?.endDate ? moment(wizardData.campaign.endDate, 'YYYY-MM-DD') : null}
                disabledDate={(current) => {
                  const startDate = wizardData?.campaign?.startDate;

                  return (
                    current &&
                    current < (startDate ? moment(startDate, 'YYYY-MM-DD').startOf('day') : moment().startOf('day'))
                  );
                }}
                onChange={(date, dateString) =>
                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      endDate: dateString,
                    },
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Bidding Strategy">
              <Select
                value={wizardData.campaign.biddingStrategy}
                options={[
                  {
                    label: 'Dynamic Bids - Up and Down',
                    value: 'AUTO_FOR_SALES',
                  },
                  {
                    label: 'Dynamic Bids - Down Only',
                    value: 'LEGACY_FOR_SALES',
                  },
                  {
                    label: 'Fixed Bids',
                    value: 'MANUAL',
                  },
                ]}
                onChange={(value) =>
                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      biddingStrategy: value,
                    },
                  })
                }
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider>Placement Adjustments</Divider>

        <Row gutter={24}>
          <Col span={8}>
            <Form.Item label="Top of Search (%)">
              <InputNumber
                min={0}
                max={900}
                style={{ width: '100%' }}
                value={wizardData.campaign.placements?.topOfSearch}
                onChange={(value) =>
                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      placements: {
                        ...wizardData.campaign.placements,
                        topOfSearch: value || 0,
                      },
                    },
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Rest of Search (%)">
              <InputNumber
                min={0}
                max={900}
                style={{ width: '100%' }}
                value={wizardData.campaign.placements?.restOfSearch}
                onChange={(value) =>
                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      placements: {
                        ...wizardData.campaign.placements,
                        restOfSearch: value || 0,
                      },
                    },
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Product Pages (%)">
              <InputNumber
                min={0}
                max={900}
                style={{ width: '100%' }}
                value={wizardData.campaign.placements?.productPages}
                onChange={(value) =>
                  setWizardData({
                    ...wizardData,
                    campaign: {
                      ...wizardData.campaign,
                      placements: {
                        ...wizardData.campaign.placements,
                        productPages: value || 0,
                      },
                    },
                  })
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div
        style={{
          marginTop: 24,
          textAlign: 'right',
        }}
      >
        <Button
          type="primary"
          disabled={!wizardData.campaign.name?.trim() || !wizardData.campaign.budget}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </>
  );
}

export default CampaignStep;
