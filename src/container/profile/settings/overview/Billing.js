import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { Skeleton, Modal, Tag, Alert, Button } from 'antd';
import {
  // CreditCardOutlined, // Removed as per new design
  // CalendarOutlined,
  // CheckCircleOutlined,
  // CloseCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import UilBill from '@iconscout/react-unicons/icons/uil-bill';
// import { Button } from '../../../../components/buttons/buttons'; // Removed as Ant Design Button is used directly
// import Heading from '../../../../components/heading/heading'; // Removed as per new design
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

  // const getPlanName = () => subscription?.history?.[0]?.line_items?.[0]?.name || 'Subscription Plan';

  // const getPlanPrice = () => {
  //   if (subscription?.history?.[0]?.amount) {
  //     const currencySymbol = subscription.history[0].currency_symbol || '₹';
  //     return formatAmount(subscription.history[0].amount, currencySymbol);
  //   }
  //   return 'N/A';
  // };

  // const getNextBillingDate = () =>
  //   subscription?.history?.[0]?.billing_end ? formatDate(subscription.history[0].billing_end) : 'N/A';

  // const getPaymentMethod = () => subscription?.history?.[0]?.customer_details?.customer_email || 'N/A';

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
      <div className="w-full mx-auto bg-white dark:bg-[#202531] rounded-[24px] shadow-xl p-8 mb-8 border border-slate-100 dark:border-white/5">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full mx-auto bg-white dark:bg-[#202531] rounded-[24px] shadow-xl p-8 mb-8 border border-slate-100 dark:border-white/5">
        <Alert
          message="Error Loading Subscription"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" type="primary" onClick={fetchSubscription}>
              <ReloadOutlined /> Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl mx-auto">
      <div className="bg-white dark:bg-[#202531] shadow-xl overflow-hidden border border-slate-100 dark:border-white/5 mb-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/10 px-8 py-6 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center shadow-sm text-primary">
              <UilBill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white m-0">Billing & Subscription</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm m-0">Manage your plan and billing details</p>
            </div>
          </div>
          {subscription?.status === 'active' && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full border border-emerald-200 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
            </span>
          )}
        </div>

        {/* No Subscription State */}
        {!subscription ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
              <UilBill className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Active Subscription</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
              You currently don&apos;t have an active plan. Upgrade now to unlock premium features and limits.
            </p>
            <Button
              type="primary"
              size="large"
              onClick={handleUpgrade}
              className="h-12 px-8 rounded-xl font-bold bg-primary shadow-lg shadow-primary/30 border-0"
            >
              View Pricing Plans
            </Button>
          </div>
        ) : (
          <div className="p-6">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 min-lg:grid-cols-3 gap-6 mb-3">
              {/* Current Plan Card */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-6 border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/10 transition-all" />
                <h3 className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Current Plan
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <h2 className="text-3xl font-bold text-slate-800 dark:text-white">₹{subscription?.amount}</h2>
                  <span className="text-slate-400 text-sm font-medium"> / {subscription?.billing_cycle}</span>
                </div>
                <p className="text-primary font-bold text-lg">{subscription?.plan?.plan_name}</p>

                <p className="text-sm text-slate-500 mt-2">{subscription?.plan?.description}</p>

                <div className="flex flex-col gap-3 mt-auto">
                  <Button
                    type="primary"
                    onClick={handleUpgrade}
                    className="w-full h-11 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                  >
                    Upgrade Plan
                  </Button>
                  {subscription?.status === 'active' && (
                    <Button
                      size="large"
                      onClick={() => setCancelModalVisible(true)}
                      className="text-xs  rounded-xl h-12 text-slate-400 hover:text-red-500 transition-colors font-medium"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>

              {/* Usage Limits Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                <h3 className="text-lg font-semibold mb-5">Subscription Details</h3>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Billing Cycle</span>
                    <span className="font-semibold capitalize">{subscription?.billing_cycle}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Status</span>
                    <Tag color={subscription?.status === 'active' ? 'green' : 'orange'}>{subscription?.status}</Tag>
                  </div>

                  <div className="flex justify-between">
                    <span>Payment</span>
                    <Tag color={subscription?.is_paid ? 'green' : 'red'}>
                      {subscription?.is_paid ? 'Paid' : 'Pending'}
                    </Tag>
                  </div>

                  <div className="flex justify-between">
                    <span>Created</span>
                    <span>{formatDate(subscription?.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                <h3 className="text-lg font-semibold mb-5">Terms & Conditions</h3>

                <ul className="space-y-3">
                  {subscription?.plan?.terms_and_conditions?.map((item, index) => (
                    <li key={index} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />

                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Method Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-4">
                <h3 className="text-lg font-semibold mb-5">Features Included</h3>

                <div className="space-y-3">
                  {subscription?.plan?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invoice History */}
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-3">
                {/* <UilHistory className="w-5 h-5 text-slate-400" /> */}
                <h3 className="text-lg font-bold text-slate-800 dark:text-white m-0">Invoice History</h3>
              </div>

              <div className="bg-white dark:bg-[#202531] border border-slate-100 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Plan Name
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {subscription?.history?.length > 0 ? (
                      subscription?.history?.map((invoice, index) => (
                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                            {formatDate(invoice.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-800 dark:text-white font-semibold capitalize">
                            {invoice.billing_cycle}
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-800 dark:text-white font-semibold">
                            {invoice.plan_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-800 dark:text-white font-bold">
                            ₹{invoice.amount}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                invoice.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  invoice.status === 'paid' ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                              />
                              {invoice.status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                          No invoice history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Subscription Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-500">
            <ExclamationCircleOutlined />
            <span className="font-bold">Cancel Subscription</span>
          </div>
        }
        centered
        open={cancelModalVisible}
        onCancel={() => setCancelModalVisible(false)}
        footer={null}
        className="rounded-2xl overflow-hidden"
      >
        <div className="py-4">
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-base">
            Are you sure you want to cancel your subscription? You will start losing features at the end of your billing
            period.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => setCancelModalVisible(false)}
              className="flex-1 h-11 rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Keep Subscription
            </Button>
            <Button
              type="primary"
              danger
              loading={cancelLoading}
              onClick={handleCancelSubscription}
              className="flex-1 h-11 rounded-xl font-semibold bg-red-500 hover:bg-red-600 border-0 shadow-lg shadow-red-500/20"
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Billing;
