import React from 'react';
import { Table, Card } from 'antd';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function SalesDetails() {
  const { id } = useParams();

  const dates = Array.from({ length: 15 }, (_, i) => {
    const date = new Date(2026, 0, i + 1);
    return date.toISOString().split('T')[0];
  });

  const dataSource = ['Product A', 'Product B', 'Product C'].map((product, idx) => {
    const row = {
      key: idx,
      id: product,
    };

    dates.forEach((date) => {
      row[date] = Math.floor(Math.random() * 100);
    });

    return row;
  });

  const dynamicColumns = dates.map((date) => ({
    title: new Date(date)
      .toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      })
      .replace(',', ''),
    dataIndex: date,
    key: date,
    align: 'center',
    sorter: (a, b) => (a[date] || 0) - (b[date] || 0),
  }));

  const columns = [
    {
      title: 'Product',
      dataIndex: 'id',
      fixed: 'left',
      width: 150,
    },
    ...dynamicColumns,
  ];

  return (
    <>
      <PageHeader
        title={`Sales Details - ${id}`}
        className="flex justify-between items-center px-8 pt-2 pb-6 bg-transparent"
      />

      <main className="px-8 pb-[30px]">
        <Card bordered={false}>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
            }}
            scroll={{ x: 'max-content' }}
            size="small"
          />
        </Card>
      </main>
    </>
  );
}
