import React, { useEffect, useRef, useState } from 'react';
// import { FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { HiOutlineMenuAlt3, HiOutlineX } from 'react-icons/hi';

// import { RiLineChartLine } from 'react-icons/ri';
// import { MdTrackChanges } from 'react-icons/md';
// import logo from '../../../../assets/images/home/Profit-Tracker-logo.png';

function Navbar() {
  // const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen]);

  return (
    <header className="w-full bg-white relative z-50">
      <div className="px-[3%]">
        <div className="flex items-center justify-between h-20 text-lg">
          {/* LEFT: LOGO */}
          {/* <img src={logo} alt="Profit-Tracker" className="h-10" /> */}
          {/* MOBILE MENU BUTTON */}
          <div className="flex items-center gap-1">
            <Link className="flex items-center gap-1 cursor-pointer" to="/">
              <HiOutlineChartBar className="text-green-600" size={24} />
              <p className="text-3xl md:text-2xl font-semibold text-gray-900 mb-0">Profit-Tracker</p>
            </Link>
          </div>
          <nav className="flex lg:hidden items-center gap-6">
            {/* Products Dropdown */}
            {/* <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
              <button type="button" className="flex items-center gap-1 text-gray-700 font-medium hover:text-gray-900">
                Products
                <svg className="w-4 h-4 mt-[2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="absolute left-0 top-8 z-50 w-64 bg-white rounded-xl shadow-xl border border-gray-100 ">
                  <Link className="block px-5 py-3 hover:bg-gray-50 text-gray-700 " to="#">
                    Profit Analytics
                  </Link>
                  <Link className="block px-5 py-3 hover:bg-gray-50 text-gray-700 " to="#">
                    Payments Reconciliation
                  </Link>
                  <Link className="block px-5 py-3 hover:bg-gray-50 text-gray-700 " to="#">
                    Inventory Planning
                  </Link>
                </div>
              )}
            </div> */}
            <Link to="/" className="text-gray-700 font-medium hover:text-gray-900">
              Products
            </Link>
            <Link to="/integrations" className="text-gray-700 font-medium hover:text-gray-900">
              Integrations
            </Link>
            <Link to="/pricing" className="text-gray-700 font-medium hover:text-gray-900">
              Pricing
            </Link>
            <Link to="/contact" className="text-gray-700 font-medium hover:text-gray-900">
              Contact
            </Link>
          </nav>

          {/* RIGHT: AUTH */}
          <div className="lg:hidden flex items-center lg:gap-3 gap-6">
            <Link to="/auth/login" className="text-gray-800 font-medium hover:text-gray-900">
              Login
            </Link>

            <Link
              to="/auth/register"
              className="px-5 py-1 rounded-full bg-[linear-gradient(111deg,#22C55E_18%,#10B981_100%)]
             shadow-lg hover:opacity-90 transition text-white font-semibold"
            >
              Sign Up
            </Link>
          </div>
          <button
            type="button"
            ref={buttonRef}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="hidden lg:block text-gray-700 transition-transform duration-200"
          >
            {mobileOpen ? (
              <HiOutlineX className="w-7 h-7 transition-transform duration-200 rotate-90" />
            ) : (
              <HiOutlineMenuAlt3 className="w-7 h-7 transition-transform duration-200" />
            )}
          </button>
        </div>
      </div>
      {/* MOBILE NAV MENU */}
      {mobileOpen && (
        <div
          ref={menuRef}
          className={`hidden lg:block absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-xl
  transform transition-all duration-300 ease-out
  ${mobileOpen ? 'opacity-100 translate-y-0 scale-100 visible' : 'opacity-0 -translate-y-3 scale-95 invisible'}
  `}
        >
          <nav className="flex flex-col px-[5%] py-5 gap-4 text-base">
            <Link to="/" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">
              Products
            </Link>

            <Link to="/integrations" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">
              Integrations
            </Link>

            <Link to="/pricing" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">
              Pricing
            </Link>

            <Link to="/contact" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">
              Contact
            </Link>

            <div className="h-px bg-gray-200 my-2" />

            <Link to="/auth/login" onClick={() => setMobileOpen(false)} className="text-gray-800 font-medium">
              Login
            </Link>

            <Link
              to="/auth/register"
              onClick={() => setMobileOpen(false)}
              className="inline-flex justify-center px-5 py-2 rounded-full
      bg-[linear-gradient(111deg,#22C55E_18%,#10B981_100%)]
      text-white font-semibold"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
