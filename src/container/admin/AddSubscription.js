import React, { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, Checkbox, message, Spin } from 'antd';
import {
  ExclamationCircleFilled,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  DownOutlined,
  UpOutlined,
  TagOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  CreateSubscription,
  updateSubscription,
  getSubscriptionList,
  getModulesSubmodules,
} from '../../redux/admin/actionCreator';

function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-600 text-[15px]">{icon}</span>
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-0">{title}</h3>
          {subtitle && <p className="text-[12px] text-slate-400 mb-0">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function AddSubscription() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const subscriptionId = searchParams.get('id');

  const [form] = Form.useForm();

  const [duplicateModal, setDuplicateModal] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');

  const [expandedModules, setExpandedModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedSubmodules, setSelectedSubmodules] = useState([]);

  const { getsubscriptionData, getModuleSubmodules, loading } = useSelector((state) => state.AdminDashboard);

  const isEditMode = !!subscriptionId;

  const selectedId = subscriptionId;

  useEffect(() => {
    dispatch(getModulesSubmodules());

    if (isEditMode) {
      dispatch(getSubscriptionList());
    }
  }, [dispatch, isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;

    const plan = getsubscriptionData?.results?.data?.find((item) => String(item.id) === String(subscriptionId));

    if (!plan) return;

    form.setFieldsValue({
      plan_name: plan.plan_name,
      description: plan.description,
      monthly_price: plan.monthly_price,
      annual_price: plan.annual_price,
      status: plan.status,
      initial_sync_duration: plan.initial_sync_duration,
      max_channel_connection: plan.max_channel_connection,
      features: plan.features || [],
      terms_and_conditions: plan.terms_and_conditions || [],
    });

    setSelectedModules(plan.module_details?.map((m) => m.id) || []);

    setSelectedSubmodules(plan.submodule_details?.map((s) => s.id) || []);

    setExpandedModules(plan.module_details?.map((m) => m.id) || []);
  }, [getsubscriptionData, subscriptionId, isEditMode, form]);

  const toggleModule = (id) => {
    setExpandedModules((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleModuleChange = (module, checked) => {
    if (checked) {
      setSelectedModules((prev) => [...new Set([...prev, module.id])]);

      setSelectedSubmodules((prev) => [...new Set([...prev, ...module.submodules.map((item) => item.id)])]);
    } else {
      setSelectedModules((prev) => prev.filter((id) => id !== module.id));

      setSelectedSubmodules((prev) => prev.filter((id) => !module.submodules.some((sub) => sub.id === id)));
    }
  };

  const handleSubmoduleChange = (moduleId, subId, checked) => {
    if (checked) {
      setSelectedSubmodules((prev) => [...new Set([...prev, subId])]);

      setSelectedModules((prev) => (prev.includes(moduleId) ? prev : [...prev, moduleId]));
    } else {
      setSelectedSubmodules((prev) => prev.filter((id) => id !== subId));
    }
  };

  return (
    <Spin spinning={loading} size="large">
      <div className="px-3 p-3 bg-[#f7f7f7] min-h-screen">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl border border-[#dbe1e8] bg-white flex items-center justify-center hover:bg-[#f8fafc] transition-all duration-200 shadow-sm"
          >
            <ArrowLeftOutlined className="text-[#374151]" />
          </button>

          <h2 className="mb-0 text-[23px] font-semibold">{isEditMode ? 'Update Subscription' : 'Add Subscription'}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              const payload = {
                plan_name: values.plan_name,
                description: values.description,
                monthly_price: values.monthly_price,
                annual_price: values.annual_price,
                features: values.features || [],
                terms_and_conditions: values.terms_and_conditions || [],
                initial_sync_duration: values.initial_sync_duration,
                max_channel_connection: values.max_channel_connection,
                status: values.status,
                is_active: isEditMode ? values.status === 'active' : true,
                modules: selectedModules,
                submodules: selectedSubmodules,
              };

              if (isEditMode) {
                dispatch(
                  updateSubscription(selectedId, payload, (success, response) => {
                    if (success) {
                      message.success(response.message);

                      dispatch(getSubscriptionList());

                      navigate('/super-admin/subscription');
                    } else {
                      message.error(response?.message || 'Something went wrong');
                    }
                  }),
                );
              } else {
                const response = await dispatch(CreateSubscription(payload));

                if (response?.status === false) {
                  setDuplicateMessage(response.message);
                  setDuplicateModal(true);
                  return;
                }

                dispatch(getSubscriptionList());

                navigate('/super-admin/subscription');
              }
            }}
          >
            {/* Basic Details */}
            <SectionCard
              icon={<TagOutlined />}
              title="Basic Details"
              subtitle="Name and description shown to customers"
            >
              <Form.Item
                label="Plan Name"
                name="plan_name"
                rules={[{ required: true, message: 'Please enter plan name' }]}
              >
                <Input prefix={<TagOutlined className="text-slate-400 mr-1" />} placeholder="Enter plan name" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter description' }]}
                className="mb-0"
              >
                <Input.TextArea autoSize={{ minRows: 2 }} placeholder="Enter description" />
              </Form.Item>
            </SectionCard>

            {/* Pricing & Sync */}
            <SectionCard
              icon={<DollarOutlined />}
              title="Pricing & Sync"
              subtitle="Billing cycles and initial data sync window"
            >
              <div className="grid grid-cols-2 gap-4">
                {isEditMode && (
                  <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select status' }]}>
                    <Select
                      className="w-full"
                      options={[
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' },
                      ]}
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label="Initial Sync Days"
                  name="initial_sync_duration"
                  rules={[{ required: true, message: 'Please enter initial sync days' }]}
                  className="mb-0"
                >
                  <Input
                    type="number"
                    min={0}
                    precision={0}
                    className="w-full h-10"
                    prefix={<ClockCircleOutlined className="text-slate-400 mr-1" />}
                    placeholder="Enter days"
                    onChange={(value) => {
                      if (value > 360) {
                        form.setFieldValue('initial_sync_duration', 360);
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label="Maximum Channel Connection"
                  name="max_channel_connection"
                  rules={[{ required: true, message: 'Please enter maximum channel connection' }]}
                  className="mb-0"
                >
                  <Input
                    type="number"
                    min={0}
                    precision={0}
                    className="w-full h-10"
                    placeholder="Enter maximum channel connection"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <Form.Item
                  label="Monthly Price"
                  name="monthly_price"
                  rules={[{ required: true, message: 'Please enter monthly price' }]}
                  className="mb-0"
                >
                  <InputNumber min={0} className="w-full" prefix="₹" />
                </Form.Item>

                <Form.Item
                  label="Annual Price"
                  name="annual_price"
                  rules={[{ required: true, message: 'Please enter annual price' }]}
                  className="mb-0"
                >
                  <InputNumber min={0} className="w-full" prefix="₹" />
                </Form.Item>
              </div>
            </SectionCard>

            {/* Features */}
            <SectionCard icon={<CheckCircleOutlined />} title="Features" subtitle="What customers get with this plan">
              <Form.List name="features">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex gap-2 mb-3">
                        <Form.Item {...restField} name={name} className="flex-1 mb-0">
                          <Input
                            size="small"
                            prefix={<CheckCircleOutlined className="text-emerald-400 mr-1" />}
                            placeholder="Enter feature"
                            className="!h-8"
                          />
                        </Form.Item>

                        <Button danger icon={<DeleteOutlined className="text-[12px]" />} onClick={() => remove(name)} />
                      </div>
                    ))}

                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>
                      Add Feature
                    </Button>
                  </>
                )}
              </Form.List>
            </SectionCard>

            {/* Terms & Conditions */}
            <SectionCard
              icon={<FileTextOutlined />}
              title="Terms & Conditions"
              subtitle="Rules and clauses tied to this plan"
            >
              <Form.List name="terms_and_conditions">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex gap-2 mb-3">
                        <Form.Item
                          {...restField}
                          name={name}
                          className="flex-1 mb-0"
                          rules={[{ required: true, message: 'Please enter terms & condition' }]}
                        >
                          <Input
                            size="small"
                            prefix={<FileTextOutlined className="text-slate-400 mr-1" />}
                            placeholder="Enter terms & condition"
                            className="!h-8"
                          />
                        </Form.Item>

                        <Button danger icon={<DeleteOutlined className="text-[12px]" />} onClick={() => remove(name)} />
                      </div>
                    ))}

                    <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>
                      Add Terms & Conditions
                    </Button>
                  </>
                )}
              </Form.List>
            </SectionCard>

            {/* Permissions */}
            <SectionCard
              icon={<SafetyCertificateOutlined />}
              title="Permissions"
              subtitle="Modules and sub-modules this plan unlocks"
            >
              <div>
                {getModuleSubmodules?.data?.map((module) => {
                  const expanded = expandedModules.includes(module.id);
                  const subSelectedCount = module.submodules.filter((s) => selectedSubmodules.includes(s.id)).length;

                  return (
                    <div key={module.id} className="border border-gray-200 rounded-xl mb-3 overflow-hidden bg-white">
                      <div className="flex justify-between items-center p-3 bg-white">
                        <Checkbox
                          checked={selectedModules.includes(module.id)}
                          onChange={(e) => handleModuleChange(module, e.target.checked)}
                        >
                          <span className="font-semibold">{module.name}</span>
                        </Checkbox>

                        <div className="flex items-center gap-3">
                          {module.submodules.length > 0 && (
                            <span className="text-xs text-gray-500">
                              {subSelectedCount}/{module.submodules.length} selected
                            </span>
                          )}
                          {module.submodules.length > 0 && (
                            <button type="button" onClick={() => toggleModule(module.id)} className="text-gray-500">
                              {expanded ? <UpOutlined /> : <DownOutlined />}
                            </button>
                          )}
                        </div>
                      </div>

                      {expanded && (
                        <div className="px-6 py-3 border-t border-gray-200 bg-[#fafafa]">
                          <div className="grid grid-cols-2 gap-3">
                            {module.submodules.map((sub) => (
                              <Checkbox
                                key={sub.id}
                                checked={selectedSubmodules.includes(sub.id)}
                                onChange={(e) => handleSubmoduleChange(module.id, sub.id, e.target.checked)}
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
              </div>
            </SectionCard>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8 border-t pt-5">
              <Button onClick={() => navigate('/super-admin/subscription')}>Cancel</Button>

              <Button htmlType="submit" type="primary" className="font-semibold">
                {isEditMode ? 'Update' : 'Save'}
              </Button>
            </div>
          </Form>
        </div>

        {/* Duplicate Modal */}
        <Modal open={duplicateModal} footer={null} centered width={420} onCancel={() => setDuplicateModal(false)}>
          <div className="text-center py-4">
            <div className="w-[70px] h-[70px] mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-5">
              <ExclamationCircleFilled style={{ fontSize: 40, color: '#FAAD14' }} />
            </div>

            <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Subscription Already Exists</h3>

            <p style={{ color: '#666', marginBottom: 25 }}>{duplicateMessage}</p>

            <Button type="primary" onClick={() => setDuplicateModal(false)}>
              OK
            </Button>
          </div>
        </Modal>
      </div>
    </Spin>
  );
}

export default AddSubscription;
