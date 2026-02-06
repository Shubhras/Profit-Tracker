/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { Select, Button } from 'antd';
import { DownOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';

export default function ReturnFilterBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-4">
      <div
        className={`bg-white rounded-lg border transition-all duration-[2000ms] ease-in-out
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
            onClick={(e) => e.stopPropagation()} // prevent toggle on button click
            role="none"
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Button size="small" onClick={() => setOpen(!open)}>
              <span className="inline-flex items-center gap-1">
                <CloseOutlined />
                <span>Cancel</span>
              </span>
            </Button>

            <Button size="small" type="primary" onClick={() => setOpen(!open)}>
              <span className="inline-flex items-center gap-1">
                <CheckOutlined />
                <span>Apply</span>
              </span>
            </Button>

            <Button
              size="small"
              shape="circle"
              icon={<DownOutlined className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />}
            />
          </div>
        </div>

        {/* FILTER FIELDS (SAME BOX) */}
        <div
          className={`overflow-hidden transition-all duration-[200ms] ease-in-out ${
            open ? 'max-h-[500px] md:max-h-[180px] px-4 pb-4 overflow-y-auto' : 'max-h-0 px-4'
          }`}
        >
          <div className="grid grid-cols-7 md:grid-cols-1 gap-4 pt-2">
            <div>
              <label htmlFor="fulfillmentType" className="text-sm font-medium">
                Fullfillment Type:
                <Select
                  id="fulfillmentType"
                  showSearch
                  allowClear
                  placeholder="Select Fulfillment Type"
                  className="w-full mt-1"
                  optionFilterProp="label"
                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                  options={[
                    { value: 'Direct', label: 'Direct' },
                    { value: 'ThirdParty', label: 'Third Party' },
                    { value: 'Dropship', label: 'Dropship' },
                  ]}
                />
              </label>
            </div>

            {/* Order Status */}
            <div>
              <label htmlFor="orderStatus" className="text-sm font-medium">
                Order Status:
                <Select
                  id="orderStatus"
                  showSearch
                  allowClear
                  placeholder="Select Order Status"
                  className="w-full mt-1"
                  optionFilterProp="label"
                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Shipped', label: 'Shipped' },
                    { value: 'Delivered', label: 'Delivered' },
                    { value: 'Cancelled', label: 'Cancelled' },
                  ]}
                />
              </label>
            </div>

            {/* Rating */}
            <div>
              <label htmlFor="rating" className="text-sm font-medium">
                Rating:
                <Select
                  id="rating"
                  showSearch
                  allowClear
                  placeholder="Select Rating"
                  className="w-full mt-1"
                  optionFilterProp="label"
                  filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                  options={[
                    { value: '1', label: '1 ⭐' },
                    { value: '2', label: '2 ⭐' },
                    { value: '3', label: '3 ⭐' },
                    { value: '4', label: '4 ⭐' },
                    { value: '5', label: '5 ⭐' },
                  ]}
                />
              </label>
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="sku">
                SKU:
                <Select
                  id="sku"
                  showSearch
                  allowClear
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
