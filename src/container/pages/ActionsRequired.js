import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Checkbox, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
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
import { getActionRequired as getActionRequiredAPI } from '../../redux/dashboard/actionCreator';

function ActionsRequired() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    getActionRequired: actionRequiredData,
    dateRange,
    loading,
    channel: globalChannel,
  } = useSelector((state) => state.dashboard);

  const [openCustomize, setOpenCustomize] = useState(false);

  const CARD_CONFIG = [
    {
      key: 'increaseAds',
      label: 'Increase Ad Spend',
      description: 'Total number of parent SKUs with positive profit.',
      value: `${actionRequiredData?.data?.increase_ad_spend?.count ?? 0} SKU`,
      path: '/admin/profit/profitTableView/sku-profit',
      profitType: 'profitable',
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
      value: actionRequiredData?.data?.payment_leaks?.formatted_amount || '₹0',
      path: '/admin/reconcile/payment-reconcile',
      bg: 'bg-[#EFF6FF]',
      iconBg: 'bg-[#E8F1FF]',
      iconColor: 'text-[#2563EB]',
      valueColor: 'text-[#2563EB]',
      icon: <DollarOutlined />,
    },

    {
      key: 'returnimpact',
      label: 'Return Impact',
      description: 'Total number of returns.',
      value: actionRequiredData?.data?.return_impact?.count ?? 0,
      path: '/admin/profit/returnfees',
      bg: 'bg-[#FFF7ED]',
      iconBg: 'bg-[#FFF0DF]',
      iconColor: 'text-[#EA580C]',
      valueColor: 'text-[#EA580C]',
      icon: <HomeOutlined />,
    },

    {
      key: 'roi',
      label: 'High ROI Products',
      description: 'Total number of SKUs with high ROI.',
      value: actionRequiredData?.data?.high_roi_products?.count ?? 0,
      path: '/admin/advertising/AdProducts',
      roiType: 'high',
      bg: 'bg-[#ECFDF5]',
      iconBg: 'bg-[#E6F8EF]',
      iconColor: 'text-[#16A34A]',
      valueColor: 'text-[#16A34A]',
      icon: <RiseOutlined />,
    },

    {
      key: 'lowroi',
      label: 'Low ROI Products',
      description: 'Total number of products with low ROI.',
      value: actionRequiredData?.data?.low_roi_products?.count ?? 0,
      path: '/admin/advertising/AdProducts',
      roiType: 'low',
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
      value: actionRequiredData?.data?.decrease_ad_spend?.count ?? 0,
      path: '/admin/profit/profitTableView/sku-profit',
      profitType: 'losing',
      bg: 'bg-[#EFF6FF]',
      iconBg: 'bg-[#E8F1FF]',
      iconColor: 'text-[#2563EB]',
      valueColor: 'text-[#2563EB]',
      icon: <TruckOutlined />,
    },
  ];

  const [visibleCards, setVisibleCards] = useState(CARD_CONFIG.map((card) => card.key));

  useEffect(() => {
    const payload = {
      fromDate: dateRange?.fromDate || null,
      toDate: dateRange?.endDate || null,
      channels: globalChannel || [],
    };

    dispatch(getActionRequiredAPI(payload));
  }, [dispatch, dateRange, globalChannel]);

  return (
    <>
      <main className="flex-1 bg-[#F8F9FB] px-5 xl:px-[15px] mb-4">
        {/* ================= PAGE HEADER ================= */}
        <Spin spinning={loading} size="large">
          <div className="pt-5 mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-[34px] h-[34px] rounded-[8px] bg-[#E8F8EE] flex items-center justify-center mt-[1px]">
                  <LineChartOutlined className="text-[20px] text-[#16A34A]" />
                </div>

                <div>
                  <h1 className="text-[20px] leading-[28px] font-semibold text-[#111827] m-0">Growth Opportunities</h1>

                  <p className="text-[12px] text-[#667085] mb-0">
                    Key opportunities and areas to focus on to grow your profits and improve performance.
                  </p>
                </div>
              </div>
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
                    <div
                      className={`w-[56px] h-[56px] shrink-0 rounded-[12px] ${card.iconBg} ${card.iconColor} flex items-center justify-center text-[25px]`}
                    >
                      {card.icon}
                    </div>

                    {/* ================= RIGHT CONTENT ================= */}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-[16px] font-semibold text-[#1F2937] leading-[17px] mb-[2px]">{card.label}</h3>

                      <p className="text-[13px] leading-[15px] text-[#667085] mt-2">{card.description}</p>
                      <div className={`text-[24px] leading-[28px] font-semibold ${card.valueColor} mt-[11px]`}>
                        {card.value}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E5E7EB] px-5 h-[43px] flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (card.path) {
                        navigate(card.path, {
                          state: {
                            channels: globalChannel,
                            type: 'all',
                            profitType: card.profitType || 'all',
                            roiType: card.roiType,
                          },
                        });
                      }
                    }}
                    className="flex items-center gap-2 text-[12px] font-semibold text-[#149A73] hover:text-[#087A5A] hover:underline transition-colors cursor-pointer"
                  >
                    View Details
                    <ArrowRightOutlined className="text-[10px]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 w-full">
            <div className="relative overflow-hidden rounded-[10px] border border-[#E1F1EB] bg-gradient-to-r from-[#F0FAF6] via-[#F5FCF9] to-[#EEF9F5] px-2 py-[10px] min-h-[100px] flex items-center">
              {/* LEFT GROWTH ICON */}
              <div className="w-[62px] h-[52px] shrink-0 flex items-center justify-center">
                <div className="relative">
                  <LineChartOutlined className="text-[38px] text-[#16A37A]" />

                  <RiseOutlined className="absolute -top-[8px] -right-[7px] text-[18px] text-[#149A73]" />
                </div>
              </div>

              {/* BANNER CONTENT */}
              <div className="flex-1 min-w-0 ml-3">
                <h3 className="m-0 text-[20px] leading-[18px] font-semibold text-[#263238]">
                  Want overall growth for your business?
                </h3>

                <p className="m-0 mt-2 text-[12px] leading-[18px] text-[#667085] max-w-[520px]">
                  Let our experts handle it for you. Take our Account Management Services and scale your business with
                  data-driven strategies and ongoing optimization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/admin/valueadded/accountmanage')}
                className="shrink-0 h-[32px] px-3 rounded-[6px] bg-[#149A73] hover:bg-[#087A5A] text-white text-[13px] font-semibold flex items-center gap-2 transition-colors duration-200 shadow-sm"
              >
                Explore Account Management Services
                <ArrowRightOutlined className="text-[15px]" />
              </button>

              <div className="ml-6 w-[85px] h-[65px] shrink-0 flex items-end justify-center">
                <img src="/icons/actionUser.png" alt="Support" className="w-[78px] h-[65px] object-contain" />
              </div>
            </div>
          </div>
        </Spin>
      </main>

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
