import React, { useEffect, useState } from 'react';
import { Tag, Avatar, Spin, Button, Modal, message, Select } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ArrowLeftOutlined,
  FormOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  TeamOutlined,
  ApiOutlined,
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
      <div className="bg-[#f5f7fb] min-h-screen p-3 px-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl border border-gray-200 bg-white shadow hover:bg-gray-100 transition flex items-center justify-center"
          >
            <ArrowLeftOutlined />
          </button>

          <div>
            <h2 className="text-[20px] font-bold text-gray-800 mb-0">User Details</h2>
          </div>
        </div>

        {/* Profile Banner */}

        <div className="p-3 rounded-2xl shadow-sm mb-3 bg-white">
          <div className="flex items-start justify-between">
            {/* Left Section */}

            <div className="flex items-center gap-3">
              <Avatar size={38} icon={<UserOutlined />} className="shrink-0" />

              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-[17px] font-semibold text-gray-800 mb-0">{user?.name || '-'}</h2>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center gap-2">
              <UserOutlined className="text-blue-500 text-lg" />
              <h3 className="text-lg font-semibold mb-0">Personal Information</h3>
            </div>
            <div className="mx-1 my-3 border-t border-gray-200 mt-2" />

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
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

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-blue-500 text-lg" />
              <h3 className="text-lg font-semibold mb-0">Address</h3>
            </div>
            <div className="mx-1 my-3 border-t border-gray-200 mt-2" />
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-1">Complete Address</p>

            <p className="text-[15px] text-black mb-3">{user?.address || '-'}</p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">City</p>
                <p className="text-[14px] text-black">{user?.city || '-'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">State</p>
                <p className="text-[14px] text-black">{user?.state || '-'}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">Pin Code</p>
                <p className="text-[14px] text-black">{user?.pin_code || '-'}</p>
              </div>
            </div>
          </div>

          {/* Active Subscription */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center gap-2">
              <CreditCardOutlined className="text-blue-500 text-lg" />
              <h3 className="text-lg font-semibold mb-0">Active Subscription</h3>
            </div>
            <div className="mx-1 my-3 border-t border-gray-200 mt-2" />

            {user?.subscription ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Plan Name</p>
                  <p className="text-[15px] font-semibold text-black">{user.subscription.plan_name || '-'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Status</p>
                  <Tag
                    color={user.subscription.status === 'active' ? 'green' : 'orange'}
                    className="rounded-l px-3 py-[2px] font-medium capitalize"
                  >
                    {user.subscription.status || '-'}
                  </Tag>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Billing Cycle</p>
                  <p className="text-[15px] text-black capitalize">{user.subscription.billing_cycle || '-'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Amount</p>
                  <p className="text-[15px] text-black">₹{user.subscription.amount ?? '-'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">Start Date</p>
                  <p className="text-[14px] text-gray-700">
                    {user.subscription.start_date ? new Date(user.subscription.start_date).toLocaleDateString() : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-0">End Date</p>
                  <p className="text-[14px] text-gray-700">
                    {user.subscription.end_date ? new Date(user.subscription.end_date).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center py-8 text-gray-400 font-medium">
                No Active Subscription
              </div>
            )}
          </div>
        </div>

        {/* Sub Users Section */}
        <div className="p-3 rounded-2xl shadow-md mt-4 bg-white">
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-blue-500 text-lg" />
            <h3 className="text-lg font-semibold mb-0">Sub-Users</h3>
          </div>
          <div className="mx-1 my-3 border-t border-gray-200 mt-2" />

          {user?.sub_users?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Mobile</th>
                    <th className="p-3">Created Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.sub_users.map((subUser) => (
                    <tr key={subUser.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-800">{subUser.name || '-'}</td>
                      <td className="p-3 text-gray-600">{subUser.email || '-'}</td>
                      <td className="p-3 text-gray-600">{subUser.mobile_number || '-'}</td>
                      <td className="p-3 text-gray-600">
                        {subUser.created_at ? new Date(subUser.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3">
                        <Tag color={subUser.is_active ? 'green' : 'red'}>
                          {subUser.is_active ? 'Active' : 'Inactive'}
                        </Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center py-6 text-gray-400">No Sub-Users Found</div>
          )}
        </div>

        {/* Connected Channels Section */}
        <div className="p-3 rounded-2xl shadow-md mt-4 bg-white">
          <div className="flex items-center gap-2">
            <ApiOutlined className="text-blue-500 text-lg" />
            <h3 className="text-lg font-semibold mb-0">Connected Channels</h3>
          </div>
          <div className="mx-1 my-3 border-t border-gray-200 mt-2" />

          {user?.connected_channels?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                    <th className="p-3">Channel</th>
                    <th className="p-3">Account / Store ID</th>
                    <th className="p-3">Connected Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {user.connected_channels.map((ch, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-800">{ch.channel}</td>
                      <td className="p-3 text-gray-600 font-mono text-xs">{ch.identifier || '-'}</td>
                      <td className="p-3 text-gray-600">
                        {ch.connected_at ? new Date(ch.connected_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3">
                        <Tag color={ch.status === 'Connected' ? 'green' : 'red'}>{ch.status}</Tag>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center py-6 text-gray-400">No Connected Channels Found</div>
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

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Active Status</label>

                <Select
                  size="middle"
                  style={{ width: '100%' }}
                  className="rounded-lg"
                  value={editData.is_active}
                  onChange={(value) =>
                    setEditData({
                      ...editData,
                      is_active: value,
                    })
                  }
                  options={[
                    {
                      label: 'Active',
                      value: true,
                    },
                    {
                      label: 'Inactive',
                      value: false,
                    },
                  ]}
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
            {/* <div className="mt-4 flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
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
            </div> */}

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 h-[34px] rounded-l border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button type="submit" className="px-3 h-[34px] bg-primary rounded-l text-white font-semibold">
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
