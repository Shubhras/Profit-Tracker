import UilSearch from '@iconscout/react-unicons/icons/uil-search';
import UilTimes from '@iconscout/react-unicons/icons/uil-times';
import { Form, Input } from 'antd';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import actions from '../../../redux/dashboard/action';

const SearchBar = React.memo(() => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [value, setValue] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(actions.setSearch(value));
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);
  return (
    <div className="flex items-center">
      <div className="w-[140px]">
        <Form form={form} name="hexadash-search">
          <Form.Item name="search-input" className="mb-0">
            <Input
              value={value}
              className="bg-white border border-gray-300 rounded-md h-[36px] px-3 focus:border-blue-500 focus:shadow-none"
              placeholder="Search..."
              onChange={(e) => setValue(e.target.value)}
              suffix={
                value ? (
                  <UilTimes
                    className="cursor-pointer text-gray-400 w-4 h-4"
                    onClick={() => {
                      setValue('');
                      form.setFieldsValue({ 'search-input': '' });
                      dispatch(actions.setSearch(''));
                    }}
                  />
                ) : (
                  <UilSearch className="text-gray-400 w-4 h-4" />
                )
              }
            />
          </Form.Item>
        </Form>
      </div>
    </div>
  );
});

export default SearchBar;
