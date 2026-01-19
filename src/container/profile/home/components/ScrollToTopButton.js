import React, { useEffect, useState } from 'react';
import { FiChevronUp } from 'react-icons/fi';

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 300px
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="
        fixed bottom-6 right-6 z-50
        p-1 rounded-md
        bg-[#22C55E] hover:bg-[#169e48]
        text-white shadow-lg
        flex items-center justify-center
        transition-all duration-300
        animate-slide-up
      "
    >
      <FiChevronUp size={30} />
    </button>
  );
}

export default ScrollToTopButton;
