import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { Row, Col, Skeleton, Modal, Tag, Empty, Alert } from 'antd';
import {
  CreditCardOutlined,
  CalendarOutlined,
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

  // Get status tag color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'expired':
        return 'warning';
      case 'pending':
      case 'created':
        return 'processing';
      default:
        return 'default';
    }
  };

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
            {/* Current Plan Card */}
            <Col xs={24} lg={12}>
              <div className="border border-regular dark:border-white10 rounded-lg p-5 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="text-dark dark:text-white87 text-base font-semibold mb-0 flex items-center gap-2">
                    <CreditCardOutlined className="text-primary" />
                    Current Plan
                  </h5>
                  <Tag color={getStatusColor(subscription?.status)}>{subscription?.status?.toUpperCase() || 'N/A'}</Tag>
                </div>

                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-dark dark:text-white87 mb-1">{getPlanName()}</h3>
                  <p className="text-light dark:text-white60 mb-0">
                    {subscription?.active ? 'Active Subscription' : 'Subscription'}
                  </p>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-body dark:text-white60">
                    <CheckCircleOutlined className="text-success" />
                    <span>
                      {subscription?.users_limit || 1} User{subscription?.users_limit > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-body dark:text-white60">
                    <CheckCircleOutlined className="text-success" />
                    <span>{subscription?.file_space || '100MB'} File Space</span>
                  </div>
                  <div className="flex items-center gap-2 text-body dark:text-white60">
                    <CheckCircleOutlined className="text-success" />
                    <span>{subscription?.active_projects || 2} Active Projects</span>
                  </div>
                  {subscription?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-body dark:text-white60">
                      <CheckCircleOutlined className="text-success" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="primary"
                    className="rounded-md"
                    onClick={() => {
                      window.location.href = '/pricing';
                    }}
                  >
                    Upgrade Plan
                  </Button>
                  {subscription?.status === 'active' && subscription?.active && (
                    <Button type="default" danger className="rounded-md" onClick={() => setCancelModalVisible(true)}>
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              </div>
            </Col>

            {/* Billing Details Card */}
            <Col xs={24} lg={12}>
              <div className="border border-regular dark:border-white10 rounded-lg p-5 h-full">
                <h5 className="text-dark dark:text-white87 text-base font-semibold mb-4 flex items-center gap-2">
                  <CalendarOutlined className="text-primary" />
                  Billing Details
                </h5>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-regular dark:border-white10">
                    <span className="text-light dark:text-white60">Plan Price</span>
                    <span className="text-dark dark:text-white87 font-medium">{getPlanPrice()}/month</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-regular dark:border-white10">
                    <span className="text-light dark:text-white60">Start Date</span>
                    <span className="text-dark dark:text-white87 font-medium">
                      {formatDate(subscription?.created_at)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-regular dark:border-white10">
                    <span className="text-light dark:text-white60">Next Billing Date</span>
                    <span className="text-dark dark:text-white87 font-medium">{getNextBillingDate()}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-regular dark:border-white10">
                    <span className="text-light dark:text-white60">Email</span>
                    <span className="text-dark dark:text-white87 font-medium">{getPaymentMethod()}</span>
                  </div>

                  {subscription?.subscription_id && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-light dark:text-white60">Subscription ID</span>
                      <span className="text-dark dark:text-white87 font-medium text-xs">
                        {subscription?.subscription_id}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Col>

            {/* Payment History Card */}
            <Col xs={24}>
              <div className="border border-regular dark:border-white10 rounded-lg p-5">
                <h5 className="text-dark dark:text-white87 text-base font-semibold mb-4 flex items-center gap-2">
                  <CreditCardOutlined className="text-primary" />
                  Recent Payment History
                </h5>

                {subscription?.history && subscription.history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-regular dark:border-white10">
                          <th className="text-left py-3 px-2 text-light dark:text-white60 font-medium">Date</th>
                          <th className="text-left py-3 px-2 text-light dark:text-white60 font-medium">Description</th>
                          <th className="text-left py-3 px-2 text-light dark:text-white60 font-medium">Amount</th>
                          <th className="text-left py-3 px-2 text-light dark:text-white60 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscription.history.map((invoice, index) => (
                          <tr
                            key={invoice.id || index}
                            className="border-b border-regular dark:border-white10 last:border-b-0"
                          >
                            <td className="py-3 px-2 text-dark dark:text-white87">
                              {formatDate(invoice.paid_at || invoice.created_at)}
                            </td>
                            <td className="py-3 px-2 text-dark dark:text-white87">
                              {invoice.line_items?.[0]?.name || 'Subscription Payment'}
                            </td>
                            <td className="py-3 px-2 text-dark dark:text-white87 font-medium">
                              {formatAmount(invoice.amount_paid || invoice.amount, invoice.currency_symbol)}
                            </td>
                            <td className="py-3 px-2">
                              <Tag color={getStatusColor(invoice.status)}>{invoice.status?.toUpperCase()}</Tag>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-light dark:text-white60 mb-0">No payment history available</p>
                  </div>
                )}
              </div>
            </Col>
          </Row>
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
