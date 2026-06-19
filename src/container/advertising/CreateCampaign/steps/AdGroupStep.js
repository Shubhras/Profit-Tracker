import { Form, Row, Col, Input, Select, InputNumber, Button } from 'antd';

function AdGroupStep({ wizardData, setWizardData, onBack, onNext }) {
  const isValid = wizardData.adGroup.name?.trim() && wizardData.adGroup.defaultBid >= 1;

  return (
    <>
      <Form layout="vertical">
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item label="Ad Group Name" required>
              <Input
                value={wizardData.adGroup.name}
                onChange={(e) =>
                  setWizardData({
                    ...wizardData,
                    adGroup: {
                      ...wizardData.adGroup,
                      name: e.target.value,
                    },
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Status">
              <Select
                value={wizardData.adGroup.state}
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
                    adGroup: {
                      ...wizardData.adGroup,
                      state: value,
                    },
                  })
                }
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item label="Default Bid" extra="Minimum bid: ₹1">
              <InputNumber
                min={1}
                step={0.01}
                style={{ width: '100%' }}
                value={wizardData.adGroup.defaultBid}
                onChange={(value) =>
                  setWizardData({
                    ...wizardData,
                    adGroup: {
                      ...wizardData.adGroup,
                      defaultBid: value,
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
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={onBack}>Back</Button>

        <Button type="primary" disabled={!isValid} onClick={onNext}>
          Next
        </Button>
      </div>
    </>
  );
}

export default AdGroupStep;
