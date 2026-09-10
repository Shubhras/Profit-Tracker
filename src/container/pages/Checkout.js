import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin, Modal, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
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
  const userObj = useSelector((state) => state.auth.profile);
  const planFromState = location.state?.plan;
  const growthPlanFromState = location.state?.growthPlan;
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
  const growthPlan = growthPlanFromState || plan?.growthPlan;
  const selectedBillingCycle =
    planFromState?.selectedType || location.state?.selectedType || plan?.selectedType || 'monthly';

  const growthPrice =
    selectedBillingCycle === 'annual' ? Number(growthPlan?.annual_price || 0) : Number(growthPlan?.monthly_price || 0);

  const growthTotal = +(growthPrice * (1 + GST_RATE)).toFixed(2);
  const [activeTab, setActiveTab] = useState('upi');
  // const [email, setEmail] = useState(userObj?.email || 'letstalk@trackmyprofit.com');
  // const [businessName, setBusinessName] = useState(userObj?.name || 'Artisian Roots');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [stateOfSupply, setStateOfSupply] = useState('Madhya Pradesh');
  const [gstin, setGstin] = useState('23AABCU9603R1ZX');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [confirmSubscriptionVisible, setConfirmSubscriptionVisible] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [currentPlanName, setCurrentPlanName] = useState('');
  useEffect(() => {
    if (userObj) {
      setEmail(userObj.email || '');
      setBusinessName(userObj.business_name || '');
    }
  }, [userObj]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchCurrentSubscription = async () => {
      try {
        const response = await DataService.get('/my-subscription/');
        const subscription = response?.data?.data;
        setCurrentPlanName(subscription?.plan?.plan_name || '');
      } catch (err) {
        // A user without an active subscription can continue with a new plan.
        setCurrentPlanName('');
      }
    };

    fetchCurrentSubscription();
  }, [isLoggedIn]);

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
    setConfirmSubscriptionVisible(true);
  };

  const handleConfirmSubscription = () => {
    if (!plan?.id) {
      return;
    }
    setConfirmSubscriptionVisible(false);
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
    handleConfirmSubscription();
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
      <div className="grid grid-cols-2 min-h-screen bg-white text-[#0D0F0E] [font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[15px] leading-[1.55] lg:grid-cols-1 lg:min-h-0">
        {/* Left Section */}
        <section className="bg-[#F6F7F6] border-r border-[#E3E6E4] flex justify-end pr-[14px] xl:pr-6 lg:border-r-0 lg:border-b lg:justify-center lg:pr-0">
          <div className="w-full max-w-[660px] pt-12 pb-16 box-border xl:max-w-[580px] lg:max-w-[600px] lg:pt-8 lg:px-6 lg:pb-10 xs:px-4">
            {/* Back Crumb with Highlighted Brand */}
            <button
              type="button"
              className="bg-[#F0FDF4] border-[1.5px] border-[#BBF7D0] rounded-[24px] px-[18px] py-2 cursor-pointer text-[#15803D] text-[15px] font-bold inline-flex gap-[9px] items-center mb-7 transition-all duration-200 shadow-[0_2px_8px_rgba(34,197,94,0.12)] hover:border-[#22C55E] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(34,197,94,0.25)]"
              onClick={handleBackToPricing}
            >
              <ArrowLeftOutlined className="text-base font-extrabold" />
              <span className="font-extrabold tracking-[-0.01em]">TrackMyProfit</span>
            </button>

            <p className="m-0 text-[#5E6461] text-[15px]">
              Subscribe to <strong className="text-[#0D0F0E] font-bold">TrackMyProfit {planTitle}</strong>
            </p>

            {/* Big Price */}
            <div className="flex flex-wrap items-baseline gap-[10px] mt-[6px] mb-[30px] [font-family:'Instrument_Sans',Inter,sans-serif] text-[40px] font-bold tracking-[-0.035em] sm:text-[32px] xs:text-[26px]">
              <span>{formatINR(quote.total)}</span>
              <em className="not-italic [font-family:Inter,sans-serif] text-[14.5px] font-medium tracking-normal text-[#5E6461]">
                {isStarter
                  ? 'total for 7 days of access, taxes included'
                  : plan.selectedType === 'annual'
                  ? 'total per year, taxes included'
                  : 'total per month, taxes included'}
              </em>
            </div>

            {/* Order Lines */}
            <div className="grid">
              <div className="flex justify-between gap-4 py-[13px] text-[14.5px] items-baseline">
                <span className="text-[#5E6461]">
                  <b className="text-[#0D0F0E] font-semibold block text-[15px]">{planLineName}</b>
                  <small className="block text-[#8A908C] text-[12.5px] mt-0.5">
                    {isStarter
                      ? '30-day term · Unlimited orders'
                      : plan.selectedType === 'annual'
                      ? 'Billed yearly'
                      : 'Billed monthly'}
                  </small>
                </span>
                <span className="font-semibold">{formatINR(quote.list)}</span>
              </div>

              {quote.discount > 0 && (
                <div className="flex justify-between gap-4 py-[13px] text-[14.5px] items-baseline border-t border-[#E3E6E4]">
                  <span className="text-[#5E6461]">{quote.couponLabel}</span>
                  <span className="text-[#00784D]">−{formatINR(quote.discount)}</span>
                </div>
              )}

              <div className="flex justify-between gap-4 py-[13px] text-[14.5px] items-baseline border-t border-[#E3E6E4]">
                <span className="text-[#5E6461]">Subtotal</span>
                <span className="font-semibold">{formatINR(quote.taxable)}</span>
              </div>

              {quote.isIntra ? (
                <>
                  <div className="flex justify-between gap-4 py-[13px] text-[14.5px] items-baseline border-t border-[#E3E6E4]">
                    <span className="text-[#5E6461]">GST 18%</span>
                    <span className="font-semibold">{formatINR(quote.gst)}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-[13px] text-[14.5px] items-baseline border-t border-[#E3E6E4]">
                    <span className="text-[#5E6461] pl-[14px] text-[13px]">CGST 9%</span>
                    <span className="font-semibold">{formatINR(quote.cgst)}</span>
                  </div>
                  <div className="flex justify-between gap-4 py-[13px] text-[14.5px] items-baseline border-t border-[#E3E6E4]">
                    <span className="text-[#5E6461] pl-[14px] text-[13px]">SGST 9%</span>
                    <span className="font-semibold">{formatINR(quote.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between gap-4 py-[13px] text-[14.5px] items-baseline border-t border-[#E3E6E4]">
                  <span className="text-[#5E6461]">IGST 18%</span>
                  <span className="font-semibold">{formatINR(quote.gst)}</span>
                </div>
              )}

              <div className="flex justify-between gap-4 text-[14.5px] items-baseline border-t-[1.5px] border-[#0D0F0E] pt-4 pb-[13px] mt-1">
                <span className="text-[#0D0F0E] font-semibold text-[15.5px]">
                  Total due today <small className="font-normal text-[#8A908C]">Plan price plus tax</small>
                </span>
                <span className="font-bold text-[22px]">{formatINR(quote.total)}</span>
              </div>
            </div>

            {/* Coupon Box */}
            <div className="flex gap-[10px] mt-6 xs:flex-col">
              <input
                className="flex-1 border border-[#C8CDC9] bg-white text-[#0D0F0E] rounded-[10px] px-[14px] py-[11px] text-sm box-border xs:w-full"
                placeholder="Add promotion code"
                aria-label="Promotion code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                type="button"
                className="border border-[#C8CDC9] bg-transparent rounded-[10px] px-5 text-sm font-semibold cursor-pointer text-[#5E6461] transition-all duration-150 hover:text-[#0D0F0E] hover:border-[#0D0F0E] xs:w-full xs:py-[11px]"
                onClick={handleApplyCoupon}
              >
                Apply
              </button>
            </div>
            {couponMsg && (
              <p className={`text-xs mt-2 ${couponMsg.type === 'success' ? 'text-[#00784D]' : 'text-[#B3372A]'}`}>
                {couponMsg.text}
              </p>
            )}

            {/* Rollover Box */}
            {isStarter && (
              <>
                <div className="mt-[18px] bg-[#FBF3E3] text-[#7A5514] rounded-xl px-4 py-[14px] text-[13.5px] leading-[1.6]">
                  On <b>{formatAddDays(7)}</b> your subscription moves to <b>Growth</b> — {formatINR(growthPrice)} plus
                  tax,{' '}
                  <b>
                    {formatINR(growthTotal)} {selectedBillingCycle === 'annual' ? 'a year' : 'a month'} in total
                  </b>{' '}
                  , charged automatically. We email you 3 days before the due date and again 1 day before. Cancel before
                  that date and nothing further is taken.
                </div>
                <div className="text-xs text-[#00784D] mt-[10px] bg-[#F0FDF4] px-3 py-[10px] rounded-lg border border-[#DCFCE7] leading-[1.5]">
                  💡 <b>UPI Autopay Tip:</b> If scanning the QR code displays an error in your UPI app, enter your{' '}
                  <b>UPI ID</b> (e.g. <code>name@upi</code>) directly or select <b>Cards</b> inside the payment window
                  to receive the Autopay approval request.
                </div>
              </>
            )}

            {/* Micro text */}
            <p className="text-[12.5px] text-[#8A908C] leading-[1.65] mt-7 pt-5 border-t border-[#E3E6E4]">
              {isStarter
                ? ''
                : 'Renews automatically at the end of each term. We email you 3 days before each charge and again 1 day before.'}
            </p>
          </div>
        </section>

        {/* Right Section */}
        <section className="flex justify-start bg-white pl-[22px] xl:pl-6 lg:justify-center lg:pl-0">
          <div className="w-full max-w-[660px] pt-12 pb-16 box-border xl:max-w-[580px] lg:max-w-[600px] lg:pt-8 lg:px-6 lg:pb-10 xs:px-4">
            {error && (
              <div className="mb-4 py-3 px-[14px] bg-[#FFF2F0] border border-[#FFCCC7] rounded-[10px] text-[#B3372A] text-[13px]">
                {error}
              </div>
            )}

            <h2 className="text-[15px] font-bold mb-[14px] text-[#0D0F0E]">Pay with</h2>

            {/* Payment Method Tabs */}
            <div
              className="grid grid-cols-3 gap-[10px] ssm:grid-cols-2 xs:grid-cols-1"
              role="group"
              aria-label="Payment method"
            >
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="border border-[#C8CDC9] bg-white rounded-xl px-2 pt-[13px] pb-[11px] flex flex-col items-center gap-[7px] cursor-pointer text-[#5E6461] text-xs font-semibold leading-[1.25] text-center transition-all duration-[130ms] hover:border-[#2A2F2C] hover:text-[#0D0F0E] aria-pressed:border-[#22C55E] aria-pressed:text-[#15803D] aria-pressed:shadow-[0_0_0_1.5px_#22C55E_inset] aria-pressed:bg-[#F0FDF4]"
                  aria-pressed={m.id === activeTab}
                  onClick={() => setActiveTab(m.id)}
                >
                  {m.icon}
                  <span>{m.tab}</span>
                </button>
              ))}
            </div>

            {/* Billing Details */}
            <h2 className="text-[15px] font-bold mb-[14px] text-[#0D0F0E] mt-[30px]">Billing details</h2>

            <div className="grid gap-[14px]">
              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-semibold text-[#5E6461]" htmlFor="f-email">
                  Email
                </label>
                <input
                  className="border border-[#C8CDC9] bg-white text-[#0D0F0E] rounded-[10px] px-[14px] py-3 text-[14.5px] w-full box-border transition-colors duration-150 focus:outline-none focus:border-[#22C55E] focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                  id="f-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="flex flex-col gap-[6px]">
                <label className="text-[13px] font-semibold text-[#5E6461]" htmlFor="f-name">
                  Business name
                </label>
                <input
                  className="border border-[#C8CDC9] bg-white text-[#0D0F0E] rounded-[10px] px-[14px] py-3 text-[14.5px] w-full box-border transition-colors duration-150 focus:outline-none focus:border-[#22C55E] focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                  id="f-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  autoComplete="organization"
                />
              </div>

              <div className="grid grid-cols-2 gap-[14px] ssm:grid-cols-1">
                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-semibold text-[#5E6461]" htmlFor="f-state">
                    State of supply
                  </label>
                  <select
                    className="border border-[#C8CDC9] bg-white text-[#0D0F0E] rounded-[10px] px-[14px] py-3 text-[14.5px] w-full box-border transition-colors duration-150 focus:outline-none focus:border-[#22C55E] focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                    id="f-state"
                    value={stateOfSupply}
                    onChange={(e) => setStateOfSupply(e.target.value)}
                  >
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-[6px]">
                  <label className="text-[13px] font-semibold text-[#5E6461]" htmlFor="f-gstin">
                    GSTIN <span className="font-normal text-[#8A908C]">optional</span>
                  </label>
                  <input
                    className="border border-[#C8CDC9] bg-white text-[#0D0F0E] rounded-[10px] px-[14px] py-3 text-[14.5px] w-full box-border transition-colors duration-150 focus:outline-none focus:border-[#22C55E] focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                    id="f-gstin"
                    placeholder="23AABCU9603R1ZX"
                    maxLength={15}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              <p className="text-xs text-[#8A908C] leading-[1.5] m-0">
                Add your GSTIN and the 18% GST on this invoice becomes claimable input credit.
              </p>
            </div>

            {/* Subscribe CTA */}
            <button
              type="button"
              className={`mt-[30px] w-full border-0 px-5 py-[15px] text-base font-bold cursor-pointer transition-all duration-150 hover:-translate-y-px disabled:opacity-[0.55] disabled:cursor-default disabled:translate-y-0 disabled:shadow-none ${
                isStarter
                  ? 'rounded-[14px] bg-[#00BA70] text-white shadow-[0_4px_14px_rgba(0,186,112,0.25)] hover:bg-[#00A362] hover:text-[#0D0F0E] hover:shadow-[0_6px_18px_rgba(0,186,112,0.35)]'
                  : 'rounded-xl bg-[#0D0F0E] text-white shadow-[0_4px_12px_rgba(13,15,14,0.15)] hover:shadow-[0_6px_16px_rgba(13,15,14,0.25)]'
              }`}
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
            <p className="text-xs text-[#8A908C] leading-[1.65] mt-[14px]">
              {isStarter
                ? `By subscribing you authorise Apro Store to charge ${formatINR(
                    growthPrice,
                  )} today and, from ${formatAddDays(7)}, ${formatINR(growthTotal)} every ${
                    selectedBillingCycle === 'annual' ? 'year' : 'month'
                  } to the same UPI ID, until you cancel. Cancel any time in Settings > Billing.`
                : `By subscribing you authorise Apro Store to charge ${formatINR(quote.total)} today and ${formatINR(
                    quote.total,
                  )} every ${
                    plan.selectedType === 'annual' ? 'year' : 'month'
                  } to the same payment method, until you cancel. Cancel any time in Settings > Billing.`}
            </p>
          </div>
        </section>
      </div>

      {/* Subscription confirmation, success & cancel modals */}
      <Modal
        open={confirmSubscriptionVisible}
        onCancel={() => setConfirmSubscriptionVisible(false)}
        footer={null}
        centered
        width={480}
      >
        <div className="px-2 py-4">
          <h2 className="m-0 text-xl font-bold text-[#0D0F0E]">Confirm subscription change</h2>
          <p className="mt-3 mb-0 text-sm leading-6 text-[#5E6461]">
            Are you sure you want to change from your subscription
            <span className="font-bold text-[#5E6461]"> {currentPlanName || 'No active plan'} Plan </span>
            to
            <span className="font-bold text-[#5E6461]"> {planTitle} </span>?
          </p>
          {/* <p className="mt-2 mb-0 text-sm leading-6 text-[#5E6461]">
            Current plan: <span className="font-semibold text-[#0D0F0E]">{currentPlanName || 'No active plan'}</span>
          </p> */}
          <p className="mt-2 mb-0 text-sm leading-6 text-[#8A4B00]">
            Your current subscription will be made inactive after this change.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-[10px] border border-[#C8CDC9] bg-white px-4 py-2.5 text-sm font-semibold text-[#0D0F0E] cursor-pointer"
              onClick={() => setConfirmSubscriptionVisible(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rounded-[10px] border-0 bg-[#00A76B] px-4 py-2.5 text-sm font-bold text-white cursor-pointer hover:bg-[#00784D]"
              onClick={handleConfirmSubscription}
            >
              Yes, confirm
            </button>
          </div>
        </div>
      </Modal>

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
