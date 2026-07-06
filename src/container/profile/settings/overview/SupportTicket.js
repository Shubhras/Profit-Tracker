import React, { useState, useEffect } from 'react';
import { Card, Button, Empty, Modal, Form, Input, Upload, message, Tag, Avatar, Spin } from 'antd';

import {
  PlusOutlined,
  InboxOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  PaperClipOutlined,
  EyeOutlined,
} from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import {
  createSupportTickets,
  getSupportTickets,
  getSupportTicketsDetails,
} from '../../../../redux/dashboard/actionCreator';

function SupportTicket() {
  const dispatch = useDispatch();

  const { getsupportTickets, loading, getTicketsDetails: ticketDetails } = useSelector((state) => state.dashboard);

  const [openModal, setOpenModal] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getSupportTickets());
  }, [dispatch]);

  const handleSubmit = async (values) => {
    // setLoading(true);

    const formData = new FormData();

    formData.append('title', values.title);
    formData.append('description', values.description);

    if (values.document?.file) {
      formData.append('document', values.document.file.originFileObj);
    }

    try {
      await dispatch(createSupportTickets(formData));

      message.success('Support ticket created successfully');

      form.resetFields();
      setOpenModal(false);
    } catch (e) {
      message.error('Something went wrong');
    }

    // setLoading(false);
  };

  const handleViewTicket = async (id) => {
    await dispatch(getSupportTicketsDetails(id));
    setDetailsModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-0 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="bg-white shadow-sm p-3 mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-[20px] font-bold text-gray-800 mb-0">Help & Support</h2>
            <p className="text-gray-500 mb-2 text-[13px]">Manage and track all your support tickets.</p>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="rounded-l px-2 flex items-center font-semibold text-[13px]"
            onClick={() => setOpenModal(true)}
          >
            Create Ticket
          </Button>
        </div>

        <Spin spinning={loading}>
          <div className="p-2 space-y-3">
            {getsupportTickets?.length ? (
              getsupportTickets.map((item) => (
                <Card key={item.id} hoverable className="rounded-2xl border-0 shadow-md hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start gap-5">
                    <div className="flex-1">
                      {/* Top */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-blue-600 text-sm">{item.ticket_id}</span>

                        <Tag
                          color={item.status === 'open' ? 'green' : item.status === 'in_progress' ? 'orange' : 'blue'}
                        >
                          {item.status.replace('_', ' ').toUpperCase()}
                        </Tag>

                        {/* <Tag color="purple">{item.priority.toUpperCase()}</Tag> */}
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-semibold mt-1">{item.title}</h2>

                      {/* Description */}
                      <p className="text-gray-500">{item.description}</p>

                      {/* Admin Note */}
                      {/* {item.admin_note && (
                        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-3">
                          <div className="font-semibold text-blue-700 text-sm mb-1">Admin Note</div>

                          <div className="text-gray-600 text-sm">{item.admin_note}</div>
                        </div>
                      )} */}

                      {/* Bottom */}
                      <div className="flex flex-wrap gap-6 mt-2 text-gray-500 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarOutlined />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>

                        <div className="flex items-center gap-2">
                          <Avatar size="small" icon={<CustomerServiceOutlined />} />
                          {item.user_name}
                        </div>

                        {item.document && (
                          <div className="flex items-center gap-2 text-blue-600">
                            <PaperClipOutlined />
                            Attachment
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      type="text"
                      icon={<EyeOutlined style={{ color: '#1677ff', fontSize: '20px' }} />}
                      onClick={() => handleViewTicket(item.id)}
                    />
                  </div>
                </Card>
              ))
            ) : (
              <Card className="rounded-2xl">
                <Empty description="No Support Tickets Found" />
              </Card>
            )}
          </div>
        </Spin>

        {false && (
          <Card className="rounded-xl mt-6">
            <Empty description="No Support Tickets Found" />
          </Card>
        )}
      </div>
      <Modal
        open={openModal}
        title={<div className="text-xl font-bold text-gray-800">Create Support Ticket</div>}
        onCancel={() => {
          form.resetFields();
          setOpenModal(false);
        }}
        footer={null}
        width={570}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Title"
            name="title"
            rules={[
              {
                required: true,
                message: 'Please enter title',
              },
            ]}
          >
            <Input placeholder="Enter ticket title" size="small" />
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
            <Input.TextArea rows={5} placeholder="Describe your issue..." />
          </Form.Item>

          <Form.Item
            label="Attachment"
            name="document"
            valuePropName="file"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) return e;
              return e && e.fileList[0];
            }}
          >
            <Upload.Dragger beforeUpload={() => false} maxCount={1} accept=".jpg,.jpeg,.png,.pdf,.doc,.docx">
              <p className="ant-upload-drag-icon">
                <InboxOutlined
                  style={{
                    fontSize: 40,
                    color: '#16a34a',
                  }}
                />
              </p>

              <p className="font-semibold">Click or Drag file here</p>

              <p className="text-gray-400">JPG, PNG, PDF, DOC, DOCX</p>
            </Upload.Dragger>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                form.resetFields();
                setOpenModal(false);
              }}
              className="px-2 text-[13px]"
            >
              Cancel
            </Button>

            <Button type="primary" htmlType="submit" className="px-2 text-[13px] font-semibold">
              Submit Ticket
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        open={detailsModal}
        footer={null}
        width={750}
        onCancel={() => {
          setDetailsModal(false);
        }}
        title={
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold">Support Ticket Details</span>
          </div>
        }
      >
        {ticketDetails && (
          <div className="space-y-3">
            {/* Ticket Info */}

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-500 text-[13px] mb-1">Ticket ID</div>

                <div className="font-semibold text-blue-600 text-[14px]">{ticketDetails.ticket_id}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-500 text-[13px] mb-1">Status</div>

                <Tag
                  className="text-[14px]"
                  color={
                    ticketDetails.status === 'open'
                      ? 'green'
                      : ticketDetails.status === 'in_progress'
                      ? 'orange'
                      : 'blue'
                  }
                >
                  {ticketDetails.status}
                </Tag>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-500 text-[13px] mb-1">Created On</div>

                <div className="text-[14px]">{new Date(ticketDetails.created_at).toLocaleString()}</div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-gray-500 text-[13px] mb-1">User</div>

                <div className="text-[14px]">{ticketDetails.user_name}</div>
              </div>
            </div>

            {/* Title */}

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Title</h3>

              <div className="border rounded-xl p-2 bg-white">{ticketDetails.title}</div>
            </div>

            {/* Description */}

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Description</h3>

              <div className="border rounded-xl p-2 bg-gray-50 whitespace-pre-wrap">{ticketDetails.description}</div>
            </div>

            {/* Attachment */}

            {ticketDetails.document && (
              <div>
                <h3 className="font-semibold mb-2">Attachment</h3>

                <Button type="link" href={ticketDetails.document} target="_blank" icon={<PaperClipOutlined />}>
                  View Attachment
                </Button>
              </div>
            )}

            {/* Admin Note */}

            {/* {ticketDetails.admin_note && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-4">
                <div className="font-semibold text-blue-700 mb-2">Admin Response</div>

                <div>{ticketDetails.admin_note}</div>
              </div>
            )} */}
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-xl p-3">
              <div className="font-semibold text-blue-700 mb-0">Admin Response</div>

              <div className={ticketDetails.admin_note ? 'text-gray-800' : 'text-gray-500 italic'}>
                {ticketDetails.admin_note || 'No admin response'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default SupportTicket;
