import React, { lazy, Suspense, useState } from 'react';
import { Row, Col, Skeleton, Modal, Checkbox, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Cards } from '../../components/cards/frame/cards-frame';

const OverviewDataList = lazy(() => import('../dashboard/overview/demoTwo/OverviewDataList'));

function ActionsRequired() {
  const PageRoutes = [
    {
      path: 'index',
      breadcrumbName: 'Actions Required',
    },
  ];
  const [openCustomize, setOpenCustomize] = useState(false);
  const CARD_CONFIG = [
    {
      key: 'paymentLeaks',
      label: 'Payment Leaks',
      bg: 'bg-[#ECFDF5]',
      titleColor: 'text-[#059669]',
      rows: [
        ['Potential Savings', '₹163'],
        ['Orders #', '8'],
      ],
    },
    {
      key: 'increaseAds',
      label: 'Opportunity to increase Ads',
      bg: 'bg-[#ECFDF5]',
      titleColor: 'text-[#059669]',
      rows: [
        ['Potential Opportunity', '₹39,968'],
        ['Parent ID', '5'],
      ],
    },
    {
      key: 'warehouseShipping',
      label: 'New warehouse opportunity to reduce shipping costs',
      bg: 'bg-[#ECFDF5]',
      titleColor: 'text-[#059669]',
      rows: [
        ['Potential Savings', '-'],
        ['SKU #', '0'],
      ],
    },
    {
      key: 'delayedPayments',
      label: 'Delayed Payments',
      bg: 'bg-[#ECFDF5]',
      titleColor: 'text-[#059669]',
      rows: [
        ['Unlock Cash', '₹1,37,965'],
        ['Orders #', '1260'],
      ],
    },
    {
      key: 'delayedCashback',
      label: 'Delayed Cashback',
      bg: 'bg-[#ECFDF5]',
      titleColor: 'text-[#059669]',
      rows: [
        ['Unlock Cash', '₹15'],
        ['Orders #', '1'],
      ],
    },
    {
      key: 'shippingOverages',
      label: 'Shipping Cost overages',
      bg: 'bg-[#EFF6FF]',
      titleColor: 'text-[#2563EB]',
      rows: [
        ['Potential Savings', '₹3,157'],
        ['Orders # / SKU', '677 / 55'],
      ],
    },
    {
      key: 'adSpendIssues',
      label: 'Ad Spend issues',
      bg: 'bg-[#EFF6FF]',
      titleColor: 'text-[#2563EB]',
      rows: [
        ['Potential Savings', '₹50,365'],
        ['Parent ID', '24'],
      ],
    },
    {
      key: 'lossMakingIncrease',
      label: 'Loss Making - Increase Price',
      bg: 'bg-[#FFF7ED]',
      titleColor: 'text-[#EA580C]',
      rows: [
        ['Potential Impact', '₹467'],
        ['SKU #', '7'],
      ],
    },
    {
      key: 'customerReturn',
      label: 'Customer Return problems',
      bg: 'bg-[#FFF7ED]',
      titleColor: 'text-[#EA580C]',
      rows: [
        ['Potential Impact', '-'],
        ['SKU #', '0'],
      ],
    },
    {
      key: 'courierReturn',
      label: 'Courier Return problems',
      bg: 'bg-[#FFF7ED]',
      titleColor: 'text-[#EA580C]',
      rows: [
        ['Potential Impact', '₹913'],
        ['SKU #', '1'],
      ],
    },
    {
      key: 'cancellationIssues',
      label: 'Cancellation issues',
      bg: 'bg-[#FFF7ED]',
      titleColor: 'text-[#EA580C]',
      rows: [
        ['Potential Impact', '-'],
        ['SKU #', '0'],
      ],
    },
    {
      key: 'replacementOrder',
      label: 'Replacement order %',
      bg: 'bg-[#FFF7ED]',
      titleColor: 'text-[#EA580C]',
      rows: [
        ['Potential Impact', '-'],
        ['SKU #', '0'],
      ],
    },
    {
      key: 'negativeReviews',
      label: 'Negative Reviews',
      bg: 'bg-[#FFF7ED]',
      titleColor: 'text-[#EA580C]',
      rows: [
        ['Potential Impact', '-'],
        ['SKU #', '0'],
      ],
    },
    {
      key: 'priceDecrease',
      label: 'Price Recommendations - Decrease Price',
      bg: 'bg-[#EFF6FF]',
      titleColor: 'text-[#2563EB]',
      rows: [
        ['Potential Savings', '-'],
        ['SKU #', '0'],
      ],
    },
    {
      key: 'priceIncrease',
      label: 'Price Recommendations - Increase Price',
      bg: 'bg-[#EFF6FF]',
      titleColor: 'text-[#2563EB]',
      rows: [
        ['Potential Savings', '-'],
        ['SKU #', '0'],
      ],
    },
    {
      key: 'priceCompliance',
      label: 'Price Compliance Cards breached',
      bg: 'bg-[#ECFDF5]',
      titleColor: 'text-[#059669]',
      rows: [
        ['Potential Savings', '-'],
        ['SKU #', '0'],
      ],
    },
    {
      key: 'discountCompliance',
      label: 'Discount Compliance Cards breached',
      bg: 'bg-[#ECFDF5]',
      titleColor: 'text-[#059669]',
      rows: [
        ['Potential Savings', '-'],
        ['SKU #', '0'],
      ],
    },
    {
      key: 'outOfStockAdSpend',
      label: 'Out of stock - Ad Spend',
      bg: 'bg-[#ECFDF5]',
      titleColor: 'text-[#059669]',
      rows: [
        ['Potential Savings', '₹4,256'],
        ['SKU #', '18'],
      ],
    },
  ];

  // store visible card keys
  const [visibleCards, setVisibleCards] = useState(CARD_CONFIG.map((c) => c.key));
  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Actions Required"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Row justify="center">
          <Col xs={24}>
            <Suspense
              fallback={
                <Cards headless>
                  <Skeleton active />
                </Cards>
              }
            >
              <OverviewDataList />
            </Suspense>
          </Col>
        </Row>
        <Row justify="end">
          <Button onClick={() => setOpenCustomize(true)}>
            <span className="flex items-center gap-2">
              <SettingOutlined />
              Customize Cards
            </span>
          </Button>
        </Row>
        <Row gutter={[16, 16]} className="mt-[25px]">
          {CARD_CONFIG.filter((card) => visibleCards.includes(card.key)).map((card) => (
            <Col key={card.key} xxl={8} xl={8} md={12} xs={24}>
              <div className={`${card.bg} rounded-xl p-4`}>
                <h3 className={`text-sm font-semibold mb-3 ${card.titleColor}`}>{card.label}</h3>

                {card.rows.map((row, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{row[0]}</span>
                    <span className="font-semibold text-gray-900">{row[1]}</span>
                  </div>
                ))}
              </div>
            </Col>
          ))}
        </Row>
      </main>
      <Modal
        title="Customize Your Cards"
        open={openCustomize}
        onCancel={() => setOpenCustomize(false)}
        footer={null}
        width={720}
      >
        {/* Select All */}
        <div className="mb-4">
          <Checkbox
            checked={visibleCards.length === CARD_CONFIG.length}
            indeterminate={visibleCards.length > 0 && visibleCards.length < CARD_CONFIG.length}
            onChange={(e) => setVisibleCards(e.target.checked ? CARD_CONFIG.map((c) => c.key) : [])}
          >
            Select All
          </Checkbox>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CARD_CONFIG.map((card) => (
            <div key={card.key} className="bg-gray-50 rounded-md px-3 py-2">
              <Checkbox
                checked={visibleCards.includes(card.key)}
                onChange={(e) => {
                  setVisibleCards((prev) =>
                    e.target.checked ? [...prev, card.key] : prev.filter((k) => k !== card.key),
                  );
                }}
              >
                {card.label}
              </Checkbox>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}

export default ActionsRequired;
