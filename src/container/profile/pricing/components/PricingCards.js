import React, { useEffect, useState } from 'react';
import { Skeleton, Alert, Card, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleFilled, CrownOutlined, ThunderboltOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
// import { DataService } from '../../../../config/dataService/dataService';
import { getSubscriptionList } from '../../../../redux/admin/actionCreator';
import { selectPlan } from '../../../../redux/subscription/actionCreator';

const { Text } = Typography;

// Skeleton Card Component for loading state
function PricingCardSkeleton() {
  return (
    <Card className="h-full border-0 rounded-3xl shadow-lg animate-pulse" bodyStyle={{ padding: '32px' }}>
      <Skeleton.Button active size="small" shape="round" className="mb-6" style={{ width: 100, height: 32 }} />
      <Skeleton.Input active size="large" style={{ width: 140, height: 48 }} className="mb-2" />
      <Skeleton.Input active size="small" style={{ width: 100, height: 20 }} className="mb-6" />
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <Skeleton.Avatar active size="small" shape="circle" style={{ width: 16, height: 16 }} />
            <Skeleton.Input active size="small" style={{ width: '80%', height: 16 }} />
          </div>
        ))}
      </div>
      <Skeleton.Button active size="large" shape="round" style={{ width: '100%', height: 48 }} />
    </Card>
  );
}

