import React, { useEffect, useState } from 'react';
import { Skeleton, Alert, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { getSubscriptionList } from '../../../../redux/admin/actionCreator';
import { selectPlan } from '../../../../redux/subscription/actionCreator';

const { Text } = Typography;

/* ============================================================
   TOKENS (matched to reference design)
   ink        #10182B  – headlines, price
   paper      #FAFAF8  – page background
   line       #E7E8E4  – hairline / dividers
   profit     #0C8B5E  – accent: checks, CTA, selection, starter trial
   ledger     #B8860B  – accent: savings badge
   muted      #6B7280  – body copy
============================================================ */

// -------------------------------------------------------------
// Skeleton (loading) card — mirrors the new layout
// -------------------------------------------------------------
function PricingCardSkeleton() {
  return (
    <div className="h-full bg-white border border-[#E7E8E4] rounded-3xl overflow-hidden">
      <div className="px-6 pt-5 pb-4">
        <Skeleton.Input active size="small" style={{ width: 70, height: 11 }} className="mb-2" />
        <Skeleton.Input active size="large" style={{ width: 140, height: 22 }} className="mb-2" />
        <Skeleton.Input active size="small" style={{ width: '90%', height: 14 }} />
      </div>
      <div className="px-6 py-5">
        <Skeleton.Input active size="large" style={{ width: 160, height: 36 }} className="mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Skeleton.Avatar active size="small" shape="circle" style={{ width: 14, height: 14 }} />
              <Skeleton.Input active size="small" style={{ width: '75%', height: 13 }} />
            </div>
          ))}
        </div>
        <Skeleton.Button active size="large" shape="default" style={{ width: '100%', height: 46 }} className="mt-6" />
      </div>
    </div>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

