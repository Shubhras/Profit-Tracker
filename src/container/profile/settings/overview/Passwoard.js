// import React, { useState } from 'react';
// import { Row, Col, Form, Input, Button } from 'antd';
// import { GlobalUtilityStyle } from '../../../styled';
// import Heading from '../../../../components/heading/heading';

// function Password() {
//   const [form] = Form.useForm();
//   const [state, setState] = useState({
//     values: null,
//   });

//   const handleSubmit = (values) => {
//     setState({ ...state, values });
//   };
//   const handleCancel = (e) => {
//     e.preventDefault();
//     form.resetFields();
//   };

//   return (
//     <div className="bg-white dark:bg-white10 m-0 p-0 mb-[25px] rounded-10 relative">
//       <div className="py-[18px] px-[25px] text-dark dark:text-white87 font-medium text-[17px] border-regular dark:border-white10 border-b">
//         <Heading as="h4" className="mb-0 text-lg font-medium">
//           Password Settings
//         </Heading>
//         <span className="mb-0.5 text-light dark:text-white60 text-13 font-normal">
//           Change or reset your account password
//         </span>
//       </div>
//       <div className="p-[25px]">
//         <GlobalUtilityStyle>
//           <Row justify="center">
//             <Col xxl={12} sm={16} xs={24}>
//               <Form form={form} name="changePassword" onFinish={handleSubmit}>
//                 <Form.Item name="old" label="Old Password" className="mb-4 form-label-w-full form-label-text-start">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item name="new" label="New Password" className="mb-0 form-label-w-full form-label-text-start">
//                   <Input.Password />
//                 </Form.Item>
//                 <p className="mb-0 text-light dark:text-white60 text-[13px]">Minimum 6 characters</p>
//                 <Form.Item className="mb-7">
//                   <div className="flex items-center flex-wrap gap-[15px] mt-11">
//                     <Button htmlType="submit" type="primary" className="h-11 px-[20px]">
//                       Change Password
//                     </Button>
//                     <Button
//                       size="default"
//                       onClick={handleCancel}
//                       type="light"
//                       className="h-11 px-[20px] bg-transparent dark:text-white87 dark:border-white10 dark:hover:text-primary dark:hover:border-primary"
//                     >
//                       Cancel
//                     </Button>
//                   </div>
//                 </Form.Item>
//               </Form>
//             </Col>
//           </Row>
//         </GlobalUtilityStyle>
//       </div>
//     </div>
//   );
// }

// export default Password;

import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

// import Heading from '../../../../components/heading/heading';
import { GlobalUtilityStyle } from '../../../styled';
import { changePassword } from '../../../../redux/authentication/actionCreator';

function Password() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // ✅ Correct Redux Selector
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
    <div className="relative space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900 m-0">Security Settings</h1>
        <p className="text-gray-500 m-0">Manage your account security and password preferences.</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Decorative Top Gradient */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="p-8 md:p-12 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-emerald-600"
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Change Password</h2>
            <p className="text-gray-500 text-sm">Ensure your account uses a strong password to stay secure.</p>
          </div>

          <GlobalUtilityStyle>
            <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
              {/* Error Banner */}
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-2 mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
                  className="rounded-xl px-4 py-2.5 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:shadow-emerald-500/10"
                  placeholder="Enter current password"
                />
              </Form.Item>

              {/* New Password */}
              <Form.Item
                name="new_password"
                label={<span className="text-gray-700 font-medium">New Password</span>}
                rules={[
                  { required: true, message: 'Please enter a new password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
                className="mb-2"
              >
                <Input.Password
                  className="rounded-xl px-4 py-2.5 border-gray-200 hover:border-emerald-300 focus:border-emerald-500 focus:shadow-emerald-500/10"
                  placeholder="Enter new password"
                />
              </Form.Item>

              {/* Requirements Hint */}
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Password Requirements:
                </h4>
                <ul className="text-sm text-gray-500 space-y-1 list-disc pl-4">
                  <li>Minimum 6 characters long</li>
                  <li>Use a mix of letters, numbers, and symbols</li>
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse min-sm:flex-row gap-3 pt-4">
                <Button
                  size="large"
                  className="w-full rounded-xl h-12 border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50 font-medium"
                  onClick={() => form.resetFields()}
                >
                  Cancel
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  className="w-full rounded-xl h-12 bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/30 font-semibold"
                >
                  Update Password
                </Button>
              </div>
            </Form>
          </GlobalUtilityStyle>
        </div>
      </div>
    </div>
  );
}

export default Password;