const cardGradients = [
  { bg: 'from-slate-50 to-gray-50', accent: 'gray', icon: <StarOutlined /> },
  { bg: 'from-emerald-50 to-teal-50', accent: 'emerald', icon: <RocketOutlined />, popular: true },
  { bg: 'from-purple-50 to-indigo-50', accent: 'purple', icon: <CrownOutlined /> },
  { bg: 'from-amber-50 to-orange-50', accent: 'amber', icon: <ThunderboltOutlined /> },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

function PricingCard({ plan, index, onSelect, selectedPlanId, setSelectedPlanId, selectedType }) {
  const gradient = cardGradients[index % cardGradients.length];
  const isSelected = selectedPlanId === plan.id;

  const accentColors = {
    gray: {
      badge: 'default',
      button: '#6b7280',
      tag: 'bg-gray-100 text-gray-700',
    },
    emerald: {
      badge: 'success',
      button: '#0FA878',
      tag: 'bg-emerald-100 text-emerald-700',
    },
    purple: {
      badge: 'purple',
      button: '#6366f1',
      tag: 'bg-purple-100 text-purple-700',
    },
    amber: {
      badge: 'warning',
      button: '#f59e0b',
      tag: 'bg-amber-100 text-amber-700',
    },
  };

  const colors = accentColors[gradient.accent];

  const currentPrice = selectedType === 'monthly' ? plan.monthly_price : plan.annual_price;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{
        y: -5,
        transition: { duration: 0.25 },
      }}
      className="h-full"
    >
      <Card
        onClick={() => {
          setSelectedPlanId(plan.id);
        }}
        className={`
          h-full
          overflow-visible
          relative
          transition-all
          duration-300
          bg-white
          rounded-[20px]
          ${
            isSelected
              ? 'border-2 border-[#48BFA0] shadow-[0_8px_25px_rgba(16,185,129,0.12)]'
              : 'border border-[#E5E7EB] shadow-[0_4px_18px_rgba(16,24,40,0.06)]'
          }
        `}
        bodyStyle={{
          padding: '26px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* =====================================================
            MOST PROFITABLE BADGE
        ====================================================== */}

        {plan.plan_name?.toLowerCase() === 'starter plan' && (
          <div className="absolute -top-[15px] right-[20px] z-20">
            <div
              className="
        px-4
        h-[25px]
        flex
        items-center
        justify-center
        rounded-full
        bg-[#0FA878]
        text-white
        text-[11px]
        font-bold
        whitespace-nowrap
        shadow-[0_4px_10px_rgba(15,168,120,0.22)]
      "
            >
              Most profitable
            </div>
          </div>
        )}

        {/* =====================================================
            PLAN NAME + DESCRIPTION
        ====================================================== */}

        <div className="pt-3">
          <h2 className="text-[22px] font-bold text-[#18233F] tracking-[-0.4px]">{plan.plan_name}</h2>

          <p className="mt-2 min-h-[42px] text-[13px] leading-[20px] text-[#667085]">{plan.subtitle}</p>
        </div>

        {/* =====================================================
            PRICE
        ====================================================== */}

        <div className="mt-5">
          <div className="flex items-end gap-1">
            <span className="text-[36px] leading-[42px] font-bold tracking-[-1px] text-[#101828]">
              ₹{Math.trunc(Number(currentPrice || 0)).toLocaleString('en-IN')}
            </span>

            <span className="text-[13px] text-[#98A2B3] pb-[5px]">/{selectedType === 'monthly' ? 'mo' : 'yr'}</span>
          </div>

          {/* Billing text */}
          <p className="mt-1 text-[13px] font-semibold leading-[17px] text-[#98A2B3] min-h-[34px]">
            {selectedType === 'monthly'
              ? 'billed monthly · Flexible billing'
              : `billed annually · Save ${Math.round(Number(plan.discount_percentage || 0))}%`}
          </p>
        </div>

        {/* ======= EXISTING FEATURES — DO NOT CHANGE=============== */}

        <div className="flex-grow mb-6">
          <h4 className="text-[15px] font-semibold text-gray-900 mb-3">Features</h4>

          <ul className="space-y-3 mb-5">
            {plan.features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <CheckCircleFilled className="text-emerald-500 text-lg flex-shrink-0" />

                <Text className="text-gray-700 text-sm">{feature}</Text>
              </motion.li>
            ))}
          </ul>

          {plan.terms_and_conditions?.length > 0 && (
            <>
              <h4 className="text-[15px] font-semibold text-gray-900 mb-3">Terms & Conditions</h4>

              <ul className="space-y-3">
                {plan.terms_and_conditions.map((term, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircleFilled className="text-emerald-500 text-lg flex-shrink-0" />

                    <Text className="text-gray-700 text-sm">{term}</Text>
                  </motion.li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* ===== EXISTING CTA — FUNCTIONALITY ======= */}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type={isSelected ? 'primary' : 'default'}
            size="large"
            block
            onClick={() =>
              onSelect({
                ...plan,
                selectedType,
                selectedPrice: selectedType === 'monthly' ? plan.monthly_price : plan.annual_price,
              })
            }
            className={`
              h-12
              rounded-xl
              font-semibold
              text-base
              ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/20'
                  : 'border-2 border-gray-200 hover:border-[#0FA878] hover:text-[#0FA878]'
              }
            `}
            style={
              isSelected
                ? {
                    background: colors.button,
                  }
                : {}
            }
          >
            {plan.button.text}
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
}

PricingCard.propTypes = {
  plan: PropTypes.shape({
    badge: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }).isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    price: PropTypes.string,
    perMonth: PropTypes.string,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    termsConditions: PropTypes.arrayOf(PropTypes.string),
    button: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }).isRequired,
    plan_id: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
};

function PricingCards() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.login);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedType, setSelectedType] = useState('annual');

  // const [pricingPlans, setPricingPlans] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);

  const { getsubscriptionData, loading } = useSelector((state) => state.AdminDashboard);

  const pricingPlans = getsubscriptionData?.results?.data || [];

  useEffect(() => {
    dispatch(getSubscriptionList());
  }, [dispatch]);

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    // Store plan in redux
    dispatch(selectPlan(plan));

    if (isLoggedIn) {
      // If logged in, go directly to checkout with plan data
      navigate('/checkout', { state: { plan } });
    } else {
      // If not logged in, store plan and redirect to login
      // Store plan in sessionStorage for persistence through login
      sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
      navigate('/auth/login', { state: { redirectTo: '/checkout', plan } });
    }
  };

  const mapApiPlanToComponent = (plan) => ({
    badge: {
      text: plan.plan_name,
    },
    plan_name: plan.plan_name,

    title: plan.price,

    subtitle: plan.description || '',
    price: '₹',

    perMonth: plan.subscription_type === 'monthly' ? 'Month' : 'Year',
    discount_percentage: plan.discount_percentage,

    features: plan.features || [],
    terms_and_conditions: plan.terms_and_conditions || [],
    monthly_price: plan.monthly_price,
    annual_price: plan.annual_price,

    termsConditions: plan.termsConditions || [],

    button: {
      text: 'Subscribe Now',
    },

    id: plan.id,
    subscription_type: plan.subscription_type,
  });

  // Loading state - show skeleton cards
  if (loading) {
    return (
      <main className="px-[3%] pt-10 min-lg:pt-20 pb-10 min-lg:pb-20 max-w-7xl mx-auto">
        {/* <div
          className="
         grid gap-6
        grid-cols-1
        min-md:grid-cols-2
        min-lg:grid-cols-4
        "
        > */}
        <div
          className="
    grid gap-6
    grid-cols-1
    min-md:grid-cols-2
    min-lg:grid-cols-4
  "
        >
          {[1, 2, 3, 4].map((item) => (
            <PricingCardSkeleton key={item} />
          ))}
        </div>
      </main>
    );
  }

  // Empty state
  if (pricingPlans.length === 0) {
    return (
      <main className="px-[3%] pt-10 min-lg:pt-20 pb-10 min-lg:pb-20max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            message="No Pricing Plans Available"
            description="There are currently no pricing plans available. Please check back later."
            type="info"
            showIcon
            className="rounded-xl"
          />
        </motion.div>
      </main>
    );
  }

  // Success state - render pricing cards
  return (
    <main className="px-[3%] pt-10 min-lg:pt-10 pb-10 min-lg:pb-20">
      {/* Pricing Cards Grid */}
      {/* <div
        className="
        grid gap-6
        grid-cols-1
        min-md:grid-cols-2
        min-lg:grid-cols-4
      "
      > */}
      {/* Monthly / Annual Toggle */}
      <div className="flex justify-center items-center mb-10">
        <div className="flex items-center gap-3">
          <span
            className={`text-[15px] font-medium ${selectedType === 'monthly' ? 'text-[#18233F]' : 'text-[#98A2B3]'}`}
          >
            Monthly
          </span>

          <button
            type="button"
            aria-label={`Switch billing period to ${selectedType === 'monthly' ? 'annual' : 'monthly'}`}
            onClick={() => setSelectedType(selectedType === 'monthly' ? 'annual' : 'monthly')}
            className="
        relative
        w-[54px]
        h-[29px]
        rounded-full
        border
        border-[#6FC9B0]
        bg-[#F1FAF7]
      "
          >
            <span
              className={`
          absolute
          top-[3px]
          w-[21px]
          h-[21px]
          rounded-full
          bg-[#0FA878]
          transition-all
          duration-200
          ${selectedType === 'annual' ? 'right-[3px]' : 'left-[3px]'}
        `}
            />
          </button>

          <span
            className={`text-[15px] font-medium ${selectedType === 'annual' ? 'text-[#18233F]' : 'text-[#98A2B3]'}`}
          >
            Annual
          </span>

          <span
            className="
        px-2.5
        py-1
        rounded-full
        bg-[#FFF4D6]
        border
        border-[#F2DFA9]
        text-[#B68A1B]
        text-[11px]
        font-semibold
      "
          >
            Save 17%
          </span>
        </div>
      </div>
      <div
        className="
    grid gap-6
    grid-cols-1
    min-md:grid-cols-2
    min-lg:grid-cols-4
  "
      >
        <AnimatePresence>
          {/* {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} onSelect={handlePlanSelect} />
          ))} */}
          {pricingPlans.map((item, index) => (
            // <PricingCard key={item.id} plan={mapApiPlanToComponent(item)} index={index} onSelect={handlePlanSelect} />
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
