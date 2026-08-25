import UilAngleDown from '@iconscout/react-unicons/icons/uil-angle-down';
import { UilReceipt, UilHeadphonesAlt } from '@iconscout/react-unicons';
import UilSignout from '@iconscout/react-unicons/icons/uil-signout';
import UilUser from '@iconscout/react-unicons/icons/uil-user';
import { Avatar, DatePicker, Button, Badge, Spin, Popover } from 'antd';
import {
  BellOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import UilTimes from '@iconscout/react-unicons/icons/uil-times';
import moment from 'moment';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import FilterDropdown from './FilterDropdown';
import HeaderButton from './HeaderButton';
import CustomCalendar from './CustomCalendar';
// import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';
import { HEADER_ACTIONS } from '../../../config/headerActionsConfig';
import { logOut, getProfile } from '../../../redux/authentication/actionCreator';
import { getNotifications } from '../../../redux/dashboard/actionCreator';
import action from '../../../redux/dashboard/action';

const AuthInfo = React.memo(() => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { RangePicker } = DatePicker;
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const { notifications } = useSelector((state) => state.dashboard);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'maintenance':
        return {
          icon: <ToolOutlined style={{ fontSize: 18, color: '#F59E0B' }} />,
          bg: '#FFF7E6',
        };

      case 'order':
        return {
          icon: <ShoppingCartOutlined style={{ fontSize: 18, color: '#1677FF' }} />,
          bg: '#E6F4FF',
        };

      case 'user':
        return {
          icon: <UserOutlined style={{ fontSize: 18, color: '#722ED1' }} />,
          bg: '#F9F0FF',
        };

      case 'success':
        return {
          icon: <CheckCircleOutlined style={{ fontSize: 18, color: '#52C41A' }} />,
          bg: '#F6FFED',
        };

      case 'warning':
        return {
          icon: <WarningOutlined style={{ fontSize: 18, color: '#FA8C16' }} />,
          bg: '#FFF7E6',
        };

      default:
        return {
          icon: <BellOutlined style={{ fontSize: 18, color: '#2563EB' }} />,
          bg: '#EEF4FF',
        };
    }
  };

  const notificationContent = (
    <div
      style={{
        width: 320,
        borderRadius: 14,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 8px 30px rgba(0,0,0,.12)',
      }}
    >
      {/* Header */}
      <div
        className="d-flex justify-content-between align-items-center px-3 py-3"
        style={{ borderBottom: '1px solid #F0F0F0' }}
      >
        <h6 className="mb-0 text-gray-900 text-[16px] fw-bold">Notifications</h6>
      </div>

      {/* Body */}
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {notificationLoading ? (
          <div className="flex items-center justify-center py-6">
            <Spin size="small" />
          </div>
        ) : notifications?.length ? (
          <>
            {notifications.slice(0, 4).map((item) => {
              const { icon, bg } = getNotificationIcon(item.notification_type);

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: bg }}
                  >
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1">
                    <h6 className="m-0 text-[15px] font-semibold text-gray-900">{item.title}</h6>
                    <p className="mt-1 text-[13px] text-gray-500">
                      {item.message?.length > 35 ? `${item.message.substring(0, 35)}...` : item.message}
                    </p>{' '}
                  </div>
                </div>
              );
            })}
            {/* Footer */}
          </>
        ) : (
          <div className="text-center py-5 text-muted">No latest notifications found</div>
        )}
        <div
          className="text-center py-3"
          style={{
            background: '#FAFAFA',
            borderTop: '1px solid #F0F0F0',
          }}
        >
          <button
            type="button"
            className="font-semibold text-[#1677FF] hover:underline underline-offset-4"
            onClick={() => {
              setNotificationOpen(false);
              navigate('/admin/pages/notifications');
            }}
          >
            View All Notifications →
          </button>
        </div>
      </div>
    </div>
  );

  const currentPath = location.pathname;

  // const path = '/admin/pages/settings';

  // const matchedRoute = Object.keys(HEADER_ACTIONS).find((route) => currentPath.includes(route));
  const matchedRoute = Object.keys(HEADER_ACTIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => currentPath.includes(route));
  // const actions = HEADER_ACTIONS[matchedRoute] || [];
  // const routeConfig = HEADER_ACTIONS[matchedRoute] || {};
  const [activeTab, setActiveTab] = useState('otherExpenses');

  // const actions = routeConfig[activeTab] || [];
  const routeConfig = HEADER_ACTIONS[matchedRoute];

  let actions = [];

  if (Array.isArray(routeConfig)) {
    actions = routeConfig;
  } else if (typeof routeConfig === 'object') {
    actions = routeConfig[activeTab] || [];
  }
  const isMonthMode = matchedRoute === '/profit/profitMonthlyView';
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment().endOf('month')]);
  const [open, setOpen] = useState(false);
  const [tempDates, setTempDates] = useState(null);

  const HIDE_CALENDAR = [
    '/settings/product-setting/finance-configuration',
    '/settings/product-setting/product-configuration',
    // '/profit/profitTableView/details',
    '/profit/salesdetails/',
    '/reconcile/os-payment',
    '/reconcile/return/summary',
    '/profit/profitTableView/third/',
    '/profit/profitTableView/second/',
  ];

  const hideCalendar = HIDE_CALENDAR.some((route) => location.pathname.includes(route));
  const { profile, profileLoading, profileError } = useSelector((state) => state.auth);
  const [selectedRows, setSelectedRows] = useState([]);

  const isSuperAdmin = profile?.is_superuser === true;

  const HIDE_FILTER_DROPDOWN = [
    '/profit/profitTableView/second/',
    '/profit/profitTableView/third/',
    'reconcile/second/',
    'reconcile/third/',
  ];

  const hideFilterDropdown = isSuperAdmin || HIDE_FILTER_DROPDOWN.some((route) => location.pathname.includes(route));

  // const HIDE_SEARCH = [
  //   '/settings/product-setting/overview',
  //   '/profit/profitMonthlyView',
  //   '/reconcile/os-payment',
  //   '/reconcile/b2c-reconciliation/invoice-reconciliation',
  //   '/reconcile/return/summary',
  //   '/reconcile/summary',
  //   '/profit/profitTableView/second/',
  // ];

  // const hideSearch = HIDE_SEARCH.some((route) => location.pathname.includes(route));
  useEffect(() => {
    const handler = (e) => {
      setActiveTab(e.detail);
    };

    window.addEventListener('tabChange', handler);

    return () => {
      window.removeEventListener('tabChange', handler);
    };
  }, []);

  const SignOut = (e) => {
    e.preventDefault();
    dispatch(logOut(() => navigate('/')));
  };
  useEffect(() => {
    const handler = (e) => {
      setSelectedRows(e.detail);
    };

    window.addEventListener('rowSelectionChange', handler);

    return () => {
      window.removeEventListener('rowSelectionChange', handler);
    };
  }, []);

  useEffect(() => {
    if (!profile && !profileLoading && !profileError) {
      dispatch(getProfile());
    }
  }, [dispatch, profile, profileLoading, profileError]);
  useEffect(() => {
    dispatch(
      action.setDateRange({
        fromDate: moment().startOf('month').format('YYYY-MM-DD'),

        endDate: moment().endOf('month').format('YYYY-MM-DD'),
      }),
    );
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      const selects = document.querySelectorAll('.rdrYearPicker select');

      selects.forEach((select) => {
        Array.from(select.options).forEach((option) => {
          const year = Number(option.value);

          if (year < 2020 || year > 2026) {
            option.style.display = 'none';
          }
        });
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOpen(false);
    setTempDates(null);
  }, [location.pathname]);

  const userContent = (
    <div className="min-w-md w-full bg-white dark:bg-[#1b1e2b] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="p-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600">
        <figure className="flex items-center gap-3 mb-0 relative z-10">
          {/* <img
            className="w-12 h-12 rounded-full border-2 border-white/30 p-0.5"
            src={require('../../../static/img/avatar/chat-auth.png')}
            alt=""
          /> */}
          <Avatar
            // src={
            //   profile?.profile_picture
            //     ? profile.profile_picture.startsWith('http')
            //       ? profile.profile_picture
            //       : `http://127.0.0.1:8000${profile.profile_picture}`
            //     : 'https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png'
            // }
            src={profile?.image}
            className="w-12 h-12 rounded-full border-2 border-white/30 p-0.5 object-cover"
          />

          <figcaption className="text-white">
            <Heading className="text-white mb-0.5 text-base font-semibold capitalize" as="h5">
              {profile?.name || 'User...'}
            </Heading>
            <p className="mb-0 text-xs text-white/80 font-medium opacity-90 capitalize">
              {profile?.business_name || ''}
            </p>
          </figcaption>
        </figure>
      </div>

      <div className="p-2">
        <ul className="mb-0 flex flex-col gap-1">
          <li>
            <Link
              to="/admin/pages/settings/profile"
              className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-white10 dark:hover:text-white transition-all duration-200"
            >
              <UilUser className="w-4 h-4 ltr:mr-3 rtl:ml-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
              Profile
            </Link>
          </li>
          {!isSuperAdmin && (
            <li>
              <Link
                to="/admin/pages/billing"
                className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-white10 dark:hover:text-white transition-all duration-200"
              >
                <UilReceipt className="w-4 h-4 ltr:mr-3 rtl:ml-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                Billing
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/admin/pages/support"
              className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-white10 dark:hover:text-white transition-all duration-200"
            >
              <UilHeadphonesAlt className="w-4 h-4 ltr:mr-3 rtl:ml-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
              Help & Support
            </Link>
          </li>
        </ul>

        <div className="h-px bg-gray-100 dark:bg-white10 my-2 mx-2" />

        <Link
          to="#"
          onClick={SignOut}
          className="group flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
        >
          <UilSignout className="w-4 h-4 ltr:mr-3 rtl:ml-3 text-red-400 group-hover:text-red-500" />
          Sign Out
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-end flex-auto">
      <div className="md:hidden flex items-center gap-3">
        {actions.map((btn) => (
          <HeaderButton
            key={btn}
            type={btn}
            isEnabled={selectedRows.length > 0}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('headerAction', { detail: btn }));
            }}
          />
        ))}
        {/* {!hideSearch && <Search />} */}
        {!hideCalendar && (
          <div className="relative">
            {/* ✅ BUTTON */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="px-2 py-1 border rounded-md text-sm bg-white flex items-center gap-2"
            >
              <>
                {/* Desktop */}
                <span className="text-[12px] lg:hidden">
                  {dateRange
                    ? isMonthMode
                      ? `${dateRange[0].format('MMM YYYY')} - ${dateRange[1].format('MMM YYYY')}`
                      : `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`
                    : 'Select Date'}
                </span>

                {/* Mobile */}
                <CalendarOutlined className="hidden lg:block text-[18px]" />
              </>

              {/* ❌ CLEAR BUTTON */}
              {dateRange && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();

                    const start = moment().startOf('month');
                    const end = moment().endOf('month');

                    setDateRange([start, end]);

                    dispatch(
                      action.setDateRange({
                        fromDate: start.format('YYYY-MM-DD'),
                        endDate: end.format('YYYY-MM-DD'),
                      }),
                    );
                  }}
                  className="text-gray-400 hover:text-red-500 flex items-center cursor-pointer"
                >
                  <UilTimes className="w-4 h-4 lg:hidden" />
                </button>
              )}
            </button>

            {open && (
              <div
                style={{
                  position: 'absolute',
                  top: 40, // 👈 button ke niche
                  right: 0,
                  zIndex: 1000,
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              >
                {isMonthMode ? (
                  <div className="p-3">
                    <RangePicker
                      picker="month"
                      open
                      value={tempDates}
                      order={false}
                      disabledDate={(current) => {
                        return current && current > moment().endOf('month');
                      }}
                      onCalendarChange={(dates) => {
                        setTempDates(dates);
                      }}
                      onChange={(dates) => {
                        setTempDates(dates);
                      }}
                      panelRender={(panelNode) => (
                        <div>
                          {panelNode}

                          <div className="flex justify-end gap-2 mt-2 p-2 border-t">
                            <button
                              type="button"
                              onClick={() => {
                                setTempDates(null);
                                setOpen(false);
                              }}
                              className="px-3 py-1 border rounded"
                            >
                              Cancel
                            </button>

                            <Button
                              type="primary"
                              disabled={!tempDates}
                              onClick={() => {
                                const start = tempDates[0].startOf('month');
                                const end = tempDates[1].endOf('month');

                                setDateRange([start, end]);

                                dispatch(
                                  action.setDateRange({
                                    fromDate: start.format('YYYY-MM-DD'),
                                    endDate: end.format('YYYY-MM-DD'),
                                  }),
                                );

                                setOpen(false);
                              }}
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                ) : (
                  <CustomCalendar
                    initialRange={dateRange}
                    onSubmit={(start, end) => {
                      setDateRange([moment(start), moment(end)]);

                      dispatch(
                        action.setDateRange({
                          fromDate: moment(start).format('YYYY-MM-DD'),
                          endDate: moment(end).format('YYYY-MM-DD'),
                        }),
                      );

                      setOpen(false);
                    }}
                    onCancel={() => setOpen(false)}
                  />
                )}
              </div>
            )}
          </div>
        )}
        {/* <div className="relative"> */}

        {!hideFilterDropdown && <FilterDropdown />}
      </div>

      <div className="mx-3 flex items-center">
        <Popover
          placement="bottomRight"
          content={notificationContent}
          trigger="click"
          open={notificationOpen}
          onOpenChange={async (visible) => {
            setNotificationOpen(visible);

            if (visible) {
              try {
                setNotificationLoading(true);
                await dispatch(getNotifications());
              } finally {
                setNotificationLoading(false);
              }
            }
          }}
        >
          <Badge count={profile?.unread_notification_count || 0} size="small" offset={[-2, 2]}>
            <button
              type="button"
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center"
            >
              <BellOutlined className="text-[18px] text-gray-600" />
            </button>
          </Badge>
        </Popover>
      </div>

      <div className="flex ltr:ml-3 rtl:mr-3 ltr:mr-4 rtl:ml-4 ssm:mr-0 ssm:rtl:ml-0">
        <Popover placement="bottomRight" content={userContent} action="click">
          <Link to="#" className="flex items-center text-light whitespace-nowrap">
            <Avatar
              // src={
              //   profile?.profile_picture
              //     ? profile.profile_picture.startsWith('http')
              //       ? profile.profile_picture
              //       : `http://127.0.0.1:8000${profile.profile_picture}`
              //     : 'https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png'
              // }
              src={profile?.image}
              className="object-cover"
            />
            <span className="ltr:mr-1.5 rtl:ml-1.5 ltr:ml-2.5 rtl:mr-2.5 text-body dark:text-white60 text-sm font-medium md:hidden capitalize">
              {profile?.name}
            </span>
            <UilAngleDown className="w-4 h-4 ltr:md:ml-[5px] rtl:md:mr-[5px]" />
          </Link>
        </Popover>
      </div>
    </div>
  );
});

export default AuthInfo;
