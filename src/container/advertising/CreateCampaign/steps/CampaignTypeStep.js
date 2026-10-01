import React from 'react';
import { Tag } from 'antd';

function CampaignTypeStep({ onSelect }) {
  return (
    <main className="min-h-[600px] px-3 sm:px-4 md:px-6 pb-[10px] py-3 sm:py-4">
      <div className="w-full rounded-2xl bg-white dark:bg-[#1b1e2b] border border-gray-100 dark:border-white/10 p-4 sm:p-5 md:p-6 shadow-sm">
        {/* HEADER */}
        <div>
          <h2 className="m-0 text-[20px] sm:text-[22px] md:text-[24px] font-bold text-[#1F2937] dark:text-white">
            Create Campaign
          </h2>

          <p className="m-0 mt-1 text-xs sm:text-sm text-[#6B7280] dark:text-gray-400">Select the campaign type.</p>
        </div>

        {/* CAMPAIGN CARDS */}
        <div className="mt-6 grid grid-cols-3 lg:grid-cols-2 sm:grid-cols-1 gap-6 md:gap-4">
          {/* SPONSORED PRODUCTS */}
          <div className="shadow-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 transition-all duration-200 hover:border-[#22C55E] hover:shadow-md flex flex-col justify-between min-h-[190px]">
            <div>
              <h3 className="m-0 text-base sm:text-lg font-bold text-[#1F2937] dark:text-white">Sponsored Products</h3>

              <p className="m-0 mt-2 text-xs sm:text-sm text-[#8A8F98] dark:text-gray-400">
                Promote products in Amazon search results.
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => onSelect('SP')}
                className="h-10 px-5 rounded-lg border border-[#22C55E] bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer w-auto"
              >
                Create Campaign
              </button>
            </div>
          </div>

          {/* SPONSORED BRANDS */}
          <div className="shadow-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 flex flex-col justify-between min-h-[190px]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="m-0 text-base sm:text-lg font-bold text-[#1F2937] dark:text-white">Sponsored Brands</h3>
                <Tag color="orange" className="m-0 text-[10px] leading-4">
                  Coming Soon
                </Tag>
              </div>

              <p className="m-0 mt-2 text-xs sm:text-sm text-[#8A8F98] dark:text-gray-400">
                Increase brand awareness with custom creatives and featured products.
              </p>
            </div>
          </div>

          {/* SPONSORED DISPLAY */}
          <div className="shadow-sm rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 flex flex-col justify-between min-h-[190px]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="m-0 text-base sm:text-lg font-bold text-[#1F2937] dark:text-white">Sponsored Display</h3>
                <Tag color="orange" className="m-0 text-[10px] leading-4">
                  Coming Soon
                </Tag>
              </div>

              <p className="m-0 mt-2 text-xs sm:text-sm text-[#8A8F98] dark:text-gray-400">
                Reach shoppers on and off Amazon using audience targeting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default CampaignTypeStep;
