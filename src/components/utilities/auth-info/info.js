import UilAngleDown from '@iconscout/react-unicons/icons/uil-angle-down';
// import UilBell from '@iconscout/react-unicons/icons/uil-bell';
import UilDollarSign from '@iconscout/react-unicons/icons/uil-dollar-sign';
// import UilSetting from '@iconscout/react-unicons/icons/uil-setting';
import UilSignout from '@iconscout/react-unicons/icons/uil-signout';
import UilUser from '@iconscout/react-unicons/icons/uil-user';
// import UilUsersAlt from '@iconscout/react-unicons/icons/uil-users-alt';
import { Avatar, DatePicker } from 'antd';
import React, { useEffect, useState } from 'react';
// import { useTranslation} from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import UilTimes from '@iconscout/react-unicons/icons/uil-times';
// import { DateRange } from 'react-date-range';
// import 'react-date-range/dist/styles.css';
// import 'react-date-range/dist/theme/default.css';
import Search from './Search';
import FilterDropdown from './FilterDropdown';
// import Message from './Message';
// import Notification from './Notification';
// import Settings from './settings';
import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';
// import { Dropdown } from '../../dropdown/dropdown';
import { logOut, getProfile } from '../../../redux/authentication/actionCreator';
import action from '../../../redux/dashboard/action';

