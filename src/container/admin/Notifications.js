import React, { useState, useEffect } from 'react';
import { Table, Input, Tag, Button, Modal, Select, message } from 'antd';
import { SearchOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getNotificationList, createNotification, deleteNotification } from '../../redux/admin/actionCreator';

function Notifications() {
  const dispatch = useDispatch();

  const [notifications, setNotifications] = useState([]);
  // const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [counts, setCounts] = useState({});

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const { loading } = useSelector((state) => state.AdminDashboard);

  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    notification_type: 'general',
  });

  const fetchNotifications = () => {
    dispatch(
      getNotificationList((response) => {
        if (response?.status) {
          setNotifications(response.data || []);
          setCounts(response.counts || {});
        }
      }),
    );
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.notification_type?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleDelete = (id) => {
    setSelectedId(id);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    dispatch(
      deleteNotification(selectedId, (response) => {
        if (response?.status) {
          message.success(response?.message || 'Notification deleted successfully.');

          setDeleteModal(false);
          setSelectedId(null);

          fetchNotifications();
        } else {
          message.error(response?.message || 'Failed to delete notification.');
        }
      }),
    );
  };

  const columns = [
    {
      title: 'Type',
      dataIndex: 'notification_type',
      align: 'center',
      render: (type) => {
        const colorMap = {
          general: 'blue',
          update: 'green',
          maintenance: 'orange',
          promotion: 'purple',
          subscription: 'red',
        };

        const label = type ? type.charAt(0).toUpperCase() + type.slice(1) : '-';

        return <Tag color={colorMap[type] || 'default'}>{label}</Tag>;
      },
    },

    {
      title: 'Title',
      dataIndex: 'title',
      align: 'center',
    },

    {
      title: 'Message',
      dataIndex: 'message',
      ellipsis: true,
    },

    {
      title: 'Date',
      dataIndex: 'created_at',
      align: 'center',
      render: (date) =>
        new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      title: '',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <DeleteOutlined
          className="text-red-500 cursor-pointer text-[18px] hover:text-red-600"
          onClick={() => handleDelete(record.id)}
        />
      ),
    },
  ];
  const handleCreateNotification = () => {
    dispatch(
      createNotification(notificationData, (response) => {
        if (response?.status) {
          message.success(response?.message || 'Notification created successfully.');

          setCreateModal(false);

          setNotificationData({
            title: '',
            message: '',
            notification_type: 'general',
          });

          fetchNotifications();
        } else {
          message.error(response?.message || 'Failed to create notification.');
        }
      }),
    );
  };
  return (
    <>
      <div className="p-3">
        {/* Header */}
        <div className="flex lg:flex-col lg:items-start lg:gap-3 items-center justify-between mb-4">
          <div>
            <h2 className="mb-0 text-[20px] font-semibold">Notification Management</h2>

            <p className="mb-0 text-[12px] text-gray-500">Manage emails, announcements and reminders</p>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="!flex !items-center !justify-center gap-0 !px-2 font-semibold lg:w-full"
            onClick={() => setCreateModal(true)}
          >
            Create Notification
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-3 mb-4">
          {[
            { title: 'Total', value: counts.total_notifications, color: 'text-blue-600' },
            { title: 'General', value: counts.general, color: 'text-green-600' },
            { title: 'Update', value: counts.update, color: 'text-purple-600' },
            { title: 'Maintenance', value: counts.maintenance, color: 'text-orange-600' },
            { title: 'Promotion', value: counts.promotion, color: 'text-pink-600' },
            { title: 'Subscription', value: counts.subscription, color: 'text-cyan-600' },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg hover:shadow-md transition-all duration-300 text-center"
            >
              <p className="text-[14px] mb-0 text-gray-500 font-medium truncate">{item.title}</p>

              <h3 className={`mt-2 mb-0 text-[22px] font-bold ${item.color}`}>{item.value || 0}</h3>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b">
            <Input
              placeholder="Search notification..."
              prefix={<SearchOutlined />}
              className="w-80 md:w-full h-[30px] text-[12px]"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Table */}
          <Table
            rowKey="id"
            columns={columns}
            size="middle"
            loading={loading}
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
        title={<h3 className="text-lg font-semibold m-0">Create Notification</h3>}
        open={createModal}
        onCancel={() => setCreateModal(false)}
        footer={null}
        centered
        width={550}
      >
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Notification Type</label>

            <Select
              className="w-full"
              value={notificationData.notification_type}
              onChange={(value) =>
                setNotificationData({
                  ...notificationData,
                  notification_type: value,
                })
              }
              options={[
                { label: 'General', value: 'general' },
                { label: 'Update', value: 'update' },
                { label: 'Maintenance', value: 'maintenance' },
                { label: 'Promotion', value: 'promotion' },
                { label: 'Subscription', value: 'subscription' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>

            <Input
              placeholder="Enter notification title"
              value={notificationData.title}
              onChange={(e) =>
                setNotificationData({
                  ...notificationData,
                  title: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>

            <Input.TextArea
              rows={5}
              placeholder="Enter notification message"
              value={notificationData.message}
              onChange={(e) =>
                setNotificationData({
                  ...notificationData,
                  message: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button onClick={() => setCreateModal(false)}>Cancel</Button>

            <Button type="primary" onClick={handleCreateNotification}>
              Create Notification
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteModal}
        centered
        width={400}
        footer={null}
        closable={false}
        onCancel={() => {
          setDeleteModal(false);
          setSelectedId(null);
        }}
      >
        <div className="py-2 text-center">
          <DeleteOutlined
            style={{
              fontSize: 42,
              color: '#ef4444',
              marginBottom: 12,
            }}
          />

          <h3 className="text-lg font-semibold mb-2">Delete Notification</h3>

          <p className="text-gray-500 mb-6">Are you sure you want to delete this notification?</p>

          <div className="flex justify-center gap-3">
            <Button
              onClick={() => {
                setDeleteModal(false);
                setSelectedId(null);
              }}
            >
              Cancel
            </Button>

            <Button danger type="primary" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Notifications;
