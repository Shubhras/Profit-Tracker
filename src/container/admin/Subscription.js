import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, Switch, Spin } from 'antd';
import { FormOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getSubscriptionList, CreateSubscription, DeleteSubscription } from '../../redux/admin/actionCreator';

function SubscriptionTable() {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { getsubscriptionData, loading } = useSelector((state) => state.AdminDashboard);

  useEffect(() => {
    dispatch(getSubscriptionList());
  }, [dispatch]);
  console.log('Redux Data:', getsubscriptionData);

  const plans = getsubscriptionData?.results?.data || [];

  return (
    <>
      <div className="px-3 p-5 bg-[#f7f7f7] min-h-screen">
        {/* Header */}
        <div className="mb-9 flex items-center justify-between">
          <h2 className="mb-0 text-[20px] font-semibold">Subscription Management</h2>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            className="!bg-[#f58d73] !border-[#f58d73] text-white px-2 py-2 rounded-lg text-sm font-medium flex items-center gap-0"
          >
            Add Subscription
          </Button>
        </div>
        {/* Plan Card */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="relative bg-white border border-gray-300 rounded-[22px] px-4 py-3 shadow-sm"
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

                <h3 className="text-[18px] font-semibold mb-3">What this includes:</h3>

                <div className="space-y-2">
                  {plan.features?.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#ff9d7d] text-white flex items-center justify-center text-[11px]">
                        ✓
                      </div>

                      <span className="text-[14px] text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end items-center gap-4 mt-6">
                  <FormOutlined style={{ fontSize: '16px', color: '#1677ff', cursor: 'pointer' }} />

                  <DeleteOutlined
                    style={{ fontSize: '16px', color: 'red', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedId(plan.id);
                      setDeleteModalOpen(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        title="Add Subscription Plan"
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
              monthlyPlan: values.subscription_type === 'monthly' ? values.price : null,

              annualPlan: values.subscription_type === 'annual' ? values.price : null,
            };

            console.log('Payload =>', payload);

            await dispatch(CreateSubscription(payload));

            dispatch(getSubscriptionList());

            setIsModalOpen(false);
            form.resetFields();
          }}
        >
          <Form.Item label="Subscription Type" name="subscription_type" rules={[{ required: true }]}>
            <Select
              options={[
                { label: 'Monthly', value: 'monthly' },
                { label: 'Annual', value: 'annual' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Price" name="price" rules={[{ required: true }]}>
            <InputNumber className="w-full" />
          </Form.Item>

          <Form.Item label="Status" name="status" initialValue="active">
            <Select
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
                      <Input placeholder="Enter feature" />
                    </Form.Item>

                    <Button danger onClick={() => remove(name)}>
                      Remove
                    </Button>
                  </div>
                ))}

                <Button type="dashed" block onClick={() => add()}>
                  + Add Feature
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item label="Is Active" name="is_active" valuePropName="checked" initialValue className="mt-4">
            {' '}
            <Switch />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>

            <Button htmlType="submit" type="primary">
              Save
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Delete Subscription"
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedId(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDeleteModalOpen(false);
              setSelectedId(null);
            }}
          >
            Cancel
          </Button>,

          <Button
            key="delete"
            danger
            type="primary"
            onClick={async () => {
              await dispatch(DeleteSubscription(selectedId));

              dispatch(getSubscriptionList());

              setDeleteModalOpen(false);
              setSelectedId(null);
            }}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this subscription plan?</p>
      </Modal>
    </>
  );
}

export default SubscriptionTable;
