import React, { useState, useEffect } from 'react';
import { Skeleton, Alert, Card, Button, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleFilled, CrownOutlined, ThunderboltOutlined, RocketOutlined, StarOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { DataService } from '../../../../config/dataService/dataService';
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

function PricingCard({ plan, index, onSelect }) {
  const gradient = cardGradients[index % cardGradients.length];
  const isPopular = gradient.popular;

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
        className={`h-full border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${
          isPopular ? 'ring-2 ring-emerald-500 ring-offset-4' : ''
        }`}
        bodyStyle={{
          padding: '32px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        style={{ background: 'linear-gradient(135deg, var(--tw-gradient-stops))' }}
      >
        {/* Popular Badge */}
        {isPopular && (
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

        {/* Plan Badge */}
        <div className="flex items-center gap-2 mb-6">
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
          {plan.price ? (
            <div className="flex items-baseline gap-1">
              <Text className="text-xl text-gray-500 font-medium">{plan.price}</Text>
              <Title level={2} className="!mb-0 !text-4xl !font-bold !text-gray-900">
                {plan.title}
              </Title>
              {plan.perMonth && <Text className="text-gray-500 text-sm">/{plan.perMonth}</Text>}
            </div>
          ) : (
            <Title level={2} className="!mb-0 !text-3xl !font-bold !text-gray-900">
              {plan.title}
            </Title>
          )}
          <Text className="text-gray-600 text-base mt-1 block">{plan.subtitle}</Text>
        </div>

        {/* Features */}
        <div className="flex-grow mb-6">
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
        </div>

        {/* CTA Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            type={isPopular ? 'primary' : 'default'}
            size="large"
            block
            onClick={() => onSelect(plan)}
            className={`h-12 rounded-xl font-semibold text-base ${
              isPopular
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/30'
                : 'border-2 border-gray-200 hover:border-emerald-500 hover:text-emerald-600'
            }`}
            style={isPopular ? { background: colors.button } : {}}
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

  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Map API response to component format
  const mapApiPlanToComponent = (apiPlan) => {
    const isFree = apiPlan.price === 0;
    const isCustom = apiPlan.price === null;

    const features = [
      `${apiPlan.sync_frequency} Sync`,
      `${apiPlan.order_volume} Orders`,
      `${apiPlan.integrations} Integrations`,
      ...apiPlan.features,
    ];

    return {
      badge: {
        text: apiPlan.name,
      },

      // Title logic
      title: isFree ? apiPlan.name : isCustom ? 'Custom' : apiPlan.price.toString(),

      // Subtitle
      subtitle: isCustom ? 'Tailored for large teams' : `For ${apiPlan.order_volume} Orders`,

      // Price symbol
      price: isFree || isCustom ? null : '₹',

      // Billing text
      perMonth: apiPlan.billing_cycle === 'yearly' ? 'year' : apiPlan.billing_cycle === 'monthly' ? 'month' : null,

      features,

      button: {
        text: isFree ? 'Current Plan' : isCustom ? 'Contact Sales' : 'Subscribe Now',
      },

      plan_id: apiPlan.plan_id,
    };
  };

  const fetchPricingPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await DataService.get('/subscription-plans/');

      if (response.data.status && response.data.data?.plans) {
        const mappedPlans = response.data.data.plans.map(mapApiPlanToComponent);
        setPricingPlans(mappedPlans);
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching pricing plans:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load pricing plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  // Loading state - show skeleton cards
  if (loading) {
    return (
      <main className="px-[3%] pb-20 min-lg:pb-10 max-w-7xl mx-auto">
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

  // Error state
  if (error) {
    return (
      <main className="px-[3%] pb-20 min-lg:pb-10 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            message="Error Loading Pricing Plans"
            description={error}
            type="error"
            showIcon
            className="rounded-xl"
            action={
              <Button type="primary" size="small" onClick={fetchPricingPlans} className="rounded-lg">
                Retry
              </Button>
            }
          />
        </motion.div>
      </main>
    );
  }

  // Empty state
  if (pricingPlans.length === 0) {
    return (
      <main className="px-[3%] pb-20 min-lg:pb-10 max-w-7xl mx-auto">
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
    <main className="px-[3%] pb-20 min-lg:pb-10 max-w-7xl mx-auto">
      {/* Pricing Cards Grid */}
      <div
        className="
        grid gap-6
        grid-cols-1
        min-md:grid-cols-2
        min-lg:grid-cols-4
      "
      >
        <AnimatePresence>
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} onSelect={handlePlanSelect} />
          ))}
        </AnimatePresence>
      </div>

      {/* Money Back Guarantee */}
      {/* <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12"
      >
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🛡️</span>
          </div>

          <div className="text-left">
            <Text strong className="block text-gray-900">
              30-Day Money-Back Guarantee
            </Text>
            <Text className="text-sm text-gray-600">Not satisfied? Get a full refund, no questions asked.</Text>
          </div>
        </div>
      </motion.div> */}
    </main>
  );
}

export default PricingCards;
