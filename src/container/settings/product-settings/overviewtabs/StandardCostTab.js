import React from 'react';
import { Table } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

export default function StandardCostTab() {
  const dataSource = [
    { key: '1', month: 'Jan-26', qty: 87, stdCost: 4061 },
    { key: '2', month: 'Dec-25', qty: 23, stdCost: 6196 },
    { key: '3', month: 'Nov-25', qty: 2, stdCost: 5153 },
    { key: '4', month: 'Oct-25', qty: 0, stdCost: 5994 },
    { key: '5', month: 'Sep-25', qty: 0, stdCost: 5111 },
    { key: '6', month: 'Aug-25', qty: 0, stdCost: 3820 },
  ];

  const columns = [
    {
      title: 'With Net Qty',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: 'Std Cost',
      dataIndex: 'qty',
      key: 'qty',
      align: 'center',
    },
    {
      title: 'Std Cost Tax',
      dataIndex: 'stdCost',
      key: 'stdCost',
      align: 'center',
    },
    {
      title: 'Export',
      key: 'export',
      align: 'center',
      render: () => <DownloadOutlined className="text-blue-600 cursor-pointer" />,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      size="small"
      pagination={false}
      scroll={{ x: true }}
      summary={() => (
        <Table.Summary.Row className="bg-gray-50">
          <Table.Summary.Cell colSpan={3}>
            <span className="font-medium">Date, SKU vs Avg (StdCostExc)</span>
          </Table.Summary.Cell>
          <Table.Summary.Cell align="center">
            <DownloadOutlined className="text-blue-600 cursor-pointer" />
          </Table.Summary.Cell>
        </Table.Summary.Row>
      )}
    />
  );
}
