import { Form, Row, Col, Input, Select, InputNumber, DatePicker, Button, Divider, Modal, message } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import { getPortfolios, createPortfolio } from '../../../../redux/advertising/actionCreator';

function CampaignStep({ wizardData, setWizardData, onNext }) {
  const dispatch = useDispatch();
  const [portfolios, setPortfolios] = useState([]);
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [portfolioName, setPortfolioName] = useState('');
  const [creatingPortfolio, setCreatingPortfolio] = useState(false);

  useEffect(() => {
    const fetchPortfolios = async () => {
      const response = await dispatch(getPortfolios());

      if (Array.isArray(response)) {
        setPortfolios(response);
      }
    };

    fetchPortfolios();
  }, [dispatch]);

  const handleCreatePortfolio = async () => {
    try {
      setCreatingPortfolio(true);

      const exists = portfolios.some((portfolio) => portfolio.name === portfolioName.trim());

      if (exists) {
        message.error('Portfolio already exists');
        return;
      }

      const response = await dispatch(
        createPortfolio({
          name: portfolioName.trim(),
        }),
      );

      if (!response?.status) {
        if (response?.errors?.length > 0) {
          response.errors.forEach((error) => {
            message.error(error.message);
          });
        } else {
          message.error(response?.message || 'Failed to create portfolio');
        }

        return;
      }

      const createdPortfolio = response.data?.[0];

      setPortfolios((prev) => [
        ...prev,
        {
          portfolio_id: createdPortfolio.portfolio_id,
          name: createdPortfolio.name,
        },
      ]);

      setWizardData({
        ...wizardData,
        campaign: {
          ...wizardData.campaign,
          portfolioId: createdPortfolio.portfolio_id,
          portfolioName: createdPortfolio.name,
        },
      });

      setPortfolioName('');

      setPortfolioModalOpen(false);

      message.success('Portfolio created successfully');
    } finally {
      setCreatingPortfolio(false);
    }
  };

  return (
    <>
      <div className="w-full rounded-lg bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-sm">
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item label="Campaign Name" required className="mb-3 sm:mb-4">
                <Input
                  placeholder="Enter campaign name"
                  className="h-10 w-full rounded-l border-gray-200 dark:border-white/15 dark:bg-transparent dark:text-white"
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

            <Col xs={24} sm={24} md={12} lg={12}>
              <div className="mb-3 sm:mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[#272b41] dark:text-white60">Portfolio</label>
                  <Button type="link" className="p-0 h-auto text-xs" onClick={() => setPortfolioModalOpen(true)}>
                    + Create Portfolio
                  </Button>
                </div>
                <Select
                  className="w-full h-10"
                  style={{ width: '100%' }}
                  allowClear
                  placeholder="Select Portfolio"
                  value={wizardData.campaign.portfolioId}
                  options={portfolios.map((portfolio) => ({
                    label: portfolio.name,
                    value: portfolio.portfolio_id,
                  }))}
                  onChange={(value, option) =>
                    setWizardData({
                      ...wizardData,
                      campaign: {
                        ...wizardData.campaign,
                        portfolioId: value,
                        portfolioName: option?.label || '',
                      },
                    })
                  }
                />
              </div>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item label="Campaign Status" className="mb-3 sm:mb-4">
                <Select
                  className="w-full h-10"
                  style={{ width: '100%' }}
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

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item label="Targeting Type" className="mb-3 sm:mb-4">
                <Select
                  className="w-full h-10"
                  style={{ width: '100%' }}
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

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item label="Daily Budget" required extra="Minimum budget: ₹50" className="mb-3 sm:mb-4">
                <InputNumber
                  type="number"
                  className="w-full h-10 rounded-lg flex items-center"
                  style={{ width: '100%' }}
                  placeholder="Enter daily budget"
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

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item label="Bidding Strategy" className="mb-3 sm:mb-4">
                <Select
                  className="w-full h-10"
                  style={{ width: '100%' }}
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

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item label="Start Date" className="mb-3 sm:mb-4">
                <DatePicker
                  className="w-full h-10 rounded-lg"
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

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item label="End Date" className="mb-3 sm:mb-4">
                <DatePicker
                  className="w-full h-10 rounded-lg"
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
          </Row>

          <Divider className="my-6">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Placement Adjustments</span>
          </Divider>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={8}>
              <Form.Item label="Top of Search (%)" className="mb-3">
                <InputNumber
                  min={0}
                  max={900}
                  className="w-full h-10 rounded-lg flex items-center"
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

            <Col xs={24} sm={12} md={8} lg={8}>
              <Form.Item label="Rest of Search (%)" className="mb-3">
                <InputNumber
                  min={0}
                  max={900}
                  className="w-full h-10 rounded-lg flex items-center"
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

            <Col xs={24} sm={12} md={8} lg={8}>
              <Form.Item label="Product Pages (%)" className="mb-3">
                <InputNumber
                  min={0}
                  max={900}
                  className="w-full h-10 rounded-lg flex items-center"
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

        <Modal
          title="Create Portfolio"
          open={portfolioModalOpen}
          confirmLoading={creatingPortfolio}
          onCancel={() => setPortfolioModalOpen(false)}
          onOk={handleCreatePortfolio}
        >
          <Input
            placeholder="Portfolio Name"
            className="h-10 rounded-lg"
            value={portfolioName}
            onChange={(e) => setPortfolioName(e.target.value)}
          />
        </Modal>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-end">
          <Button
            type="primary"
            className="h-10 px-6 rounded-lg font-medium"
            disabled={!wizardData.campaign.name?.trim() || !wizardData.campaign.budget}
            onClick={onNext}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

export default CampaignStep;
