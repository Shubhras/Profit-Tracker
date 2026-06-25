import React, { useEffect, useState } from 'react';
import { Skeleton, Alert, Button, Empty } from 'antd';
import { ReloadOutlined, BellOutlined } from '@ant-design/icons';
import { DataService } from '../../config/dataService/dataService';

function Notifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  //   const [counts, setCounts] = useState({});
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await DataService.get('/user/user-notifications/');

      if (response.data.status) {
        setNotifications(response.data.data || []);
        // setCounts(response.data.counts || {});
      }
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message={error}
        action={
          <Button type="primary" size="small" onClick={fetchNotifications}>
            <ReloadOutlined /> Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="w-full px-3 py-3">
      {/* Header */}

      <div className="mb-3">
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <BellOutlined
                style={{
                  fontSize: 18,
                  color: '#1677ff',
                }}
              />
            </div>

            <div>
              <h4 className="text-xl font-semibold m-0">Notifications</h4>

              <p className="text-gray-500 m-0 font-14">Stay updated with latest activities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification List */}

      <div className="bg-white rounded-2xl shadow-sm border">
        {notifications.length === 0 ? (
          <div className="py-12">
            <Empty description="No notifications found" />
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`border-b last:border-b-0 p-4 transition hover:bg-gray-50 ${
                !item.is_read ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="w-full">
                <div>
                  <div className="flex justify-between items-start gap-3 mb-0">
                    <h5 className="font-semibold text-[16px] mb-0 flex-1">{item.title}</h5>

                    {/* <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[12px] font-medium whitespace-nowrap">
                        {item.notification_type}
                      </span>

                      {!item.is_read && (
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[12px] font-medium">
                          New
                        </span>
                      )}
                    </div> */}
                  </div>
                  <p className="text-gray-600 mb-0">{item.message}</p>
                  <small className="text-gray-400">{formatDate(item.created_at)}</small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
