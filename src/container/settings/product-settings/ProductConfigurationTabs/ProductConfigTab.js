import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Tag, Button, Tooltip, Modal, message } from 'antd';
import { UploadOutlined, ExportOutlined } from '@ant-design/icons';
// import { EditOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../../components/page-headers/page-headers';
import amazon from '../../../../assets/icons/amazon.svg';
import { exportProductConfiguration, uploadProductConfiguration } from '../../../../redux/Settings/actionCreator';
// import flipkart from '../../../../assets/icons/flipkart.svg';

export default function ProductConfigTab({ pagination, setPagination }) {
  const { productconfigData, productconfigLoading, exportLoading, uploadLoading } = useSelector(
    (state) => state.settings,
  );

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
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
    // {
    //   title: '',
    //   dataIndex: 'icon',
    //   width: 60,
    //   fixed: 'left',
    //   render: (v) => <img src={v} alt="channel" className="w-6 h-6 object-contain mx-auto" />,
    // },
    {
      title: 'Image',
      dataIndex: 'image',
      width: 90,
      align: 'center',
      fixed: 'left',
      render: (img) => <img src={img} alt="product" className="w-12 h-12 object-cover rounded-md" />,
    },
    {
      title: 'ASIN',
      dataIndex: 'productId',
      align: 'center',
      render: (v) => <span className="text-[#2563eb] font-medium">{v}</span>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: 150,
      align: 'center',
      render: (text) => (
        <Tooltip title={text} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="truncate block cursor-pointer max-w-[130px] mx-auto">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'center',
      render: (status) => <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status || '-'}</Tag>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'center',
      // sorter: (a, b) => a.name - b.name,
      render: (text) => (
        <Tooltip title={text} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="truncate cursor-pointer block max-w-[250px]">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Item Weight',
      dataIndex: 'itemWeight',
      align: 'center',
    },
    {
      title: 'Item Pkg Weight',
      dataIndex: 'itempkgWeight',
      align: 'center',
    },

    // {
    //   title: 'Length',
    //   dataIndex: 'length',
    //   align: 'center',
    // },

    // {
    //   title: 'Width',
    //   dataIndex: 'width',
    //   align: 'center',
    // },

    // {
    //   title: 'Height',
    //   dataIndex: 'height',
    //   align: 'center',
    // },

    {
      title: 'Pkg Length',
      dataIndex: 'pkgLength',
      align: 'center',
    },

    {
      title: 'Pkg Width',
      dataIndex: 'pkgWidth',
      align: 'center',
    },

    {
      title: 'Pkg Height',
      dataIndex: 'pkgHeight',
      align: 'center',
    },
    {
      title: 'Shipping Estimate Charges',
      dataIndex: 'shippinCharge',
      align: 'center',
    },

    {
      title: 'Region',
      dataIndex: 'region',
      align: 'center',
    },

    {
      title: 'Step Level',
      dataIndex: 'stateLevel',
      align: 'center',
    },

    {
      title: 'Product Cost',
      dataIndex: 'productcost',
      align: 'center',
    },
    {
      title: 'GST Rate%',
      dataIndex: 'gstrate',
      align: 'center',
    },
    {
      title: 'TCS',
      dataIndex: 'tcs',
      align: 'center',
    },
  ];

  const data =
    productconfigData?.data?.map((item) => ({
      key: item.id,

      icon: amazon,

      // channel: 'Amazon',

      productId: item.asin || '-',

      sku: item.sku || '-',

      status: item.status?.[0] || '-',

      name: item.item_name || '-',

      image: item.image_url || '',
      productcost: item.standard_cost || 0,
      gstrate: item.gst_rate || 0,
      tcs: item.tcs || 0,
      stateLevel: item.step_level || 0,
      shippinCharge: item.shiping_estimate || 0,
      region: item.region || '-',

      itemWeight: item.attributes?.item_weight?.[0]
        ? `${item.attributes.item_weight[0].value} ${item.attributes.item_weight[0].unit}`
        : '-',

      itempkgWeight: item.attributes?.item_package_weight?.[0]
        ? `${item.attributes.item_package_weight[0].value} ${item.attributes.item_package_weight[0].unit}`
        : '-',

      length: item.attributes?.item_dimensions?.[0]?.length
        ? `${item.attributes.item_dimensions[0].length.value} ${item.attributes.item_dimensions[0].length.unit}`
        : '-',

      width: item.attributes?.item_dimensions?.[0]?.width
        ? `${item.attributes.item_dimensions[0].width.value} ${item.attributes.item_dimensions[0].width.unit}`
        : '-',

      height: item.attributes?.item_dimensions?.[0]?.height
        ? `${item.attributes.item_dimensions[0].height.value} ${item.attributes.item_dimensions[0].height.unit}`
        : '-',

      pkgLength: item.attributes?.item_package_dimensions?.[0]?.length
        ? `${item.attributes.item_package_dimensions[0].length.value} ${item.attributes.item_package_dimensions[0].length.unit}`
        : '-',

      pkgWidth: item.attributes?.item_package_dimensions?.[0]?.width
        ? `${item.attributes.item_package_dimensions[0].width.value} ${item.attributes.item_package_dimensions[0].width.unit}`
        : '-',

      pkgHeight: item.attributes?.item_package_dimensions?.[0]?.height
        ? `${item.attributes.item_package_dimensions[0].height.value} ${item.attributes.item_package_dimensions[0].height.unit}`
        : '-',
    })) || [];
  return (
    <>
      <PageHeader
        // routes={PageRoutes}
        // title="Product Configuration"
        className="flex  justify-between items-center px-8 xl:px-[15px] pt-2 pb-2 sm:pb-[30px] bg-transparent sm:flex-col"
      />
      <main className="min-h-[715px] px-5 xl:px-[15px] pb-[30px]">
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
        <div className="flex justify-end items-center mb-4">
          {/* <span className="text-gray-500 text-sm">Double-click a cell to edit</span> */}

          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<ExportOutlined className="!text-[16px] !font-bold" />}
              className="!h-[40px] !rounded-xl !border-[#dbe1e8] !text-white !font-bold !flex !items-center !justify-center"
              loading={exportLoading}
              onClick={() => dispatch(exportProductConfiguration())}
            >
              Export
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined className="!text-[16px] !font-bold" />}
              className="!h-[40px] !rounded-xl !border-[#dbe1e8] !text-white !font-bold !flex !items-center !justify-center"
              onClick={() => setIsFieldModalOpen(true)}
            >
              Upload
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
            current: pagination.current,
            pageSize: pagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          }}
          onChange={(pag) => {
            setPagination({
              current: pag.current,
              pageSize: pag.pageSize,
            });
          }}
        />
      </main>
      <Modal
        title="Upload Excel File"
        open={isFieldModalOpen}
        onCancel={() => {
          setIsFieldModalOpen(false);
          setSelectedFile(null);
        }}
        footer={null}
        width={500}
        centered
      >
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              const validTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
              ];

              if (!validTypes.includes(file.type)) {
                message.error('Only Excel files are allowed');
                return;
              }

              setSelectedFile(file);
            }}
          />

          {selectedFile && (
            <div className="text-sm text-[#374151]">
              Selected File:
              <span className="font-semibold ml-1">{selectedFile.name}</span>
            </div>
          )}

          <Button
            type="primary"
            loading={uploadLoading}
            disabled={!selectedFile}
            onClick={async () => {
              try {
                await dispatch(uploadProductConfiguration(selectedFile));

                message.success('Excel uploaded successfully');

                setIsFieldModalOpen(false);

                setSelectedFile(null);

                window.location.reload();
              } catch (err) {
                message.error('Upload failed');
              }
            }}
          >
            Upload File
          </Button>
        </div>
      </Modal>
    </>
  );
}
