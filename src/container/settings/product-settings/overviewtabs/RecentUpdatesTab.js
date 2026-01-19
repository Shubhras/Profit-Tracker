import React from 'react';
import { Table, Button, Tooltip } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';

export default function RecentUpdatesTab() {
  const columns = [
    {
      title: 'File Type',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 200,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      width: 220,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      filters: [
        { text: 'Completed', value: 'Completed' },
        { text: 'Processing', value: 'Processing' },
        { text: 'Profit Trigger', value: 'Profit Trigger' },
        { text: 'Failed', value: 'Failed' },
        { text: 'Error', value: 'Error' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const colorMap = {
          Completed: 'text-green-600',
          Processing: 'text-blue-600',
          'Profit Trigger': 'text-purple-600',
          Failed: 'text-red-500',
          Error: 'text-red-600',
        };

        return <span className={colorMap[status] || 'text-gray-600'}>{status}</span>;
      },
    },
    {
      title: 'File',
      dataIndex: 'file',
      key: 'file',
      width: 220,
      render: (file) =>
        file ? (
          <div className="flex items-center gap-2">
            <span className="truncate max-w-[160px]">{file}</span>
            <DownloadOutlined className="text-blue-600 cursor-pointer" />
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Uploaded By',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: 260,
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      render: (msg) => (
        <Tooltip title={msg}>
          <span className="truncate block max-w-[260px]">{msg}</span>
        </Tooltip>
      ),
    },
  ];

  const dataSource = [
    {
      key: 1,
      fileType: 'Invcolumn Map',
      createdAt: 'Jan 7th 2026, 12:56:46 PM',
      status: 'Completed',
      file: null,
      uploadedBy: 'theperfectfit.09@gmail.com',
      message: '"Std Cost" has been ...',
    },
    {
      key: 2,
      fileType: 'Standard Cost Missing',
      createdAt: 'Nov 20th 2025, 12:14:25 PM',
      status: 'Completed',
      file: 'THE PERFECT FIT_costperunit.xlsx',
      uploadedBy: 'adithijain214@gmail.com',
      message: 'Upload type : channel...',
    },
    {
      key: 3,
      fileType: 'Standard Cost Missing',
      createdAt: 'Nov 20th 2025, 12:13:47 PM',
      status: 'Error',
      file: 'THE PERFECT FIT_costperunit.xlsx',
      uploadedBy: 'adithijain214@gmail.com',
      message: 'syntax error at or n...',
    },
  ];

  return (
    <div className="bg-white rounded-lg">
      <div className="flex justify-end mb-2">
        <Button icon={<ReloadOutlined />} size="small" />
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        size="small"
        pagination={{
          pageSize: 25,
          showSizeChanger: true,
        }}
        scroll={{ x: true }}
      />
    </div>
  );
}
