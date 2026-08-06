import React, { useEffect, useState } from 'react';
import { Skeleton, Alert, Card, Button, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleFilled, CrownOutlined, ThunderboltOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
// import { DataService } from '../../../../config/dataService/dataService';
import { getSubscriptionList } from '../../../../redux/admin/actionCreator';
import { selectPlan } from '../../../../redux/subscription/actionCreator';

const { Title, Text } = Typography;

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

function PricingCard({ plan, index, onSelect, selectedPlanId, setSelectedPlanId }) {
  const [selectedType, setSelectedType] = useState('monthly');
  const gradient = cardGradients[index % cardGradients.length];
  // const [selectedPlanId, setSelectedPlanId] = useState(null);
  const isSelected = selectedPlanId === plan.id;

  const accentColors = {
    gray: { badge: 'default', button: '#6b7280', tag: 'bg-gray-100 text-gray-700' },
    emerald: {
      badge: 'success',
      button: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
      tag: 'bg-emerald-100 text-emerald-700',
    },
    purple: {
      badge: 'purple',
      button: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      tag: 'bg-purple-100 text-purple-700',
    },
    amber: {
      badge: 'warning',
      button: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
      tag: 'bg-amber-100 text-amber-700',
    },
  };

  const colors = accentColors[gradient.accent];

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="h-full"
    >
      <Card
        onClick={() => {
          setSelectedPlanId(plan.id);
          setSelectedType('monthly');
        }}
        className={`h-full border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${
          isSelected ? 'ring-2 ring-emerald-500 ring-offset-4' : ''
        }`}
        bodyStyle={{
          padding: '32px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        style={{ background: 'linear-gradient(135deg, var(--tw-gradient-stops))' }}
      >
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-0 left-1/2 -translate-x-1/2"
          >
            <Tag color="success" className="px-4 py-1 text-xs font-bold rounded-b-lg rounded-t-none border-0">
              MOST POPULAR
            </Tag>
          </motion.div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.tag}`}
          >
            {gradient.icon}
          </motion.div>
          <Tag className={`px-3 py-1 rounded-full text-sm font-semibold border-0 ${colors.tag}`}>{plan.badge.text}</Tag>
        </div>

        {/* Price */}
        <div className="mb-6">
          <Title level={2} className="!mb-3 !text-3xl !font-bold !text-gray-900">
            {plan.title}
          </Title>

          <Text className="text-gray-600 text-base mt-1 block">{plan.subtitle}</Text>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {[
              {
                key: 'monthly',
                label: 'Monthly',
                price: plan.monthly_price,
              },
              {
                key: 'annual',
                label: 'Annual',
                price: plan.annual_price,
                badge: 'Best Value',
              },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedType(item.key);
                }}
                className={`relative rounded-2xl border p-4 transition-all duration-300 text-left overflow-hidden
${
  selectedType === item.key
    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 scale-[1.02]'
    : 'border-gray-300 bg-white hover:border-emerald-300 hover:shadow-lg'
}`}
              >
                {item.badge && (
                  <span className="absolute -top-2 right-3 bg-orange-500 text-white text-[10px] px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-800">{item.label}</h4>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${selectedType === item.key ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}
                  >
                    {selectedType === item.key && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <p className="text-2xl font-bold mt-3 text-gray-900">₹{Math.trunc(Number(item.price || 0))}</p>

                <p className="text-sm text-gray-500">/ {item.key === 'monthly' ? 'month' : 'year'}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        {/* <div className="flex-grow mb-6">
          <ul className="space-y-3">
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
        </div> */}
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

        {/* CTA Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type={isSelected ? 'primary' : 'default'}
            size="large"
            block
            // onClick={() => onSelect(plan)}
            onClick={() =>
              onSelect({
                ...plan,
                selectedType,
                selectedPrice: selectedType === 'monthly' ? plan.monthly_price : plan.annual_price,
              })
            }
            className={`h-12 rounded-xl font-semibold text-base ${
              isSelected
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/30'
                : 'border-2 border-gray-200 hover:border-emerald-500 hover:text-emerald-600'
            }`}
            style={isSelected ? { background: colors.button } : {}}
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
    min-lg:grid-cols-3
    max-w-7xl
    mx-auto
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
    <main className="px-[3%] pt-10 min-lg:pt-20 pb-10 min-lg:pb-20 max-w-7xl mx-auto">
      {/* Pricing Cards Grid */}
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
    min-lg:grid-cols-3

    max-w-7xl
    mx-auto
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
            />
          ))}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default PricingCards;
