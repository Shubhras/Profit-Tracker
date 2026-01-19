import React from 'react';
import '../../../../static/css/marque.css';
import aboutSpace from '../../../../assets/images/company-logo/about-sapce-logo.png';
import boldcare from '../../../../assets/images/company-logo/boldcare-logo.png';

const logos = [
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
  aboutSpace,
  boldcare,
];

function Marque() {
  return (
    <div className="w-full overflow-hidden py-10 bg-white">
      <div className="relative">
        <div className="flex gap-12 marquee-track">
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center min-w-[180px] h-20 px-6 bg-white border rounded-xl shadow-sm"
            >
              <img src={logo} alt="brand logo" className="h-10 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Marque;
