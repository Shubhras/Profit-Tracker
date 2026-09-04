import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin, Modal, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { DataService } from '../../config/dataService/dataService';
import {
  createSubscription,
  verifyPayment,
  clearPlan,
  resetSubscription,
} from '../../redux/subscription/actionCreator';

const GST_RATE = 0.18;
const HOME_STATE = 'Madhya Pradesh';

const METHODS = [
  {
    id: 'upi',
    name: 'UPI Autopay',
    tab: 'UPI',
    chips: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'],
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2 4 12l8 10 8-10z" />
      </svg>
    ),
  },
  {
    id: 'card',
    name: 'Credit / Debit card',
    tab: 'Card',
    chips: ['Visa', 'Mastercard', 'RuPay', 'Amex'],
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="5" width="20" height="14" rx="2.5" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: 'nb',
    name: 'Net banking',
    tab: 'Net banking',
    chips: ['HDFC', 'ICICI', 'SBI', 'Axis', '+55 banks'],
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 10h18M5 10v8M19 10v8M9 10v8M15 10v8M2 21h20M12 3 3 8h18z" />
      </svg>
    ),
  },
  {
    id: 'wallet',
    name: 'Wallets',
    tab: 'Wallet',
    chips: ['Paytm', 'PhonePe', 'Amazon Pay'],
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 12V8H6a2 2 0 0 1 0-4h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
      </svg>
    ),
  },
  {
    id: 'emi',
    name: 'EMI & Cardless EMI',
    tab: 'EMI',
    chips: ['Card EMI', 'ZestMoney', 'Axio'],
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    id: 'bank',
    name: 'Bank transfer (NEFT / RTGS)',
    tab: 'Bank transfer',
    chips: ['NEFT', 'RTGS', 'Purchase order'],
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 8h13l-3-3M20 16H7l3 3" />
      </svg>
    ),
  },
];

const STATES = [
  'Madhya Pradesh',
  'Maharashtra',
  'Karnataka',
  'Delhi',
  'Gujarat',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Telangana',
  'West Bengal',
  'Rajasthan',
];

