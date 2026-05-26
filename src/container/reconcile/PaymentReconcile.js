import React from 'react';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  HourglassOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  WarningOutlined,
  PercentageOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

function PaymentReconcile() {
  const summaryCards = [
    {
      title: 'Total Settled Amount',
      amount: '₹ 1,70,966.19',
      subtitle: 'From 1,470 Orders',
      icon: <CheckCircleOutlined />,
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    {
      title: 'Pending Settlement',
      amount: '₹ 65,130.50',
      subtitle: 'From 18 Orders',
      icon: <HourglassOutlined />,
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      iconBg: 'bg-purple-100',
      text: 'text-purple-600',
    },
    {
      title: 'Returns & Adjustments',
      amount: '-₹ 37,424.71',
      subtitle: '8 Orders',
      icon: <ReloadOutlined />,
      bg: 'bg-red-50',
      border: 'border-red-100',
      iconBg: 'bg-red-100',
      text: 'text-red-500',
    },
    {
      title: 'Net Recoverable',
      amount: '₹ 65,130.50',
      subtitle: 'From Marketplaces',
      icon: <ArrowUpOutlined />,
      bg: 'bg-green-50',
      border: 'border-green-100',
      iconBg: 'bg-green-100',
      text: 'text-green-600',
    },
  ];

  const leakCards = [
    {
      title: 'Shipping Leaks',
      amount: '₹ 12,450.80',
      orders: 'From 45 Orders',
      icon: <ShoppingCartOutlined />,
    },
    {
      title: 'Other Leaks',
      amount: '₹ 18,320.45',
      orders: 'From 63 Orders',
      icon: <WarningOutlined />,
    },
    {
      title: 'Fee/Commission Leaks',
      amount: '₹ 10,125.08',
      orders: 'From 32 Orders',
      icon: <PercentageOutlined />,
    },
    {
      title: 'Tax/VAT Leaks',
      amount: '₹ 8,254.00',
      orders: 'From 18 Orders',
      icon: <InfoCircleOutlined />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fb] p-6">
      {/* Header */}
      {/* <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"> */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Payment Reconciliation Dashboard</h1>

          <p className="text-m text-gray-600">
            Overview of payments, settlements, leaks and amounts to recover from marketplaces.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <InfoCircleOutlined />
            <span>Reconciliation Cycle: Daily</span>
          </div>

          <div className="flex items-center gap-2">
            <ClockCircleOutlined />
            <span>Last Updated: May 31, 2026 09:00 AM</span>
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-4 mb-2">
        {' '}
        {summaryCards.map((item, index) => (
          <div key={index} className={`${item.bg} rounded-2xl p-4 border ${item.border} shadow-sm`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-sm font-medium ${item.text}`}>{item.title}</p>

                <h2 className={`text-2xl font-bold mt-2 mb-1 ${item.text}`}>{item.amount}</h2>

                <p className="text-[13px] text-gray-500 mt-2">{item.subtitle}</p>
              </div>

              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center text-xl ${item.iconBg} ${item.text}`}
              >
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-12 gap-4 mb-2">
        {' '}
        {/* Payment Summary */}
        <div className="col-span-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {' '}
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-lg font-semibold text-gray-800">Payment Summary</h2>
            {/* <InfoCircleOutlined className="text-gray-400 mb-2" /> */}
          </div>
          <div className="flex items-center justify-between gap-6 mt-4">
            {' '}
            {/* Fake Circle */}
            <div className="relative min-w-[180px] h-44 w-44 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-400 flex items-center justify-center">
              {' '}
              <div className="h-36 w-36 rounded-full bg-white flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">Net Recoverable</p>
                <h3 className="text-xl font-bold text-green-600 mt-1">₹ 65,130.50</h3>
              </div>
            </div>
            {/* Legends */}
            <div className="flex-1 space-y-5">
              {' '}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Settled Amount</span>
                </div>

                <span className="font-semibold text-gray-700">60.0%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-gray-600">Pending Settlement</span>
                </div>

                <span className="font-semibold text-gray-700">22.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="text-sm text-gray-600">Returns & Adjustments</span>
                </div>

                <span className="font-semibold text-gray-700">-13.2%</span>
              </div>
            </div>
          </div>
        </div>
        {/* Payment Leaks */}
        <div className="col-span-7 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {' '}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">Payment Leaks</h2>

              <InfoCircleOutlined className="text-gray-400 mb-2" />
            </div>

            <p className="text-red-500 font-bold">Total Leaks: ₹ 49,150.33</p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {' '}
            {leakCards.map((item, index) => (
              <div
                key={index}
                className="bg-red-50 border border-red-100 rounded-2xl p-4 h-[170px] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between min-h-[42px] gap-2">
                  {' '}
                  <p className="text-sm font-medium text-gray-600 leading-5">{item.title}</p>
                </div>

                <h3 className="text-sm font-bold text-red-500">{item.amount}</h3>

                <p className="text-sm text-gray-500 mt-2">{item.orders}</p>
                <div className="text-red-500 text-lg">{item.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-12 gap-4">
        {/* Table */}
        <div className="col-span-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-auto">
          {' '}
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Marketplaces Recoverable</h2>

            <InfoCircleOutlined className="text-gray-400 mb-2" />
          </div>
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 text-left text-sm text-gray-500">
                <th className="p-4 rounded-l-xl">Marketplace</th>
                <th className="p-4">Settled Amount</th>
                <th className="p-4">Pending Settlement</th>
                <th className="p-4">Net Recoverable</th>
                <th className="p-4 rounded-r-xl">Orders</th>
              </tr>
            </thead>

            <tbody>
              {[
                ['Amazon', '₹ 98,450.10', '₹ 28,560.20', '₹ 28,560.20', 812],
                ['Flipkart', '₹ 35,210.50', '₹ 12,340.30', '₹ 12,340.30', 412],
                ['Meesho', '₹ 18,750.40', '₹ 8,120.00', '₹ 8,120.00', 168],
                ['Others', '₹ 18,555.19', '₹ 16,109.99', '₹ 16,109.99', 78],
              ].map((row, index) => (
                <tr key={index} className="border-b border-gray-100 text-sm">
                  {row.map((cell, idx) => (
                    <td key={idx} className="p-4 text-gray-700 font-medium">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-gray-100 text-sm font-bold text-gray-800">
                <td className="p-4 rounded-l-xl">Total</td>

                <td className="p-4">₹ 1,70,966.19</td>

                <td className="p-4">₹ 65,130.50</td>

                <td className="p-4 text-green-600">₹ 65,130.50</td>

                <td className="p-4 rounded-r-xl">1470</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Cashflow Snapshot</h2>
            <InfoCircleOutlined className="text-gray-400 mb-2" />{' '}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#fafafa] border border-gray-100 rounded-xl px-3 py-3">
              <span className="text-sm font-medium text-gray-700">Orders Paid (Customer)</span>

              <span className="text-sm font-bold text-blue-500">₹2,20,790.85</span>
            </div>

            <div className="flex items-center justify-between bg-[#fafafa] border border-gray-100 rounded-xl px-3 py-3">
              <span className="text-sm font-medium text-gray-700">Settled by Marketplaces</span>

              <span className="text-sm font-bold text-green-500">₹1,70,966.19</span>
            </div>

            <div className="flex items-center justify-between bg-[#fafafa] border border-gray-100 rounded-xl px-3 py-3">
              <span className="text-sm font-medium text-gray-700">Returns & Adjustments</span>

              <span className="text-sm font-bold text-red-500">-₹37,424.71</span>
            </div>

            <div className="flex items-center justify-between bg-[#fafafa] border border-gray-100 rounded-xl px-3 py-3">
              <span className="text-sm font-medium text-gray-700">Advertisement Spend</span>

              <span className="text-sm font-bold text-red-500">-₹49,150.33</span>
            </div>

            <div className="flex items-center justify-between bg-[#f3fdf7] border border-green-100 rounded-xl px-3 py-3 mt-4">
              <span className="text-sm font-semibold text-gray-800">Net Recoverable</span>

              <span className="text-sm font-bold text-green-600">₹65,130.50</span>
            </div>
          </div>
        </div>

        {/* Action Required */}
        <div className="col-span-3 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {' '}
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-800">Action Required</h2>

            <InfoCircleOutlined className="text-gray-400 mb-2" />
          </div>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-2xl p-2 flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-lg">
                <HourglassOutlined />
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">18 Orders</h3>
                <p className="text-sm text-gray-500">Pending settlement</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl p-2 flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-lg">
                <WarningOutlined />
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">63 Orders</h3>
                <p className="text-sm text-gray-500">Affected by payment leaks</p>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-2 flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">
                <ArrowUpOutlined />
              </div>

              <div>
                <h3 className="font-semibold text-gray-800">₹ 65,130.50</h3>

                <p className="text-sm text-gray-500">Amount recoverable from marketplaces</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentReconcile;
