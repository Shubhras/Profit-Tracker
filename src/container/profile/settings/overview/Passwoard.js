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
import { Row, Col, Form, Input, Button, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import Heading from '../../../../components/heading/heading';
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
        message.success('Password changed successfully!');
        form.resetFields();
      }),
    );
  };

  return (
    <div className="bg-white mb-[25px] rounded-10 relative">
      <div className="py-[18px] px-[25px] border-b">
        <Heading as="h4" className="mb-0 text-lg font-medium">
          Change Password
        </Heading>
      </div>

      <div className="p-[25px]">
        <GlobalUtilityStyle>
          <Row justify="center">
            <Col xxl={12} sm={16} xs={24}>
              <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* Error */}
                {error && <p className="text-red-500 mb-3">{error}</p>}

                {/* Old Password */}
                <Form.Item
                  name="old_password"
                  label="Old Password"
                  rules={[{ required: true, message: 'Enter old password' }]}
                >
                  <Input.Password />
                </Form.Item>

                {/* New Password */}
                <Form.Item
                  name="new_password"
                  label="New Password"
                  rules={[
                    { required: true, message: 'Enter new password' },
                    { min: 6, message: 'Minimum 6 characters' },
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Change Password
                  </Button>

                  <Button onClick={() => form.resetFields()}>Cancel</Button>
                </div>
              </Form>
            </Col>
          </Row>
        </GlobalUtilityStyle>
      </div>
    </div>
  );
}

export default Password;
