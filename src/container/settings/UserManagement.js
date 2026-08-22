import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  Empty,
  message,
  Popconfirm,
  Checkbox,
  Tag,
  Descriptions,
  Select,
} from 'antd';
import { UilTrashAlt, UilLock, UilEye, UilEdit, UilSearch, UilUserPlus } from '@iconscout/react-unicons';
import { getSubUsers, addUser, deleteSubUser, updateSubUser } from '../../redux/Settings/actionCreator';
// import { subUserLogin } from '../../redux/authentication/actionCreator';
import { DataService } from '../../config/dataService/dataService';
// import { PageHeader } from '../../components/page-headers/page-headers';

// const { Option } = Select;

export default function UserManagement() {
  // const PageRoutes = [
  //   { path: 'index', breadcrumbName: 'Settings' },
  //   { path: '', breadcrumbName: 'User Settings' },
  //   { path: '', breadcrumbName: 'User Management' },
  // ];

  const dispatch = useDispatch();
  const { subUsersData, subUsersLoading, adduserLoading } = useSelector((state) => state.settings);

  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [form] = Form.useForm();

  // Permission Modal State
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modulesList, setModulesList] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [permLoading, setPermLoading] = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);

  // View User Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  // Edit User Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm] = Form.useForm();
  const [updatingUserLoading, setUpdatingUserLoading] = useState(false);

  // Load Sub-Users from Redux on Mount
  useEffect(() => {
    dispatch(getSubUsers());
  }, [dispatch]);

  // Update table state when subUsersData changes in Redux store
  useEffect(() => {
    if (subUsersData) {
      let listData = [];
      if (Array.isArray(subUsersData)) {
        listData = subUsersData;
      } else if (Array.isArray(subUsersData.data)) {
        listData = subUsersData.data;
      } else if (subUsersData.results) {
        if (Array.isArray(subUsersData.results)) {
          listData = subUsersData.results;
        } else if (Array.isArray(subUsersData.results.data)) {
          listData = subUsersData.results.data;
        }
      }

      const formatted = listData.map((u) => ({
        key: u.id,
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile_number,
        status: u.status || 'Active',
        role: u.role || 'Staff',
        rawUser: u,
      }));
      setUsers(formatted);
    }
  }, [subUsersData]);

  // View User Details
  const handleOpenViewModal = (record) => {
    setViewUser(record);
    setViewModalOpen(true);
  };

  // Edit Sub-User Info
  const handleOpenEditModal = (record) => {
    setEditingUser(record);
    editForm.setFieldsValue({
      name: record.name,
      mobile: record.mobile,
      password: '',
    });
    setEditModalOpen(true);
  };

  // Submit Edit Sub-User Info
  const handleUpdateUser = async () => {
    try {
      const values = await editForm.validateFields();
      setUpdatingUserLoading(true);

      const payload = {
        name: values.name,
        mobile_number: values.mobile,
        role: 'Staff',
      };

      if (values.password) {
        payload.password = values.password;
      }

      const res = await dispatch(updateSubUser(editingUser.id, payload));

      if (res && (res.status === true || res.statusCode === 200)) {
        message.success('Sub-user details updated successfully!');
        setEditModalOpen(false);
        editForm.resetFields();
      } else {
        message.error(res?.message || 'Failed to update user details');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
      }
    } finally {
      setUpdatingUserLoading(false);
    }
  };

  // Open Permissions Modal & Load Parent Subscription / Modules
  const handleOpenPermissionsModal = async (record) => {
    setSelectedUser(record);
    setPermModalOpen(true);
    setPermLoading(true);

    try {
      // 1. Fetch available modules & submodules
      const modRes = await DataService.get('/user/modules-with-submodules/');
      let allModules = [];
      if (modRes.data && modRes.data.data) {
        allModules = modRes.data.data;
      } else if (Array.isArray(modRes.data)) {
        allModules = modRes.data;
      }

      // 2. Fetch parent user profile to check subscription plan restriction
      let allowedModuleIds = null;
      try {
        const profRes = await DataService.get('/user/profile/');
        const sub = profRes.data?.data?.subscription;
        if (sub && sub.modules && sub.modules.length > 0) {
          allowedModuleIds = new Set(sub.modules.map((m) => m.module_id || m.id));
        }
      } catch (e) {
        console.log('Profile fetch error, proceeding with all active modules:', e);
      }

      // Filter modules based on parent subscription if active
      let filteredModules = allModules;
      if (allowedModuleIds && allowedModuleIds.size > 0) {
        filteredModules = allModules.filter((m) => allowedModuleIds.has(m.id));
      }
      setModulesList(filteredModules);

      // 3. Initialize current permission keys set for the selected sub-user
      const existingPerms = record.rawUser?.permissions || [];
      const keysSet = new Set();

      existingPerms.forEach((p) => {
        const modId = typeof p.module === 'object' ? p.module.id : p.module;
        const subId = p.submodule ? (typeof p.submodule === 'object' ? p.submodule.id : p.submodule) : null;

        if (p.can_view) {
          if (subId) {
            keysSet.add(`s_${modId}_${subId}`);
            keysSet.add(`m_${modId}`); // Auto-select parent module
          } else {
            keysSet.add(`m_${modId}`);
          }
        }
      });

      setSelectedKeys(keysSet);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to load module permissions');
    } finally {
      setPermLoading(false);
    }
  };

  // Single-click selection toggle with cascading rules
  const handleToggleItem = (record, checked) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      const { isModule, moduleId, submoduleId, moduleObj } = record;

      if (isModule) {
        // Rule: If direct module selected/deselected, toggle all its submodules automatically
        const modKey = `m_${moduleId}`;
        if (checked) {
          next.add(modKey);
          if (moduleObj && moduleObj.submodules) {
            moduleObj.submodules.forEach((sub) => {
              next.add(`s_${moduleId}_${sub.id}`);
            });
          }
        } else {
          next.delete(modKey);
          if (moduleObj && moduleObj.submodules) {
            moduleObj.submodules.forEach((sub) => {
              next.delete(`s_${moduleId}_${sub.id}`);
            });
          }
        }
      } else {
        // Rule: If any submodule is selected, its parent module must automatically be selected!
        const subKey = `s_${moduleId}_${submoduleId}`;
        const modKey = `m_${moduleId}`;

        if (checked) {
          next.add(subKey);
          next.add(modKey);
        } else {
          next.delete(subKey);

          // Check if any other submodule under this parent module is still selected
          const parentMod = modulesList.find((m) => m.id === moduleId);
          const hasOtherActiveSubmodule = parentMod?.submodules?.some(
            (sub) => sub.id !== submoduleId && next.has(`s_${moduleId}_${sub.id}`),
          );

          if (!hasOtherActiveSubmodule) {
            // If no other submodules are selected, unselect parent module as well
            next.delete(modKey);
          }
        }
      }
      return next;
    });
  };

  // Save updated permissions
  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSavingPerms(true);

    try {
      const permissionsList = [];

      modulesList.forEach((mod) => {
        const modKey = `m_${mod.id}`;
        const modSelected = selectedKeys.has(modKey);

        if (modSelected) {
          permissionsList.push({
            module: mod.id,
            submodule: null,
            can_view: true,
            can_create: true,
            can_update: true,
            can_delete: true,
          });
        }

        if (mod.submodules && mod.submodules.length > 0) {
          mod.submodules.forEach((sub) => {
            const subKey = `s_${mod.id}_${sub.id}`;
            if (selectedKeys.has(subKey)) {
              permissionsList.push({
                module: mod.id,
                submodule: sub.id,
                can_view: true,
                can_create: true,
                can_update: true,
                can_delete: true,
              });
            }
          });
        }
      });

      const res = await dispatch(updateSubUser(selectedUser.id, { permissions: permissionsList }));

      if (res && (res.status === true || res.statusCode === 200)) {
        message.success('User permissions updated successfully!');
        setPermModalOpen(false);
      } else {
        message.error(res?.message || 'Failed to update permissions');
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Error saving permissions');
    } finally {
      setSavingPerms(false);
    }
  };

  // Create Sub-User via Redux actionCreator
  const handleCreateUser = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        name: values.name,
        email: values.email,
        mobile_number: values.mobile,
        password: values.password,
        role: 'Staff',
        permissions: [],
      };

      const res = await dispatch(addUser(payload));

      if (res && (res.status === true || res.statusCode === 201 || res.statusCode === 200)) {
        message.success('Sub-user created successfully and credentials sent to email!');
        setOpen(false);
        form.resetFields();
      } else {
        message.error(res?.message || 'Failed to create user');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.message) {
        message.error(error.message);
      } else if (error.errorFields) {
        console.log('Validation Failed', error);
      } else {
        message.error('Error creating user');
      }
    }
  };

  // Login as Sub-User
  // const handleLoginAsSubUser = (record) => {
  //   dispatch(
  //     subUserLogin(record.id, () => {
  //       message.success(`Logged in as sub-user ${record.name} successfully! Redirecting...`);
  //       setTimeout(() => {
  //         window.location.href = '/admin';
  //       }, 800);
  //     }),
  //   );
  // };

  // Delete Sub-User via Redux actionCreator
  const handleDeleteUser = async (id) => {
    try {
      const res = await dispatch(deleteSubUser(id));
      if (res && res.status) {
        message.success('User deleted successfully');
      } else {
        message.error(res?.message || 'Failed to delete user');
      }
    } catch (err) {
      message.error(err.response?.data?.message || err.message || 'Error deleting user');
    }
  };

  /* ================= MAIN USER TABLE COLUMNS ================= */

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${status === 'Active' ? 'bg-success-transparent text-success' : 'bg-danger-transparent text-danger'
            }`}
        >
          {status}
        </span>
      ),
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {/* View Icon */}
          <Button
            type="text"
            className="text-info hover:bg-info-transparent rounded p-1"
            title="View User Details"
            icon={<UilEye className="w-4 h-4 text-sky-600" />}
            onClick={() => handleOpenViewModal(record)}
          />

          {/* Edit Icon */}
          <Button
            type="text"
            className="text-warning hover:bg-warning-transparent rounded p-1"
            title="Edit Sub-User"
            icon={<UilEdit className="w-4 h-4 text-amber-600" />}
            onClick={() => handleOpenEditModal(record)}
          />

          {/* Lock Icon for Permissions */}
          <Button
            type="text"
            className="text-primary hover:bg-primary-transparent rounded p-1"
            title="Manage Permissions"
            icon={<UilLock className="w-4 h-4 text-primary" />}
            onClick={() => handleOpenPermissionsModal(record)}
          />

          {/* Login as Sub-User Icon */}
          {/* <Popconfirm
            title={`Are you sure you want to login as ${record.name}?`}
            onConfirm={() => handleLoginAsSubUser(record)}
            okText="Yes, Login"
            cancelText="No"
          >
            <Button
              type="text"
              className="text-emerald-600 hover:bg-emerald-50 rounded p-1"
              title="Login as Sub-User"
              icon={<UilSignin className="w-4 h-4 text-emerald-600" />}
            />
          </Popconfirm> */}

          {/* Delete Icon */}
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" danger icon={<UilTrashAlt className="w-4 h-4" />} title="Delete User" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const filteredUsers = users.filter((user) => {
    const search = searchText.toLowerCase().trim();

    const matchesSearch =
      !search || user.name?.toLowerCase().includes(search) || user.email?.toLowerCase().includes(search);

    const matchesRole = roleFilter === 'all' || user.role?.toLowerCase() === roleFilter.toLowerCase();

    const matchesStatus = statusFilter === 'all' || user.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;

  const activeUsers = users.filter((user) => user.status?.toLowerCase() === 'active').length;

  const pendingUsers = users.filter((user) => user.status?.toLowerCase() === 'pending').length;

  const ownerUsers = users.filter((user) => user.role?.toLowerCase() === 'owner').length;

  /* ================= PERMISSIONS TABLE COLUMNS ================= */

  // Flatten module & submodules for single-column permissions list
  const permDataRows = [];
  modulesList.forEach((mod) => {
    // Module master row
    permDataRows.push({
      key: `m_${mod.id}`,
      isModule: true,
      moduleId: mod.id,
      submoduleId: null,
      name: mod.name,
      moduleObj: mod,
    });

    // Submodules rows
    if (mod.submodules && mod.submodules.length > 0) {
      mod.submodules.forEach((sub) => {
        permDataRows.push({
          key: `s_${mod.id}_${sub.id}`,
          isModule: false,
          moduleId: mod.id,
          submoduleId: sub.id,
          name: sub.name,
          moduleName: mod.name,
        });
      });
    }
  });

  const permColumns = [
    {
      title: 'Module / Submodule',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        if (record.isModule) {
          return (
            <div className="flex items-center gap-2 py-1">
              <Tag color="blue" className="font-semibold text-xs m-0">
                MODULE
              </Tag>
              <span className="font-semibold text-gray-800 text-sm">{text}</span>
            </div>
          );
        }
        return (
          <div className="pl-6 flex items-center gap-2 py-0.5">
            <span className="text-gray-400">└─</span>
            <span className="text-gray-700 text-sm">{text}</span>
          </div>
        );
      },
    },
    {
      title: 'Access Permission',
      key: 'access',
      align: 'center',
      width: 160,
      render: (_, record) => {
        const itemKey = record.isModule ? `m_${record.moduleId}` : `s_${record.moduleId}_${record.submoduleId}`;
        const isChecked = selectedKeys.has(itemKey);

        return (
          <Checkbox checked={isChecked} onChange={(e) => handleToggleItem(record, e.target.checked)}>
            {isChecked ? (
              <span className="text-emerald-600 font-medium text-xs">Granted</span>
            ) : (
              <span className="text-gray-400 text-xs">Denied</span>
            )}
          </Checkbox>
        );
      },
    },
  ];

  return (
    <>
      <main className="min-h-[715px] flex-1 bg-[#f4f5f7] px-6 xl:px-[15px] pb-[20px]">
        {/* ================= BREADCRUMB ================= */}

        <div className="pt-5 mb-1">
          <div className="flex items-center gap-1 text-[13px]">
            <span className="text-[#666D92]">Settings</span>
            <span className="text-gray-400">›</span>
            <span className="text-[#666D92]">User Settings</span>
            <span className="text-gray-400">›</span>
            <span className="text-dark font-medium">User Management</span>
          </div>
        </div>

        {/* ================= TITLE ================= */}

        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-[25px] leading-[28px] font-semibold text-dark mb-1">User Management</h1>

            <p className="text-[13px] text-[#666D92] max-w-[430px] leading-[18px]">
              Control who can access Artisan Roots&apos; dashboard, and what each person can see or change.
            </p>
          </div>

          <Button
            type="primary"
            onClick={() => setOpen(true)}
            className="!bg-primary !border-primary !rounded-[7px] !h-[30px] !px-2 text-[14px] flex items-center gap-2"
          >
            <UilUserPlus className="w-[15px] h-[15px]" />
            Add new user
          </Button>
        </div>

        {/* ================= STAT CARDS ================= */}

        <div className="grid grid-cols-4 gap-3 mb-5 lg:grid-cols-2 md:grid-cols-1">
          {/* TOTAL USERS */}
          <div className="bg-white border border-[#dfe3e8] rounded-[9px] px-4 py-3 h-[61px]">
            <div className="text-[19px] font-semibold text-dark leading-[20px]">{totalUsers}</div>

            <div className="text-[13px] text-light mt-1">Total users</div>
          </div>

          {/* ACTIVE */}
          <div className="bg-white border border-[#dfe3e8] rounded-[9px] px-4 py-3 h-[61px]">
            <div className="text-[19px] font-semibold text-success leading-[20px]">{activeUsers}</div>

            <div className="text-[13px] text-light mt-1">Active</div>
          </div>

          {/* PENDING */}
          <div className="bg-white border border-[#dfe3e8] rounded-[9px] px-4 py-3 h-[61px]">
            <div className="text-[19px] font-semibold text-warning leading-[20px]">{pendingUsers}</div>

            <div className="text-[13px] text-light mt-1">Invite pending</div>
          </div>

          {/* OWNER */}
          <div className="bg-white border border-[#dfe3e8] rounded-[9px] px-4 py-3 h-[61px]">
            <div className="text-[19px] font-semibold text-dark leading-[20px]">{ownerUsers}</div>

            <div className="text-[13px] text-light mt-1">Owner</div>
          </div>
        </div>

        {/* ================= SEARCH + FILTER ================= */}

        <div className="flex items-center gap-2 mb-3 md:flex-col md:items-stretch">
          {/* SEARCH */}
          <div className="relative flex-1">
            <UilSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[#8b95a5] z-10" />

            <Input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by name or email"
              className="
        !h-[34px]
        !pl-9
        !pr-3
        !rounded-[7px]
        !border-[#dfe3e8]
        !bg-white
        !text-[11px]
        !text-[#404040]
        placeholder:!text-[#7b8494]
        hover:!border-[#cfd5dd]
        focus:!border-[#cfd5dd]
        focus:!shadow-none
      "
            />
          </div>

          {/* ROLE FILTER */}
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            className="
      !w-[110px]
      !h-[34px]
      [&_.ant-select-selector]:!h-[30px]
      [&_.ant-select-selector]:!rounded-[7px]
      [&_.ant-select-selector]:!border-[#dfe3e8]
      [&_.ant-select-selector]:!bg-white
      [&_.ant-select-selector]:!shadow-none
      [&_.ant-select-selection-item]:!text-[11px]
      [&_.ant-select-selection-item]:!leading-[28px]
      [&_.ant-select-selection-placeholder]:!text-[11px]
      [&_.ant-select-selection-placeholder]:!leading-[28px]
    "
            options={[
              {
                value: 'all',
                label: 'All roles',
              },
              {
                value: 'owner',
                label: 'Owner',
              },
              {
                value: 'admin',
                label: 'Admin',
              },
              {
                value: 'staff',
                label: 'Staff',
              },
            ]}
          />

          {/* STATUS FILTER */}
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="
      !w-[120px]
      !h-[34px]
      [&_.ant-select-selector]:!h-[30px]
      [&_.ant-select-selector]:!rounded-[7px]
      [&_.ant-select-selector]:!border-[#dfe3e8]
      [&_.ant-select-selector]:!bg-white
      [&_.ant-select-selector]:!shadow-none
      [&_.ant-select-selection-item]:!text-[11px]
      [&_.ant-select-selection-item]:!leading-[28px]
      [&_.ant-select-selection-placeholder]:!text-[11px]
      [&_.ant-select-selection-placeholder]:!leading-[28px]
    "
            options={[
              {
                value: 'all',
                label: 'All status',
              },
              {
                value: 'active',
                label: 'Active',
              },
              {
                value: 'pending',
                label: 'Pending',
              },
            ]}
          />
        </div>

        {/* ================= EXISTING USER TABLE ================= */}

        <div className="bg-white border border-[#dfe3e8] rounded-[9px] overflow-hidden">
          <Spin spinning={subUsersLoading}>
            <Table
              columns={columns}
              dataSource={filteredUsers}
              pagination={false}
              rowKey="id"
              locale={{
                emptyText: <Empty description="No users found" className="py-10" />,
              }}
              className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-[6px]
  "
            />
          </Spin>
        </div>
      </main>

      {/* ================= ADD NEW USER MODAL ================= */}

      <Modal title="Add New User" open={open} onCancel={() => setOpen(false)} footer={null} centered>
        <p className="text-gray-500 mb-4">Enter the following details to create new user</p>

        <Form form={form} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Enter name' }]}>
            <Input placeholder="Enter Name" />
          </Form.Item>

          <Form.Item
            label="Email address"
            name="email"
            rules={[
              { required: true, message: 'Enter email' },
              { type: 'email', message: 'Invalid email' },
            ]}
          >
            <Input placeholder="Enter Email" />
          </Form.Item>

          <Form.Item
            label="Mobile Number"
            name="mobile"
            rules={[
              { required: true, message: 'Enter mobile number' },
              {
                pattern: /^[0-9]{10,15}$/,
                message: 'Mobile number must contain 10 to 15 digits',
              },
            ]}
          >
            <Input
              placeholder="Enter Mobile number"
              maxLength={15}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                form.setFieldsValue({ mobile: val });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Enter password' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/,
                message:
                  'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.',
              },
            ]}
          >
            <Input.Password placeholder="Enter Password" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="primary" loading={adduserLoading} onClick={handleCreateUser}>
              Create User
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ================= VIEW USER DETAILS MODAL ================= */}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <UilEye className="w-5 h-5 text-sky-600" />
            <span>Sub-User Details — {viewUser?.name}</span>
          </div>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>,
        ]}
        centered
        width={550}
      >
        <div className="py-2">
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Full Name">
              <span className="font-semibold text-gray-800">{viewUser?.name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Email Address">{viewUser?.email}</Descriptions.Item>
            <Descriptions.Item label="Mobile Number">{viewUser?.mobile || 'N/A'}</Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag color="green" className="font-medium text-xs px-2.5 py-0.5 m-0">
                {viewUser?.status}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Modal>

      {/* ================= EDIT SUB-USER MODAL ================= */}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <UilEdit className="w-5 h-5 text-amber-600" />
            <span>Edit Sub-User — {editingUser?.name}</span>
          </div>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        centered
      >
        <Form form={editForm} layout="vertical">
          <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Enter name' }]}>
            <Input placeholder="Enter Name" />
          </Form.Item>

          <Form.Item label="Email address">
            <Input value={editingUser?.email} disabled className="bg-gray-100 text-gray-500 cursor-not-allowed" />
          </Form.Item>

          <Form.Item
            label="Mobile Number"
            name="mobile"
            rules={[
              { required: true, message: 'Enter mobile number' },
              {
                pattern: /^[0-9]{10,15}$/,
                message: 'Mobile number must contain 10 to 15 digits',
              },
            ]}
          >
            <Input
              placeholder="Enter Mobile number"
              maxLength={15}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                editForm.setFieldsValue({ mobile: val });
              }}
            />
          </Form.Item>

          <Form.Item
            label="Reset Password (Optional)"
            name="password"
            rules={[
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/,
                message:
                  'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.',
              },
            ]}
          >
            <Input.Password placeholder="Leave blank to keep current password" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" loading={updatingUserLoading} onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ================= MANAGE PERMISSIONS MODAL ================= */}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <UilLock className="w-5 h-5 text-primary" />
            <span>Manage User Permissions — {selectedUser?.name}</span>
          </div>
        }
        open={permModalOpen}
        onCancel={() => setPermModalOpen(false)}
        width={550}
        centered
        footer={[
          <Button key="cancel" onClick={() => setPermModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="save" type="primary" loading={savingPerms} onClick={handleSavePermissions}>
            Save Permissions
          </Button>,
        ]}
      >
        <p className="text-gray-500 text-xs mb-3">
          Select modules and submodules to grant access to this sub-user based on your active subscription plan.
        </p>

        <Spin spinning={permLoading}>
          {permDataRows.length === 0 ? (
            <Empty description="No subscription modules available to assign." className="py-6" />
          ) : (
            <Table
              columns={permColumns}
              dataSource={permDataRows}
              pagination={false}
              size="small"
              bordered
              rowKey="key"
            />
          )}
        </Spin>
      </Modal>
    </>
  );
}
