import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Row, Col, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { AuthFormWrap } from './style';
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
    <Row justify="center">
      <Col xxl={8} xl={8} md={12} sm={18} xs={24}>
        <AuthFormWrap className="mt-6 bg-white rounded-md shadow-regular">
          {/* Form */}
          <Form name="resetPass" onFinish={handleSubmit} layout="vertical">
            {/* Header */}
            <div className="px-5 py-4 text-center border-b border-gray-200">
              <h2 className="mb-0 text-xl font-semibold">Reset Password</h2>
            </div>

            {/* Body */}
            <div className="px-10 pt-8 pb-6">
              <p className="mb-4 text-gray-600">Enter your reset token and create a new password.</p>

              {/* Token Field */}
              <Form.Item
                label="Reset Token"
                name="token"
                rules={[{ required: true, message: 'Please enter reset token!' }]}
              >
                <Input placeholder="Enter token here" />
              </Form.Item>

              {/* New Password Field */}
              <Form.Item
                label="New Password"
                name="new_password"
                rules={[
                  { required: true, message: 'Please enter new password!' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>
              {/* ✅ Show Error */}
              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
              {/* Submit Button */}
              <Form.Item>
                <Button
                  className="block w-full h-12 text-sm font-medium bg-[linear-gradient(111deg,#22C55E_18%,#10B981_100%)] text-white"
                  htmlType="submit"
                  size="large"
                  loading={loading} // ✅ Loader
                >
                  Reset Password
                </Button>
              </Form.Item>
            </div>

            {/* Footer */}
            <div className="p-6 text-center bg-gray-100 rounded-b-md">
              <p className="mb-0 text-sm font-medium">
                Back to
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

export default ResetPassword;
