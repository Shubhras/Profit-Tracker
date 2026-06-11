import React, { useState } from 'react';
import { Table, Input, Button, Switch } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

function CouponCode() {
  const [searchText, setSearchText] = useState('');

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
      render: (status) => <Switch size="small" checked={status} />,
    },
    {
      title: 'PromoCode ID',
      dataIndex: 'promoCode',
      width: 150,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      width: 150,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      width: 120,
    },
    {
      title: 'Duration',
      width: 180,
      render: (_, record) => (
        <span>
          {record.startDate} - {record.endDate}
        </span>
      ),
    },
    {
      title: 'Actions',
      width: 120,
      render: () => (
        <div className="flex items-center gap-3">
          <EditOutlined style={{ fontSize: '16px' }} className="cursor-pointer text-gray-500 hover:text-blue-500" />

          <DeleteOutlined style={{ fontSize: '16px' }} className="cursor-pointer text-red-400 hover:text-red-600" />
        </div>
      ),
    },
  ];

  return (
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
              icon={<PlusOutlined />}
              className="h-[30px] text-[12px] font-semibold flex items-center"
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
  );
}

export default CouponCode;
