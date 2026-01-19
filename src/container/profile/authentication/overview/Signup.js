import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { ReactSVG } from 'react-svg';
import { Row, Col, Form, Input, Button } from 'antd';
// import UilFacebook from '@iconscout/react-unicons/icons/uil-facebook-f';
// import UilTwitter from '@iconscout/react-unicons/icons/uil-twitter';
// import UilGithub from '@iconscout/react-unicons/icons/uil-github';

import { HiOutlineChartBar } from 'react-icons/hi2';
import { useDispatch } from 'react-redux';
import { AuthFormWrap } from './style';
import { Checkbox } from '../../../../components/checkbox/checkbox';
import { register } from '../../../../redux/authentication/actionCreator';

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [state, setState] = useState({
    values: null,
    checked: null,
  });
  const handleSubmit = useCallback((values) => {
    dispatch(register(values, () => navigate('/auth/login')));
  });

  const onChange = (checked) => {
    setState({ ...state, checked });
  };

  return (
    <Row justify="center">
      <Col xxl={10} xl={10} md={18} sm={18} xs={24}>
        <AuthFormWrap className="bg-white rounded-md dark:bg-white10 shadow-regular dark:shadow-none">
          <div className="px-5 py-4 text-center border-b border-gray-200 dark:border-white10">
            {/* <h2 className="mb-0 text-xl font-semibold text-dark dark:text-white87">Sign Up Profit-Tracker</h2> */}
            <Link to="/" className="text-xl font-semibold text-gray-900 mb-0 flex items-center justify-center gap-1">
              Sign Up <HiOutlineChartBar className="text-green-600" size={24} /> Profit-Tracker
            </Link>
          </div>
          <div className="px-8 py-10">
            <Form name="register" onFinish={handleSubmit} layout="vertical">
              <Row gutter={16}>
                <Col md={12} xs={24}>
                  <Form.Item
                    label="Name"
                    name="name"
                    className="[&>div>div>label]:text-sm [&>div>div>label]:font-medium"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input placeholder="Name" />
                  </Form.Item>
                </Col>

                <Col md={12} xs={24}>
                  <Form.Item
                    label="Business Name"
                    name="businessName"
                    className="[&>div>div>label]:text-sm [&>div>div>label]:font-medium"
                    rules={[{ required: true, message: 'Please enter business name' }]}
                  >
                    <Input placeholder="Business Name" />
                  </Form.Item>
                </Col>

                <Col md={12} xs={24}>
                  <Form.Item
                    label="Email Id"
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Please enter valid email' }]}
                  >
                    <Input placeholder="Email Id" />
                  </Form.Item>
                </Col>

                <Col md={12} xs={24}>
                  <Form.Item
                    label="Mobile Number"
                    name="mobile"
                    rules={[{ required: true, message: 'Please enter mobile number' }]}
                  >
                    <Input placeholder="Mobile Number" />
                  </Form.Item>
                </Col>

                <Col md={12} xs={24}>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please enter password' }]}
                  >
                    <Input.Password placeholder="Password" />
                  </Form.Item>
                </Col>

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

                <Col md={12} xs={24}>
                  <Form.Item label="GST Number" name="gst">
                    <Input placeholder="GST Number" />
                  </Form.Item>
                </Col>

                <Col md={12} xs={24}>
                  <Form.Item label="Address" name="address">
                    <Input placeholder="Address" />
                  </Form.Item>
                </Col>

                <Col md={12} xs={24}>
                  <Form.Item label="City" name="city">
                    <Input placeholder="City" />
                  </Form.Item>
                </Col>

                <Col md={12} xs={24}>
                  <Form.Item label="State" name="state">
                    <Input placeholder="State" />
                  </Form.Item>
                </Col>

                <Col md={12} xs={24}>
                  <Form.Item label="Pin code" name="pincode">
                    <Input placeholder="Pin code" />
                  </Form.Item>
                </Col>
              </Row>

              <div className="flex items-center justify-between mt-2">
                <Checkbox onChange={onChange} checked={state.checked}>
                  Accept Terms & Conditions
                </Checkbox>
              </div>

              <Form.Item>
                <Button
                  className="w-full h-12 mt-6 text-sm font-medium bg-[linear-gradient(111deg,#22C55E_18%,#10B981_100%)] text-white"
                  htmlType="submit"
                  size="large"
                >
                  REGISTER
                </Button>
              </Form.Item>
            </Form>
          </div>
          <div className="p-6 text-center bg-gray-100 dark:bg-white10 rounded-b-md">
            <p className="mb-0 text-sm font-medium text-body dark:text-white60">
              Already have an account?
              <Link to="/auth/login" className="ltr:ml-1.5 rtl:mr-1.5 text-primary hover:text-primary">
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
