import React, { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Select, Checkbox, message } from 'antd';
import { ExclamationCircleFilled, ArrowLeftOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  CreateSubscription,
  updateSubscription,
  getSubscriptionList,
  getModulesSubmodules,
} from '../../redux/admin/actionCreator';

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

  const { getsubscriptionData, getModuleSubmodules } = useSelector((state) => state.AdminDashboard);

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
    <div className="px-3 p-3 bg-[#f7f7f7] min-h-screen">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl border border-[#dbe1e8] bg-white flex items-center justify-center hover:bg-[#f8fafc] transition-all duration-200 shadow-sm"
            >
              <ArrowLeftOutlined className="text-[#374151]" />
            </button>

            <h2 className="mb-0 text-[20px] font-semibold">
              {isEditMode ? 'Update Subscription' : 'Add Subscription'}
            </h2>
          </div>
        </div>
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
          <Form.Item
            label="Plan Name"
            name="plan_name"
            rules={[
              {
                required: true,
                message: 'Please enter plan name',
              },
            ]}
          >
            <Input size="small" placeholder="Enter plan name" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                required: true,
                message: 'Please enter description',
              },
            ]}
          >
            <Input.TextArea autoSize={{ minRows: 2 }} placeholder="Enter description" />
          </Form.Item>

          {isEditMode && (
            <Form.Item
              label="Status"
              name="status"
              rules={[
                {
                  required: true,
                  message: 'Please select status',
                },
              ]}
            >
              <Select
                size="small"
                options={[
                  {
                    label: 'Active',
                    value: 'active',
                  },
                  {
                    label: 'Inactive',
                    value: 'inactive',
                  },
                ]}
              />
            </Form.Item>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Monthly Price"
              name="monthly_price"
              rules={[
                {
                  required: true,
                  message: 'Please enter monthly price',
                },
              ]}
            >
              <InputNumber min={0} className="w-full" size="small" />
            </Form.Item>

            <Form.Item
              label="Annual Price"
              name="annual_price"
              rules={[
                {
                  required: true,
                  message: 'Please enter annual price',
                },
              ]}
            >
              <InputNumber min={0} className="w-full" size="small" />
            </Form.Item>
          </div>

          {/* Features */}

          <Form.List name="features">
            {(fields, { add, remove }) => (
              <>
                <label className="text-black">Features</label>

                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex gap-2 mb-2">
                    <Form.Item {...restField} name={name} className="flex-1 mb-0">
                      <Input size="small" placeholder="Enter feature" />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </div>
                ))}

                <div className="flex justify-start mb-7">
                  <Button type="dashed" onClick={() => add()} className="!w-[170px]">
                    + Add Feature
                  </Button>
                </div>
              </>
            )}
          </Form.List>

          {/* Terms */}

          <Form.List name="terms_and_conditions">
            {(fields, { add, remove }) => (
              <>
                <label className="text-black">Terms & Conditions</label>

                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex gap-2 mb-2">
                    <Form.Item
                      {...restField}
                      name={name}
                      className="flex-1 mb-0"
                      rules={[
                        {
                          required: true,
                          message: 'Please enter terms & condition',
                        },
                      ]}
                    >
                      <Input size="small" placeholder="Enter terms & condition" />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </div>
                ))}

                <div className="flex justify-start">
                  <Button type="dashed" onClick={() => add()} className="!w-[220px]">
                    + Add Terms & Conditions
                  </Button>
                </div>
              </>
            )}
          </Form.List>
          {/* Permissions */}
          <div className="mt-5">
            <label className="text-black text-[15px] mb-3 block">Permissions</label>

            {getModuleSubmodules?.data?.map((module) => {
              const expanded = expandedModules.includes(module.id);

              return (
                <div key={module.id} className="border rounded-xl mb-3 overflow-hidden">
                  <div className="flex justify-between items-center p-3 bg-white">
                    <Checkbox
                      checked={selectedModules.includes(module.id)}
                      onChange={(e) => handleModuleChange(module, e.target.checked)}
                    >
                      <span className="font-semibold">{module.name}</span>
                    </Checkbox>

                    {module.submodules.length > 0 && (
                      <button type="button" onClick={() => toggleModule(module.id)}>
                        {expanded ? '▲' : '▼'}
                      </button>
                    )}
                  </div>

                  {expanded && (
                    <div className="px-6 py-3 border-t bg-[#fafafa]">
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
            <ExclamationCircleFilled
              style={{
                fontSize: 40,
                color: '#FAAD14',
              }}
            />
          </div>

          <h3
            style={{
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Subscription Already Exists
          </h3>

          <p
            style={{
              color: '#666',
              marginBottom: 25,
            }}
          >
            {duplicateMessage}
          </p>

          <Button type="primary" onClick={() => setDuplicateModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default AddSubscription;
