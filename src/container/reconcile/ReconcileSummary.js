import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Spin, Row, Col } from 'antd';
import {
  WalletOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  BulbOutlined,
  ArrowRightOutlined,
  InfoCircleFilled,
} from '@ant-design/icons';
import { getReconcilePaymentSummary } from '../../redux/reconcilePayment/actionCreator';

const formatCurrency = (val) => {
  if (val === undefined || val === null || (typeof val === 'number' && Number.isNaN(val))) return '₹0.00';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) || 0 : val;
  const isNegative = num < 0;
  const absFormatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));
  return isNegative ? `-₹${absFormatted}` : `₹${absFormatted}`;
};

export default function ReconcileSummary() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedMarketplace] = useState('all');

  const { dateRange, channel: globalChannel } = useSelector((state) => state.dashboard);
  const { loading, reconcileData } = useSelector((state) => state.reconcilePayment);

  const summaryData = useMemo(() => {
    if (!reconcileData) return null;
    return reconcileData.summary || reconcileData.data?.summary || reconcileData.data || reconcileData;
  }, [reconcileData]);

  // Fetch summary data from backend via redux actionCreator
  useEffect(() => {
    const payload = {
      filters: {
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || dateRange?.toDate || null,
        endDate: dateRange?.endDate || dateRange?.toDate || null,
        ...(globalChannel && globalChannel.length > 0 ? { channel: { IN: globalChannel } } : {}),
      },
    };
    dispatch(getReconcilePaymentSummary(payload));
  }, [dispatch, dateRange, globalChannel]);

  const stats = useMemo(() => {
    if (!summaryData) {
      return {
        expectedSettlement: 62043,
        expectedSettlementChange: '12.5% vs previous period',
        bankSettled: -3499,
        bankSettledChange: '8.2% vs previous period',
        settlementHold: 99,
        settlementHoldChange: '32.4% vs previous period',
        expectedPayoutChart: 65542,
        bankSettledChart: 58791,
        shortage: 58791,
        marketplaces: [],
      };
    }

    const allMp = summaryData.marketplaces || [];
    let mpStat = null;
    if (selectedMarketplace !== 'all') {
      mpStat = allMp.find((m) => m.id === selectedMarketplace);
    }

    const expected = mpStat
      ? mpStat.expected_settlement ??
        mpStat.expected_payout ??
        (mpStat.net_sales ? mpStat.net_sales - (mpStat.deductions || 0) : undefined)
      : summaryData.expected_settlement ??
        summaryData.expected_payout ??
        summaryData.exp_settlement ??
        summaryData.total_expected_settlement ??
        (summaryData.net_sales ? summaryData.net_sales - (summaryData.deductions || 0) : 62043);

    const settled = mpStat
      ? mpStat.bank_settled ?? mpStat.received_payout ?? mpStat.received
      : summaryData.bank_settled ??
        summaryData.received_payout ??
        summaryData.settlement_paid_in_bank ??
        summaryData.total_settlement_paid_in_bank ??
        -3499;

    const hold = mpStat
      ? mpStat.settlement_hold ??
        mpStat.settlement_on_hold ??
        mpStat.total_unsettled_not_paid ??
        mpStat.unsettled_not_paid ??
        mpStat.discrepancy
      : summaryData.settlement_on_hold ??
        summaryData.settlement_hold ??
        summaryData.settlement_on_hold_leaks ??
        summaryData.total_unsettled_not_paid ??
        summaryData.unsettled_not_paid ??
        summaryData.total_discrepancy ??
        99;

    const expChart = mpStat
      ? mpStat.expected_settlement ?? mpStat.expected_payout ?? expected
      : summaryData.expected_settlement_chart ??
        summaryData.expected_payout_chart ??
        summaryData.expected_settlement ??
        summaryData.expected_payout ??
        expected ??
        65542;
    const settledChart = mpStat
      ? mpStat.bank_settled ?? mpStat.received_payout ?? mpStat.received
      : summaryData.bank_settled_chart ?? summaryData.received_payout ?? summaryData.settlement_paid_in_bank ?? 58791;
    const shortVal = mpStat
      ? Math.abs((expChart || 0) - (settledChart || 0))
      : summaryData.shortage ??
        summaryData.total_unsettled_not_paid ??
        summaryData.unsettled_not_paid ??
        summaryData.total_discrepancy ??
        Math.abs((expChart || 0) - (settledChart || 0)) ??
        58791;

    return {
      expectedSettlement: expected ?? 62043,
      expectedSettlementChange: summaryData.expected_settlement_change || '12.5% vs previous period',
      bankSettled: settled ?? -3499,
      bankSettledChange: summaryData.bank_settled_change || '8.2% vs previous period',
      settlementHold: hold ?? 99,
      settlementHoldChange: summaryData.settlement_hold_change || '32.4% vs previous period',
      expectedPayoutChart: expChart ?? 65542,
      bankSettledChart: settledChart ?? 58791,
      shortage: shortVal ?? 58791,
      marketplaces: allMp,
    };
  }, [summaryData, selectedMarketplace]);

  // Calculate Bar widths dynamically for chart
  const maxVal = Math.max(stats.expectedPayoutChart, stats.bankSettledChart, 1);
  const expBarWidth = Math.min(100, Math.max(10, (stats.expectedPayoutChart / maxVal) * 100));
  const settledBarWidth = Math.min(100, Math.max(10, (stats.bankSettledChart / maxVal) * 100));

  return (
    <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-5 py-4 xl:px-[15px] pb-6 bg-[#f8fafc] w-full text-gray-800">
      <Spin spinning={loading} size="large">
        <div className="w-full mx-auto">
          {/* HEADER SECTION */}
          <div className="flex justify-between items-start gap-4 flex-wrap mb-5">
            <div>
              <h1 className="text-[22px] font-semibold text-[#111827] mb-0 tracking-tight">
                Payment Reconciliation Summary
              </h1>
              <p className="text-[13px] text-[#6b7280] max-w-[700px] leading-relaxed">
                We match the fees you expected against the marketplace&apos;s actual transaction report. Anything that
                does not match is a discrepancy.
              </p>
            </div>
          </div>

          {/* 4-STEP STEPPER */}
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-3 mb-3 shadow-sm overflow-x-auto gap-2">
            {/* Step 1 */}
            <div className="flex items-center gap-2.5 min-w-max">
              <span className="w-6 h-6 rounded-full bg-[#10b981] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-[14px] font-semibold text-[#111827]">Expected Settlement</span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2.5 min-w-max">
              <span className="w-6 h-6 rounded-full bg-[#3b82f6] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-[14px] font-semibold text-[#111827]">Actual Transaction Report</span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-2.5 min-w-max">
              <span className="w-6 h-6 rounded-full bg-[#8b5cf6] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[14px] font-semibold text-[#111827]">Wait for marketplace payment cycle</span>
                <span className="text-[11px] text-gray-400 font-medium mt-0.5">After cycle, go to next step</span>
              </div>
            </div>

            {/* <span className="text-dark text-lg font-light shrink-0 px-2">&gt;</span> */}

            {/* Step 4 */}
            <div className="flex items-center gap-2.5 min-w-max bg-transparent border-0 p-0 text-left">
              <span className="w-6 h-6 rounded-full bg-[#f43f5e] text-white text-[13px] font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <span className="text-[14px] font-semibold text-[#111827] transition">Claim or Investigate</span>
            </div>
          </div>

          {/* 3 TOP KPI CARDS */}
          <Row gutter={[20, 20]} className="mb-3">
            {/* Card 1: Expected Settlement */}
            <Col xs={24} md={8}>
              <div className="bg-[#f0fdf4]/60 border-4 border-white rounded-2xl p-4 shadow-md hover:shadow-sm transition-shadow duration-200 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#dcfce7] text-[#10b981] flex items-center justify-center shrink-0">
                      <WalletOutlined className="text-[18px]" />
                    </div>
                    <div className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white/80">
                      <InfoCircleFilled className="text-[16px] text-gray-400" />
                    </div>
                  </div>
                  <div className="text-[13px] font-medium text-gray-700">Expected Settlement</div>
                  <div className="text-[26px] font-bold text-[#111827] mt-1 tracking-tight">
                    {formatCurrency(stats.expectedSettlement)}
                  </div>
                </div>
                <div className="text-[13px] font-semibold text-[#10b981] flex items-center gap-1 mt-3">
                  <span>↑</span>
                  <span>{stats.expectedSettlementChange}</span>
                </div>
              </div>
            </Col>

            {/* Card 2: Bank Settled */}
            <Col xs={24} md={8}>
              <div className="bg-[#fff7ed]/60 border-4 border-white rounded-2xl p-4 shadow-md hover:shadow-sm transition-shadow duration-200 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ffedd5] text-[#f97316] flex items-center justify-center shrink-0">
                      <CreditCardOutlined className="text-[18px]" />
                    </div>
                    <div className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white/80">
                      <InfoCircleFilled className="text-[16px] text-gray-400" />
                    </div>
                  </div>
                  <div className="text-[13px] font-medium text-gray-700">Bank Settled</div>
                  <div className="text-[26px] font-bold text-[#111827] mt-1 tracking-tight">
                    {formatCurrency(stats.bankSettled)}
                  </div>
                </div>
                <div className="text-[13px] font-semibold text-[#ef4444] flex items-center gap-1 mt-3">
                  <span>↑</span>
                  <span>{stats.bankSettledChange}</span>
                </div>
              </div>
            </Col>

            {/* Card 3: Settlement on Hold/Leaks */}
            <Col xs={24} md={8}>
              <div className="bg-[#eff6ff]/60 border-4 border-white rounded-2xl p-4 shadow-md hover:shadow-sm transition-shadow duration-200 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#dbeafe] text-[#2563eb] flex items-center justify-center shrink-0">
                      <FileTextOutlined className="text-[18px]" />
                    </div>
                    <div className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white/80">
                      <InfoCircleFilled className="text-[16px] text-gray-400" />
                    </div>
                  </div>
                  <div className="text-[13px] font-medium text-gray-700">Settlement on Hold/Leaks</div>
                  <div className="text-[26px] font-bold text-[#111827] mt-1 tracking-tight">
                    {formatCurrency(stats.settlementHold)}
                  </div>
                  <div className="text-[13px] font-semibold text-[#10b981] flex items-center gap-1 mt-1">
                    <span>↑</span>
                    <span>{stats.settlementHoldChange}</span>
                  </div>
                </div>

                {/* Inner Info Box */}
                {/* <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-3 mt-3 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    i
                  </div>
                  <p className="text-[12px] text-[#1e40af] m-0 leading-snug">
                    Check this according to marketplace payment cycle If it is under marketplace payment cycle, then it
                    is currently on hold and after cycle you can investigate this leak.
                  </p>
                </div> */}
              </div>
            </Col>
          </Row>

          {/* EXPECTED SETTLEMENT VS BANK SETTLED CHART CARD */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-5">
            <div className="flex justify-between items-baseline gap-4 mb-6 flex-wrap">
              <h2 className="text-[16px] font-semibold text-[#111827] m-0">Expected Settlement vs Bank Settled</h2>
              <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                BOTH BARS ON THE SAME SCALE
              </span>
            </div>

            {/* Horizontal Bar Chart Rows */}
            <div className="space-y-4 mb-6">
              {/* Row 1: Expected Settlement */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4 sm:grid-cols-1">
                <span className="text-[14px] font-semibold text-[#111827]">Expected Settlement</span>
                <div className="w-full bg-gray-50 rounded-xl overflow-hidden p-1">
                  <div
                    className="bg-[#2563eb] h-[35px] rounded-lg flex items-center justify-end px-4 transition-all duration-500 min-w-[90px]"
                    style={{ width: `${expBarWidth}%` }}
                  >
                    <span className="text-white font-bold text-[14px]">
                      {formatCurrency(stats.expectedPayoutChart)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Bank Settled */}
              <div className="grid grid-cols-[160px_1fr] items-center gap-4 sm:grid-cols-1">
                <span className="text-[14px] font-semibold text-[#111827]">Bank Settled</span>
                <div className="w-full bg-gray-50 rounded-xl overflow-hidden p-1">
                  <div
                    className="bg-[#f43f5e] h-[35px] rounded-lg flex items-center justify-end px-4 transition-all duration-500 min-w-[90px]"
                    style={{ width: `${settledBarWidth}%` }}
                  >
                    <span className="text-white font-bold text-[14px]">{formatCurrency(stats.bankSettledChart)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Callout Banner */}
            <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#dcfce7] text-[#10b981] flex items-center justify-center shrink-0">
                  <BulbOutlined className="text-[16px]" />
                </div>
                <span className="text-[13px] font-medium text-[#111827]">
                  You are short by <strong>{formatCurrency(stats.shortage)}</strong> compared to expected settlement.
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate('/admin/reconcile/allLeaks')}
                className="bg-white border border-[#10b981] text-[#10b981] hover:bg-[#ecfdf5] font-semibold text-[13px] px-4 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>View Discrepancy Orders</span>
                <ArrowRightOutlined className="text-[11px]" />
              </button>
            </div>
          </div>
        </div>
      </Spin>
    </main>
  );
}
