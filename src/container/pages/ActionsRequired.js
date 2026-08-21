import React, { useState } from 'react';
import { Modal, Checkbox } from 'antd';
import {
  ArrowRightOutlined,
  DollarOutlined,
  HomeOutlined,
  TruckOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  // LineChartOutlined,
  // FallOutlined,
  // WarningOutlined,
  // UndoOutlined,
  // CloseCircleOutlined,
  // PercentageOutlined,
  // TagsOutlined,
  // ShoppingOutlined,
  // StopOutlined,
  // SoundOutlined,
} from '@ant-design/icons';

function ActionsRequired() {
  const CARD_CONFIG = [
    {
      key: 'increaseAds',
      label: 'Increase Ad Spend',
      description: 'Total number of parent SKUs with positive profit.',
      value: '₹39,968',
      secondaryLabel: 'Parent ID',
      secondaryValue: '5',
      bg: 'bg-white',
      iconBg: 'bg-[#E8F8EE]',
      iconColor: 'text-[#16A34A]',
      valueColor: 'text-[#16A34A]',
      icon: <LineChartOutlined />,
    },
    {
      key: 'paymentLeaks',
      label: 'Payment Leaks',
      description: 'Total amount to recover for payments not matching with estimated.',
      value: '₹163',
      secondaryLabel: 'Orders #',
      secondaryValue: '8',
      bg: 'bg-[#EFF6FF]',
      iconBg: 'bg-[#E8F1FF]',
      iconColor: 'text-[#2563EB]',
      valueColor: 'text-[#2563EB]',
      icon: <DollarOutlined />,
    },

    {
      key: 'returnimpact',
      label: 'Return Impact',
      description: 'Total number of return MP fees',
      value: '32',
      secondaryLabel: 'SKU #',
      secondaryValue: '0',
      bg: 'bg-[#FFF7ED]',
      iconBg: 'bg-[#FFF0DF]',
      iconColor: 'text-[#EA580C]',
      valueColor: 'text-[#EA580C]',
      icon: <HomeOutlined />,
    },

    {
      key: 'roi',
      label: 'High ROI Products',
      description: 'Total number of SKUs with high ROI',
      value: '₹1,37,965',
      secondaryLabel: 'Orders #',
      secondaryValue: '1260',
      bg: 'bg-[#ECFDF5]',
      iconBg: 'bg-[#E6F8EF]',
      iconColor: 'text-[#16A34A]',
      valueColor: 'text-[#16A34A]',
      icon: <RiseOutlined />,
    },

    {
      key: 'lowroi',
      label: 'Low ROI Products',
      description: 'Total number of products with low ROI',
      value: '₹15',
      secondaryLabel: 'Orders #',
      secondaryValue: '1',
      bg: 'bg-[#EFF6FF]',
      iconBg: 'bg-[#E8F1FF]',
      iconColor: 'text-[#2563EB]',
      valueColor: 'text-[#2563EB]',
      icon: <FallOutlined />,
    },

    {
      key: 'decreaseAdSpend',
      label: 'Decrease Ad Spend',
      description: 'Total number of parent SKUs with negative profit.',
      value: '₹3,157',
      secondaryLabel: 'Orders # / SKU',
      secondaryValue: '677 / 55',
      bg: 'bg-[#EFF6FF]',
      iconBg: 'bg-[#E8F1FF]',
      iconColor: 'text-[#2563EB]',
      valueColor: 'text-[#2563EB]',
      icon: <TruckOutlined />,
    },
  ];

  const [openCustomize, setOpenCustomize] = useState(false);

  const [visibleCards, setVisibleCards] = useState(CARD_CONFIG.map((card) => card.key));

  return (
    <>
      <main className="min-h-[715px] flex-1 bg-[#F8F9FB] px-8 xl:px-[15px] pb-[40px]">
        {/* ================= PAGE HEADER ================= */}

        <div className="pt-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-[34px] h-[34px] rounded-[8px] bg-[#E8F8EE] flex items-center justify-center mt-[1px]">
                <LineChartOutlined className="text-[20px] text-[#16A34A]" />
              </div>

              <div>
                <h1 className="text-[20px] leading-[28px] font-semibold text-[#1F2937] m-0">Growth Opportunities</h1>

                <p className="text-[12px] text-[#667085] mb-0">
                  Key opportunities and areas to focus on to grow your profits and improve performance.
                </p>
              </div>
            </div>

            {/* CUSTOMIZE BUTTON */}

            {/* <Button
              onClick={() => setOpenCustomize(true)}
              className="!h-[34px] !px-3 !rounded-[7px] !border-[#D9DEE7] !text-[11px] flex items-center gap-2"
            >
              <SettingOutlined />
              Customize Cards
            </Button> */}
          </div>
        </div>

        {/* ================= CARDS ================= */}

        <div className="grid grid-cols-3 gap-5 2xl:grid-cols-3 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-1">
          {CARD_CONFIG.filter((card) => visibleCards.includes(card.key)).map((card) => (
            <div
              key={card.key}
              className={`group ${card.bg} bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden shadow-[0_1px_3px_rgba(16,24,40,0.04)] hover:shadow-[0_4px_14px_rgba(16,24,40,0.08)] transition-shadow duration-200`}
            >
              {/* ================= CARD CONTENT ================= */}

              <div className="px-4 pt-5 pb-4 min-h-[145px]">
                <div className="flex items-start gap-4">
                  {/* ================= ICON ================= */}

                  <div
                    className={`w-[56px] h-[56px] shrink-0 rounded-[12px] ${card.iconBg} ${card.iconColor} flex items-center justify-center text-[25px]`}
                  >
                    {card.icon}
                  </div>

                  {/* ================= RIGHT CONTENT ================= */}

                  <div className="flex-1 min-w-0">
                    {/* TITLE */}

                    <h3 className="text-[16px] font-semibold text-[#1F2937] leading-[17px] mb-[2px]">{card.label}</h3>

                    {/* DESCRIPTION */}

                    <p className="text-[13px] leading-[15px] text-[#667085] mt-2">{card.description}</p>

                    {/* VALUE */}

                    <div className={`text-[24px] leading-[28px] font-semibold ${card.valueColor} mt-[11px]`}>
                      {card.value}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= CARD FOOTER ================= */}

              <div className="border-t border-[#E5E7EB] px-5 h-[43px] flex items-center">
                <button
                  type="button"
                  className="flex items-center gap-2 text-[12px] font-semibold text-[#149A73] hover:text-[#087A5A] hover:underline transition-colors"
                >
                  View Details
                  <ArrowRightOutlined className="text-[10px]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ================= CUSTOMIZE MODAL ================= */}

      <Modal
        title="Customize Your Cards"
        open={openCustomize}
        onCancel={() => setOpenCustomize(false)}
        footer={null}
        width={720}
        centered
      >
        {/* SELECT ALL */}

        <div className="mb-4">
          <Checkbox
            checked={visibleCards.length === CARD_CONFIG.length}
            indeterminate={visibleCards.length > 0 && visibleCards.length < CARD_CONFIG.length}
            onChange={(e) => setVisibleCards(e.target.checked ? CARD_CONFIG.map((card) => card.key) : [])}
          >
            Select All
          </Checkbox>
        </div>

        {/* CARD SELECTION */}

        <div className="grid grid-cols-2 gap-3">
          {CARD_CONFIG.map((card) => (
            <div key={card.key} className="bg-gray-50 border border-gray-100 rounded-md px-3 py-2">
              <Checkbox
                checked={visibleCards.includes(card.key)}
                onChange={(e) => {
                  setVisibleCards((prev) =>
                    e.target.checked ? [...prev, card.key] : prev.filter((key) => key !== card.key),
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
