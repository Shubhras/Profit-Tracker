import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Tooltip, Modal, message, Input } from 'antd';
import { UploadOutlined, ExportOutlined } from '@ant-design/icons';
import { PageHeader } from '../../../../components/page-headers/page-headers';
import { exportProductConfiguration, uploadProductConfiguration } from '../../../../redux/Settings/actionCreator';

export default function ProductConfigTab({ pagination, setPagination, search, onSearch }) {
  const { productconfigData, productconfigLoading, exportLoading, uploadLoading } = useSelector(
    (state) => state.settings,
  );
  const { channel: globalChannel } = useSelector((state) => state.dashboard);

  const channelLogoMap = {
    'Amazon-India': '/icons/amazon.svg',
    'Myntra-India': '/icons/myntraLogo.jpg',
  };

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);

  const columns = [
    {
      title: 'Channel',
      dataIndex: 'channel',
      width: 80,
      align: 'center',
      fixed: 'left',
      render: (value) => {
        const logo = channelLogoMap[value];

        return (
          <Tooltip title={value}>
            <div className="flex items-center justify-center w-full">
              {logo ? (
                <img src={logo} alt={value} className="w-6 h-6 object-contain" />
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Image',
      dataIndex: 'image',
      width: 90,
      align: 'center',
      fixed: 'left',
      render: (img) =>
        img ? (
          <img src={img} alt="product" className="w-12 h-12 object-cover rounded-md mx-auto" />
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: 'Product ID',
      dataIndex: 'productId',
      align: 'center',
      render: (v, record) => {
        if (!v || v === '-') return <span className="text-gray-400">-</span>;
        const isMyntra = record.channel?.toLowerCase().includes('myntra');
        const href = isMyntra ? `https://www.myntra.com/${v}` : `https://www.amazon.in/dp/${v}`;
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2563eb] font-medium hover:underline"
          >
            {v}
          </a>
        );
      },
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
      key: item.id || item.key,

      // icon: amazon,

      channel: item.channel || '-',

      productId: item.asin || item.productId || item.style_id || item.sku_id || '-',

      sku: item.sku || item.seller_sku || item.seller_sku_code || '-',

      status: item.status?.[0] || item.status || '-',

      name: item.item_name || item.style_name || item.name || '-',

      image: item.image_url || item.image || '',
      productcost: item.standard_cost ?? item.productcost ?? 0,
      gstrate: item.gst_rate ?? item.gstrate ?? 0,
      tcs: item.tcs ?? 0,
      stateLevel: item.step_level || 0,
      shippinCharge: item.shiping_estimate || 0,
      region: item.region || '-',
    })) || [];
  return (
    <>
      <PageHeader className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-2 sm:pb-[30px] bg-transparent sm:flex-col" />
      <main className="min-h-[715px] px-5 xl:px-[15px] pb-[30px]">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-2 max-w-[360px] w-full">
            <Input
              placeholder="Search by ASIN / ID, SKU"
              allowClear
              onChange={(e) => onSearch(e.target.value)}
              className="w-full !h-[30px]"
            />{' '}
          </div>
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<ExportOutlined className="!text-[16px] !font-bold" />}
              className="!h-[30px] !rounded-l !border-[#dbe1e8] !text-white !font-semibold !flex !items-center !justify-center"
              loading={exportLoading}
              onClick={() => dispatch(exportProductConfiguration(globalChannel, search))}
            >
              Export
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined className="!text-[16px] !font-bold" />}
              className="!h-[30px] !rounded-l !border-[#dbe1e8] !text-white !font-semibold !flex !items-center !justify-center"
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
          className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-4
    [&_.ant-table-cell]:!py-[7px]
  "
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
