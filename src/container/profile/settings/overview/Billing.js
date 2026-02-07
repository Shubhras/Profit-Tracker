import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { Row, Col, Skeleton, Modal, Tag, Empty, Alert } from 'antd';
import {
  CreditCardOutlined,
  // CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button } from '../../../../components/buttons/buttons';
import Heading from '../../../../components/heading/heading';
import { DataService } from '../../../../config/dataService/dataService';
import authActions from '../../../../redux/authentication/actions';

function Billing() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  // Fetch subscription data
  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await DataService.get('/my-subscription/');
      if (response.data.status && response.data.data) {
        setSubscription(response.data.data);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      if (err.response?.status === 404) {
        // No active subscription
        setSubscription(null);
      } else {
        setError(err.response?.data?.message || 'Failed to load subscription details');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  // Cancel subscription handler
  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    try {
      await DataService.post('/cancel-subscription/');
      setCancelModalVisible(false);

      // Update subscription status in cookie and Redux
      Cookies.set('hasSubscription', 'false');
      dispatch(authActions.setHasSubscription(false));

      // Redirect to pricing page since user no longer has subscription
      navigate('/pricing');
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  // Format date from timestamp or ISO string
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    // Handle Unix timestamp (in seconds)
    if (typeof dateValue === 'number') {
      return new Date(dateValue * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    // Handle ISO string
    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format amount from paise to rupees
  const formatAmount = (amountInPaise, currencySymbol = '₹') => {
    if (!amountInPaise && amountInPaise !== 0) return 'N/A';
    const amount = amountInPaise / 100;
    return `${currencySymbol}${amount.toLocaleString('en-IN')}`;
  };

  // Get plan name from subscription history
  const getPlanName = () => {
    if (subscription?.history?.[0]?.line_items?.[0]?.name) {
      return subscription.history[0].line_items[0].name;
    }
    return 'Subscription Plan';
  };

  // Get plan price from history
  const getPlanPrice = () => {
    if (subscription?.history?.[0]?.amount) {
      const currencySymbol = subscription.history[0].currency_symbol || '₹';
      return formatAmount(subscription.history[0].amount, currencySymbol);
    }
    return 'N/A';
  };

  // Get next billing date from history
  const getNextBillingDate = () => {
    if (subscription?.history?.[0]?.billing_end) {
      return formatDate(subscription.history[0].billing_end);
    }
    return 'N/A';
  };

  // Get payment method from history
  const getPaymentMethod = () => {
    if (subscription?.history?.[0]?.customer_details?.customer_email) {
      return subscription.history[0].customer_details.customer_email;
    }
    return 'N/A';
  };

  const handleUpgrade = () => {
    window.location.href = '/pricing';
  };

  // Get status tag color
  // const getStatusColor = (status) => {
  //   switch (status?.toLowerCase()) {
  //     case 'active':
  //     case 'paid':
  //       return 'success';
  //     case 'cancelled':
  //       return 'error';
  //     case 'expired':
  //       return 'warning';
  //     case 'pending':
  //     case 'created':
  //       return 'processing';
  //     default:
  //       return 'default';
  //   }
  // };

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-white dark:bg-white10 m-0 p-0 mb-[25px] rounded-10 relative">
        <div className="py-[18px] px-[25px] text-dark dark:text-white87 font-medium text-[17px] border-regular dark:border-white10 border-b">
          <Heading as="h4" className="mb-0 text-lg font-medium">
            Billing & Subscription
          </Heading>
          <span className="mb-0.5 text-light dark:text-white60 text-13 font-normal">
            Manage your subscription and billing details
          </span>
        </div>
        <div className="p-[25px]">
          <Row gutter={[24, 24]}>
            {/* Current Plan Skeleton */}
            <Col xs={24} lg={12}>
              <div className="border border-regular dark:border-white10 rounded-lg p-5">
                <Skeleton.Button active size="small" style={{ width: 100, marginBottom: 16 }} />
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            </Col>
            {/* Billing Details Skeleton */}
            <Col xs={24} lg={12}>
              <div className="border border-regular dark:border-white10 rounded-lg p-5">
                <Skeleton.Button active size="small" style={{ width: 120, marginBottom: 16 }} />
                <Skeleton active paragraph={{ rows: 4 }} />
              </div>
            </Col>
            {/* Payment History Skeleton */}
            <Col xs={24}>
              <div className="border border-regular dark:border-white10 rounded-lg p-5">
                <Skeleton.Button active size="small" style={{ width: 140, marginBottom: 16 }} />
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-white10 m-0 p-0 mb-[25px] rounded-10 relative">
        <div className="py-[18px] px-[25px] text-dark dark:text-white87 font-medium text-[17px] border-regular dark:border-white10 border-b">
          <Heading as="h4" className="mb-0 text-lg font-medium">
            Billing & Subscription
          </Heading>
        </div>
        <div className="p-[25px]">
          <Alert
            message="Error Loading Subscription"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" type="primary" onClick={fetchSubscription} className="rounded-md">
                <ReloadOutlined /> Retry
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  // No subscription state
  if (!subscription) {
    return (
      <div className="bg-white dark:bg-white10 m-0 p-0 mb-[25px] rounded-10 relative">
        <div className="py-[18px] px-[25px] text-dark dark:text-white87 font-medium text-[17px] border-regular dark:border-white10 border-b">
          <Heading as="h4" className="mb-0 text-lg font-medium">
            Billing & Subscription
          </Heading>
          <span className="mb-0.5 text-light dark:text-white60 text-13 font-normal">
            Manage your subscription and billing details
          </span>
        </div>
        <div className="p-[25px]">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-light dark:text-white60">You don&apos;t have an active subscription</span>
            }
          >
            <Button
              type="primary"
              className="rounded-md"
              onClick={() => {
                window.location.href = '/pricing';
              }}
            >
              View Plans
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  // Active subscription state
  return (
    <>
      <div className="relative space-y-8">
        {/* Section Title */}
        <div className="flex flex-col min-md:flex-row min-md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0">Billing & Subscription</h1>
            <p className="text-gray-500 m-0">Manage your plan, limits, and view payment history.</p>
          </div>

          {subscription?.status === 'active' && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-2 text-sm font-semibold">
              <CheckCircleOutlined /> Active
            </div>
          )}
        </div>

        {/* Main Content Info Cards */}
        <div className="grid grid-cols-1 min-lg:grid-cols-3 gap-6">
          {/* Current Plan - Clean Light Design */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group hover:border-emerald-200 transition-all duration-300">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <div className="w-24 h-24 bg-emerald-500 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-4">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Current Plan</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{getPlanName()}</h2>
                <p className="text-emerald-600 font-medium text-lg">
                  {getPlanPrice()} <span className="text-gray-400 text-sm font-normal">/ month</span>
                </p>
              </div>

              <div className="mt-auto pt-6">
                <Button
                  size="large"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-11 rounded-xl border-none shadow-lg shadow-emerald-600/20"
                  onClick={handleUpgrade}
                >
                  Upgrade Plan
                </Button>
                {subscription?.status === 'active' && (
                  <Button
                    onClick={() => setCancelModalVisible(true)}
                    className="w-full mt-3 text-gray-400 text-xs hover:text-red-500 transition-colors"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Usage Stats - Clean Cards */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
            <h3 className="text-gray-900 font-bold text-lg mb-4">Usage Limits</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Users</span>
                  <span className="text-gray-900 font-bold">{subscription?.users_limit || 1} / 5</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-1/5 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Storage</span>
                  <span className="text-gray-900 font-bold">{subscription?.file_space || '100MB'}</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 w-3/4 rounded-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Projects</span>
                  <span className="text-gray-900 font-bold">{subscription?.active_projects || 2} Active</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 w-1/2 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method - Simple & Clean */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-gray-900 font-bold text-lg m-0">Payment Method</h3>
              <Tag color="blue" className="m-0 rounded-full px-3 border-none bg-blue-50 text-blue-600 font-semibold">
                Primary
              </Tag>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-7 bg-white rounded border border-gray-200 flex items-center justify-center shadow-sm">
                <CreditCardOutlined className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-900 font-bold text-sm m-0">Visa ending in 4242</p>
                <p className="text-gray-500 text-xs m-0">Expires 12/29</p>
              </div>
            </div>

            <div className="mt-auto space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Next Billing</span>
                <span className="text-gray-900 font-medium">{getNextBillingDate()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900 font-medium truncate max-w-[150px]" title={getPaymentMethod()}>
                  {getPaymentMethod()}
                </span>
              </div>
            </div>

            <Button
              type="default"
              className="w-full mt-4 border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 h-10 rounded-xl"
              onClick={() => {}}
            >
              Update Method
            </Button>
          </div>
        </div>

        {/* Transaction History - Minimalist Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 m-0">Invoice History</h3>
            {/* <Button type="link" className="p-0 text-emerald-600 font-medium hover:text-emerald-700">
              View All
            </Button> */}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {/* <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th> */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscription?.history?.map((invoice, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(invoice.paid_at || invoice.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {invoice.line_items?.[0]?.name || 'Pro Plan Subscription'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatAmount(invoice.amount_paid || invoice.amount, invoice.currency_symbol)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            invoice.status === 'paid' ? 'bg-emerald-500' : 'bg-gray-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-medium capitalize ${
                            invoice.status === 'paid' ? 'text-emerald-700' : 'text-gray-600'
                          }`}
                        >
                          {invoice.status || 'Paid'}
                        </span>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 text-right">
                      <Button
                        type="default"
                        size="small"
                        className="border-gray-200 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 rounded-lg px-3"
                      >
                        Download
                      </Button>
                    </td> */}
                  </tr>
                )) || (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <CreditCardOutlined className="text-gray-300 text-xl" />
                        </div>
                        <p>No invoice history found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-warning">
            <ExclamationCircleOutlined />
            Cancel Subscription
          </div>
        }
        centered
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        footer={[
          <Button key="back" type="default" onClick={() => setCancelModalVisible(false)} className="rounded-md">
            Keep Subscription
          </Button>,
          <Button
            key="cancel"
            type="primary"
            danger
            loading={cancelLoading}
            onClick={handleCancelSubscription}
            className="rounded-md"
          >
            Yes, Cancel Subscription
          </Button>,
        ]}
      >
        <div className="py-4">
          <p className="text-body dark:text-white60 mb-4">
            Are you sure you want to cancel your subscription? Here&apos;s what will happen:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-body dark:text-white60">
              <CloseCircleOutlined className="text-danger" />
              Your subscription will end on your next billing date
            </li>
            <li className="flex items-center gap-2 text-body dark:text-white60">
              <CloseCircleOutlined className="text-danger" />
              You will lose access to premium features
            </li>
            <li className="flex items-center gap-2 text-body dark:text-white60">
              <CloseCircleOutlined className="text-danger" />
              Your data will be retained for 30 days
            </li>
          </ul>
        </div>
      </Modal>
    </>
  );
}

export default Billing;
