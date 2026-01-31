import React from 'react';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import { List } from '../../../../components/pricing/pricing';
import { Button } from '../../../../components/buttons/buttons';
import Heading from '../../../../components/heading/heading';

function PricingCards() {
  const pricingPlans = [
    {
      badge: {
        text: 'Free Forever',
        className: 'bg-deepBG dark:bg-white10 text-dark dark:text-white87',
      },
      title: 'Free',
      subtitle: 'For Individuals',
      price: null,
      features: ['100MB File Space', '2 Active Projects', 'Limited Boards', 'Basic Project Management'],
      button: {
        text: 'Current Plan',
        type: 'white',
        className:
          'text-sm font-semibold bg-white rounded-md dark:text-white87 dark:bg-white10 h-11 px-7 border-regular dark:border-white10 dark:hover:border-transparent',
      },
    },

    {
      badge: {
        text: 'Business',
        className: 'bg-primary-transparent text-primary',
      },
      title: '19',
      subtitle: 'For 2 Users',
      price: '$',
      perMonth: 'Per month',
      features: ['100GB File Space', '300 Projects', 'Limited Boards', 'Basic Project Management', 'Custom Post Types'],
      button: {
        text: 'Get Started',
        type: 'primary',
        className: 'font-semibold rounded-md bg-primary hover:bg-primary-hover dark:hover:border-transparent h-11 px-7',
      },
    },

    {
      badge: {
        text: 'Basic Plan',
        className: 'bg-secondary-transparent text-secondary',
      },
      title: '39',
      subtitle: 'For 10 Users',
      price: '$',
      perMonth: 'Per month',
      features: [
        '100GB File Space',
        '300 Projects',
        'Limited Boards',
        'Basic Project Management',
        'Custom Post Types',
        'Subtasks',
      ],
      button: {
        text: 'Get Started',
        type: 'secondary',
        className:
          'font-semibold text-white rounded-md bg-secondary dark:border-secondary hover:bg-secondary-hover dark:hover:border-transparent dark:text-white87 h-11 px-7',
      },
    },

    {
      badge: {
        text: 'Enterprise',
        className: 'bg-success-transparent text-success',
      },
      title: '79',
      subtitle: 'For 50 Users',
      price: '$',
      perMonth: 'Per month',
      features: [
        '100GB File Space',
        '300 Projects',
        'Limited Boards',
        'Basic Project Management',
        'Custom Post Types',
        'Subtasks',
      ],
      button: {
        text: 'Get Started',
        type: 'success',
        className:
          'font-semibold text-white rounded-md bg-success dark:border-success hover:bg-secondary-hover dark:hover:border-transparent dark:text-white87 h-11 px-7',
      },
    },
  ];

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
              <Link to="/auth/login">
                <Button size="default" type={plan.button.type} className={plan.button.className}>
                  {plan.button.text}
                </Button>
              </Link>
            </div>
          </Col>
        ))}
      </Row>
    </main>
  );
}
export default PricingCards;
