import React, { useState } from 'react';
import UilUser from '@iconscout/react-unicons/icons/uil-user';
import UilLock from '@iconscout/react-unicons/icons/uil-padlock';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  {
    key: 'profile',
    label: 'Edit Profile',
    hint: 'Name, contact & business details',
    icon: UilUser,
  },
  {
    key: 'password',
    label: 'Change Password',
    hint: 'Update your login credentials',
    icon: UilLock,
  },
];

function AuthorBox() {
  const path = '/admin/pages/settings';
  const [activeValue, setActiveValue] = useState('profile');

  return (
    <div className="bg-white dark:bg-white10 rounded-lg border border-slate-100 dark:border-white10 overflow-hidden">
      <nav className="px-3 py-4">
        <ul className="mb-0 space-y-1">
          {NAV_ITEMS.map(({ key, label, hint, icon: Icon }) => {
            const isActive = activeValue === key;

            return (
              <li key={key}>
                <NavLink
                  to={`${path}/${key}`}
                  onClick={() => setActiveValue(key)}
                  className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-150 ${
                    isActive ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'
                  }`}
                >
                  {isActive && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-emerald-500" />}

                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>

                  <span className="flex flex-col">
                    <span
                      className={`text-[13.5px] leading-tight ${
                        isActive
                          ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'text-slate-700 dark:text-white70 font-medium'
                      }`}
                    >
                      {label}
                    </span>
                    <span className="text-[11.5px] text-slate-400 dark:text-white40 mt-0.5">{hint}</span>
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export default AuthorBox;
