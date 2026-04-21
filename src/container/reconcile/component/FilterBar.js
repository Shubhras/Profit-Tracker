/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Select, Button } from 'antd';
import { CloseOutlined, CheckOutlined, CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';

export default function FilterBar() {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    channel: '',
    qty: 'grossqty',
    sku: '',
    productId: '',
    parentId: '',
    mktCategory: '',
    invMasterSku: '',
  });

  // const handleApply = () => {
  //   const newPayload = {
  //     ...payload,
  //     ...filters,
  //   };
  //   dispatch(getPivotStats(newPayload));
  // };

  const handleClear = () => {
    setFilters({
      channel: '',
      qty: 'grossqty',
      sku: '',
      productId: '',
      parentId: '',
      mktCategory: '',
      invMasterSku: '',
    });
  };

  return (
    <div className="mb-4">
      <div
        className={`bg-gray-50 rounded-lg border transition-all duration-[2000ms] ease-in-out
        ${open ? 'border-blue-500' : 'border-gray-200'}`}
      >
        {/* TOP ROW */}
        <div
          onClick={() => setOpen(!open)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOpen(!open)}
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
        >
          <span className="text-sm text-gray-500">0 Filter Selected</span>

          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
            role="none"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Button
              // type="button"
              onClick={handleClear}
              className="flex items-center gap-2"
              // className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 bg-white hover:bg-gray-100 transition"
            >
              <span>Clear</span>
              <CloseOutlined className="text-gray-500" />
            </Button>

            <Button
              type="primary"
              // onClick={handleApply}
              className="flex items-center gap-2"
              // className="flex items-center gap-2 px-4 py-1.5 text-sm bg-green-600 text-white hover:bg-blue-700 transition"
            >
              <span>Apply</span>
              <CheckOutlined />
            </Button>
            <Button
              type="text"
              onClick={(e) => {
                e.stopPropagation();
                setOpen((prev) => !prev);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              {open ? (
                <CaretUpOutlined className="text-[#0B3A6E] text-xs leading-none" />
              ) : (
                <CaretDownOutlined className="text-[#0B3A6E] text-xs leading-none" />
              )}
            </Button>
          </div>
        </div>

        {/* FILTER FIELDS (SAME BOX) */}
        <div
          className={`overflow-hidden transition-all duration-[200ms] ease-in-out ${
            open ? 'max-h-[500px] md:max-h-[180px] px-4 pb-4 overflow-y-auto' : 'max-h-0 px-4'
          }`}
        >
          <div className="grid grid-cols-4 md:grid-cols-1 gap-4 pt-2">
            <div>
              <label className="text-sm font-medium" htmlFor="sku">
                SKU:
                <Select
                  id="sku"
                  showSearch
                  allowClear
                  value={filters.sku || undefined}
                  onChange={(value) => setFilters((prev) => ({ ...prev, sku: value || '' }))}
                  placeholder="Sku"
                  className="w-full mt-1 text-start"
                  optionFilterProp="label"
                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                  options={[
                    { value: 'SKU_001', label: 'SKU_001' },
                    { value: 'SKU_002', label: 'SKU_002' },
                    { value: 'SKU_ABC', label: 'SKU_ABC' },
                  ]}
                />
              </label>
            </div>

            {/* ParentId */}
            <div>
              <label htmlFor="parentId" className="text-sm font-medium">
                ParentId:
                <Select
                  id="parentId"
                  showSearch
                  value={filters.parentId || undefined}
                  onChange={(value) => setFilters((prev) => ({ ...prev, parentId: value || '' }))}
                  allowClear
                  placeholder="ParentId"
                  className="w-full mt-1"
                  optionFilterProp="label"
                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                  options={[
                    { value: 'PARENT_001', label: 'PARENT_001' },
                    { value: 'PARENT_002', label: 'PARENT_002' },
                    { value: 'PARENT_ABC', label: 'PARENT_ABC' },
                  ]}
                />
              </label>
            </div>

            {/* MKT Category */}
            <div>
              <label htmlFor="mkt" className="text-sm font-medium">
                MKT category:
                <Select
                  id="mkt"
                  showSearch
                  value={filters.mktCategory || undefined}
                  onChange={(value) => setFilters((prev) => ({ ...prev, mktCategory: value || '' }))}
                  allowClear
                  placeholder="MktCategory"
                  className="w-full mt-1"
                  optionFilterProp="label"
                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                  options={[
                    { value: 'Electronics', label: 'Electronics' },
                    { value: 'Fashion', label: 'Fashion' },
                    { value: 'Home', label: 'Home' },
                  ]}
                />
              </label>
            </div>

            {/* Inv MasterSku */}
            <div>
              <label htmlFor="Inv" className="text-sm font-medium">
                Inv MasterSku:
                <Select
                  id="Inv"
                  showSearch
                  value={filters.invMasterSku || undefined}
                  onChange={(value) => setFilters((prev) => ({ ...prev, invMasterSku: value || '' }))}
                  allowClear
                  placeholder="Inv mastersku"
                  className="w-full mt-1"
                  optionFilterProp="label"
                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                  options={[
                    { value: 'INV_001', label: 'INV_001' },
                    { value: 'INV_002', label: 'INV_002' },
                    { value: 'INV_ABC', label: 'INV_ABC' },
                  ]}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
