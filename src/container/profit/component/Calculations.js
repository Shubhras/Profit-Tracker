import React from 'react';
import { Modal } from 'antd';
import { CloseOutlined, InfoCircleOutlined } from '@ant-design/icons';

function CalculationModal({ open, onClose, type, data }) {
  const formatCurrency = (value) => {
    if (!value) return '₹0.00';

    if (typeof value === 'string') {
      return value.startsWith('₹') ? value : `₹${value}`;
    }

    return `₹${Number(value).toFixed(2)}`;
  };
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

                <p className="text-[13px] text-[#6b7280]"> ASIN: {data?.asin || '000'}</p>
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

        {/* Region */}
        <div className="px-5 pt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[14px] font-medium text-[#374151]">Current Region</p>

            <p className="text-[14px] font-medium text-[#374151]">Zonal Regional</p>
          </div>

          {/* Table */}
          <div className="border border-[#e5e7eb] rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 bg-[#f9fafb]">
              {['Step Level', 'Product Weight', 'Weight Slab', 'Rate'].map((item) => (
                <div key={item} className="px-3 py-3 text-[12px] font-semibold text-[#111827] border-r last:border-r-0">
                  {item}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4">
              <div className="px-3 py-4 border-r">
                <p className="text-[12px] text-[#111827] font-medium">Step 2</p>
              </div>

              <div className="px-3 py-4 border-r">
                <p className="text-[12px] text-[#111827] font-medium">{data?.weight || '0.000 kg'}</p>
              </div>

              <div className="px-3 py-4 border-r">
                <p className="text-[12px] text-[#111827] font-medium">{data?.slab || '0.000 kg - 0.500 kg'}</p>
              </div>

              <div className="px-3 py-4">
                <p className="text-[12px] text-[#111827] font-medium">{data?.rate || '₹0.00'}</p>
              </div>
            </div>
          </div>
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

              <div className="px-4 py-3 text-right text-[13px] text-[#111827] font-medium">
                {formatCurrency(data?.netsales)}
              </div>
            </div>

            {/* Row */}
            <div className="grid grid-cols-2 border-b">
              <div className="px-4 py-3 text-[13px] text-[#374151]">Shipping Cost (Actual Shipping Charges)</div>

              <div className="px-4 py-3 text-right text-[13px] font-semibold text-red-500">
                {formatCurrency(data?.shipping)}
              </div>
            </div>

            {/* Total */}
            <div className="grid grid-cols-2 bg-[#f9fafb]">
              <div className="px-4 py-2 text-[13px] font-semibold text-[#111827]">Net Shipping</div>

              <div className="px-4 py-3 text-right text-[15px] font-bold text-[#16a34a]">
                {formatCurrency(
                  (
                    parseFloat(String(data?.netsales || 0).replace(/[₹,]/g, '')) -
                    parseFloat(String(data?.shipping || 0).replace(/[₹,]/g, ''))
                  ).toFixed(2),
                )}
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
    const totalFees = parseFloat(String(data?.mpfees || data?.estimatefees || 0).replace(/[₹,]/g, ''));

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
                  <span>ASIN: {data?.asin || '000'}</span>

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
            {[
              {
                label: 'Referral Fee',
                value: data?.referral_fee || 0,
              },
              {
                label: 'Variable Closing Fee',
                value: data?.closing_fee || 0,
              },
              {
                label: 'FBA Weight Handling',
                value: data?.fba_weight_handling_fee || 0,
              },
              {
                label: 'FBA Pick And Pack',
                value: data?.fba_pick_pack_fee || 0,
              },
              {
                label: 'Other charges',
                value: data?.other_charges || 0,
              },
              {
                label: 'Per Item Fee',
                value: data?.per_item_fee || 0,
              },
              {
                label: 'FBA Fee',
                value: data?.fba_fee || 0,
              },
            ].map((item, index) => (
              <div key={index} className="grid grid-cols-2 border-b last:border-b-0 border-[#e5e7eb]">
                <div className="px-4 py-3 text-[14px] text-[#111827] border-r flex items-center gap-2 font-semibold">
                  {item.label}

                  {item.label === 'Other charges' && <InfoCircleOutlined className="text-gray-500 text-[13px]" />}
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

  const renderProfitUI = () => {
    const sellingPrice = parseFloat(String(data?.netsales || 0).replace(/[₹,]/g, ''));

    const marketplaceFees = parseFloat(String(data?.estimatefees || data?.mpfees || 0).replace(/[₹,]/g, ''));

    const productCost = parseFloat(String(data?.stdcost || 0).replace(/[₹,]/g, ''));

    const shippingCost = parseFloat(String(data?.shipping || 0).replace(/[₹,]/g, ''));

    const adSpend = parseFloat(String(data?.adSpend || 0).replace(/[₹,]/g, ''));

    const tcs = parseFloat(String(data?.tcs || 0).replace(/[₹,]/g, ''));

    const mpGst = parseFloat(String(data?.mp_gst || 0).replace(/[₹,]/g, ''));

    const gstToPay = parseFloat(String(data?.gst_to_pay_amount || 0).replace(/[₹,]/g, ''));

    const profit = parseFloat(String(data?.profit || 0).replace(/[₹,]/g, ''));

    const profitPercent = Number(data?.profitPercent || 0);

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
        label: '(+) MP GST (ITC)',
        value: mpGst,
        color: 'text-green-600',
        sign: '+',
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
              <img src={data?.image} alt="" className="w-[58px] h-[58px] rounded-lg object-cover border" />

              <div>
                <p className="text-[14px] font-semibold text-[#111827] line-clamp-2 mb-1">
                  {data?.name || 'Product Name'}
                </p>

                <p className="text-[12px] text-[#6b7280] mt-1">ASIN: {data?.asin || '000'}</p>
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
                className={`px-4 py-4 text-right text-[18px] font-bold ${
                  profit < 0 ? 'text-red-500' : 'text-green-600'
                }`}
              >
                ₹{Math.abs(profit).toFixed(2)}
              </div>
            </div>

            {/* Profit % */}
            <div className="grid grid-cols-2 bg-[#fafafa]">
              <div className="px-4 py-4 text-[15px] font-bold text-[#111827]">Profit %</div>

              <div
                className={`px-4 py-4 text-right text-[18px] font-bold ${
                  profitPercent < 0 ? 'text-red-500' : 'text-green-600'
                }`}
              >
                {profitPercent}%
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
