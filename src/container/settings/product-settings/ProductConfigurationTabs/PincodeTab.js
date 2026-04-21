import React, { useState } from 'react';
import { Table, Button, Modal, Switch } from 'antd';
import { EditOutlined } from '@ant-design/icons';

export default function PincodeTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const columns = [
    {
      title: 'Sno',
      dataIndex: 'sno',
      width: 80,
    },
    {
      title: 'Channel',
      dataIndex: 'channel',
      sorter: (a, b) => a.channel.localeCompare(b.channel),
    },
    {
      title: 'Fulfillment Center Name',
      dataIndex: 'fc',
    },
    {
      title: 'Pincode',
      dataIndex: 'pincode',
      sorter: (a, b) => a.pincode - b.pincode,
    },
    {
      title: '',
      dataIndex: 'action',
      width: 60,
      render: () => <EditOutlined className="text-blue-500 cursor-pointer" />,
    },
  ];

  const data = [
    { key: 1, sno: 1, channel: 'Amazon-India', fc: 'AMD2', pincode: 640113 },
    { key: 2, sno: 2, channel: 'Amazon-India', fc: 'BLR8', pincode: 640111 },
    { key: 3, sno: 3, channel: 'Amazon-India', fc: 'BOM5', pincode: 640109 },
    { key: 4, sno: 4, channel: 'Amazon-India', fc: 'BOM7', pincode: 640112 },
    { key: 5, sno: 5, channel: 'Amazon-India', fc: 'DED4', pincode: 122506 },
    { key: 6, sno: 6, channel: 'Amazon-India', fc: 'DEL4', pincode: 642001 },
    { key: 7, sno: 7, channel: 'Amazon-India', fc: 'DEL5', pincode: 421303 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Top Button */}
      <div className="mb-4">
        <Button type="primary" className="font-bold" onClick={() => setIsModalOpen(true)}>
          Amazon-India IXD Update
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        showSorterTooltip={false}
        bordered
        size="small"
        rowKey="key"
      />
      <Modal
        title="Amazon-India IXD Update"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        <div className="flex flex-col gap-4">
          {/* Toggle Row */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Are you on Amazon IXD Program?</span>

            <Switch checked={isEnabled} onChange={setIsEnabled} checkedChildren="ON" unCheckedChildren="OFF" />
          </div>

          {/* Note */}
          <div className="text-gray-400 text-sm">Note: Changes will be saved automatically when you select a date.</div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>

            <Button type="primary" onClick={() => setIsModalOpen(false)}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
