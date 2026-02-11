import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
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
            rules={[{ required: true, message: 'Please enter mobile number' }]}
          >
            <Input className="rounded-lg py-2" placeholder="Mobile Number" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Password</span>}
            name="password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password className="rounded-lg py-2" placeholder="Password" />
          </Form.Item>

          <Form.Item
            label={<span className="font-medium text-gray-700">Confirm Password</span>}
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

        {/* <div className="mt-2 mb-6">
          <Checkbox checked={checked} onChange={(value) => setChecked(value)}>
            <span className="text-gray-600">
              I accept the{' '}
              <a href="/terms" className="text-emerald-600 underline">
                Terms & Conditions
              </a>
            </span>
          </Checkbox>
        </div> */}

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

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
        )}

        <Form.Item>
          <Button
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!checked}
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
    </div>
  );
}

export default SignUp;
