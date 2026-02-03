// import { Spin } from 'antd';
// import React, { Suspense } from 'react';
// // import { HiOutlineChartBar } from 'react-icons/hi2';

// const AuthLayout = (WraperContent) => {
//   return function () {
//     return (
//       <Suspense
//         fallback={
//           <div className="spin flex items-center justify-center h-[calc(100vh-132px)]">
//             <Spin />
//           </div>
//         }
//       >
//         <div
//           style={{
//             backgroundImage: 'url("https://images.unsplash.com/photo-1557683316-973673baf926")',
//           }}
//           className="bg-top bg-no-repeat min-h-screen"
//         >
//           <div className="py-20 px-5">
//             {/* <div className="flex justify-center"> */}
//             {/* <img className="dark:hidden" src={require(`../../../static/img/logo_dark.svg`).default} alt="" />
//               <img className="hidden dark:block" src={require(`../../../static/img/logo_white.svg`).default} alt="" /> */}
//             {/* <h1 className="flex items-center gap-1 ">
//                 <HiOutlineChartBar className="text-green-600" size={24} />
//                 <p className="text-2xl font-semibold text-gray-900 mb-0">Profit-Tracker</p>
//               </h1>
//             </div> */}
//             <WraperContent />
//           </div>
//         </div>
//       </Suspense>
//     );
//   };
// };

// export default AuthLayout;
import { Spin } from 'antd';
import React, { Suspense } from 'react';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
// import { HiOutlineChartBar } from 'react-icons/hi2';

const AuthLayout = (WraperContent) => {
  return function () {
    return (
      <>
        <Navbar />
        <Suspense
          fallback={
            <div className="spin flex items-center justify-center h-[calc(100vh-132px)]">
              <Spin />
            </div>
          }
        >
          <div className="relative min-h-screen overflow-hidden bg-white">
            {/* 🌿 Decorative Circles (RIGHT) */}
            {/* Outer Rings */}
            {/* Half Sun Decorative Arcs */}
            <div className="pointer-events-none select-none">
              <div className="absolute -right-[300px] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-green-100/30" />
              <div className="absolute -right-[270px] top-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-green-200/30" />
              <div className="absolute -right-[240px] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-green-200/40" />
              <div className="absolute -right-[210px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-green-300/40" />
              <div className="absolute -right-[180px] top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-green-400/40" />
              <div className="absolute -right-[150px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-green-500/40" />
              <div className="absolute -right-[120px] top-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-green-600/40" />
              <div className="absolute -right-[90px] top-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-green-700/40" />
              <div className="absolute -right-[60px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border border-green-800/40" />
              <div className="absolute -right-[30px] top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full border border-green-900/40" />
            </div>

            <div className="pointer-events-none select-none">
              <div className="absolute -left-[300px] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-green-100/30" />
              <div className="absolute -left-[270px] top-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-green-200/30" />
              <div className="absolute -left-[240px] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-green-200/40" />
              <div className="absolute -left-[210px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-green-300/40" />
              <div className="absolute -left-[180px] top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-green-400/40" />
              <div className="absolute -left-[150px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-green-500/40" />
              <div className="absolute -left-[120px] top-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-green-600/40" />
              <div className="absolute -left-[90px] top-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-green-700/40" />
              <div className="absolute -left-[60px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border border-green-800/40" />
              <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full border border-green-900/40" />
            </div>

            {/* 🔐 Auth Content */}
            <div className="py-20 px-5">
              {/* <div className="flex justify-center"> */}
              {/* <img className="dark:hidden" src={require(`../../../static/img/logo_dark.svg`).default} alt="" />
              <img className="hidden dark:block" src={require(`../../../static/img/logo_white.svg`).default} alt="" /> */}
              {/* <h1 className="flex items-center gap-1 ">
                <HiOutlineChartBar className="text-green-600" size={24} />
                <p className="text-2xl font-semibold text-gray-900 mb-0">Profit-Tracker</p>
              </h1>
            </div> */}
              <WraperContent />
            </div>
          </div>
        </Suspense>
        <Footer />
      </>
    );
  };
};

export default AuthLayout;
