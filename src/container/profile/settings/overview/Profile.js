import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Spin, message } from 'antd';
import { useDispatch } from 'react-redux';
import UilUser from '@iconscout/react-unicons/icons/uil-user';
import { setUserProfile } from '../../../../redux/authentication/actionCreator';
import { DataService } from '../../../../config/dataService/dataService';

function Profile() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [fetchLoading, setFetchLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');

  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const response = await DataService.get('/user/profile/');

      if (response.data.status === true) {
        const { data } = response.data;

        dispatch(setUserProfile(data));
        setDisplayName(data.name || '');

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

  const handleSubmit = async (values) => {
    try {
      setUpdateLoading(true);
      const response = await DataService.patch('/user/update-profile/', values);

      if (response.data.status === true) {
        message.success('Profile updated successfully!');
        dispatch(setUserProfile(response.data.data));
        setDisplayName(values.name || displayName);
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

  const initials = displayName
    ? displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <div className="w-full rounded-lg overflow-hidden mx-auto bg-white dark:bg-[#202531] border border-slate-100 dark:border-white/5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-4 pb-4 border-b border-slate-100 dark:border-white/5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          {initials ? (
            <span className="text-white text-[15px] font-semibold">{initials}</span>
          ) : (
            <UilUser className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">General Settings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-[13px] mb-0">
            Update your personal and business details.
          </p>
        </div>
      </div>

      <div className="p-4">
        <Spin spinning={fetchLoading}>
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            {/* Personal Information */}
            <div className="mb-9">
              <h3 className="text-[12px] font-bold text-slate-500 dark:text-white60 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 min-md:grid-cols-2 gap-x-4 gap-y-1">
                <Form.Item
                  label={<span className="font-medium text-[13px] text-slate-700 dark:text-slate-300">Full Name</span>}
                  name="name"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input
                    className="h-10 text-[13px] rounded-lg border-slate-300 focus:border-emerald-500 focus:shadow-none hover:border-slate-400"
                    placeholder="John Doe"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-[13px] text-slate-700 dark:text-slate-300">Email Address</span>
                  }
                  name="email"
                >
                  <Input disabled className="h-10 text-[13px] rounded-lg border-slate-200 bg-slate-50 text-slate-500" />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-[13px] text-slate-700 dark:text-slate-300">Phone Number</span>
                  }
                  name="mobile_number"
                >
                  <Input
                    className="h-10 text-[13px] rounded-lg border-slate-300 focus:border-emerald-500 focus:shadow-none hover:border-slate-400"
                    placeholder="+1 234 567 890"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span className="font-medium text-[13px] text-slate-700 dark:text-slate-300">Business Name</span>
                  }
                  name="business_name"
                >
                  <Input
                    className="h-10 rounded-lg text-[13px] border-slate-300 focus:border-emerald-500 focus:shadow-none hover:border-slate-400"
                    placeholder="Business Ltd."
                  />
                </Form.Item>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h3 className="text-[12px] font-bold text-slate-500 dark:text-white60 uppercase tracking-wider mb-5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Address Details
              </h3>
              <div className="grid grid-cols-1 min-md:grid-cols-2 gap-x-4 gap-y-1">
                <div className="col-span-1 min-md:col-span-2">
                  <Form.Item
                    label={
                      <span className="font-medium text-[13px] text-slate-700 dark:text-slate-300">Street Address</span>
                    }
                    name="address"
                  >
                    <Input
                      className="h-10 rounded-lg text-[13px] border-slate-300 focus:border-emerald-500 focus:shadow-none hover:border-slate-400"
                      placeholder="123 Main St"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="font-medium text-[13px] text-slate-700 dark:text-slate-300">City</span>}
                  name="city"
                >
                  <Input
                    className="h-10 rounded-lg text-[13px] border-slate-300 focus:border-emerald-500 focus:shadow-none hover:border-slate-400"
                    placeholder="New York"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-[13px] text-slate-700 dark:text-slate-300">State</span>}
                  name="state"
                >
                  <Input
                    className="h-10 rounded-lg text-[13px] border-slate-300 focus:border-emerald-500 focus:shadow-none hover:border-slate-400"
                    placeholder="NY"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-[13px] text-slate-700 dark:text-slate-300">Zip Code</span>}
                  name="pin_code"
                >
                  <Input
                    className="h-10 rounded-lg text-[13px] border-slate-300 focus:border-emerald-500 focus:shadow-none hover:border-slate-400"
                    placeholder="10001"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-medium text-[13px] text-slate-700 dark:text-slate-300">GST Number</span>}
                  name="gst_number"
                >
                  <Input
                    className="h-10 rounded-lg text-[13px] border-slate-300 focus:border-emerald-500 focus:shadow-none hover:border-slate-400"
                    placeholder="Tax ID"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Action Buttons */}
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
                loading={updateLoading}
                disabled={fetchLoading}
                className="w-full rounded-xl h-10 bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-emerald-500/30 font-semibold"
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
