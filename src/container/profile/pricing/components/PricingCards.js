import React, { useEffect, useState } from 'react';
import { Skeleton, Alert, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { getSubscriptionList } from '../../../../redux/admin/actionCreator';
import { selectPlan } from '../../../../redux/subscription/actionCreator';

const { Text } = Typography;

/* ============================================================
   TOKENS
   ink        #10182B  – headlines, price
   paper      #FAFAF8  – page background
   line       #E4E6E1  – hairline / dashed dividers
   profit     #0C8B5E  – accent: checks, CTA, selection
   ledger     #B8860B  – accent: savings / "most profitable" tag
   muted      #667085  – body copy
============================================================ */

const ACCENTS = ['#667085', '#0C8B5E', '#6D28D9', '#B8860B'];

// -------------------------------------------------------------
// Skeleton (loading) card — mirrors the statement layout
// -------------------------------------------------------------
function PricingCardSkeleton() {
  return (
    <div className="h-full bg-white border border-[#E4E6E1] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-dashed border-[#E4E6E1]">
        <Skeleton.Input active size="small" style={{ width: 70, height: 12 }} className="mb-2" />
        <Skeleton.Input active size="large" style={{ width: 140, height: 26 }} />
      </div>
      <div className="px-6 py-5">
        <Skeleton active paragraph={{ rows: 3 }} title={false} />
        <div className="my-5 border-t border-dashed border-[#E4E6E1]" />
        <Skeleton.Input active size="large" style={{ width: 160, height: 40 }} className="mb-6" />
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Skeleton.Avatar active size="small" shape="circle" style={{ width: 16, height: 16 }} />
              <Skeleton.Input active size="small" style={{ width: '75%', height: 14 }} />
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
// Statement-style pricing card
// -------------------------------------------------------------
function PricingCard({ plan, index, onSelect, selectedPlanId, setSelectedPlanId, selectedType }) {
  const accent = ACCENTS[index % ACCENTS.length];
  const isSelected = selectedPlanId === plan.id;
  const isFeatured = plan.plan_name?.toLowerCase() === 'starter plan';

  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const currentPrice = selectedType === 'monthly' ? plan.monthly_price : plan.annual_price;
  const savePct = Math.round(Number(plan.discount_percentage || 0));

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
          relative h-full flex flex-col bg-white rounded-2xl overflow-hidden
          transition-all duration-300 cursor-pointer
          ${
            isSelected
              ? 'shadow-[0_10px_30px_rgba(12,139,94,0.14)]'
              : 'shadow-[0_2px_10px_rgba(16,24,40,0.05)] hover:shadow-[0_8px_24px_rgba(16,24,40,0.08)]'
          }
        `}
        style={{
          border: `1px solid ${isSelected ? '#0C8B5E' : '#E4E6E1'}`,
        }}
      >
        {/* selection accent bar */}
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0C8B5E]" />}

        {/* selection check badge */}
        {isSelected && (
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#0C8B5E] flex items-center justify-center z-10">
            <CheckOutlined style={{ color: '#fff', fontSize: 11 }} />
          </div>
        )}

        {/* ===================== LETTERHEAD ===================== */}
        <div className="px-6 pt-5 pb-4 border-b border-dashed border-[#E4E6E1]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: accent }}>
              Plan
            </span>

            {isFeatured && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#B8860B] border border-[#E9D8A6] bg-[#FBF4E3] rounded px-1.5 py-[1px]">
                Most profitable
              </span>
            )}
          </div>

          <h2 className="font-serif text-[21px] font-semibold text-[#10182B] leading-tight">{plan.plan_name}</h2>
        </div>

        {/* ===================== BODY ===================== */}
        <div className="px-6 pt-4 flex-grow flex flex-col">
          {/* description — fixed height so all 4 cards align */}
          <p
            className="text-[13px] leading-[20px] text-[#667085] h-[80px] overflow-hidden"
            style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}
          >
            {plan.subtitle}
          </p>

          <div className="border-t border-dashed border-[#E4E6E1] my-4" />

          {/* price */}
          <div className="mb-1">
            <div className="flex items-end gap-1.5">
              <span className="font-mono tabular-nums text-[34px] leading-[38px] font-semibold text-[#10182B] tracking-tight">
                ₹{Math.trunc(Number(currentPrice || 0)).toLocaleString('en-IN')}
              </span>
              <span className="text-[13px] text-[#98A2B3] pb-[6px] font-mono">
                /{selectedType === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5 min-h-[22px]">
              <span className="text-[12px] text-[#98A2B3]">
                {selectedType === 'monthly' ? 'billed monthly' : 'billed annually'}
              </span>
              {selectedType === 'annual' && savePct > 0 && (
                <span className="text-[10px] font-semibold text-[#B8860B] border border-dashed border-[#D8BE7C] rounded px-1.5 py-[1px]">
                  SAVE {savePct}%
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-dashed border-[#E4E6E1] my-4" />

          {/* features */}
          <div className="mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#10182B]">
              Features Included
            </span>

            <ul className="mt-3 space-y-2.5">
              {(showAllFeatures ? plan.features : plan.features.slice(0, 4)).map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                  className="flex items-start gap-2.5"
                >
                  <span className="mt-[3px] w-[14px] h-[14px] rounded-full bg-[#E7F5EE] flex items-center justify-center flex-shrink-0">
                    <CheckOutlined style={{ color: '#0C8B5E', fontSize: 8 }} />
                  </span>
                  <Text className="text-[13px] leading-[19px] text-[#374151]">{feature}</Text>
                </motion.li>
              ))}
            </ul>

            {plan.features.length > 4 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllFeatures((prev) => !prev);
                }}
                className="mt-2.5 text-[12px] font-medium text-[#0C8B5E] underline underline-offset-2 cursor-pointer bg-transparent border-none p-0"
              >
                {showAllFeatures ? 'Show less' : `+${plan.features.length - 2} more`}
              </button>
            )}
          </div>
        </div>

        {/* ===================== CTA ===================== */}
        <div className="px-6 pb-6 pt-2">
          <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
            <Button
              size="large"
              block
              onClick={(e) => {
                e.stopPropagation();
                onSelect({
                  ...plan,
                  selectedType,
                  selectedPrice: selectedType === 'monthly' ? plan.monthly_price : plan.annual_price,
                });
              }}
              className="h-[46px] rounded-lg font-semibold text-[14px] border-none"
              style={{
                background: isSelected ? '#0C8B5E' : '#10182B',
                color: '#fff',
              }}
            >
              {plan.button.text}
            </Button>
          </motion.div>
        </div>
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
  const [selectedType, setSelectedType] = useState('annual');

  const { getsubscriptionData, loading } = useSelector((state) => state.AdminDashboard);
  const pricingPlans = getsubscriptionData?.results?.data || [];

  useEffect(() => {
    dispatch(getSubscriptionList());
  }, [dispatch]);

  const handlePlanSelect = (plan) => {
    dispatch(selectPlan(plan));

    if (isLoggedIn) {
      navigate('/checkout', { state: { plan } });
    } else {
      sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
      navigate('/auth/login', { state: { redirectTo: '/checkout', plan } });
    }
  };

  const mapApiPlanToComponent = (plan) => ({
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
  });

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
      <div className="flex justify-center items-center mb-10">
        <div className="inline-flex items-center bg-white border border-[#E4E6E1] rounded-full p-1 gap-1 relative">
          <button
            type="button"
            onClick={() => setSelectedType('monthly')}
            className={`relative z-10 px-5 py-2 text-[13px] font-semibold rounded-full transition-colors duration-200 ${
              selectedType === 'monthly' ? 'text-white' : 'text-[#667085]'
            }`}
          >
            Monthly
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('annual')}
            className={`relative z-10 px-5 py-2 text-[13px] font-semibold rounded-full transition-colors duration-200 flex items-center gap-2 ${
              selectedType === 'annual' ? 'text-white' : 'text-[#667085]'
            }`}
          >
            Annual
            <span
              className={`text-[10px] font-semibold rounded px-1.5 py-[1px] ${
                selectedType === 'annual'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FBF4E3] text-[#B8860B] border border-[#E9D8A6]'
              }`}
            >
              Save 17%
            </span>
          </button>

          {/* sliding thumb */}
          <span
            className="absolute top-1 bottom-1 rounded-full bg-[#10182B] transition-all duration-250 ease-out"
            style={{
              left: selectedType === 'monthly' ? '4px' : undefined,
              right: selectedType === 'annual' ? '4px' : undefined,
              width: selectedType === 'monthly' ? '96px' : '150px',
            }}
          />
        </div>
      </div>

      {/* ===================== GRID ===================== */}
      <div className="grid gap-6 grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-4 max-w-7xl mx-auto">
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
    </main>
  );
}

export default PricingCards;
