import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Table, Button, Tooltip, Modal, message, Input } from 'antd';
import {
  UploadOutlined,
  ExportOutlined,
  EditOutlined,
  PictureOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../../components/page-headers/page-headers';
import {
  exportProductConfiguration,
  uploadProductConfiguration,
  updateProductConfiguration,
  getProductConfiguration,
} from '../../../../redux/Settings/actionCreator';

export default function ProductConfigTab({ pagination, setPagination, search, onSearch }) {
  const { productconfigData, productconfigLoading, exportLoading, uploadLoading } = useSelector(
    (state) => state.settings,
  );
  const { channel: globalChannel } = useSelector((state) => state.dashboard);

  const channelLogoMap = {
    'Amazon-India': '/icons/amazon.svg',
    'Myntra-India': '/icons/myntraLogo.jpg',
    Myntra: '/icons/myntraLogo.jpg',
  };

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    standard_cost: 0,
    gst_rate: 0,
    tds: 0,
    tcs: 0,
    image_url: '',
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState('url'); // 'url' or 'upload'
  const [isImageCleared, setIsImageCleared] = useState(false);

  const handleOpenEditModal = (record) => {
    setEditingRecord(record);
    const currentImg = record.image || '';
    setEditForm({
      standard_cost: record.productcost ?? 0,
      gst_rate: record.gstrate ?? 0,
      tds: record.tds ?? 0,
      tcs: record.tcs ?? 0,
      image_url: currentImg,
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(currentImg);
    setIsImageCleared(false);
    setImageInputMode('url');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setEditLoading(true);
    try {
      let payload;
      const shouldClearImage = isImageCleared || (!selectedImageFile && !editForm.image_url.trim());
      if (selectedImageFile) {
        payload = new FormData();
        payload.append('id', editingRecord.key);
        payload.append('standard_cost', parseFloat(editForm.standard_cost) || 0);
        payload.append('gst_rate', parseFloat(editForm.gst_rate) || 0);
        payload.append('tds', parseFloat(editForm.tds) || 0);
        payload.append('tcs', parseFloat(editForm.tcs) || 0);
        payload.append('image', selectedImageFile);
      } else {
        payload = {
          id: editingRecord.key,
          standard_cost: parseFloat(editForm.standard_cost) || 0,
          gst_rate: parseFloat(editForm.gst_rate) || 0,
          tds: parseFloat(editForm.tds) || 0,
          tcs: parseFloat(editForm.tcs) || 0,
          image_url: shouldClearImage ? '__NONE__' : editForm.image_url.trim(),
          clear_image: shouldClearImage,
        };
      }
      const res = await dispatch(updateProductConfiguration(payload));
      if (res?.status !== false) {
        message.success('Listing item updated successfully');
        setIsEditModalOpen(false);
        setEditingRecord(null);
        setSelectedImageFile(null);
        setIsImageCleared(false);
        // Refresh product configuration list
        dispatch(
          getProductConfiguration(pagination.current, pagination.pageSize, {
            search: search || '',
            channels: globalChannel,
            marketplace_id: '',
            product_type: '',
          }),
        );
      } else {
        message.error(res?.message || 'Failed to update item');
      }
    } catch (err) {
      message.error(err?.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columns = [
    {
      title: 'Channel',
      dataIndex: 'channel',
      width: 80,
      align: 'center',
      fixed: isMobile ? false : 'left',
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
      fixed: isMobile ? false : 'left',
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
      sorter: (a, b) => a.productId - b.productId,
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
      sorter: (a, b) => a.sku - b.sku,
      render: (text) => (
        <Tooltip title={text} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="truncate block cursor-pointer max-w-[130px] mx-auto">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Product Cost (₹)',
      dataIndex: 'productcost',
      align: 'center',
      sorter: (a, b) => a.productcost - b.productcost,
    },
    {
      title: 'GST Rate (%)',
      dataIndex: 'gstrate',
      align: 'center',
      sorter: (a, b) => a.gstrate - b.gstrate,
    },
    {
      title: 'TDS (%)',
      dataIndex: 'tds',
      align: 'center',
      sorter: (a, b) => a.tds - b.tds,
      render: (val) => (val !== undefined && val !== null && val !== '' && val !== '-' ? val : 0),
    },
    {
      title: 'TCS (%)',
      dataIndex: 'tcs',
      align: 'center',
      sorter: (a, b) => a.tcs - b.tcs,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      width: 80,
      fixed: isMobile ? false : 'right',
      render: (_, record) => (
        <Tooltip title="Edit Item">
          <Button
            type="text"
            icon={<EditOutlined className="!text-blue-600 hover:!text-blue-800 !text-base" />}
            onClick={() => handleOpenEditModal(record)}
            className="!p-1 !h-auto !flex !items-center !justify-center mx-auto"
          />
        </Tooltip>
      ),
    },
  ];

  const data =
    productconfigData?.data?.map((item) => ({
      key: item.id || item.key,

      channel: item.channel || '-',

      productId: item.asin || item.productId || item.style_id || item.sku_id || '-',

      sku: item.sku || item.seller_sku || item.seller_sku_code || '-',

      status: item.status?.[0] || item.status || '-',

      name: item.item_name || item.style_name || item.name || '-',

      image: item.image_url || item.image || '',
      productcost: item.standard_cost ?? item.productcost ?? 0,
      gstrate: item.gst_rate ?? item.gstrate ?? 0,
      tds: item.tds ?? 0,
      tcs: item.tcs ?? 0,
      stateLevel: item.step_level || 0,
      shippinCharge: item.shiping_estimate || 0,
      region: item.region || '-',
    })) || [];

  return (
    <>
      <PageHeader
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-2 sm:pb-[30px] bg-transparent sm:flex-col
        sm:items-start"
      />
      <main className="min-h-[715px] px-5 xl:px-[15px] pb-[30px] w-full">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap md:items-stretch">
          <div className="flex items-center gap-2 max-w-[360px] w-full md:max-w-none md:w-full">
            <Input
              placeholder="Search by ASIN / ID, SKU"
              allowClear
              onChange={(e) => onSearch(e.target.value)}
              className="w-full !h-[30px] rounded-lg"
            />{' '}
          </div>
          <div className="flex gap-2 shrink-0 md:w-full md:justify-end sm:w-full sm:justify-start sm:flex-1">
            <Button
              type="primary"
              icon={<ExportOutlined className="!text-[16px] !font-bold" />}
              className="!h-[30px] !rounded-lg !border-[#dbe1e8] !text-white !font-semibold !flex !items-center !justify-center"
              loading={exportLoading}
              onClick={() => dispatch(exportProductConfiguration(globalChannel, search))}
            >
              Export
            </Button>
            <Button
              type="primary"
              icon={<UploadOutlined className="!text-[16px] !font-bold" />}
              className="!h-[30px] !rounded-lg !border-[#dbe1e8] !text-white !font-semibold !flex !items-center !justify-center sm:flex-1"
              onClick={() => setIsFieldModalOpen(true)}
            >
              Upload
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-hidden">
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
            onChange={(pag, filters, sorter, extra) => {
              if (extra.action === 'paginate') {
                setPagination({
                  current: pag.current,
                  pageSize: pag.pageSize,
                });
              }
            }}
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-4
    [&_.ant-table-cell]:!py-[7px]
  "
          />
        </div>
      </main>

      {/* Upload Modal */}
      <Modal
        title="Upload Product Configuration Excel"
        open={isFieldModalOpen}
        onCancel={() => {
          setIsFieldModalOpen(false);
          setSelectedFile(null);
        }}
        footer={null}
        width={520}
        centered
      >
        <div className="flex flex-col gap-4">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-900 leading-relaxed">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-blue-800">Bulk Update Product Configuration & Images</span>
              <Button
                type="link"
                size="small"
                icon={<DownloadOutlined />}
                className="!p-0 !h-auto !text-xs !text-blue-600 hover:!text-blue-800 !font-semibold"
                onClick={() => dispatch(exportProductConfiguration(globalChannel, search))}
              >
                Download Template
              </Button>
            </div>
            <p className="text-blue-700 mb-0">
              You can add or update product image URLs in bulk using the <strong>Image URL</strong> (or{' '}
              <strong>Image</strong>) column alongside <strong>SKU</strong> or <strong>Product ID</strong>.
            </p>
          </div>

          <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50/50 hover:bg-blue-50/30 transition-all">
            <CloudUploadOutlined className="text-3xl text-blue-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700 mb-1">
              {selectedFile ? selectedFile.name : 'Click to browse or drag Excel file here'}
            </span>
            <span className="text-xs text-gray-400">Supports .xlsx and .xls formats</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const validTypes = [
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                  'application/vnd.ms-excel',
                ];

                if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                  message.error('Only Excel files (.xlsx, .xls) are allowed');
                  return;
                }

                setSelectedFile(file);
              }}
            />
          </label>

          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded text-xs">
              <span className="text-gray-700 font-medium truncate max-w-[360px]">{selectedFile.name}</span>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                <CloseCircleOutlined />
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              onClick={() => {
                setIsFieldModalOpen(false);
                setSelectedFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={uploadLoading}
              disabled={!selectedFile}
              onClick={async () => {
                try {
                  const res = await dispatch(uploadProductConfiguration(selectedFile));
                  message.success(res?.message || 'Excel uploaded successfully');
                  setIsFieldModalOpen(false);
                  setSelectedFile(null);
                  dispatch(
                    getProductConfiguration(pagination.current, pagination.pageSize, {
                      search: search || '',
                      channels: globalChannel,
                      marketplace_id: '',
                      product_type: '',
                    }),
                  );
                } catch (err) {
                  message.error('Upload failed');
                }
              }}
            >
              Upload & Update
            </Button>
          </div>
        </div>
      </Modal>

      {/* Individual Item Edit Modal */}
      <Modal
        title="Edit Listing Item"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingRecord(null);
          setSelectedImageFile(null);
        }}
        onOk={handleSaveEdit}
        confirmLoading={editLoading}
        okText="Save Changes"
        centered
        width={500}
      >
        {editingRecord && (
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-md text-xs border border-gray-200">
              <div>
                <span className="text-gray-500 block font-medium">Channel</span>
                <span className="font-semibold text-gray-800">{editingRecord.channel}</span>
              </div>
              <div>
                <span className="text-gray-500 block font-medium">Product ID</span>
                <span className="font-semibold text-gray-800">{editingRecord.productId}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block font-medium">SKU</span>
                <span className="font-semibold text-gray-800 truncate block">{editingRecord.sku}</span>
              </div>
            </div>

            {/* Product Image Section */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <PictureOutlined className="text-blue-600" />
                  Product Image
                </label>
                <div className="flex items-center gap-2">
                  {(imagePreviewUrl || editForm.image_url || selectedImageFile) && !isImageCleared && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsImageCleared(true);
                        setImagePreviewUrl('');
                        setEditForm({ ...editForm, image_url: '' });
                        setSelectedImageFile(null);
                      }}
                      className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded font-medium transition-all"
                    >
                      <DeleteOutlined /> Remove Image
                    </button>
                  )}
                  <div className="flex items-center gap-1 bg-gray-200/70 p-0.5 rounded">
                    <button
                      type="button"
                      onClick={() => {
                        setImageInputMode('url');
                        setSelectedImageFile(null);
                        setImagePreviewUrl(editForm.image_url);
                      }}
                      className={`text-[11px] px-2.5 py-0.5 rounded font-medium transition-all ${
                        imageInputMode === 'url'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageInputMode('upload');
                      }}
                      className={`text-[11px] px-2.5 py-0.5 rounded font-medium transition-all ${
                        imageInputMode === 'upload'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>
              </div>

              {isImageCleared && (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1.5 rounded text-xs mb-2.5">
                  <span>Image will be removed upon saving</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsImageCleared(false);
                      const orig = editingRecord?.image || '';
                      setEditForm({ ...editForm, image_url: orig });
                      setImagePreviewUrl(orig);
                    }}
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <UndoOutlined /> Undo
                  </button>
                </div>
              )}

              <div className="flex gap-3 items-center">
                {/* Thumbnail Preview */}
                <div className="w-14 h-14 rounded-md border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreviewUrl('')}
                    />
                  ) : (
                    <PictureOutlined className="text-2xl text-gray-300" />
                  )}
                </div>

                {/* URL or Upload Input */}
                <div className="flex-1">
                  {imageInputMode === 'url' ? (
                    <div>
                      <Input
                        placeholder="https://example.com/product-image.jpg"
                        value={editForm.image_url}
                        allowClear
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditForm({ ...editForm, image_url: val });
                          setImagePreviewUrl(val.trim());
                          if (val.trim()) {
                            setIsImageCleared(false);
                          }
                        }}
                        className="text-xs"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Leave blank and save to clear image, or paste a new image URL
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="cursor-pointer border border-dashed border-blue-400 hover:border-blue-600 bg-white rounded-md px-3 py-2 flex items-center justify-center gap-2 text-xs text-blue-600 hover:bg-blue-50/50 transition-all">
                        <UploadOutlined />
                        <span className="truncate max-w-[200px]">
                          {selectedImageFile ? selectedImageFile.name : 'Choose image file (.jpg, .png, .webp)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                message.error('Please select an image file');
                                return;
                              }
                              setSelectedImageFile(file);
                              setIsImageCleared(false);
                              const preview = URL.createObjectURL(file);
                              setImagePreviewUrl(preview);
                            }
                          }}
                        />
                      </label>
                      {selectedImageFile && (
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                          <span>{(selectedImageFile.size / 1024).toFixed(1)} KB</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImageFile(null);
                              setImagePreviewUrl(editForm.image_url);
                            }}
                            className="text-red-500 hover:text-red-700 flex items-center gap-0.5"
                          >
                            <CloseCircleOutlined /> Remove file
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Product Cost (₹)</label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={editForm.standard_cost}
                  onChange={(e) => setEditForm({ ...editForm, standard_cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">GST Rate (%)</label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={editForm.gst_rate}
                  onChange={(e) => setEditForm({ ...editForm, gst_rate: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">TDS (%)</label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={editForm.tds}
                  onChange={(e) => setEditForm({ ...editForm, tds: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">TCS (%)</label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={editForm.tcs}
                  onChange={(e) => setEditForm({ ...editForm, tcs: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
