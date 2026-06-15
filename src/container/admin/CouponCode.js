import React, { useState } from 'react';
import { Table, Input, Button, Switch, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { SearchOutlined, PlusOutlined, FormOutlined, DeleteOutlined } from '@ant-design/icons';
import { createCouponCodes } from '../../redux/admin/actionCreator';

function CouponCode() {
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState('fix');
  const [discountAmount, setDiscountAmount] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleCreateCoupon = () => {
    const payload = {
      title,
      promocode: promoCode,
      description,
      is_active: isActive,
      promoType: discountType,
      specificAmount: discountType === 'fix' ? Number(discountAmount) : null,
      percentage: discountType === 'percentage' ? Number(discountAmount) : null,
      startDateTime: null,
      endDateTime: null,
    };

    dispatch(createCouponCodes(payload));

    setIsModalOpen(false);
  };

  const data = [
    {
      id: 1,
      status: true,
      promoCode: 'CHR530',
      title: 'CHR530',
      description: '30% OFF FOREVER',
      discount: '30%',
      startDate: '12 Aug 2026',
      endDate: '12 Aug 2027',
    },
    {
      id: 2,
      status: true,
      promoCode: 'CHR510',
      title: 'CHR510',
      description: '10% OFF FOREVER',
      discount: '10%',
      startDate: '18 May 2026',
      endDate: '18 May 2027',
    },
    {
      id: 3,
      status: true,
      promoCode: 'CHR520',
      title: 'CHR520',
      description: '20% OFF',
      discount: '20%',
      startDate: '28 March 2026',
      endDate: '28 March 2027',
    },
    {
      id: 4,
      status: true,
      promoCode: 'CHR620',
      title: 'CHR620',
      description: '10% OFF',
      discount: '30%',
      startDate: '12 Nov 2024',
      endDate: '12 Nov 2027',
    },
    {
      id: 5,
      status: true,
      promoCode: 'CHR720',
      title: 'CHR720',
      description: '50% OFF',
      discount: '10%',
      startDate: '12 Aug 2026',
      endDate: '12 Aug 2027',
    },
  ];

  const filteredData = data.filter(
    (item) =>
      item.promoCode.toLowerCase().includes(searchText.toLowerCase()) ||
      item.title.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: 'Status',
      dataIndex: 'status',
      width: 90,
      align: 'center',
      render: (status) => <Switch size="small" checked={status} />,
    },
    {
      title: 'PromoCode ID',
      dataIndex: 'promoCode',
      width: 150,
      align: 'center',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 100,
      align: 'center',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 150,
      align: 'center',
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      width: 120,
      align: 'center',
    },
    {
      title: 'Duration',
      width: 180,
      align: 'center',
      render: (_, record) => (
        <span>
          {record.startDate} - {record.endDate}
        </span>
      ),
    },
    {
      title: 'Actions',
      width: 120,
      align: 'center',
      render: () => (
        <div className="flex items-center justify-center gap-3">
          <FormOutlined style={{ fontSize: '16px' }} className="cursor-pointer text-gray-500 hover:text-blue-500" />

          <DeleteOutlined style={{ fontSize: '16px' }} className="cursor-pointer text-red-400 hover:text-red-600" />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="p-3 px-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-[18px] font-semibold text-gray-800">Promo Codes</h2>

            <div className="flex items-center gap-3">
              <Input
                placeholder="Search promo code..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-60 h-[30px] text-[12px]"
                size="small"
              />

              <Button
                type="primary"
                icon={<PlusOutlined style={{ fontSize: '12px' }} />}
                onClick={() => setIsModalOpen(true)}
                className="!h-[30px] !flex !items-center !justify-center gap-0 px-2 text-[13px] font-semibold"
              >
                Add Coupon
              </Button>
            </div>
          </div>

          {/* Table */}
          <div
            className="
            [&_.ant-table-thead>tr>th]:text-[12px]
            [&_.ant-table-thead>tr>th]:font-semibold
            [&_.ant-table-tbody>tr>td]:text-[12px]
          "
          >
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredData}
              pagination={false}
              size="small"
              scroll={{ x: 1000 }}
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
          <h2 className="text-[16px] font-semibold text-[#2f3a4a] mb-4">Add Promo Code</h2>

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
              <label className="block text-[12px] font-medium mb-1">Discount Type:</label>

              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
                className="w-full h-[30px] border border-gray-300 rounded px-2 text-[12px]"
              >
                <option value="fix">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            <Input
              placeholder="Discount Amount"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
              className="h-[30px] text-[12px]"
            />

            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                // defaultChecked
              />
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
    </>
  );
}

export default CouponCode;
