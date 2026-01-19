import React from 'react';
import { Table, Button } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';

export default function OthersTab() {
  const dataSource = [
    {
      key: '1',
      field: 'Pin Code',
      number: 931,
    },
    {
      key: '2',
      field: 'Pin Code',
      number: 25,
    },
    {
      key: '3',
      field: 'Pin Code',
      number: 852,
    },
  ];

  const columns = [
    {
      title: 'Missing Fields Type',
      dataIndex: 'field',
      key: 'field',
      className: 'font-medium',
    },
    {
      title: 'Missing Numbers',
      dataIndex: 'number',
      key: 'number',
      align: 'center',
      render: (value) => (
        <span className="flex items-center justify-center gap-1 cursor-pointer">
          {value}
          <DownloadOutlined className="text-xs text-blue-600" />
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
