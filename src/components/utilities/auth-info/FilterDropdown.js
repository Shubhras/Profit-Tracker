import React, { useState, useRef, useEffect } from 'react';
import UilAngleDown from '@iconscout/react-unicons/icons/uil-angle-down';
import { Checkbox } from 'antd';

function FilterDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  const dropdownRef = useRef(null);

  const options = ['Select All', 'Amazon-India', 'FlipKart', 'Jiomart', 'Meesho', 'Myntra', 'Snapdeal'];
  const allOptions = options.filter((item) => item !== 'Select All');
  const handleCheckbox = (value) => {
    if (value === 'Select All') {
      if (selected.length === allOptions.length) {
        setSelected([]);
      } else {
        setSelected(allOptions);
      }
    } else {
      setSelected((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="cursor-pointer p-2 rounded-md flex items-center justify-center"
      >
        {selected.length > 0 && <span className="text-xs font-medium text-gray-600">{selected.length}</span>}
        <UilAngleDown className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute left-0 w-48 bg-white shadow-lg rounded-lg p-3 z-50">
          {options.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 px-2 py-3 leading-none rounded cursor-pointer hover:bg-blue-50"
            >
              <Checkbox
                checked={item === 'Select All' ? selected.length === allOptions.length : selected.includes(item)}
                onChange={() => handleCheckbox(item)}
                className="!m-0"
              />{' '}
              <span className="text-sm flex items-center">{item}</span>
            </div>
          ))}

          <div className="border-t my-2" />

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => {
                console.log('Selected:', selected);
                setOpen(false);
              }}
              className="text-white text-sm px-4 py-1.5 rounded-md"
              style={{ background: 'linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(15, 118, 110) 100%)' }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
