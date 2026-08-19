import React, { useState, useEffect } from 'react';
import { Table, Button, Skeleton, Empty, Spin, Tag, message } from 'antd';
import {
  ReloadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../components/page-headers/page-headers';
import { DataService } from '../../config/dataService/dataService';

export default function Download() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [downloadingIds, setDownloadingIds] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const PageRoutes = [
    {
      path: '',
      breadcrumbName: 'Download',
    },
  ];

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await DataService.get('amazon/exports/history/');
      if (response.data && response.data.results) {
        setReports(response.data.results);
      } else {
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching export history:', err);
      message.error('Failed to fetch download history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = async (record) => {
    setDownloadingIds((prev) => ({ ...prev, [record.id]: true }));
    try {
      const response = await DataService.get(`amazon/exports/history/${record.id}/download/`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let filename = record.file_name || `report_${record.id}.${record.format || 'xlsx'}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        const [, matchedFilename] = match || [];
        if (matchedFilename) {
          filename = matchedFilename;
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success(`Successfully downloaded ${filename}`);
    } catch (err) {
      console.error('Download failed:', err);
      message.error('Failed to download report file');
    } finally {
      setDownloadingIds((prev) => ({ ...prev, [record.id]: false }));
    }
  };

  const formatReportType = (typeStr) => {
    if (!typeStr) return '-';
    return typeStr
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns = [
    {
      title: 'Sno',
      dataIndex: 'sno',
      key: 'sno',
      width: 70,
      align: 'center',
    },
    {
      title: 'Report Type',
      dataIndex: 'report_type',
      key: 'report_type',
      render: (text) => <span className="font-semibold text-gray-800">{formatReportType(text)}</span>,
    },
    {
      title: 'File Name',
      dataIndex: 'file_name',
      key: 'file_name',
      render: (text, record) => (
        <div className="flex items-center gap-1.5 font-mono text-[12px] text-gray-700">
          {record.format === 'pdf' ? (
            <FilePdfOutlined className="text-red-500 text-[14px]" />
          ) : record.format === 'csv' ? (
            <FileTextOutlined className="text-blue-500 text-[14px]" />
          ) : (
            <FileExcelOutlined className="text-green-600 text-[14px]" />
          )}
          <span>{text || '-'}</span>
        </div>
      ),
    },
    {
      title: 'Period (From Date - To Date)',
      dataIndex: 'period',
      key: 'period',
      align: 'center',
      render: (_, record) => {
        if (record.from_date || record.to_date) {
          return `${record.from_date || '-'} to ${record.to_date || '-'}`;
        }
        return '-';
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const upper = (status || '').toUpperCase();
        if (upper === 'COMPLETED') {
          return (
            <Tag color="success" className="font-medium px-2 py-0.5">
              Completed
            </Tag>
          );
        }
        if (upper === 'PROCESSING' || upper === 'PENDING') {
          return (
            <Tag color="processing" className="font-medium px-2 py-0.5">
              Processing
            </Tag>
          );
        }
        if (upper === 'FAILED') {
          return (
            <Tag color="error" className="font-medium px-2 py-0.5">
              Failed
            </Tag>
          );
        }
        return (
          <Tag color="default" className="font-medium px-2 py-0.5">
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
      render: (date) =>
        date
          ? new Date(date).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '-',
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          onClick={() => handleDownload(record)}
          loading={!!downloadingIds[record.id]}
          disabled={record.status !== 'COMPLETED'}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md inline-flex items-center gap-1 border-none shadow-none text-[12px] font-medium px-3 h-[30px]"
        >
          Download
          <DownloadOutlined />
        </Button>
      ),
    },
  ];

  const dataSource = reports.map((item, idx) => ({
    key: item.id || idx,
    sno: idx + 1,
    ...item,
  }));

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Download"
        className="flex justify-between items-center px-8 xl:px-[15px] pt-2 pb-6 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-8 xl:px-[15px] pb-[30px] bg-transparent">
        <Spin spinning={loading} size="large">
          <div className="bg-white dark:bg-white10 rounded-[10px] p-[20px] shadow-sm">
            {/* Refresh Button */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-[14px] font-semibold text-gray-700">Export History & Generated Reports</span>
              <Button shape="circle" icon={<ReloadOutlined />} onClick={fetchHistory} loading={loading} />
            </div>

            {/* Table / Skeleton */}
            {loading && reports.length === 0 ? (
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
                    emptyText: <Empty description="No exported reports found" className="py-10" />,
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
