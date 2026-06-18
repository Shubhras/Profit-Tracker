import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChartOutlined,
  TableOutlined,
  NotificationOutlined,
  SwapOutlined,
  AccountBookOutlined,
} from '@ant-design/icons';

import profitSummaryImg from '../../../../assets/icons/Dashboard.png';
import profitTableImg from '../../../../assets/icons/profitTable.png';
import advertisingImg from '../../../../assets/icons/advertising.png';
import returnsAdjustmentsImg from '../../../../assets/icons/returns.png';
import paymentReconcile from '../../../../assets/icons/paymentReconcile.png';

const features = [
  {
    id: 'profit-summary',
    tag: 'Dashboard',
    icon: <LineChartOutlined />,
    title: 'See your real profit, not just your revenue',
    description:
      'Total sales look healthy until fees, ad spend, returns and tax eat into them. Profit Summary nets all of that out automatically, so the number on your screen is the number that actually lands in your account.',
    points: [
      'Live margin and ROI on every order, updated daily',
      'Profit and loss IDs flagged automatically for quick review',
      'One view across sales, quantity and returns',
    ],
    color: 'emerald',
    media: {
      type: 'screenshot',
      src: profitSummaryImg,
      alt: 'Profit summary dashboard showing total sales, total profit and sales details',
    },
  },
  {
    id: 'profit-table',
    tag: 'SKU Profit',
    icon: <TableOutlined />,
    title: 'Drill down to the SKU that is actually losing you money',
    description:
      'Dashboards tell you something is off. Profit Table View tells you exactly what. Every fee, every tax line and every return is broken out per order, so you can stop guessing which products to fix.',
    points: [
      'Net sales, MP fees, GST and ad spend in one row per SKU',
      'Sortable, filterable columns built for line-by-line audits',
      'Export to spreadsheet for your accountant or your own model',
    ],
    color: 'blue',
    media: { type: 'screenshot', src: profitTableImg, alt: 'Profit table view showing per-order financial breakdown' },
  },
  {
    id: 'advertising',
    tag: 'Advertising',
    icon: <NotificationOutlined />,
    title: 'Know which ad spend is working before the month closes',
    description:
      'ACOS, TACOS and ROAS only matter if you can act on them in time. The advertising dashboard tracks performance by campaign type and surfaces the changes worth making, instead of leaving you to reverse-engineer a spreadsheet.',
    points: [
      'ACOS, TACOS and ROAS trended daily, not just at month-end',
      'Spend and sales broken down by campaign type automatically',
      'AI recommendations for bid and budget changes, one click to apply',
    ],
    color: 'purple',
    media: {
      type: 'screenshot',
      src: advertisingImg,
      alt: 'Advertising dashboard showing ACOS, TACOS, ROAS and campaign performance',
    },
  },
  {
    id: 'returns-adjustments',
    tag: 'Returns & Refunds',
    icon: <SwapOutlined />,
    title: 'Catch every refund and adjustment marketplaces quietly make',
    description:
      'Returns, refunds and adjustment offsets happen across every connected marketplace, often without a clean paper trail. This view reconciles all of it against your orders, so nothing slips through unnoticed.',
    points: [
      'Total returns, refunds issued and net impact in one place',
      'Returns trend chart so spikes are visible the week they happen',
      'Transaction-level detail with status, date and order ID',
    ],
    color: 'amber',
    media: {
      type: 'screenshot',
      src: returnsAdjustmentsImg,
      alt: 'Returns and adjustments dashboard with trend chart and transaction table',
    },
  },
  {
    id: 'payment-reconciliation',
    tag: 'Payment Reconciliation',
    icon: <AccountBookOutlined />,
    title: 'Identify every payment leak before it impacts your profit',
    description:
      'Track expected payments, received settlements, pending amounts and marketplace deductions in one centralized dashboard. Instantly uncover revenue leaks, reimbursement opportunities and settlement mismatches across all connected marketplaces.',
    points: [
      'Monitor Total Expected, Received, Pending Settlement and Net Recoverable amounts in real time',
      'Marketplace-wise leak tracking for Amazon, Flipkart, Meesho and other sales channels',
      'Leak category breakdown including shipping, order, commission and tax-related deductions',
      'Reimbursement tracker to monitor claims raised, approved and received amounts',
      'Detailed transaction-level reconciliation with order-wise settlement visibility',
    ],
    color: 'cyan',
    media: {
      type: 'screenshot',
      src: paymentReconcile,
      alt: 'Payment reconciliation dashboard showing settlements, leaks, recoverable amounts and reimbursement tracking',
    },
  },
  //   {
  //     id: 'sku-profit',
  //     tag: 'Reporting',
  //     icon: <AppstoreOutlined />,
  //     title: 'Compare profit across your whole catalog at a glance',
  //     description:
  //       'Not every SKU deserves the same attention. SKU Wise Profit ranks every product by what it actually contributes after costs, so you know where to double down and what to quietly retire.',
  //     points: [
  //       'Per-SKU margin, units sold and net profit side by side',
  //       'Spot your top and bottom performers without building a pivot table',
  //       'Filter by category, marketplace or date range',
  //     ],
  //     color: 'teal',
  //     media: { type: 'mockup', kind: 'bars' },
  //   },
  //   {
  //     id: 'claims',
  //     tag: 'Reimbursements',
  //     icon: <SafetyCertificateOutlined />,
  //     title: 'Get back the money marketplaces owe you for lost or damaged stock',
  //     description:
  //       'Warehouse loss, damage and incorrect fee charges are recoverable, but only if someone tracks and files for them. Claims surfaces eligible cases automatically and follows them through to payout.',
  //     points: [
  //       'Eligible claims detected automatically from your order data',
  //       'Status tracked from filed to approved to reimbursed',
  //       'Running total of money recovered, by month and by reason',
  //     ],
  //     color: 'rose',
  //     media: { type: 'mockup', kind: 'list' },
  //   },
];

