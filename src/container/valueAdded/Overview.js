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
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Value Added Services</h1>

          <p className="mt-1 text-sm text-[#6b7280]">
            Choose expert services to grow your e-commerce business with end-to-end account management and marketing
            solutions.
          </p>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#2563eb] transition-all hover:bg-[#f9fafb]"
        >
          <UilQuestionCircle size="16" />
          How It Works
        </button>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-2">
        {/* Left Section */}
        <div className="col-span-9 space-y-5">
          {/* Marketplace Expertise */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
            <h2 className="mb-5 text-base font-semibold text-[#111827]">Our Marketplaces Expertise</h2>

            <div className="grid grid-cols-7 gap-4">
              {marketplaces.map((item) => (
                <div
                  key={item.name}
                  className="flex h-[82px] items-center justify-center rounded-xl border border-[#edf0f5] bg-[#fcfcfd] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <img src={item.logo} alt={item.name} className="h-[70%] w-[90%] object-contain" />
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
            {/* Heading */}
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-[17px] font-semibold text-[#111827]">Our Services</h2>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-3 gap-5">
              {/* Account Management */}
              <div className="rounded-2xl border border-[#dff5e8] bg-[#fcfffd] p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                {/* Top */}
                <div className="mb-1 flex items-start gap-4">
                  <div className="flex h-12 w-12 min-w-[56px] items-center justify-center rounded-2xl bg-[#eafaf1]">
                    <UilUsersAlt size="26" color="#16a34a" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[17px] font-semibold text-[#111827]">Account Management</h3>

                    <p className="mt-1 min-h-[52px] text-[13px] leading-6 text-[#6b7280]">
                      Dedicated account manager to grow your business through organic & advertising strategies.
                    </p>
                  </div>
                </div>

                {/* Services */}
                <div className="space-y-3">
                  {accountServices.map((service) => (
                    <div key={service} className="flex items-center gap-2 text-[13px] text-[#374151]">
                      <UilCheckCircle size="15" color="#16a34a" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-7 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#6b7280]">Starting at</p>

                    <h3 className="text-[22px] font-bold leading-none text-[#16a34a]">₹ 24,999</h3>

                    <span className="text-sm text-[#6b7280]">/ month</span>
                  </div>

                  <button
                    type="button"
                    className="rounded-xl bg-[#16a34a] px-2 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
                  >
                    View Packages
                  </button>
                </div>
              </div>

              {/* Digital Marketing */}
              <div className="rounded-2xl border border-[#dce9ff] bg-[#fcfdff] p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-1 flex items-start gap-4">
                  <div className="flex h-12 w-12 min-w-[56px] items-center justify-center rounded-2xl bg-[#edf4ff]">
                    <UilMegaphone size="26" color="#2563eb" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[17px] font-semibold text-[#111827]">Digital Marketing</h3>

                    <p className="mt-1 min-h-[52px] text-[13px] leading-6 text-[#6b7280]">
                      Drive more traffic, sales and brand visibility with performance marketing.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {marketingServices.map((service) => (
                    <div key={service} className="flex items-center gap-2 text-[13px] text-[#374151]">
                      <UilCheckCircle size="15" color="#2563eb" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#6b7280]">Starting at</p>

                    <h3 className="text-[22px] font-bold leading-none text-[#2563eb]">₹ 14,999</h3>

                    <span className="text-sm text-[#6b7280]">/ month</span>
                  </div>

                  <button
                    type="button"
                    className="rounded-xl bg-[#2563eb] px-2 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
                  >
                    View Packages
                  </button>
                </div>
              </div>

              {/* Quick Commerce */}
              <div className="rounded-2xl border border-[#eddcff] bg-[#fffcff] p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="mb-1 flex items-start gap-4">
                  <div className="flex h-12 w-12 min-w-[56px] items-center justify-center rounded-2xl bg-[#f5efff]">
                    <UilShoppingCartAlt size="26" color="#9333ea" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[17px] font-semibold text-[#111827]">Quick Commerce Growth</h3>

                    <p className="mt-1 min-h-[52px] text-[13px] leading-6 text-[#6b7280]">
                      Boost your sales on quick-commerce platforms with expert account handling.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {commerceServices.map((service) => (
                    <div key={service} className="flex items-center gap-2 text-[13px] text-[#374151]">
                      <UilCheckCircle size="15" color="#9333ea" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-[#6b7280]">Starting at</p>

                    <h3 className="text-[22px] font-bold leading-none text-[#9333ea]">₹ 19,999</h3>

                    <span className="text-sm text-[#6b7280]">/ month</span>
                  </div>

                  <button
                    type="button"
                    className="rounded-xl bg-[#9333ea] px-2 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
                  >
                    View Packages
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 space-y-5">
          {/* Why Choose */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
            <h2 className="mb-5 text-base font-semibold text-[#111827]">Why Choose TrackMyProfit Services?</h2>

            <div className="space-y-4">
              {whyChooseUs.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm">
                  <div className="mt-[2px] flex h-7 w-7 items-center justify-center rounded-full bg-[#eafaf1]">
                    <UilCheckCircle size="17" color="#16a34a" />
                  </div>

                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
            <h2 className="mb-5 text-base font-semibold text-[#111827]">Your Service Summary</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#111827] font-semibold">Active Services</span>
                <span className="font-semibold text-[#111827]">2</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#111827] font-semibold">Account Managers</span>
                <span className="font-semibold text-[#111827]">2</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#111827] font-semibold">Marketplaces Covered</span>
                <span className="font-semibold text-[#111827]">3</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#111827] font-semibold">Monthly Investment</span>
                <span className="font-semibold text-[#111827]">₹ 39,998</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#16a34a] py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              Manage My Services
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#111827]">Account Management – How It Works</h2>

          <p className="mt-1 text-sm text-gray-500">
            We assign a dedicated account manager who works on your account like your extended team.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-5 items-start gap-4">
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
                    className={`flex h-14 w-14 items-center justify-center rounded-full ${step.bg} text-2xl ${step.color} shadow-sm`}
                  >
                    {step.icon}
                  </div>

                  {/* Arrow */}
                  {index !== arr.length - 1 && (
                    <div className="absolute left-[72%] top-1/2 -translate-y-1/2">
                      <ArrowRightOutlined className="text-[18px] text-[#2563eb]" />
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="mt-3 text-sm font-semibold text-gray-800">
                  {step.id} {step.title}
                </h3>

                {/* Desc */}
                <p className="mt-1 text-xs leading-5 text-gray-500 max-w-[140px]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Help Box */}
        <div className="mt-10 flex items-start justify-between gap-5 rounded-2xl border border-gray-200 bg-gray-50 p-5 md:flex-row">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eafaf1] shadow-sm">
              <UserOutlined className="text-[24px] text-[#16a34a]" />
            </div>

            {/* Text */}
            <div>
              <h4 className="text-base font-semibold text-gray-800">Need Help Choosing the Right Service?</h4>

              <p className="mt-1 text-sm text-gray-500">
                Our experts are here to help you choose the best solution for your business.
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            type="button"
            className="rounded-xl border border-green-500 bg-white px-6 py-3 text-sm font-semibold text-green-600 transition-all hover:bg-green-50"
          >
            Talk to Expert
          </button>
        </div>
      </div>
    </div>
  );
}

export default Overview;
