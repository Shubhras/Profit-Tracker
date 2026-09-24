import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DataService } from '../../../config/dataService/dataService';

const getStoredProfitSettings = () => {
  try {
    const s = localStorage.getItem('profit_calculation_settings');
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
};

let memoryCachedSettings = getStoredProfitSettings();

function CalculationModal({ open, onClose, type, data }) {
  const [profitSettings, setProfitSettings] = useState(
    data?.profit_settings || memoryCachedSettings || getStoredProfitSettings(),
  );

  useEffect(() => {
    const latestStored = getStoredProfitSettings();
    if (latestStored) {
      setProfitSettings(latestStored);
    }
    if (data?.profit_settings) {
      setProfitSettings(data.profit_settings);
      memoryCachedSettings = data.profit_settings;
      try {
        localStorage.setItem('profit_calculation_settings', JSON.stringify(data.profit_settings));
      } catch (e) {
        // ignore
      }
      return;
    }

    if (open) {
      DataService.get('/amazon/profit-calculation-settings/')
        .then((res) => {
          if (res?.data?.settings) {
            setProfitSettings(res.data.settings);
            memoryCachedSettings = res.data.settings;
            try {
              localStorage.setItem('profit_calculation_settings', JSON.stringify(res.data.settings));
            } catch (e) {
              // ignore
            }
          }
        })
        .catch(() => { });
    }
  }, [open, data]);

  // const formatCurrency = (value) => {
  //   if (!value) return '₹0.00';
  //   const stringValue = String(value).trim();
  //   if (stringValue.includes('₹')) {
  //     return stringValue;
  //   }
  //   return `₹${Number(stringValue).toFixed(2)}`;
  // };
  const renderShippingUI = () => {
    return (
      <div className="rounded-2xl overflow-hidden bg-white max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[#eef2f7]">
          <div>
            <h2 className="text-[20px] font-semibold text-[#0f766e]">Shipping Charges Breakdown</h2>

            <div className="flex items-center gap-3 mt-2">
              <img src={data?.image} alt="" className="w-[52px] h-[52px] rounded-lg object-cover border" />

              <div>
                <p className="text-[14px] font-semibold text-[#111827] mb-1"> {data?.name || 'Product Name'}</p>

                <p className="text-[13px] text-[#6b7280]">
                  {/* ASIN: {data?.asin || '000'} */}
                  <span>
                    {data?.asin ? `ASIN: ${data.asin}` : `Order ID: ${data?.view || data?.order_id || '000'}`}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f3f4f6] flex items-center justify-center transition"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Shipping Calculation */}
        <div className="px-5 pt-6">
          <h3 className="text-[15px] font-bold text-[#111827] mb-4">Shipping Calculation</h3>

          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-2 bg-[#f9fafb] border-b">
              <div className="px-4 py-3 text-[14px] font-bold text-[#111827]">Particulars</div>

              <div className="px-4 py-3 text-[14px] font-bold text-right text-[#111827]">Amount (₹)</div>
            </div>

            {/* Row */}
            <div className="grid grid-cols-2 border-b">
              <div className="px-4 py-3 text-[13px] text-[#374151]">Shipping Paid by Customer</div>

              <div className="px-4 py-3 text-right text-[13px] text-[#111827] font-medium">{data?.paidByCustomer}</div>
            </div>

            {/* Row */}
            <div className="grid grid-cols-2 border-b">
              <div className="px-4 py-3 text-[13px] text-[#374151]">Shipping Cost (Actual Shipping Charges)</div>

              <div className="px-4 py-3 text-right text-[13px] font-semibold text-red-500">{data?.shipping}</div>
            </div>

            {/* Total */}
            <div className="grid grid-cols-2 bg-[#f9fafb]">
              <div className="px-4 py-2 text-[13px] font-semibold text-[#111827]">Net Shipping</div>

              <div className="px-4 py-3 text-right text-[15px] font-bold text-[#16a34a]">
                {(
                  parseFloat(String(data?.shipping || 0).replace(/[₹,]/g, '')) -
                  parseFloat(String(data?.paidByCustomer || 0).replace(/[₹,]/g, ''))
                ).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-5">
          <div className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-4 py-2 flex gap-3">
            <InfoCircleOutlined className="text-[#2563eb] mt-[2px]" />

            <p className="text-[12px] text-[#1e3a8a] leading-5">
              Net Shipping is calculated as:
              <br />
              Shipping Paid by Customer - Shipping Cost (Actual Shipping Charges)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pt-5 pb-5">
          <div className="rounded-xl border border-[#d1fae5] bg-[#ecfdf5] px-4 py-2 flex gap-3">
            <InfoCircleOutlined className="text-[#059669] mt-[2px]" />

            <div>
              <p className="text-[13px] font-medium text-[#065f46] mb-1">All values are in INR</p>

              <p className="text-[12px] text-[#6b7280]">Click outside or press ESC to close</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMpFeesUI = () => {
    const channelStr = String(data?.channel || data?.channel1 || data?.marketplace || '').toLowerCase();
    const isMyntra = channelStr.includes('myntra') && !channelStr.includes('amazon');

    const totalFees = parseFloat(String(data?.mpfees || data?.estimatefees || 0).replace(/[₹,]/g, ''));

    const myntraRows = [
      {
        label: 'Estimated Commission',
        value: data?.estimated_commission || 0,
      },
      {
        label: 'Estimated Fixed Fee',
        value: data?.estimated_fixed_fee || 0,
      },
      {
        label: 'Estimated Return Fee',
        value: data?.estimated_return_fee || 0,
      },
      {
        label: 'Estimated Marketing Fee',
        value: data?.estimated_marketing_fee || 0,
      },
      {
        label: 'Estimated Shipping Fee',
        value: data?.estimated_shipping_fee || 0,
      },
      {
        label: 'Other Estimated Fees',
        value: data?.other_estimated_fees || 0,
      },
    ];

    const amazonRows = [
      {
        label: 'Referral Fee',
        value: data?.referral_fee || 0,
      },
      {
        label: 'Variable Closing Fee',
        value: data?.closing_fee || 0,
      },
      {
        label: 'Per Item Fee',
        value: data?.per_item_fee || 0,
      },
      {
        label: 'FBA Pick And Pack',
        value: data?.fba_pick_pack_fee || 0,
      },
      ...(parseFloat(String(data?.fba_fee || 0).replace(/[₹,]/g, '')) > 0 &&
        !parseFloat(String(data?.fba_pick_pack_fee || 0).replace(/[₹,]/g, ''))
        ? [
          {
            label: 'FBA Fee',
            value: data?.fba_fee || 0,
          },
        ]
        : []),
      {
        label: 'Other charges',
        value: data?.other_charges || 0,
      },
    ];

    const feeRows = isMyntra ? myntraRows : amazonRows;

    return (
      <div className="rounded-2xl overflow-hidden bg-white max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef2f7]">
          <h2 className="text-[20px] font-semibold text-[#111827]">Marketplace Fees Breakdown</h2>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f3f4f6] flex items-center justify-center transition"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Product + Summary */}
        <div className="px-5 pt-5">
          <div className="flex gap-4">
            {/* Left */}
            <div className="flex-1 border border-[#e5e7eb] rounded-xl p-4 flex gap-3">
              <img src={data?.image} alt="" className="w-[58px] h-[58px] rounded-lg object-cover border" />

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#111827] line-clamp-2 mb-1">
                  {data?.name || 'Product Name'}
                </p>

                <div className="flex items-center gap-2 mt-1 text-[12px] text-[#6b7280]">
                  {/* <span>ASIN: {data?.asin || '000'}</span> */}
                  <span>
                    {data?.asin ? `ASIN: ${data.asin}` : `Order ID: ${data?.view || data?.order_id || '000'}`}
                  </span>

                  {/* <span>|</span> */}

                  {/* <span>Order ID: 1123</span> */}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="w-[180px] border border-[#e5e7eb] rounded-xl p-4 flex flex-col justify-center">
              <p className="text-[12px] text-[#6b7280] font-medium mb-1">Total Marketplace Fees</p>

              <p className="text-[26px] font-bold text-red-500 mb-1">-₹{Math.abs(totalFees).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-5 pt-5">
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-2 bg-[#f9fafb] border-b border-[#e5e7eb]">
              <div className="px-4 py-3 text-[14px] font-bold text-[#111827] border-r">Charge Type</div>

              <div className="px-4 py-3 text-[14px] font-semibold text-[#111827] text-right">Amount (₹)</div>
            </div>

            {/* Rows */}
            {feeRows.map((item, index) => (
              <div key={index} className="grid grid-cols-2 border-b last:border-b-0 border-[#e5e7eb]">
                <div className="px-4 py-3 text-[14px] text-[#111827] border-r flex items-center gap-2 font-semibold">
                  {item.label}

                  {(item.label === 'Other charges' || item.label.includes('Other')) && (
                    <InfoCircleOutlined className="text-gray-500 text-[13px]" />
                  )}
                </div>

                <div className="px-4 py-3 text-right text-[13px] text-[#111827] font-medium">
                  -₹
                  {Math.abs(parseFloat(String(item.value || 0).replace(/[₹,]/g, ''))).toFixed(2)}
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="grid grid-cols-2 bg-[#fff7f7]">
              <div className="px-4 py-4 text-[14px] font-bold text-red-500 border-r">Total charges</div>

              <div className="px-4 py-4 text-right text-[16px] font-bold text-red-500">
                -₹{Math.abs(totalFees).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-5">
          <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-4 flex gap-3">
            <InfoCircleOutlined className="text-[#2563eb] mt-[2px]" />

            <p className="text-[12px] text-[#1e40af] leading-5 mb-1">
              This breakdown includes only marketplace charges (FeeAmount) and excludes tax components.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-5 flex justify-end">
          {/* <button
            type="button"
            onClick={onClose}
            className="h-[40px] px-6 rounded-xl border border-[#d1d5db] bg-white hover:bg-[#f9fafb] text-[14px] font-medium transition"
          >
            Close
          </button> */}
        </div>
      </div>
    );
  };

  const renderRevisedSettlementUI = () => {
    const formatSignedAmount = (val, defaultSign) => {
      if (val === undefined || val === null || val === '') {
        return `${defaultSign}₹0.00`;
      }
      const clean = String(val).replace(/[₹,\s]/g, '');
      const num = parseFloat(clean);
      if (isNaN(num) || num === 0) {
        return `${defaultSign}₹0.00`;
      }
      if (defaultSign === '-') {
        return `-₹${Math.abs(num).toFixed(2)}`;
      }
      if (defaultSign === '+') {
        return num < 0 ? `-₹${Math.abs(num).toFixed(2)}` : `+₹${Math.abs(num).toFixed(2)}`;
      }
      return num >= 0 ? `+₹${num.toFixed(2)}` : `-₹${Math.abs(num).toFixed(2)}`;
    };

    const charges = [
      { label: 'Order Payment', formatted: formatSignedAmount(data?.order_payment_amount, '+') },
      { label: 'Refund', formatted: formatSignedAmount(data?.refund_charge_amount, '-') },
      { label: 'Chargeback Refund', formatted: formatSignedAmount(data?.chargeback_refund, '-') },
      { label: 'A-to-Z Guarantee Refund', formatted: formatSignedAmount(data?.atoz_guarantee_refund, '-') },
      { label: 'Easy Ship Charges', formatted: formatSignedAmount(data?.easy_ship_charges, '-') },
      { label: 'Delivery Labels', formatted: formatSignedAmount(data?.delivery_label_charges, '-') },
      { label: 'Pass-Through Charges', formatted: formatSignedAmount(data?.pass_through_charges, '+') },
      { label: 'Other Charges', formatted: formatSignedAmount(data?.other_charges_breakdown || data?.other_charges, '-') },
      { label: 'Inventory Reimbursement', formatted: formatSignedAmount(data?.inventory_reimbursement, '+') },
    ];

    const parseAmountVal = (val) => {
      if (val === undefined || val === null || val === '') return 0;
      const clean = String(val).replace(/[₹,\s]/g, '');
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : Math.abs(num);
    };

    const hasBreakdownData =
      parseAmountVal(data?.order_payment_amount) > 0 ||
      parseAmountVal(data?.refund_charge_amount) > 0 ||
      parseAmountVal(data?.easy_ship_charges) > 0 ||
      parseAmountVal(data?.chargeback_refund) > 0 ||
      parseAmountVal(data?.atoz_guarantee_refund) > 0 ||
      parseAmountVal(data?.delivery_label_charges) > 0 ||
      parseAmountVal(data?.pass_through_charges) > 0 ||
      parseAmountVal(data?.other_charges_breakdown || data?.other_charges) > 0 ||
      parseAmountVal(data?.inventory_reimbursement) > 0;

    const calculatedSum =
      parseAmountVal(data?.order_payment_amount)
      - parseAmountVal(data?.refund_charge_amount)
      - parseAmountVal(data?.chargeback_refund)
      - parseAmountVal(data?.atoz_guarantee_refund)
      - parseAmountVal(data?.easy_ship_charges)
      - parseAmountVal(data?.delivery_label_charges)
      + parseAmountVal(data?.pass_through_charges)
      - parseAmountVal(data?.other_charges_breakdown || data?.other_charges)
      + parseAmountVal(data?.inventory_reimbursement);

    const rawTotal = hasBreakdownData
      ? calculatedSum
      : (data?.revisedExpectedSettlement ||
        data?.revised_expected_settlement ||
        data?.new_expected_settlement ||
        data?.settleAmount ||
        data?.exp_settlement ||
        0);
    const cleanTotal = String(rawTotal).replace(/[₹,\s]/g, '');
    const numTotal = parseFloat(cleanTotal) || 0;
    const isPositive = numTotal >= 0;
    const formattedTotal = isPositive ? `+₹${numTotal.toFixed(2)}` : `-₹${Math.abs(numTotal).toFixed(2)}`;

    return (
      <div className="rounded-2xl overflow-hidden bg-white max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#eef2f7]">
          <h2 className="text-[20px] font-semibold text-[#111827]">Order Level Charges Breakdown</h2>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f3f4f6] flex items-center justify-center transition"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Product + Summary */}
        <div className="px-5 pt-5">
          <div className="flex gap-4">
            {/* Left */}
            <div className="flex-1 border border-[#e5e7eb] rounded-xl p-4 flex gap-3">
              {(data?.image || data?.image_url) ? (
                <img src={data?.image || data?.image_url} alt="" className="w-[58px] h-[58px] rounded-lg object-cover border" />
              ) : (
                <div className="w-[58px] h-[58px] rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold border">
                  📦
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#111827] line-clamp-2 mb-1">
                  {data?.name || 'Order Settlement Details'}
                </p>

                <div className="flex items-center gap-2 mt-1 text-[12px] text-[#6b7280]">
                  {data?.asin && <span>ASIN: {data.asin}</span>}
                  {data?.asin && (data?.view || data?.order_id) && <span>|</span>}
                  <span>Order ID: {data?.order_id || data?.view || '-'}</span>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="w-[200px] border border-[#e5e7eb] rounded-xl p-4 flex flex-col justify-center">
              <p className="text-[12px] text-[#6b7280] font-medium mb-1">Revised Settlement</p>
              <p className={`text-[24px] font-bold mb-1 ${isPositive ? 'text-[#059669]' : 'text-red-500'}`}>
                {formattedTotal}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-5 pt-5">
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-2 bg-[#f9fafb] border-b border-[#e5e7eb]">
              <div className="px-4 py-3 text-[14px] font-bold text-[#111827] border-r">Charge Type</div>
              <div className="px-4 py-3 text-[14px] font-semibold text-[#111827] text-right">Amount (₹)</div>
            </div>

            {/* Rows */}
            {charges.map((item, index) => {
              const isZero = item.formatted.includes('₹0.00');
              const isItemPositive = item.formatted.startsWith('+');
              const valColor = isZero ? 'text-gray-400 font-normal' : (isItemPositive ? 'text-[#059669] font-semibold' : 'text-red-500 font-semibold');

              return (
                <div key={index} className="grid grid-cols-2 border-b last:border-b-0 border-[#e5e7eb]">
                  <div className="px-4 py-3 text-[14px] text-[#111827] border-r flex items-center gap-2 font-semibold">
                    {item.label}
                  </div>

                  <div className={`px-4 py-3 text-right text-[13px] ${valColor}`}>
                    {item.formatted}
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className={`grid grid-cols-2 ${isPositive ? 'bg-[#f0fdf4]' : 'bg-[#fff7f7]'}`}>
              <div className={`px-4 py-4 text-[14px] font-bold border-r ${isPositive ? 'text-[#059669]' : 'text-red-500'}`}>
                Revised Expected Settlement
              </div>

              <div className={`px-4 py-4 text-right text-[16px] font-bold ${isPositive ? 'text-[#059669]' : 'text-red-500'}`}>
                {formattedTotal}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-5 pb-5">
          <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] px-4 py-4 flex gap-3">
            <InfoCircleOutlined className="text-[#2563eb] mt-[2px]" />

            <p className="text-[12px] text-[#1e40af] leading-5 mb-0">
              This breakdown includes all Amazon order-level transaction categories (Order Payment, Refunds, Chargebacks, A-to-Z claims, Easy Ship postage, Delivery Labels, Pass-Through charges, Other adjustments, and Inventory Reimbursements).
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderProfitUI = () => {
    const activeSettings = data?.profit_settings || profitSettings || getStoredProfitSettings();

    const isProductCostEnabled = activeSettings ? activeSettings.product_cost !== false : true;
    const isAdSpendEnabled = activeSettings ? activeSettings.ad_spend !== false : true;
    const isTcsEnabled = activeSettings ? activeSettings.tcs !== false : true;
    const isTdsEnabled = activeSettings ? activeSettings.tds !== false : true;
    const isInputGstItcEnabled = activeSettings ? activeSettings.input_gst_itc !== false : true;
    const isOtherExpenseEnabled = activeSettings ? activeSettings.other_expense !== false : true;
    const isOutputGstEnabled = activeSettings ? activeSettings.output_gst !== false : true;
    const isClaimEnabled = activeSettings ? activeSettings.claim !== false : true;

    const sellingPrice = parseFloat(
      String(
        data?.final_net_sales || data?.total_final_net_sales || data?.netsales || data?.total_net_sales || 0,
      ).replace(/[₹,]/g, ''),
    );

    const marketplaceFees = parseFloat(String(data?.estimatefees || data?.mpfees || 0).replace(/[₹,]/g, ''));

    const rawCost =
      data?.stdcost !== undefined && data?.stdcost !== null && data?.stdcost !== ''
        ? data.stdcost
        : data?.cost !== undefined && data?.cost !== null && data?.cost !== ''
          ? data.cost
          : data?.std !== undefined && data?.std !== null && data?.std !== ''
            ? data.std
            : data?.product_cost !== undefined && data?.product_cost !== null && data?.product_cost !== ''
              ? data.product_cost
              : 0;

    const productCost = !isProductCostEnabled ? 0 : parseFloat(String(rawCost).replace(/[₹,]/g, '')) || 0;

    const shippingCost = parseFloat(String(data?.shipping || data?.shippingfees || 0).replace(/[₹,]/g, ''));

    const adSpend = !isAdSpendEnabled ? 0 : parseFloat(String(data?.adSpend || data?.ads || 0).replace(/[₹,]/g, ''));

    const tcs = !isTcsEnabled ? 0 : parseFloat(String(data?.tcs || 0).replace(/[₹,]/g, ''));

    const tds = !isTdsEnabled ? 0 : parseFloat(String(data?.tds || 0).replace(/[₹,]/g, ''));

    const otherExpenses = !isOtherExpenseEnabled
      ? 0
      : parseFloat(String(data?.other_expenses || data?.total_other_expenses || 0).replace(/[₹,]/g, ''));

    const mpGst = !isInputGstItcEnabled ? 0 : parseFloat(String(data?.mp_gst || 0).replace(/[₹,]/g, ''));

    const gstToPay = !isOutputGstEnabled ? 0 : parseFloat(String(data?.gst_to_pay_amount || 0).replace(/[₹,]/g, ''));

    const rawClaim =
      data?.claim_amount !== undefined && data?.claim_amount !== null && data?.claim_amount !== ''
        ? data.claim_amount
        : data?.claim !== undefined && data?.claim !== null && data?.claim !== ''
          ? data.claim
          : data?.total_claim_amount !== undefined && data?.total_claim_amount !== null && data?.total_claim_amount !== ''
            ? data.total_claim_amount
            : 0;

    const claim = !isClaimEnabled ? 0 : parseFloat(String(rawClaim).replace(/[₹,]/g, '')) || 0;

    const profit = parseFloat(String(data?.profit || 0).replace(/[₹,]/g, ''));

    const profitPercent = Number(data?.profitPercent || data?.grossprofitper || data?.totalprofitmargin || 0);

    const rows = [
      {
        label: 'Selling Price',
        value: sellingPrice,
        color: 'text-[#111827]',
        sign: '',
      },
      {
        label: '(-) Marketplace Total Fees',
        value: marketplaceFees,
        color: 'text-red-500',
        sign: '-',
      },
      {
        label: '(-) Product Cost',
        value: productCost,
        color: 'text-red-500',
        sign: '-',
      },
      {
        label: '(-) Shipping Cost',
        value: shippingCost,
        color: 'text-red-500',
        sign: '-',
      },
      {
        label: '(-) Ad Spend',
        value: adSpend,
        color: 'text-red-500',
        sign: '-',
      },
      {
        label: '(+) TCS (ITC)',
        value: tcs,
        color: 'text-green-600',
        sign: '+',
      },
      {
        label: '(+) TDS (ITC)',
        value: tds,
        color: 'text-green-600',
        sign: '+',
      },
      {
        label: '(+) MP GST (ITC)',
        value: mpGst,
        color: 'text-green-600',
        sign: '+',
      },
      {
        label: '(+) Claim',
        value: claim,
        color: 'text-green-600',
        sign: '+',
      },
      {
        label: '(-) Other Expenses',
        value: otherExpenses,
        color: 'text-red-500',
        sign: '-',
      },
      {
        label: '(-) GST to Pay',
        value: gstToPay,
        color: 'text-red-500',
        sign: '-',
      },
    ];

    return (
      <div className="rounded-2xl overflow-hidden bg-white max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[#eef2f7]">
          <div>
            <h2 className="text-[22px] font-semibold text-[#059669]">Profit Breakdown</h2>

            <div className="flex items-center gap-3 mt-4">
              <img
                src={data?.image || data?.image_url}
                alt=""
                className="w-[58px] h-[58px] rounded-lg object-cover border"
              />

              <div>
                <p className="text-[14px] font-semibold text-[#111827] line-clamp-2 mb-1">
                  {data?.name || data?.title || 'Product Name'}
                </p>

                <p className="text-[12px] text-[#6b7280] mt-1">
                  <span>
                    {data?.asin && data?.asin !== '-'
                      ? `ASIN: ${data.asin}`
                      : `Order ID: ${data?.view || data?.order_id || '000'}`}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f3f4f6] flex items-center justify-center transition"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Table */}
        <div className="px-5 pt-5">
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-2 bg-[#f9fafb] border-b border-[#e5e7eb]">
              <div className="px-4 py-3 text-[14px] font-bold text-[#111827]">Particulars</div>

              <div className="px-4 py-3 text-[14px] font-semibold text-right text-[#111827]">Amount (₹)</div>
            </div>

            {/* Rows */}
            {rows.map((item, index) => (
              <div key={index} className="grid grid-cols-2 border-b border-[#eef2f7]">
                <div className="px-4 py-3 text-[14px] text-[#111827] font-semibold">{item.label}</div>

                <div className={`px-4 py-3 text-right text-[13px] font-semibold ${item.color}`}>
                  {item.sign}₹{Math.abs(item.value).toFixed(2)}
                </div>
              </div>
            ))}

            {/* Profit */}
            <div className="grid grid-cols-2 border-t-2 border-dashed border-[#d1d5db] bg-[#fafafa]">
              <div className="px-4 py-4 text-[15px] font-bold text-[#111827]">Profit</div>

              <div
                className={`px-4 py-4 text-right text-[18px] font-bold ${profit < 0 ? 'text-red-500' : 'text-green-600'
                  }`}
              >
                {profit < 0 ? '-' : ''}₹{Math.abs(profit).toFixed(2)}
              </div>
            </div>

            {/* Profit % */}
            <div className="grid grid-cols-2 bg-[#fafafa]">
              <div className="px-4 py-4 text-[15px] font-bold text-[#111827]">Profit %</div>

              <div
                className={`px-4 py-4 text-right text-[18px] font-bold ${profitPercent < 0 ? 'text-red-500' : 'text-green-600'
                  }`}
              >
                {profitPercent.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-5">
          <div className="rounded-xl border border-[#d1fae5] bg-[#ecfdf5] px-4 py-3 flex gap-3">
            <InfoCircleOutlined className="text-[#059669] mt-[2px]" />

            <div>
              <p className="text-[14px] font-medium text-[#065f46] mb-1">All values are in INR</p>

              <p className="text-[13px] text-[#6b7280] mb-1">Click outside or press ESC to close</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'shipping':
        return renderShippingUI();

      case 'mpfees':
        return renderMpFeesUI();

      case 'profit':
        return renderProfitUI();

      case 'revised_settlement':
        return renderRevisedSettlementUI();

      default:
        return null;
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={620}
      centered
      bodyStyle={{
        padding: 0,
        borderRadius: 20,
        overflow: 'hidden',
      }}
    >
      {renderContent()}
    </Modal>
  );
}

export default CalculationModal;
