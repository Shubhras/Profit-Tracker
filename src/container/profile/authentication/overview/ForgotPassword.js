import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { AuthFormWrap } from './style';
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
    <Row justify="center">
      <Col xxl={8} xl={8} md={12} sm={18} xs={24}>
        <AuthFormWrap className="mt-6 bg-white rounded-md shadow-regular">
          {/* Form */}
          <Form name="forgotPass" onFinish={handleSubmit} layout="vertical">
            {/* Header */}
            <div className="px-5 py-4 text-center border-b border-gray-200">
              <h2 className="mb-0 text-xl font-semibold">Forgot Password?</h2>
            </div>

            {/* Body */}
            <div className="px-10 pt-8 pb-6">
              <p className="mb-4 text-gray-600">Enter your email address and we’ll send reset instructions.</p>

              {/* ✅ Show Error */}
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              {/* Email Field */}
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Enter a valid email!' },
                ]}
              >
                <Input placeholder="name@example.com" />
              </Form.Item>

              {/* Submit Button */}
              <Form.Item>
                <Button
                  className="block w-full h-12 text-sm font-medium bg-[linear-gradient(111deg,#22C55E_18%,#10B981_100%)] text-white"
                  htmlType="submit"
                  size="large"
                  loading={loading} // ✅ Loader
                >
                  Send Reset Instructions
                </Button>
              </Form.Item>
            </div>

            {/* Footer */}
            <div className="p-6 text-center bg-gray-100 rounded-b-md">
              <p className="mb-0 text-sm font-medium">
                Return to
                <Link to="/auth/login" className="ml-1.5 text-primary hover:text-primary">
                  Sign In
                </Link>
              </p>
            </div>
          </Form>
        </AuthFormWrap>
      </Col>
    </Row>
  );
}

export default ForgotPassword;
