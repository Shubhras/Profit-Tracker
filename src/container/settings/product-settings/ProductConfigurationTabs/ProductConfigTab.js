import React, { useState } from 'react';
import { Table, Tag, Button, Tooltip, Popover, Checkbox, Modal, Select, DatePicker } from 'antd';
import { SettingOutlined, EditOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../../components/page-headers/page-headers';
import amazon from '../../../../assets/icons/amazon.svg';
import flipkart from '../../../../assets/icons/flipkart.svg';

export default function ProductConfigTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  // const PageRoutes = [
  //   {
  //     path: 'index',
  //     breadcrumbName: 'Settings',
  //   },
  //   {
  //     path: '',
  //     breadcrumbName: 'Product Settings',
  //   },
  //   {
  //     path: '',
  //     breadcrumbName: 'Product Configuration',
  //   },
  // ];
  const columnSettingsContent = (
    <div className="w-[650px]">
      {/* Title */}
      <div className="text-center font-semibold py-2 border-b">Customize Your Columns</div>

      {/* Select All Row */}
      <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 border-b">
        <Checkbox>Select All</Checkbox>
      </div>

      {/* Checkbox Grid */}
      <div className="grid grid-cols-3 gap-3 p-3">
        <Checkbox defaultChecked>Channel</Checkbox>
        <Checkbox>Account</Checkbox>
        <Checkbox defaultChecked>Product Id</Checkbox>

        <Checkbox defaultChecked>SKU</Checkbox>
        <Checkbox defaultChecked>Status</Checkbox>
        <Checkbox defaultChecked>Name</Checkbox>

        <Checkbox>Parent ID</Checkbox>
        <Checkbox defaultChecked>MRP</Checkbox>
        <Checkbox defaultChecked>Std Cost</Checkbox>

        <Checkbox defaultChecked>Std Cost Tax %</Checkbox>
        <Checkbox>Category Ids</Checkbox>
        <Checkbox defaultChecked>Inv Master</Checkbox>

        <Checkbox>Storage Master</Checkbox>
        <Checkbox>Length(cm)</Checkbox>
        <Checkbox>Breadth(cm)</Checkbox>

        <Checkbox>Weight(kg)</Checkbox>
        <Checkbox>Height(cm)</Checkbox>
      </div>
    </div>
  );
  const columns = [
    {
      title: (
        <Popover content={columnSettingsContent} trigger="click" placement="bottomLeft">
          <SettingOutlined className="cursor-pointer" />
        </Popover>
      ),
      dataIndex: 'icon',
      width: 70,
      render: (v) => <img src={v} alt="" className="w-6 h-6" />,
    },
    {
      title: 'Channel',
      dataIndex: 'channel',
    },
    {
      title: 'Product Id',
      dataIndex: 'productId',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: () => <Tag color="green">ACTIVE</Tag>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name - b.name,
      render: (text) => (
        <Tooltip title={text}>
          <span className="truncate block max-w-[250px]">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      sorter: (a, b) => a.mrp - b.mrp,
    },
    {
      title: 'Std Cost',
      dataIndex: 'cost',
      sorter: (a, b) => a.cost - b.cost,
    },
    {
      title: 'Std Cost Tax %',
      dataIndex: 'tax',
      sorter: (a, b) => a.tax - b.tax,
    },
    {
      title: 'Inv Master',
      dataIndex: 'inv',
      sorter: (a, b) => a.inv - b.inv,
    },
  ];

  const data = [
    {
      key: 1,
      icon: amazon,
      channel: 'Amazon',
      productId: 'BOCS6PXFDT',
      sku: 'shortcami-skin-XL',
      name: 'Fshway Basic Camisole Adjustable...',
      mrp: 499,
      cost: 65,
      tax: '-',
      inv: '-',
    },
    {
      key: 2,
      icon: flipkart,
      channel: 'Flipkart',
      productId: 'SPWG7DGS...',
      sku: 'tummy slimmer belt-3XL',
      name: 'Fshway Unisex Shapewear',
      mrp: 699,
      cost: 145,
      tax: '-',
      inv: '-',
    },
  ];
  return (
    <>
      <PageHeader
        // routes={PageRoutes}
        // title="Product Configuration"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-2 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] px-8 xl:px-[15px] pb-[30px]">
        {/* Tabs */}
        {/* <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'Product Configuration',
              children: null,
            },
            {
              key: '2',
              label: 'Inventory Master Configuration',
              children: null,
            },
            {
              key: '3',
              label: 'Pincode',
              children: null,
            },
          ]}
        /> */}

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500 text-sm">Double-click a cell to edit</span>

          <div className="flex gap-2">
            <Button type="primary" className="font-bold" onClick={() => setIsModalOpen(true)}>
              Order Missing Update
            </Button>
            <Button type="primary" className="font-bold" onClick={() => setIsFieldModalOpen(true)}>
              Field Settings
            </Button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          showSorterTooltip={false}
          size="small"
          bordered
          scroll={{ x: 'max-content' }}
          className="bg-white rounded-lg shadow-sm"
        />
      </main>
      <Modal
        title="Order Missing Update"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <div className="flex flex-col gap-4">
          {/* Order Missing Key */}
          <div>
            <label className="block mb-1 text-sm font-medium">Order Missing Key:</label>
            <Select
              placeholder="Select key"
              className="w-full"
              options={[
                { label: 'Option 1', value: '1' },
                { label: 'Option 2', value: '2' },
              ]}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Effective Date:</label>
            <DatePicker className="w-full" />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => setIsModalOpen(false)}>
              OK
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        title="Field Settings"
        open={isFieldModalOpen}
        onCancel={() => setIsFieldModalOpen(false)}
        footer={null}
        width={700}
        centered
      >
        <div className="border rounded-lg p-4">
          {/* Static Fields */}
          <div className="mb-4">
            <div className="font-semibold mb-2 border-b pb-1">Static Fields</div>

            {['Standard Cost', 'Storage Master', 'MRP', 'Dimensions'].map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b text-sm">
                <div className="flex gap-3">
                  <span className="text-gray-500">{String(index + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-500">
                  <span>Channel, SKU</span>
                  <EditOutlined className="text-blue-500 cursor-pointer" />{' '}
                </div>
              </div>
            ))}
          </div>

          {/* Master SKU Config */}
          <div>
            <div className="font-semibold mb-2 border-b pb-1">Master SKU Configuration</div>

            <div className="text-gray-400 text-sm mb-3">01 &nbsp; Empty slot</div>

            {/* Add Master SKU */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="mb-2 font-medium">Add Master SKU</div>

              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-1">
                  <input type="radio" defaultChecked />
                  Channel, SKU
                </label>

                <label className="flex items-center gap-1">
                  <input type="radio" />
                  Inventory Master SKU
                </label>
              </div>

              <div className="flex gap-2">
                <input placeholder="Enter Master SKU Title Here" className="flex-1 border rounded px-2 py-1 text-sm" />

                <Button type="primary">✓</Button>
                <Button danger>✕</Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
