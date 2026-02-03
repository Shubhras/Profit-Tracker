import React, { useState } from 'react';
import { Table, Button, Skeleton, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function Download() {
  const [loading, setLoading] = useState(false);

  const PageRoutes = [
    {
      path: '',
      breadcrumbName: 'Download',
    },
  ];

  const columns = [
    {
      title: 'Sno',
      dataIndex: 'sno',
      key: 'sno',
      width: 80,
    },
    {
      title: 'Report Type',
      dataIndex: 'reportType',
      key: 'reportType',
      render: (text) => <span className="text-primary font-medium cursor-pointer">{text}</span>,
    },
    {
      title: 'Period (From Date - To Date)',
      dataIndex: 'period',
      key: 'period',
      align: 'center',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (date) =>
        new Date(date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
    },
  ];

  const dataSource = [];

  const handleRefresh = () => {
    // console.log('refresh');
    setLoading(true);

    // simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Download"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <div className="bg-white dark:bg-white10 rounded-[10px] p-[20px]">
          {/* Refresh Button */}
          <div className="flex justify-end mb-3">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} />
          </div>

          {/* Table / Skeleton */}
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <div className="table-responsive">
              <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                scroll={{ x: 900 }}
                locale={{
                  emptyText: <Empty description="No data" className="py-10" />,
                }}
              />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