// -------------------------------------------------------------
// Pricing card — statement / ledger style, matched to reference
// -------------------------------------------------------------
function PricingCard({ plan, index, onSelect, selectedPlanId, setSelectedPlanId, selectedType }) {
  const isSelected = selectedPlanId === plan.id;
  const isTrial = plan.plan_name?.toLowerCase().includes('starter');
  // Kept as an index-based "recommended" highlight since the API doesn't yet
  // send a dedicated flag — purely a visual affordance, no functional change.
  const isRecommended = !isTrial && index === 1;

  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const currentPrice = selectedType === 'monthly' ? plan.monthly_price : plan.annual_price;
  const savePct = Math.round(Number(plan.discount_percentage || 0));

  const borderColor = isTrial || isRecommended ? '#0C8B5E' : isSelected ? '#0C8B5E' : '#E7E8E4';
  const cardBg = isTrial ? '#F3FAF7' : '#FFFFFF';

  // The API description for the trial plan sometimes already repeats
  // "7-Day Free Trial" at the start (since that's also the heading) — strip
  // that redundant prefix so the subtitle reads cleanly, as in the reference.
  const displaySubtitle = isTrial
    ? (plan.subtitle || '').replace(/^\s*7[\s-]*day\s*free\s*trial\s*/i, '').trim()
    : plan.subtitle;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setSelectedPlanId(plan.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedPlanId(plan.id);
          }
        }}
        className={`
          relative h-full flex flex-col rounded-3xl overflow-hidden
          transition-all duration-300 cursor-pointer
          ${
            isSelected || isTrial || isRecommended
              ? 'shadow-[0_10px_28px_rgba(12,139,94,0.12)]'
              : 'shadow-[0_1px_6px_rgba(16,24,40,0.04)] hover:shadow-[0_8px_22px_rgba(16,24,40,0.07)]'
          }
        `}
        style={{
          border: `1px solid ${borderColor}`,
          backgroundColor: cardBg,
        }}
      >
        {/* recommended header bar — reserved on all non-trial cards so titles
            align in a row; only visibly shown on the recommended card */}
        {!isTrial && (
          <div
            className={`flex items-center justify-between px-4 py-1.5 ${
              isRecommended ? 'bg-[#0C8B5E]' : 'bg-transparent'
            }`}
          >
            <span
              className="text-[11px] font-semibold tracking-wide"
              style={{ color: isRecommended ? '#fff' : 'transparent' }}
            >
              Most Popular
            </span>
            <CheckOutlined style={{ color: isRecommended ? '#fff' : 'transparent', fontSize: 11 }} />
          </div>
        )}

        {/* ===================== HEADER ===================== */}
        <div className="px-6 pt-5 pb-4">
          {isTrial && (
            <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] mb-1.5 text-[#98A2B3]">
              {plan.plan_name}
            </span>
          )}

          <h2 className="text-[19px] font-bold leading-tight mb-1.5" style={{ color: isTrial ? '#0C8B5E' : '#10182B' }}>
            {isTrial ? '7-Day Free Trial' : plan.plan_name}
          </h2>

          {displaySubtitle && (
            <p
              className="text-[13px] leading-[19px] text-[#6B7280]"
              style={
                isTrial
                  ? undefined
                  : {
                      minHeight: 38,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }
              }
            >
              {displaySubtitle}
            </p>
          )}
        </div>

        {/* ===================== TRIAL CTA (mid-card, before Includes) =====================
            The trial card's button sits right after the description, matching
            the reference — unlike the paid cards where the CTA sits at the
            bottom of the card. */}
        {isTrial && (
          <div className="px-6 pb-2 pt-3">
            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
              <button
                type="button"
                size="large"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect({
                    ...plan,
                    selectedType,
                    selectedPrice: selectedType === 'monthly' ? plan.monthly_price : plan.annual_price,
                  });
                }}
                className="w-full h-[48px] rounded-[14px] font-bold text-[14px] border-none cursor-pointer text-white"
                style={{ background: '#0C8B5E', color: '#fff' }}
              >
                Start Free Trial
              </button>
            </motion.div>
            <p className="text-center text-[11px] text-[#98A2B3] mt-2">
              ₹5 refundable charge to verify your payment method
            </p>
          </div>
        )}

        {/* ===================== BODY ===================== */}
        <div className={`px-6 flex-grow flex flex-col ${isTrial ? 'pb-6' : ''}`}>
          {!isTrial && (
            <div className="mb-2">
              <div className="flex items-end gap-1.5">
                <span className="font-mono tabular-nums text-[30px] leading-[34px] font-bold text-[#10182B] tracking-tight">
                  ₹{Math.trunc(Number(currentPrice || 0)).toLocaleString('en-IN')}
                </span>
                <span className="text-[13px] text-[#98A2B3] pb-[4px] font-mono">
                  /{selectedType === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1.5 min-h-[20px]">
                <span className="text-[12px] text-[#98A2B3]">
                  {selectedType === 'monthly' ? 'billed monthly' : 'billed annually'}
                </span>
                {selectedType === 'annual' && savePct > 0 && (
                  <span className="text-[10px] font-semibold text-[#0C8B5E] bg-[#E7F5EE] rounded px-1.5 py-[1px]">
                    SAVE {savePct}%
                  </span>
                )}
              </div>
            </div>
          )}

          {!isTrial && plan.specs && plan.specs.length > 0 && (
            <div className="space-y-2 mb-1">
              {plan.specs.map((spec, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4">
                  <span className="text-[13px] text-[#98A2B3]">{spec.label}</span>
                  <span className="text-[13px] font-bold text-[#10182B] text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[#EEEFEC] my-4" />

          {/* features */}
          <div className="mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98A2B3]">
              {isTrial ? 'What you get during trial' : 'Includes'}
            </span>

            <ul className="mt-3 space-y-2.5">
              {(isTrial ? plan.features.slice(0, 2) : showAllFeatures ? plan.features : plan.features.slice(0, 4)).map(
                (feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                    className="flex items-start gap-2"
                  >
                    <CheckOutlined style={{ color: '#0C8B5E', fontSize: 12, marginTop: 3 }} />
                    <Text className="text-[13px] leading-[19px] text-[#374151]">{feature}</Text>
                  </motion.li>
                ),
              )}
            </ul>

            {!isTrial && plan.features.length > 4 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllFeatures((prev) => !prev);
                }}
                className="mt-2.5 text-[12px] font-semibold text-[#0C8B5E] underline underline-offset-2 cursor-pointer bg-transparent border-none p-0"
              >
                {showAllFeatures ? 'Show less' : `+${plan.features.length - 4} more`}
              </button>
            )}
          </div>
        </div>

        {/* ===================== CTA (paid plans only) ===================== */}
        {!isTrial && (
          <div className="px-6 pb-6 pt-2">
            <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect({
                    ...plan,
                    selectedType,
                    selectedPrice: selectedType === 'monthly' ? plan.monthly_price : plan.annual_price,
                  });
                }}
                className="w-full h-[48px] rounded-[14px] font-bold text-[14px] border-none cursor-pointer text-white"
                style={{
                  background: isRecommended ? '#0C8B5E' : '#10182B',
                }}
              >
                {plan.button?.text || 'Buy now'}
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

PricingCard.propTypes = {
  plan: PropTypes.shape({
    plan_name: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    monthly_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    annual_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    discount_percentage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    terms_and_conditions: PropTypes.arrayOf(PropTypes.string),
    button: PropTypes.shape({ text: PropTypes.string.isRequired }).isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    specs: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      }),
    ),
  }).isRequired,
  index: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedPlanId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setSelectedPlanId: PropTypes.func.isRequired,
  selectedType: PropTypes.string.isRequired,
};

