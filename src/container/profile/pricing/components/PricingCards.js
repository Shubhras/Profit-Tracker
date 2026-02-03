import React, { useState, useEffect } from 'react';
import { Row, Col, Skeleton, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { List } from '../../../../components/pricing/pricing';
import { Button } from '../../../../components/buttons/buttons';
import Heading from '../../../../components/heading/heading';
import { DataService } from '../../../../config/dataService/dataService';
import { selectPlan } from '../../../../redux/subscription/actionCreator';

// Skeleton Card Component for loading state
function PricingCardSkeleton() {
  return (
    <div className="bg-white dark:bg-white10 p-7 mb-7 shadow-pricing dark:shadow-none rounded-10 animate-pulse">
      {/* Badge Skeleton */}
      <Skeleton.Button active size="small" shape="round" className="mb-8" style={{ width: 100, height: 32 }} />

      {/* Price Skeleton */}
      <div className="mb-2">
        <Skeleton.Input active size="large" style={{ width: 120, height: 40 }} />
      </div>

      {/* Subtitle Skeleton */}
      <Skeleton.Input active size="small" style={{ width: 80, height: 20 }} />

      {/* Features Skeleton */}
      <div className="mt-6 mb-4 min-h-[210px] space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <Skeleton.Avatar active size="small" shape="circle" style={{ width: 16, height: 16 }} />
            <Skeleton.Input active size="small" style={{ width: '80%', height: 16 }} />
          </div>
        ))}
      </div>

      {/* Button Skeleton */}
      <Skeleton.Button active size="large" shape="round" style={{ width: '100%', height: 44 }} />
    </div>
  );
}

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
  const mapApiPlanToComponent = (apiPlan, index) => {
    // const colors = ['deepBG', 'primary', 'secondary', 'success'];
    // const colorClass = colors[index % colors.length];

    // Determine badge styling based on plan
    let badgeClassName;
    if (apiPlan.billing_cycle === 'free') {
      badgeClassName = 'bg-deepBG dark:bg-white10 text-dark dark:text-white87';
    } else if (index === 1) {
      badgeClassName = 'bg-primary-transparent text-primary';
    } else if (index === 2) {
      badgeClassName = 'bg-secondary-transparent text-secondary';
    } else {
      badgeClassName = 'bg-success-transparent text-success';
    }

    // Determine button styling
    let buttonType;
    let buttonClassName;
    let buttonText;
    if (apiPlan.billing_cycle === 'free') {
      buttonType = 'white';
      buttonClassName =
        'text-sm font-semibold bg-white rounded-md dark:text-white87 dark:bg-white10 h-11 px-7 border-regular dark:border-white10 dark:hover:border-transparent';
      buttonText = 'Current Plan';
    } else if (index === 1) {
      buttonType = 'primary';
      buttonClassName =
        'font-semibold rounded-md bg-primary hover:bg-primary-hover dark:hover:border-transparent h-11 px-7';
      buttonText = 'Get Started';
    } else if (index === 2) {
      buttonType = 'secondary';
      buttonClassName =
        'font-semibold text-white rounded-md bg-secondary dark:border-secondary hover:bg-secondary-hover dark:hover:border-transparent dark:text-white87 h-11 px-7';
      buttonText = 'Get Started';
    } else {
      buttonType = 'success';
      buttonClassName =
        'font-semibold text-white rounded-md bg-success dark:border-success hover:bg-secondary-hover dark:hover:border-transparent dark:text-white87 h-11 px-7';
      buttonText = 'Get Started';
    }

    // Build features array
    const features = [apiPlan.file_space, `${apiPlan.active_projects} Projects`, apiPlan.boards, ...apiPlan.features];

    return {
      badge: {
        text: apiPlan.name,
        className: badgeClassName,
      },
      title: apiPlan.price === 0 ? apiPlan.name : apiPlan.price.toString(),
      subtitle: `For ${apiPlan.users_limit} ${apiPlan.users_limit === 1 ? 'User' : 'Users'}`,
      price: apiPlan.price === 0 ? null : '₹',
      perMonth: apiPlan.billing_cycle === 'free' ? null : 'Per month',
      features,
      button: {
        text: buttonText,
        type: buttonType,
        className: buttonClassName,
      },
      plan_id: apiPlan.plan_id,
    };
  };

  useEffect(() => {
    const fetchPricingPlans = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await DataService.get('/subscription-plans/');

        if (response.data.status && response.data.data && response.data.data.plans) {
          const mappedPlans = response.data.data.plans.map((plan, index) => mapApiPlanToComponent(plan, index));
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

    fetchPricingPlans();
  }, []);

  // Loading state - show skeleton cards
  if (loading) {
    return (
      <main className="px-[3%] pb-20 lg:pb-10">
        <Row gutter={25}>
          {[1, 2, 3, 4].map((item) => (
            <Col key={item} xxl={6} lg={8} sm={12} xs={24}>
              <PricingCardSkeleton />
            </Col>
          ))}
        </Row>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="px-[3%] pb-20 lg:pb-10">
        <Alert
          message="Error Loading Pricing Plans"
          description={error}
          type="error"
          showIcon
          className="mb-6"
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => window.location.reload()}
              className="font-semibold rounded-md"
            >
              Retry
            </Button>
          }
        />
      </main>
    );
  }

  // Empty state
  if (pricingPlans.length === 0) {
    return (
      <main className="px-[3%] pb-20 lg:pb-10">
        <Alert
          message="No Pricing Plans Available"
          description="There are currently no pricing plans available. Please check back later."
          type="info"
          showIcon
          className="mb-6"
        />
      </main>
    );
  }

  // Success state - render pricing cards
  return (
    <main className="px-[3%] pb-20 lg:pb-10">
      <Row gutter={25}>
        {pricingPlans.map((plan, index) => (
          <Col key={index} xxl={6} lg={8} sm={12} xs={24}>
            <div className="bg-white dark:bg-white10 p-7 mb-7 shadow-pricing dark:shadow-none rounded-10">
              {/* Badge */}
              <span
                className={`inline-block h-8 px-6 py-1.5 mb-8 text-base font-medium rounded-2xl ${plan.badge.className}`}
              >
                {plan.badge.text}
              </span>

              {/* Title + Price */}
              {plan.price ? (
                <Heading
                  as="h3"
                  className="relative bottom-1.5 mb-0 text-dark dark:text-white87 text-4xl font-semibold"
                >
                  <sup className="relative text-base font-semibold text-gray-400 -top-3">{plan.price}</sup>
                  {plan.title}
                  <sub className="relative bottom-0 ml-2.5 text-light dark:text-white60 text-13 font-normal">
                    {plan.perMonth}
                  </sub>
                </Heading>
              ) : (
                <Heading as="h3" className="mb-2 text-2xl font-semibold text-dark dark:text-white87">
                  {plan.title}
                </Heading>
              )}

              {/* Subtitle */}
              <span className="font-medium text-body dark:text-white60 text-base">{plan.subtitle}</span>

              {/* Features */}
              <div className="mt-6 mb-4 min-h-[210px]">
                {plan.features.map((feature, i) => (
                  <List key={i} text={feature} />
                ))}
              </div>

              {/* Button */}
              <Button
                size="default"
                type={plan.button.type}
                className={plan.button.className}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.button.text}
              </Button>
            </div>
          </Col>
        ))}
      </Row>
    </main>
  );
}

export default PricingCards;
