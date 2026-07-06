import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Input, Select, Switch, message } from 'antd';
import { PlusOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import {
  getSubModules,
  getModules,
  createSubModules,
  updateSubModules,
  deleteSubModules,
} from '../../redux/admin/actionCreator';

function SubModule() {
  const dispatch = useDispatch();

  const { getModuleslist, getsubModule, loading } = useSelector((state) => state.AdminDashboard);

  useEffect(() => {
    dispatch(getSubModules());
    dispatch(getModules());
  }, [dispatch]);

  const [createModal, setCreateModal] = useState(false);

  const [moduleId, setModuleId] = useState();
  const [subModuleName, setSubModuleName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isEdit, setIsEdit] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSubModule, setSelectedSubModule] = useState(null);

  const moduleOptions =
    getModuleslist?.data?.map((item) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const handleEdit = (record) => {
    setIsEdit(true);
    setSelectedId(record.id);

    setModuleId(record.module);

    setSubModuleName(record.name);
    setDescription(record.description);
    setIsActive(record.status);

    setCreateModal(true);
  };

  const handleDelete = (record) => {
    setSelectedSubModule(record);
    setDeleteModal(true);
  };

  const handleDeleteSubModule = () => {
    dispatch(
      deleteSubModules(selectedSubModule.id, (success, response) => {
        if (success) {
          message.success(response?.message || 'Sub Module deleted successfully');

          setDeleteModal(false);
          setSelectedSubModule(null);

          dispatch(getSubModules());
        } else {
          message.error(response?.message || 'Failed to delete Sub Module');
        }
      }),
    );
  };

  const resetForm = () => {
    setModuleId();
    setSubModuleName('');
    setDescription('');
    setIsActive(true);
    setSelectedId(null);
    setIsEdit(false);
  };

  const subModuleData =
    getsubModule?.data?.map((item) => ({
      id: item.id,
      module: item.module,
      module_name: item.module_name,
      name: item.name,
      description: item.description,
      status: item.is_active,
    })) || [];

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Sub Module',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Module Name',
      dataIndex: 'module_name',
      key: 'module_name',
    },

    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span title={text}>{text?.length > 40 ? `${text.slice(0, 40)}...` : text || '-'}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => <Tag color={status ? 'green' : 'red'}>{status ? 'Active' : 'Inactive'}</Tag>,
    },

    {
      title: 'Action',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            type="text"
            icon={<FormOutlined className="text-blue-600 text-[16px]" />}
            onClick={() => handleEdit(record)}
          />

          <Button
            type="text"
            danger
            icon={<DeleteOutlined className="text-red-500 text-[16px]" />}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  const handleSubmit = () => {
    if (!moduleId) {
      message.error('Please select module');
      return;
    }

    if (!subModuleName.trim()) {
      message.error('Please enter submodule name');
      return;
    }

    const payload = {
      module: moduleId,
      name: subModuleName,
      description,
      is_active: isActive,
    };

    if (isEdit) {
      dispatch(
        updateSubModules(selectedId, payload, (success, res) => {
          if (success) {
            message.success(res?.message || 'Sub Module updated successfully');

            setCreateModal(false);
            resetForm();

            dispatch(getSubModules());
          } else {
            message.error(res?.message || 'Something went wrong');
          }
        }),
      );
    } else {
      dispatch(
        createSubModules(payload, (success, res) => {
          if (success) {
            message.success(res?.message || 'Sub Module created successfully');

            setCreateModal(false);
            resetForm();

            dispatch(getSubModules());
          } else {
            message.error(res?.message || 'Something went wrong');
          }
        }),
      );
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[20px] font-semibold text-gray-800">Sub Modules</h2>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="h-8 px-2 rounded-lg text-[14px] font-semibold flex items-center"
              onClick={() => {
                resetForm();
                setCreateModal(true);
              }}
            >
              Create SubModules
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={subModuleData}
            loading={loading}
            rowKey={(record) => record.id}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            bordered
            scroll={{ x: 700 }}
            size="small"
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
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
        width={500}
        destroyOnClose
        onCancel={() => {
          setCreateModal(false);
          resetForm();
        }}
      >
        <div className="p-2">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">{isEdit ? 'Update Sub Module' : 'Create Sub Module'}</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Module</label>

              <Select
                className="w-full"
                placeholder="Select Module"
                size="small"
                options={moduleOptions}
                value={moduleId}
                onChange={setModuleId}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Sub Module Name</label>

              <Input
                placeholder="Enter Sub Module Name"
                value={subModuleName}
                size="small"
                onChange={(e) => setSubModuleName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Description</label>

              <Input.TextArea
                rows={2}
                placeholder="Description"
                value={description}
                size="small"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Active</span>

              <Switch checked={isActive} onChange={setIsActive} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6 border-t pt-4">
            <Button
              onClick={() => {
                setCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>

            <Button type="primary" className="font-semibold px-2 text-[13px] " onClick={handleSubmit}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteModal}
        footer={null}
        centered
        width={420}
        onCancel={() => {
          setDeleteModal(false);
          setSelectedSubModule(null);
        }}
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <DeleteOutlined
              style={{
                fontSize: 26,
                color: '#ef4444',
              }}
            />
          </div>

          <h2 className="text-lg font-semibold">Delete Sub Module?</h2>

          <p className="text-gray-500 mt-2">
            Are you sure you want to delete
            <span className="font-semibold"> {selectedSubModule?.name}</span>?
          </p>

          <div className="flex justify-center gap-3 mt-7">
            <Button
              onClick={() => {
                setDeleteModal(false);
                setSelectedSubModule(null);
              }}
            >
              Cancel
            </Button>

            <Button danger type="primary" className="font-semibold" onClick={handleDeleteSubModule}>
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default SubModule;
