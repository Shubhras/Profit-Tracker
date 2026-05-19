import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Table, Tag, Button, Tooltip, Modal, Select, DatePicker } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../../components/page-headers/page-headers';
import amazon from '../../../../assets/icons/amazon.svg';
// import flipkart from '../../../../assets/icons/flipkart.svg';

export default function ProductConfigTab() {
  const { productconfigData, productconfigLoading } = useSelector((state) => state.settings);
  console.log('PRODUCT CONFIG', productconfigData);
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

  const columns = [
    {
      title: '',
      dataIndex: 'icon',
      width: 60,
      render: (v) => <img src={v} alt="channel" className="w-6 h-6 object-contain mx-auto" />,
    },
    {
      title: 'Channel',
      dataIndex: 'channel',
    },
    {
      title: 'Image',
      dataIndex: 'image',
      width: 90,
      render: (img) => <img src={img} alt="product" className="w-12 h-12 object-cover rounded-md" />,
    },
    {
      title: 'ASIN',
      dataIndex: 'productId',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status || '-'}</Tag>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: (a, b) => a.name - b.name,
      render: (text) => (
        <Tooltip title={text}>
          <span className="truncate cursor-pointer block max-w-[250px]">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Product Cost',
      dataIndex: 'productcost',
    },
    {
      title: 'GST Rate%',
      dataIndex: 'gstrate',
    },
    {
      title: 'TCS',
      dataIndex: 'tcs',
    },

    {
      title: 'Item Weight',
      dataIndex: 'itemWeight',
    },

    {
      title: 'Length',
      dataIndex: 'length',
    },

    {
      title: 'Width',
      dataIndex: 'width',
    },

    {
      title: 'Height',
      dataIndex: 'height',
    },

    {
      title: 'Pkg Length',
      dataIndex: 'pkgLength',
    },

    {
      title: 'Pkg Width',
      dataIndex: 'pkgWidth',
    },

    {
      title: 'Pkg Height',
      dataIndex: 'pkgHeight',
    },
  ];

  const data =
    productconfigData?.data?.map((item) => ({
      key: item.id,

      icon: amazon,

      channel: 'Amazon',

      productId: item.asin || '-',

      sku: item.sku || '-',

      status: item.status?.[0] || '-',

      name: item.item_name || '-',

      image: item.image_url || '',
      productcost: item.productcost || 0,
      gstrate: item.gstrate || 0,
      tcs: item.tcs || 0,

      itemWeight: item.attributes?.item_weight?.[0]
        ? `${item.attributes.item_weight[0].value}/${item.attributes.item_weight[0].unit}`
        : '-',

      length: item.attributes?.item_dimensions?.[0]?.length
        ? `${item.attributes.item_dimensions[0].length.value}/${item.attributes.item_dimensions[0].length.unit}`
        : '-',

      width: item.attributes?.item_dimensions?.[0]?.width
        ? `${item.attributes.item_dimensions[0].width.value}/${item.attributes.item_dimensions[0].width.unit}`
        : '-',

      height: item.attributes?.item_dimensions?.[0]?.height
        ? `${item.attributes.item_dimensions[0].height.value}/${item.attributes.item_dimensions[0].height.unit}`
        : '-',

      pkgLength: item.attributes?.item_package_dimensions?.[0]?.length
        ? `${item.attributes.item_package_dimensions[0].length.value}/${item.attributes.item_package_dimensions[0].length.unit}`
        : '-',

      pkgWidth: item.attributes?.item_package_dimensions?.[0]?.width
        ? `${item.attributes.item_package_dimensions[0].width.value}/${item.attributes.item_package_dimensions[0].width.unit}`
        : '-',

      pkgHeight: item.attributes?.item_package_dimensions?.[0]?.height
        ? `${item.attributes.item_package_dimensions[0].height.value}/${item.attributes.item_package_dimensions[0].height.unit}`
        : '-',
    })) || [];
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
          loading={productconfigLoading}
          showSorterTooltip={false}
          size="small"
          bordered
          scroll={{ x: 'max-content' }}
          className="bg-white rounded-lg shadow-sm"
          pagination={{
            total: productconfigData?.totalCount || 0,
            current: productconfigData?.pageNo || 1,
            pageSize: productconfigData?.pageSize || 10,
          }}
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
