import React from 'react';
import { FaLinkedinIn, FaPhoneAlt } from 'react-icons/fa';
import { SiGmail } from 'react-icons/si';
import PropTypes from 'prop-types';

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-black via-[#07070b] to-black text-white relative">
      {/* Top Section */}
      <div className="px-[3%] py-10">
        <div className="text-sm mb-5">
          Profit-Tracker AI-powered finance copilot for eCommerce and retail brands — delivering SKU-level profit
          intelligence, automated payment recovery, and inventory forecasting
        </div>
        <div className="grid grid-cols-4 md:grid-cols-1 gap-12">
          {/* Description */}

          {/* Column 1 */}
          <div className="space-y-3 text-sm">
            <p className="hover:text-white cursor-pointer">Products</p>
            <p className="hover:text-white cursor-pointer">Integrations</p>
            <p className="hover:text-white cursor-pointer">Pricing</p>
          </div>

          {/* Column 2 */}
          <div className="space-y-3 text-sm">
            <p className="hover:text-white cursor-pointer">Career</p>
            <p className="hover:text-white cursor-pointer">Contact Us</p>
            <p className="hover:text-white cursor-pointer">Resources</p>
          </div>

          {/* Column 3 */}
          <div className="space-y-3 text-sm">
            <p className="hover:text-white cursor-pointer">Privacy Policy</p>
            <p className="hover:text-white cursor-pointer">Terms & Conditions</p>
            <p className="hover:text-white cursor-pointer">Solutions For Amazon Sellers</p>
          </div>

          <div className="flex justify-end items-end gap-4 mt-10">
            <SocialIcon>
              <FaLinkedinIn size={16} />
            </SocialIcon>
            <SocialIcon>
              <FaPhoneAlt size={16} />
            </SocialIcon>
            <SocialIcon>
              <SiGmail size={16} />
            </SocialIcon>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/30">
        <div className="w-full px-[3%] py-6 flex justify-end items-center text-sm text-gray-300">
          <span>Copyright © 2026 Profit-Tracker.in. All rights reserved</span>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Small reusable icon wrapper ---------- */
function SocialIcon({ children }) {
  return (
    <div className="w-9 h-9 bg-white rounded flex items-center justify-center text-black cursor-pointer hover:scale-105 transition">
      {children}
    </div>
  );
}
SocialIcon.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Footer;
