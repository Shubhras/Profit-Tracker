import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Form, Input, Button, message } from 'antd';
import { HiOutlineChartBar } from 'react-icons/hi2';
import { useDispatch, useSelector } from 'react-redux';
import { AuthFormWrap } from './style';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import { register } from '../../../../redux/authentication/actionCreator';

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [checked, setChecked] = useState(false);

  const handleSubmit = useCallback(
    (values) => {
      if (!checked) {
        message.error('You must accept Terms & Conditions before registering.');
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
      };

      console.log('Register Payload:', payload);

      dispatch(
        register(payload, () => {
          message.success('User register successfully!');
          navigate('/auth/login');
        }),
      );
    },
    [dispatch, navigate, checked],
  );

  return (
    <Row justify="center">
      <Col xxl={10} xl={10} md={18} sm={18} xs={24}>
        <AuthFormWrap className="bg-white rounded-md shadow-regular">
          {/* Header */}
          <div className="px-5 py-4 text-center border-b border-gray-200">
            <Link to="/" className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-1">
              Sign Up <HiOutlineChartBar className="text-green-600" size={24} />
              Profit-Tracker
            </Link>
          </div>

          {/* Form */}
          <div className="px-8 py-10">
            <Form name="register" onFinish={handleSubmit} layout="vertical">
              <Row gutter={16}>
                {/* Name */}
                <Col md={12} xs={24}>
                  <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please enter your name' }]}>
                    <Input placeholder="Name" />
                  </Form.Item>
                </Col>

                {/* Business Name */}
                <Col md={12} xs={24}>
                  <Form.Item
                    label="Business Name"
                    name="businessName"
                    rules={[{ required: true, message: 'Please enter business name' }]}
                  >
                    <Input placeholder="Business Name" />
                  </Form.Item>
                </Col>

                {/* Email */}
                <Col md={12} xs={24}>
                  <Form.Item
                    label="Email Id"
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Enter valid email' }]}
                  >
                    <Input placeholder="Email Id" />
                  </Form.Item>
                </Col>

                {/* Mobile */}
                <Col md={12} xs={24}>
                  <Form.Item
                    label="Mobile Number"
                    name="mobile"
                    rules={[{ required: true, message: 'Please enter mobile number' }]}
                  >
                    <Input placeholder="Mobile Number" />
                  </Form.Item>
                </Col>

                {/* Password */}
                <Col md={12} xs={24}>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter password' }]}
                  >
                    <Input.Password placeholder="Password" />
                  </Form.Item>
                </Col>

                {/* Confirm Password */}
                <Col md={12} xs={24}>
                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Please confirm password' },
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
                    <Input.Password placeholder="Confirm Password" />
                  </Form.Item>
                </Col>

                {/* GST (Optional) */}
                <Col md={12} xs={24}>
                  <Form.Item label="GST Number (Optional)" name="gst">
                    <Input placeholder="GST Number" />
                  </Form.Item>
                </Col>

                {/* Address */}
                <Col md={12} xs={24}>
                  <Form.Item
                    label="Address"
                    name="address"
                    rules={[{ required: true, message: 'Please enter address' }]}
                  >
                    <Input placeholder="Address" />
                  </Form.Item>
                </Col>

                {/* City */}
                <Col md={12} xs={24}>
                  <Form.Item label="City" name="city" rules={[{ required: true, message: 'Please enter city' }]}>
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>

                {/* State */}
                <Col md={12} xs={24}>
                  <Form.Item label="State" name="state" rules={[{ required: true, message: 'Please enter state' }]}>
                    <Input placeholder="State" />
                  </Form.Item>
                </Col>

                {/* Pin Code */}
                <Col md={12} xs={24}>
                  <Form.Item
                    label="Pin code"
                    name="pincode"
                    rules={[{ required: true, message: 'Please enter pin code' }]}
                  >
                    <Input placeholder="Pin code" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Terms Checkbox */}
              <div className="flex items-center justify-between mt-2">
                <Checkbox checked={checked} onChange={(value) => setChecked(value)}>
                  Accept Terms & Conditions
                </Checkbox>
              </div>
              {error && <p style={{ color: 'red' }}>{error}</p>}
              {/* Register Button */}
              <Form.Item>
                <Button
                  className="w-full h-12 mt-6 text-sm font-medium bg-[linear-gradient(111deg,#22C55E_18%,#10B981_100%)] text-white"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  disabled={!checked} // ✅ Disable button until checked
                >
                  REGISTER
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Footer */}
          <div className="p-6 text-center bg-gray-100 rounded-b-md">
            <p className="mb-0 text-sm font-medium">
              Already have an account?
              <Link to="/auth/login" className="ml-1.5 text-primary">
                Sign In
              </Link>
            </p>
          </div>
        </AuthFormWrap>
      </Col>
    </Row>
  );
}

export default SignUp;
