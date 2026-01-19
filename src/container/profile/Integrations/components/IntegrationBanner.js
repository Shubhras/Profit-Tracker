import React from 'react';

export default function IntegrationBanner() {
  return (
    <div className="px-[3%] py-20 lg:py-10">
      <section className="relative rounded-[40px] py-16 bg-[radial-gradient(circle_at_top,#22C55E,transparent_60%),linear-gradient(135deg,#0a0f2c,#0f3d2e,#050814)] text-white overflow-hidden">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-5xl md:text-3xl font-bold leading-relaxed text-white/90">
            Supporting 3+ Channels With <br /> One Click Integration
          </h2>
        </div>
      </section>
    </div>
  );
}
