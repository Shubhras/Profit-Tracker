import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

// import { AuthFormWrap } from './style';
import { forgotPassword } from '../../../../redux/authentication/actionCreator';

function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Get loading/error from redux
  const { loading, error } = useSelector((state) => state.auth);

  // ✅ Submit Handler
  const handleSubmit = (values) => {
    dispatch(
      forgotPassword(values, () => {
        message.success('Reset link sent successfully!');
        navigate('/auth/resetPassword');
      }),
    );
  };

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Forgot Password?</h2>
        <p className="text-gray-500">Enter your email and we&apos;ll send you reset instructions</p>
      </div>

      <Form name="forgotPass" onFinish={handleSubmit} layout="vertical">
        <Form.Item
          label={<span className="font-medium text-gray-700">Email Address</span>}
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Enter a valid email!' },
          ]}
        >
          <Input className="rounded-lg py-2.5" placeholder="name@example.com" />
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
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Return to{' '}
        <Link to="/auth/login" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default ForgotPassword;