const colorMap = {
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'ring-emerald-100',
    solid: 'bg-emerald-500',
    light: 'bg-emerald-100',
  },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100', solid: 'bg-blue-500', light: 'bg-blue-100' },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'ring-purple-100',
    solid: 'bg-purple-500',
    light: 'bg-purple-100',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    ring: 'ring-amber-100',
    solid: 'bg-amber-500',
    light: 'bg-amber-100',
  },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600', ring: 'ring-teal-100', solid: 'bg-teal-500', light: 'bg-teal-100' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100', solid: 'bg-rose-500', light: 'bg-rose-100' },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    ring: 'ring-indigo-100',
    solid: 'bg-indigo-500',
    light: 'bg-indigo-100',
  },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', ring: 'ring-cyan-100', solid: 'bg-cyan-500', light: 'bg-cyan-100' },
};

function BrowserFrame({ children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
        <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

function MockupBars({ color }) {
  const c = colorMap[color];
  const rows = [
    { label: 'Wireless Earbuds Pro', value: 92 },
    { label: 'Cotton Crew Socks (3-pack)', value: 78 },
    { label: 'Stainless Steel Bottle', value: 64 },
    { label: 'Yoga Mat Premium', value: 41 },
    { label: 'Phone Case Clear', value: 23 },
  ];
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">Profit by SKU</span>
        <span className="text-xs text-gray-400">This month</span>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{r.label}</span>
              <span className="font-semibold text-gray-800">{r.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-full ${c.solid}`} style={{ width: `${r.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupList({ color }) {
  const c = colorMap[color];
  const rows = [
    { id: 'CLM-2291', reason: 'Warehouse damage', status: 'Reimbursed', amount: '₹3,240' },
    { id: 'CLM-2288', reason: 'Lost in transit', status: 'Approved', amount: '₹1,890' },
    { id: 'CLM-2280', reason: 'Incorrect fee charge', status: 'Filed', amount: '₹540' },
  ];
  const statusStyle = {
    Reimbursed: 'bg-emerald-100 text-emerald-700',
    Approved: 'bg-blue-100 text-blue-700',
    Filed: 'bg-gray-100 text-gray-600',
  };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">Claims tracker</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.bg} ${c.text}`}>₹5,670 recovered</span>
      </div>
      <div className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">{r.id}</p>
              <p className="text-xs text-gray-500">{r.reason}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">{r.amount}</p>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[r.status]}`}>
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockupTable({ color }) {
  const c = colorMap[color];
  const rows = [
    { order: '407-6118758', taxable: '₹4,438.28', gst: '₹211.36', tcs: '₹44.38' },
    { order: '407-9102234', taxable: '₹1,129.00', gst: '₹53.75', tcs: '₹11.29' },
    { order: '407-7765512', taxable: '₹6,484.95', gst: '₹308.83', tcs: '₹64.85' },
  ];
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">Tax calculations</span>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.bg} ${c.text}`}>Period: Jun 2026</span>
      </div>
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500">
              <th className="text-left font-semibold px-4 py-2.5">Order</th>
              <th className="text-right font-semibold px-4 py-2.5">Taxable value</th>
              <th className="text-right font-semibold px-4 py-2.5">GST</th>
              <th className="text-right font-semibold px-4 py-2.5">TCS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.order} className="border-t border-gray-100 text-gray-700">
                <td className="px-4 py-2.5">{r.order}</td>
                <td className="px-4 py-2.5 text-right">{r.taxable}</td>
                <td className="px-4 py-2.5 text-right">{r.gst}</td>
                <td className="px-4 py-2.5 text-right">{r.tcs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MockupGauge({ color }) {
  const c = colorMap[color];
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm font-bold text-gray-900">Shipping cost estimate</span>
        <span className="text-xs text-gray-400">Per order avg.</span>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs text-gray-500 mb-1">Estimated</p>
          <p className="text-lg font-bold text-gray-800">₹68.40</p>
        </div>
        <div className={`rounded-xl p-4 ${c.bg}`}>
          <p className={`text-xs mb-1 ${c.text}`}>Actual charged</p>
          <p className={`text-lg font-bold ${c.text}`}>₹81.20</p>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { zone: 'Zone A · 0-500g', pct: 30 },
          { zone: 'Zone B · 500g-1kg', pct: 55 },
          { zone: 'Zone C · 1kg+', pct: 15 },
        ].map((z) => (
          <div key={z.zone} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-32 shrink-0">{z.zone}</span>
            <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
              <div className={`h-full rounded-full ${c.solid}`} style={{ width: `${z.pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-600 w-8 text-right">{z.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureMedia({ feature }) {
  const { media, color } = feature;

  if (media.type === 'screenshot') {
    return (
      <BrowserFrame>
        <img src={media.src} alt={media.alt} className="w-full h-auto block" loading="lazy" />
      </BrowserFrame>
    );
  }

  const mockups = {
    bars: MockupBars,
    list: MockupList,
    table: MockupTable,
    gauge: MockupGauge,
  };
  const MockupComponent = mockups[media.kind];

  return (
    <BrowserFrame>
      <MockupComponent color={color} />
    </BrowserFrame>
  );
}

function FeatureRow({ feature, index }) {
  const isReversed = index % 2 === 1;
  const c = colorMap[feature.color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`grid grid-cols-1 min-lg:grid-cols-2 gap-10 min-lg:gap-16 items-center ${
        isReversed ? 'min-lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      {/* Text content */}
      <div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full ${c.bg} ring-1 ${c.ring}`}>
          <span className={`text-base ${c.text}`}>{feature.icon}</span>
          <span className={`text-xs font-semibold tracking-wide ${c.text}`}>{feature.tag.toUpperCase()}</span>
        </div>

        <h3 className="text-2xl min-md:text-3xl font-bold text-gray-900 mb-4 leading-snug">{feature.title}</h3>

        <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>

        <ul className="space-y-3">
          {feature.points.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${c.solid}`} />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Media */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
      >
        <FeatureMedia feature={feature} />
      </motion.div>
    </motion.div>
  );
}

function FeaturesSection() {
  return (
    <section className="py-16 min-lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 min-lg:px-12">
        <div className="text-center mx-auto mb-16 min-lg:mb-24">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-emerald-50 border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-600 text-sm font-semibold tracking-wide">FEATURES</span>
          </span>
          <h2 className="text-4xl min-md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
            Everything you need to run a profitable marketplace business
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed">
            From the moment you log in, TrackMyProfit pulls your sales, fees, ads and returns into one place, so every
            decision is backed by your real numbers.
          </p>
        </div>

        <div className="space-y-20 min-lg:space-y-32">
          {features.map((feature, index) => (
            <FeatureRow key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
