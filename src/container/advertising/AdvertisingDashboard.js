import React, { useEffect, useState } from 'react';
import { Spin, Select, DatePicker } from 'antd';
import {
  WalletOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  PercentageOutlined,
  EyeOutlined,
  AmazonOutlined,
  AimOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { getAdvertisingOverview } from '../../redux/advertising/actionCreator';
import action from '../../redux/dashboard/action';

const { RangePicker } = DatePicker;

const parseDate = (val) => {
  if (!val) return null;
  if (moment.isMoment(val)) return val.isValid() ? val : null;
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) {
      const m = moment(val, 'YYYY-MM-DD', true);
      if (m.isValid()) return m;
    }
    if (/^\d{2}[/-]\d{2}[/-]\d{4}/.test(val)) {
      const m = moment(val, 'DD/MM/YYYY', true);
      if (m.isValid()) return m;
    }
  }
  const fallback = moment(val, 'YYYY-MM-DD', true);
  return fallback.isValid() ? fallback : null;
};

function AdvertisingDashboard() {
  const dispatch = useDispatch();
  const { advertiseOverview, loading } = useSelector((state) => state.advertising);
  const { dateRange: reduxDateRange } = useSelector((state) => state.dashboard);

  // Set default date range to current month
  const [selectedDates, setSelectedDates] = useState(() => {
    if (reduxDateRange?.fromDate && reduxDateRange?.endDate) {
      const start = parseDate(reduxDateRange.fromDate);
      const end = parseDate(reduxDateRange.endDate);
      if (start && end) {
        return [start, end];
      }
    }
    return [moment().startOf('month'), moment().endOf('month')];
  });

  const [marketplace, setMarketplace] = useState('amazon');

  const fetchDashboardData = (dates) => {
    const startDate = dates?.[0] && dates[0].isValid() ? dates[0].format('YYYY-MM-DD') : undefined;
    const endDate = dates?.[1] && dates[1].isValid() ? dates[1].format('YYYY-MM-DD') : undefined;

    if (startDate && endDate) {
      dispatch(
        getAdvertisingOverview({
          start_date: startDate,
          end_date: endDate,
        }),
      );
    }
  };

  // Sync from Redux dateRange if Redux updates externally (e.g. from header calendar)
  useEffect(() => {
    if (reduxDateRange?.fromDate && reduxDateRange?.endDate) {
      const start = parseDate(reduxDateRange.fromDate);
      const end = parseDate(reduxDateRange.endDate);
      if (start && end) {
        const currentStart = selectedDates?.[0]?.format('YYYY-MM-DD');
        const currentEnd = selectedDates?.[1]?.format('YYYY-MM-DD');
        const newStart = start.format('YYYY-MM-DD');
        const newEnd = end.format('YYYY-MM-DD');

        if (currentStart !== newStart || currentEnd !== newEnd) {
          setSelectedDates([start, end]);
          fetchDashboardData([start, end]);
        }
      }
    }
  }, [reduxDateRange?.fromDate, reduxDateRange?.endDate]);

  // Initial fetch on mount if not fetched by useEffect
  useEffect(() => {
    if (selectedDates?.[0] && selectedDates?.[1]) {
      fetchDashboardData(selectedDates);
    }
  }, []);

  const handleApplyFilter = () => {
    if (selectedDates?.[0] && selectedDates?.[1]) {
      const startDate = selectedDates[0].format('YYYY-MM-DD');
      const endDate = selectedDates[1].format('YYYY-MM-DD');

      dispatch(
        action.setDateRange({
          fromDate: startDate,
          endDate,
        }),
      );

      fetchDashboardData(selectedDates);
    }
  };

  const dashboardData = advertiseOverview?.data || {};
  const summary = dashboardData.summary_cards || {};
  const topCampaigns = dashboardData.top_campaigns || [];
  const topProducts = dashboardData.top_products || [];

  // Helper to format currency
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹ 0';
    return `₹ ${Number(val).toLocaleString('en-IN')}`;
  };

  // Helper to format numbers
  const formatNumber = (val) => {
    if (val === undefined || val === null) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  // Helper for comparison text
  const getPrevDateText = () => {
    if (
      selectedDates &&
      selectedDates[0] &&
      selectedDates[1] &&
      selectedDates[0].isValid() &&
      selectedDates[1].isValid()
    ) {
      const days = selectedDates[1].diff(selectedDates[0], 'day') + 1;
      const prevEnd = selectedDates[0].clone().subtract(1, 'day');
      const prevStart = prevEnd.clone().subtract(days - 1, 'day');
      return `vs ${prevStart.format('DD/MM')} - ${prevEnd.format('DD/MM')}`;
    }
    return 'vs previous period';
  };

  const prevText = getPrevDateText();

  // Color dots for campaign list
  const campaignColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6">
      <Spin spinning={loading}>
        {/* Title */}
        <h1 className="text-2xl font-bold text-[#111827] mb-4">Advertising dashboard</h1>

        {/* Filters Box */}
        <div className="mb-6 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            {/* Marketplace Select */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Marketplace</label>
              <Select
                value={marketplace}
                onChange={(val) => setMarketplace(val)}
                className="w-52 h-10 border-gray-300 rounded-lg text-sm"
                dropdownMatchSelectWidth={false}
              >
                <Select.Option value="amazon">
                  <div className="flex items-center gap-2 font-medium">
                    <AmazonOutlined className="text-base text-[#ff9900]" />
                    <span>Amazon</span>
                  </div>
                </Select.Option>
              </Select>
            </div>

            {/* Date Range Picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date Range</label>
              <RangePicker
                value={selectedDates}
                onChange={(dates) => {
                  setSelectedDates(dates);
                  if (dates?.[0] && dates?.[1] && dates[0].isValid() && dates[1].isValid()) {
                    const startDate = dates[0].format('YYYY-MM-DD');
                    const endDate = dates[1].format('YYYY-MM-DD');

                    dispatch(
                      action.setDateRange({
                        fromDate: startDate,
                        endDate,
                      }),
                    );

                    fetchDashboardData(dates);
                  }
                }}
                format="DD/MM/YYYY"
                className="h-10 border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Apply Filter Button */}
            <div className="flex items-end self-end">
              <button
                type="button"
                onClick={handleApplyFilter}
                className="h-10 px-5 rounded-lg border border-[#0d9488] text-[#0d9488] font-semibold text-xs hover:bg-[#ccfbf1] transition-all duration-150"
              >
                Apply Filter
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">Choose marketplace to view advertising performance</p>
        </div>

        {/* KPI Metrics Cards (Grid of 6) */}
        <div className="grid grid-cols-6 lg:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-4 mb-6">
          {/* 1. Ad Spend */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10b981] text-white">
                <WalletOutlined className="text-lg" />
              </div>
              <span className="text-[13px] font-semibold text-gray-600">Ad Spend</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">{formatCurrency(summary.ad_spend?.value)}</h2>
              <p
                className={`mt-1 text-[11px] font-medium ${
                  (summary.ad_spend?.change?.pct ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {summary.ad_spend?.change?.formatted || '0%'} {prevText}
              </p>
            </div>
          </div>

          {/* 2. Ad Sales */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3b82f6] text-white">
                <ShoppingCartOutlined className="text-lg" />
              </div>
              <span className="text-[13px] font-semibold text-gray-600">Ad Sales</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">{formatCurrency(summary.sales_from_ads?.value)}</h2>
              <p
                className={`mt-1 text-[11px] font-medium ${
                  (summary.sales_from_ads?.change?.pct ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {summary.sales_from_ads?.change?.formatted || '0%'} {prevText}
              </p>
            </div>
          </div>

          {/* 3. ROI */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b5cf6] text-white">
                <RiseOutlined className="text-lg" />
              </div>
              <span className="text-[13px] font-semibold text-gray-600">ROI</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">{summary.roas?.value ?? 0}</h2>
              <p
                className={`mt-1 text-[11px] font-medium ${
                  (summary.roas?.change?.pct ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {summary.roas?.change?.formatted || '0%'} {prevText}
              </p>
            </div>
          </div>

          {/* 4. ACOS */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f97316] text-white">
                <PercentageOutlined className="text-lg" />
              </div>
              <span className="text-[13px] font-semibold text-gray-600">ACOS</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">{summary.acos?.value ?? 0}%</h2>
              <p
                className={`mt-1 text-[11px] font-medium ${
                  (summary.acos?.change?.pct ?? 0) <= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {summary.acos?.change?.formatted || '0%'} {prevText}
              </p>
            </div>
          </div>

          {/* 5. Clicks */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#06b6d4] text-white">
                <AimOutlined className="text-lg" />
              </div>
              <span className="text-[13px] font-semibold text-gray-600">Clicks</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">{formatNumber(summary.clicks?.value)}</h2>
              <p
                className={`mt-1 text-[11px] font-medium ${
                  (summary.clicks?.change?.pct ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {summary.clicks?.change?.formatted || '0%'} {prevText}
              </p>
            </div>
          </div>

          {/* 6. Impressions */}
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ec4899] text-white">
                <EyeOutlined className="text-lg" />
              </div>
              <span className="text-[13px] font-semibold text-gray-600">Impressions</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#111827]">{formatNumber(summary.impressions?.value)}</h2>
              <p
                className={`mt-1 text-[11px] font-medium ${
                  (summary.impressions?.change?.pct ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {summary.impressions?.change?.formatted || '0%'} {prevText}
              </p>
            </div>
          </div>
        </div>

        {/* Side-by-Side Tables */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          {/* Top Performing Campaigns */}
          <div className="col-span-6 xl:col-span-12 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#111827]">Top Performing Campaigns</h2>
              <Link to="/admin/advertising/campaigns" className="text-xs font-semibold text-[#0d9488] hover:underline">
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-semibold">
                    <th className="pb-3 pr-2">Campaign Name</th>
                    <th className="pb-3 px-2">Ad Spend</th>
                    <th className="pb-3 px-2">Ad Sales</th>
                    <th className="pb-3 px-2">ROI</th>
                    <th className="pb-3 pl-2">ACOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {topCampaigns.length > 0 ? (
                    topCampaigns.map((item, idx) => (
                      <tr key={item.campaign_id || idx} className="hover:bg-gray-50/50">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: campaignColors[idx % campaignColors.length] }}
                            />
                            <span className="truncate max-w-[150px] font-semibold text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">{formatCurrency(item.spend)}</td>
                        <td className="py-3.5 px-2">{formatCurrency(item.sales)}</td>
                        <td className="py-3.5 px-2">{item.roas ?? item.roi ?? 0}</td>
                        <td
                          className={`py-3.5 pl-2 font-semibold ${
                            (item.acos ?? 0) <= 20 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {item.acos ?? 0}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">
                        No campaign data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Performing Products */}
          <div className="col-span-6 xl:col-span-12 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#111827]">Top Performing Products</h2>
              <Link to="/admin/advertising/AdProducts" className="text-xs font-semibold text-[#0d9488] hover:underline">
                View all
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-semibold">
                    <th className="pb-3 pr-2">Product Name</th>
                    <th className="pb-3 px-2">Ad Spend</th>
                    <th className="pb-3 px-2">Ad Sales</th>
                    <th className="pb-3 px-2">ROI</th>
                    <th className="pb-3 pl-2">ACOS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {topProducts.length > 0 ? (
                    topProducts.map((item, idx) => (
                      <tr key={item.asin || item.sku || idx} className="hover:bg-gray-50/50">
                        <td className="py-3.5 pr-2">
                          <div className="flex items-center gap-2.5">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.product_name}
                                className="h-8 w-8 object-contain rounded border border-gray-200 bg-white"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                SKU
                              </div>
                            )}
                            <span className="truncate max-w-[150px] font-semibold text-gray-900">
                              {item.product_name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2">{formatCurrency(item.spend)}</td>
                        <td className="py-3.5 px-2">{formatCurrency(item.sales)}</td>
                        <td className="py-3.5 px-2">{item.roi ?? 0}</td>
                        <td
                          className={`py-3.5 pl-2 font-semibold ${
                            (item.acos ?? 0) <= 20 ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {item.acos ?? 0}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">
                        No product data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-center text-xs text-gray-400">
          All values are approximate and based on selected date range.
        </p>
      </Spin>
    </div>
  );
}

export default AdvertisingDashboard;
