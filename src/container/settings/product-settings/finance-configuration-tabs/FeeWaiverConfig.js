import React, { useState } from 'react';
import { Table, Tooltip } from 'antd';
import { InfoCircleOutlined, EditOutlined } from '@ant-design/icons';

export default function FeeWaiverConfig() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const dataSource = [
    // {
    //   key: '1',
    //   channel: 'Amazon',
    //   matchType: 'SKU',
    //   matchValue: 'SKU-001',
    //   warehouse: 'WH-1',
    //   invPriceMin: 100,
    //   invPriceMax: 500,
    //   start: '2024-01-01',
    //   end: '2024-01-31',
    //   type: 'Fixed',
    //   fee: 50,
    //   waiver: 'Yes',
    // },
    // {
    //   key: '2',
    //   channel: 'Flipkart',
    //   matchType: 'Category',
    //   matchValue: 'Electronics',
    //   warehouse: 'WH-2',
    //   invPriceMin: 200,
    //   invPriceMax: 800,
    //   start: '2024-02-01',
    //   end: '2024-02-28',
    //   type: 'Percentage',
    //   fee: 10,
    //   waiver: 'No',
    // },
  ];

  const columns = [
    { title: 'Channel', dataIndex: 'channel', width: 120 },
    { title: 'Match Type', dataIndex: 'matchType', width: 120 },
    { title: 'Match Value', dataIndex: 'matchValue', width: 150 },
    { title: 'Warehouse', dataIndex: 'warehouse', width: 120 },
    { title: 'Inv Price Min', dataIndex: 'invPriceMin', width: 120 },
    { title: 'Inv Price Max', dataIndex: 'invPriceMax', width: 120 },
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
      title: 'Type',
      dataIndex: 'type',
      width: 160,
      filters: [
        { text: 'Fixed', value: 'Fixed' },
        { text: 'Percentage', value: 'Percentage' },
        { text: 'Rebate Fixed', value: 'Rebate Fixed' },
        { text: 'Rebate Percentage', value: 'Rebate Percentage' },
      ],
      filterMultiple: true,
      onFilter: (value, record) => record.type === value,
    },
    { title: 'Fee', dataIndex: 'fee', width: 100 },
    { title: 'Waiver', dataIndex: 'waiver', width: 100 },

    // ✅ INFO ICON IN HEADER
    {
      title: (
        <Tooltip title="Fee waiver rule information">
          <InfoCircleOutlined className="text-gray-500 cursor-pointer" />
        </Tooltip>
      ),
      width: 60,
      align: 'center',
    },

    // ✅ EDIT ICON IN ROW DATA
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
      scroll={{ x: 1400, y: 500 }}
    />
  );
}
