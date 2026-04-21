import React from 'react';
import { Table, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

export default function InventoryMasterTab() {
  const columns = [
    {
      title: <SettingOutlined />,
      dataIndex: 'setting',
      width: 100,
    },
    {
      title: 'Inv Master',
      dataIndex: 'invMaster',
      sorter: (a, b) => a.invMaster - b.invMaster,
    },
  ];

  return (
    <div className="rounded-lg shadow-sm">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b">
        <span className="text-gray-500 text-sm">Double-click a cell to edit</span>

        <div className="flex gap-2">
          <Button type="primary" className="font-bold">
            Copy Data based on Inv Master
          </Button>
          <Button type="primary" className="font-bold">
            Field Settings
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={[]}
        pagination={false}
        showSorterTooltip={false}
        bordered
        locale={{
          emptyText: (
            <div className="py-10 text-gray-400 flex flex-col items-center">
              {/* <div className="text-4xl mb-2">📦</div> */}
              <div>No data</div>
            </div>
          ),
        }}
      />
    </div>
  );
}