const AuthInfo = React.memo(() => {
  const dispatch = useDispatch();
  const { RangePicker } = DatePicker;
  // const dateRef = React.useRef(null);
  const [dateRange, setDateRange] = useState(null);
  const [open, setOpen] = useState(false);
  // const [dateRange, setDateRange] = React.useState([
  //   {
  //     startDate: new Date(),
  //     endDate: new Date(),
  //     key: 'selection',
  //   },
  // ]);
  // const [openDate, setOpenDate] = React.useState(false);
  // const handlePreset = (type) => {
  //   const today = new Date();

  //   let start = new Date();
  //   let end = new Date();

  //   if (type === 'Today') {
  //     start = today;
  //     end = today;
  //   }

  //   if (type === 'Yesterday') {
  //     const y = new Date();
  //     y.setDate(today.getDate() - 1);
  //     start = y;
  //     end = y;
  //   }

  //   if (type === 'This Week') {
  //     const day = today.getDay(); // 0 = Sunday
  //     const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
  //     start = new Date(today.setDate(diff));
  //     end = new Date(start);
  //     end.setDate(start.getDate() + 6);
  //   }

  //   if (type === 'Last Week') {
  //     const day = today.getDay();
  //     const diff = today.getDate() - day - 6; // last week Monday
  //     start = new Date(today.setDate(diff));
  //     end = new Date(start);
  //     end.setDate(start.getDate() + 6);
  //   }

  //   if (type === 'This Month') {
  //     start = new Date(today.getFullYear(), today.getMonth(), 1);
  //     end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  //   }

  //   if (type === 'Last Month') {
  //     start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  //     end = new Date(today.getFullYear(), today.getMonth(), 0);
  //   }

  //   setDateRange([
  //     {
  //       startDate: start,
  //       endDate: end,
  //       key: 'selection',
  //       label: type,
  //     },
  //   ]);
  // };
  // useEffect(() => {
  //   const handleClickOutside = (e) => {
  //     if (dateRef.current && !dateRef.current.contains(e.target)) {
  //       setOpenDate(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

  // ✅ Get Profile and profileLoading from Redux Store
  const { profile, profileLoading, profileError } = useSelector((state) => state.auth);

  // const [state, setState] = useState({
  //   flag: 'en',
  // });
  const navigate = useNavigate();
  // const { i18n } = useTranslation();
  // const { flag } = state;

  const SignOut = (e) => {
    e.preventDefault();
    dispatch(logOut(() => navigate('/')));
  };

  // ✅ Call API on Page Load (via Redux) if profile is missing and not already loading
  useEffect(() => {
    if (!profile && !profileLoading && !profileError) {
      dispatch(getProfile());
    }
  }, [dispatch, profile, profileLoading, profileError]);

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
            src="https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png"
            className="w-12 h-12 rounded-full border-2 border-white/30 p-0.5"
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
          <li>
            <Link
              to="/admin/pages/billing"
              className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-white10 dark:hover:text-white transition-all duration-200"
            >
              <UilDollarSign className="w-4 h-4 ltr:mr-3 rtl:ml-3 text-gray-400 group-hover:text-emerald-500 transition-colors" />
              Billing
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

  // const onFlagChangeHandle = (value, e) => {
  //   e.preventDefault();
  //   setState({
  //     ...state,
  //     flag: value,
  //   });
  //   i18n.changeLanguage(value);
  // };

  // const country = (
  //   <div className="block bg-white dark:bg-[#1b1d2a]">
  //     <Link
  //       to="#"
  //       onClick={(e) => onFlagChangeHandle('en', e)}
  //       className="flex items-center bg-white dark:bg-white10 hover:bg-primary-transparent px-3 py-1.5 text-sm text-dark dark:text-white60"
  //     >
  //       <img className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2" src={require('../../../static/img/flag/en.png')} alt="" />
  //       <span>English</span>
  //     </Link>
  //     <Link
  //       to="#"
  //       onClick={(e) => onFlagChangeHandle('en', e)}
  //       className="flex items-center bg-white dark:bg-white10 hover:bg-primary-transparent px-3 py-1.5 text-sm text-dark dark:text-white60"
  //     >
  //       <img className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2" src={require('../../../static/img/flag/esp.png')} alt="" />
  //       <span>Spanish</span>
  //     </Link>
  //     <Link
  //       to="#"
  //       onClick={(e) => onFlagChangeHandle('en', e)}
  //       className="flex items-center bg-white dark:bg-white10 hover:bg-primary-transparent px-3 py-1.5 text-sm text-dark dark:text-white60"
  //     >
  //       <img className="w-3.5 h-3.5 ltr:mr-2 rtl:ml-2" src={require('../../../static/img/flag/ar.png')} alt="" />
  //       <span>Arabic</span>
  //     </Link>
  //   </div>
  // );

  return (
    <div className="flex items-center justify-end flex-auto">
      <div className="md:hidden flex items-center gap-2">
        <Search />
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="px-3 py-1 border rounded-md text-sm bg-white flex items-center gap-2"
          >
            {/* DATE TEXT */}
            <span>
              {dateRange
                ? `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}`
                : 'Select Date'}
            </span>

            {dateRange && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDateRange(null);
                }}
                className="text-gray-400 hover:text-red-500 flex items-center"
              >
                <UilTimes className="w-4 h-4" />
              </button>
            )}
          </button>

          <RangePicker
            open={open}
            onOpenChange={(val) => setOpen(val)}
            value={dateRange}
            // onChange={(val) => {
            //   setDateRange(val);
            //   setOpen(false);
            // }}
            onChange={(val) => {
              setDateRange(val);
              setOpen(false);

              if (val) {
                dispatch(
                  action.setDateRange({
                    fromDate: val[0].format('YYYY-MM-DD'),
                    endDate: val[1].format('YYYY-MM-DD'),
                  }),
                );
              } else {
                dispatch(action.setDateRange(null));
              }
            }}
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
          />
        </div>
        {/* <div ref={dateRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenDate(!openDate)}
            className="px-3 py-1 border rounded-md text-sm bg-white shadow-sm hover:border-blue-400"
          >
            {dateRange[0].startDate && dateRange[0].endDate
              ? `${dateRange[0].startDate.toLocaleDateString('en-GB')} - ${dateRange[0].endDate.toLocaleDateString(
                  'en-GB',
                )}`
              : 'Select Date'}
          </button>

          {openDate && (
            <div className="absolute top-10 right-0 z-50 bg-white shadow-xl rounded-lg flex min-w-[700px]">
              <div className="w-45 border-r p-2 text-sm flex flex-col justify-between">
                <div>
                  {['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handlePreset(item)}
                      className={`w-full text-left px-3 py-2 rounded-md mb-1 transition
          ${dateRange[0].label === item ? 'bg-blue-100 text-blue-600 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    className="text-white px-3 py-1.5 rounded-md text-sm"
                    onClick={() => setOpenDate(false)}
                    style={{ background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(15, 118, 110) 100%)' }}
                  >
                    Submit
                  </button>

                  <button
                    type="button"
                    className="border border-gray-300 px-3 py-1.5 rounded-md text-sm"
                    onClick={() => setOpenDate(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="border border-gray-300 px-3 py-1.5 rounded-md text-sm"
                    onClick={() =>
                      setDateRange([
                        {
                          startDate: new Date(),
                          endDate: new Date(),
                          key: 'selection',
                        },
                      ])
                    }
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div>
                <style>
                  {`
  .rdrDateDisplayWrapper {
    padding: 4px 10px;
  }

  .rdrDateDisplayItem {
    height: 34px !important;   
    min-width: 150px !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .rdrDateDisplayItem input {
    font-size: 13px;
    text-align: center;
  }

  .rdrMonth {
    width: 300px !important; 
  }

  .rdrCalendarWrapper {
    width: 100% !important;
  }
.rdrMonthAndYearPickers {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rdrMonthAndYearPickers select {
 padding: 9px 7px 9px 4px !important;
  font-size: 13px;
  line-height: normal;
  appearance: auto; 
}

.rdrMonthAndYearPickers select:hover {
  background-color: rgba(59,130,246,0.08) !important;
  border-radius: 4px;
}
    
`}
                </style>
                <DateRange
                  ranges={dateRange}
                  onChange={(item) => {
                    setDateRange([item.selection]);
                  }}
                  moveRangeOnFirstSelection={false}
                  editableDateInputs
                  months={2}
                  direction="horizontal"
                  minDate={new Date(2022, 0, 1)}
                  maxDate={new Date(2026, 11, 31)}
                />
              </div>
            </div>
          )}
        </div> */}
        <FilterDropdown />
      </div>
      {/* <Message />
      <Notification />
      <Settings />
      <div className="flex mx-3">
        <Dropdown placement="bottomRight" content={country} trigger="click">
          <Link to="#" className="flex">
            <img src={require(`../../../static/img/flag/${flag}.png`)} alt="" />
          </Link>
        </Dropdown>
      </div> */}
      <div className="flex ltr:ml-3 rtl:mr-3 ltr:mr-4 rtl:ml-4 ssm:mr-0 ssm:rtl:ml-0">
        <Popover placement="bottomRight" content={userContent} action="click">
          <Link to="#" className="flex items-center text-light whitespace-nowrap">
            <Avatar src="https://cdn0.iconfinder.com/data/icons/user-pictures/100/matureman1-512.png" />
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
