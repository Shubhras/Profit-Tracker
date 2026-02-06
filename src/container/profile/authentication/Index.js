import { Spin } from 'antd';
import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { FaStar } from 'react-icons/fa';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

const AuthLayout = (WraperContent) => {
  return function () {
    return (
      <div className="min-h-screen w-full flex overflow-hidden bg-white">
        {/* Left Side - Responsive Split (1/2 MD, 2/3 XL) */}
        <div className="hidden min-md:flex min-md:w-1/2 min-xl:w-2/3 h-screen bg-slate-50 relative flex-col justify-between p-10 min-xl:p-18 overflow-hidden sticky top-0">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/40 via-slate-50 to-slate-50" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 text-gray-900 text-2xl font-bold tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <HiOutlineChartBar className="text-white" size={24} />
              </div>
              Profit-Tracker
            </Link>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl mt-12">
            <h1 className="text-4xl min-xl:text-6xl font-bold text-gray-900 leading-tight mb-8 tracking-tight">
              Turn Your Data Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Growth Engines.
              </span>
            </h1>

            {/* Glass Card Quote */}
            <div className="bg-white/80 border border-gray-200 backdrop-blur-md rounded-3xl p-6 min-xl:p-8 max-w-2xl transform transition-transform hover:scale-[1.01] duration-500 shadow-xl shadow-gray-100">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FaStar key={s} className="text-emerald-500 text-sm" />
                ))}
              </div>
              <p className="text-lg min-xl:text-2xl text-gray-700 font-medium leading-relaxed mb-6 font-serif italic">
                &quot;Profit-Tracker completely transformed how we handle reconciliation. We save 40+ hours every single
                week.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/20">
                  <img
                    src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                    alt="CEO"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-gray-900 font-bold mb-0">Sarah Jenkins</h4>
                  <p className="text-emerald-600 text-sm font-medium mb-0">CFO, TechFlow Inc.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Stats similar to Hero */}
          <div className="relative z-10 grid grid-cols-3 gap-8 max-w-2xl mt-auto pt-12 border-t border-gray-200">
            <div>
              <h3 className="text-2xl min-xl:text-3xl font-bold text-gray-900">99.9%</h3>
              <p className="text-gray-500 text-xs min-xl:text-sm mt-1">Uptime SLA</p>
            </div>
            <div>
              <h3 className="text-2xl min-xl:text-3xl font-bold text-gray-900">$1M+</h3>
              <p className="text-gray-500 text-xs min-xl:text-sm mt-1">Transaction Volume</p>
            </div>
            <div>
              <h3 className="text-2xl min-xl:text-3xl font-bold text-gray-900">25+</h3>
              <p className="text-gray-500 text-xs min-xl:text-sm mt-1">Global Companies</p>
            </div>
          </div>
        </div>

        {/* Right Side - Scrollable Form (1/2 MD, 1/3 XL) */}
        <div className="w-full min-md:w-1/2 min-xl:w-1/3 h-screen overflow-y-auto bg-white relative">
          <div className="block min-md:hidden">
            <Navbar />
          </div>
          <div className="min-h-full w-full flex flex-col items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-[400px]">
              {/* Mobile Logo Logo */}
              {/* <div className="lg:hidden mb-10 text-center">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-900 text-2xl font-bold">
                  <HiOutlineChartBar className="text-emerald-600" size={32} />
                  Profit-Tracker
                </Link>
              </div> */}

              {/* Form Wrapper */}
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-60">
                    <Spin size="large" />
                  </div>
                }
              >
                <WraperContent />
              </Suspense>
            </div>
          </div>
          <div className="flex min-md:hidden">
            <Footer />
          </div>
        </div>
      </div>
    );
  };
};

export default AuthLayout;
