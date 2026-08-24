import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { GlobalUtilityStyle } from '../../../styled';
import { changePassword } from '../../../../redux/authentication/actionCreator';

function Password() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = (values) => {
    dispatch(
      changePassword(values, () => {
        message.success('Password successfully updated!');
        form.resetFields();
      }),
    );
  };

  return (
    <div className="w-full rounded-lg overflow-hidden mx-auto bg-white dark:bg-[#202531] border border-slate-100 dark:border-white/5 shadow-sm">
      {/* Header — matches Profile card */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">Change Password</h2>
          <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-0">
            Ensure your account uses a strong, unique password.
          </p>
        </div>
      </div>

      <div className="p-5">
        <GlobalUtilityStyle>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm flex items-center gap-2 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Old Password */}
            <Form.Item
              name="old_password"
              label={<span className="text-gray-700 font-medium">Current Password</span>}
              rules={[{ required: true, message: 'Please enter your current password' }]}
              className="mb-4"
            >
              <Input.Password
                className="rounded-lg h-11 px-4 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:shadow-emerald-500/10"
                placeholder="Enter current password"
              />
            </Form.Item>

            {/* New Password */}
            <Form.Item
              name="new_password"
              label={<span className="text-gray-700 font-medium">New Password</span>}
              rules={[
                { required: true, message: 'Please enter a new password' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/,
                  message:
                    'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.',
                },
              ]}
              className="mb-2"
            >
              <Input.Password
                className="rounded-lg h-11 px-4 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:shadow-emerald-500/10"
                placeholder="Enter new password"
              />
            </Form.Item>

            {/* Requirements Hint */}
            <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl mb-6 mt-4">
              <h4 className="text-[11px] font-semibold text-slate-500 dark:text-white60 uppercase tracking-wider mb-2.5">
                Password requirements
              </h4>
              <ul className="grid grid-cols-1 min-sm:grid-cols-2 gap-y-1.5 gap-x-4 text-[13px] text-slate-600 dark:text-white60 list-none pl-0">
                {[
                  'Minimum 12 characters',
                  'One uppercase letter',
                  'One lowercase letter',
                  'One number',
                  'One special character',
                ].map((rule) => (
                  <li key={rule} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse min-sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <Button
                size="large"
                className="w-full rounded-xl h-10 border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50 font-medium"
                onClick={() => form.resetFields()}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full rounded-xl h-10 bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-emerald-500/30 font-semibold"
              >
                Update Password
              </Button>
            </div>
          </Form>
        </GlobalUtilityStyle>
      </div>
    </div>
  );
}

export default Password;
