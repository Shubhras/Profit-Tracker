import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Row, Col, Spin, Modal, Result } from 'antd';
import {
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { PageHeader } from '../../components/page-headers/page-headers';
import { Button } from '../../components/buttons/buttons';
import { createSubscription, verifyPayment, clearPlan } from '../../redux/subscription/actionCreator';

function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication
  const isLoggedIn = useSelector((state) => state.auth.login);

  // Get plan data from location state or redux or sessionStorage
  const planFromState = location.state?.plan;
  const { selectedPlan, loading, error } = useSelector((state) => state.subscription);

  // Try to get plan from sessionStorage if not in state
  const planFromSession = React.useMemo(() => {
    try {
      const stored = sessionStorage.getItem('selectedPlan');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  const plan = planFromState || selectedPlan || planFromSession;

  // Modal states
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  //   const PageRoutes = [
  //     {
  //       path: '/',
  //       breadcrumbName: 'Home',
  //     },
  //     {
  //       path: '/pricing',
  //       breadcrumbName: 'Pricing',
  //     },
  //     {
  //       path: '',
  //       breadcrumbName: 'Checkout',
  //     },
  //   ];

  // Redirect if no plan selected or if not logged in
  useEffect(() => {
    if (!plan) {
      navigate('/pricing');
      return;
    }

    if (!isLoggedIn) {
      // Store plan and redirect to login
      sessionStorage.setItem('selectedPlan', JSON.stringify(plan));
      navigate('/auth/login', { state: { redirectTo: '/checkout', plan } });
    }
  }, [plan, isLoggedIn, navigate]);

  // Load Razorpay script
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

  // Handle Razorpay payment
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
        // Payment successful - verify with backend
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
            // Clear sessionStorage after successful payment
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
        color: '#22C55E',
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

  // Handle subscription creation
  const handleSubscribe = () => {
    if (!plan?.plan_id) {
      console.error('Plan ID not found');
      return;
    }

    setProcessingPayment(true);

    dispatch(
      createSubscription(plan.plan_id, (subscriptionInfo) => {
        // Open Razorpay with the subscription data
        handleRazorpayPayment(subscriptionInfo);
      }),
    );
  };

  // Handle success modal close
  const handleSuccessClose = () => {
    setSuccessModalVisible(false);
    navigate('/admin/profit/summary');
  };

  // Handle cancel modal close
  const handleCancelClose = () => {
    setCancelModalVisible(false);
  };

  // Handle retry payment
  const handleRetryPayment = () => {
    setCancelModalVisible(false);
    handleSubscribe();
  };

  // Handle go back to pricing
  const handleBackToPricing = () => {
    setCancelModalVisible(false);
    navigate('/pricing');
  };

  if (!plan || !isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-green-50">
        <div className="pointer-events-none select-none">
          <div className="fixed -right-[300px] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-green-100/30" />
          <div className="fixed -right-[270px] top-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-green-200/30" />
          <div className="fixed -right-[240px] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-green-200/40" />
          <div className="fixed -right-[210px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-green-300/40" />
          <div className="fixed -right-[180px] top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-green-400/40" />
          <div className="fixed -right-[150px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-green-500/40" />
          <div className="fixed -right-[120px] top-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-green-600/40" />
          <div className="fixed -right-[90px] top-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-green-700/40" />
          <div className="fixed -right-[60px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border border-green-800/40" />
          <div className="fixed -right-[30px] top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full border border-green-900/40" />
        </div>

        <div className="pointer-events-none select-none">
          <div className="fixed -left-[300px] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-green-100/30" />
          <div className="fixed -left-[270px] top-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full border border-green-200/30" />
          <div className="fixed -left-[240px] top-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border border-green-200/40" />
          <div className="fixed -left-[210px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-green-300/40" />
          <div className="fixed -left-[180px] top-1/2 -translate-y-1/2 w-[360px] h-[360px] rounded-full border border-green-400/40" />
          <div className="fixed -left-[150px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-green-500/40" />
          <div className="fixed -left-[120px] top-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-green-600/40" />
          <div className="fixed -left-[90px] top-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-green-700/40" />
          <div className="fixed -left-[60px] top-1/2 -translate-y-1/2 w-[120px] h-[120px] rounded-full border border-green-800/40" />
          <div className="fixed -left-[30px] top-1/2 -translate-y-1/2 w-[60px] h-[60px] rounded-full border border-green-900/40" />
        </div>
        {/* Header */}
        <div className="bg-white dark:bg-dark shadow-sm">
          <div className="px-8 xl:px-[15px] py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <HiOutlineChartBar className="text-green-600" size={28} />
                <span>Profit-Tracker</span>
              </Link>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <LockOutlined />
                <span className="text-sm">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        <PageHeader
          // routes={PageRoutes}
          // title="Complete Your Purchase"
          className="flex justify-between items-center px-8 xl:px-[15px] pt-6 pb-6 bg-transparent sm:flex-col"
        />

        <main className="min-h-[715px] lg:min-h-[580px] bg-transparent px-8 xl:px-[15px] pb-[50px]">
          <div className="max-w-4xl mx-auto">
            <Row gutter={[24, 24]}>
              {/* Order Summary */}
              <Col xs={24} lg={14}>
                <div className="bg-white dark:bg-white10 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                    <h3 className="text-white text-xl font-bold mb-1">Order Summary</h3>
                    <p className="text-emerald-100 text-sm">Review your subscription details</p>
                  </div>

                  <div className="p-6">
                    {/* Plan Info */}
                    <div className="flex items-start justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`inline-block h-8 px-4 py-1.5 text-sm font-medium rounded-full ${
                              plan.badge?.className || 'bg-primary-transparent text-primary'
                            }`}
                          >
                            {plan.badge?.text || plan.name}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.subtitle}</p>
                      </div>
                      <div className="text-right">
                        {plan.price ? (
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            <span className="text-lg text-gray-500">$</span>
                            {plan.title}
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mo</span>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">Free</div>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="py-6 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-gray-900 dark:text-white font-semibold mb-4">What&apos;s included:</h4>
                      <ul className="space-y-3">
                        {plan.features?.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <CheckCircleOutlined className="text-green-500" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Total */}
                    <div className="pt-6">
                      <div className="flex items-center justify-between text-lg">
                        <span className="text-gray-600 dark:text-gray-400">Total (Billed Monthly)</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {plan.price ? `$${plan.title}/mo` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Payment Section */}
              <Col xs={24} lg={10}>
                <div className="bg-white dark:bg-white10 rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                      <CreditCardOutlined className="text-emerald-600 text-xl" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-semibold">Payment</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Secure payment via Razorpay</p>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Subscribe Button */}
                  <Button
                    type="primary"
                    size="large"
                    className="w-full h-14 text-base font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0"
                    onClick={handleSubscribe}
                    loading={loading || processingPayment}
                    disabled={loading || processingPayment}
                  >
                    {loading || processingPayment
                      ? 'Processing...'
                      : `Get ${plan.badge?.text || plan.name} - Subscribe Now`}
                  </Button>

                  {/* Security Badge */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                    <SafetyCertificateOutlined />
                    <span className="text-xs">256-bit SSL Secure Payment</span>
                  </div>

                  {/* Payment Methods */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Accepted Payment Methods
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                        Cards
                      </div>
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                        UPI
                      </div>
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                        NetBanking
                      </div>
                    </div>
                  </div>

                  {/* Money Back Guarantee */}
                  <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircleOutlined className="text-emerald-600 text-lg" />
                      <div>
                        <p className="text-emerald-800 dark:text-emerald-300 font-medium text-sm">
                          30-Day Money Back Guarantee
                        </p>
                        <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                          Not satisfied? Get a full refund within 30 days.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back to Pricing Link */}
                <div className="mt-4 text-center">
                  <Link to="/pricing" className="text-primary hover:underline text-sm">
                    ← Back to pricing plans
                  </Link>
                </div>
              </Col>
            </Row>
          </div>
        </main>
      </div>

      {/* Success Modal */}
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
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
              <CheckCircleOutlined className="text-white text-4xl" />
            </div>
          }
          title={<span className="text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</span>}
          subTitle={
            <span className="text-gray-600 dark:text-gray-400">
              Welcome to {plan?.badge?.text || plan?.name}! Your subscription is now active.
            </span>
          }
          extra={[
            <Button
              key="dashboard"
              type="primary"
              size="large"
              className="w-full h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 border-0 font-semibold"
              onClick={handleSuccessClose}
            >
              Go to Dashboard
            </Button>,
          ]}
        />
      </Modal>

      {/* Cancel/Failed Modal */}
      <Modal
        open={cancelModalVisible}
        onCancel={handleCancelClose}
        footer={null}
        centered
        width={480}
        className="payment-cancel-modal"
      >
        <Result
          status="warning"
          icon={
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <CloseCircleOutlined className="text-white text-4xl" />
            </div>
          }
          title={<span className="text-2xl font-bold text-gray-900 dark:text-white">Payment Cancelled</span>}
          subTitle={
            <span className="text-gray-600 dark:text-gray-400">
              Your payment was not completed. Don&apos;t worry, you can try again or choose a different plan.
            </span>
          }
          extra={[
            <div key="actions" className="flex flex-col gap-3 w-full">
              <Button
                type="primary"
                size="large"
                className="w-full h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 border-0 font-semibold"
                onClick={handleRetryPayment}
                loading={loading}
              >
                Try Again
              </Button>
              <Button
                type="default"
                size="large"
                className="w-full h-12 rounded-lg font-semibold"
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
