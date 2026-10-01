import { Row, Col, Input, Select, InputNumber, Button } from 'antd';

function AdGroupStep({ wizardData, setWizardData, onBack, onNext }) {
  const isValid = wizardData.adGroup.name?.trim() && wizardData.adGroup.defaultBid >= 1;

  return (
    <>
      <div className="w-full rounded-2xl bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <div className="mb-3 sm:mb-4">
              <label className="block mb-2 text-sm font-medium text-[#272b41] dark:text-white60">
                <span className="text-[#ff4d4f] mr-1 font-sans">*</span>Ad Group Name
              </label>
              <Input
                placeholder="Enter ad group name"
                className="h-10 w-full rounded-lg border-gray-200 dark:border-white/15 dark:bg-transparent dark:text-white"
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

          <Col xs={24} sm={24} md={12} lg={12}>
            <div className="mb-3 sm:mb-4">
              <label className="block mb-2 text-sm font-medium text-[#272b41] dark:text-white60">Status</label>
              <Select
                className="w-full h-10"
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

          <Col xs={24} sm={24} md={12} lg={12}>
            <div className="mb-3 sm:mb-4">
              <label className="block mb-2 text-sm font-medium text-[#272b41] dark:text-white60">Default Bid</label>
              <InputNumber
                min={1}
                step={0.01}
                style={{ width: '100%' }}
                className="w-full h-10 rounded-lg flex items-center"
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

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between gap-3">
          <Button className="h-10 px-6 rounded-lg font-medium" onClick={onBack}>
            Back
          </Button>

          <Button type="primary" className="h-10 px-6 rounded-lg font-medium" disabled={!isValid} onClick={onNext}>
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

export default AdGroupStep;
