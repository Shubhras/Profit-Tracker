import React, { useState } from 'react';
import {
  DollarOutlined,
  NotificationOutlined,
  BarcodeOutlined,
  AuditOutlined,
  BarChartOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

// Images
import profitImg from '../../../../assets/icons/Dashboard.png';
import advertisingImg from '../../../../assets/icons/advertising.png';
import skuImg from '../../../../assets/icons/convertedProfitTable.png';
import customersImg from '../../../../assets/icons/paymentReconcile.png';
import reportsImg from '../../../../assets/icons/returns.png';
import inventoryImg from '../../../../assets/icons/operations.png';

const features = [
  {
    id: 1,
    title: 'Profit',
    icon: <DollarOutlined />,
    image: profitImg,
  },
  {
    id: 2,
    title: 'Advertising',
    icon: <NotificationOutlined />,
    image: advertisingImg,
  },
  {
    id: 3,
    title: 'SKU',
    icon: <BarcodeOutlined />,
    image: skuImg,
  },

  {
    id: 5,
    title: 'Reconcile',
    icon: <AuditOutlined />,
    image: customersImg,
  },
  {
    id: 6,
    title: 'Returns',
    icon: <BarChartOutlined />,
    image: reportsImg,
  },
  {
    id: 7,
    title: 'Operations',
    icon: <AppstoreOutlined />,
    image: inventoryImg,
  },
];

function FeatureDashboard() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-5">
        {/* Heading */}

        {/* <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900">Everything you need</h2>

          <p className="text-gray-500 mt-4 text-lg">Powerful business features in one dashboard.</p>
        </div> */}

        {/* Top Feature Menu */}

        <div className="flex flex-wrap justify-center gap-7 mb-14">
          {features.map((item) => {
            const active = activeFeature.id === item.id;

            return (
              <button type="button" key={item.id} onClick={() => setActiveFeature(item)} className="group outline-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300

                    ${
                      active
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-500 border border-gray-200 hover:text-emerald-700 hover:border-emerald-300 hover:shadow-md hover:-translate-y-1 shadow-lg'
                    }`}
                  >
                    {item.icon}
                  </div>

                  <span
                    className={`mt-3 text-sm font-medium transition-all

                    ${active ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-900'}`}
                  >
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dashboard Preview */}

        <div className="flex justify-center">
          <div
            className="
            w-full
            max-w-6xl
            bg-white
            rounded-[28px]
            p-3
            shadow-[0_20px_80px_rgba(37,99,235,0.12)]
            border
            border-gray-200
            "
          >
            <img
              src={activeFeature.image}
              alt={activeFeature.title}
              className="
                w-full
                rounded-2xl
                object-cover
                transition-all
                duration-500
              "
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeatureDashboard;