// -------------------------------------------------------------
// Container
// -------------------------------------------------------------
function PricingCards() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.login);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedType, setSelectedType] = useState('monthly');

  const { getsubscriptionData, loading } = useSelector((state) => state.AdminDashboard);
  const pricingPlans = getsubscriptionData?.results?.data || [];
  const averageDiscount =
    pricingPlans.length > 1
      ? Math.round(
          pricingPlans.reduce((sum, plan) => sum + Number(plan.average_discount || 0), 0) / (pricingPlans.length - 1),
        )
      : 0;

  // const averageDiscount =
  //   pricingPlans.length > 0
  //     ? Math.round(
  //         pricingPlans.reduce((sum, plan) => sum + Number(plan.average_discount || 0), 0) / pricingPlans.length,
  //       )
  //     : 0;

  useEffect(() => {
    dispatch(getSubscriptionList());
  }, [dispatch]);

  // const handlePlanSelect = (plan) => {
  //   dispatch(selectPlan(plan));
  //   const growthPlan = pricingPlans.find((item) => item.slug === 'growth-plan');

  //   if (isLoggedIn) {
  //     navigate('/checkout', { state: { plan, growthPlan } });
  //   } else {
  //     sessionStorage.setItem('selectedPlan', JSON.stringify({ ...plan, growthPlan }));
  //     navigate('/auth/login', { state: { redirectTo: '/checkout', plan } });
  //   }
  // };
  const handlePlanSelect = (plan) => {
    const selectedPlan = {
      ...plan,
      selectedType,
      selectedPrice: selectedType === 'monthly' ? plan.monthly_price : plan.annual_price,
    };

    dispatch(selectPlan(selectedPlan));

    const growthPlan = pricingPlans.find((item) => item.slug === 'growth-plan');

    const checkoutData = {
      plan: selectedPlan,
      growthPlan,
      selectedType,
    };

    if (isLoggedIn) {
      navigate('/checkout', {
        state: checkoutData,
      });
    } else {
      sessionStorage.setItem('selectedPlan', JSON.stringify(checkoutData));

      navigate('/auth/login', {
        state: {
          redirectTo: '/checkout',
          ...checkoutData,
        },
      });
    }
  };
  const mapApiPlanToComponent = (plan) => {
    // Optional statement-style spec rows (Order volume / Data export / Data
    // sync / Integration limit) shown in the reference design. Only rendered
    // when the API actually provides these fields — no dummy data is added.
    const specFieldMap = [
      { key: 'order_volume', label: 'Order volume' },
      { key: 'data_export', label: 'Data export' },
      { key: 'data_sync', label: 'Data sync' },
      { key: 'integration_limit', label: 'Integration limit' },
    ];
    const specs = specFieldMap
      .filter(({ key }) => plan[key] !== undefined && plan[key] !== null && plan[key] !== '')
      .map(({ key, label }) => ({ label, value: plan[key] }));

    return {
      plan_name: plan.plan_name,
      subtitle: plan.description || '',
      discount_percentage: plan.discount_percentage,
      features: plan.features || [],
      terms_and_conditions: plan.terms_and_conditions || [],
      monthly_price: plan.monthly_price,
      annual_price: plan.annual_price,
      button: { text: 'Buy now' },
      id: plan.id,
      subscription_type: plan.subscription_type,
      specs,
    };
  };

  if (loading) {
    return (
      <main className="px-[3%] pt-10 min-lg:pt-20 pb-10 min-lg:pb-20 max-w-7xl mx-auto">
        <div className="grid gap-6 grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <PricingCardSkeleton key={item} />
          ))}
        </div>
      </main>
    );
  }

  if (pricingPlans.length === 0) {
    return (
      <main className="px-[3%] pt-10 min-lg:pt-20 pb-10 min-lg:pb-20 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            message="No pricing plans available"
            description="There are currently no pricing plans available. Please check back later."
            type="info"
            showIcon
            className="rounded-xl"
          />
        </motion.div>
      </main>
    );
  }

  return (
    <main className="px-[3%] pt-10 min-lg:pt-10 pb-10 min-lg:pb-20 bg-[#FAFAF8]">
      {/* ===================== TOGGLE ===================== */}
      <div className="flex flex-col items-center mb-3">
        <div className="inline-flex items-center bg-white border border-[#E7E8E4] rounded-full p-1 gap-1 relative">
          <button
            type="button"
            onClick={() => setSelectedType('monthly')}
            className={`relative z-10 px-5 py-2 text-[13px] font-semibold rounded-full transition-colors duration-200 ${
              selectedType === 'monthly' ? 'text-white' : 'text-[#10182B]'
            }`}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('annual')}
            className={`relative z-10 px-5 py-2 text-[13px] font-semibold rounded-full transition-colors duration-200 flex items-center gap-2 ${
              selectedType === 'annual' ? 'text-white' : 'text-[#10182B]'
            }`}
          >
            Yearly
            <span
              className={`text-[10px] font-semibold rounded-full px-1.5 py-1 ${
                selectedType === 'annual' ? 'bg-[#0C8B5E] text-white' : 'bg-[#E7F5EE] text-[#0C8B5E]'
              }`}
            >
              Save {averageDiscount}%
            </span>
          </button>

          {/* sliding thumb */}
          <span
            className="absolute top-1 bottom-1 rounded-full bg-[#10182B] transition-all duration-250 ease-out"
            style={{
              left: selectedType === 'monthly' ? '4px' : undefined,
              right: selectedType === 'annual' ? '4px' : undefined,
              width: selectedType === 'monthly' ? '90px' : '132px',
            }}
          />
        </div>

        <p className="text-[13px] text-[#98A2B3] mt-3">
          Every plan runs on autopay and renews automatically. Switch to yearly any time.
        </p>
      </div>

      {/* ===================== GRID ===================== */}
      <div className="grid gap-6 grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-4 max-w-7xl mx-auto mt-8">
        <AnimatePresence>
          {pricingPlans.map((item, index) => (
            <PricingCard
              key={item.id}
              plan={mapApiPlanToComponent(item)}
              index={index}
              onSelect={handlePlanSelect}
              selectedPlanId={selectedPlanId}
              setSelectedPlanId={setSelectedPlanId}
              selectedType={selectedType}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ===================== CUSTOM PLAN CTA ===================== */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-[#10182B] rounded-2xl px-6 py-6 md:px-8 flex flex-row items-center justify-between gap-5 flex-wrap">
          <div>
            <h3 className="text-white font-bold text-[16px] mb-1">Not what you&apos;re looking for?</h3>
            <p className="text-[#98A2B3] text-[13px] leading-[19px] max-w-xl">
              More than 15,000 orders a month, extra Amazon seller accounts, or a different mix of modules — we&apos;ll
              price a custom plan around what you actually run.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              navigate('/contact', {
                state: {
                  message: 'I want a custom plan',
                },
              });
            }}
            className="shrink-0 h-[44px] px-6 rounded-[12px] font-bold text-[14px] border-none cursor-pointer text-white bg-[#0C8B5E] hover:bg-[#0A7A52] transition-colors"
          >
            Talk to sales
          </button>
        </div>
      </div>
    </main>
  );
}

export default PricingCards;
