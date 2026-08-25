import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import { resetPassword } from '../../../../redux/authentication/actionCreator';

function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (values) => {
    const payload = {
      email: values.email.trim(),
      otp: values.otp.trim(),
      new_password: values.new_password,
    };

    dispatch(
      resetPassword(payload, () => {
        message.success('Password reset successfully! Please sign in.');
        navigate('/auth/login');
      }),
    );
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-500">Enter your email, the 6-digit OTP code received, and your new password</p>
      </div>

      <Form name="resetPass" onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label={<span className="font-medium text-gray-700">Email Address</span>}
          name="email"
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Enter a valid email!' },
          ]}
        >
          <Input
            className="rounded-lg py-2"
            placeholder="name@example.com"
            prefix={<MailOutlined className="text-gray-400 mr-2" />}
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">6-Digit Reset OTP Code</span>}
          name="otp"
          rules={[
            { required: true, message: 'Please enter 6-digit OTP!' },
            { pattern: /^[0-9]{6}$/, message: 'OTP must be a 6-digit number' },
          ]}
        >
          <Input
            className="rounded-lg py-2 tracking-widest font-mono text-center text-lg"
            placeholder="123456"
            maxLength={6}
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">New Password</span>}
          name="new_password"
          rules={[
            { required: true, message: 'Please enter new password!' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/,
              message:
                'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.',
            },
          ]}
        >
          <Input.Password className="rounded-lg py-2" placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">Confirm New Password</span>}
          name="confirm_password"
          dependencies={['new_password']}
          rules={[
            { required: true, message: 'Please confirm password!' },
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
          <Input.Password className="rounded-lg py-2" placeholder="Confirm new password" />
        </Form.Item>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
        )}

        <Form.Item>
          <Button
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            htmlType="submit"
            loading={loading}
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Back to{' '}
        <Link to="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;
