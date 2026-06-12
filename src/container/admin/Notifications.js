import React, { useState } from 'react';
import { Table, Input, Tag, Button, Modal, Select, DatePicker, Dropdown } from 'antd';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';

function Notifications() {
  const [searchText, setSearchText] = useState('');
  const [createModal, setCreateModal] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'Email',
      title: 'Payment Failed Notification',
      audience: 'All Users',
      method: 'Email',
      date: '11 Jun 2026',
      status: 'Sent',
    },
    {
      id: 2,
      type: 'Renewal Reminder',
      title: 'Subscription expires in 3 days',
      audience: '120 Users',
      method: 'Email',
      date: '12 Jun 2026',
      status: 'Scheduled',
    },
    {
      id: 3,
      type: 'Announcement',
      title: 'Amazon Integration Released',
      audience: 'All Users',
      method: 'In-App',
      date: '10 Jun 2026',
      status: 'Draft',
    },
  ];

  const filteredNotifications = notifications.filter(
    (item) =>
      item.title.toLowerCase().includes(searchText.toLowerCase()) ||
      item.type.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      align: 'center',
      render: (type) => {
        let color = 'blue';

        if (type === 'Email') color = 'green';
        if (type === 'Announcement') color = 'purple';
        if (type === 'Renewal Reminder') color = 'orange';

        return <Tag color={color}>{type}</Tag>;
      },
    },

    {
      title: 'Title',
      dataIndex: 'title',
      align: 'center',
    },

    {
      title: 'Audience',
      dataIndex: 'audience',
      align: 'center',
    },

    {
      title: 'Method',
      dataIndex: 'method',
      align: 'center',
    },

    {
      title: 'Date',
      dataIndex: 'date',
      align: 'center',
    },

    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      render: (status) => {
        let color = 'default';

        if (status === 'Sent') color = 'green';
        if (status === 'Scheduled') color = 'blue';
        if (status === 'Draft') color = 'orange';

        return <Tag color={color}>{status}</Tag>;
      },
    },

    {
      title: '',
      width: 60,
      render: () => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              { key: 'view', label: 'View' },
              { key: 'edit', label: 'Edit' },
              { key: 'delete', label: 'Delete', danger: true },
            ],
          }}
        >
          <MoreOutlined className="cursor-pointer text-[18px]" />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="mb-0 text-[20px] font-semibold">Notification Management</h2>

            <p className="mb-0 text-[12px] text-gray-500">Manage emails, announcements and reminders</p>
          </div>

          {/* <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>
            Create Notification
          </Button> */}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white border rounded-xl p-3">
            <p className="text-[12px] text-gray-500 mb-1">Total Notifications</p>
            <h3 className="mb-0 text-[22px] font-semibold">1245</h3>
          </div>

          <div className="bg-white border rounded-xl p-3">
            <p className="text-[12px] text-gray-500 mb-1">Email Notifications</p>
            <h3 className="mb-0 text-[22px] font-semibold">856</h3>
          </div>

          <div className="bg-white border rounded-xl p-3">
            <p className="text-[12px] text-gray-500 mb-1">Announcements</p>
            <h3 className="mb-0 text-[22px] font-semibold">124</h3>
          </div>

          <div className="bg-white border rounded-xl p-3">
            <p className="text-[12px] text-gray-500 mb-1">Renewal Reminders</p>
            <h3 className="mb-0 text-[22px] font-semibold">265</h3>
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b">
            <Input
              placeholder="Search notification..."
              prefix={<SearchOutlined />}
              className="w-80 h-[30px] text-[12px]"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-3 py-2 border-b">
            <Tag color="blue">All</Tag>
            <Tag>Email</Tag>
            <Tag>Announcement</Tag>
            <Tag>Reminder</Tag>
          </div>

          {/* Table */}
          <Table
            rowKey="id"
            columns={columns}
            size="middle"
            bordered={false}
            dataSource={filteredNotifications}
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
            }}
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
        title="Create Notification"
        open={createModal}
        onCancel={() => setCreateModal(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4">
          <Select
            placeholder="Notification Type"
            style={{ width: '100%' }}
            options={[
              { value: 'Email', label: 'Email' },
              { value: 'Announcement', label: 'Announcement' },
              {
                value: 'Renewal Reminder',
                label: 'Renewal Reminder',
              },
            ]}
          />

          <Input placeholder="Notification Title" />

          <Select
            placeholder="Audience"
            style={{ width: '100%' }}
            options={[
              { value: 'all', label: 'All Users' },
              { value: 'premium', label: 'Premium Users' },
              {
                value: 'expired',
                label: 'Expired Subscription Users',
              },
            ]}
          />

          <Input.TextArea rows={4} placeholder="Notification Message" />

          <DatePicker style={{ width: '100%' }} placeholder="Schedule Date" />

          <div className="flex justify-end gap-2">
            <Button onClick={() => setCreateModal(false)}>Cancel</Button>

            <Button type="primary">Send Notification</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Notifications;
