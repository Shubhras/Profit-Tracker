import React, { useEffect, useState } from 'react';
import { Tag, Avatar, Spin, Button, Modal, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  FormOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUsersDetails, updateUserDetails } from '../../redux/admin/actionCreator';

function ViewUser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editData, setEditData] = useState({
    name: '',
    email: '',
    mobile_number: '',
    city: '',
    state: '',
    pin_code: '',
    address: '',
    is_active: false,
  });

  const userId = location.state?.userId;

  const { getusersDetailsData, loading } = useSelector((state) => state.AdminDashboard);

  const user = getusersDetailsData?.data;

  useEffect(() => {
    if (!userId) {
      navigate('/super-admin/user');
      return;
    }

    dispatch(getUsersDetails(userId));
  }, [dispatch, userId, navigate]);

  useEffect(() => {
    if (user) {
      console.log(user);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="h-[70vh] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  const handleEdit = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      mobile_number: user?.mobile_number || '',
      city: user?.city || '',
      state: user?.state || '',
      pin_code: user?.pin_code || '',
      address: user?.address || '',
      is_active: user?.is_active || false,
    });

    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    const res = await dispatch(updateUserDetails(user.id, editData));

    console.log(editData);

    if (res?.status) {
      message.success('User updated successfully');
      setIsEditModalOpen(false);
      dispatch(getUsersDetails(user.id));
    } else {
      message.error(res?.message || 'Update failed');
    }
  };

  return (
    <>
      <div className="bg-[#f5f7fb] min-h-screen p-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl border border-gray-200 bg-white shadow hover:bg-gray-100 transition"
          >
            <ArrowLeftOutlined />
          </button>

          <div>
            <h2 className="text-[20px] font-bold text-gray-800 mb-0">User Details</h2>
            <p className="text-[13px] mb-0">View complete information about the user.</p>
          </div>
        </div>

        {/* Profile Banner */}

        <div className="p-3 rounded-2xl shadow-sm mb-3 bg-white">
          <div className="flex items-start justify-between">
            {/* Left Section */}

            <div className="flex items-center gap-3">
              <Avatar size={43} icon={<UserOutlined />} className="shrink-0" />

              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-[19px] font-semibold text-gray-800 mb-0">{user?.name || '-'}</h2>

                  <Tag color={user?.is_active ? 'green' : 'red'} className="rounded-1 px-3">
                    {user?.is_active ? 'Active' : 'Inactive'}
                  </Tag>
                </div>

                <div className="flex flex-wrap gap-5 text-gray-500">
                  <div className="flex items-center gap-1">
                    <MailOutlined className="text-[#1677ff]" />
                    <span>{user?.email || '-'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <PhoneOutlined className="text-[#1677ff]" />
                    <span>{user?.mobile_number || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="default"
              icon={<FormOutlined />}
              className="rounded-l text-[13px] flex items-center"
              onClick={handleEdit}
            >
              Edit
            </Button>
          </div>
        </div>

        {/* Information Grid */}

        <div className="grid grid-cols-1 min-lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-blue-500 text-lg" />
              <h3 className="text-lg font-semibold mb-0">Personal Information</h3>
            </div>
            <div className="mx-1 my-3 border-t border-gray-200 mt-2" />

            <div className="grid grid-cols-2 gap-x-10 gap-y-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Full Name</p>
                <p className="text-[15px] text-black">{user?.name || '-'}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Email</p>
                <p className="text-[15px] text-black break-all">{user?.email || '-'}</p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Mobile Number</p>
                <p className="text-[15px] text-black">{user?.mobile_number || '-'}</p>
              </div>

              <div>
                <p className="text-[12px] font-medium uppercase tracking-wider text-gray-400 mb-1">Status</p>

                <Tag color={user?.is_active ? 'green' : 'red'} className="rounded-l px-3 py-[2px] font-medium">
                  {user?.is_active ? 'Active' : 'Inactive'}
                </Tag>
              </div>
            </div>
          </div>

          {/* Business */}
          {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <h3 className="text-lg font-semibold mb-5">Business Information</h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Business Name</p>
              <p className="text-[15px] text-black">{user?.business_name || '-'}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">City</p>
              <p className="text-[15px] text-black">{user?.city || '-'}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">State</p>
              <p className="text-[15px] text-black">{user?.state || '-'}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Pin Code</p>
              <p className="text-[15px] text-black">{user?.pin_code || '-'}</p>
            </div>
          </div>
        </div> */}

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-green-500 text-lg" />
              <h3 className="text-lg font-semibold mb-0">Address</h3>
            </div>
            <div className="mx-1 my-3 border-t border-gray-200 mt-2" />
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1">Complete Address</p>

            <p className="text-[15px] text-black">{user?.address || '-'}</p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">City</p>
                <p className="text-[15px] text-black">{user?.city || '-'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">State</p>
                <p className="text-[15px] text-black">{user?.state || '-'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Pin Code</p>
                <p className="text-[15px] text-black">{user?.pin_code || '-'}</p>
              </div>
            </div>
          </div>

          {/* Account Information (4th Box) */}
          {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
          <h3 className="text-lg font-semibold mb-5">Account Information</h3>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">User ID</p>
              <p className="text-[15px] text-black">{user?.id || '-'}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Status</p>

              <Tag color={user?.is_active ? 'green' : 'red'}>{user?.is_active ? 'Active' : 'Inactive'}</Tag>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Email</p>
              <p className="text-[15px] text-black">{user?.email || '-'}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Phone</p>
              <p className="text-[15px] text-black">{user?.mobile_number || '-'}</p>
            </div>
          </div>
        </div> */}
        </div>

        {/* Permissions */}

        <div className="p-3 rounded-2xl shadow-md mt-4 bg-white">
          <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-purple-500 text-lg" />
            <h3 className="text-lg font-semibold mb-0">Module Permissions</h3>
          </div>
          <div className="mx-1 my-3 border-t border-gray-200 mt-2" />
          {user?.permissions?.length ? (
            <div className="grid grid-cols-1 min-md:grid-cols-2 min-lg:grid-cols-3 gap-4">
              {user.permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="border rounded-2xl p-4 bg-gradient-to-r from-blue-50 to-white hover:shadow-md transition"
                >
                  <h4 className="font-semibold text-lg">{permission.module_name}</h4>

                  <p className="text-gray-500 mb-3">{permission.submodule_name}</p>

                  <div className="flex flex-wrap gap-2">
                    {permission.can_view && <Tag color="blue">View</Tag>}

                    {permission.can_create && <Tag color="green">Create</Tag>}

                    {permission.can_update && <Tag color="orange">Update</Tag>}

                    {permission.can_delete && <Tag color="red">Delete</Tag>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center py-10 text-gray-400">No Permissions Assigned</div>
          )}
        </div>
      </div>

      <Modal open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null} width={750} centered>
        <div className="p-2">
          <h2 className="text-xl font-semibold text-gray-800">Edit User</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdate();
            }}
          >
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  value={editData.email}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Mobile Number</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  value={editData.mobile_number}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      mobile_number: e.target.value,
                    })
                  }
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  value={editData.city}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      city: e.target.value,
                    })
                  }
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  value={editData.state}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      state: e.target.value,
                    })
                  }
                />
              </div>

              {/* Pin Code */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Pin Code</label>
                <input
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                  value={editData.pin_code}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      pin_code: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
                value={editData.address}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    address: e.target.value,
                  })
                }
              />
            </div>

            {/* Status */}
            <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
              <span className="text-sm font-medium text-gray-700">Active Status</span>

              <input
                type="checkbox"
                checked={editData.is_active}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    is_active: e.target.checked,
                  })
                }
                className="h-5 w-5"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 h-[34px] rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button type="submit" className="px-3 h-[34px] bg-primary rounded-lg text-white font-semibold">
                Update User
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}

export default ViewUser;
