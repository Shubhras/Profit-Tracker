import React, { useState, useEffect } from 'react';
import { Table, Button, Skeleton, Empty, Spin, Tag, message, Modal } from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  SearchOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { PageHeader } from '../../components/page-headers/page-headers';
import { DataService } from '../../config/dataService/dataService';

export default function Download() {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [downloadingIds, setDownloadingIds] = useState({});
  const [deletingIds, setDeletingIds] = useState({});
  const [deletingAll, setDeletingAll] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { dateRange } = useSelector((state) => state.dashboard);

  const PageRoutes = [
    {
      path: '',
      breadcrumbName: 'Download',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      let url = `amazon/exports/history/?page=${pagination.current}&page_size=${pagination.pageSize}`;
      if (debouncedSearch) {
        url += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      if (dateRange?.fromDate) {
        url += `&from_date=${dateRange.fromDate}`;
      }
      if (dateRange?.endDate || dateRange?.toDate) {
        url += `&to_date=${dateRange.endDate || dateRange.toDate}`;
      }
      const response = await DataService.get(url);
      if (response.data && response.data.results) {
        setReports(response.data.results);
        setTotalCount(response.data.count || response.data.results.length);
      } else {
        setReports([]);
        setTotalCount(0);
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
  }, [pagination.current, pagination.pageSize, debouncedSearch, dateRange]);

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

  const handleDelete = async (record) => {
    setDeletingIds((prev) => ({ ...prev, [record.id]: true }));
    try {
      const response = await DataService.delete(`amazon/exports/history/${record.id}/delete/`);
      if (response.data && response.data.success) {
        message.success('Report deleted successfully');
        fetchHistory();
      } else {
        message.error(response.data?.message || 'Failed to delete report');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      message.error(err.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeletingIds((prev) => ({ ...prev, [record.id]: false }));
    }
  };

  const confirmDelete = (record) => {
    Modal.confirm({
      title: 'Delete Report',
      content: 'Are you sure you want to delete this report?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        return handleDelete(record);
      },
    });
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    try {
      const response = await DataService.delete('amazon/exports/history/delete-all/');
      if (response.data && response.data.success) {
        message.success(response.data.message || 'All reports deleted successfully');
        fetchHistory();
      } else {
        message.error(response.data?.message || 'Failed to delete reports');
      }
    } catch (err) {
      console.error('Delete all failed:', err);
      message.error(err.response?.data?.message || 'Failed to delete reports');
    } finally {
      setDeletingAll(false);
    }
  };

  const confirmDeleteAll = () => {
    Modal.confirm({
      title: 'Delete All Reports',
      content: 'Are you sure you want to delete ALL exported reports? This action cannot be undone.',
      okText: 'Delete All',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        return handleDeleteAll();
      },
    });
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
        <div className="flex items-center justify-center gap-2">
          <Button
            onClick={() => handleDownload(record)}
            loading={!!downloadingIds[record.id]}
            disabled={record.status !== 'COMPLETED'}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-md inline-flex items-center gap-1 border-none shadow-none text-[12px] font-medium px-3 h-[30px]"
          >
            Download
            <DownloadOutlined />
          </Button>

          <Button
            danger
            loading={!!deletingIds[record.id]}
            onClick={() => confirmDelete(record)}
            className="bg-red-50 text-red-600 hover:bg-red-100 rounded-md inline-flex items-center justify-center border-none shadow-none text-[12px] h-[30px] w-[30px] !px-0"
            icon={<DeleteOutlined />}
          />
        </div>
      ),
    },
  ];

  const dataSource = reports.map((item, idx) => ({
    key: item.id || idx,
    sno: (pagination.current - 1) * pagination.pageSize + idx + 1,
    ...item,
  }));

  return (
    <>
      <PageHeader
        routes={PageRoutes}
        title="Download"
        className="flex justify-between items-center px-4 xl:px-[15px] pt-2 pb-3 sm:pb-[30px] bg-transparent sm:flex-col"
      />

      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-4 xl:px-[15px] pb-[30px] bg-transparent">
        <Spin spinning={loading} size="large">
          <div className="bg-white dark:bg-white10 rounded-[10px] p-[20px] shadow-sm">
            {/* Header Controls */}
            <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
              <span className="text-[14px] font-semibold text-gray-700">Export History & Generated Reports</span>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative w-[260px]">
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by report type, file..."
                    className="w-full h-[30px] rounded-xl border bg-white pl-9 pr-3 text-[13px] text-[#111827] outline-none shadow-sm transition-all duration-200 focus:border-[#dbe1e8]"
                  />
                  <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[14px]" />
                </div>

                {/* Delete All Button */}
                <Button
                  danger
                  onClick={confirmDeleteAll}
                  loading={deletingAll}
                  disabled={reports.length === 0}
                  className="bg-red-50 text-red-600 hover:bg-red-100 rounded-md inline-flex items-center gap-1 border-none shadow-none text-[12px] font-medium px-3 h-[30px]"
                >
                  <DeleteOutlined />
                  Delete All
                </Button>
              </div>
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
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: totalCount,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                  }}
                  onChange={(pag) => {
                    setPagination({
                      current: pag.current,
                      pageSize: pag.pageSize,
                    });
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
