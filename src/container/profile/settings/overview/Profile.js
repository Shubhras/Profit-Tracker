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
    <div className="bg-white m-0 p-0 mb-[25px] rounded-10 relative">
      {/* Header */}
      <div className="py-[18px] px-[25px] border-b">
        <Heading as="h4" className="mb-0 text-lg font-medium">
          Edit Profile
        </Heading>
        <span className="text-light text-13">Update your personal information</span>
      </div>

      {/* Body */}
      <div className="p-[25px]">
        <GlobalUtilityStyle>
          <Spin spinning={fetchLoading} tip="Loading profile...">
            <Row justify="center">
              <Col xxl={12} lg={16} xs={24}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                  {/* Name */}
                  <Form.Item label="Name" name="name">
                    <Input />
                  </Form.Item>

                  {/* Business Name */}
                  <Form.Item label="Business Name" name="business_name">
                    <Input />
                  </Form.Item>

                  {/* Email */}
                  <Form.Item label="Email" name="email">
                    <Input disabled />
                  </Form.Item>

                  {/* Mobile */}
                  <Form.Item label="Mobile Number" name="mobile_number">
                    <Input />
                  </Form.Item>

                  {/* GST */}
                  <Form.Item label="GST Number" name="gst_number">
                    <Input />
                  </Form.Item>

                  {/* Address */}
                  <Form.Item label="Address" name="address">
                    <Input />
                  </Form.Item>

                  {/* City */}
                  <Form.Item label="City" name="city">
                    <Input />
                  </Form.Item>

                  {/* State */}
                  <Form.Item label="State" name="state">
                    <Input />
                  </Form.Item>

                  {/* Pin Code */}
                  <Form.Item label="Pin Code" name="pin_code">
                    <Input />
                  </Form.Item>

                  {/* Buttons */}
                  <div className="mt-8 flex gap-3">
                    <Button
                      size="default"
                      htmlType="submit"
                      type="primary"
                      loading={updateLoading}
                      disabled={fetchLoading}
                      className="h-11 px-[20px] font-semibold"
                    >
                      Update Profile
                    </Button>

                    <Button
                      size="default"
                      type="light"
                      onClick={() => fetchProfile()}
                      disabled={fetchLoading || updateLoading}
                      className="h-11 px-[20px]"
                    >
                      Reset
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </Spin>
        </GlobalUtilityStyle>
      </div>
    </div>
  );
}

export default Profile;
