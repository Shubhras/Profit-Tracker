import React from 'react';
import { Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export default function Rule() {
  const dataSource = [
    {
      key: '1',
      channel: 'Amazon',
      exceptionRule: 'Price Mismatch',
      is: 'Yes',
      target: 100,
      filter: 'SKU',
      filterValue: 'SKU-001',
    },
    {
      key: '2',
      channel: 'Flipkart',
      exceptionRule: 'Low Margin',
      is: 'No',
      target: 50,
      filter: 'Category',
      filterValue: 'Electronics',
    },
  ];

  const columns = [
    {
      title: 'Channel',
      dataIndex: 'channel',
      width: 120,
    },
    {
      title: 'Exception Rule',
      dataIndex: 'exceptionRule',
      width: 180,
    },
    {
      title: 'IS',
      dataIndex: 'is',
      width: 80,
    },
    {
      title: 'Target',
      dataIndex: 'target',
      width: 120,
      sorter: (a, b) => a.target - b.target,
    },
    {
      title: 'Filter',
      dataIndex: 'filter',
      width: 120,
    },
    {
      title: 'Filter Value',
      dataIndex: 'filterValue',
      width: 160,
    },
    {
      title: 'Action',
      width: 80,
      align: 'center',
      render: () => <EditOutlined className="text-blue-600 cursor-pointer" />,
    },
  ];

  return (
    <Table columns={columns} dataSource={dataSource} size="small" pagination={false} scroll={{ x: 1000, y: 500 }} />
  );
}
