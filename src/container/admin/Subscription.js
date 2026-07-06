import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Spin, Select, Checkbox } from 'antd';
import { FormOutlined, PlusOutlined, DeleteOutlined, CheckOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getSubscriptionList,
  CreateSubscription,
  DeleteSubscription,
  updateSubscription,
  getModulesSubmodules,
} from '../../redux/admin/actionCreator';

function SubscriptionTable() {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [expandedModules, setExpandedModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedSubmodules, setSelectedSubmodules] = useState([]);

  const toggleModule = (id) => {
    setExpandedModules((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const { getsubscriptionData, loading, getModuleSubmodules } = useSelector((state) => state.AdminDashboard);

  useEffect(() => {
    dispatch(getSubscriptionList());
  }, [dispatch]);

  const plans = getsubscriptionData?.results?.data || [];

  const [duplicateModal, setDuplicateModal] = useState(false);
  const [duplicateMessage, setDuplicateMessage] = useState('');

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
    <>
      <div className="px-3 p-5 bg-[#f7f7f7] min-h-screen">
        {/* Header */}
        <div className="mb-9 flex items-center justify-between">
          <h2 className="mb-0 text-[20px] font-semibold">Subscription Management</h2>

          <Button
            type="primary"
            icon={<PlusOutlined style={{ fontSize: '12px' }} />}
            onClick={() => {
              setIsEditMode(false);
              setSelectedId(null);
              form.resetFields();

              dispatch(getModulesSubmodules());
              setIsModalOpen(true);
            }}
            className="!h-[30px] !flex !items-center !justify-center gap-0 px-2 text-[13px] font-semibold"
          >
            Add Subscription
          </Button>
        </div>
        {/* Plan Card */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spin size="large" />
          </div>
        ) : plans.length > 0 ? (
          <div className="grid grid-cols-1 min-md:grid-cols-2 min-xl:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="relative bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="h-2 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />
                <div className="p-5 flex flex-col flex-1">
                  {/* Active Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold ${
                        plan.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Top Section */}
                  <div className="2">
                    <h2 className="text-[20px] font-semibold">{plan.plan_name}</h2>
                    <p className="text-[13px] text-gray-500 mt-1 mb-0">{plan.description}</p>
                  </div>

                  <div className="border-t border-gray-200 mt-3 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center bg-gray-50 rounded-xl py-3">
                        <p className="text-[12px] text-gray-500 mb-1">Monthly</p>
                        <h3 className="text-[18px] font-bold text-green-600">
                          ₹{Math.floor(Number(plan.monthly_price))}
                        </h3>
                      </div>

                      <div className="text-center bg-gray-50 rounded-xl py-3">
                        <p className="text-[12px] text-gray-500 mb-1">Annual</p>
                        <h3 className="text-[18px] font-bold text-blue-600">
                          ₹{Math.floor(Number(plan.annual_price))}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-[18px] font-semibold mb-3 mt-2">Features :</h3>
                  <div className="space-y-2">
                    {plan.features?.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-[#22c55e] text-white flex items-center justify-center">
                          <CheckOutlined className="text-[10px]" />
                        </div>

                        <span className="text-[14px] text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.terms_and_conditions?.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 my-4" />

                      <h3 className="text-[18px] font-semibold mb-3">Terms & Conditions</h3>

                      <div className="space-y-2">
                        {plan.terms_and_conditions.map((term, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <span className="text-[14px] font-semibold text-gray-500">{index + 1}.</span>

                            <span className="text-[14px] text-gray-600">{term}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <>
                    <div className="border-t border-gray-200 my-4" />

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-2">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[18px] font-semibold">Permissions</h3>
                      </div>

                      {plan.module_details?.length > 0 ? (
                        plan.module_details?.map((module) => {
                          const moduleSubmodules =
                            plan.submodule_details?.filter((sub) => sub.module_id === module.id) || [];

                          return (
                            <div
                              key={module.id}
                              className="bg-white border border-gray-200 rounded-lg mb-3 overflow-hidden"
                            >
                              {/* Module Header */}
                              <div className="flex items-center justify-between p-3 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-[15px] text-gray-800">{module.name}</span>
                                </div>

                                <span className="text-[12px] text-blue-600 bg-blue-100 px-3 py-1 rounded-full font-medium">
                                  {moduleSubmodules.length} Submodule
                                  {moduleSubmodules.length !== 1 ? 's' : ''}
                                </span>
                              </div>

                              {/* Submodules */}
                              <div className="p-3">
                                {moduleSubmodules.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {moduleSubmodules.map((sub) => (
                                      <span
                                        key={sub.id}
                                        className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-[12px] flex items-center gap-1"
                                      >
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        {sub.name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-gray-500 text-[13px]">
                                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                                    No submodules available
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="bg-white border border-dashed border-gray-300 rounded-lg py-4 text-center">
                          <p className="text-[14px] font-medium text-gray-500">No modules found</p>
                        </div>
                      )}
                    </div>
                  </>

                  <div className="mt-auto pt-5 border-t border-gray-200 flex justify-end items-center gap-4">
                    <FormOutlined
                      className="text-[#1677ff] text-[17px] cursor-pointer drop-shadow-sm transition-all duration-200 hover:scale-110 hover:drop-shadow-md hover:text-[#0958d9]"
                      onClick={() => {
                        setIsEditMode(true);
                        setSelectedId(plan.id);

                        // form.setFieldsValue({
                        //   subscription_type: plan.subscription_type?.toLowerCase(),
                        //   price: plan.price,
                        //   status: plan.status,
                        //   features: plan.features,
                        //   termsConditions: plan.termsConditions || [],
                        //   is_active: plan.is_active,
                        // });

                        form.setFieldsValue({
                          plan_name: plan.plan_name,
                          description: plan.description,
                          monthly_price: plan.monthly_price,
                          annual_price: plan.annual_price,
                          status: plan.status,
                          features: plan.features || [],
                          terms_and_conditions: plan.terms_and_conditions || [],
                        });
                        dispatch(getModulesSubmodules());
                        setIsModalOpen(true);
                      }}
                    />
                    <DeleteOutlined
                      className="text-red-500 text-[17px] cursor-pointer drop-shadow-sm transition-all duration-200 hover:scale-110 hover:drop-shadow-md hover:text-red-700"
                      onClick={() => {
                        setSelectedId(plan.id);
                        setDeleteModalOpen(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-[15px] border border-dashed border-gray-300">
            <h3 className="text-[18px] font-semibold text-gray-700 mb-2">No Subscription Found</h3>

            <p className="text-[14px] text-gray-500 mb-0">There are no subscription plans available at the moment.</p>
          </div>
        )}
      </div>

      <Modal
        title={isEditMode ? 'Update Subscription Plan' : 'Add Subscription Plan'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            // const payload = {
            //   ...values,
            //   features: values.features || [],
            //   termsConditions: values.termsConditions || [],
            //   monthlyPlan: values.subscription_type === 'monthly' ? values.price : null,

            //   annualPlan: values.subscription_type === 'annual' ? values.price : null,
            // };
            const payload = {
              plan_name: values.plan_name,
              description: values.description,
              monthly_price: values.monthly_price,
              annual_price: values.annual_price,
              features: values.features || [],
              terms_and_conditions: values.terms_and_conditions || [],
              status: values.status,
              // is_active: values.status === 'active',
              is_active: isEditMode ? values.status === 'active' : true,
              modules: selectedModules,
              submodules: selectedSubmodules,
            };
            // if (isEditMode) {
            //   await dispatch(updateSubscription(selectedId, payload));
            // } else {
            //   await dispatch(CreateSubscription(payload));
            // }

            // dispatch(getSubscriptionList());

            // setIsModalOpen(false);
            // form.resetFields();
            // setSelectedId(null);
            // setIsEditMode(false);
            if (isEditMode) {
              const id = selectedId;

              // Modal turant close
              setIsModalOpen(false);
              form.resetFields();
              setSelectedId(null);
              setIsEditMode(false);

              await dispatch(updateSubscription(id, payload));

              dispatch(getSubscriptionList());

              setIsModalOpen(false);
              form.resetFields();
              setSelectedId(null);
              setIsEditMode(false);
            } else {
              const response = await dispatch(CreateSubscription(payload));

              if (response?.status === false) {
                setDuplicateMessage(response.message);
                setDuplicateModal(true);
                return;
              }

              dispatch(getSubscriptionList());

              setIsModalOpen(false);
              form.resetFields();
              setSelectedId(null);
              setIsEditMode(false);
            }
          }}
        >
          <Form.Item label="Plan Name" name="plan_name" rules={[{ required: true, message: 'Please enter plan name' }]}>
            <Input size="small" placeholder="Enter plan name" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea autoSize={{ minRows: 2 }} placeholder="Enter description" />
          </Form.Item>

          {isEditMode && (
            <Form.Item label="Status" name="status" rules={[{ required: true, message: 'Please select status' }]}>
              <Select
                size="small"
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
            </Form.Item>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Monthly Price"
              name="monthly_price"
              rules={[{ required: true, message: 'Please enter monthly price' }]}
            >
              <InputNumber type="number" size="small" min={0} inputMode="numeric" className="w-full" />
            </Form.Item>

            <Form.Item
              label="Annual Price"
              name="annual_price"
              rules={[{ required: true, message: 'Please enter annual price' }]}
            >
              <InputNumber type="number" size="small" min={0} inputMode="numeric" className="w-full" />
            </Form.Item>
          </div>

          {/* <Form.Item label="Status" name="status" initialValue="active" className="mb-2">
            <Select
              size="small"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
            />
          </Form.Item> */}

          {/* <Form.Item label="Monthly Plan" name="monthlyPlan">
            <InputNumber className="w-full" />
          </Form.Item>

          <Form.Item label="Annual Plan" name="annualPlan">
            <InputNumber className="w-full" />
          </Form.Item> */}

          <Form.List name="features">
            {(fields, { add, remove }) => (
              <>
                <label className="font-medium">Features</label>

                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex gap-2 mb-2">
                    <Form.Item {...restField} name={name} className="flex-1 mb-0">
                      <Input size="small" placeholder="Enter feature" />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)} className="text-[13px]">
                      Remove
                    </Button>
                  </div>
                ))}

                <Button type="dashed" block onClick={() => add()} className="mb-3">
                  + Add Feature
                </Button>
              </>
            )}
          </Form.List>
          <Form.List name="terms_and_conditions">
            {(fields, { add, remove }) => (
              <>
                <label className="font-medium">Terms & Conditions</label>

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

                    <Button danger onClick={() => remove(name)} className="text-[13px]">
                      Remove
                    </Button>
                  </div>
                ))}

                <Button type="dashed" block onClick={() => add()}>
                  + Add Terms & Conditions
                </Button>
              </>
            )}
          </Form.List>

          <div className="mt-4">
            <label className="font-semibold text-[15px] mb-3 block">Permissions</label>

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

          {/* <div className="flex items-center gap-3 mt-4">
            <span className="text-[14px] font-medium">Status :</span>

            <Form.Item name="is_active" valuePropName="checked" initialValue className="mb-0">
              <Switch />
            </Form.Item>
          </div> */}

          <div className="flex justify-end gap-2 mt-1">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>

            <Button htmlType="submit" type="primary">
              {isEditMode ? 'Update' : 'Save'}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        open={deleteModalOpen}
        footer={null}
        centered
        width={320}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedId(null);
        }}
      >
        <div className="text-center">
          <h3 className="text-[16px] font-semibold mb-3">Delete Subscription</h3>

          <p className="text-[13px] text-gray-600 mb-5">Are you sure you want to delete this subscription plan?</p>

          <div className="flex justify-center gap-3">
            <Button
              size="small"
              className="h-[30px] text-[13px] font-semibold"
              onClick={() => {
                setDeleteModalOpen(false);
                setSelectedId(null);
              }}
            >
              Cancel
            </Button>

            <button
              type="button"
              size="small"
              className="h-[30px] text-[13px] font-semibold bg-red-500 border-red-500 text-white px-3"
              onClick={async () => {
                const id = selectedId;

                // Modal turant close
                setDeleteModalOpen(false);
                setSelectedId(null);
                await dispatch(DeleteSubscription(id));

                dispatch(getSubscriptionList());

                setDeleteModalOpen(false);
                setSelectedId(null);
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </Modal>

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

          <h3 style={{ fontWeight: 600, marginBottom: 10 }}>Subscription Already Exists</h3>

          <p style={{ color: '#666', marginBottom: 25 }}>{duplicateMessage}</p>

          <Button type="primary" onClick={() => setDuplicateModal(false)}>
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default SubscriptionTable;
