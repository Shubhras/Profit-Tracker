import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Switch, Modal, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { SearchOutlined, PlusOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  createCouponCodes,
  getCouponCodes,
  deleteCouponCodes,
  updateCouponCodes,
} from '../../redux/admin/actionCreator';

function CouponCode() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState(null);

  const dispatch = useDispatch();
  const { getcouponCodeData, loading } = useSelector((state) => state.AdminDashboard);

  useEffect(() => {
    dispatch(getCouponCodes());
  }, [dispatch]);

  const [title, setTitle] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [description, setDescription] = useState('');

  const [promoType, setPromoType] = useState('discount');
  const [percentage, setPercentage] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const [isActive, setIsActive] = useState(true);

  const handleCreateCoupon = () => {
    const payload = {
      promocode: promoCode,
      title,
      description,
      promoType,
      ...(promoType === 'discount' ? { percentage: Number(percentage) } : { specificAmount: Number(percentage) }),
      startDateTime: `${startDateTime}:00Z`,
      endDateTime: `${endDateTime}:00Z`,
      is_active: isActive,
    };

    if (isEditMode) {
      dispatch(updateCouponCodes(selectedCouponId, payload));
    } else {
      dispatch(createCouponCodes(payload));
    }

    setIsModalOpen(false);
  };

  const handleDeleteClick = (id) => {
    setSelectedCouponId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteCoupon = () => {
    dispatch(deleteCouponCodes(selectedCouponId));

    setDeleteModalOpen(false);
    setSelectedCouponId(null);
  };

  const handleEditCoupon = (record) => {
    setIsEditMode(true);
    setSelectedCouponId(record.id);

    setTitle(record.title || '');
    setPromoCode(record.promocode || '');
    setDescription(record.description || '');
    setPromoType(record.promoType || 'discount');
    setPercentage(record.promoType === 'fix' ? record.specificAmount || '' : record.percentage || '');

    setStartDateTime(record.startDateTime?.slice(0, 16) || '');
    setEndDateTime(record.endDateTime?.slice(0, 16) || '');

    setIsActive(record.is_active);

    setIsModalOpen(true);
  };

  const data =
    getcouponCodeData?.data?.map((item) => ({
      id: item.id,
      promocode: item.promocode,
      title: item.title,
      description: item.description,
      promoType: item.promoType,
      percentage: item.percentage,
      specificAmount: item.specificAmount,
      is_active: item.is_active,
      is_deleted: item.is_deleted,
      image: item.image,
      startDateTime: item.startDateTime,
      endDateTime: item.endDateTime,
      created_at: item.created_at,
      updated_at: item.updated_at,
    })) || [];

  const filteredData = data.filter(
    (item) =>
      item.promocode?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleStatusChange = async (record, checked) => {
    await dispatch(
      updateCouponCodes(record.id, {
        is_active: checked,
      }),
    );

    dispatch(getCouponCodes());
  };

  const columns = [
    {
      title: 'Status',
      dataIndex: 'is_active',
      width: 50,
      align: 'center',
      // render: (status) => <Switch size="small" checked={status} />,
      render: (status, record) => (
        <Switch size="small" checked={status} onChange={(checked) => handleStatusChange(record, checked)} />
      ),
    },
    {
      title: 'Promo Code',
      dataIndex: 'promocode',
      width: 70,
      align: 'center',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 70,
      align: 'center',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[#2563eb] font-medium cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 70,
      align: 'center',
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[#2563eb] font-medium cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Promo Type',
      dataIndex: 'promoType',
      width: 70,
      align: 'center',
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      width: 70,
      align: 'center',
      // render: (value) => (value ? `${value}%` : '-'),
      render: (value) => (value != null ? `${Math.trunc(Number(value))}%` : '-'),
    },
    {
      title: 'Amount',
      dataIndex: 'specificAmount',
      width: 70,
      align: 'center',
      // render: (value) => value || '-',
      render: (value) => (value != null ? `${Math.trunc(Number(value))}%` : '-'),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDateTime',
      width: 70,
      align: 'center',
      render: (date) => (date ? new Date(date).toLocaleDateString('en-GB') : '-'),
    },
    {
      title: 'End Date',
      dataIndex: 'endDateTime',
      width: 70,
      align: 'center',
      render: (date) => (date ? new Date(date).toLocaleDateString('en-GB') : '-'),
    },
    {
      title: '',
      width: 60,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-3">
          <FormOutlined
            style={{ fontSize: '15px' }}
            className="cursor-pointer text-gray-500 hover:text-blue-500"
            onClick={() => handleEditCoupon(record)}
          />
          <DeleteOutlined
            style={{ fontSize: '15px' }}
            className="cursor-pointer text-red-400 hover:text-red-600"
            onClick={() => handleDeleteClick(record.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen py-3 px-3">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm w-full overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center border-b px-4 py-3 md:flex-col md:items-start md:gap-3">
            {' '}
            <h2 className="text-[18px] sm:text-[15px] font-semibold text-gray-800">Coupon Codes</h2>
            <div className="flex items-center gap-3">
              <Input
                placeholder="Search promo code..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-60 sm:w-36 h-[30px] text-[12px]"
                size="small"
              />

              <Button
                type="primary"
                icon={<PlusOutlined style={{ fontSize: '12px' }} />}
                onClick={() => {
                  setIsEditMode(false);
                  setSelectedCouponId(null);

                  setTitle('');
                  setPromoCode('');
                  setDescription('');
                  setPromoType('discount');
                  setPercentage('');
                  setStartDateTime('');
                  setEndDateTime('');
                  setIsActive(true);

                  setIsModalOpen(true);
                }}
                className="!h-[30px] !flex !items-center !justify-center gap-0 px-2 text-[12px] font-semibold"
              >
                Add Coupon
              </Button>
            </div>
          </div>

          {/* Table */}
          <div
            className="
    [&_.ant-pagination]:text-[12px]
    [&_.ant-pagination-item]:min-w-[24px]
    [&_.ant-pagination-item]:h-[24px]
    [&_.ant-pagination-item]:leading-[22px]
    [&_.ant-pagination-prev]:h-[24px]
    [&_.ant-pagination-next]:h-[24px]
    [&_.ant-pagination-total-text]:text-[12px]
    [&_.ant-select-selection-item]:text-[12px]
  "
          >
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredData}
              loading={loading}
              pagination={{ pageSize: 10 }}
              size="small"
              scroll={{ x: 800 }}
              className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
            />
          </div>
        </div>
      </div>
      <Modal
        open={isModalOpen}
        footer={null}
        closable={false}
        centered
        width={400}
        onCancel={() => setIsModalOpen(false)}
      >
        <div>
          <h2 className="text-[16px] font-semibold text-[#2f3a4a] mb-4">
            {isEditMode ? 'Update Coupon Code' : 'Add Coupon Code'}
          </h2>
          <div className="space-y-2">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-[30px] text-[12px]"
            />

            <Input
              placeholder="Promo Code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="h-[30px] text-[12px]"
            />

            <Input.TextArea
              placeholder="Description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-[12px]"
            />

            <div>
              <label className="block text-[12px] font-medium mb-1">Promo Type</label>

              <select
                value={promoType}
                onChange={(e) => setPromoType(e.target.value)}
                className="w-full h-[32px] border border-gray-300 rounded px-2 text-[12px]"
              >
                <option value="discount">Discount</option>
                <option value="fix">Fix</option>
              </select>
            </div>

            <Input
              placeholder={promoType === 'discount' ? 'Percentage' : 'Amount'}
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="h-[30px] text-[12px]"
            />
            <div>
              <label className="block text-[12px] font-medium mb-1">Start Date</label>

              <Input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="h-[32px] text-[12px]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium mb-1">End Date</label>

              <Input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="h-[32px] text-[12px]"
              />
            </div>

            <label className="flex items-center gap-2 text-[12px]">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>

            <div className="flex justify-end gap-2 pt-2 ">
              <Button
                size="small"
                onClick={() => setIsModalOpen(false)}
                className="!h-[28px] !px-3 !text-[12px] !font-normal flex items-center justify-center"
              >
                Cancel
              </Button>

              <Button
                size="small"
                type="primary"
                onClick={handleCreateCoupon}
                className="!bg-[#4a4a4a] !border-[#4a4a4a] !w-[60px] !h-[28px] !p-0 !text-[12px] !font-semibold"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={deleteModalOpen} footer={null} centered width={320} onCancel={() => setDeleteModalOpen(false)}>
        <div className="text-center">
          <h3 className="text-[16px] font-semibold mb-3">Delete Coupon</h3>

          <p className="text-[13px] text-gray-600 mb-5">Are you sure you want to delete this coupon?</p>

          <div className="flex justify-center gap-3">
            <Button
              size="small"
              className="h-[30px] text-[13px] font-semibold"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              danger
              size="small"
              className="h-[30px] text-[13px] font-semibold bg-red-500 border-red-500 text-white"
              onClick={handleDeleteCoupon}
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default CouponCode;
