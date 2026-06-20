import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, Spin } from 'antd';
import { FormOutlined, PlusOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getSubscriptionList,
  CreateSubscription,
  DeleteSubscription,
  updateSubscription,
} from '../../redux/admin/actionCreator';

function SubscriptionTable() {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { getsubscriptionData, loading } = useSelector((state) => state.AdminDashboard);

  useEffect(() => {
    dispatch(getSubscriptionList());
  }, [dispatch]);

  const plans = getsubscriptionData?.results?.data || [];

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
              setIsModalOpen(true);
            }}
            className="!h-[30px] !flex !items-center !justify-center gap-0 px-2 text-[12px] font-semibold"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="relative bg-white border border-gray-200 rounded-[15px] px-4 py-3 shadow-md"
              >
                {/* Active Badge */}
                <div className="absolute -top-4 left-8">
                  <span
                    className={`text-white text-[12px] font-medium px-4 py-2 rounded-full ${
                      plan.is_active ? 'bg-[#22c55e]' : 'bg-red-500'
                    }`}
                  >
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Top Section */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-[20px] font-semibold">{plan.subscription_type}</h2>
                  </div>

                  <div className="text-right">
                    <h2 className="text-[20px] mb-0 font-bold">₹{plan.price}</h2>
                  </div>
                </div>

                <div className="border-t border-gray-300 my-1" />

                <h3 className="text-[18px] font-semibold mb-3">Features :</h3>

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

                {plan.termsConditions?.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 my-4" />

                    <h3 className="text-[18px] font-semibold mb-3">Terms & Conditions</h3>

                    <div className="space-y-2">
                      {plan.termsConditions.map((term, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-[14px] font-semibold text-gray-500">{index + 1}.</span>

                          <span className="text-[14px] text-gray-600">{term}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-end items-center gap-4 mt-3">
                  <FormOutlined
                    className="text-[#1677ff] text-[17px] cursor-pointer drop-shadow-sm transition-all duration-200 hover:scale-110 hover:drop-shadow-md hover:text-[#0958d9]"
                    onClick={() => {
                      setIsEditMode(true);
                      setSelectedId(plan.id);

                      form.setFieldsValue({
                        subscription_type: plan.subscription_type?.toLowerCase(),
                        price: plan.price,
                        status: plan.status,
                        features: plan.features,
                        termsConditions: plan.termsConditions || [],
                        is_active: plan.is_active,
                      });

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
            const payload = {
              ...values,
              features: values.features || [],
              termsConditions: values.termsConditions || [],
              monthlyPlan: values.subscription_type === 'monthly' ? values.price : null,

              annualPlan: values.subscription_type === 'annual' ? values.price : null,
            };

            if (isEditMode) {
              await dispatch(updateSubscription(selectedId, payload));
            } else {
              await dispatch(CreateSubscription(payload));
            }

            dispatch(getSubscriptionList());

            setIsModalOpen(false);
            form.resetFields();
            setSelectedId(null);
            setIsEditMode(false);
          }}
        >
          <Form.Item label="Subscription Type" name="subscription_type" rules={[{ required: true }]} className="mb-2">
            <Select
              size="small"
              options={[
                { label: 'Monthly', value: 'monthly' },
                { label: 'Annual', value: 'annual' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Price" name="price" rules={[{ required: true }]} className="mb-2">
            <InputNumber size="small" className="w-full" />
          </Form.Item>

          <Form.Item label="Status" name="status" initialValue="active" className="mb-2">
            <Select
              size="small"
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
            />
          </Form.Item>

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
          <Form.List name="termsConditions">
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

            <Button
              danger
              size="small"
              className="h-[30px] text-[13px] font-semibold bg-red-500 border-red-500 text-white"
              onClick={async () => {
                await dispatch(DeleteSubscription(selectedId));

                dispatch(getSubscriptionList());

                setDeleteModalOpen(false);
                setSelectedId(null);
              }}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default SubscriptionTable;
