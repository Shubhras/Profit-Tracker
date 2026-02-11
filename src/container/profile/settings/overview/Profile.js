// import React, { useState } from 'react';
// import { Row, Col, Form, Input, Select } from 'antd';
// import { Button } from '../../../../components/buttons/buttons';
// import Heading from '../../../../components/heading/heading';
// import { Tag } from '../../../../components/tags/tags';
// import { GlobalUtilityStyle } from '../../../styled';

// const { Option } = Select;
// function Profile() {
//   const [form] = Form.useForm();

//   const [state, setState] = useState({
//     tags: ['UI/UX', 'Branding', 'Product Design', 'Web Design'],
//     values: null,
//   });

//   const handleSubmit = (values) => {
//     setState({ ...state, values: { ...values, tags: state.tags } });
//   };

//   const handleCancel = (e) => {
//     e.preventDefault();
//     form.resetFields();
//   };

//   const checked = (checke) => {
//     setState({ tags: checke });
//   };

//   return (
//     <div className="bg-white dark:bg-white10 m-0 p-0 mb-[25px] rounded-10 relative">
//       <div className="py-[18px] px-[25px] text-dark dark:text-white87 font-medium text-[17px] border-regular dark:border-white10 border-b">
//         <Heading as="h4" className="mb-0 text-lg font-medium">
//           Edit Profile
//         </Heading>
//         <span className="mb-0.5 text-light dark:text-white60 text-13 font-normal">
//           Set Up Your Personal Information
//         </span>
//       </div>
//       <div className="p-[25px]">
//         <GlobalUtilityStyle>
//           <Row justify="center">
//             <Col xxl={12} lg={16} xs={24}>
//               <Form className="pt-2.5 pb-[30px]" name="editProfile" onFinish={handleSubmit}>
//                 <Form.Item
//                   name="name"
//                   initialValue="Duran Clayton"
//                   label="Name"
//                   className="mb-4 form-label-w-full form-label-text-start dark:text-white-60"
//                 >
//                   <Input />
//                 </Form.Item>
//                 <Form.Item
//                   name="phone"
//                   initialValue="0096644553"
//                   label="Phone Number"
//                   className="mb-4 form-label-w-full form-label-text-start"
//                 >
//                   <Input />
//                 </Form.Item>
//                 <Form.Item
//                   name="country"
//                   initialValue=""
//                   label="Country"
//                   className="mb-4 form-label-w-full form-label-text-start"
//                 >
//                   <Select style={{ width: '100%' }}>
//                     <Option value="">Please Select</Option>
//                     <Option value="bangladesh">Bangladesh</Option>
//                     <Option value="india">India</Option>
//                     <Option value="pakistan">Pakistan</Option>
//                   </Select>
//                 </Form.Item>
//                 <Form.Item
//                   name="city"
//                   initialValue=""
//                   label="City"
//                   className="mb-4 form-label-w-full form-label-text-start"
//                 >
//                   <Select style={{ width: '100%' }}>
//                     <Option value="">Please Select</Option>
//                     <Option value="dhaka">Dhaka</Option>
//                     <Option value="mymensingh">Mymensingh</Option>
//                     <Option value="khulna">Khulna</Option>
//                   </Select>
//                 </Form.Item>
//                 <Form.Item
//                   name="company"
//                   initialValue="Example"
//                   label="Company Name"
//                   className="mb-4 form-label-w-full form-label-text-start"
//                 >
//                   <Input />
//                 </Form.Item>
//                 <Form.Item
//                   name="website"
//                   initialValue="www.example.com"
//                   label="Website"
//                   className="mb-4 form-label-w-full form-label-text-start"
//                 >
//                   <Input />
//                 </Form.Item>
//                 <Form.Item
//                   name="userBio"
//                   initialValue="Nam malesuada dolor tellus pretium amet was hendrerit facilisi id vitae enim sed ornare there suspendisse sed orci neque ac sed aliquet risus faucibus in pretium molestee."
//                   label="User Bio"
//                   className="mb-4 form-label-w-full form-label-text-start"
//                 >
//                   <Input.TextArea rows={3} />
//                 </Form.Item>
//                 <Form.Item name="skills" label="Skills" className="mb-4 form-label-w-full form-label-text-start">
//                   <div className="p-3 border border-gray-200 dark:border-white10 rounded-md [&>div>div>span>.ant-tag]:inline-flex [&>div>div>span>.ant-tag]:items-center">
//                     <Tag className="bg-primary" animate onChange={checked} data={state.tags} />
//                   </div>
//                 </Form.Item>
//                 <div className="mt-11">
//                   <Button size="default" htmlType="submit" type="primary" className="h-11 px-[20px] font-semibold">
//                     Update Profile
//                   </Button>
//                   &nbsp; &nbsp;
//                   <Button
//                     size="default"
//                     onClick={handleCancel}
//                     type="light"
//                     className="h-11 px-[20px] bg-regularBG dark:bg-white10 text-body dark:text-white87 font-semibold border-regular dark:border-white10"
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </Form>
//             </Col>
//           </Row>
//         </GlobalUtilityStyle>
//       </div>
//     </div>
//   );
// }

