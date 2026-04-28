import React, { useState, useEffect } from 'react';
import { Table, Button, Skeleton, Empty, Spin } from 'antd';
import { ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';

export default function Download() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
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
      // render: (text) => <span className="text-primar font-medium cursor-pointer">{text}</span>,
    },
    {
      title: 'Period (From Date - To Date)',
      dataIndex: 'period',
      key: 'period',
      align: 'center',
      render: (val) => val || '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => <span className="text-green-600 font-medium">{status}</span>,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      sorter: (a, b) => a.createdAt - b.createdAt,
      render: (date) =>
        new Date(date).toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      render: () => (
        <Button className="bg-blue-100 text-black-600 rounded-md flex items-center gap-1 border-none shadow-none">
          Export
          <UploadOutlined />
        </Button>
      ),
    },
  ];

  const dataSource = [
    {
      key: 1,
      sno: 1,
      reportType: 'OUTSTANDING CASHBACK',
      period: '-',
      status: 'Completed',
      createdAt: '2026-04-28T12:17:03',
    },
    {
      key: 2,
      sno: 2,
      reportType: 'OUTSTANDING PAYMENTS',
      period: '-',
      status: 'Completed',
      createdAt: '2026-04-28T12:17:00',
    },
    {
      key: 3,
      sno: 3,
      reportType: 'PROFIT LOWEST LEVEL',
      period: '01/04/2026 - 30/04/2026',
      status: 'Completed',
      createdAt: '2026-04-28T12:16:47',
    },
  ];

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
        <Spin spinning={loading} size="large">
          <div className="bg-white dark:bg-white10 rounded-[10px] p-[20px]">
            {/* Refresh Button */}
            <div className="flex justify-end mb-3">
              <Button shape="circle" icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} />
            </div>

            {/* Table / Skeleton */}
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : (
              <div className="table-responsive">
                <Table
                  columns={columns}
                  dataSource={dataSource}
                  scroll={{ x: 900 }}
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                  }}
                  onChange={(pag) => {
                    setPagination(pag);
                  }}
                  size="small"
                  locale={{
                    emptyText: <Empty description="No data" className="py-10" />,
                  }}
                />
              </div>
            )}
          </div>
        </Spin>
      </main>
    </>
  );
}
