import React from 'react';
import { Card, Table } from 'antd';

export default function AdsTab() {
  const data = [
    {
      channel: 'Amazon-India',
      parentId: 'BOC7LDXB65',
      sku: 'long-cami-White-XL',
      campaign: 'LONG SLIP SELF | PT',
      direct: 3,
      indirect: 0,
      total: 3,
    },
    {
      channel: 'Amazon-India',
      parentId: 'BOC7LDXB65',
      sku: 'long-cami-Skin-S',
      campaign: 'LONG SLIP | AUTO',
      direct: 209,
      indirect: 0,
      total: 209,
    },
    {
      channel: 'Amazon-India',
      parentId: 'BOC7LDXB65',
      sku: 'long-cami-Pink',
      campaign: 'LONG SLIP SELF | PT',
      direct: 879,
      indirect: 0,
      total: 879,
    },
    {
      channel: 'Amazon-India',
      parentId: 'BOC7LDXB65',
      sku: 'long-cami-Pink',
      campaign: 'LONG SLIP | AUTO',
      direct: 493,
      indirect: 0,
      total: 493,
    },
  ];

  const columns = [
    { title: 'Channel', dataIndex: 'channel', sorter: (a, b) => a.netQty - b.netQty },
    { title: 'Parent ID', dataIndex: 'parentId', sorter: (a, b) => a.netQty - b.netQty },
    { title: 'SKU', dataIndex: 'sku', sorter: (a, b) => a.netQty - b.netQty },
    { title: 'Campaign Name', dataIndex: 'campaign', sorter: (a, b) => a.netQty - b.netQty },
    { title: 'Direct(INR)', dataIndex: 'direct', sorter: (a, b) => a.netQty - b.netQty },
    { title: 'InDirect(INR)', dataIndex: 'indirect', sorter: (a, b) => a.netQty - b.netQty },
    { title: 'Total(INR)', dataIndex: 'total', sorter: (a, b) => a.netQty - b.netQty },
  ];

  return (
    <div className="px-6 py-4">
      {/* TOP STATS */}
      <div className="grid grid-cols-4 gap-6 mb-4">
        <Card size="small">
          <div className="text-black font-semibold text-s">Total Channel</div>
          <div className="text-lg font-semibold">1</div>
        </Card>

        <Card size="small">
          <div className="text-black font-semibold text-s">Total Campaigns</div>
          <div className="text-lg font-semibold">42</div>
        </Card>

        <Card size="small">
          <div className="text-black font-semibold text-s">Direct(without GST)</div>
          <div className="text-lg font-semibold text-green-600">₹1,04,230</div>
        </Card>

        <Card size="small">
          <div className="text-black font-semibold text-s">InDirect(without GST)</div>
          <div className="text-lg font-semibold text-blue-600">₹0</div>
        </Card>
      </div>

      {/* TABLE */}
      <Card>
        <Table columns={columns} dataSource={data} pagination={false} rowKey={(record, i) => i} size="small" />
      </Card>
    </div>
  );
}