// export default Profile;

import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Spin, message } from 'antd';
import { useDispatch } from 'react-redux';
// import UilUser from '@iconscout/react-unicons/icons/uil-user';
// import UilMapMarker from '@iconscout/react-unicons/icons/uil-map-marker'
// import UilBill from '@iconscout/react-unicons/icons/uil-bill';
import { setUserProfile } from '../../../../redux/authentication/actionCreator';
import { DataService } from '../../../../config/dataService/dataService';

function Profile() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Loading states
  const [fetchLoading, setFetchLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetch Profile API
  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const response = await DataService.get('/user/profile/');

      if (response.data.status === true) {
        dispatch(setUserProfile(response.data.data));
        form.setFieldsValue({
          name: response.data.data.name,
          business_name: response.data.data.business_name,
          email: response.data.data.email,
          mobile_number: response.data.data.mobile_number,
          gst_number: response.data.data.gst_number,
          address: response.data.data.address,
          city: response.data.data.city,
          state: response.data.data.state,
          pin_code: response.data.data.pin_code,
        });
      }
    } catch (error) {
      console.log('Profile Fetch Error:', error.response?.data);
      message.error('Failed to fetch profile data');
    } finally {
      setFetchLoading(false);
    }
  };

  // Call API on Page Load
  useEffect(() => {
    fetchProfile();
  }, []);

  // Update Profile Submit
  const handleSubmit = async (values) => {
    try {
      setUpdateLoading(true);
      const response = await DataService.patch('/user/update-profile/', values);

      if (response.data.status === true) {
        message.success('Profile updated successfully!');
        dispatch(setUserProfile(response.data.data));
      } else {
        message.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.log('Update Error:', error.response?.data);
      message.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden mx-auto">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
      <div className="bg-white dark:bg-[#202531] shadow-sm border border-slate-200 dark:border-white/5 p-4">
        <div className="mb-8 pb-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">General Settings</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Update your personal and business details.</p>
          </div>
        </div>

        <Spin spinning={fetchLoading}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            {/* Personal Information */}
            <div className="mb-10">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 min-md:grid-cols-2 gap-x-4 gap-y-2">
                <Form.Item
                  label={<span className="font-medium text-slate-700 dark:text-slate-300">Full Name</span>}
                  name="name"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input
                    className="h-11 rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="John Doe"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-slate-700 dark:text-slate-300">Email Address</span>}
                  name="email"
                >
                  <Input disabled className="h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-500" />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-slate-700 dark:text-slate-300">Phone Number</span>}
                  name="mobile_number"
                >
                  <Input
                    className="h-11 rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="+1 234 567 890"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-slate-700 dark:text-slate-300">Business Name</span>}
                  name="business_name"
                >
                  <Input
                    className="h-11 rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="Business Ltd."
                  />
                </Form.Item>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">
                Address Details
              </h3>
              <div className="grid grid-cols-1 min-md:grid-cols-2 gap-x-4 gap-y-2">
                <div className="col-span-1 min-md:col-span-2">
                  <Form.Item
                    label={<span className="font-medium text-slate-700 dark:text-slate-300">Street Address</span>}
                    name="address"
                  >
                    <Input
                      className="h-11 rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                      placeholder="123 Main St"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="font-medium text-slate-700 dark:text-slate-300">City</span>}
                  name="city"
                >
                  <Input
                    className="h-11 rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="New York"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-slate-700 dark:text-slate-300">State</span>}
                  name="state"
                >
                  <Input
                    className="h-11 rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="NY"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-slate-700 dark:text-slate-300">Zip Code</span>}
                  name="pin_code"
                >
                  <Input
                    className="h-11 rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="10001"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-slate-700 dark:text-slate-300">GST Number</span>}
                  name="gst_number"
                >
                  <Input
                    className="h-11 rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="Tax ID"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Action Buttons */}
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
                loading={updateLoading}
                disabled={fetchLoading}
                className="w-full rounded-xl h-12 bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/30 font-semibold"
              >
                Save Changes
              </Button>
            </div>
          </Form>
        </Spin>
      </div>
    </div>
  );
}

export default Profile;
