import React from 'react';
import { Card, Button } from 'antd';
import { CloseOutlined, DollarCircleOutlined, BarChartOutlined, CarOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Line } from 'recharts';
import AdsTab from './AdsTab';
import ReturnShippingTab from './ReturnShippingTab';

export default function ProfitModal({ open, record, onClose, type }) {
  if (!open) return null;

  const stats = [
    { label: 'RTO(%)', value: '4%', color: 'text-orange-500' },
    { label: 'Customer Return(%)', value: '3%', color: 'text-orange-500' },
    { label: 'Ship Cost(%)', value: '23%', color: 'text-blue-500' },
    { label: 'TACOS', value: '-1%', color: 'text-blue-500' },
    { label: 'Profit Margin', value: '16%', color: 'text-green-500' },
    { label: 'Profit', value: '₹15,375', color: 'text-green-600' },
    { label: 'Neg.Settlement', value: '-₹3,092', color: 'text-red-500' },
  ];
  const chartData = [
    { date: '01/04', sales: 6000, profit: 800 },
    { date: '02/04', sales: 6500, profit: 0 },
    { date: '03/04', sales: 7800, profit: 1200 },
    { date: '04/04', sales: 9000, profit: 1000 },
    { date: '05/04', sales: 9500, profit: 400 },
    { date: '06/04', sales: 4500, profit: 300 },
    { date: '07/04', sales: 7800, profit: 1300 },
    { date: '08/04', sales: 7200, profit: 900 },
    { date: '09/04', sales: 5000, profit: 1100 },
    { date: '10/04', sales: 4800, profit: 300 },
    { date: '11/04', sales: 4500, profit: 350 },
    { date: '12/04', sales: 7000, profit: 800 },
    { date: '13/04', sales: 5500, profit: 1000 },
    { date: '14/04', sales: 7200, profit: 1050 },
    { date: '15/04', sales: 6000, profit: 1800 },
    { date: '16/04', sales: 7200, profit: 1900 },
    { date: '17/04', sales: 4500, profit: 1200 },
    { date: '18/04', sales: 4800, profit: 800 },
    { date: '19/04', sales: 2500, profit: 300 },
  ];
  //   const [activeTab, setActiveTab] = React.useState('finance');
  const [activeTab, setActiveTab] = React.useState('finance');

  React.useEffect(() => {
    if (open) {
      setActiveTab(type === 'returns' ? 'returns' : 'finance');
    }
  }, [open, type]);

  return (
    <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center">
      <div className="bg-white w-[95%] h-[95%] rounded-xl shadow-2xl overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="text-[15px] font-semibold text-gray-800">
            channel : <span className="font-bold">{record?.channel}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* <span className="text-sm text-gray-500">01-04-26 → 30-04-26</span> */}

            <Button type="text" onClick={onClose}>
              <CloseOutlined />
            </Button>
          </div>
        </div>

        <div className="flex gap-4 px-6 py-3 border-b text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition border-b-2 ${
              activeTab === 'finance'
                ? 'bg-green-100 text-green-700 border-green-600 font-semibold'
                : 'text-black font-semibold border-transparent hover:bg-gray-100'
            }`}
          >
            <DollarCircleOutlined />
            Finance
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ads')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition border-b-2 ${
              activeTab === 'ads'
                ? 'bg-green-100 text-green-700 border-green-600 font-semibold'
                : 'text-black font-semibold border-transparent hover:bg-gray-100'
            }`}
          >
            <BarChartOutlined />
            Ad campaigns
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition border-b-2 ${
              activeTab === 'returns'
                ? 'bg-green-100 text-green-700 border-green-600 font-semibold'
                : 'text-black font-semibold border-transparent hover:bg-gray-100'
            }`}
          >
            <CarOutlined />
            Return & Shipping
          </button>
        </div>

        {activeTab === 'finance' && (
          <>
            <div className="grid grid-cols-7 gap-4 px-6 py-4">
              {stats.map((item) => (
                <div key={item.label} className="bg-gray-50 rounded-lg p-3 border hover:shadow-sm transition">
                  <div className="text-[13px] text-black font-semibold mb-1">{item.label}</div>
                  <div className={`text-[15px] font-semibold ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 px-6 pb-6">
              <Card title={<span className="text-black font-semibold text-m">Order status</span>}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: 'Pending Shipment', orders: 50, units: 50, color: 'bg-orange-100' },
                    { title: 'Customer Return', orders: 21, units: 21, color: 'bg-pink-100' },
                    { title: 'Shipped', orders: 483, units: 484, color: 'bg-green-100' },
                    { title: 'RTO', orders: 23, units: 23, color: 'bg-blue-100' },
                  ].map((item) => (
                    <div key={item.title} className="bg-gray-50 rounded-lg p-3 border flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-black">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-1">orders {item.orders}</div>
                        <div className="text-xs text-gray-500">units {item.units}</div>
                      </div>

                      <div className={`w-6 h-6 rounded-full ${item.color}`} />
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="font-semibold text-sm mb-2 text-gray-700">Cashflow</div>

                  {[
                    ['Paid in Bank', '₹10,317.7'],
                    ['Settled to be paid', '₹54,851.0'],
                    ['Settled Adj', '₹78.8'],
                    ['Unsettled Estimated', '₹7,149.8'],
                    ['Cashback Pending', '₹0.0'],
                    ['Cashback Received', '₹0.0'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-xs py-2 border-b last:border-none">
                      <span className="text-black">{label}</span>
                      <span className="text-black font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title={<span className="text-black font-semibold text-m">Profit Detail</span>}>
                {/* HEADER */}
                <div className="grid grid-cols-5 text-xs font-semibold border-b pb-2 mb-2 text-black font-bold">
                  {/* <span></span> */}
                  <span />
                  <span className="text-center">Qty</span>
                  <span className="text-center">INR(Exc.)</span>
                  <span className="text-center">Tax</span>
                  <span className="text-center">INR(Inc)</span>
                </div>

                {/* ROWS */}
                {[
                  ['Gross', '612', '', '', '₹1,11,059'],
                  ['Cancelled', '-34', '', '', '-₹5,477'],
                  ['Cancelled(RTO)', '-23', '', '', '-₹5,732'],
                  ['Returned(RTO)', '0', '', '', '₹0'],
                  ['Returned(C Ref)', '-22', '', '', '-₹4,987'],
                  ['Claimed', '0', '', '', '₹0'],
                ].map((row) => (
                  <div className="grid grid-cols-5 text-xs py-2 border-b">
                    <span className="text-black">{row[0]}</span>
                    <span className="text-center">{row[1]}</span>
                    <span className="text-center">{row[2]}</span>
                    <span className="text-center">{row[3]}</span>
                    <span className="text-center font-medium">{row[4]}</span>
                  </div>
                ))}

                {/* NET */}
                <div className="grid grid-cols-5 text-xs py-2 px-2 bg-blue-100 font-semibold mt-2 rounded">
                  <span>Net</span>
                  <span className="text-center">533</span>
                  <span className="text-center">₹90,344</span>
                  <span className="text-center">₹4,519</span>
                  <span className="text-center">₹94,863</span>
                </div>

                {/* EXTRA ROWS */}
                {[
                  ['+ MP Fees w/o Claims', '', '-₹248', '-₹1', '-₹249'],
                  ['+ Shipping Fees', '', '-₹18,378', '-₹3,308', '-₹21,686'],
                  ['TCS/TDS', '', '', '-₹530', '-₹530'],
                  ['claims', '', '₹0', '', '₹0'],
                ].map((row) => (
                  <div className="grid grid-cols-5 text-xs py-2 border-b">
                    <span className="text-black">{row[0]}</span>
                    {/* <span></span> */}
                    <span />
                    <span className="text-center">{row[2]}</span>
                    <span className="text-center">{row[3]}</span>
                    <span className="text-center">{row[4]}</span>
                  </div>
                ))}

                {/* SETTLED */}
                <div className="grid grid-cols-5 text-xs py-2 px-2 bg-blue-100 font-semibold mt-2 rounded">
                  <span>Settled Amount</span>
                  {/* <span></span> */}
                  <span />
                  <span className="text-center">₹71,718</span>
                  <span className="text-center">₹680</span>
                  <span className="text-center">₹72,397</span>
                </div>

                {/* MORE ROWS */}
                {[
                  ['+ Std Cost', '', '-₹54,105', '', '-₹54,105'],
                  ['+ Ads', '', '-₹406', '-₹73', '-₹479'],
                  ['+ Account Charges', '', '₹0', '', '₹0'],
                  ['+ Otherfees', '', '-₹1,832', '', '-₹1,832'],
                  ['TCS', '', '', '₹530', '₹530'],
                  ['GST to Pay', '', '', '-₹1,137', '-₹1,137'],
                ].map((row) => (
                  <div className="grid grid-cols-5 text-xs py-2 border-b">
                    <span className="text-black">{row[0]}</span>
                    {/* <span></span> */}
                    <span />
                    <span className="text-center">{row[2]}</span>
                    <span className="text-center">{row[3]}</span>
                    <span className="text-center">{row[4]}</span>
                  </div>
                ))}

                {/* FINAL PROFIT */}
                <div className="grid grid-cols-5 text-xs py-2 px-2 bg-blue-200 font-bold mt-2 rounded">
                  <span>Profit</span>
                  <span className="text-center">533</span>
                  <span className="text-center">₹15,375</span>
                  <span className="text-center">₹0</span>
                  <span className="text-center">₹15,375</span>
                </div>
              </Card>
            </div>
            <div className="px-6 pb-6">
              <Card title="Channel vs Gross Sales, Profit & Qty">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />

                    <Bar dataKey="sales" fill="#3b82f6" />
                    <Line type="monotone" dataKey="profit" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </>
        )}
        {activeTab === 'ads' && <AdsTab />}

        {activeTab === 'returns' && <ReturnShippingTab />}
      </div>
    </div>
  );
}
