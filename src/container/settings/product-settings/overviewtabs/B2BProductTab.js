import React from 'react';
import { Table, Button } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';

export default function B2BProductTab() {
  const dataSource = [
    // {
    //   key: '1',
    //   field: 'Inventory Master SKU',
    //   count: 931,
    // },
    // {
    //   key: '2',
    //   field: 'Standard Cost (Based on channel, sku)',
    //   count: 25,
    // },
    // {
    //   key: '3',
    //   field: 'Standard Cost Tax (Based on channel, sku)',
    //   count: 852,
    // },
    // {
    //   key: '4',
    //   field: 'MRP (Based on channel, sku)',
    //   count: 216,
    // },
    // {
    //   key: '5',
    //   field: 'Manual Package Dimensions (Based on channel, sku)',
    //   count: 529,
    // },
  ];

  const columns = [
    {
      title: 'Missing Fields',
      dataIndex: 'field',
      key: 'field',
      className: 'font-medium',
    },
    {
      title: 'With Orders',
      dataIndex: 'count',
      key: 'count',
      align: 'center',
      render: (value) => (
        <span className="text-blue-600 flex items-center justify-center gap-1 cursor-pointer">
          {value}
          <DownloadOutlined className="text-xs" />
        </span>
      ),
    },
    {
      title: 'Upload',
      key: 'upload',
      align: 'center',
      render: () => (
        <Button type="primary" size="small" icon={<UploadOutlined />} className="bg-[#0B2B52]">
          Upload
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      size="small"
      pagination={false}
      scroll={{ x: true }}
      //   expandable={{
      //     expandedRowKeys: ['master'],
      //     expandIconColumnIndex: 0,
      //     expandedRowRender: () => null,
      //     rowExpandable: (record) => record.field === 'Master SKU (Based on)',
      //   }}
      //   summary={() => (
      //     <Table.Summary.Row className="bg-blue-50">
      //       <Table.Summary.Cell colSpan={3}>
      //         <div className="flex items-center gap-2 font-medium text-blue-900">
      //           <span className="w-4 h-4 flex items-center justify-center rounded bg-white border">−</span>
      //           Master SKU (Based on)
      //         </div>
      //       </Table.Summary.Cell>
      //     </Table.Summary.Row>
      //   )}
    />
  );
}
