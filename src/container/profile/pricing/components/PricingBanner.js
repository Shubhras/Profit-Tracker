import React from 'react';

function PricingBanner() {
  return (
    <div className="px-[3%] py-20 lg:py-10">
      <section
        className="relative rounded-[40px] py-16
bg-[radial-gradient(circle_at_top,#22C55E,transparent_60%),linear-gradient(135deg,#0a0f2c,#0f3d2e,#050814)]
      text-white overflow-hidden"
      >
        {/* Header */}
        <div className="text-center space-y-8">
          <h2 className="text-5xl md:text-3xl font-bold text-white/90">Choose Your Perfect Plan</h2>
          <p className="text-lg">Flexible options designed to match your needs.</p>
          <span className="inline-block px-2 py-2.5 rounded-full border-2 border-gray-800 text-md font-semibold">
            <span className="rounded-full px-4 py-1 border border-white/90">Monthly</span>
          </span>
        </div>
      </section>
    </div>
  );
}
export default PricingBanner;
