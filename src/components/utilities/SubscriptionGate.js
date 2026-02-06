import React, { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { LockOutlined, RocketOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';

function SubscriptionGate({ children, allowFree = false }) {
  const navigate = useNavigate();
  // Check subscription status from multiple sources
  const reduxHasSubscription = useSelector((state) => state.auth.hasSubscription);
  const cookieHasSubscription = Cookies.get('hasSubscription') === 'true';
  const hasSubscription = reduxHasSubscription || cookieHasSubscription;

  // If user has subscription or this component explicitly allows free access, show content
  if (hasSubscription || allowFree) {
    return children;
  }

  // Otherwise, show blurred content with upgrade prompt
  return (
    <div className="relative w-full h-[calc(100vh-140px)] overflow-hidden rounded-xl bg-white/50">
      {/* Blurred Content */}
      <div className="w-full h-full filter blur-md pointer-events-none select-none opacity-50">{children}</div>

      {/* Upgrade Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-gray-100 animate-fade-in-up">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <LockOutlined className="text-3xl text-emerald-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">Upgrade to Unlock</h2>

          <p className="text-gray-500 mb-8 leading-relaxed">
            This feature is available exclusively for premium plan members. Upgrade now to access advanced tools and
            insights.
          </p>

          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            onClick={() => navigate('/pricing')}
            className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionGate;
