import React, { useState } from 'react';
import { Table, DatePicker, InputNumber } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';

export default function OtherExpenses() {
  const [editingKey, setEditingKey] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const dataSource = [
    {
      key: '1',
      account: 'All',
      channel: 'All',
      orderStatus: 'All',
      fulfillmentType: 'Merchant+2',
      warehouse: 'All',
      attributeType: 'All',
      attributeValue: 'All',
      costType: 'permonth',
      costName: 'monthly_other_expenses',
      cost: 4000,
      start: '2024-09-01',
      end: '2024-09-30',
    },
    {
      key: '2',
      account: 'All',
      channel: 'All',
      orderStatus: 'All',
      fulfillmentType: 'Merchant',
      warehouse: 'All',
      attributeType: 'All',
      attributeValue: 'All',
      costType: 'perunit',
      costName: 'packingcost',
      cost: 4,
      start: '2024-01-01',
      end: null,
    },
  ];

  const isEditing = (record) => record.key === editingKey;
  const COST_TYPE_FILTERS = [
    { text: 'PER MONTH', value: 'PER MONTH' },
    { text: 'PER UNIT', value: 'PER UNIT' },
    { text: 'PER ORDER', value: 'PER ORDER' },
    { text: '% Of Net Sales', value: '% Of Net Sales' },
    { text: '% Of Gross Sales Except Cancelled', value: '% Of Gross Sales Except Cancelled' },
    { text: 'Part Month', value: 'Part Month' },
    { text: 'Per Month Per Revenue', value: 'Per Month Per Revenue' },
  ];

  const columns = [
    { title: 'Account', dataIndex: 'account', width: 100 },
    { title: 'Channel', dataIndex: 'channel', width: 100 },
    { title: 'Order Status', dataIndex: 'orderStatus', width: 120 },
    { title: 'Fulfillment Type', dataIndex: 'fulfillmentType', width: 150 },
    { title: 'Warehouse', dataIndex: 'warehouse', width: 100 },
    { title: 'Attribute Type', dataIndex: 'attributeType', width: 120 },
    { title: 'Attribute Value', dataIndex: 'attributeValue', width: 120 },

    // ✅ Cost Type with Filters
    {
      title: 'Cost Type',
      dataIndex: 'costType',
      width: 140,
      filters: COST_TYPE_FILTERS,
      onFilter: (value, record) => record.costType === value,
    },

    { title: 'Cost Name', dataIndex: 'costName', width: 180 },

    // ✅ Cost Sorter
    {
      title: 'Cost',
      dataIndex: 'cost',
      width: 100,
      sorter: (a, b) => a.cost - b.cost,
      render: (value, record) =>
        isEditing(record) ? (
          <InputNumber size="small" defaultValue={value} />
        ) : (
          <span className="text-green-600 font-medium">{value}</span>
        ),
    },

    // ✅ Start Date Sorter
    {
      title: 'Start',
      dataIndex: 'start',
      width: 120,
      sorter: (a, b) => moment(a.start).valueOf() - moment(b.start).valueOf(),
      render: (value, record) =>
        isEditing(record) ? <DatePicker size="small" value={value ? moment(value) : null} /> : value,
    },

    // ✅ End Date Sorter
    {
      title: 'End',
      dataIndex: 'end',
      width: 120,
      sorter: (a, b) => {
        if (!a.end) return -1;
        if (!b.end) return 1;
        return moment(a.end).valueOf() - moment(b.end).valueOf();
      },
      render: (value, record) =>
        isEditing(record) ? <DatePicker size="small" value={value ? moment(value) : null} /> : value || '-',
    },

    // ✅ Edit Column
    {
      title: '',
      fixed: 'right',
      width: 60,
      align: 'center',
      render: (_, record) =>
        isEditing(record) ? (
          <div className="flex gap-2 justify-center">
            <CheckOutlined className="text-green-600 cursor-pointer" onClick={() => setEditingKey(null)} />
            <CloseOutlined className="text-red-500 cursor-pointer" onClick={() => setEditingKey(null)} />
          </div>
        ) : (
          <EditOutlined className="text-blue-600 cursor-pointer" onClick={() => setEditingKey(record.key)} />
        ),
    },
  ];

  return (
    <Table
      className="!min-h-0"
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
