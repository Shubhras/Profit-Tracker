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
import { Row, Col, Form, Input, Spin, message } from 'antd';
import { useDispatch } from 'react-redux';
import { Button } from '../../../../components/buttons/buttons';
import Heading from '../../../../components/heading/heading';
import { GlobalUtilityStyle } from '../../../styled';
import { setUserProfile } from '../../../../redux/authentication/actionCreator';
import { DataService } from '../../../../config/dataService/dataService';

function Profile() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // ✅ Separate loading states for fetch and update
  const [fetchLoading, setFetchLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // ✅ Fetch Profile API
  const fetchProfile = async () => {
    try {
      setFetchLoading(true);

      const response = await DataService.get('/user/profile/');

      // console.log('Profile Response:', response.data);

      if (response.data.status === true) {
        // Update Redux state with the data we already have
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

  // ✅ Call API on Page Load
  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Update Profile Submit
  const handleSubmit = async (values) => {
    // console.log('Updated Values:', values);

    try {
      setUpdateLoading(true);

      const response = await DataService.patch('/user/update-profile/', values);

      // console.log('Update Response:', response.data);

      if (response.data.status === true) {
        message.success('Profile updated successfully!');
        // ✅ Automatically refresh profile in Redux store (updates Header/Info)
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
    <div className="relative mb-[25px]">
      {/* Unique Cover Photo Background */}
      {/* <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-t-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div> */}

      <div className="bg-white px-6 pb-8 rounded-b-2xl shadow-sm border border-gray-100 relative z-10">
        <div className="h-1 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500" />
        <GlobalUtilityStyle>
          <Spin spinning={fetchLoading}>
            <Row gutter={[30, 0]}>
              {/* Left Side: Avatar & Intro */}
              <Col xs={24} lg={8} xl={6}>
                <div className="pt-4 text-center lg:text-left mb-8 lg:mb-0">
                  <div className="">
                    <h2 className="text-2xl font-bold text-gray-900 m-0">{form.getFieldValue('name') || 'User'}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {form.getFieldValue('business_name') || 'Business Owner'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                        Verified
                      </span>
                      <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-semibold rounded-full border border-gray-200">
                        Pro Plan
                      </span>
                    </div>
                  </div>
                </div>
              </Col>

              {/* Right Side: Form */}
              <Col xs={24} lg={16} xl={18}>
                <div className="pt-8">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <Heading as="h4" className="mb-0 text-xl font-bold text-gray-800">
                      Personal Information
                    </Heading>
                    {/* <Button size="small" type="default" className="text-gray-500">View Public Profile</Button> */}
                  </div>

                  <Form form={form} layout="vertical" onFinish={handleSubmit} className="profile-form-unique">
                    <Row gutter={24}>
                      <Col xs={24} md={12}>
                        <Form.Item label={<span className="font-semibold text-gray-700">Full Name</span>} name="name">
                          <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<span className="font-semibold text-gray-700">Business Name</span>}
                          name="business_name"
                        >
                          <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<span className="font-semibold text-gray-700">Email Address</span>}
                          name="email"
                        >
                          <Input
                            disabled
                            className="h-11 rounded-xl bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<span className="font-semibold text-gray-700">Phone Number</span>}
                          name="mobile_number"
                        >
                          <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                        </Form.Item>
                      </Col>

                      <Col xs={24}>
                        <div className="my-4 pt-4 border-t border-gray-100">
                          <h5 className="text-md font-bold text-gray-800 mb-4">Billing Address</h5>
                        </div>
                      </Col>

                      <Col xs={24}>
                        <Form.Item
                          label={<span className="font-semibold text-gray-700">Street Address</span>}
                          name="address"
                        >
                          <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item label={<span className="font-semibold text-gray-700">City</span>} name="city">
                          <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item label={<span className="font-semibold text-gray-700">State</span>} name="state">
                          <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          label={<span className="font-semibold text-gray-700">Pin Code</span>}
                          name="pin_code"
                        >
                          <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={<span className="font-semibold text-gray-700">GST Number</span>}
                          name="gst_number"
                        >
                          <Input className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <div className="mt-8 flex gap-4 pt-4 border-t border-gray-100">
                      <Button
                        size="large"
                        htmlType="submit"
                        type="primary"
                        loading={updateLoading}
                        disabled={fetchLoading}
                        className="h-12 px-8 rounded-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-lg shadow-emerald-500/30"
                      >
                        Save Changes
                      </Button>

                      <Button
                        size="large"
                        type="text"
                        onClick={() => fetchProfile()}
                        disabled={fetchLoading || updateLoading}
                        className="h-12 px-8 rounded-xl font-semibold text-gray-500 hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </div>
              </Col>
            </Row>
          </Spin>
        </GlobalUtilityStyle>
      </div>
    </div>
  );
}

export default Profile;
