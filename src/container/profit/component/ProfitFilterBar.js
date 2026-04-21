import React from 'react';
import { Button } from 'antd';
import { CheckOutlined, CloseOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';

function ProfitFilterBar({ filters, setFilters, handleApply, handleClear }) {
  const [showFilters, setShowFilters] = React.useState(false);
  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePairChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const selectedFilters = [
    filters.ads === 'with' && { label: 'With Ads', color: 'green' },
    filters.ads === 'without' && { label: 'Without Ads', color: 'red' },

    filters.gst === 'with' && { label: 'With GST', color: 'green' },
    filters.gst === 'without' && { label: 'Without GST', color: 'red' },

    filters.estimate === 'with' && { label: 'With Estimate', color: 'green' },
    filters.estimate === 'without' && { label: 'Without Estimate', color: 'red' },

    filters.expenses === 'with' && { label: 'With Expenses', color: 'green' },
    filters.expenses === 'without' && { label: 'Without Expenses', color: 'red' },

    filters.accountCharges === 'with' && { label: 'With Account Charges', color: 'green' },
    filters.accountCharges === 'without' && { label: 'Without Account Charges', color: 'red' },
  ].filter(Boolean);

  return (
    <div className="mb-4 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <div className="flex items-center gap-4 mb-4">
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          onChange={(e) => handleChange('channel', e.target.value)}
        >
          <option value="">Channel</option>
        </select>

        <div className="flex flex-wrap items-center gap-2">
          {selectedFilters.map((item, i) => (
            <span key={i} className="flex items-center gap-1 text-sm">
              <span className={`w-2 h-2 rounded-full ${item.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`} />
              {item.label}
            </span>
          ))}
        </div>

        {/* Selected filters preview */}
        {/* <div className="flex flex-wrap items-center gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;

            const labelMap = {
              ads: 'Ads',
              gst: 'GST',
              estimate: 'Estimate',
              expenses: 'Expenses',
              accountCharges: 'Account Charges',
            };

            return (
              <span key={key} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${value === 'with' ? 'bg-green-500' : 'bg-red-500'}`} />
                {labelMap[key]}: {value === 'with' ? 'With' : 'Without'}
              </span>
            );
          })}
        </div> */}

        <div className="ml-auto flex items-center gap-4 shrink-0 whitespace-nowrap">
          <Button onClick={handleClear} className="flex items-center gap-1">
            Clear <CloseOutlined />
          </Button>

          <Button type="primary" onClick={handleApply} className="flex items-center gap-1">
            Apply <CheckOutlined />
          </Button>
          <Button
            type="text"
            onClick={(e) => {
              e.stopPropagation();
              setShowFilters((prev) => !prev);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
          >
            {showFilters ? (
              <CaretUpOutlined className="text-[#0B3A6E] text-xs leading-none" />
            ) : (
              <CaretDownOutlined className="text-[#0B3A6E] text-xs leading-none" />
            )}
          </Button>
        </div>
      </div>
      {showFilters && (
        <>
          <div className="flex items-end gap-4 overflow-x-auto whitespace-nowrap pb-1">
            {['sku', 'productId', 'parentId', 'mkt'].map((field) => (
              <div className="min-w-[180px]" key={field}>
                <label className="text-sm text-gray-600 mb-1 block">{field}</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  placeholder={field}
                  value={filters[field] || ''}
                  onChange={(e) => handleChange(field, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 border-t pt-3">
            {[
              { key: 'ads', label: 'Ads' },
              { key: 'gst', label: 'Gst' },
              { key: 'estimate', label: 'Estimate' },
              { key: 'expenses', label: 'Expenses' },
              { key: 'accountCharges', label: 'Account Charges' },
            ].map(({ key, label }) => (
              <React.Fragment key={key}>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters[key] === 'with'}
                    onChange={() => handlePairChange(key, 'with')}
                  />
                  With {label}
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters[key] === 'without'}
                    onChange={() => handlePairChange(key, 'without')}
                  />
                  Without {label}
                </label>
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProfitFilterBar;
