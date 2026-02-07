import UilAngleDown from '@iconscout/react-unicons/icons/uil-angle-down';
// import UilBell from '@iconscout/react-unicons/icons/uil-bell';
import UilDollarSign from '@iconscout/react-unicons/icons/uil-dollar-sign';
// import UilSetting from '@iconscout/react-unicons/icons/uil-setting';
import UilSignout from '@iconscout/react-unicons/icons/uil-signout';
import UilUser from '@iconscout/react-unicons/icons/uil-user';
// import UilUsersAlt from '@iconscout/react-unicons/icons/uil-users-alt';
import { Avatar } from 'antd';
import React, { useEffect } from 'react';
// import { useTranslation} from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Search from './Search';
// import Message from './Message';
// import Notification from './Notification';
// import Settings from './settings';
import { Popover } from '../../popup/popup';
import Heading from '../../heading/heading';
// import { Dropdown } from '../../dropdown/dropdown';
import { logOut, getProfile } from '../../../redux/authentication/actionCreator';

const AuthInfo = React.memo(() => {
  const dispatch = useDispatch();

  // ✅ Get Profile and profileLoading from Redux Store
  const { profile, profileLoading } = useSelector((state) => state.auth);

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
    if (!profile && !profileLoading) {
      dispatch(getProfile());
    }
  }, [dispatch, profile, profileLoading]);

  const userContent = (
    <div className="min-w-sm w-full bg-white dark:bg-[#1b1e2b] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="p-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600">
        <figure className="flex items-center gap-3 mb-0 relative z-10">
          <img
            className="w-12 h-12 rounded-full border-2 border-white/30 p-0.5"
            src={require('../../../static/img/avatar/chat-auth.png')}
            alt=""
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
      <div className="md:hidden">
        <Search />
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
