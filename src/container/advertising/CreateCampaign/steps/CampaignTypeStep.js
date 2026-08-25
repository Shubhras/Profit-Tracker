import React from 'react';
import { Tag } from 'antd';

function CampaignTypeStep({ onSelect }) {
  return (
    <main className="min-h-[600px] px-4 pb-[10px] py-3">
      <div className="w-full rounded-[8px] bg-white border border-[#E5E7EB] p-5 sm:p-4">
        {/* HEADER */}
        <div>
          <h2 className="m-0 text-[24px] leading-[32px] font-semibold text-[#1F2937] md:text-[22px] sm:text-[20px]">
            Create Campaign
          </h2>

          <p className="m-0 mt-1 text-[14px] leading-[21px] text-[#6B7280]">Select the campaign type.</p>
        </div>

        {/* CAMPAIGN CARDS */}
        <div className="mt-6 grid grid-cols-3 gap-6 lg:grid-cols-2 md:gap-4 sm:grid-cols-1">
          {/* SPONSORED PRODUCTS */}
          <div
            className="
            h-full
            min-h-[190px]
            rounded-[8px]
            border
            border-[#E5E7EB]
            bg-white
            p-5
            transition-all
            duration-200
            hover:border-[#22C55E]
            hover:shadow-[0_4px_14px_rgba(34,197,94,0.10)]
            flex
            flex-col
            justify-between
            sm:p-4
          "
          >
            <div>
              <h3 className="m-0 text-[18px] leading-[25px] font-semibold text-[#1F2937]">Sponsored Products</h3>

              <p className="m-0 mt-2 text-[13px] leading-[20px] text-[#8A8F98]">
                Promote products in Amazon search results.
              </p>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => onSelect('SP')}
                className="
                h-[36px]
                px-4
                rounded-[6px]
                border
                border-[#22C55E]
                bg-[#22C55E]
                hover:bg-[#16A34A]
                hover:border-[#16A34A]
                text-white
                text-[13px]
                font-semibold
                transition-colors
                duration-200
              "
              >
                Create Campaign
              </button>
            </div>
          </div>

          {/* SPONSORED BRANDS */}
          <div
            className="
            h-full
            min-h-[190px]
            rounded-[8px]
            border
            border-[#E5E7EB]
            bg-white
            p-5
            flex
            flex-col
            sm:p-4
          "
          >
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="m-0 text-[18px] leading-[25px] font-semibold text-[#1F2937]">Sponsored Brands</h3>

              <Tag color="orange" className="m-0">
                Coming Soon
              </Tag>
            </div>

            <p className="m-0 mt-2 text-[13px] leading-[20px] text-[#8A8F98]">
              Increase brand awareness with custom creatives and featured products.
            </p>
          </div>

          {/* SPONSORED DISPLAY */}
          <div
            className="
            h-full
            min-h-[190px]
            rounded-[8px]
            border
            border-[#E5E7EB]
            bg-white
            p-5
            flex
            flex-col
            sm:p-4
          "
          >
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="m-0 text-[18px] leading-[25px] font-semibold text-[#1F2937]">Sponsored Display</h3>

              <Tag color="orange" className="m-0">
                Coming Soon
              </Tag>
            </div>

            <p className="m-0 mt-2 text-[13px] leading-[20px] text-[#8A8F98]">
              Reach shoppers on and off Amazon using audience targeting.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CampaignTypeStep;
