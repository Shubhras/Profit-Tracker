import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Checkbox } from 'antd';
import { PlusOutlined, FormOutlined, DeleteOutlined, LockOutlined, EyeOutlined } from '@ant-design/icons';
import { UilAngleDown, UilAngleUp } from '@iconscout/react-unicons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getSubUsers,
  createSubUsers,
  updateSubUsers,
  deleteSubUsers,
  getModulesSubmodules,
  updateModulesPermission,
  getModulePermissionsDetails,
} from '../../redux/admin/actionCreator';

function AdminUsers() {
  const [createModal, setCreateModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [permissionModal, setPermissionModal] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [expandedModules, setExpandedModules] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [viewExpandedModules, setViewExpandedModules] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const dispatch = useDispatch();

  const { getSubUserslist, loading, getModuleSubmodules, modulePermissionsDetails } = useSelector(
    (state) => state.AdminDashboard,
  );

  useEffect(() => {
    dispatch(getSubUsers(pagination.current, pagination.pageSize));
  }, [dispatch, pagination.current, pagination.pageSize]);

  const handleSubmit = () => {
    const payload = {
      name,
      email,
      mobile_number: mobileNumber,
      permissions,
    };

    if (!isEdit) {
      payload.password = password;
    }

    if (isEdit) {
      dispatch(
        updateSubUsers(editId, payload, (success, res) => {
          if (success) {
            message.success(res.message);

            setCreateModal(false);
            setIsEdit(false);
            setEditId(null);

            setName('');
            setEmail('');
            setPassword('');
            setMobileNumber('');
            setPermissions([]);

            dispatch(getSubUsers());
          } else {
            message.error(res?.message || 'Something went wrong');
          }
        }),
      );
    } else {
      dispatch(
        createSubUsers(payload, (success, res) => {
          if (success) {
            message.success(res.message);

            setCreateModal(false);

            setName('');
            setEmail('');
            setPassword('');
            setMobileNumber('');
            setPermissions([]);

            dispatch(getSubUsers());
          } else {
            message.error(res?.message || 'Something went wrong');
          }
        }),
      );
    }
  };

  const toggleModule = (id) => {
    setExpandedModules((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleEdit = (record) => {
    setIsEdit(true);
    setEditId(record.id);

    setName(record.name || '');
    setEmail(record.email || '');
    setPassword('');
    setMobileNumber(record.mobile_number || '');
    setPermissions(record.permissions || []);

    setCreateModal(true);
  };

  const handleDeleteClick = (record) => {
    setSelectedUser(record);
    setDeleteModal(true);
  };
  const handleDeleteUser = () => {
    if (!selectedUser) return;

    dispatch(
      deleteSubUsers(selectedUser.id, (success, res) => {
        if (success) {
          message.success(res?.message || 'User deleted successfully');

          setDeleteModal(false);
          setSelectedUser(null);

          dispatch(getSubUsers());
        } else {
          message.error(res?.message || 'Something went wrong');
        }
      }),
    );
  };

  const handlePermissionModal = (record) => {
    setSelectedUser(record);

    dispatch(
      getModulesSubmodules((success) => {
        if (success) {
          setPermissions(record.permissions || []);
          setPermissionModal(true);
        } else {
          message.error('Unable to load modules');
        }
      }),
    );
  };

  const handlePermissionChange = (moduleId, submoduleId, checked) => {
    console.log('Checkbox clicked');

    setPermissions((prev) => {
      const updated = checked
        ? [
            ...prev,
            {
              module: moduleId,
              submodule: submoduleId,
              can_view: true,
              can_create: true,
              can_update: true,
              can_delete: false,
            },
          ]
        : prev.filter((item) => !(item.module === moduleId && item.submodule === submoduleId));

      console.log('updated', updated);

      return updated;
    });
  };

  const handleSavePermissions = () => {
    console.log('permissions:', permissions);

    const payload = {
      permissions,
    };

    console.log('payload:', payload);

    dispatch(
      updateModulesPermission(selectedUser.id, payload, (success, res) => {
        if (success) {
          message.success(res.message);
          setPermissionModal(false);
          dispatch(getSubUsers());
        } else {
          message.error(res?.message || 'Something went wrong');
        }
      }),
    );
  };

  const handleViewDetails = (record) => {
    dispatch(
      getModulesSubmodules((success) => {
        if (success) {
          dispatch(
            getModulePermissionsDetails(record.id, (res) => {
              if (success) {
                setViewModal(true);
              } else {
                message.error(res?.message);
              }
            }),
          );
        }
      }),
    );
  };

  const toggleViewModule = (id) => {
    setViewExpandedModules((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const userData =
    getSubUserslist?.results?.data?.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      mobile_number: item.mobile_number,
      username: item.username,
      permissions: item.permissions,
      created_at: item.created_at,
    })) || [];

  const columns = [
    {
      title: '#',
      render: (_, __, index) => index + 1,
      width: 70,
      align: 'center',
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'User Name',
      dataIndex: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile_number',
    },
    // {
    //   title: 'Permissions',
    //   dataIndex: 'permissions',
    //   render: (_, record) => record.permissions?.length || 0,
    // },

    {
      title: '',
      key: 'action',
      align: 'center',
      width: 120,
      render: (record) => (
        <div className="flex items-center justify-center">
          <Button
            type="text"
            icon={<EyeOutlined className="text-blue-500 text-[16px]" />}
            onClick={() => handleViewDetails(record)}
          />

          <Button
            type="text"
            icon={<FormOutlined className="text-blue-600 text-[16px]" />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            icon={<LockOutlined className="text-orange-500 text-[16px]" />}
            onClick={() => handlePermissionModal(record)}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined className="text-red-500 text-[16px]" />}
            onClick={() => handleDeleteClick(record)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-semibold text-gray-800">Admin Users</h2>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="h-8 px-2 rounded-l text-[13px] font-semibold flex items-center"
              onClick={() => {
                setIsEdit(false);
                setEditId(null);

                setName('');
                setEmail('');
                setPassword('');
                setMobileNumber('');
                setPermissions([]);
                setCreateModal(true);
              }}
            >
              Create SubUsers
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={userData}
            rowKey="id"
            loading={loading}
            size="small"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: userData.length,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={(pag) => {
              setPagination({
                current: pag.current,
                pageSize: pag.pageSize,
              });
            }}
            className="
    [&_.ant-table-thead>tr>th]:!text-[13px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[13px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
          />
        </div>
      </div>

      <Modal
        open={createModal}
        footer={null}
        centered
        width={650}
        destroyOnClose
        onCancel={() => setCreateModal(false)}
      >
        <div className="p-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">{isEdit ? 'Update Admin User' : 'Create Admin User'}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Full Name</label>

              <Input
                placeholder="Enter full name"
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>

              <Input
                placeholder="example@gmaill.com"
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Password</label>

              <Input.Password
                size="small"
                className="h-8"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">Mobile Number</label>

              <Input
                size="small"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter mobile number"
                value={mobileNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setMobileNumber(value);
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-7 border-t pt-4">
            <Button onClick={() => setCreateModal(false)}>Cancel</Button>

            <Button type="primary" className="font-semibold px-4" onClick={handleSubmit}>
              Create User
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModal} footer={null} centered width={420} onCancel={() => setDeleteModal(false)}>
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <DeleteOutlined
              style={{
                fontSize: 26,
                color: '#ef4444',
              }}
            />
          </div>

          <h2 className="text-lg font-semibold">Delete Admin User?</h2>

          <p className="text-gray-500 mt-1">
            Are you sure you want to delete
            <span className="font-semibold"> {selectedUser?.name}</span>?
          </p>

          <div className="flex justify-center gap-3 mt-7">
            <Button
              onClick={() => {
                setDeleteModal(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>

            <Button danger type="primary" className="font-semibold" onClick={handleDeleteUser}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={permissionModal}
        title={`Manage Permissions - ${selectedUser?.name}`}
        width={600}
        footer={null}
        onCancel={() => setPermissionModal(false)}
      >
        {getModuleSubmodules?.data?.map((module) => {
          const expanded = expandedModules.includes(module.id);

          return (
            <div key={module.id} className="border rounded-xl mb-4 overflow-hidden">
              {/* Module Row */}

              <div className="flex justify-between items-center p-3 bg-white">
                <Checkbox
                  checked={
                    module.submodules.length > 0
                      ? module.submodules.some((submodule) =>
                          permissions.some((item) => item.module === module.id && item.submodule === submodule.id),
                        )
                      : permissions.some((item) => item.module === module.id && item.submodule == null)
                  }
                  onChange={(e) => {
                    const isChecked = e.target.checked;

                    if (module.submodules.length === 0) {
                      if (isChecked) {
                        setPermissions((prev) => [
                          ...prev.filter((item) => item.module !== module.id),
                          {
                            module: module.id,
                            submodule: null,
                            can_view: true,
                            can_create: true,
                            can_update: true,
                            can_delete: false,
                          },
                        ]);
                      } else {
                        setPermissions((prev) => prev.filter((item) => item.module !== module.id));
                      }

                      return;
                    }

                    if (isChecked) {
                      const modulePermissions = module.submodules.map((submodule) => ({
                        module: module.id,
                        submodule: submodule.id,
                        can_view: true,
                        can_create: true,
                        can_update: true,
                        can_delete: false,
                      }));

                      setPermissions((prev) => [
                        ...prev.filter((item) => item.module !== module.id),
                        ...modulePermissions,
                      ]);
                    } else {
                      setPermissions((prev) => prev.filter((item) => item.module !== module.id));
                    }
                  }}
                >
                  <span className="font-semibold text-[14px]">{module.name}</span>
                </Checkbox>

                {module.submodules?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="
    w-8
    h-8
    rounded-full
    hover:bg-[#EEF2FF]
    flex
    items-center
    justify-center
    cursor-pointer
    transition-all
    duration-200
  "
                  >
                    {expanded ? <UilAngleUp size={20} color="#6366F1" /> : <UilAngleDown size={20} color="#64748B" />}
                  </button>
                )}
              </div>

              {/* Sub Modules */}

              {expanded && module.submodules?.length > 0 && (
                <div className="px-6 pb-3 bg-[#fafafa] border-t">
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    {module.submodules.map((sub) => (
                      <Checkbox
                        key={sub.id}
                        checked={permissions.some((item) => item.module === module.id && item.submodule === sub.id)}
                        onChange={(e) => {
                          console.log('Checkbox fired', e.target.checked);
                          handlePermissionChange(module.id, sub.id, e.target.checked);
                        }}
                      >
                        {sub.name}
                      </Checkbox>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <Button
            onClick={() => {
              setPermissionModal(false);
            }}
          >
            Cancel
          </Button>

          <Button type="primary" className="font-semibold" onClick={handleSavePermissions}>
            Save
          </Button>
        </div>
      </Modal>

      <Modal
        open={viewModal}
        footer={null}
        width={700}
        centered
        title="Admin User Details"
        onCancel={() => {
          setViewModal(false);
          setViewExpandedModules([]);
        }}
      >
        {/* User Details */}

        <div className="grid grid-cols-2 gap-2 mb-4 border-b pb-3">
          <div>
            <p className="text-[13px] text-gray-500 mb-0">Name</p>
            <p className="font-semibold">{modulePermissionsDetails?.data?.name}</p>
          </div>

          <div>
            <p className="text-[13px] text-gray-500 mb-0">Email</p>
            <p className="font-semibold">{modulePermissionsDetails?.data?.email}</p>
          </div>

          <div>
            <p className="text-[13px] text-gray-500 mb-0">Username</p>
            <p className="font-semibold">{modulePermissionsDetails?.data?.username}</p>
          </div>

          <div>
            <p className="text-[13px] text-gray-500 mb-0">Mobile</p>
            <p className="font-semibold">{modulePermissionsDetails?.data?.mobile_number}</p>
          </div>
        </div>

        {/* Permissions */}

        <h3 className="font-semibold mb-3">Module Permissions</h3>

        {Object.values(
          modulePermissionsDetails?.data?.permissions?.reduce((acc, item) => {
            if (!acc[item.module]) {
              acc[item.module] = {
                module: item.module,
                module_name: item.module_name,
                submodules: [],
              };
            }

            acc[item.module].submodules.push(item);

            return acc;
          }, {}) || {},
        ).map((module) => {
          const expanded = viewExpandedModules.includes(module.module);

          return (
            <div key={module.module} className="border rounded-xl mb-4 overflow-hidden">
              {/* Module */}

              <div className="flex justify-between items-center px-4 py-2 bg-white">
                <div className="font-semibold">
                  {getModuleSubmodules?.data?.find((m) => m.id === module.module)?.name}
                </div>

                <button
                  type="button"
                  onClick={() => toggleViewModule(module.module)}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  {expanded ? <UilAngleUp size={18} /> : <UilAngleDown size={18} />}
                </button>
              </div>

              {/* Submodules */}

              {expanded && (
                <div className="bg-gray-50 border-t">
                  {module.submodules.length > 0 && module.submodules.some((sub) => sub.submodule !== null) ? (
                    module.submodules.map((sub) => {
                      const submoduleName = getModuleSubmodules?.data
                        ?.find((m) => m.id === module.module)
                        ?.submodules.find((s) => s.id === sub.submodule)?.name;

                      return (
                        <div key={sub.submodule} className="px-5 py-2 border-b last:border-b-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />

                            <span className="font-medium text-[14px] text-gray-700">{submoduleName}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-5 py-4 text-sm text-gray-500 italic">No submodule found for this module.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Modal>
    </>
  );
}

export default AdminUsers;
