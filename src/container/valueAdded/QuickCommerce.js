import React from 'react';
import { Button } from 'antd';
import {
  InfoCircleOutlined,
  SettingFilled,
  CrownOutlined,
  UserOutlined,
  FileSearchOutlined,
  // AimOutlined,
  SettingOutlined,
  LineChartOutlined,
  NotificationOutlined,
} from '@ant-design/icons';

import Blinkit from '../../assets/icons/blinkit.png';
import Zeepto from '../../assets/icons/zepto.png';
import Swiggy from '../../assets/icons/swiggy.png';
import Bigbasket from '../../assets/icons/bigbasket.png';
import Dunzo from '../../assets/icons/dunzo.png';
import SwiggyInsta from '../../assets/icons/swiggyinstamart.png';

function QuickCommerce() {
  const marketplaces = [
    { name: 'Blinkit', icon: Blinkit },
    { name: 'Zepto', icon: Zeepto },
    { name: 'Swiggy', icon: Swiggy },
    { name: 'Bigbasket', icon: Bigbasket },
    { name: 'Dunzo', icon: Dunzo },
    { name: 'SwiggyInsta', icon: SwiggyInsta },
  ];

  return (
    <div className="mt-3 mb-3 space-y-3 px-2">
      {/* HEADER */}
      <div className="shadow-regular px-2 py-2">
        <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-start">
          <div>
            <h1 className="text-[21px] font-semibold text-dark mb-0">Quick Commerce</h1>

            <p className="text-[12px] text-light max-w-[900px] leading-5 mb-0">
              Manage your Quick Commerce accounts efficiently with dedicated account management services. Track
              performance, optimize, listings, improve visibility and grow your business with export strategies tailored
              for your brand.
            </p>
          </div>

          <Button type="link" icon={<InfoCircleOutlined />} className="!text-[12px] !font-medium">
            How it Works
          </Button>
        </div>
      </div>
      {/* MARKETPLACES */}
      <div className="rounded-10 border border-normal bg-white shadow-regular p-3">
        <h3 className="text-[14px] font-semibold text-dark mb-3">Our Quick Commerce Platforms</h3>

        <div className="grid grid-cols-6 gap-3 xl:grid-cols-3 sm:grid-cols-2">
          {marketplaces.map((item) => (
            <div
              key={item.name}
              className="h-[50px] rounded-10 border border-normal bg-white flex items-center justify-center px-3"
            >
              <img src={item.icon} alt={item.name} className="h-7 w-auto object-contain" />
            </div>
          ))}
        </div>
      </div>
      {/* ACCOUNT MANAGEMENT PLANS */}
      <div className="grid grid-cols-4 gap-1 xl:grid-cols-2 lg:grid-cols-1">
        {/* LEFT SIDE */}

        <div className="col-span-3 xl:col-span-2 lg:col-span-1">
          <div className="bg-white rounded-10 border border-normal shadow-regular p-3">
            <h3 className="text-[15px] font-semibold text-dark mb-3">Our Quick Commerce Accont Management Plans</h3>

            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {/* BASIC */}

              <div className="rounded-10 border border-[#d9f7e5] bg-[#fcfffd] overflow-hidden h-full flex flex-col">
                <div className="p-2 flex-1">
                  <div className="flex items-start gap-3 mb-1">
                    <div className="w-11 h-11 rounded-full bg-[#e8f9ef] flex items-center justify-center flex-shrink-0">
                      <UserOutlined className="text-[#16a34a] text-[20px]" />
                    </div>

                    <div>
                      <h4 className="text-[18px] font-semibold text-[#16a34a] leading-none mb-1">Basic</h4>

                      <p className="text-[11px] text-light leading-4">
                        Designed for businesses starting on quick commerce platforms.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    {[
                      'Store Setup & Onboarding',
                      'Product Listing & Cataloging',
                      'Inventory Management',
                      'Order & Fulfillment Monitoring',
                      'Performance Tracking',
                      'Weekly Updates & Reporting',
                      'Account Health Monitoring',
                    ].map((item) => (
                      <div key={item} className="flex gap-2">
                        <span className="text-[#16a34a] font-semibold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#d9f7e5] px-2 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] text-light leading-none mb-2">Starting at</p>

                      <h4 className="text-[16px] font-semibold text-[#16a34a] leading-none mb-1">₹ 15,000</h4>

                      <p className="text-[10px] text-light leading-none">per month / per marketplace</p>
                    </div>

                    <Button className="bg-[#16a34a] border-[#16a34a] text-white h-[28px] px-3 text-[10px] font-semibold rounded-md flex-shrink-0">
                      Choose Basic Plan
                    </Button>
                  </div>
                </div>
              </div>

              {/* PRO */}

              <div className="rounded-10 border border-[#dbe7ff] bg-[#fcfdff] overflow-hidden h-full flex flex-col">
                <div className="p-2 flex-1">
                  <div className="flex items-start gap-3 mb-1">
                    <div className="w-11 h-11 rounded-full bg-[#edf4ff] flex items-center justify-center flex-shrink-0">
                      <SettingFilled className="text-[#2563eb] text-[18px]" />
                    </div>

                    <div>
                      <h4 className="text-[18px] font-semibold text-[#2563eb] leading-none mb-1">Pro</h4>

                      <p className="text-[11px] text-light leading-4">
                        For growing businesses that need better performance and scale.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    {[
                      'Everything in Basic, plus:',
                      'Priority Support',
                      'Promotions & Offers Management',
                      'Category & Search Optimization',
                      'Ratings & Reviews Management',
                      'Competitor Analysis',
                      'Advanced Performance Analytics',
                      'Dedicated Account Manager',
                    ].map((item) => (
                      <div key={item} className="flex gap-2">
                        <span className="text-[#2563eb] font-semibold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 rounded-md bg-[#edf4ff] p-2 text-center">
                    <span className="text-[10px] text-[#2563eb] font-medium">
                      Account Manager + Catalogue Manager + Graphics Designer
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#dbe7ff] px-2 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-light leading-none mb-2">Starting at</p>

                      <h4 className="text-[16px] font-semibold text-[#2563eb] leading-none mb-1">₹ 20,000</h4>

                      <p className="text-[10px] text-light leading-none">per month / per marketplace</p>
                    </div>

                    <Button className="bg-[#2563eb] border-[#2563eb] text-white h-[28px] px-3 text-[10px] font-semibold rounded-md flex-shrink-0">
                      Choose Pro Plan
                    </Button>
                  </div>
                </div>
              </div>

              {/* PREMIUM */}

              <div className="rounded-10 border border-[#eadcff] bg-[#fefcff] overflow-hidden h-full flex flex-col">
                <div className="p-2 flex-1">
                  <div className="flex items-start gap-3 mb-1">
                    <div className="w-11 h-11 rounded-full bg-[#f5edff] flex items-center justify-center flex-shrink-0">
                      <CrownOutlined className="text-[#9333ea] text-[20px]" />
                    </div>

                    <div>
                      <h4 className="text-[18px] font-semibold text-[#9333ea] leading-none mb-1">Premium</h4>

                      <p className="text-[11px] text-light leading-4">
                        For businesses looking for end-to-end management and maximum growth.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    {[
                      'Everything in Pro, plus:',
                      'Dedicated Team Lead',
                      'Custom Growth Strategy',
                      'Ad Campaigns & Budget Optimization',
                      'Exclusive Deals & Tie-ups',
                      'Real-time Performance Monitoring',
                      'Account Health Management & Recovery',
                      '24/7 Priority Support',
                    ].map((item) => (
                      <div key={item} className="flex gap-2">
                        <span className="text-[#9333ea] font-semibold">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#eadcff] px-2 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-light leading-none mb-2">Starting at</p>

                      <h4 className="text-[16px] font-semibold text-[#9333ea] leading-none mb-1">₹ 25,000</h4>

                      <p className="text-[10px] text-light leading-none">per month / per marketplace</p>
                    </div>

                    <Button
                      // type="primary"
                      className="bg-[#9333ea] border-[#9333ea] text-white h-[28px] px-3 text-[10px] font-semibold rounded-md flex-shrink-0"
                    >
                      Choose Premium Plan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}

        <div className="space-y-2">
          <div className="bg-white rounded-10 border border-normal shadow-regular p-4">
            <h3 className="text-[15px] font-semibold mb-3">Why Choose Our Services?</h3>

            <div className="space-y-3 text-[12px]">
              {[
                'Dedicated Quick Commerce Experts',
                'Data-Driven Growth Strategies',
                'End-to-End Account Management',
                'End-to-End Service Solutions',
                'Transparent Reporting & Insights',
                'Improve Growth & Sales',
              ].map((item) => (
                <div key={item} className="flex gap-2">
                  <span className="text-[#16a34a]">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-10 border border-normal shadow-regular p-4">
            <h3 className="text-[15px] font-semibold mb-4">Your Service Summary</h3>

            <div className="space-y-3 text-[12px]">
              <div className="flex justify-between">
                <span>Active Services</span>
                <span className="font-semibold">3</span>
              </div>

              <div className="flex justify-between">
                <span>Pending Requests</span>
                <span className="font-semibold">1</span>
              </div>

              <div className="flex justify-between">
                <span>Completed This Month</span>
                <span className="font-semibold">12</span>
              </div>

              <div className="border-t border-normal pt-3">
                <div className="flex justify-between">
                  <span>Monthly Investment</span>
                  <span className="font-semibold text-[#16a34a]">₹ 60,000</span>
                </div>
              </div>

              <Button
                block
                className="bg-[#16a34a] border-[#16a34a] text-white h-[32px] px-2 text-[11px] font-semibold"
              >
                Manage My Services
              </Button>
            </div>
          </div>
        </div>
      </div>{' '}
      {/* ACCOUNT MANAGEMENT WORKFLOW */}
      <div className="bg-white rounded-10 border border-normal shadow-regular p-4">
        <h3 className="text-[15px] font-semibold text-dark mb-1">Our Quick Commerce Management Workflow</h3>

        <p className="text-[11px] text-light mb-4">
          Our proven 5-step process to manage your stores and maximize growth.
        </p>

        <div className="flex items-start justify-between lg:flex-col lg:gap-6">
          {[
            {
              no: '1',
              title: 'Onboarding',
              desc: 'Account setup, document verification & store onboarding',
              icon: <UserOutlined className="text-[#16a34a] text-[20px]" />,
              bg: '#e8f9ef',
            },
            {
              no: '2',
              title: 'Store Setup',
              desc: 'Cataloging, pricing, inventory & storefront optimization',
              icon: <FileSearchOutlined className="text-[#2563eb] text-[20px]" />,
              bg: '#edf4ff',
            },
            {
              no: '3',
              title: 'Operations',
              desc: 'Order management, fulfillment tracking & stock synx',
              icon: <NotificationOutlined className="text-[#9333ea] text-[20px]" />,
              bg: '#f5edff',
            },
            {
              no: '4',
              title: 'Optimization',
              desc: 'Promitions, ads, pricing & performance improvement',
              icon: <SettingOutlined className="text-[#f97316] text-[20px]" />,
              bg: '#fff3e8',
            },
            {
              no: '5',
              title: 'Growth',
              desc: 'Analytics, insights & strategies to maximize sales',
              icon: <LineChartOutlined className="text-[#16a34a] text-[20px]" />,
              bg: '#ecfdf3',
            },
          ].map((step, index) => (
            <div key={step.no} className="relative flex flex-col items-center text-center w-[170px] lg:w-full">
              {/* ARROW */}

              {index !== 4 && (
                <div className="absolute top-[18px] left-[120px] w-[110px] xl:w-[70px] lg:hidden flex items-center">
                  <div className="flex-1 border-t border-dashed border-[#94a3b8]" />

                  <span className="ml-1 text-[#64748b] text-[14px] font-semibold">➜</span>
                </div>
              )}

              {/* ICON */}

              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ background: step.bg }}
              >
                {step.icon}
              </div>

              {/* TITLE */}

              <h4 className="text-[13px] font-semibold text-dark mb-1">
                {step.no}. {step.title}
              </h4>

              {/* DESCRIPTION */}

              <p className="text-[11px] text-light leading-4 max-w-[140px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickCommerce;
