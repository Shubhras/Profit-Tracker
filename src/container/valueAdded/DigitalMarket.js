import React from 'react';
import { Button } from 'antd';
import {
  InfoCircleOutlined,
  NotificationOutlined,
  SettingFilled,
  CrownOutlined,
  UserOutlined,
  FileSearchOutlined,
  AimOutlined,
  SettingOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

import Google from '../../assets/icons/googleADS.png';
import Meta from '../../assets/icons/metaAds.jpg';
import Youtube from '../../assets/icons/youtube.jpg';
import Linkdin from '../../assets/icons/linkdin.jpg';
import Insta from '../../assets/icons/insta.jpeg';
import Twitter from '../../assets/icons/twitter.jpg';

function DigitalMarket() {
  const marketplaces = [
    { name: 'Google', icon: Google },
    { name: 'Meta', icon: Meta },
    { name: 'Youtube', icon: Youtube },
    { name: 'Linkdin', icon: Linkdin },
    { name: 'Insta', icon: Insta },
    { name: 'Twitter', icon: Twitter },
  ];

  return (
    <div className="mt-3 mb-3 space-y-3 px-2">
      {/* HEADER */}
      <div className="shadow-regular px-2 py-2">
        <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-start">
          <div>
            <h1 className="text-[21px] font-semibold text-dark mb-0">Digital Marketing</h1>

            <p className="text-[12px] text-light max-w-[900px] leading-5 mb-0">
              Drive traffic, generate leads, and grow your business with our data-driven digital marketing services.
            </p>
          </div>

          <Button type="link" icon={<InfoCircleOutlined />} className="!text-[12px] !font-medium">
            Refresh Data
          </Button>
        </div>
      </div>
      {/* MARKETPLACES */}
      <div className="rounded-10 border border-normal bg-white shadow-regular p-3">
        <h3 className="text-[14px] font-semibold text-dark mb-3">Our Platforms</h3>

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
            <h3 className="text-[15px] font-semibold text-dark mb-3">Digital Marketing Plans</h3>

            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              {/* BASIC */}

              <div className="rounded-10 border border-[#d9f7e5] bg-[#fcfffd] overflow-hidden h-full flex flex-col">
                <div className="p-2 flex-1">
                  <div className="flex items-start gap-3 mb-1">
                    <div className="w-11 h-11 rounded-full bg-[#e8f9ef] flex items-center justify-center flex-shrink-0">
                      <NotificationOutlined className="text-[#16a34a] text-[20px]" />
                    </div>

                    <div>
                      <h4 className="text-[18px] font-semibold text-[#16a34a] leading-none mb-1">Basic</h4>

                      <p className="text-[11px] text-light leading-4">
                        Designed for sellers looking for essential support and steady growth.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    {[
                      'Cataloguing & Listings (without A+ Content)',
                      'One Dedicated Account Manager',
                      'Deals & Coupons Management',
                      'Ad Campaign Creation & Optimization',
                      'Weekly Updates & Performance Tracking',
                      'Monthly Reporting & Review Meeting',
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

                    <Button
                      type="primary"
                      className="bg-[#16a34a] border-[#16a34a] h-[28px] px-3 text-[10px] font-semibold rounded-md flex-shrink-0"
                    >
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
                        For sellers who need a more robust approach and enhanced listing optimization.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    {[
                      'Everything in Basic, plus:',
                      '3 Dedicated Team Members',
                      'Proactive Ticket Follow-Ups & Resolution',
                      '10 A+ Content Included',
                      'A+ Content & Enhanced Listings',
                      'Daily Performance & Task Updates',
                      'Ad Optimization (Daily)',
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

                    <Button
                      type="primary"
                      className="bg-[#16a34a] border-[#16a34a] h-[28px] px-3 text-[10px] font-semibold rounded-md flex-shrink-0"
                    >
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
                        For sellers looking for end-to-end management with full operational support.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    {[
                      'Everything in Basic & Pro, plus:',
                      'Additional Team Leader',
                      'Weekly Google Meet Consultations',
                      '20 A+ Content Included',
                      'Account Health Monitoring',
                      'FBA Onboarding & Assistance',
                      'Consignment Creation & Shipment Support',
                      'Amazon Store Front Creation',
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
                      type="primary"
                      className="bg-[#16a34a] border-[#16a34a] h-[28px] px-3 text-[10px] font-semibold rounded-md flex-shrink-0"
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
                'Dedicated Account Management',
                'Data-Driven Growth Strategies',
                'Marketplace Expertise',
                'End-to-End Service Solutions',
                'Transparent Reporting & Insights',
                'Improve Account Health & Sales',
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
                type="primary"
                block
                className="bg-[#16a34a] border-[#16a34a] h-[32px] px-2 text-[11px] font-semibold"
              >
                Manage My Services
              </Button>
            </div>
          </div>
        </div>
      </div>{' '}
      {/* ACCOUNT MANAGEMENT WORKFLOW */}
      <div className="bg-white rounded-10 border border-normal shadow-regular p-4">
        <h3 className="text-[15px] font-semibold text-dark mb-1">Our Digital Marketing Workflow</h3>

        <p className="text-[11px] text-light mb-4">
          Our proven 5-step process to grow and manage your accounts effectively.
        </p>

        <div className="flex items-start justify-between lg:flex-col lg:gap-6">
          {[
            {
              no: '1',
              title: 'Onboarding',
              desc: 'Account access & requirement gathering',
              icon: <UserOutlined className="text-[#16a34a] text-[20px]" />,
              bg: '#e8f9ef',
            },
            {
              no: '2',
              title: 'Analysis',
              desc: 'Account audit & performance analysis',
              icon: <FileSearchOutlined className="text-[#2563eb] text-[20px]" />,
              bg: '#edf4ff',
            },
            {
              no: '3',
              title: 'Strategy',
              desc: 'Customised strategy & action plan',
              icon: <AimOutlined className="text-[#9333ea] text-[20px]" />,
              bg: '#f5edff',
            },
            {
              no: '4',
              title: 'Execution',
              desc: 'Implementation & optimization',
              icon: <SettingOutlined className="text-[#f97316] text-[20px]" />,
              bg: '#fff3e8',
            },
            {
              no: '5',
              title: 'Growth',
              desc: 'Monitor, analyze & achieve growth',
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

export default DigitalMarket;
