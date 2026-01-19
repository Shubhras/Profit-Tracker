import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

function ImpactStats() {
  const sectionRef = useRef(null);
  const [start, setStart] = useState(false);

  const stats = [
    {
      value: 1.5,
      suffix: '%',
      label: 'Growth in profit margin',
      gradient: 'from-purple-400 to-blue-400',
      decimals: 1,
    },
    {
      value: 12,
      prefix: '₹',
      suffix: 'Cr+',
      label: 'Recovered in overlooked adjustments',
      gradient: 'from-purple-400 to-green-400',
    },
    {
      value: 84,
      suffix: '%',
      label: 'Faster reconciliation times',
      gradient: 'from-teal-400 to-blue-400',
    },
    {
      value: 19,
      suffix: '%',
      label: 'Improvement in working capital efficiency',
      gradient: 'from-teal-400 to-blue-400',
    },
  ];

  // Start animation only when section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="px-[3%] py-20 lg:py-10">
      <section
        ref={sectionRef}
        className="relative rounded-[40px] py-16
bg-[radial-gradient(circle_at_top,#22C55E,transparent_60%),linear-gradient(135deg,#0a0f2c,#0f3d2e,#050814)]
      text-white overflow-hidden"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 rounded-full border-2 border-white/90 text-lg mb-8">
            Profit-Tracker&apos;S IMPACT
          </span>
          <h2 className="text-5xl md:text-3xl font-bold text-white/90">In the last 12 months</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 md:grid-cols-1 lg:grid-cols-2 gap-12">
          {stats.map((stat, index) => (
            <StatBlock key={index} {...stat} start={start} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatBlock({ value, label, start, prefix = '', suffix = '', decimals = 0, gradient }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime = null;
    const duration = 1600;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);

      setCount(value * progress);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [start, value]);

  return (
    <div className="text-center">
      <div
        className={`text-6xl md:text-5xl font-extrabold mb-4
        bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
      >
        {prefix}
        {count.toFixed(decimals)}
        {suffix}
      </div>
      <p className="text-gray-300 text-xl max-w-xs mx-auto">{label}</p>
    </div>
  );
}

StatBlock.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  start: PropTypes.bool,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  decimals: PropTypes.number,
  gradient: PropTypes.string,
};

export default ImpactStats;
