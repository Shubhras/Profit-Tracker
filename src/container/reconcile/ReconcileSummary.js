import React, { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Spin, Dropdown, Menu } from 'antd';
import {
  DownOutlined,
  WalletOutlined,
  FileTextOutlined,
  BankOutlined,
  WarningOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { DataService } from '../../config/dataService/dataService';

const formatCurrency = (val) => {
  if (val === undefined || val === null || (typeof val === 'number' && Number.isNaN(val))) return '₹0';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) || 0 : val;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export default function ReconcileSummary() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');

  const { dateRange, channel: globalChannel } = useSelector((state) => state.dashboard);
  const profile = useSelector((state) => state.auth?.profile);

  // Dynamic Marketplace options based on connected channels
  const marketplaceOptions = useMemo(() => {
    const connectedChannels = profile?.connected_channels || [];
    const activeChannels = connectedChannels.length > 0 ? connectedChannels : globalChannel || [];

    const options = [{ id: 'all', name: 'All marketplaces', color: null }];
    const addedValues = new Set();

    if (activeChannels.length > 0) {
      activeChannels.forEach((ch) => {
        const lower = String(ch).toLowerCase();
        if (lower.includes('amazon') && !addedValues.has('amazon')) {
          options.push({ id: 'amazon', name: 'Amazon', color: '#FF9900' });
          addedValues.add('amazon');
        } else if (lower.includes('myntra') && !addedValues.has('myntra')) {
          options.push({ id: 'myntra', name: 'Myntra', color: '#FF3F6C' });
          addedValues.add('myntra');
        } else if (lower.includes('flipkart') && !addedValues.has('flipkart')) {
          options.push({ id: 'flipkart', name: 'Flipkart', color: '#2874F0' });
          addedValues.add('flipkart');
        } else if (lower.includes('meesho') && !addedValues.has('meesho')) {
          options.push({ id: 'meesho', name: 'Meesho', color: '#E5399B' });
          addedValues.add('meesho');
        }
      });
    }

    if (options.length === 1) {
      options.push({ id: 'amazon', name: 'Amazon', color: '#FF9900' });
      options.push({ id: 'myntra', name: 'Myntra', color: '#FF3F6C' });
    }

    return options;
  }, [profile, globalChannel]);

  // Fetch summary data from backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const payload = {
      filters: {
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
      },
    };

    DataService.post('/amazon/payment-reconcile/summary/', payload)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.status === true || res.data?.status === 'success') {
          setSummaryData(res.data.summary || null);
        } else {
          setSummaryData(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching reconciliation summary:', err);
        if (isMounted) setSummaryData(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dateRange]);

  const stats = useMemo(() => {
    if (!summaryData) {
      return {
        netSales: 0,
        deductions: 0,
        expectedPayout: 0,
        receivedPayout: 0,
        totalDiscrepancy: 0,
        totalOrders: 0,
        discrepancyOrders: 0,
        discrepancyPercentage: 0,
        marketplaces: [],
      };
    }

    const allMp = summaryData.marketplaces || [];

    if (selectedMarketplace !== 'all') {
      const mpStat = allMp.find((m) => m.id === selectedMarketplace);
      if (mpStat) {
        const exp = mpStat.net_sales - mpStat.deductions;
        const discPct = exp > 0 ? ((mpStat.discrepancy / exp) * 100).toFixed(1) : 0;
        return {
          netSales: mpStat.net_sales || 0,
          deductions: mpStat.deductions || 0,
          expectedPayout: exp || 0,
          receivedPayout: mpStat.received || 0,
          totalDiscrepancy: mpStat.discrepancy || 0,
          totalOrders: mpStat.orders || 0,
          discrepancyOrders: mpStat.flagged || 0,
          discrepancyPercentage: discPct,
          marketplaces: allMp,
        };
      }
    }

    return {
      netSales: summaryData.net_sales || 0,
      deductions: summaryData.deductions || 0,
      expectedPayout: summaryData.expected_payout || 0,
      receivedPayout: summaryData.received_payout || 0,
      totalDiscrepancy: summaryData.total_discrepancy || 0,
      totalOrders: summaryData.total_orders || 0,
      discrepancyOrders: summaryData.discrepancy_orders || 0,
      discrepancyPercentage: summaryData.discrepancy_percentage || 0,
      marketplaces: allMp,
    };
  }, [summaryData, selectedMarketplace]);

  const clean = stats.totalDiscrepancy <= 0;
  const recPct = stats.expectedPayout > 0 ? Math.min((stats.receivedPayout / stats.expectedPayout) * 100, 100) : 100;
  const missPct = Math.max(100 - recPct, 0);

  const selectedMpObj = marketplaceOptions.find((m) => m.id === selectedMarketplace) || marketplaceOptions[0];

  const marketplaceMenu = (
    <Menu selectedKeys={[selectedMarketplace]}>
      {marketplaceOptions.map((opt) => {
        const allMp = summaryData?.marketplaces || [];
        const mpStat = allMp.find((m) => m.id === opt.id);
        const gapVal = opt.id === 'all' ? summaryData?.total_discrepancy || 0 : mpStat ? mpStat.discrepancy : 0;
        return (
          <Menu.Item key={opt.id} onClick={() => setSelectedMarketplace(opt.id)}>
            <div className="flex items-center justify-between gap-6 py-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{
                    background: opt.color || 'linear-gradient(135deg,#FF9900 0%,#2874F0 50%,#E5399B 100%)',
                  }}
                />
                <span className="font-medium text-sm text-gray-800">{opt.name}</span>
              </div>
              {gapVal <= 0 ? (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Settled
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600">{formatCurrency(gapVal)}</span>
              )}
            </div>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-5 mt-4 xl:px-[15px] pb-5 bg-transparent w-full text-gray-800">
      <Spin spinning={loading} size="large">
        <div className="w-full">
          {/* HEADER SECTION */}
          <div className="flex justify-between items-end gap-6 flex-wrap mb-5">
            <div className="min-w-[280px] flex-1">
              <h1 className="text-[20px] md:text-[18px] sm:text-[16px] mb-0 font-semibold text-[#111827] leading-none">
                Payment reconciliation summary
              </h1>
              <p className="text-[13px] text-gray-500 mt-1 max-w-[680px] leading-relaxed">
                We match the fees you expected against the marketplace&apos;s actual transaction report. Anything that
                does not match is a discrepancy.
              </p>
            </div>

            <div className="relative">
              <Dropdown overlay={marketplaceMenu} trigger={['click']}>
                <button
                  type="button"
                  className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl h-[52px] min-w-[214px] px-3.5 py-1.5 flex flex-col items-start justify-center shadow-sm transition text-left relative"
                >
                  <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">MARKETPLACE</span>
                  <div className="flex items-center justify-between w-full mt-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                        style={{
                          background:
                            selectedMpObj.color || 'linear-gradient(135deg,#FF9900 0%,#2874F0 50%,#E5399B 100%)',
                        }}
                      />
                      <span className="text-sm font-semibold text-gray-900">{selectedMpObj.name}</span>
                    </div>
                    <DownOutlined className="text-xs text-gray-400 ml-3" />
                  </div>
                </button>
              </Dropdown>
            </div>
          </div>

          {/* 5-STEP FLOW BAND STEPPER */}
          <div className="flex items-stretch gap-1 bg-white border border-gray-200 rounded-2xl p-3.5 my-5 overflow-x-auto shadow-sm w-full">
            {/* Step 1 */}
            <div className="flex flex-col gap-0.5 p-2 rounded-xl min-w-[140px] flex-1">
              <span className="w-[18px] h-[18px] shrink-0 self-start rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center mb-2">
                1
              </span>
              <span className="text-[14px] font-semibold text-gray-900 whitespace-nowrap">Estimated charges</span>
              <span className="text-[12px] text-gray-400 whitespace-nowrap">{formatCurrency(stats.deductions)}</span>
            </div>

            <div className="flex items-center justify-center px-1 text-gray-300 text-lg font-light flex-shrink-0">
              ›
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-0.5 p-2 rounded-xl min-w-[140px] flex-1">
              <span className="w-[18px] h-[18px] shrink-0 self-start rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center mb-2">
                2
              </span>
              <span className="text-[14px] font-semibold text-gray-900 whitespace-nowrap">
                Actual transaction report
              </span>
              <span className="text-[12px] text-gray-400 whitespace-nowrap">From the marketplace</span>
            </div>

            <div className="flex items-center justify-center px-1 text-gray-300 text-lg font-light flex-shrink-0">
              ›
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-0.5 p-2 rounded-xl min-w-[140px] flex-1">
              <span className="w-[18px] h-[18px] shrink-0 self-start rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center mb-2">
                3
              </span>
              <span className="text-[14px] font-semibold text-gray-900 whitespace-nowrap">Match & compare</span>
              <span className="text-[12px] text-gray-400 whitespace-nowrap">{stats.totalOrders} orders</span>
            </div>

            <div className="flex items-center justify-center px-1 text-gray-300 text-lg font-light flex-shrink-0">
              ›
            </div>

            {/* Step 4 */}
            <div
              className={`flex flex-col gap-0.5 p-2 rounded-xl min-w-[150px] flex-1 ${
                clean ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
              }`}
            >
              <span
                className={`w-[18px] h-[18px] shrink-0 self-start rounded-full text-[10px] font-bold flex items-center justify-center mb-2 ${
                  clean ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                4
              </span>
              <span className="text-[14px] font-semibold whitespace-nowrap">Discrepancy found</span>
              <span className="text-[12px] font-medium whitespace-nowrap">
                {clean ? 'None' : `${formatCurrency(stats.totalDiscrepancy)} · ${stats.discrepancyOrders} orders`}
              </span>
            </div>

            <div className="flex items-center justify-center px-1 text-gray-300 text-lg font-light flex-shrink-0">
              ›
            </div>

            {/* Step 5 */}
            <button
              type="button"
              className="text-left flex flex-col gap-0.5 p-2 rounded-xl min-w-[140px] flex-1 bg-emerald-50 text-emerald-900 cursor-pointer hover:bg-emerald-100/70 transition border-0"
              onClick={() => navigate('/admin/reconcile/fee-leaks')}
            >
              <span className="w-[18px] h-[18px] shrink-0 self-start rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center mb-2">
                5
              </span>
              <span className="text-[14px] font-semibold whitespace-nowrap">Claim or Investigate</span>
              <span className="text-[12px] font-medium whitespace-nowrap">Fee Leaks Dashboard</span>
            </button>
          </div>

          {/* 5 KPI CARDS */}
          <div className="grid grid-cols-5 gap-3 mb-4 lg:grid-cols-3 sm:grid-cols-1 w-full">
            {/* Card 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
                <WalletOutlined className="text-base" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500 min-h-[30px] ">Net Sales (Estimated)</span>
              <span className="text-xl font-bold text-gray-900 tracking-tight mt-1">
                {formatCurrency(stats.netSales)}
              </span>
              <span className="text-[11px] text-gray-400 mt-1">After returns and promos</span>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                <FileTextOutlined className="text-base" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500 min-h-[30px]">Total Deductions (Estimated)</span>
              <span className="text-xl font-bold text-gray-900 tracking-tight mt-1">
                {formatCurrency(stats.deductions)}
              </span>
              <span className="text-[11px] text-gray-400 mt-1">Fees, shipping, GST, TCS</span>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <BankOutlined className="text-base" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500 min-h-[30px]">Actual Payout Received</span>
              <span className="text-xl font-bold text-gray-900 tracking-tight mt-1">
                {formatCurrency(stats.receivedPayout)}
              </span>
              <span className="text-[11px] text-gray-400 mt-1">Expected {formatCurrency(stats.expectedPayout)}</span>
            </div>

            {/* Card 4 */}
            <div
              className={`rounded-2xl p-4 flex flex-col shadow-sm border ${
                !clean ? 'bg-gradient-to-b from-rose-50/90 to-white border-rose-200' : 'bg-white border-gray-200'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                  !clean ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <WarningOutlined className="text-base" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500 min-h-[30px]">Total Discrepancy</span>
              <span
                className={`text-xl font-bold tracking-tight mt-1 ${!clean ? 'text-rose-600' : 'text-emerald-700'}`}
              >
                {formatCurrency(stats.totalDiscrepancy)}
              </span>
              <span className="text-[11px] text-gray-400 mt-1">{stats.discrepancyPercentage}% of expected payout</span>
            </div>

            {/* Card 5 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                <UnorderedListOutlined className="text-base" />
              </div>
              <span className="text-[13px] font-semibold text-gray-500 min-h-[30px]">Discrepancy Orders</span>
              <span className="text-xl font-bold text-gray-900 tracking-tight mt-1">{stats.discrepancyOrders}</span>
              <span className="text-[11px] text-gray-400 mt-1">out of {stats.totalOrders} orders</span>
            </div>
          </div>

          {/* COMPARISON CHART */}
          <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4 w-full">
            <div className="flex justify-between items-baseline gap-4 mb-5">
              <h2 className="text-sm font-semibold text-gray-900">What you should have got vs what you got</h2>
              <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                BOTH BARS ON THE SAME SCALE
              </span>
            </div>

            <div className="grid grid-cols-[190px_1fr] gap-x-5 gap-y-4 items-center sm:grid-cols-1 w-full">
              {/* Row 1: Expected Payout */}
              <div className="flex flex-col text-sm font-semibold text-gray-900">
                Expected Payout
                <em className="not-italic text-[11.5px] font-normal text-gray-400 mt-0.5">
                  What should have reached your bank
                </em>
              </div>
              <div className="h-[52px] flex w-full">
                <div
                  className="bg-blue-600 rounded-xl h-full flex items-center justify-end px-4 transition-all duration-700 ease-out"
                  style={{ width: '100%' }}
                >
                  <b className="text-white text-base font-bold tracking-tight">
                    {formatCurrency(stats.expectedPayout)}
                  </b>
                </div>
              </div>

              {/* Row 2: Received in Bank */}
              <div className="flex flex-col text-sm font-semibold text-gray-900">
                Received in Bank
                <em className="not-italic text-[11.5px] font-normal text-gray-400 mt-0.5">
                  Actually credited this period
                </em>
              </div>
              <div className="h-[52px] flex gap-1 w-full">
                <div
                  className="bg-emerald-600 rounded-xl h-full flex items-center justify-end px-4 transition-all duration-700 ease-out overflow-hidden min-w-[40px]"
                  style={{ width: `${recPct}%` }}
                >
                  <b className="text-white text-base font-bold tracking-tight">
                    {formatCurrency(stats.receivedPayout)}
                  </b>
                </div>
                {!clean && (
                  <div
                    className="bg-rose-500 rounded-xl h-full flex items-center justify-center px-3 transition-all duration-700 ease-out min-w-[50px]"
                    style={{ width: `${missPct}%` }}
                  >
                    <b className="text-white text-sm font-bold tracking-tight">
                      {formatCurrency(stats.totalDiscrepancy)}
                    </b>
                  </div>
                )}
              </div>

              {/* Cut Line & Callout Row */}
              <div className="col-start-2 relative h-9 sm:col-start-1 w-full">
                {!clean ? (
                  <>
                    <div
                      className="absolute -top-[68px] bottom-3 border-l-2 border-dashed border-gray-300 pointer-events-none"
                      style={{ left: `${recPct}%` }}
                    />
                    <div
                      className="absolute top-2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-3 py-1 shadow-sm whitespace-nowrap"
                      style={{ left: `${recPct}%` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                      Discrepancy · {formatCurrency(stats.totalDiscrepancy)} across {stats.discrepancyOrders} orders
                    </div>
                  </>
                ) : (
                  <div className="absolute top-2 left-0 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                    Fully settled — nothing missing
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2 pt-3 border-t border-dashed border-gray-200 text-xs text-gray-500">
              {clean
                ? 'The two bars are the same length. Every rupee you expected reached your bank.'
                : `The red block is the ${formatCurrency(
                    stats.totalDiscrepancy,
                  )} that never arrived. Close it and the bottom bar would reach the dashed line.`}
            </div>
          </section>

          {/* FOOTER NOTE */}
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            This is a summary only. To see it order by order or download the report for a manual claim, open{' '}
            <button
              type="button"
              className="text-emerald-600 font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer"
              onClick={() => navigate('/admin/reconcile/fee-leaks')}
            >
              Payment Reconcile → Fee Leaks
            </button>
            .
          </p>
        </div>
      </Spin>
    </main>
  );
}
