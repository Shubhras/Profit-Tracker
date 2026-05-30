import React from 'react';
import { Button, Table, Tabs, Tag } from 'antd';

import {
  // SearchOutlined,
  // FilterOutlined,
  TeamOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';

import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import Amazon from '../../assets/icons/amazon.svg';
import Flipkart from '../../assets/icons/flipkart.png';
import Blinkit from '../../assets/icons/blinkit.png';
import Google from '../../assets/icons/googleads.jpg';
import Meta from '../../assets/icons/metaAds.jpg';
import Instamart from '../../assets/icons/swiggyinstamart.png';

function MyService() {
  const summaryCards = [
    {
      title: 'Active Services',
      value: '6',
      sub: 'Across all platforms',
      color: '#16a34a',
      icon: <TeamOutlined />,
    },
    {
      title: 'Pending Requests',
      value: '1',
      sub: 'Awaiting activation',
      color: '#2563eb',
      icon: <ArrowDownOutlined />,
    },
    {
      title: 'Completed This Month',
      value: '8',
      sub: 'Services completed',
      color: '#9333ea',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'Monthly Investment',
      value: '₹ 1,05,000',
      sub: 'Across all services',
      color: '#f97316',
      icon: <DollarOutlined />,
    },
  ];
  const serviceOverview = [
    { name: 'Account Management', value: 2, color: '#16a34a' },
    { name: 'Digital Marketing', value: 2, color: '#3b82f6' },
    { name: 'Quick Commerce', value: 2, color: '#9333ea' },
    { name: 'Pending', value: 1, color: '#fb923c' },
  ];

  const tableData = [
    {
      key: 1,
      service: 'Amazon Account Management',
      platform: 'Amazon',
      serviceType: 'Account Management',
      plan: 'Pro',
      status: 'Active',
      startDate: '01 May 2026',
      renewalDate: '31 May 2026',
      charge: '₹ 20,000',
    },
    {
      key: 2,
      service: 'Flipkart Account Management',
      platform: 'Flipkart',
      serviceType: 'Account Management',
      plan: 'Basic',
      status: 'Active',
      startDate: '01 May 2026',
      renewalDate: '31 May 2026',
      charge: '₹ 15,000',
    },
    {
      key: 3,
      service: 'Blinkit Account Management',
      platform: 'Blinkit',
      serviceType: 'Quick Commerce',
      plan: 'Pro',
      status: 'Active',
      startDate: '03 May 2026',
      renewalDate: '02 Jun 2026',
      charge: '₹ 20,000',
    },
    {
      key: 4,
      service: 'Google Ads Management',
      platform: 'Google',
      serviceType: 'Digital Marketing',
      plan: 'Premium',
      status: 'Active',
      startDate: '02 May 2026',
      renewalDate: '01 Jun 2026',
      charge: '₹ 25,000',
    },
    {
      key: 5,
      service: 'Meta Ads Management',
      platform: 'Meta',
      serviceType: 'Digital Marketing',
      plan: 'Pro',
      status: 'Active',
      startDate: '03 May 2026',
      renewalDate: '02 Jun 2026',
      charge: '₹ 20,000',
    },
    {
      key: 6,
      service: 'Instamart Management',
      platform: 'Instamart',
      serviceType: 'Quick Commerce',
      plan: 'Basic',
      status: 'Pending',
      startDate: '08 May 2026',
      renewalDate: '07 Jun 2026',
      charge: '₹ 15,000',
    },
  ];

  const platformIcons = {
    Amazon,
    Flipkart,
    Blinkit,
    Google,
    Meta,
    Instamart,
  };

  const columns = [
    {
      title: 'Service',
      dataIndex: 'service',
      width: 140,
      render: (v) => <span className="text-[11px] font-medium">{v}</span>,
    },

    {
      title: 'Platform',
      dataIndex: 'platform',
      width: 90,
      align: 'center',

      render: (v) => <img src={platformIcons[v]} alt={v} className="w-7 h-7 object-contain mx-auto" />,
    },

    {
      title: 'Service Type',
      dataIndex: 'serviceType',
      width: 120,

      render: (v) => <Tag className="text-[10px]">{v}</Tag>,
    },

    {
      title: 'Plan',
      dataIndex: 'plan',
      width: 80,
      render: (v) => <Tag className="text-[10px]">{v}</Tag>,
    },

    {
      title: 'Status',
      dataIndex: 'status',
      width: 90,

      render: (v) => (
        <Tag className="text-[10px]" color={v === 'Active' ? 'green' : 'orange'}>
          {v}
        </Tag>
      ),
    },

    {
      title: 'Start Date',
      dataIndex: 'startDate',
      width: 80,
      render: (v) => <Tag className="text-[10px]">{v}</Tag>,
    },

    {
      title: 'Renewal Date',
      dataIndex: 'renewalDate',
      width: 70,
      render: (v) => <Tag className="text-[10px]">{v}</Tag>,
    },

    {
      title: 'Monthly Charge',
      dataIndex: 'charge',
      width: 100,
      render: (v) => <Tag className="text-[10px]">{v}</Tag>,
    },
  ];

  const renewals = [
    {
      name: 'Amazon Account Management',
      date: '31 May 2026',
      amount: '₹ 20,000',
    },
    {
      name: 'Flipkart Account Management',
      date: '31 May 2026',
      amount: '₹ 15,000',
    },
    {
      name: 'Google Ads Management',
      date: '01 Jun 2026',
      amount: '₹ 25,000',
    },
  ];
  return (
    <div className="mt-3 mb-3 space-y-2 px-2">
      {/* HEADER */}

      <div className="shadow-regular px-2 py-2">
        <h1 className="text-[20px] font-semibold text-dark mb-0">My Services</h1>

        <p className="text-[12px] text-light mb-0">
          View and manage all your active services across marketplaces and platforms.
        </p>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-4 gap-3 xl:grid-cols-4 lg:grid-cols-2 sm:grid-cols-1">
        {' '}
        {summaryCards.map((item, index) => (
          <div key={index} className="bg-white border border-normal rounded-10 shadow-regular px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background:
                    item.color === '#16a34a'
                      ? '#f0fdf4'
                      : item.color === '#2563eb'
                      ? '#eff6ff'
                      : item.color === '#9333ea'
                      ? '#faf5ff'
                      : '#fff7ed',
                }}
              >
                <span className="text-[16px]" style={{ color: item.color }}>
                  {item.icon}
                </span>
              </div>

              <div>
                <p className="text-[11px] text-light mb-0">{item.title}</p>

                <h3 className="text-[22px] font-semibold leading-none mt-1">{item.value}</h3>

                <p className="text-[10px] text-light mt-1 mb-0">{item.sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CONTENT */}

      <div className="grid grid-cols-4 gap-3 xl:grid-cols-1">
        {/* LEFT */}

        <div className="col-span-3 bg-white rounded-10 border border-normal shadow-regular p-3">
          <div className="flex items-center justify-between mb-3">
            <Tabs
              size="small"
              className="
      flex-1
      [&_.ant-tabs-nav]:!mb-0
      [&_.ant-tabs-tab]:!py-[2px]
      [&_.ant-tabs-tab]:!mr-4
      [&_.ant-tabs-tab-btn]:!text-[11px]
    "
              items={[
                { key: '1', label: 'All Services' },
                { key: '2', label: 'Account Management' },
                { key: '3', label: 'Digital Marketing' },
                { key: '4', label: 'Quick Commerce' },
              ]}
            />

            <div className="flex items-center gap-2 ml-3 flex-shrink-0">
              {/* <Select
                size="small"
                defaultValue="All Status"
                className="
        w-[110px]
        [&_.ant-select-selector]:!h-[28px]
        [&_.ant-select-selector]:!items-center
      "
              /> */}

              {/* <Input
                size="small"
                prefix={<SearchOutlined />}
                placeholder="Search..."
                className="
        w-[150px]
        [&_.ant-input-affix-wrapper]:!h-[28px]
      "
              /> */}

              {/* <Button
                size="small"
                icon={<FilterOutlined />}
                className="
        !h-[28px]
        !w-[28px]
        !min-w-[28px]
        !p-0
        flex items-center justify-center
      "
              /> */}
            </div>
          </div>

          <Table
            className="[&_.ant-table-thead>tr>th]:!text-[11px] [&_.ant-table-thead>tr>th]:!font-medium"
            size="small"
            pagination={false}
            scroll={{ x: 1200 }}
            columns={columns}
            dataSource={tableData}
          />
        </div>

        {/* RIGHT SIDEBAR */}

        <div className="space-y-3">
          <div className="bg-white rounded-10 border border-normal shadow-regular p-3">
            <h3 className="text-[13px] font-semibold mb-3">Service Overview</h3>
            <div className="relative h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceOverview} innerRadius={45} outerRadius={68} paddingAngle={2} dataKey="value">
                    {serviceOverview.map((item, index) => (
                      <Cell key={index} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <h3 className="text-[22px] font-semibold leading-none">6</h3>

                <p className="text-[10px] text-light">Total Services</p>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              {serviceOverview.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />

                    <span>{item.name}</span>
                  </div>

                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-10 border border-normal shadow-regular p-3">
            <h3 className="text-[13px] font-semibold mb-3">Upcoming Renewals</h3>

            {renewals.map((item) => (
              <div key={item.name} className="flex justify-between mb-3">
                <div>
                  <p className="text-[10px] font-medium mb-0">{item.name}</p>

                  <p className="text-[9px] text-light mb-0">{item.date}</p>
                </div>

                <span className="text-[#16a34a] text-[11px] font-semibold">{item.amount}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-10 border border-normal shadow-regular p-3 text-center">
            <h3 className="text-[13px] font-semibold mb-2">Need Help?</h3>

            <p className="text-[11px] text-light mb-3">Our experts are here to help.</p>

            <Button type="primary" block>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyService;
