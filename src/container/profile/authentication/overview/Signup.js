import React, { useCallback, useState, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Modal, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import { register, sendSignupOTP } from '../../../../redux/authentication/actionCreator';

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [checked, setChecked] = useState(false);

  // OTP Modal State
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = useCallback(
    (values) => {
      if (!checked) {
        message.error('You must accept Terms & Conditions before registering.');
        return;
      }
      if (!captchaToken) {
        message.error('Please verify that you are not a robot.');
        return;
      }

      const payload = {
        name: values.name,
        business_name: values.businessName,
        email: values.email,
        mobile_number: values.mobile,
        gst_number: values.gst || '',
        password: values.password,
        confirm_password: values.confirmPassword,
        address: values.address,
        city: values.city,
        state: values.state,
        pin_code: values.pincode,
        accepted_terms: true,
        captcha_token: captchaToken,
      };

      setPendingPayload(payload);
      setOtpSending(true);

      dispatch(
        sendSignupOTP({ email: values.email }, (success, response) => {
          setOtpSending(false);
          if (success) {
            message.success(response?.message || 'Verification OTP sent to your email.');
            setOtpModalVisible(true);
            setResendCooldown(60);
          } else {
            message.error(response || 'Failed to send verification OTP.');
          }
        }),
      );
    },
    [dispatch, checked, captchaToken],
  );

  const handleVerifyAndRegister = () => {
    if (!otpValue || otpValue.trim().length !== 6) {
      message.error('Please enter a valid 6-digit OTP code.');
      return;
    }

    if (!pendingPayload) {
      message.error('Registration session expired. Please try submitting again.');
      return;
    }

    const finalPayload = {
      ...pendingPayload,
      otp: otpValue.trim(),
    };

    dispatch(
      register(finalPayload, () => {
        message.success('Account created successfully! Please log in.');
        setOtpModalVisible(false);
        navigate('/auth/login');
      }),
    );
  };

  const handleResendOTP = () => {
    if (resendCooldown > 0 || !pendingPayload?.email) return;
    setOtpSending(true);
    dispatch(
      sendSignupOTP({ email: pendingPayload.email }, (success, response) => {
        setOtpSending(false);
        if (success) {
          message.success('A new OTP code has been sent to your email.');
          setResendCooldown(60);
        } else {
          message.error(response || 'Failed to resend OTP.');
        }
      }),
    );
  };

  return (
    <div className="w-full mt-14 min-md:mt-0">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Create Account</h2>
        <p className="text-gray-500">Join TrackMyProfit and start growing today</p>
      </div>

      <Form name="register" onFinish={handleSubmit} layout="vertical">
        <div className="grid grid-cols-1 min-md:grid-cols-2 gap-x-2">
          <Form.Item
            label={<span className="font-medium text-gray-700">Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input className="rounded-lg py-2" placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Business Name</span>}
            name="businessName"
            rules={[{ required: true, message: 'Please enter business name' }]}
          >
            <Input className="rounded-lg py-2" placeholder="Business Name" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Email Address</span>}
            name="email"
            rules={[{ required: true, type: 'email', message: 'Enter valid email' }]}
          >
            <Input className="rounded-lg py-2" placeholder="Email Address" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Mobile Number</span>}
            name="mobile"
            rules={[
              { required: true, message: 'Please enter mobile number' },
              {
                pattern: /^[0-9]{10}$/,
                message: 'Please enter a valid 10-digit mobile number',
              },
            ]}
          >
            <Input
              className="rounded-lg py-2"
              placeholder="Mobile Number"
              maxLength={10}
              inputMode="numeric"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Password</span>}
            name="password"
            rules={[
              {
                required: true,
                message: 'Please enter password',
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/,
                message:
                  'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.',
              },
            ]}
          >
            <Input.Password className="rounded-lg py-2" placeholder="Password" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Confirm Password</span>}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Please confirm password',
              },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/,
                message:
                  'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password className="rounded-lg py-2" placeholder="Confirm Password" />
          </Form.Item>

          <Form.Item label={<span className="font-medium text-gray-700">GST Number (Optional)</span>} name="gst">
            <Input className="rounded-lg py-2" placeholder="GST Number" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Address</span>}
            name="address"
            rules={[{ required: true, message: 'Please enter address' }]}
          >
            <Input className="rounded-lg py-2" placeholder="Address" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">City</span>}
            name="city"
            rules={[{ required: true, message: 'Please enter city' }]}
          >
            <Input className="rounded-lg py-2" placeholder="City" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label={<span className="font-medium text-gray-700">State</span>}
              name="state"
              rules={[{ required: true, message: 'Please enter state' }]}
            >
              <Input className="rounded-lg py-2" placeholder="State" />
            </Form.Item>

            <Form.Item
              label={<span className="font-medium text-gray-700">Pin Code</span>}
              name="pincode"
              rules={[{ required: true, message: 'Please enter pin code' }]}
            >
              <Input className="rounded-lg py-2" placeholder="Pin Code" />
            </Form.Item>
          </div>
        </div>

        <div className="mt-2 mb-6">
          <Checkbox checked={checked} onChange={(value) => setChecked(value)}>
            <span className="text-gray-600">
              I accept the{' '}
              <Link to="/terms" target="_blank" className="text-emerald-600 underline">
                Terms & Conditions
              </Link>
            </span>
          </Checkbox>
        </div>

        <div className="mb-6 flex justify-center">
          <ReCAPTCHA
            sitekey={
              process.env.REACT_APP_MY_CAPTCHA_KEY ||
              process.env.REACT_APP_RECAPTCHA_SITE_KEY ||
              '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
            }
            onChange={(token) => {
              setCaptchaToken(token);
            }}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
        )}

        <Form.Item>
          <Button
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="primary"
            htmlType="submit"
            loading={otpSending}
            disabled={!checked || !captchaToken}
          >
            Create Account
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline">
          Sign In
        </Link>
      </div>

      {/* OTP Verification Modal */}
      <Modal open={otpModalVisible} centered width={420} footer={null} closable={false} maskClosable={false}>
        <div className="py-4 text-center">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailOutlined className="text-teal-600 text-3xl" />
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-1">Verify Email OTP</h3>

          <p className="text-gray-500 text-sm mb-6">
            We sent a 6-digit verification code to <br />
            <strong className="text-gray-800">{pendingPayload?.email}</strong>
          </p>

          <div className="mb-6">
            <Input
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              placeholder="Enter 6-Digit OTP"
              className="text-center text-2xl font-mono tracking-widest rounded-xl py-3 border-gray-300 focus:border-teal-500"
              style={{ letterSpacing: '8px' }}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="primary"
              loading={loading}
              onClick={handleVerifyAndRegister}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl shadow-md"
            >
              Verify & Complete Registration
            </Button>

            <div className="flex items-center justify-between text-xs text-gray-500 px-2 mt-2">
              <Button
                type="link"
                disabled={resendCooldown > 0 || otpSending}
                onClick={handleResendOTP}
                className="p-0 text-emerald-600 font-medium disabled:text-gray-400"
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
              </Button>

              <Button
                type="link"
                onClick={() => {
                  setOtpModalVisible(false);
                  setOtpValue('');
                }}
                className="p-0 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SignUp;
