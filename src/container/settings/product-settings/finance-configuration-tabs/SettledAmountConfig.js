import React, { useState } from 'react';
import { Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export default function SettledAmountConfig() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const dataSource = [
    {
      key: '1',
      channel: 'Amazon',
      matchType: 'SKU',
      matchValue: 'SKU-001',
      start: '2024-01-01',
      end: '2024-01-31',
      invPriceMin: 100,
      invPriceMax: 500,
      type: 'Fixed',
      amount: 50,
    },
    {
      key: '2',
      channel: 'Flipkart',
      matchType: 'Category',
      matchValue: 'Electronics',
      start: '2024-02-01',
      end: '2024-02-28',
      invPriceMin: 200,
      invPriceMax: 800,
      type: 'Percentage',
      amount: 10,
    },
  ];

  const columns = [
    { title: 'Channel', dataIndex: 'channel', width: 120 },
    { title: 'Match Type', dataIndex: 'matchType', width: 120 },
    { title: 'Match Value', dataIndex: 'matchValue', width: 150 },

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
    {
      title: 'Inv Price Min',
      dataIndex: 'invPriceMin',
      width: 140,
      sorter: (a, b) => a.invPriceMin - b.invPriceMin,
    },
    {
      title: 'Inv Price Max',
      dataIndex: 'invPriceMax',
      width: 140,
      sorter: (a, b) => a.invPriceMax - b.invPriceMax,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 120,
      filters: [
        { text: 'Fixed', value: 'Fixed' },
        { text: 'Percentage', value: 'Percentage' },
      ],
      filterMultiple: true, // Select All enabled
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      width: 120,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: '',
      width: 60,
      align: 'center',
      render: () => <EditOutlined className="text-blue-600 cursor-pointer" />,
    },
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
      pagination={false}
      scroll={{ x: 1200, y: 500 }}
    />
  );
}
