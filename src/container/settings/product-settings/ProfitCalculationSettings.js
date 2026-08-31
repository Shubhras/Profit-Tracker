import React, { useEffect, useState, useMemo } from 'react';
import { Button, InputNumber, Select, message, Spin, Tooltip } from 'antd';
import {
  InfoCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  CheckOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  DollarOutlined,
  PercentageOutlined,
  ShoppingOutlined,
  NotificationOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { DataService } from '../../../config/dataService/dataService';

const { Option } = Select;

const DEFAULT_SETTINGS = {
  tcs: true,
  tds: true,
  gst_treatment: 'adjusted', // 'adjusted' or 'inclusive'
  input_gst_itc: true,
  output_gst: true,
  claim: true,
  product_cost: true,
  ad_spend: true,
  other_expense: true,
};

export default function ProfitCalculationSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Preview Simulator State
  const [previewNetSales, setPreviewNetSales] = useState(1000);
  const [previewOutputGstRate, setPreviewOutputGstRate] = useState(5);
  const [previewInputGstRate, setPreviewInputGstRate] = useState(18);
  const [previewProductCost, setPreviewProductCost] = useState(100);
  const [previewOtherExpense, setPreviewOtherExpense] = useState(25);
  const [previewAdSpend] = useState(50);
  const [activeTab, setActiveTab] = useState('Full'); // 'Full', 'Taxes', 'Costs'

  // Fetch initial settings from backend
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await DataService.get('/amazon/profit-calculation-settings/');
      if (response.data && response.data.settings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...response.data.settings,
        });
      }
    } catch (err) {
      // Ignore error silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save settings to backend
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await DataService.post('/amazon/profit-calculation-settings/', settings);
      if (response.data && response.data.status) {
        message.success('Profit Calculation Settings saved successfully!');
        if (response.data.settings) {
          setSettings(response.data.settings);
        }
      } else {
        message.error('Failed to save settings.');
      }
    } catch (err) {
      message.error('Failed to save Profit Calculation Settings.');
    } finally {
      setSaving(false);
    }
  };

  // Reset settings to default
  const handleResetDefault = () => {
    setSettings(DEFAULT_SETTINGS);
    message.info('Reset settings to platform defaults.');
  };

  // Toggle individual setting
  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Live Preview Math Calculations
  const calculatedPreview = useMemo(() => {
    const grossSales = Number(previewNetSales) || 0;
    const outGstPercent = Number(previewOutputGstRate) || 0;
    const inGstPercent = Number(previewInputGstRate) || 0;
    const pCost = Number(previewProductCost) || 0;
    const oExp = Number(previewOtherExpense) || 0;
    const aSpend = Number(previewAdSpend) || 0;

    // Fixed estimated MP Commission & Shipping (e.g. 15%)
    const mpFeeEstimate = grossSales * 0.15;
    const mpShippingEstimate = 65; // fixed estimated shipping

    // Output GST
    const outputGstAmount = (grossSales * outGstPercent) / 100;
    // TCS (1% of net sales)
    const tcsAmount = grossSales * 0.01;
    // TDS (1% of net sales)
    const tdsAmount = grossSales * 0.01;
    // Input GST / ITC (18% credit on MP fees)
    const inputGstAmount = (mpFeeEstimate * inGstPercent) / 100;
    // Claim reimbursement estimate
    const claimAmount = 30;

    let netSalesCalculated = grossSales;
    if (settings.gst_treatment === 'adjusted') {
      netSalesCalculated = grossSales - (settings.output_gst ? outputGstAmount : 0);
    }

    let deductions = mpFeeEstimate + mpShippingEstimate;

    if (settings.tcs) deductions += tcsAmount;
    if (settings.tds) deductions += tdsAmount;
    if (settings.input_gst_itc) deductions -= inputGstAmount; // Credit reduces deduction
    if (settings.claim) deductions -= claimAmount; // Claim adds back revenue / reduces deduction

    let costs = 0;
    if (settings.product_cost) costs += pCost;
    if (settings.other_expense) costs += oExp;
    if (settings.ad_spend) costs += aSpend;

    const netProfit = netSalesCalculated - deductions - costs;
    const profitMargin = grossSales > 0 ? (netProfit / grossSales) * 100 : 0;

    return {
      outputGstAmount,
      tcsAmount,
      tdsAmount,
      inputGstAmount,
      claimAmount,
      netSalesCalculated,
      deductions,
      costs,
      netProfit,
      profitMargin,
    };
  }, [
    previewNetSales,
    previewOutputGstRate,
    previewInputGstRate,
    previewProductCost,
    previewOtherExpense,
    previewAdSpend,
    settings,
  ]);

  const PageRoutes = [
    { path: '', breadcrumbName: 'Settings' },
    { path: '', breadcrumbName: 'Product Setting' },
    { path: '', breadcrumbName: 'Profit Calculation Settings' },
  ];

  return (
    <>
      {/* PAGE HEADER */}
      <div className="px-6 xl:px-[15px] pt-3 pb-4">
        <PageHeader routes={PageRoutes} title="Profit Calculation Settings" className="p-0 bg-transparent" />
        <div className="flex items-center justify-between mt-1 sm:flex-col sm:items-start sm:gap-3">
          <p className="text-[13px] text-[#6B7280] m-0">
            Choose which components to include in your profit calculation.
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleResetDefault}
              icon={<ReloadOutlined />}
              className="h-[38px] px-4 rounded-[6px] text-[13px] font-medium border-[#D1D5DB] text-[#374151] hover:text-[#111827]"
            >
              Reset to Default
            </Button>
            <Button
              type="primary"
              onClick={handleSaveSettings}
              loading={saving}
              icon={<SaveOutlined />}
              className="h-[38px] px-5 rounded-[6px] text-[13px] font-medium bg-[#10B981] hover:bg-[#059669] border-none text-white shadow-sm"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      <main className="px-6 xl:px-[15px] pb-[40px]">
        <Spin spinning={loading}>
          <div className="grid grid-cols-12 gap-6">
            {/* LEFT MAIN PANEL: SETTINGS CARDS */}
            <div className="col-span-8 lg:col-span-12 space-y-6">
              {/* SECTION 1: TAXES & DEDUCTIONS */}
              <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-[16px] font-semibold text-[#111827] m-0 flex items-center gap-2">
                    1. Taxes & Deductions
                  </h3>
                  <p className="text-[12px] text-[#6B7280] mt-1 m-0">
                    Select the taxes and deductions you want to include in profit calculation.
                  </p>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
                  {/* CARD: TCS */}
                  <button
                    type="button"
                    onClick={() => toggleSetting('tcs')}
                    className={`text-left w-full relative p-4 rounded-[10px] border-2 cursor-pointer transition-all duration-200 bg-white ${
                      settings.tcs
                        ? 'border-[#3B82F6] shadow-[0_4px_12px_rgba(59,130,246,0.12)]'
                        : 'border-[#E5E7EB] opacity-75 hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center font-bold text-[14px]">
                        ≡
                      </div>
                      <Tooltip title="Tax Collected at Source deducted by marketplace">
                        <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                      </Tooltip>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[14px] font-semibold text-[#111827] m-0 flex items-center justify-between">
                        TCS
                        {settings.tcs && <CheckOutlined className="text-[#2563EB] text-[12px]" />}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] mt-1 m-0">Tax Collected at Source</p>
                    </div>
                  </button>

                  {/* CARD: TDS */}
                  <button
                    type="button"
                    onClick={() => toggleSetting('tds')}
                    className={`text-left w-full relative p-4 rounded-[10px] border-2 cursor-pointer transition-all duration-200 bg-white ${
                      settings.tds
                        ? 'border-[#F59E0B] shadow-[0_4px_12px_rgba(245,158,11,0.12)]'
                        : 'border-[#E5E7EB] opacity-75 hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-[15px]">
                        <DollarOutlined />
                      </div>
                      <Tooltip title="Tax Deducted at Source on sale proceeds">
                        <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                      </Tooltip>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[14px] font-semibold text-[#111827] m-0 flex items-center justify-between">
                        TDS
                        {settings.tds && <CheckOutlined className="text-[#D97706] text-[12px]" />}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] mt-1 m-0">Tax Deducted at Source</p>
                    </div>
                  </button>

                  {/* CARD: GST TREATMENT */}
                  <div className="relative p-4 rounded-[10px] border-2 border-[#10B981] bg-white shadow-[0_4px_12px_rgba(16,185,129,0.1)]">
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] text-[#059669] flex items-center justify-center text-[15px]">
                        <PercentageOutlined />
                      </div>
                      <Tooltip title="Choose whether GST is adjusted out or included in revenue">
                        <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                      </Tooltip>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-[14px] font-semibold text-[#111827] m-0">GST Treatment</h4>
                      <p className="text-[11px] text-[#6B7280] mt-0.5 mb-2">
                        Choose how GST should be considered in profit.
                      </p>

                      <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#F3F4F6] rounded-lg">
                        <button
                          type="button"
                          onClick={() => setSettings((prev) => ({ ...prev, gst_treatment: 'adjusted' }))}
                          className={`py-1 text-[11px] font-semibold rounded-md transition-all ${
                            settings.gst_treatment === 'adjusted'
                              ? 'bg-[#10B981] text-white shadow-sm'
                              : 'text-[#4B5563] hover:text-[#111827]'
                          }`}
                        >
                          GST Adjusted
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettings((prev) => ({ ...prev, gst_treatment: 'inclusive' }))}
                          className={`py-1 text-[11px] font-semibold rounded-md transition-all ${
                            settings.gst_treatment === 'inclusive'
                              ? 'bg-[#10B981] text-white shadow-sm'
                              : 'text-[#4B5563] hover:text-[#111827]'
                          }`}
                        >
                          GST Inclusive
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CARD: INPUT GST / ITC */}
                  <button
                    type="button"
                    onClick={() => toggleSetting('input_gst_itc')}
                    className={`text-left w-full relative p-4 rounded-[10px] border-2 cursor-pointer transition-all duration-200 bg-white ${
                      settings.input_gst_itc
                        ? 'border-[#14B8A6] shadow-[0_4px_12px_rgba(20,184,166,0.12)]'
                        : 'border-[#E5E7EB] opacity-75 hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center text-[14px]">
                        <ArrowUpOutlined />
                      </div>
                      <Tooltip title="Input Tax Credit claimed on marketplace services">
                        <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                      </Tooltip>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[14px] font-semibold text-[#111827] m-0 flex items-center justify-between">
                        Input GST / ITC
                        {settings.input_gst_itc && <CheckOutlined className="text-[#0D9488] text-[12px]" />}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] mt-1 m-0">
                        Eligible GST on marketplace fees and services
                      </p>
                    </div>
                  </button>

                  {/* CARD: OUTPUT GST */}
                  <button
                    type="button"
                    onClick={() => toggleSetting('output_gst')}
                    className={`text-left w-full relative p-4 rounded-[10px] border-2 cursor-pointer transition-all duration-200 bg-white ${
                      settings.output_gst
                        ? 'border-[#F43F5E] shadow-[0_4px_12px_rgba(244,63,94,0.12)]'
                        : 'border-[#E5E7EB] opacity-75 hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center text-[14px]">
                        <ArrowDownOutlined />
                      </div>
                      <Tooltip title="GST collected from buyer on sale price">
                        <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                      </Tooltip>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[14px] font-semibold text-[#111827] m-0 flex items-center justify-between">
                        Output GST
                        {settings.output_gst && <CheckOutlined className="text-[#E11D48] text-[12px]" />}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] mt-1 m-0">GST collected on sales</p>
                    </div>
                  </button>

                  {/* CARD: CLAIM */}
                  <button
                    type="button"
                    onClick={() => toggleSetting('claim')}
                    className={`text-left w-full relative p-4 rounded-[10px] border-2 cursor-pointer transition-all duration-200 bg-white ${
                      settings.claim
                        ? 'border-[#0EA5E9] shadow-[0_4px_12px_rgba(14,165,233,0.12)]'
                        : 'border-[#E5E7EB] opacity-75 hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center text-[14px]">
                        <FileTextOutlined />
                      </div>
                      <Tooltip title="Reimbursements recovered from marketplace for lost/damaged inventory">
                        <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                      </Tooltip>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[14px] font-semibold text-[#111827] m-0 flex items-center justify-between">
                        Claim
                        {settings.claim && <CheckOutlined className="text-[#0284C7] text-[12px]" />}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] mt-1 m-0">Reimbursements recovered from marketplace</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 2: COSTS */}
              <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-[16px] font-semibold text-[#111827] m-0 flex items-center gap-2">2. Costs</h3>
                  <p className="text-[12px] text-[#6B7280] mt-1 m-0">
                    Select the cost components you want to include in profit calculation.
                  </p>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
                  {/* CARD: PRODUCT COST */}
                  <button
                    type="button"
                    onClick={() => toggleSetting('product_cost')}
                    className={`text-left w-full relative p-4 rounded-[10px] border-2 cursor-pointer transition-all duration-200 bg-white ${
                      settings.product_cost
                        ? 'border-[#F59E0B] shadow-[0_4px_12px_rgba(245,158,11,0.12)]'
                        : 'border-[#E5E7EB] opacity-75 hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-[15px]">
                        <ShoppingOutlined />
                      </div>
                      <Tooltip title="Cost of Goods Sold (COGS) per SKU">
                        <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                      </Tooltip>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[14px] font-semibold text-[#111827] m-0 flex items-center justify-between">
                        Product cost
                        {settings.product_cost && <CheckOutlined className="text-[#D97706] text-[12px]" />}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] mt-1 m-0">Cost of goods sold</p>
                    </div>
                  </button>

                  {/* CARD: AD SPEND */}
                  <button
                    type="button"
                    onClick={() => toggleSetting('ad_spend')}
                    className={`text-left w-full relative p-4 rounded-[10px] border-2 cursor-pointer transition-all duration-200 bg-white ${
                      settings.ad_spend
                        ? 'border-[#EC4899] shadow-[0_4px_12px_rgba(236,72,153,0.12)]'
                        : 'border-[#E5E7EB] opacity-75 hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center text-[15px]">
                        <NotificationOutlined />
                      </div>
                      <Tooltip title="PPC Advertising cost allocated to orders">
                        <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                      </Tooltip>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[14px] font-semibold text-[#111827] m-0 flex items-center justify-between">
                        Ad spend
                        {settings.ad_spend && <CheckOutlined className="text-[#DB2777] text-[12px]" />}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] mt-1 m-0">Advertising cost allocated to this order</p>
                    </div>
                  </button>

                  {/* CARD: OTHER EXPENSE */}
                  <button
                    type="button"
                    onClick={() => toggleSetting('other_expense')}
                    className={`text-left w-full relative p-4 rounded-[10px] border-2 cursor-pointer transition-all duration-200 bg-white ${
                      settings.other_expense
                        ? 'border-[#8B5CF6] shadow-[0_4px_12px_rgba(139,92,246,0.12)]'
                        : 'border-[#E5E7EB] opacity-75 hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-[15px]">
                        <WalletOutlined />
                      </div>
                      <Tooltip title="Operating expenses such as packaging, storage, and software">
                        <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                      </Tooltip>
                    </div>
                    <div className="mt-3">
                      <h4 className="text-[14px] font-semibold text-[#111827] m-0 flex items-center justify-between">
                        Other expense
                        {settings.other_expense && <CheckOutlined className="text-[#7C3AED] text-[12px]" />}
                      </h4>
                      <p className="text-[11px] text-[#6B7280] mt-1 m-0">
                        Packaging, warehousing and other operating costs
                      </p>
                    </div>
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F3F4F6] text-[12px] text-[#6B7280] italic">
                  * Marketplace Fees and Shipping are always deducted by default as they are taken directly by the
                  marketplace before payment.
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR PANEL: CALCULATION PREVIEW */}
            <div className="col-span-4 lg:col-span-12">
              <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 shadow-sm sticky top-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[15px] font-semibold text-[#111827] m-0 flex items-center gap-1.5">
                    Calculation Preview
                    <Tooltip title="Simulates a sample order to show how toggles change profit">
                      <InfoCircleOutlined className="text-[13px] text-[#9CA3AF]" />
                    </Tooltip>
                  </h3>
                </div>
                <p className="text-[11px] text-[#6B7280] mb-4 m-0">Sample order — one successful sale</p>

                {/* FORM INPUT SIMULATORS */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#4B5563] mb-1">
                      Net Sales (GST Inclusive)
                    </label>
                    <InputNumber
                      value={previewNetSales}
                      onChange={(val) => setPreviewNetSales(val || 0)}
                      prefix="₹"
                      className="w-full rounded-md h-[34px] flex items-center text-[12px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#4B5563] mb-1">Output GST %</label>
                      <Select
                        value={previewOutputGstRate}
                        onChange={(val) => setPreviewOutputGstRate(val)}
                        className="w-full rounded-md h-[34px]"
                      >
                        <Option value={0}>0%</Option>
                        <Option value={5}>5%</Option>
                        <Option value={12}>12%</Option>
                        <Option value={18}>18%</Option>
                        <Option value={28}>28%</Option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#4B5563] mb-1">Input GST %</label>
                      <Select
                        value={previewInputGstRate}
                        onChange={(val) => setPreviewInputGstRate(val)}
                        className="w-full rounded-md h-[34px]"
                      >
                        <Option value={0}>0%</Option>
                        <Option value={5}>5%</Option>
                        <Option value={12}>12%</Option>
                        <Option value={18}>18%</Option>
                        <Option value={28}>28%</Option>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#4B5563] mb-1">Product cost</label>
                      <InputNumber
                        value={previewProductCost}
                        onChange={(val) => setPreviewProductCost(val || 0)}
                        prefix="₹"
                        className="w-full rounded-md h-[34px] flex items-center text-[12px]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#4B5563] mb-1">Other expense</label>
                      <InputNumber
                        value={previewOtherExpense}
                        onChange={(val) => setPreviewOtherExpense(val || 0)}
                        prefix="₹"
                        className="w-full rounded-md h-[34px] flex items-center text-[12px]"
                      />
                    </div>
                  </div>
                </div>

                {/* STATS ROW */}
                <div className="grid grid-cols-3 gap-2 my-4 bg-[#F9FAFB] p-2.5 rounded-lg border border-[#F3F4F6] text-center">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#9CA3AF]">GROSS QTY</span>
                    <span className="text-[13px] font-semibold text-[#111827]">1</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#9CA3AF]">NET QTY</span>
                    <span className="text-[13px] font-semibold text-[#111827]">1</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-[#9CA3AF]">RETURN %</span>
                    <span className="text-[13px] font-semibold text-[#111827]">0.00%</span>
                  </div>
                </div>

                {/* SEGMENTED TAB BUTTONS */}
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-[#F3F4F6] rounded-lg mb-4">
                  {['Full', 'Taxes', 'Costs'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`py-1 text-[11px] font-semibold rounded-md transition-all ${
                        activeTab === tab ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* LIVE ESTIMATED PROFIT BOX */}
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-4 rounded-xl text-center shadow-sm">
                  <span className="text-[11px] font-medium text-[#047857] uppercase tracking-wider block">
                    Estimated Net Profit
                  </span>
                  <div className="text-[22px] font-bold text-[#065F46] mt-0.5">
                    ₹{calculatedPreview.netProfit.toFixed(2)}
                  </div>
                  <div className="text-[12px] font-medium text-[#059669] mt-0.5">
                    Margin: {calculatedPreview.profitMargin.toFixed(2)}%
                  </div>
                </div>

                <p className="text-[10px] text-[#9CA3AF] text-center mt-3 m-0">
                  Preview is an estimate. Actual values may vary after report processing.
                </p>
              </div>
            </div>
          </div>
        </Spin>
      </main>
    </>
  );
}
