import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { HiOutlineMenuAlt3, HiOutlineX, HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';
import { logOut } from '../../../../redux/authentication/actionCreator';

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const userDropdownRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux
  const isLoggedIn = useSelector((state) => state.auth.login);
  const hasSubscription = useSelector((state) => state.auth.hasSubscription);
  const profile = useSelector((state) => state.auth.profile);

  // Get email from cookie (fallback to profile)
  const userEmail = Cookies.get('userEmail') || profile?.email || '';

  // Handle logout
  const handleLogout = () => {
    dispatch(
      logOut(() => {
        setUserDropdownOpen(false);
        navigate('/');
      }),
    );
  };

  // Get display name from email (extract part before @)
  const getDisplayName = () => {
    if (userEmail) {
      return userEmail.split('@')[0];
    }
    if (profile?.name) return profile.name;
    if (profile?.first_name) return `${profile.first_name} ${profile.last_name || ''}`.trim();
    return 'User';
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = getDisplayName();
    return name.substring(0, 2).toUpperCase();
  };

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
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    if (mobileOpen || userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen, userDropdownOpen]);

  return (
    <header className="w-full bg-white relative z-50  shadow-md">
      <div className="px-[3%]">
        <div className="flex items-center justify-between h-20 text-lg">
          {/* LEFT: LOGO */}
          <div className="flex items-center gap-1">
            <Link className="flex items-center gap-1 cursor-pointer" to="/">
              <HiOutlineChartBar className="text-green-600" size={24} />
              <p className="text-3xl md:text-2xl font-semibold text-gray-900 mb-0">Profit-Tracker</p>
            </Link>
          </div>
          <nav className="flex lg:hidden items-center gap-6">
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
            {isLoggedIn ? (
              // Logged in - show user dropdown
              <div className="relative" ref={userDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials()}
                  </div>
                  <span className="text-gray-800 font-medium hidden sm:block">{getDisplayName()}</span>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 mb-0">{getDisplayName()}</p>
                      <p className="text-xs text-gray-500 mb-0">{userEmail}</p>
                    </div>
                    {/* Only show Dashboard link if user has subscription */}
                    {hasSubscription && (
                      <Link
                        to="/admin/profit/summary"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                      >
                        <HiOutlineUser className="w-4 h-4" />
                        Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      <HiOutlineLogout className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Not logged in - show login/signup
              <>
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
              </>
            )}
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
            {/* <Link to="/" onClick={() => setMobileOpen(false)} className="text-gray-700 font-medium">
              Products
            </Link> */}

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

            {isLoggedIn ? (
              // Mobile: Logged in state
              <>
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
                    {getInitials()}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium mb-0">{getDisplayName()}</p>
                    <p className="text-gray-500 text-sm mb-0">{userEmail}</p>
                  </div>
                </div>
                {/* Only show Dashboard link if user has subscription */}
                {hasSubscription && (
                  <Link
                    to="/admin/profit/summary"
                    onClick={() => setMobileOpen(false)}
                    className="text-gray-700 font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="text-left text-red-600 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              // Mobile: Not logged in state
              <>
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
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
