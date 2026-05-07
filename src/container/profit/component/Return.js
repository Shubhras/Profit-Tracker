import React, { useState } from 'react';
import { Table, Radio, Card, Empty } from 'antd';

export default function Return() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState('state');

  const returnColumns = [
    {
      title: 'Orders',
      dataIndex: 'orders',
      key: 'orders',
      render: (value) => (
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-[13px] font-semibold text-black">
          {value}
        </div>
      ),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (value) => (
        <div>
          <div>{value}</div>
          <div className="text-green-500">-</div>
        </div>
      ),
    },
  ];

  const returnData = [
    {
      key: 1,
      orders: 1,
      reason: '-',
    },
  ];

  const analysisColumns = [
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
    },
    {
      title: 'Net',
      dataIndex: 'net',
      key: 'net',
      align: 'center',
    },
    {
      title: 'RTO',
      dataIndex: 'rto',
      key: 'rto',
      align: 'center',
    },
    {
      title: 'C RET',
      dataIndex: 'cret',
      key: 'cret',
      align: 'center',
    },
    {
      title: 'RTO(%)',
      dataIndex: 'rtoper',
      key: 'rtoper',
      align: 'center',
    },
    {
      title: 'Cret(%)',
      dataIndex: 'cretper',
      key: 'cretper',
      align: 'center',
    },
    {
      title: 'RTO -ve Set',
      dataIndex: 'rtoset',
      key: 'rtoset',
      align: 'center',
    },
    {
      title: 'C Ret -ve set',
      dataIndex: 'cretset',
      key: 'cretset',
      align: 'center',
    },
  ];

  const analysisData = [
    {
      key: 1,
      state: 'UTTAR PRADESH',
      net: 0,
      rto: 0,
      cret: 1,
      rtoper: 0,
      cretper: 1,
      rtoset: '₹0.00',
      cretset: '-₹137.34',
    },
  ];

  return (
    <div className="p-4 bg-[#f5f5f5] min-h-screen">
      <div className="grid grid-cols-2 gap-4">
        {/* LEFT SECTION */}
        <Card className="rounded-xl shadow-sm border-0">
          <div className="mb-4">
            <h2 className="text-[18px] font-semibold text-black mb-4">Return Reason</h2>

            <Radio.Group value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="mb-4">
              <Radio value="all">All</Radio>
              <Radio value="rto">RTO</Radio>
              <Radio value="customer">Customer Return</Radio>
            </Radio.Group>
          </div>

          <Table columns={returnColumns} dataSource={returnData} pagination={{ pageSize: 1 }} bordered size="middle" />
        </Card>

        {/* RIGHT SECTION */}
        <div className="flex flex-col gap-4">
          <Card className="rounded-xl shadow-sm border-0">
            <Radio.Group
              value={selectedAnalysis}
              onChange={(e) => setSelectedAnalysis(e.target.value)}
              className="mb-4"
            >
              <Radio value="state">State Analysis</Radio>
              <Radio value="channel">Channel Analysis</Radio>
              <Radio value="fulfillment">Fulfillment Type</Radio>
              <Radio value="warehouse">Warehouse</Radio>
            </Radio.Group>

            <h2 className="text-[18px] font-semibold text-black mb-4">State Analysis</h2>

            <Table
              columns={analysisColumns}
              dataSource={analysisData}
              pagination={false}
              bordered
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>

          <Card className="rounded-xl shadow-sm border-0">
            <h2 className="text-[18px] font-semibold text-black mb-4">Qty,Rto,CReturn</h2>

            <div className="h-[220px] flex items-center justify-center border rounded-lg bg-white text-gray-400">
              Chart Area
            </div>
          </Card>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <Card className="rounded-xl shadow-sm border-0 mt-4">
        <h2 className="text-[18px] font-semibold text-black mb-4">SKU vs RTO & Return qty</h2>

        <div className="h-[250px] flex items-center justify-center border rounded-lg bg-white">
          <Empty description="No Data" />
        </div>
      </Card>
    </div>
  );
}
