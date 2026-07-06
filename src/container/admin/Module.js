import React, { useState, useEffect } from 'react';
import { Button, Modal, Select, message, Input, Tag, Spin } from 'antd';
import { PlusOutlined, EyeOutlined, FormOutlined, DeleteOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  createModules,
  getModules,
  updateModules,
  deleteModules,
  ViewSingleModule,
} from '../../redux/admin/actionCreator';

function Module() {
  const dispatch = useDispatch();

  const [createModal, setCreateModal] = useState(false);

  const [moduleName, setModuleName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isEdit, setIsEdit] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);

  const [viewModal, setViewModal] = useState(false);
  const [moduleDetails, setModuleDetails] = useState(null);

  const { getModuleslist, loading } = useSelector((state) => state.AdminDashboard);

  useEffect(() => {
    dispatch(getModules());
  }, [dispatch]);

  const moduleData =
    getModuleslist?.data?.map((item) => ({
      key: item.id,
      id: item.id,
      name: item.name,
      description: item.description,
      status: item.is_active,
      createdAt: item.created_at,
    })) || [];

  // const columns = [
  //   {
  //     title: 'Name',
  //     dataIndex: 'name',
  //     align: 'center',
  //   },
  //   {
  //     title: 'Description',
  //     dataIndex: 'description',
  //     align: 'center',
  //     render: (text) => text || '-',
  //   },
  //   {
  //     title: 'Status',
  //     dataIndex: 'status',
  //     align: 'center',
  //     render: (status) => <Tag color={status ? 'green' : 'red'}>{status ? 'Active' : 'Inactive'}</Tag>,
  //   },
  //   {
  //     title: '',
  //     key: 'action',
  //     align: 'center',
  //     width: 140,
  //     render: () => (
  //       <div className="flex items-center justify-center gap-1">
  //         <Tooltip title="View">
  //           <Button
  //             type="text"
  //             icon={<EyeOutlined />}
  //             //  onClick={() => handleView(record)}
  //           />
  //         </Tooltip>

  //         <Tooltip title="Edit">
  //           <Button
  //             type="text"
  //             icon={<FormOutlined />}
  //             //  onClick={() => handleEdit(record)}
  //           />
  //         </Tooltip>

  //         <Tooltip title="Delete">
  //           <Button
  //             type="text"
  //             danger
  //             icon={<DeleteOutlined />}
  //             // onClick={() => handleDelete(record)}
  //           />
  //         </Tooltip>
  //       </div>
  //     ),
  //   },
  // ];

  const handleCreateModule = () => {
    const payload = {
      name: moduleName,
      description,
      is_active: isActive,
    };

    if (isEdit) {
      dispatch(
        updateModules(selectedModuleId, payload, (success, response) => {
          if (success) {
            message.success(response.message);

            setCreateModal(false);
            setIsEdit(false);
            setSelectedModuleId(null);

            setModuleName('');
            setDescription('');
            setIsActive(true);

            dispatch(getModules());
          }
        }),
      );
    } else {
      dispatch(
        createModules(payload, (success, response) => {
          if (success) {
            message.success(response.message);

            setCreateModal(false);

            setModuleName('');
            setDescription('');
            setIsActive(true);

            dispatch(getModules());
          }
        }),
      );
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setSelectedModuleId(item.id);

    setModuleName(item.name);
    setDescription(item.description);
    setIsActive(item.status);

    setCreateModal(true);
  };

  const handleDeleteModule = () => {
    dispatch(
      deleteModules(selectedModule.id, (success, response) => {
        if (success) {
          message.success(response.message);

          setDeleteModal(false);
          setSelectedModule(null);

          dispatch(getModules());
        } else {
          message.error('Failed to delete module');
        }
      }),
    );
  };

  const handleView = (item) => {
    dispatch(
      ViewSingleModule(item.id, (success, response) => {
        if (success) {
          setModuleDetails(response.data);
          setViewModal(true);
        } else {
          message.error('Unable to fetch module');
        }
      }),
    );
  };

  return (
    <>
      {/* <div className="min-h-screen p-3 px-2">
        <div className="flex gap-5 items-start">
          <div className="flex-1 bg-white rounded-2xl border border-[#e5e7eb] p-5 overflow-hidden">
            {' '}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-semibold text-[#111827] mb-0">Modules</h2>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="px-2 text-[14px] font-semibold flex items-center"
                onClick={() => setCreateModal(true)}
              >
                Create Module
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={moduleData}
              loading={loading}
              pagination={{ pageSize: 10 }}
              size="middle"
              rowKey="id"
            />
          </div>
        </div>
      </div> */}
      <div className="min-h-screen p-3 px-2">
        <div className="flex gap-5 items-start">
          <div className="flex-1 bg-white rounded-2xl border border-[#e5e7eb] p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[22px] font-semibold text-[#111827] mb-1">Modules</h2>
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setIsEdit(false);
                  setSelectedModuleId(null);

                  setModuleName('');
                  setDescription('');
                  setIsActive(true);

                  setCreateModal(true);
                }}
                className="h-8 px-2 rounded-l text-[13px] font-semibold flex items-center"
              >
                Create Module
              </Button>
            </div>

            {/* Loading */}
            <Spin spinning={loading}>
              <div className="grid grid-cols-1 min-md:grid-cols-2 min-xl:grid-cols-3 gap-6">
                {' '}
                {moduleData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Top */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                          <AppstoreOutlined
                            style={{
                              fontSize: 24,
                              color: '#2563eb',
                            }}
                          />
                        </div>

                        <Tag color={item.status ? 'green' : 'red'}>{item.status ? 'Active' : 'Inactive'}</Tag>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-800 mt-3">{item.name}</h3>

                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {item.description || 'No description available'}
                      </p>

                      <div className="mt-3 text-[13px] text-gray-400">Created on</div>

                      <div className="text-[14px] font-medium text-gray-700">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="grid grid-cols-3 border-t">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(item)}
                        className="h-12 rounded-none flex items-center"
                      >
                        View
                      </Button>

                      <Button
                        type="text"
                        icon={<FormOutlined />}
                        className="h-12 rounded-none border-x flex items-center"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>

                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        className="h-12 rounded-none flex items-center"
                        onClick={() => {
                          setSelectedModule(item);
                          setDeleteModal(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Spin>
          </div>
        </div>
      </div>
      <Modal
        open={createModal}
        footer={null}
        width={480}
        centered
        destroyOnClose
        onCancel={() => setCreateModal(false)}
      >
        <div className="p-2">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">{isEdit ? 'Update Module' : 'Create Module'}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Module Name</label>

              <Input
                size="small"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Enter module name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>

              <Input.TextArea
                size="small"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoSize={{
                  minRows: 2,
                  maxRows: 4,
                }}
                placeholder="Enter description"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>

              <Select
                size="small"
                value={isActive}
                style={{ width: 160 }}
                onChange={setIsActive}
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

          <div className="flex justify-end gap-2 mt-6 border-t pt-4">
            <Button className="px-2 text-[13px]" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>

            <Button type="primary" className="px-2 text-[13px] font-semibold" onClick={handleCreateModule}>
              {isEdit ? 'Update Module' : 'Create Module'}
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

          <h2 className="text-lg font-semibold">Delete Module?</h2>

          <p className="text-gray-500 mt-0">
            Are you sure you want to delete
            <span className="font-semibold"> {selectedModule?.name}</span>?
          </p>

          <div className="flex justify-center gap-3 mt-7">
            <Button onClick={() => setDeleteModal(false)}>Cancel</Button>

            <Button danger type="primary" className="font-semibold" onClick={handleDeleteModule}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={viewModal} footer={null} width={700} centered onCancel={() => setViewModal(false)}>
        <div className="p-2">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <AppstoreOutlined
                    style={{
                      fontSize: 22,
                      color: '#2563eb',
                    }}
                  />
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-0">{moduleDetails?.name}</h2>

                  <Tag color={moduleDetails?.is_active ? 'green' : 'red'}>
                    {moduleDetails?.is_active ? 'Active' : 'Inactive'}
                  </Tag>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="font-semibold mb-2">Description</div>

            <div className="bg-gray-50 rounded-xl p-4 text-gray-600">
              {moduleDetails?.description || 'No description available'}
            </div>
          </div>

          <div className="mt-7">
            <div className="font-semibold mb-4">Sub Modules</div>

            <div className="space-y-3">
              {moduleDetails?.submodules?.length > 0 ? (
                moduleDetails.submodules.map((sub) => (
                  <div key={sub.id} className="border rounded-xl p-3 hover:shadow transition">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-[15px]">{sub.name}</h4>

                      <Tag color={sub.is_active ? 'green' : 'red'}>{sub.is_active ? 'Active' : 'Inactive'}</Tag>
                    </div>

                    <p className="text-gray-500 text-sm">{sub.description || 'No description available'}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 bg-gray-50 rounded-xl text-gray-400">
                  No Sub Modules Found
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button onClick={() => setViewModal(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Module;
