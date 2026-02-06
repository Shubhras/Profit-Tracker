import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpOutlined } from '@ant-design/icons';

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 300px
      setVisible(window.scrollY > 300);

      // Calculate scroll progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleScrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/40 flex items-center justify-center transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/50 group"
          type="button"
        >
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <motion.circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={163}
              strokeDashoffset={163 - (163 * scrollProgress) / 100}
              transition={{ duration: 0.1 }}
            />
          </svg>

          {/* Arrow Icon */}
          <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowUpOutlined className="text-xl" />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ScrollToTopButton;
