import { Row, Col, Input, Select, InputNumber, Button } from 'antd';

function AdGroupStep({ wizardData, setWizardData, onBack, onNext }) {
  const isValid = wizardData.adGroup.name?.trim() && wizardData.adGroup.defaultBid >= 1;

  return (
    <>
      <main className="min-h-[600px] px-4 pb-[10px] py-3 bg-white">
        <Row gutter={24}>
          <Col span={12}>
            <div className="mb-[24px]">
              <label className="block mb-2 text-sm font-medium text-[#272b41] dark:text-white60">
                <span className="text-[#ff4d4f] mr-1 font-sans">*</span>Ad Group Name
              </label>
              <Input
                className="h-10 border-gray-200 dark:border-white/15 dark:bg-transparent dark:text-white"
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
            </div>
          </Col>

          <Col span={12}>
            <div className="mb-[24px]">
              <label className="block mb-2 text-sm font-medium text-[#272b41] dark:text-white60">Status</label>
              <Select
                className="w-full"
                style={{ width: '100%' }}
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
            </div>
          </Col>

          <Col span={12}>
            <div className="mb-[24px]">
              <label className="block mb-2 text-sm font-medium text-[#272b41] dark:text-white60">Default Bid</label>
              <InputNumber
                min={1}
                step={0.01}
                style={{ width: '100%' }}
                className="w-full"
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
              <div className="text-xs text-[#8c90a4] dark:text-white60 mt-1">Minimum bid: ₹1</div>
            </div>
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

          <Button type="primary" disabled={!isValid} onClick={onNext}>
            Next
          </Button>
        </div>
      </main>
    </>
  );
}

export default AdGroupStep;
