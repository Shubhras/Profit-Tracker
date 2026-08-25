import React from 'react';

// Reference viewBox — all coordinates below are authored against this box.
// Using a fixed viewBox that mirrors the real design (1400x420) keeps dash
// spacing and node sizes visually correct, matching the reference video.
const VB_W = 1400;
const VB_H = 420;

const CENTER = { x: VB_W / 2, y: VB_H / 2 }; // 700, 210
const NODE_R = 18; // marketplace circle radius (36px diameter)

const leftMarkets = [
  { name: 'Amazon', short: 'AZ', connected: true, yPct: 26 },
  { name: 'Amazon Ads', short: 'A+', connected: true, yPct: 40 },
  { name: 'Myntra', short: 'MY', connected: true, yPct: 57 },
  { name: 'Flipkart', short: 'FK', connected: false, yPct: 72 },
];

const rightMarkets = [
  { name: 'Blinkit', short: 'BL', connected: true, yPct: 34 },
  { name: 'Swiggy Instamart', short: 'SI', connected: true, yPct: 50 },
  { name: 'Zepto', short: 'ZP', connected: true, yPct: 65 },
  { name: 'Meesho', short: 'ME', connected: false, yPct: 79 },
];

// Circle centers, in viewBox units, for left/right node columns.
const LEFT_CX = VB_W * 0.115;
const RIGHT_CX = VB_W * 0.885;

function MarketplaceNode({ market, side }) {
  return (
    <div
      className={`absolute flex items-center gap-2 -translate-y-1/2 ${
        side === 'left' ? 'left-[10%] flex-row' : 'right-[10%] flex-row-reverse'
      }`}
      style={{
        top: `${market.yPct}%`,
        opacity: market.connected ? 1 : 0.25,
      }}
    >
      {/* Circle */}
      <div
        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[10px] font-medium
        ${
          market.connected
            ? 'border-emerald-400/70 bg-[#10213a] text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.25)]'
            : 'border-slate-500/30 bg-[#101d32] text-slate-500'
        }`}
      >
        {market.connected && (
          <span className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping" />
        )}
        <span className="relative z-10">{market.short}</span>
      </div>

      {/* Name */}
      <div className={`leading-tight ${side === 'right' ? 'text-right' : 'text-left'}`}>
        <div className="text-[12px] font-medium text-slate-300 whitespace-nowrap">{market.name}</div>
        <div className={`text-[9px] ${market.connected ? 'text-emerald-400' : 'text-slate-500'}`}>
          {market.connected ? 'Connected' : 'Not connected'}
        </div>
      </div>
    </div>
  );
}

// Builds the line + traveling-dot SVG elements that converge from a node
// toward the center hub, exactly like the reference clip.
function ConnectionLine({ side, index, market }) {
  const cx = side === 'left' ? LEFT_CX : RIGHT_CX;
  const cy = (market.yPct / 100) * VB_H;

  // Start the line at the outer edge of the node circle, angled toward center.
  const dx = CENTER.x - cx;
  const dy = CENTER.y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const startX = cx + (dx / dist) * NODE_R;
  const startY = cy + (dy / dist) * NODE_R;

  const pathId = `path-${side}-${index}`;
  const duration = 2.4 + index * 0.3;
  const delay = index * 0.35;

  return (
    <g opacity={market.connected ? 1 : 0.35}>
      <path
        id={pathId}
        d={`M ${startX} ${startY} L ${CENTER.x} ${CENTER.y}`}
        fill="none"
        stroke={market.connected ? 'rgba(52,211,153,0.5)' : 'rgba(100,116,139,0.4)'}
        strokeWidth={1.5}
        strokeDasharray={market.connected ? '3 4' : '4 4'}
      />
      {market.connected && (
        <circle r="3" fill="#6ee7b7" filter="url(#dotGlow)">
          <animateMotion
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
            path={`M ${startX} ${startY} L ${CENTER.x} ${CENTER.y}`}
          />
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.1;0.9;1"
            dur={`${duration}s`}
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}

function NewImage() {
  return (
    <section className="w-full bg-white px-8 py-16 md:px-10 lg:px-16">
      <div className="mx-auto w-full max-w-[1400px]">
        <div
          className="
            relative
            h-[420px]
            w-full
            overflow-hidden
            rounded-[20px]
            bg-[#081a32]
            shadow-[0_25px_80px_rgba(15,23,42,0.18)]
            border border-slate-700/30
          "
        >
          {/* Background dots */}
          <div
            className="
              absolute
              inset-0
              opacity-[0.18]
              bg-[radial-gradient(circle,#64748b_1px,transparent_1px)]
              [background-size:18px_18px]
            "
          />

          {/* Header */}
          <div className="absolute left-7 top-6 z-20">
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-semibold text-white">6</span>
              <span className="text-[11px] text-slate-400">of 9 marketplaces connected</span>
            </div>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Connect the rest to bring in their sales, costs and fees
            </p>
          </div>

          {/* Legend */}
          <div className="absolute right-7 top-7 z-20 flex items-center gap-5 text-[9px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-px w-4 bg-slate-500" />
              Connected
            </div>
            <div className="flex items-center gap-2">
              <span className="h-px w-4 border-t border-dashed border-slate-600" />
              Not connected
            </div>
          </div>

          {/* Connection Lines — converging toward the center hub */}
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
            <defs>
              <filter id="dotGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {leftMarkets.map((market, index) => (
              <ConnectionLine key={`left-${market.name}`} side="left" index={index} market={market} />
            ))}
            {rightMarkets.map((market, index) => (
              <ConnectionLine key={`right-${market.name}`} side="right" index={index} market={market} />
            ))}
          </svg>

          {/* Marketplace Nodes */}
          <div className="absolute inset-0 z-10">
            {leftMarkets.map((market) => (
              <MarketplaceNode key={market.name} market={market} side="left" />
            ))}
            {rightMarkets.map((market) => (
              <MarketplaceNode key={market.name} market={market} side="right" />
            ))}
          </div>

          {/* Center Node */}
          <div className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute -inset-7 rounded-full border border-emerald-400/10 animate-center-pulse" />
            <div className="absolute -inset-4 rounded-full border border-emerald-400/20" />
            <div
              className="
                relative
                flex
                h-[92px]
                w-[92px]
                items-center
                justify-center
                rounded-full
                border
                border-emerald-400/40
                bg-[#0b2038]
                shadow-[0_0_35px_rgba(16,185,129,0.15)]
              "
            >
              <div className="absolute inset-[7px] rounded-full border border-emerald-400/20" />
              <div className="relative text-center leading-tight">
                <div className="text-[13px] font-semibold text-slate-200">TrackMy</div>
                <div className="text-[13px] font-semibold text-emerald-400">Profit</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes centerPulse {
          0%, 100% { transform: scale(0.98); opacity: 0.35; }
          50% { transform: scale(1.04); opacity: 0.7; }
        }
        .animate-center-pulse {
          animation: centerPulse 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default NewImage;
