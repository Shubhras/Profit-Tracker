import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Modal, message } from 'antd';
import { MailOutlined, KeyOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, verifyResetOtp, resetPassword } from '../../../../redux/authentication/actionCreator';

function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Verify OTP, Step 2: Set New Password
  const [userEmail, setUserEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [resetForm] = Form.useForm();

  // Timer effect for Resend OTP
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOTP = (values) => {
    const email = values.email.trim();
    setUserEmail(email);

    dispatch(
      forgotPassword({ email }, () => {
        message.success(`Reset OTP sent to ${email}`);
        setStep(1);
        setModalVisible(true);
        setResendCooldown(60);
      }),
    );
  };

  const handleResendOTP = () => {
    if (resendCooldown > 0 || !userEmail) return;
    dispatch(
      forgotPassword({ email: userEmail }, () => {
        message.success('A new reset OTP has been sent to your email.');
        setResendCooldown(60);
      }),
    );
  };

  const handleVerifyOtp = () => {
    if (!otpValue || otpValue.trim().length !== 6) {
      message.error('Please enter a valid 6-digit OTP.');
      return;
    }

    dispatch(
      verifyResetOtp({ email: userEmail, otp: otpValue.trim() }, (success, msg) => {
        if (success) {
          message.success('OTP verified successfully!');
          setStep(2);
        } else {
          message.error(msg || 'Invalid OTP code.');
        }
      }),
    );
  };

  const handleResetSubmit = (values) => {
    const payload = {
      email: userEmail,
      otp: otpValue.trim(),
      new_password: values.new_password,
    };

    dispatch(
      resetPassword(payload, () => {
        message.success('Password reset successfully! Please sign in with your new password.');
        setModalVisible(false);
        setStep(1);
        setOtpValue('');
        navigate('/auth/login');
      }),
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setStep(1);
    setOtpValue('');
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-500">Enter your registered email address to receive a 6-digit verification OTP</p>
      </div>

      <Form name="forgotPass" onFinish={handleSendOTP} layout="vertical">
        <Form.Item
          label={<span className="font-medium text-gray-700">Email Address</span>}
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Enter a valid email!' },
          ]}
        >
          <Input
            className="rounded-lg py-2.5"
            placeholder="name@example.com"
            prefix={<MailOutlined className="text-gray-400 mr-2" />}
          />
        </Form.Item>

        {error && !modalVisible && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
        )}

        <Form.Item>
          <Button
            className="w-full h-12 text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            htmlType="submit"
            loading={loading}
          >
            Send Reset OTP
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Return to{' '}
        <Link to="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline">
          Sign In
        </Link>
      </div>

      {/* 2-Step OTP Verification & Password Reset Modal */}
      <Modal open={modalVisible} centered width={440} footer={null} closable={false} maskClosable={false}>
        <div className="py-3">
          {step === 1 ? (
            /* STEP 1: VERIFY OTP */
            <div>
              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <KeyOutlined className="text-teal-600 text-2xl" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 text-center mb-1">Verify Reset OTP</h3>
              <p className="text-gray-500 text-sm text-center mb-5">
                We sent a 6-digit OTP code to <br />
                <strong className="text-gray-800">{userEmail}</strong>
              </p>

              <Form layout="vertical">
                <Form.Item label={<span className="font-medium text-gray-700">6-Digit Reset OTP</span>} required>
                  <Input
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    placeholder="Enter 6-Digit OTP"
                    className="text-center text-2xl font-mono tracking-widest rounded-xl py-2.5 border-gray-300 focus:border-teal-500"
                    style={{ letterSpacing: '8px' }}
                  />
                </Form.Item>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs border border-red-100">
                    {error}
                  </div>
                )}

                <Button
                  type="primary"
                  onClick={handleVerifyOtp}
                  loading={loading}
                  className="w-full h-11 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl shadow-md mt-2"
                >
                  Verify OTP
                </Button>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-4 px-1">
                  <Button
                    type="link"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendOTP}
                    className="p-0 text-emerald-600 font-medium disabled:text-gray-400"
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </Button>

                  <Button type="link" onClick={closeModal} className="p-0 text-gray-500 hover:text-gray-700">
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          ) : (
            /* STEP 2: SET NEW PASSWORD */
            <div>
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <LockOutlined className="text-emerald-600 text-2xl" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 text-center mb-1">Set New Password</h3>
              <p className="text-gray-500 text-sm text-center mb-5">
                OTP Verified! Enter your new password below for <br />
                <strong className="text-gray-800">{userEmail}</strong>
              </p>

              <Form form={resetForm} layout="vertical" onFinish={handleResetSubmit}>
                <Form.Item
                  label={<span className="font-medium text-gray-700">New Password</span>}
                  name="new_password"
                  rules={[
                    { required: true, message: 'Please enter new password' },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/,
                      message:
                        'Must be at least 12 characters and include uppercase, lowercase, number, and special character.',
                    },
                  ]}
                >
                  <Input.Password className="rounded-lg py-2" placeholder="New Password" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-gray-700">Confirm New Password</span>}
                  name="confirm_password"
                  dependencies={['new_password']}
                  rules={[
                    { required: true, message: 'Please confirm new password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('new_password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Passwords do not match'));
                      },
                    }),
                  ]}
                >
                  <Input.Password className="rounded-lg py-2" placeholder="Confirm New Password" />
                </Form.Item>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs border border-red-100">
                    {error}
                  </div>
                )}

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-11 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl shadow-md mt-2"
                >
                  Reset Password
                </Button>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-4 px-1">
                  <Button
                    type="link"
                    onClick={() => setStep(1)}
                    className="p-0 text-emerald-600 font-medium hover:underline"
                  >
                    ← Back to OTP
                  </Button>

                  <Button type="link" onClick={closeModal} className="p-0 text-gray-500 hover:text-gray-700">
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default ForgotPassword;
