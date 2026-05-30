import React from 'react';
import {
  UilUsersAlt,
  UilMegaphone,
  UilShoppingCartAlt,
  UilCheckCircle,
  UilQuestionCircle,
} from '@iconscout/react-unicons';
import {
  UserAddOutlined,
  AuditOutlined,
  ThunderboltOutlined,
  BarChartOutlined,
  RiseOutlined,
  ArrowRightOutlined,
  UserOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import amazon from '../../assets/icons/amazonAds.png';
import flipkart from '../../assets/icons/newflipkart.svg';
import myntra from '../../assets/icons/newMyntra.png';
import walmart from '../../assets/icons/walmartimages.png';
import blinkit from '../../assets/icons/newblinkit.png';
import zepto from '../../assets/icons/zepto.png';
import instamart from '../../assets/icons/swiggy.png';

function Overview() {
  const marketplaces = [
    {
      name: 'Amazon',
      logo: amazon,
    },
    {
      name: 'Flipkart',
      logo: flipkart,
    },
    {
      name: 'Myntra',
      logo: myntra,
    },
    {
      name: 'Walmart',
      logo: walmart,
    },
    {
      name: 'Blinkit',
      logo: blinkit,
    },
    {
      name: 'Zepto',
      logo: zepto,
    },
    {
      name: 'Instamart',
      logo: instamart,
    },
  ];
  const accountServices = [
    'Dedicated Account Manager',
    'Organic Growth (SEO, Content, Listing)',
    'Advertising Management (PPC)',
    'Inventory & Catalog Optimization',
    'Sales & Profit Growth Strategy',
    'Weekly Reports & Expert Support',
  ];

  const marketingServices = [
    'Google Ads (Search, Shopping, Display)',
    'Meta Ads (Facebook & Instagram)',
    'Instagram Marketing',
    'Retargeting & Conversion Optimization',
    'A/B Testing & Ad Optimization',
    'Monthly Performance Reports',
  ];

  const commerceServices = [
    'Blinkit Account Management',
    'Zepto Account Management',
    'Instant Account Management',
    'Catalog & Inventory Optimization',
    'Deal & Promotion Management',
    'Performance Tracking & Growth',
  ];

  const whyChooseUs = [
    'Expert Team with Marketplace Experience',
    'Data-Driven Strategies for Growth',
    'Transparent Reporting & Communication',
    'Proven Track Record of Success',
    'Scalable Solutions for Every Business',
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-3 lg:p-4 md:p-3 sm:p-2 px-3">
      {' '}
      {/* Header */}
      <div className="mb-2 flex items-start justify-between md:flex-col md:gap-3 px-2">
        <div>
          <h1 className="text-[20px] lg:text-[20px] md:text-[18px] sm:text-[16px] font-bold text-[#111827] mb-0">
            Value Added Services
          </h1>

          <p className="text-[13px] lg:text-[12px] text-[#6b7280] mb-0">
            Choose expert services to grow your e-commerce business with end-to-end account management and marketing
            solutions.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-[#2563eb]"
        >
          <UilQuestionCircle size="16" />
          How It Works
        </button>
      </div>
      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-2 lg:grid-cols-1">
        {/* Left Section */}
        <div className="col-span-9 lg:col-span-12 space-y-2">
          {/* Marketplace Expertise */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="mb-2 text-[15px] font-semibold text-[#111827]">Our Marketplaces Expertise</h2>

            <div className="grid grid-cols-7 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-2">
              {marketplaces.map((item) => (
                <div
                  key={item.name}
                  className="flex h-[50px] md:h-[65px] sm:h-[60px]items-center justify-center rounded-xl border border-[#edf0f5] bg-[#fcfcfd] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <img src={item.logo} alt={item.name} className="h-[90%] w-[90%] object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            {/* Heading */}
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-[#111827]">Our Services</h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-3 xl:grid-cols-2 md:grid-cols-1">
              {/* ACCOUNT MANAGEMENT */}

              <div className="flex flex-col rounded-2xl border border-[#dff5e8] bg-[#fcfffd] p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-xl bg-[#eafaf1]">
                    <UilUsersAlt size="22" color="#16a34a" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold text-[#111827]">Account Management</h3>

                    <p className="mt-1 min-h-[56px] text-[12px] leading-5 text-[#6b7280]">
                      Dedicated account manager to grow your business through organic & advertising strategies.
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {accountServices.map((service) => (
                    <div key={service} className="flex items-center gap-2 text-[12px] text-[#374151]">
                      <UilCheckCircle size="14" color="#16a34a" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-[#f1f5f9] pt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[#6b7280]">Starting at</p>

                    <h3 className="mt-1 text-[18px] font-bold text-[#16a34a]">₹24,999</h3>

                    <span className="text-[11px] text-[#6b7280]">/ month</span>
                  </div>

                  <button
                    type="button"
                    className="h-[32px] min-w-[60px] rounded-lg bg-[#16a34a] px-2 text-[12px] font-medium text-white whitespace-nowrap"
                  >
                    View Packages
                  </button>
                </div>
              </div>

              {/* DIGITAL MARKETING */}

              <div className="flex flex-col rounded-2xl border border-[#dce9ff] bg-[#fcfdff] p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-xl bg-[#edf4ff]">
                    <UilMegaphone size="22" color="#2563eb" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold text-[#111827]">Digital Marketing</h3>

                    <p className="mt-1 min-h-[56px] text-[12px] leading-5 text-[#6b7280]">
                      Drive more traffic, sales and brand visibility with performance marketing.
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {marketingServices.map((service) => (
                    <div key={service} className="flex items-center gap-2 text-[12px] text-[#374151]">
                      <UilCheckCircle size="14" color="#2563eb" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-[#f1f5f9] pt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[#6b7280]">Starting at</p>

                    <h3 className="mt-1 text-[18px] font-bold text-[#2563eb]">₹14,999</h3>

                    <span className="text-[11px] text-[#6b7280]">/ month</span>
                  </div>

                  <button
                    type="button"
                    className="h-[32px] min-w-[60px] rounded-lg bg-[#2563eb] px-2 text-[12px] font-medium text-white whitespace-nowrap"
                  >
                    View Packages
                  </button>
                </div>
              </div>

              {/* QUICK COMMERCE */}

              <div className="flex flex-col rounded-2xl border border-[#eddcff] bg-[#fffcff] p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-xl bg-[#f5efff]">
                    <UilShoppingCartAlt size="22" color="#9333ea" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold text-[#111827]">Quick Commerce Growth</h3>

                    <p className="mt-1 min-h-[56px] text-[12px] leading-5 text-[#6b7280]">
                      Boost your sales on quick-commerce platforms with expert account handling.
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  {commerceServices.map((service) => (
                    <div key={service} className="flex items-center gap-2 text-[12px] text-[#374151]">
                      <UilCheckCircle size="14" color="#9333ea" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-[#f1f5f9] pt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[#6b7280]">Starting at</p>

                    <h3 className="mt-1 text-[18px] font-bold text-[#9333ea]">₹19,999</h3>

                    <span className="text-[11px] text-[#6b7280]">/ month</span>
                  </div>

                  <button
                    type="button"
                    className="h-[32px] min-w-[60px] rounded-lg bg-[#9333ea] px-2 text-[12px] font-medium text-white whitespace-nowrap"
                  >
                    View Packages
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 lg:col-span-12 space-y-2">
          {' '}
          {/* Why Choose */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="mb-5 text-[15px] font-semibold text-[#111827]">Why Choose TrackMyProfit Services?</h2>

            <div className="space-y-4">
              {whyChooseUs.map((item) => (
                <div key={item} className="flex items-start gap-3 text-[11px]">
                  <div className="mt-[2px] flex h-7 w-7 items-center justify-center rounded-full bg-[#eafaf1]">
                    <UilCheckCircle size="17" color="#16a34a" />
                  </div>

                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* Summary */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-3">
            <h2 className="mb-3 text-[15px] font-semibold text-[#111827]">Your Service Summary</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#111827]">Active Services</span>
                <span className="font-semibold text-[#111827]">2</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#111827]">Account Managers</span>
                <span className="font-semibold text-[#111827]">2</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#111827]">Marketplaces Covered</span>
                <span className="font-semibold text-[#111827]">3</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#111827]">Monthly Investment</span>
                <span className="font-semibold text-[#111827]">₹ 39,998</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-4 w-full rounded-l bg-[#16a34a] py-2 px-2 text-[12px] font-semibold text-white transition-all hover:opacity-90"
            >
              Manage My Services
            </button>
          </div>
        </div>
      </div>
      <div className="mt-1 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
        {/* Heading */}
        <div className="mb-5">
          <h2 className="text-[15px] font-semibold text-[#111827] mb-1">Account Management – How It Works</h2>

          <p className="text-sm text-gray-500">
            We assign a dedicated account manager who works on your account like your extended team.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-5 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
          {' '}
          {[
            {
              id: '1',
              title: 'Onboarding',
              desc: 'Share access & business details',
              icon: <UserAddOutlined />,
              bg: 'bg-green-50',
              color: 'text-green-600',
            },
            {
              id: '2',
              title: 'Strategy Creation',
              desc: 'Account audit & growth plan',
              icon: <AuditOutlined />,
              bg: 'bg-blue-50',
              color: 'text-blue-600',
            },
            {
              id: '3',
              title: 'Execution',
              desc: 'We work on growth levers',
              icon: <ThunderboltOutlined />,
              bg: 'bg-purple-50',
              color: 'text-purple-600',
            },
            {
              id: '4',
              title: 'Reporting',
              desc: 'Weekly & monthly updates',
              icon: <BarChartOutlined />,
              bg: 'bg-orange-50',
              color: 'text-orange-600',
            },
            {
              id: '5',
              title: 'Growth',
              desc: 'More sales, better profits',
              icon: <RiseOutlined />,
              bg: 'bg-emerald-50',
              color: 'text-emerald-600',
            },
          ].map((step, index, arr) => (
            <div key={step.id} className="flex items-start justify-between">
              {/* Step */}
              <div className="flex flex-col items-center text-center flex-1">
                {/* Icon + Arrow */}
                <div className="relative flex w-full justify-center">
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${step.bg} text-2xl ${step.color} shadow-sm`}
                  >
                    {step.icon}
                  </div>

                  {/* Arrow */}
                  {index !== arr.length - 1 && (
                    <div className="absolute left-[72%] top-1/2 -translate-y-1/2 md:hidden">
                      {' '}
                      <ArrowRightOutlined className="text-[18px] text-[#2563eb]" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="mt-3 text-[13px] font-semibold text-gray-800">
                  {step.id} {step.title}
                </h3>

                {/* Desc */}
                <p className="mt-1 text-xs leading-5 text-gray-500 max-w-[140px]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Help Box */}
        <div className="mt-5 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-5 py-4">
          <div className="flex items-center justify-between gap-4 md:flex-col md:items-start">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              {/* Small Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eafaf1]">
                <UserOutlined className="text-[16px] text-[#16a34a]" />
              </div>

              {/* Text */}
              <div>
                <h4 className="text-[15px] font-semibold text-[#111827] leading-none">
                  Need Help Choosing the Right Service?
                </h4>

                <p className="mt-1 text-[12px] text-[#6b7280]">
                  Our experts are here to help you choose the best solution for your business.
                </p>
              </div>
            </div>

            {/* Right Button */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg border border-[#16a34a] bg-white px-4 py-2 text-[12px] font-medium text-[#16a34a] transition-all hover:bg-[#f0fdf4]"
            >
              <MessageOutlined className="text-[14px]" />
              Talk to Expert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
