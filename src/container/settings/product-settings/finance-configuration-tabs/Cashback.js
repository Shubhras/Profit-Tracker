import React, { useState } from 'react';
import { Table } from 'antd';

export default function Cashback() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const dataSource = [
    {
      key: '1',
      channel: 'Amazon',
      product: 'Mobile',
      sku: 'SKU-001',
      start: '2024-01-01',
      end: '2024-01-31',
      cbType: 'Seasonal',
      lower: 100,
      higher: 1000,
      type: 'Percentage',
      value: 5,
      anchorInvoice: 'INV-001',
      rewardId: 'RWD-101',
    },
    {
      key: '2',
      channel: 'Flipkart',
      product: 'Laptop',
      sku: 'SKU-002',
      start: '2024-02-01',
      end: '2024-02-28',
      cbType: 'Promo',
      lower: 500,
      higher: 5000,
      type: 'Fixed',
      value: 200,
      anchorInvoice: 'INV-002',
      rewardId: 'RWD-102',
    },
  ];

  const columns = [
    { title: 'Channel', dataIndex: 'channel', width: 120 },
    { title: 'Product', dataIndex: 'product', width: 120 },
    { title: 'SKU', dataIndex: 'sku', width: 120 },

    {
      title: 'Start',
      dataIndex: 'start',
      width: 120,
      sorter: (a, b) => new Date(a.start) - new Date(b.start),
    },
    {
      title: 'End',
      dataIndex: 'end',
      width: 120,
      sorter: (a, b) => new Date(a.end) - new Date(b.end),
    },

    { title: 'CB Type', dataIndex: 'cbType', width: 120 },

    {
      title: 'Lower',
      dataIndex: 'lower',
      width: 100,
      sorter: (a, b) => a.lower - b.lower,
    },
    {
      title: 'Higher',
      dataIndex: 'higher',
      width: 100,
      sorter: (a, b) => a.higher - b.higher,
    },

    {
      title: 'Type',
      dataIndex: 'type',
      width: 120,
      filters: [
        { text: 'Fixed', value: 'Fixed' },
        { text: 'MRP', value: 'MRP' },
        { text: 'Percentage', value: 'Percentage' },
      ],
      filterMultiple: true, // enables Select All
      onFilter: (value, record) => record.type === value,
    },

    { title: 'Value', dataIndex: 'value', width: 100 },
    { title: 'Anchor Invoice', dataIndex: 'anchorInvoice', width: 150 },
    { title: 'Reward ID', dataIndex: 'rewardId', width: 120 },
  ];

  return (
    <Table
      rowSelection={{
        selectedRowKeys,
        onChange: setSelectedRowKeys,
      }}
      columns={columns}
      dataSource={dataSource}
      size="small"
      pagination={{
        pageSize: 5,
        showSizeChanger: true,
        pageSizeOptions: ['5', '10', '20'],
      }}
      scroll={{ x: 1400, y: 500 }}
    />
  );
}
