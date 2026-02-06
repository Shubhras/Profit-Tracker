import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Spin, Modal, Result } from 'antd';
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  GiftOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { Button } from '../../components/buttons/buttons';
import { createSubscription, verifyPayment, clearPlan } from '../../redux/subscription/actionCreator';

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = useSelector((state) => state.auth.login);
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
      subscription_id: subscriptionInfo.subscription_id,
      name: 'Profit-Tracker',
      description: `${plan?.badge?.text || plan?.name} Subscription`,
      handler(response) {
        const paymentData = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_subscription_id: response.razorpay_subscription_id,
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
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#10B981',
      },
      modal: {
        ondismiss() {
          setProcessingPayment(false);
          setCancelModalVisible(true);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleSubscribe = () => {
    if (!plan?.plan_id) {
      console.error('Plan ID not found');
      return;
    }
    setProcessingPayment(true);
    dispatch(
      createSubscription(plan.plan_id, (subscriptionInfo) => {
        handleRazorpayPayment(subscriptionInfo);
      }),
    );
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-sans pb-20">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 px-[3%]">
          <div className="h-20 max-w-7xl mx-auto flex items-center justify-between">
            <Link className="flex items-center gap-2 cursor-pointer" to="/">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <HiOutlineChartBar className="text-white" size={22} />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-0">Profit-Tracker</p>
            </Link>
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
              <LockOutlined /> SECURE CHECKOUT
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 min-lg:grid-cols-2 min-h-[600px] border border-gray-100">
            {/* Left Column: Summary (Light) */}
            <div className="lg:col-span-5 bg-slate-50 p-8 lg:p-10 text-gray-900 relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-200">
              {/* Background FX - Subtle for light mode */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2" />

              <div className="relative z-10">
                <h2 className="text-lg min-md:text-xl font-medium text-gray-900 mb-8">Order Summary</h2>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-xl min-md:text-2xl font-bold text-gray-500">₹</span>
                  <span className="text-4xl min-md:text-5xl font-extrabold text-gray-900 tracking-tight">
                    {plan.title}
                  </span>
                  <span className="text-gray-500 font-medium">/mo</span>
                </div>
                <div className="inline-block px-3 py-1 rounded-md bg-white text-emerald-600 text-sm font-bold border border-gray-200 shadow-sm mb-8">
                  {plan.badge?.text || `${plan.name} Plan`}
                </div>

                <div className="space-y-4">
                  {plan.features?.slice(0, 5).map((feature, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-600">
                      <CheckCircleOutlined className="text-emerald-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 mt-12 pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{plan.title}</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-4">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-semibold text-gray-900">₹0.00</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-gray-900">Total Due</span>
                  <span className="text-emerald-600">₹{plan.title}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Payment (White) */}
            <div className="lg:col-span-7 p-8 lg:p-12 relative">
              <div className="max-w-md mx-auto h-full flex flex-col justify-center">
                <div className="mb-8">
                  <h2 className="text-xl min-md:text-2xl font-bold text-gray-900 mb-2">Select Payment Method</h2>
                  <p className="text-gray-500 text-sm">Choose how you&apos;d like to pay for your subscription.</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <CloseCircleOutlined className="text-red-500 mt-0.5" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="border-2 border-emerald-500 bg-emerald-50/20 p-5 rounded-xl cursor-pointer relative shadow-sm hover:shadow-md transition-all group">
                    <div className="absolute top-4 right-4 w-5 h-5 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CreditCardOutlined className="text-2xl" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Credit / Debit Card</h4>
                        <p className="text-xs text-gray-500">Secure payment via Razorpay</p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 bg-gray-50 p-5 rounded-xl cursor-not-allowed opacity-60 flex items-center gap-4 grayscale">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">
                      <GiftOutlined className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Gift Card / Voucher</h4>
                      <p className="text-xs text-gray-500">Not available for this plan</p>
                    </div>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  className="w-full h-14 text-lg font-bold rounded-xl 
    bg-gradient-to-r from-emerald-500 to-teal-600 
    border-0 shadow-lg shadow-emerald-500/30 
    hover:shadow-emerald-500/50 
    hover:from-emerald-600 hover:to-teal-700
    flex items-center justify-center gap-2 
    transform transition-all active:scale-[0.99]"
                  onClick={handleSubscribe}
                  loading={loading || processingPayment}
                  disabled={loading || processingPayment}
                >
                  {loading || processingPayment ? (
                    'Processing...'
                  ) : (
                    <>
                      Pay ₹{plan.title} <ArrowLeftOutlined className="rotate-180" />
                    </>
                  )}
                </Button>

                <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
                  <SafetyCertificateOutlined className="text-emerald-500" />
                  <span>Payments are SSL encrypted & secured.</span>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                  <Button
                    type="text"
                    onClick={handleBackToPricing}
                    className="text-gray-500 hover:text-gray-900 font-medium text-sm flex items-center gap-2 mx-auto"
                  >
                    <ArrowLeftOutlined /> Choose a different plan
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Success & Cancel Modals remain unchanged */}
      <Modal
        open={successModalVisible}
        onCancel={handleSuccessClose}
        footer={null}
        centered
        width={480}
        className="payment-success-modal"
      >
        <Result
          status="success"
          icon={
            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircleOutlined className="text-emerald-600 text-4xl" />
            </div>
          }
          title={<span className="text-2xl font-bold text-gray-900">Payment Successful!</span>}
          subTitle={
            <span className="text-gray-500">
              Welcome to {plan?.badge?.text || plan?.name}! Your subscription is now active.
            </span>
          }
          extra={[
            <Button
              key="dashboard"
              type="primary"
              size="large"
              className="w-full h-12 rounded-xl border-0 font-bold bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
              onClick={handleSuccessClose}
            >
              Go to Dashboard
            </Button>,
          ]}
        />
      </Modal>

      <Modal open={cancelModalVisible} onCancel={handleCancelClose} footer={null} centered width={480}>
        <Result
          status="warning"
          icon={
            <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <CloseCircleOutlined className="text-orange-500 text-4xl" />
            </div>
          }
          title={<span className="text-2xl font-bold text-gray-900">Payment Cancelled</span>}
          subTitle={
            <span className="text-gray-500">
              Your payment was not completed. You can try again or choose a different plan.
            </span>
          }
          extra={[
            <div key="actions" className="flex flex-col gap-3 w-full">
              <Button
                type="primary"
                size="large"
                className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all font-bold"
                onClick={handleRetryPayment}
                loading={loading}
              >
                Try Again
              </Button>
              <Button
                type="default"
                size="large"
                className="w-full h-12 rounded-xl font-semibold"
                onClick={handleBackToPricing}
              >
                Choose Different Plan
              </Button>
            </div>,
          ]}
        />
      </Modal>
    </>
  );
}

export default Checkout;
