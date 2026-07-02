import React, { useEffect, useState } from 'react';
import { Skeleton, Empty } from 'antd';
import {
  BellOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getNotifications } from '../../redux/dashboard/actionCreator';

function Notifications() {
  const dispatch = useDispatch();

  const [expandedId, setExpandedId] = useState(null);

  const { notifications, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'maintenance':
        return {
          icon: <ToolOutlined className="text-[#F59E0B] text-[18px]" />,
          bg: 'bg-orange-100',
        };

      case 'order':
        return {
          icon: <ShoppingCartOutlined className="text-blue-600 text-[18px]" />,
          bg: 'bg-blue-100',
        };

      case 'user':
        return {
          icon: <UserOutlined className="text-violet-600 text-[18px]" />,
          bg: 'bg-violet-100',
        };

      case 'success':
        return {
          icon: <CheckCircleOutlined className="text-green-600 text-[18px]" />,
          bg: 'bg-green-100',
        };

      case 'warning':
        return {
          icon: <WarningOutlined className="text-orange-500 text-[18px]" />,
          bg: 'bg-orange-100',
        };

      default:
        return {
          icon: <BellOutlined className="text-blue-600 text-[18px]" />,
          bg: 'bg-blue-100',
        };
    }
  };

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

  // if (error) {
  //   return (
  //     <Alert
  //       type="error"
  //       message={error}
  //       action={
  //         <Button type="primary" size="small" onClick={fetchNotifications}>
  //           <ReloadOutlined /> Retry
  //         </Button>
  //       }
  //     />
  //   );
  // }

  return (
    <div className="w-full px-3 py-3">
      {/* Header */}

      <div className="mb-3">
        <div className="flex justify-between items-center p-3">
          <div className="flex items-center gap-3">
            <div>
              <h4 className="text-xl font-semibold m-0">Notifications</h4>

              <p className="text-gray-500 m-0 font-14">Stay updated with latest activities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification List */}

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="py-12 bg-white rounded-xl shadow-sm border">
            <Empty description="No notifications found" />
          </div>
        ) : (
          notifications.map((item) => {
            const { icon, bg } = getNotificationIcon(item.notification_type);

            const expanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-l border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-3 ${
                  !item.is_read ? 'border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}

                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${bg}`}>{icon}</div>

                  {/* Right Side */}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="text-[15px] font-semibold text-gray-900 mb-1">{item.title}</h5>

                        <p className="text-[13px] text-gray-600">
                          {expanded
                            ? item.message
                            : item.message?.length > 50
                            ? `${item.message.slice(0, 50)}...`
                            : item.message}
                        </p>

                        <p className="text-xs text-gray-400 mb-0">{formatDate(item.created_at)}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : item.id)}
                        className="text-[#1677FF] font-[13px] text-sm hover:underline ml-4 whitespace-nowrap"
                      >
                        {expanded ? 'Hide' : 'View'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Notifications;