function formatINR(n) {
  return `₹${Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatAddDays(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const day = d.getDate();
  const month = d.toLocaleDateString('en-IN', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

function calculateQuote(price, coupon, stateName) {
  let discount = 0;
  let couponLabel = null;

  if (coupon) {
    if (typeof coupon === 'object') {
      const codeStr = coupon.promocode || coupon.code || '';
      const pType = coupon.promoType;
      const pct = parseFloat(coupon.percentage || 0);
      const amt = parseFloat(coupon.specificAmount || 0);

      if (pType === 'discount' && pct > 0) {
        discount = +(price * (pct / 100)).toFixed(2);
        couponLabel = `${codeStr} — ${pct}% off`;
      } else if (pType === 'fix') {
        if (pct === 100 || amt >= price) {
          discount = price;
          couponLabel = `${codeStr} — 100% off`;
        } else if (amt > 0) {
          discount = Math.min(price, amt);
          couponLabel = `${codeStr} — ₹${discount} off`;
        }
      }
    } else if (typeof coupon === 'string') {
      if (coupon === 'APRO20') {
        discount = +(price * 0.2).toFixed(2);
        couponLabel = 'APRO20 — 20% off';
      } else if (coupon === 'SELLER10') {
        discount = +(price * 0.1).toFixed(2);
        couponLabel = 'SELLER10 — 10% off';
      }
    }
  }

  const taxable = Math.max(0, +(price - discount).toFixed(2));
  const gst = +(taxable * GST_RATE).toFixed(2);
  const isIntra = stateName === HOME_STATE;
  const cgst = +(gst / 2).toFixed(2);
  const sgst = +(gst / 2).toFixed(2);
  const total = +(taxable + gst).toFixed(2);

  return {
    list: price,
    discount,
    couponLabel,
    taxable,
    gst,
    isIntra,
    cgst,
    sgst,
    total,
  };
}

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = useSelector((state) => state.auth.login);
  const userObj = useSelector((state) => state.auth.user);
  const planFromState = location.state?.plan;
  const { selectedPlan, loading, error } = useSelector((state) => state.subscription);

  const planFromSession = React.useMemo(() => {
    try {
      const stored = sessionStorage.getItem('selectedPlan');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const plan = planFromState || selectedPlan || planFromSession;

  const [activeTab, setActiveTab] = useState('upi');
  const [email, setEmail] = useState(userObj?.email || 'letstalk@trackmyprofit.com');
  const [businessName, setBusinessName] = useState(userObj?.name || 'Artisian Roots');
  const [stateOfSupply, setStateOfSupply] = useState('Maharashtra');
  const [gstin, setGstin] = useState('23AABCU9603R1ZX');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!plan) {
      navigate('/pricing');
      return;
    }

    if (!isLoggedIn) {
      sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
      navigate('/auth/login', { state: { redirectTo: '/checkout', plan } });
    }
  }, [plan, isLoggedIn, navigate]);

  useEffect(() => {
    if (error) {
      setProcessingPayment(false);
    }
  }, [error]);

  useEffect(() => {
    return () => {
      dispatch(resetSubscription());
    };
  }, [dispatch]);

  const isStarter =
    plan?.plan_name?.toLowerCase().includes('starter') || plan?.selectedPrice === 0 || plan?.monthly_price === 0;

  const rawPlanName = plan?.plan_name || 'Starter';
  const planTitle = rawPlanName.toLowerCase().endsWith('plan') ? rawPlanName : `${rawPlanName} Plan`;

  const planLineName = rawPlanName.toLowerCase().includes('plan') ? rawPlanName : `${rawPlanName} plan`;

  const basePrice = isStarter ? 0 : plan?.selectedPrice || plan?.monthly_price || 0;
  const quote = calculateQuote(basePrice, appliedCoupon, stateOfSupply);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (subscriptionInfo) => {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      alert('Failed to load payment gateway. Please try again.');
      setProcessingPayment(false);
      return;
    }

    const options = {
      key: subscriptionInfo.razorpay_key,
      name: 'TrackMyProfit',
      description: isStarter ? '7-Day Free Trial Mandate Authorization' : `${planTitle} Subscription (incl. 18% GST)`,
      prefill: {
        name: businessName,
        email,
        contact: '',
      },
      theme: {
        color: '#22C55E',
      },
      handler(response) {
        const paymentData = {
          subscription_id: subscriptionInfo.subscription_id,
          razorpay_order_id: response.razorpay_order_id || subscriptionInfo.order_id,
          razorpay_subscription_id: response.razorpay_subscription_id || subscriptionInfo.razorpay_subscription_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        };

        dispatch(
          verifyPayment(paymentData, () => {
            setProcessingPayment(false);
            setSuccessModalVisible(true);
            dispatch(clearPlan());
            sessionStorage.removeItem('selectedPlan');
          }),
        );
      },
      modal: {
        ondismiss() {
          setProcessingPayment(false);
          setCancelModalVisible(true);
        },
      },
    };

    if (subscriptionInfo.razorpay_subscription_id) {
      options.subscription_id = subscriptionInfo.razorpay_subscription_id;
    } else if (subscriptionInfo.order_id) {
      options.order_id = subscriptionInfo.order_id;
      options.amount = subscriptionInfo.amount_paise;
      options.currency = subscriptionInfo.currency || 'INR';
    }

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleSubscribe = () => {
    if (!plan?.id) {
      return;
    }
    setProcessingPayment(true);
    const couponCodeStr = appliedCoupon
      ? typeof appliedCoupon === 'object'
        ? appliedCoupon.promocode
        : appliedCoupon
      : couponCode;

    dispatch(
      createSubscription(
        {
          plan_id: plan.id,
          billing_cycle: plan.selectedType || 'monthly',
          coupon_code: couponCodeStr,
        },
        (subscriptionInfo) => {
          if (subscriptionInfo.razorpay_subscription_id || subscriptionInfo.order_id) {
            handleRazorpayPayment(subscriptionInfo);
          } else {
            setProcessingPayment(false);
            setSuccessModalVisible(true);
            dispatch(clearPlan());
            sessionStorage.removeItem('selectedPlan');
          }
        },
      ),
    );
  };

  const handleApplyCoupon = async () => {
    if (!couponCode || !couponCode.trim()) {
      setAppliedCoupon(null);
      setCouponMsg({ type: 'error', text: 'Enter a code first.' });
      return;
    }

    const cleanCode = couponCode.trim();
    try {
      const response = await DataService.post('/user/promocodes/validate/', {
        code: cleanCode,
      });

      if (response.data && response.data.status && response.data.data) {
        const promoData = response.data.data;
        setAppliedCoupon(promoData);
        const label =
          promoData.promoType === 'discount'
            ? `${promoData.percentage}% discount`
            : promoData.percentage === 100 || promoData.percentage === '100.00'
            ? '100% discount'
            : `₹${promoData.specificAmount || '0'} discount`;
        setCouponMsg({ type: 'success', text: `Coupon '${promoData.promocode}' applied successfully! (${label})` });
      } else {
        setAppliedCoupon(null);
        setCouponMsg({ type: 'error', text: response.data.message || "That code isn't valid or has expired." });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || "That code isn't valid or has expired.";
      setAppliedCoupon(null);
      setCouponMsg({ type: 'error', text: errMsg });
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalVisible(false);
    navigate('/admin/profit/summary');
  };

  const handleCancelClose = () => {
    setCancelModalVisible(false);
  };

  const handleRetryPayment = () => {
    setCancelModalVisible(false);
    handleSubscribe();
  };

  const handleBackToPricing = () => {
    setCancelModalVisible(false);
    navigate('/pricing');
  };

  if (!plan || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F6F7F6]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        .checkout-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          background: #ffffff;
          color: #0D0F0E;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 15px;
          line-height: 1.55;
        }
        .checkout-split-l {
          background: #F6F7F6;
          border-right: 1px solid #E3E6E4;
          display: flex;
          justify-content: flex-end;
          padding-right: 48px;
        }
        .checkout-split-r {
          display: flex;
          justify-content: flex-start;
          background: #ffffff;
          padding-left: 48px;
        }
        .checkout-pane {
          width: 100%;
          max-width: 660px;
          padding: 48px 0 64px;
          box-sizing: border-box;
        }
        @media (max-width: 1200px) {
          .checkout-split-l {
            padding-right: 24px;
          }
          .checkout-split-r {
            padding-left: 24px;
          }
          .checkout-pane {
            max-width: 580px;
          }
        }
        @media (max-width: 940px) {
          .checkout-container {
            grid-template-columns: 1fr;
            min-height: 0;
          }
          .checkout-split-l {
            border-right: 0;
            border-bottom: 1px solid #E3E6E4;
            justify-content: center;
            padding-right: 0;
          }
          .checkout-split-r {
            justify-content: center;
            padding-left: 0;
          }
          .checkout-pane {
            max-width: 600px;
            padding: 32px 24px 40px;
          }
        }
        .checkout-crumb {
          background: #F0FDF4;
          border: 1.5px solid #BBF7D0;
          border-radius: 24px;
          padding: 8px 18px;
          cursor: pointer;
          color: #15803D;
          font-size: 15px;
          font-weight: 700;
          display: inline-flex;
          gap: 9px;
          align-items: center;
          margin-bottom: 28px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.12);
        }
        .checkout-crumb:hover {
          background: #22C55E;
          color: #ffffff;
          border-color: #22C55E;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.25);
        }
        .checkout-crumb .arrow {
          font-size: 16px;
          font-weight: 800;
        }
        .checkout-crumb .brand-name {
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .checkout-kicker {
          margin: 0;
          color: #5E6461;
          font-size: 15px;
        }
        .checkout-bigprice {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin: 6px 0 30px;
          font-family: "Instrument Sans", Inter, sans-serif;
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -0.035em;
        }
        .checkout-bigprice em {
          font-style: normal;
          font-family: Inter, sans-serif;
          font-size: 14.5px;
          font-weight: 500;
          letter-spacing: 0;
          color: #5E6461;
        }
        .checkout-lines {
          display: grid;
        }
        .checkout-lines .ln {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 13px 0;
          font-size: 14.5px;
          align-items: baseline;
        }
        .checkout-lines .ln + .ln {
          border-top: 1px solid #E3E6E4;
        }
        .checkout-lines .ln .k {
          color: #5E6461;
        }
        .checkout-lines .ln .k b {
          color: #0D0F0E;
          font-weight: 600;
          display: block;
          font-size: 15px;
        }
        .checkout-lines .ln .k small {
          display: block;
          color: #8A908C;
          font-size: 12.5px;
          margin-top: 2px;
        }
        .checkout-lines .ln.indent .k {
          padding-left: 14px;
          font-size: 13px;
        }
        .checkout-lines .ln.credit .v {
          color: #00784D;
        }
        .checkout-lines .ln.grand {
          border-top: 1.5px solid #0D0F0E;
          padding-top: 16px;
          margin-top: 4px;
        }
        .checkout-lines .ln.grand .k {
          color: #0D0F0E;
          font-weight: 600;
          font-size: 15.5px;
        }
        .checkout-lines .ln.grand .v {
          font-family: "Instrument Sans", Inter, sans-serif;
          font-size: 21px;
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        .checkout-coupon {
          display: flex;
          gap: 10px;
          margin-top: 24px;
        }
        .checkout-coupon input {
          flex: 1;
          border: 1px solid #C8CDC9;
          background: #ffffff;
          color: #0D0F0E;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .checkout-coupon button {
          border: 1px solid #C8CDC9;
          background: transparent;
          border-radius: 10px;
          padding: 0 20px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          color: #5E6461;
          transition: all 0.15s ease;
        }
        .checkout-coupon button:hover {
          color: #0D0F0E;
          border-color: #0D0F0E;
        }
        .checkout-rollover-co {
          margin-top: 18px;
          background: #FBF3E3;
          color: #7A5514;
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 13.5px;
          line-height: 1.6;
        }
        .checkout-rollover-co b {
          font-weight: 700;
        }
        .checkout-micro {
          font-size: 12.5px;
          color: #8A908C;
          line-height: 1.65;
          margin: 28px 0 0;
          padding-top: 20px;
          border-top: 1px solid #E3E6E4;
        }
        .checkout-sect-h {
          font-size: 15px;
          font-weight: 700;
          margin: 0 0 14px;
          color: #0D0F0E;
        }
        .checkout-sect-h.mt {
          margin-top: 30px;
        }
        .checkout-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        @media (max-width: 440px) {
          .checkout-tabs {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .checkout-tab {
          border: 1px solid #C8CDC9;
          background: #ffffff;
          border-radius: 12px;
          padding: 13px 8px 11px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          color: #5E6461;
          font-size: 12px;
          font-weight: 600;
          line-height: 1.25;
          text-align: center;
          transition: all 0.13s ease;
        }
        .checkout-tab:hover {
          border-color: #2A2F2C;
          color: #0D0F0E;
        }
        .checkout-tab[aria-pressed="true"] {
          border-color: #22C55E;
          color: #15803D;
          box-shadow: 0 0 0 1.5px #22C55E inset;
          background: #F0FDF4;
        }
        .checkout-stack {
          display: grid;
          gap: 14px;
        }
        .checkout-grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 440px) {
          .checkout-grid2 {
            grid-template-columns: 1fr;
          }
        }
        .checkout-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .checkout-field label {
          font-size: 13px;
          font-weight: 600;
          color: #5E6461;
        }
        .checkout-field .opt {
          font-weight: 400;
          color: #8A908C;
        }
        .checkout-field input,
        .checkout-field select {
          border: 1px solid #C8CDC9;
          background: #ffffff;
          color: #0D0F0E;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14.5px;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }
        .checkout-field input:focus,
        .checkout-field select:focus {
          outline: none;
          border-color: #22C55E;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
        }
        .checkout-hint {
          font-size: 12px;
          color: #8A908C;
          line-height: 1.5;
          margin: 0;
        }
        .checkout-subscribe {
          margin-top: 30px;
          width: 100%;
          border: 0;
          border-radius: 12px;
          padding: 15px 20px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          background: #0D0F0E;
          color: #ffffff;
          transition: all 0.15s ease;
          box-shadow: 0 4px 12px rgba(13, 15, 14, 0.15);
        }
        .checkout-subscribe.starter-btn {
          background: #00BA70;
          color: #0D0F0E;
          border-radius: 14px;
          box-shadow: 0 4px 14px rgba(0, 186, 112, 0.25);
        }
        .checkout-subscribe.starter-btn:hover {
          background: #00A362;
          color: #0D0F0E;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0, 186, 112, 0.35);
        }
        .checkout-subscribe:hover {
          background: #1F2421;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(13, 15, 14, 0.25);
        }
        .checkout-subscribe[disabled] {
          opacity: 0.55;
          cursor: default;
          transform: none;
          box-shadow: none;
        }
        .checkout-legal {
          font-size: 12px;
          color: #8A908C;
          line-height: 1.65;
          margin: 14px 0 0;
        }
      `}</style>

      <div className="checkout-container">
        {/* Left Section */}
        <section className="checkout-split-l">
          <div className="checkout-pane">
            {/* Back Crumb with Highlighted Brand */}
            <button type="button" className="checkout-crumb" onClick={handleBackToPricing}>
              <span className="arrow">←</span>
              <span className="brand-name">TrackMyProfit</span>
            </button>

            <p className="checkout-kicker">
              Subscribe to <strong style={{ color: '#0D0F0E', fontWeight: 700 }}>TrackMyProfit {planTitle}</strong>
            </p>

            {/* Big Price */}
            <div className="checkout-bigprice">
              <span>{formatINR(quote.total)}</span>
              <em>
                {isStarter
                  ? 'total for 7 days of access, taxes included'
                  : plan.selectedType === 'annual'
                  ? 'total per year, taxes included'
                  : 'total per month, taxes included'}
              </em>
            </div>

            {/* Order Lines */}
            <div className="checkout-lines">
              <div className="ln">
                <span className="k">
                  <b>{planLineName}</b>
                  <small>
                    {isStarter
                      ? '30-day term · Unlimited orders'
                      : plan.selectedType === 'annual'
                      ? 'Billed yearly'
                      : 'Billed monthly'}
                  </small>
                </span>
                <span className="v num">{formatINR(quote.list)}</span>
              </div>

              {quote.discount > 0 && (
                <div className="ln credit">
                  <span className="k">{quote.couponLabel}</span>
                  <span className="v num">−{formatINR(quote.discount)}</span>
                </div>
              )}

              <div className="ln">
                <span className="k">Subtotal</span>
                <span className="v num">{formatINR(quote.taxable)}</span>
              </div>

              {quote.isIntra ? (
                <>
                  <div className="ln">
                    <span className="k">GST 18%</span>
                    <span className="v num">{formatINR(quote.gst)}</span>
                  </div>
                  <div className="ln indent">
                    <span className="k">CGST 9%</span>
                    <span className="v num">{formatINR(quote.cgst)}</span>
                  </div>
                  <div className="ln indent">
                    <span className="k">SGST 9%</span>
                    <span className="v num">{formatINR(quote.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="ln">
                  <span className="k">IGST 18%</span>
                  <span className="v num">{formatINR(quote.gst)}</span>
                </div>
              )}

              <div className="ln grand">
                <span className="k">
                  Total due today
                  <small style={{ fontWeight: 400, color: '#8A908C' }}>Plan price plus tax</small>
                </span>
                <span className="v num">{formatINR(quote.total)}</span>
              </div>
            </div>

            {/* Coupon Box */}
            <div className="checkout-coupon">
              <input
                placeholder="Add promotion code"
                aria-label="Promotion code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button type="button" onClick={handleApplyCoupon}>
                Apply
              </button>
            </div>
            {couponMsg && (
              <p
                style={{
                  fontSize: '12px',
                  marginTop: '8px',
                  color: couponMsg.type === 'success' ? '#00784D' : '#B3372A',
                }}
              >
                {couponMsg.text}
              </p>
            )}

            {/* Rollover Box */}
            {isStarter && (
              <>
                <div className="checkout-rollover-co">
                  On <b>{formatAddDays(7)}</b> your subscription moves to <b>Growth</b> — ₹9,999 plus tax,{' '}
                  <b>₹11,798.82 a month</b> in total, charged automatically. We email you 3 days before the due date and
                  again 1 day before. Cancel before that date and nothing further is taken.
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#00784D',
                    marginTop: '10px',
                    background: '#F0FDF4',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #DCFCE7',
                    lineHeight: 1.5,
                  }}
                >
                  💡 <b>UPI Autopay Tip:</b> If scanning the QR code displays an error in your UPI app, enter your{' '}
                  <b>UPI ID</b> (e.g. <code>name@upi</code>) directly or select <b>Cards</b> inside the payment window
                  to receive the Autopay approval request.
                </div>
              </>
            )}

            {/* Micro text */}
            <p className="checkout-micro">
              {isStarter
                ? 'No historical backfill on this plan — tracking starts today. Covers 100 orders across the 30 days on one Amazon integration, and data export stays off until you move to Growth.'
                : 'Renews automatically at the end of each term. We email you 3 days before each charge and again 1 day before.'}
            </p>
          </div>
        </section>

        {/* Right Section */}
        <section className="checkout-split-r">
          <div className="checkout-pane">
            {error && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '12px 14px',
                  backgroundColor: '#FFF2F0',
                  border: '1px solid #FFCCC7',
                  borderRadius: '10px',
                  color: '#B3372A',
                  fontSize: '13px',
                }}
              >
                {error}
              </div>
            )}

            <h2 className="checkout-sect-h">Pay with</h2>

            {/* Payment Method Tabs */}
            <div className="checkout-tabs" role="group" aria-label="Payment method">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="checkout-tab"
                  aria-pressed={m.id === activeTab}
                  onClick={() => setActiveTab(m.id)}
                >
                  {m.icon}
                  <span>{m.tab}</span>
                </button>
              ))}
            </div>

            {/* Billing Details */}
            <h2 className="checkout-sect-h mt">Billing details</h2>

            <div className="checkout-stack">
              <div className="checkout-field">
                <label htmlFor="f-email">Email</label>
                <input
                  id="f-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="f-name">Business name</label>
                <input
                  id="f-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  autoComplete="organization"
                />
              </div>

              <div className="checkout-grid2">
                <div className="checkout-field">
                  <label htmlFor="f-state">State of supply</label>
                  <select id="f-state" value={stateOfSupply} onChange={(e) => setStateOfSupply(e.target.value)}>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="checkout-field">
                  <label htmlFor="f-gstin">
                    GSTIN <span className="opt">optional</span>
                  </label>
                  <input
                    id="f-gstin"
                    placeholder="23AABCU9603R1ZX"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <p className="checkout-hint">
                Add your GSTIN and the 18% GST on this invoice becomes claimable input credit.
              </p>
            </div>

            {/* Subscribe CTA */}
            <button
              type="button"
              className={`checkout-subscribe ${isStarter ? 'starter-btn' : ''}`}
              onClick={handleSubscribe}
              disabled={loading || processingPayment}
            >
              {loading || processingPayment
                ? 'Processing...'
                : isStarter
                ? 'Start Free Trial'
                : `Subscribe · ${formatINR(quote.total)}`}
            </button>

            {/* Legal Notice */}
            <p className="checkout-legal">
              {isStarter
                ? `By subscribing you authorise Apro Store to charge ₹0.00 today and, from ${formatAddDays(
                    7,
                  )}, ₹11,798.82 every month to the same UPI ID, until you cancel. Cancel any time in Settings > Billing.`
                : `By subscribing you authorise Apro Store to charge ${formatINR(quote.total)} today and ${formatINR(
                    quote.total,
                  )} every ${
                    plan.selectedType === 'annual' ? 'year' : 'month'
                  } to the same payment method, until you cancel. Cancel any time in Settings > Billing.`}
            </p>
          </div>
        </section>
      </div>

      {/* Success & Cancel Modals */}
      <Modal open={successModalVisible} onCancel={handleSuccessClose} footer={null} centered width={480}>
        <Result
          status="success"
          icon={
            <div className="w-16 h-16 mx-auto mb-3 bg-[#E6F7EF] rounded-full flex items-center justify-center">
              <CheckCircleOutlined className="text-[#00A76B] text-3xl" />
            </div>
          }
          title={<span className="text-xl font-bold text-[#0D0F0E]">Payment Successful!</span>}
          subTitle={
            <span className="text-gray-500 text-sm">Welcome to {planTitle}! Your subscription is now active.</span>
          }
          extra={[
            <button
              key="dashboard"
              type="button"
              className="w-full py-3 px-4 rounded-[10px] border-0 font-bold bg-[#00A76B] text-white text-sm cursor-pointer hover:bg-[#00784D] transition-colors"
              onClick={handleSuccessClose}
            >
              Go to Dashboard
            </button>,
          ]}
        />
      </Modal>

      <Modal open={cancelModalVisible} onCancel={handleCancelClose} footer={null} centered width={480}>
        <Result
          status="warning"
          icon={
            <div className="w-16 h-16 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
              <CloseCircleOutlined className="text-orange-500 text-3xl" />
            </div>
          }
          title={<span className="text-xl font-bold text-[#0D0F0E]">Payment Cancelled</span>}
          subTitle={
            <span className="text-gray-500 text-sm">
              Your payment was not completed. You can try again or choose a different plan.
            </span>
          }
          extra={[
            <div key="actions" className="flex flex-col gap-2.5 w-full">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-[10px] border-0 font-bold bg-[#0D0F0E] text-white text-sm cursor-pointer hover:bg-black transition-colors"
                onClick={handleRetryPayment}
              >
                Try Again
              </button>
              <button
                type="button"
                className="w-full py-3 px-4 rounded-[10px] border border-[#C8CDC9] bg-white font-semibold text-sm text-[#0D0F0E] cursor-pointer hover:border-[#0D0F0E]"
                onClick={handleBackToPricing}
              >
                Choose Different Plan
              </button>
            </div>,
          ]}
        />
      </Modal>
    </>
  );
}

export default Checkout;
