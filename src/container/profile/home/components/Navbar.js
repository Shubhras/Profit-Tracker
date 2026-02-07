import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { Button } from 'antd';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { HiOutlineMenuAlt3, HiOutlineX, HiOutlineUser, HiOutlineLogout } from 'react-icons/hi';
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { logOut } from '../../../../redux/authentication/actionCreator';

const navLinks = [
  { label: 'Integrations', to: '/integrations' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const userDropdownRef = useRef(null);
  const location = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get auth state from Redux
  const isLoggedIn = useSelector((state) => state.auth.login);
  const profile = useSelector((state) => state.auth.profile);

  // Get email from cookie (fallback to profile)
  const userEmail = Cookies.get('userEmail') || profile?.email || '';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Check if link is active
  const isActiveLink = (path) => location.pathname === path;

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
    <motion.header
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white shadow-md'
      }`}
    >
      <div className="px-[3%]">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-20 text-lg">
          {/* LEFT: LOGO */}
          <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-1">
            <Link className="flex items-center gap-2 cursor-pointer" to="/">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <HiOutlineChartBar className="text-white" size={22} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0">TrackMyProfit</p>
            </Link>
          </motion.div>

          {/* CENTER: NAV LINKS */}
          <nav className="flex lg:hidden items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-4 py-2 font-medium transition-colors duration-200 rounded-lg ${
                  isActiveLink(link.to)
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
                {isActiveLink(link.to) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* RIGHT: AUTH */}
          <div className="lg:hidden flex items-center gap-3">
            {isLoggedIn ? (
              // Logged in - show user dropdown
              <div className="relative" ref={userDropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition border border-gray-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-base">
                    {getInitials()}
                  </div>
                  <span className="text-gray-800 font-medium hidden sm:block capitalize">{getDisplayName()}</span>
                  <motion.svg
                    animate={{ rotate: userDropdownOpen ? 180 : 0 }}
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-14 z-50 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                        <p className="text-base font-semibold text-gray-900 mb-0 capitalize">{getDisplayName()}</p>
                        <p className="text-sm text-gray-500 mb-0 truncate">{userEmail}</p>
                      </div>
                      {/* Only show Dashboard link if user has subscription */}
                      <Link
                        to="/admin/profit/summary"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <HiOutlineUser className="w-5 h-5 text-gray-400" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <HiOutlineLogout className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Not logged in - show login/signup
              <div className="flex items-center gap-3">
                <Link to="/auth/login">
                  <Button
                    type="text"
                    icon={<LoginOutlined />}
                    className="h-10 px-5 font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    className="h-10 px-5 font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            ref={buttonRef}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="hidden lg:flex w-10 h-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiOutlineX className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <HiOutlineMenuAlt3 className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* MOBILE NAV MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-2xl overflow-hidden"
          >
            <nav className="flex flex-col px-[5%] py-6 gap-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 px-4 rounded-xl font-medium transition-colors ${
                      isActiveLink(link.to) ? 'text-emerald-600 bg-emerald-50' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="h-px bg-gray-200 my-3" />

              {isLoggedIn ? (
                // Mobile: Logged in state
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 py-3 px-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-lg">
                      {getInitials()}
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold mb-0 capitalize">{getDisplayName()}</p>
                      <p className="text-gray-500 text-sm mb-0">{userEmail}</p>
                    </div>
                  </motion.div>
                  {/* Only show Dashboard link if user has subscription */}

                  <Link
                    to="/admin/profit/summary"
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 px-4 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="text-left py-3 px-4 rounded-xl text-red-600 font-medium hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Mobile: Not logged in state
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="flex flex-col gap-3 mt-2"
                >
                  <Link to="/auth/login" onClick={() => setMobileOpen(false)}>
                    <Button block size="large" icon={<LoginOutlined />} className="h-12 font-medium rounded-xl">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth/register" onClick={() => setMobileOpen(false)}>
                    <Button
                      block
                      type="primary"
                      size="large"
                      icon={<UserAddOutlined />}
                      className="h-12 font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-x "
                    >
                      Sign Up
                    </Button>
                  </Link>
                </motion.div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;
