import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { resetPassword } from '../../../../redux/authentication/actionCreator';

function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Get loading/error from redux
  const { loading, error } = useSelector((state) => state.auth);

  // ✅ Submit Handler
  const handleSubmit = (values) => {
    dispatch(
      resetPassword(values, () => {
        message.success('Password reset successfully!');
        navigate('/auth/login');
      }),
    );
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-500">Enter your reset token and new password</p>
      </div>

      <Form name="resetPass" onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label={<span className="font-medium text-gray-700">Reset Token</span>}
          name="token"
          rules={[{ required: true, message: 'Please enter reset token!' }]}
        >
          <Input className="rounded-lg py-2.5" placeholder="Enter token here" />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium text-gray-700">New Password</span>}
          name="new_password"
          rules={[
            { required: true, message: 'Please enter new password!' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password className="rounded-lg py-2.5" placeholder="Enter new password" />
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
