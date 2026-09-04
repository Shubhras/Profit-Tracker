import React, { useEffect, useState, useMemo } from 'react';
import { Button, InputNumber, Select, message, Spin, Tooltip } from 'antd';
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
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

const formatINR = (n) =>
  `₹${Math.abs(Math.round(n * 100) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function ProfitCalculationSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Preview Input Assumptions
  const [previewNetSales, setPreviewNetSales] = useState(1000);
  const [previewOutputGstRate, setPreviewOutputGstRate] = useState(0.05);
  const [previewInputGstRate, setPreviewInputGstRate] = useState(0.18);
  const [previewProductCost, setPreviewProductCost] = useState(100);
  const [previewOtherExpense, setPreviewOtherExpense] = useState(25);
  const [previewAdSpend] = useState(100);
  const [previewPromo] = useState(100);
  const [previewMpFees] = useState(150);
  const [previewShipping] = useState(70);
  const [previewClaim] = useState(0);

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'tax', 'cost'

  // Fetch initial settings from backend
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await DataService.get('/amazon/profit-calculation-settings/');
      if (response.data && response.data.settings) {
        const s = response.data.settings;
        setSettings({
          ...DEFAULT_SETTINGS,
          ...s,
        });
        if (s.preview_output_gst_rate !== undefined) setPreviewOutputGstRate(s.preview_output_gst_rate);
        if (s.preview_input_gst_rate !== undefined) setPreviewInputGstRate(s.preview_input_gst_rate);
        if (s.preview_other_expense !== undefined) setPreviewOtherExpense(s.preview_other_expense);
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
      const payload = {
        ...settings,
        preview_output_gst_rate: previewOutputGstRate,
        preview_input_gst_rate: previewInputGstRate,
        preview_other_expense: previewOtherExpense,
      };
      const response = await DataService.post('/amazon/profit-calculation-settings/', payload);
      if (response.data && response.data.status) {
        message.success('Profit Calculation Settings saved successfully!');
        if (response.data.settings) {
          const s = response.data.settings;
          setSettings(s);
          if (s.preview_output_gst_rate !== undefined) setPreviewOutputGstRate(s.preview_output_gst_rate);
          if (s.preview_input_gst_rate !== undefined) setPreviewInputGstRate(s.preview_input_gst_rate);
          if (s.preview_other_expense !== undefined) setPreviewOtherExpense(s.preview_other_expense);
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
    setPreviewNetSales(1000);
    setPreviewOutputGstRate(0.05);
    setPreviewInputGstRate(0.18);
    setPreviewProductCost(100);
    setPreviewOtherExpense(25);
    message.info('Reset settings to platform defaults.');
  };

  // Toggle individual setting
  const toggleSetting = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Live Math & Breakdown Calculation
  const calculatedData = useMemo(() => {
    const net = Number(previewNetSales) || 0;
    const outRate = Number(previewOutputGstRate) || 0;
    const inRate = Number(previewInputGstRate) || 0;
    const product = Number(previewProductCost) || 0;
    const other = Number(previewOtherExpense) || 0;
    const ads = Number(previewAdSpend) || 0;
    const promo = Number(previewPromo) || 0;
    const mpFees = Number(previewMpFees) || 0;
    const shipping = Number(previewShipping) || 0;
    const claim = Number(previewClaim) || 0;
    const tcsRate = 0.005;
    const tdsRate = 0.001;

    const gross = net + promo;
    const outGST = settings.output_gst ? net - net / (1 + outRate) : 0;
    const taxable = net - outGST;
    const inputGST = (mpFees + shipping) * inRate;
    const itcAll =
      inputGST +
      (settings.ad_spend ? ads * inRate : 0) +
      (settings.product_cost ? product * outRate : 0) +
      (settings.other_expense ? other * inRate : 0);
    const tcs = taxable * tcsRate;
    const tds = gross * tdsRate;

    // Monetary Impacts for Badges
    const inc = settings.gst_treatment === 'inclusive';
    const impactValues = {
      tcs,
      tds,
      claim,
      input_gst_itc: inc ? itcAll : inputGST,
      output_gst: outGST || net - net / (1 + outRate),
      product_cost: inc ? product * (1 + outRate) : product,
      ad_spend: inc ? ads * (1 + inRate) : ads,
      other_expense: inc ? other * (1 + inRate) : other,
    };

    // Build Line Items for Calculation Breakdown
    const mp = inc ? mpFees * (1 + inRate) : mpFees;
    const sh = inc ? shipping * (1 + inRate) : shipping;
    const ad = inc ? ads * (1 + inRate) : ads;
    const pc = inc ? product * (1 + outRate) : product;
    const oe = inc ? other * (1 + inRate) : other;

    const rows = [];
    let t = net;

    rows.push({ l: 'Gross Sales', v: gross, g: 'sales', plain: true });
    rows.push({ l: '(-) Promo', v: -promo, g: 'sales' });
    rows.push({
      l: 'Net Sales',
      v: net,
      g: 'sales',
      plain: true,
      cls: 'border-t border-[#E5E7EB] pt-2 font-bold',
      anchor: true,
    });

    if (settings.output_gst) {
      rows.push({
        l: '(-) GST to Pay',
        sub: 'Net Sales − Taxable value',
        v: -outGST,
        g: 'tax',
      });
      t -= outGST;
      rows.push({
        l: 'Taxable value',
        sub: `Net Sales ÷ (1 + ${(outRate * 100).toFixed(0)}%)`,
        v: t,
        g: 'flow',
        plain: true,
        cls: 'border-t border-[#E5E7EB] pt-2 font-bold',
      });
    }

    rows.push({ l: '(-) MP FEES', v: -mp, g: 'cost' });
    t -= mp;
    rows.push({ l: '(-) Shipping', v: -sh, g: 'cost' });
    t -= sh;

    if (settings.ad_spend) {
      rows.push({ l: '(-) Ad spend', v: -ad, g: 'cost' });
      t -= ad;
    }
    if (settings.product_cost) {
      rows.push({ l: '(-) Product cost', v: -pc, g: 'cost' });
      t -= pc;
    }
    if (settings.other_expense) {
      rows.push({ l: '(-) Other expense', v: -oe, g: 'cost' });
      t -= oe;
    }
    if (settings.claim) {
      rows.push({ l: '+ Claim', v: claim, g: 'tax' });
      t += claim;
    }

    if (inc) {
      if (settings.input_gst_itc) {
        rows.push({
          l: '+ MP-GST',
          sub: 'incl. credit on ad spend, product & other',
          v: itcAll,
          g: 'tax',
          cls: 'border-t border-dashed border-[#E5E7EB] pt-2',
        });
        t += itcAll;
      } else {
        rows.push({
          l: 'MP-GST not claimable',
          sub: 'left inside the costs above',
          v: null,
          g: 'tax',
          grey: true,
          cls: 'border-t border-dashed border-[#E5E7EB] pt-2',
        });
      }
    } else if (settings.input_gst_itc) {
      rows.push({
        l: 'MP-GST',
        sub: 'already netted — costs shown excl. GST',
        v: inputGST,
        g: 'tax',
        grey: true,
        plain: true,
        cls: 'border-t border-dashed border-[#E5E7EB] pt-2',
      });
    } else {
      rows.push({
        l: '(-) MP-GST not claimable',
        v: -itcAll,
        g: 'tax',
        cls: 'border-t border-dashed border-[#E5E7EB] pt-2',
      });
      t -= itcAll;
    }

    if (settings.tcs) {
      rows.push({
        l: 'TCS',
        sub: 'withheld at settlement, credited back — net zero',
        v: tcs,
        g: 'tax',
        grey: true,
        plain: true,
      });
    }
    if (settings.tds) {
      rows.push({
        l: 'TDS (194-O)',
        sub: 'withheld at settlement, recovered on filing — net zero',
        v: tds,
        g: 'tax',
        grey: true,
        plain: true,
      });
    }

    const settlement = net - mpFees - shipping - inputGST + claim - tcs;

    let profitLabel = 'Profit';
    if (!settings.product_cost) profitLabel = 'Profit before Product cost';
    else if (!settings.ad_spend) profitLabel = 'Profit before Ad spend';
    else if (!settings.output_gst) profitLabel = 'Profit before GST to Pay';

    const netProfit = t;
    const profitMargin = net > 0 ? (netProfit / net) * 100 : 0;

    return {
      impactValues,
      rows,
      settlement,
      profitLabel,
      netProfit,
      profitMargin,
      net,
    };
  }, [
    previewNetSales,
    previewOutputGstRate,
    previewInputGstRate,
    previewProductCost,
    previewOtherExpense,
    previewAdSpend,
    previewPromo,
    previewMpFees,
    previewShipping,
    previewClaim,
    settings,
  ]);

  // Filtered rows based on selected tab
  const displayRows = useMemo(() => {
    if (activeTab === 'all') return calculatedData.rows;
    const body = calculatedData.rows.filter((r) => r.g === activeTab);
    return calculatedData.rows.filter((r) => r.anchor).concat(body);
  }, [activeTab, calculatedData.rows]);

  const groupTotal = useMemo(() => {
    if (activeTab === 'all') return 0;
    return calculatedData.rows
      .filter((r) => r.g === activeTab && r.v !== null && !r.grey)
      .reduce((acc, r) => acc + (r.v || 0), 0);
  }, [activeTab, calculatedData.rows]);

  const PageRoutes = [
    { path: '', breadcrumbName: 'Settings' },
    { path: '', breadcrumbName: 'Product Setting' },
    { path: '', breadcrumbName: 'Profit Calculation Settings' },
  ];

  // Helper render method for Card with On/Off Switch Button
  const renderItemCard = (key, title, subtitle, infoTooltip, accentColor, iconSvg, signPrefix = '−') => {
    const isChecked = !!settings[key];
    const impactVal = calculatedData.impactValues[key] || 0;
    const formattedVal = `${signPrefix}${formatINR(impactVal)}`;

    return (
      <div
        className={`relative border rounded-[11px] p-4 flex flex-col transition-all duration-200 bg-white overflow-hidden ${
          isChecked ? 'border-[#A7DCBC] bg-[#F3FBF6]' : 'border-[#E5E7EB] opacity-90'
        }`}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] transition-transform duration-300"
          style={{
            backgroundColor: accentColor,
            transform: isChecked ? 'scaleY(1)' : 'scaleY(0)',
          }}
        />

        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center transition-transform duration-300"
            style={{
              backgroundColor: isChecked ? `${accentColor}15` : '#F3F4F6',
              transform: isChecked ? 'scale(1.06) rotate(-4deg)' : 'none',
            }}
          >
            {iconSvg}
          </div>
          <div className="text-[14px] font-semibold text-[#111827] flex items-center gap-1.5">
            {title}
            <Tooltip title={infoTooltip}>
              <span className="w-3.5 h-3.5 rounded-full border border-[#9CA3AF] text-[#9CA3AF] text-[9.5px] font-bold inline-flex items-center justify-center cursor-help leading-none">
                i
              </span>
            </Tooltip>
          </div>
        </div>

        <p className="text-[#6B7280] text-[12.2px] leading-relaxed flex-1 mb-3">{subtitle}</p>

        {/* ON / OFF SWITCH BUTTON */}
        <button
          type="button"
          onClick={() => toggleSetting(key)}
          aria-pressed={isChecked}
          className="self-start inline-flex items-center gap-2.5 bg-transparent border-0 p-0 cursor-pointer text-left focus:outline-none"
        >
          <span
            className={`w-[46px] h-[26px] rounded-full relative transition-colors duration-200 ${
              isChecked
                ? 'bg-gradient-to-r from-[#1BB255] to-[#15803D] shadow-[0_2px_9px_rgba(22,163,74,0.32)]'
                : 'bg-[#D1D5DB]'
            }`}
          >
            <span
              className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.28)] flex items-center justify-center transition-transform duration-300 ${
                isChecked ? 'translate-x-[20px]' : 'translate-x-0'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-2.5 h-2.5 stroke-[#15803D] stroke-[3] fill-none transition-all duration-200 ${
                  isChecked ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <path d="M5 13l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>

          <span
            className={`text-[12px] font-semibold px-2.5 py-1 rounded-full transition-colors ${
              isChecked ? 'bg-[#E8F6EE] text-[#15803D]' : 'bg-[#F1F2F4] text-[#6B7280]'
            }`}
          >
            {formattedVal}
          </span>
        </button>
      </div>
    );
  };

  return (
    <>
      {/* PAGE HEADER */}
      <div className="px-6 xl:px-[15px] pt-3 pb-4">
        <PageHeader routes={PageRoutes} title="Profit Calculation Settings" className="p-0 bg-transparent" />
        <div className="flex items-center justify-between mt-1 sm:flex-col sm:items-start sm:gap-3">
          <p className="text-[13.5px] text-[#6B7280] m-0">
            Choose which components to include in your profit calculation.
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleResetDefault}
              icon={<ReloadOutlined />}
              className="h-[38px] px-4 rounded-[9px] text-[13.5px] font-semibold border-[#E5E7EB] text-[#374151] hover:bg-[#F1F2F4]"
            >
              Reset to Default
            </Button>
            <Button
              type="primary"
              onClick={handleSaveSettings}
              loading={saving}
              icon={<SaveOutlined />}
              className="h-[38px] px-5 rounded-[9px] text-[13.5px] font-semibold bg-[#16A34A] hover:bg-[#15803D] border-none text-white shadow-sm"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>

      <main className="px-6 xl:px-[15px] pb-[50px]">
        <Spin spinning={loading}>
          <div className="grid grid-cols-12 gap-5 items-start">
            {/* LEFT MAIN PANEL: SETTINGS CARDS */}
            <div className="col-span-8 lg:col-span-12 space-y-4">
              {/* SECTION 1: TAXES & DEDUCTIONS */}
              <div className="bg-white border border-[#E5E7EB] rounded-[13px] p-[22px]">
                <h2 className="text-[16px] font-semibold text-[#111827] tracking-tight mb-4">1. Taxes & Deductions</h2>
                <div className="grid grid-cols-12 gap-[22px]">
                  <div className="col-span-4 md:col-span-12 text-[#6B7280] text-[12.8px] leading-relaxed">
                    Select the taxes and deductions you want to include in profit calculation.
                  </div>

                  <div className="col-span-8 md:col-span-12 grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-3">
                    {/* TCS */}
                    {renderItemCard(
                      'tcs',
                      'TCS',
                      'Tax Collected at Source',
                      'Tax Collected at Source — withheld by marketplace and credited to cash ledger',
                      '#2563EB',
                      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#2563EB] fill-none stroke-[1.8]">
                        <path d="M4 7h16M4 12h16M4 17h10" />
                      </svg>,
                      '',
                    )}

                    {/* TDS */}
                    {renderItemCard(
                      'tds',
                      'TDS',
                      'Tax Deducted at Source',
                      'Section 194-O, 0.1% of Gross Sales.',
                      '#D97706',
                      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#D97706] fill-none stroke-[1.8]">
                        <path d="M12 3v18M17 7H9.5a2.5 2.5 0 000 5h5a2.5 2.5 0 010 5H6" />
                      </svg>,
                      '',
                    )}

                    {/* MP-GST */}
                    {renderItemCard(
                      'input_gst_itc',
                      'MP-GST',
                      'Eligible GST on marketplace fees and services',
                      '18% on MP FEES and Shipping. Turn off if credit is blocked.',
                      '#059669',
                      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#059669] fill-none stroke-[1.8]">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>,
                      '',
                    )}

                    {/* GST TO PAY */}
                    {renderItemCard(
                      'output_gst',
                      'GST to Pay',
                      'GST collected on sales',
                      'Net Sales − Taxable value, at product GST slab',
                      '#E11D48',
                      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#E11D48] fill-none stroke-[1.8]">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>,
                      '−',
                    )}

                    {/* CLAIM */}
                    {renderItemCard(
                      'claim',
                      'Claim',
                      'Reimbursements recovered from marketplace',
                      'Positive value = amount received or recovered from marketplace',
                      '#0891B2',
                      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#0891B2] fill-none stroke-[1.8]">
                        <path d="M20 12V8H6a2 2 0 010-4h12v4" />
                        <path d="M4 6v12a2 2 0 002 2h14v-4" />
                        <path d="M18 12a2 2 0 000 4h4v-4z" />
                      </svg>,
                      '+',
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: COSTS */}
              <div className="bg-white border border-[#E5E7EB] rounded-[13px] p-[22px]">
                <h2 className="text-[16px] font-semibold text-[#111827] tracking-tight mb-4">2. Costs</h2>
                <div className="grid grid-cols-12 gap-[22px]">
                  <div className="col-span-4 md:col-span-12 text-[#6B7280] text-[12.8px] leading-relaxed">
                    Select the cost components you want to include in profit calculation.
                  </div>

                  <div className="col-span-8 md:col-span-12 grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-3">
                    {/* PRODUCT COST */}
                    {renderItemCard(
                      'product_cost',
                      'Product cost',
                      'Cost of goods sold',
                      'Set per SKU in Product Configuration',
                      '#D97706',
                      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#D97706] fill-none stroke-[1.8]">
                        <path d="M3 6h2l2 11h11l2-8H7" />
                        <circle cx="10" cy="20" r="1.3" />
                        <circle cx="17" cy="20" r="1.3" />
                      </svg>,
                      '−',
                    )}

                    {/* AD SPEND */}
                    {renderItemCard(
                      'ad_spend',
                      'Ad spend',
                      'Advertising cost allocated to this order',
                      'Product level where available, otherwise split by order count',
                      '#DB2777',
                      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#DB2777] fill-none stroke-[1.8]">
                        <path d="M3 11v2a1 1 0 001 1h2l4 4V6L6 10H4a1 1 0 00-1 1zM16 8a5 5 0 010 8" />
                      </svg>,
                      '−',
                    )}

                    {/* OTHER EXPENSE */}
                    {renderItemCard(
                      'other_expense',
                      'Other expense',
                      'Packaging, warehousing and other operating costs',
                      'Packaging, warehousing, payment gateway, reverse logistics',
                      '#7C3AED',
                      <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-[#7C3AED] fill-none stroke-[1.8]">
                        <rect x="3" y="7" width="18" height="13" rx="2" />
                        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18" />
                      </svg>,
                      '−',
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTNOTE BOX */}
              <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-[11px] p-4 flex items-center gap-3 text-[13px] text-[#374151]">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-[#2563EB] fill-none stroke-[1.8]">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 11v5M12 8h.01" />
                </svg>
                <div>
                  MP FEES and Shipping are always deducted — the marketplace takes them before you are paid. Everything
                  else above is yours to switch on or off.
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR PANEL: CALCULATION PREVIEW */}
            <div className="col-span-4 lg:col-span-12 sticky top-[18px]">
              <div className="bg-white border border-[#E5E7EB] rounded-[13px] overflow-hidden shadow-sm">
                <div className="p-[18px] pb-3">
                  <h2 className="text-[15.5px] font-semibold text-[#111827] flex items-center gap-1.5 m-0">
                    Calculation Preview
                    <Tooltip title="A single successful sale, using the column names from the spec sheet">
                      <span className="w-3.5 h-3.5 rounded-full border border-[#9CA3AF] text-[#9CA3AF] text-[9.5px] font-bold inline-flex items-center justify-center cursor-help leading-none">
                        i
                      </span>
                    </Tooltip>
                  </h2>
                  <p className="text-[12.4px] text-[#6B7280] mt-1 m-0">Sample order · one successful sale</p>

                  {/* ASSUMPTIONS FORM */}
                  <div className="mt-3 border border-[#E5E7EB] rounded-[10px] p-3 bg-[#FCFCFD] space-y-2">
                    <div className="flex items-center gap-2 text-[12.2px]">
                      <label className="text-[#6B7280] flex-1">Net Sales (GST inclusive)</label>
                      <InputNumber
                        value={previewNetSales}
                        onChange={(val) => setPreviewNetSales(val || 0)}
                        step={50}
                        className="w-[96px] text-right font-semibold text-[12.2px]"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[12.2px]">
                      <label className="text-[#6B7280] flex-1">GST to Pay %</label>
                      <Select
                        value={previewOutputGstRate}
                        onChange={(val) => setPreviewOutputGstRate(val)}
                        className="w-[96px] text-right font-semibold text-[12.2px]"
                      >
                        <Option value={0}>0%</Option>
                        <Option value={0.03}>3%</Option>
                        <Option value={0.05}>5%</Option>
                        <Option value={0.12}>12%</Option>
                        <Option value={0.18}>18%</Option>
                        <Option value={0.28}>28%</Option>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 text-[12.2px]">
                      <label className="text-[#6B7280] flex-1">MP-GST %</label>
                      <Select
                        value={previewInputGstRate}
                        onChange={(val) => setPreviewInputGstRate(val)}
                        className="w-[96px] text-right font-semibold text-[12.2px]"
                      >
                        <Option value={0.05}>5%</Option>
                        <Option value={0.12}>12%</Option>
                        <Option value={0.18}>18%</Option>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 text-[12.2px]">
                      <label className="text-[#6B7280] flex-1">Product cost</label>
                      <InputNumber
                        value={previewProductCost}
                        onChange={(val) => setPreviewProductCost(val || 0)}
                        step={10}
                        className="w-[96px] text-right font-semibold text-[12.2px]"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-[12.2px]">
                      <label className="text-[#6B7280] flex-1">Other expense</label>
                      <InputNumber
                        value={previewOtherExpense}
                        onChange={(val) => setPreviewOtherExpense(val || 0)}
                        step={5}
                        className="w-[96px] text-right font-semibold text-[12.2px]"
                      />
                    </div>
                  </div>

                  {/* QTY STATS */}
                  <div className="flex gap-1.5 mt-2.5">
                    <div className="flex-1 bg-[#F1F2F4] rounded-[8px] p-1.5 text-center">
                      <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                        Gross Qty
                      </span>
                      <span className="text-[13px] font-bold text-[#111827] block mt-0.5">1</span>
                    </div>
                    <div className="flex-1 bg-[#F1F2F4] rounded-[8px] p-1.5 text-center">
                      <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                        Net QTY
                      </span>
                      <span className="text-[13px] font-bold text-[#111827] block mt-0.5">1</span>
                    </div>
                    <div className="flex-1 bg-[#F1F2F4] rounded-[8px] p-1.5 text-center">
                      <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                        Return %
                      </span>
                      <span className="text-[13px] font-bold text-[#111827] block mt-0.5">0.00%</span>
                    </div>
                  </div>

                  {/* FILTER TABS */}
                  <div className="flex mt-2.5 bg-[#F1F2F4] rounded-[9px] p-[3px] gap-[2px]">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      aria-pressed={activeTab === 'all'}
                      className={`flex-1 text-[11.4px] font-semibold py-[7px] border-0 rounded-[7px] transition-all cursor-pointer ${
                        activeTab === 'all' ? 'bg-white text-[#111827] shadow-sm' : 'bg-transparent text-[#6B7280]'
                      }`}
                    >
                      Full
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tax')}
                      aria-pressed={activeTab === 'tax'}
                      className={`flex-1 text-[11.4px] font-semibold py-[7px] border-0 rounded-[7px] transition-all cursor-pointer ${
                        activeTab === 'tax' ? 'bg-white text-[#111827] shadow-sm' : 'bg-transparent text-[#6B7280]'
                      }`}
                    >
                      Taxes
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('cost')}
                      aria-pressed={activeTab === 'cost'}
                      className={`flex-1 text-[11.4px] font-semibold py-[7px] border-0 rounded-[7px] transition-all cursor-pointer ${
                        activeTab === 'cost' ? 'bg-white text-[#111827] shadow-sm' : 'bg-transparent text-[#6B7280]'
                      }`}
                    >
                      Costs
                    </button>
                  </div>
                </div>

                {/* BREAKDOWN ROWS */}
                <div className="px-[18px] pt-[6px] pb-1 space-y-1">
                  {displayRows.map((r, idx) => {
                    const hasVal = r.v !== null && r.v !== undefined;
                    const valText = hasVal ? `${r.v < 0 ? '-' : ''}${formatINR(r.v)}` : '—';
                    const isNeg = r.v < 0;
                    const isPos = r.v > 0;

                    let colorCls = '';
                    if (!r.plain && !r.grey && !r.cls?.includes('sub')) {
                      colorCls = isNeg ? 'text-[#EF4444]' : isPos ? 'text-[#16A34A]' : '';
                    }

                    return (
                      <div key={idx} className={`flex items-baseline gap-2 py-1 text-[12.6px] ${r.cls || ''}`}>
                        <div className={r.grey ? 'text-[#9CA3AF]' : 'text-[#374151]'}>
                          {r.l}
                          {r.sub && <span className="block text-[10.7px] text-[#9CA3AF] mt-0.5">{r.sub}</span>}
                        </div>
                        <div className={`ml-auto font-medium whitespace-nowrap ${colorCls}`}>{valText}</div>
                      </div>
                    );
                  })}
                </div>

                {/* SETTLEMENT BOX */}
                {activeTab === 'all' && (
                  <div className="bg-[#F1F2F4] px-[18px] py-[11px] flex justify-between items-center text-[12.8px] font-bold border-t border-[#E5E7EB] mt-1.5">
                    <div>Expected Settlement 🔒</div>
                    <div>{formatINR(calculatedData.settlement)}</div>
                  </div>
                )}

                {/* GROUP SUMMARY BAR */}
                {activeTab !== 'all' && (
                  <div className="mx-[18px] mt-2 bg-[#F1F2F4] rounded-[10px] p-3">
                    <div className="flex text-[12.8px] font-bold">
                      <span>{activeTab === 'tax' ? 'Net tax impact' : 'Total costs'}</span>
                      <span className={`ml-auto ${groupTotal < 0 ? 'text-[#EF4444]' : 'text-[#16A34A]'}`}>
                        {groupTotal < 0 ? '-' : '+'}
                        {formatINR(groupTotal)}
                      </span>
                    </div>
                    <div className="flex text-[11.4px] text-[#6B7280] font-medium mt-1">
                      <span>Share of Net Sales</span>
                      <span className="ml-auto">
                        {calculatedData.net > 0 ? Math.abs((groupTotal / calculatedData.net) * 100).toFixed(2) : '0.00'}
                        %
                      </span>
                    </div>
                  </div>
                )}

                {/* TOTAL PROFIT BOX */}
                <div className="mx-[18px] mt-3 bg-[#F3FBF6] border border-[#A7DCBC] rounded-[11px] p-3.5">
                  <div className="flex items-center gap-1.5 text-[14.2px] font-bold text-[#111827]">
                    <span>{calculatedData.profitLabel}</span>
                    <span className="text-[11.2px] font-normal text-[#6B7280]">(as per current settings)</span>
                    <span className="ml-auto text-[#15803D] text-[17px] tracking-tight font-bold">
                      {formatINR(calculatedData.netProfit)}
                    </span>
                  </div>
                  <div className="flex mt-2 pt-2 border-t border-[#A7DCBC] text-[12.5px] font-semibold text-[#374151]">
                    <span>Profit percentage</span>
                    <span className="ml-auto">{calculatedData.profitMargin.toFixed(2)}%</span>
                  </div>
                </div>

                {/* TIP FOOTER */}
                <div className="m-[14px] mb-[18px] bg-[#F3FBF6] rounded-[10px] p-3 flex gap-2.5 text-[12px] text-[#374151] leading-normal">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 flex-shrink-0 stroke-[#16A34A] fill-none stroke-[1.7] mt-0.5"
                  >
                    <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
                  </svg>
                  <div>Preview is an estimate. Actual values may vary after report processing.</div>
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </main>
    </>
  );
}
