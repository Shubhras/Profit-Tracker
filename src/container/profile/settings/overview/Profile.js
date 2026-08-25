import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Spin, Avatar, Upload, message } from 'antd';
import {
  UploadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ShopOutlined,
  HomeOutlined,
  EnvironmentOutlined,
  NumberOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUserProfile } from '../../../../redux/authentication/actionCreator';
import { DataService } from '../../../../config/dataService/dataService';

function Profile() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Loading states
  const [fetchLoading, setFetchLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Avatar state
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Fetch Profile API
  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const response = await DataService.get('/user/profile/');

      if (response.data.status === true) {
        const { data } = response.data;
        dispatch(setUserProfile(data));
        form.setFieldsValue({
          name: data.name,
          business_name: data.business_name,
          email: data.email,
          mobile_number: data.mobile_number,
          gst_number: data.gst_number,
          address: data.address,
          city: data.city,
          state: data.state,
          pin_code: data.pin_code,
        });

        if (data.profile_picture) {
          const pic = data.profile_picture;
          setPreviewImage(pic.startsWith('http') ? pic : `http://127.0.0.1:8000${pic}`);
        }
      }
    } catch (error) {
      console.log('Profile Fetch Error:', error.response?.data);
      message.error('Failed to fetch profile data');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update Profile Submit
  const handleSubmit = async (values) => {
    try {
      setUpdateLoading(true);
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      if (imageFile) {
        formData.append('profile_picture', imageFile);
      }

      const response = await DataService.patch('/user/update-profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === true) {
        message.success('Profile updated successfully!');
        dispatch(setUserProfile(response.data.data));

        if (response.data.data.profile_picture) {
          const pic = response.data.data.profile_picture;
          setPreviewImage(pic.startsWith('http') ? pic : `http://127.0.0.1:8000${pic}`);
        }
        navigate('/admin/pages/actionsrequired');
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
        <div className="mb-5 pb-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">General Settings</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Update your personal and business details.</p>
          </div>
        </div>

        <Spin spinning={fetchLoading}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            {/* Profile Picture / Logo Section */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                <Avatar
                  size={84}
                  src={previewImage || 'https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png'}
                  className="border-2 border-emerald-500 shadow-md object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-base font-semibold text-slate-800 dark:text-white mb-1">Profile Image / Logo</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Upload your photo or logo. Shown in top navigation header. (Max 5MB)
                </p>

                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error('Image must be smaller than 5MB!');
                      return false;
                    }
                    setImageFile(file);
                    setPreviewImage(URL.createObjectURL(file));
                    return false;
                  }}
                >
                  <Button
                    icon={<UploadOutlined />}
                    className="rounded-lg text-emerald-600 border-emerald-500 hover:text-emerald-700 hover:border-emerald-600 font-medium"
                  >
                    Upload Image
                  </Button>
                </Upload>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <UserOutlined className="text-emerald-600 dark:text-emerald-400 text-[15px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-0">
                    Personal Information
                  </h3>
                  <p className="text-[12px] text-slate-400 mb-0">Basic contact & business details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 min-md:grid-cols-2 gap-x-4 gap-y-1">
                <Form.Item
                  label={<span className="font-medium text-[14px] text-slate-700 dark:text-slate-300">Full Name</span>}
                  name="name"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input
                    prefix={<UserOutlined className="text-slate-400 mr-1" />}
                    className="h-10 rounded-lg border-slate-300 text-[14px] focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="John Doe"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-[14px] text-slate-700 dark:text-slate-300">Email Address</span>
                  }
                  name="email"
                >
                  <Input
                    disabled
                    prefix={<MailOutlined className="text-slate-400 mr-1" />}
                    className="h-10 text-[14px] rounded-lg border-slate-200 bg-slate-50 text-slate-500"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-[14px] text-slate-700 dark:text-slate-300">Phone Number</span>
                  }
                  name="mobile_number"
                >
                  <Input
                    prefix={<PhoneOutlined className="text-slate-400 mr-1" />}
                    className="h-10 text-[14px] rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="+1 234 567 890"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-[14px] text-slate-700 dark:text-slate-300">Business Name</span>
                  }
                  name="business_name"
                >
                  <Input
                    prefix={<ShopOutlined className="text-slate-400 mr-1" />}
                    className="h-10 text-[14px] rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="Business Ltd."
                  />
                </Form.Item>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                  <EnvironmentOutlined className="text-emerald-600 dark:text-emerald-400 text-[15px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-0">
                    Address Details
                  </h3>
                  <p className="text-[12px] text-slate-400 mb-0">Where the business is registered</p>
                </div>
              </div>

              <div className="grid grid-cols-1 min-md:grid-cols-2 gap-x-4 gap-y-1">
                <div className="col-span-1 min-md:col-span-2">
                  <Form.Item
                    label={
                      <span className="font-medium text-[14px] text-slate-700 dark:text-slate-300">Street Address</span>
                    }
                    name="address"
                  >
                    <Input
                      prefix={<HomeOutlined className="text-slate-400 mr-1" />}
                      className="h-10 text-[14px] rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                      placeholder="123 Main St"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="font-medium text-[14px] text-slate-700 dark:text-slate-300">City</span>}
                  name="city"
                >
                  <Input
                    className="h-10 text-[14px] rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="New York"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-[14px] text-slate-700 dark:text-slate-300">State</span>}
                  name="state"
                >
                  <Input
                    className="h-10 text-[14px] rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="NY"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-[14px] text-slate-700 dark:text-slate-300">Zip Code</span>}
                  name="pin_code"
                >
                  <Input
                    prefix={<NumberOutlined className="text-slate-400 mr-1" />}
                    className="h-10 text-[14px] rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="10001"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-[14px] text-slate-700 dark:text-slate-300">GST Number</span>}
                  name="gst_number"
                >
                  <Input
                    prefix={<IdcardOutlined className="text-slate-400 mr-1" />}
                    className="h-10 text-[14px] rounded-lg border-slate-300 focus:border-primary focus:shadow-none hover:border-slate-400"
                    placeholder="Tax ID"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse min-sm:flex-row gap-3 pt-4">
              <Button
                size="large"
                className="w-full rounded-xl h-11 border-gray-200 text-gray-600 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50 font-medium"
                onClick={() => form.resetFields()}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateLoading}
                disabled={fetchLoading}
                className="w-full rounded-xl h-11 bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-emerald-500/30 font-semibold"
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
