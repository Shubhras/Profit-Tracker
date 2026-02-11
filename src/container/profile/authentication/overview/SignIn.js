import React, { useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
// import { ReactSVG } from 'react-svg';
// import UilFacebook from '@iconscout/react-unicons/icons/uil-facebook-f';
// import UilTwitter from '@iconscout/react-unicons/icons/uil-twitter';
// import UilGithub from '@iconscout/react-unicons/icons/uil-github';
// import { Auth0Lock } from 'auth0-lock';
import { login } from '../../../../redux/authentication/actionCreator';
// import { Checkbox } from '../../../../components/checkbox/checkbox';
// import { auth0options } from '../../../../config/auth0';

// const domain = process.env.REACT_APP_AUTH0_DOMAIN;
// const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.loading);
  const [form] = Form.useForm();
  const error = useSelector((state) => state.auth.error);

  // Check if there's a redirect destination (e.g., from pricing page)
  const redirectTo = location.state?.redirectTo;
  const planFromState = location.state?.plan;

  // const [state, setState] = useState({
  //   checked: null,
  // });

  // const lock = new Auth0Lock(clientId, domain, auth0options);

  // const handleSubmit = useCallback(
  //   (values) => {
  //     dispatch(login(values, () => navigate('/admin')));
  //   },
  //   [navigate, dispatch],
  // );

  const handleSubmit = useCallback(
    (values) => {
      dispatch(
        login(values, (hasSubscription) => {
          // If user doesn't have a subscription, redirect to pricing
          if (!hasSubscription) {
            // Clean up any previously selected plan
            sessionStorage.removeItem('selectedPlan');
            navigate('/pricing');
            return;
          }

          // User has subscription - handle redirect
          // Check if we need to redirect to checkout with a plan (in case they selected a new plan)
          if (redirectTo === '/checkout') {
            // Get plan from location state or sessionStorage
            const plan = planFromState || JSON.parse(sessionStorage.getItem('selectedPlan') || 'null');
            if (plan) {
              sessionStorage.removeItem('selectedPlan'); // Clean up
              navigate('/checkout', { state: { plan } });
            } else {
              navigate('/admin/profit/summary');
            }
          } else if (redirectTo) {
            navigate(redirectTo);
          } else {
            navigate('/admin/profit/summary');
          }
        }),
      );
    },
    [navigate, dispatch, redirectTo, planFromState],
  );

  // const onChange = (checked) => {
  //   setState({ ...state, checked });
  // };

  // lock.on('authenticated', (authResult) => {
  //   lock.getUserInfo(authResult.accessToken, (error) => {
  //     if (error) {
  //       return;
  //     }

  //     handleSubmit();
  //     lock.hide();
  //   });
  // });

  return (
    <div className="w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-500">Enter your details to access your account</p>
      </div>

      <Form name="login" form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="email"
          rules={[{ message: 'Please input your Email!', required: true }]}
          label={<span className="font-medium text-gray-700">Email Address</span>}
        >
          <Input className="rounded-lg py-2.5" placeholder="name@example.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="font-medium text-gray-700">Password</span>}
          rules={[{ required: true, message: 'Please enter password' }]}
          className="mb-6"
        >
          <Input.Password className="rounded-lg py-2.5" placeholder="Enter your password" />
        </Form.Item>

        <div className="flex items-center justify-between mb-8">
          <NavLink className="text-emerald-600 hover:text-emerald-700 font-medium text-sm" to="/auth/forgotPassword">
            Forgot password?
          </NavLink>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
        )}

        <Form.Item>
          <Button
            className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
            type="primary"
            htmlType="submit"
            loading={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-8 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/auth/register" className="font-semibold text-emerald-600 hover:text-emerald-500 hover:underline">
          Sign up for free
        </Link>
      </div>
    </div>
  );
}

export default SignIn;
