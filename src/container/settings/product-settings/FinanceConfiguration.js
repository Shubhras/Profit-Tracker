import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Modal, Button, message, Spin } from 'antd';
import {
  CloseOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  DownOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { DataService } from '../../../config/dataService/dataService';

const MYNTRA_SAMPLE_LINKS = {
  Seller_Orders_Report:
    'https://onedrive.live.com/:x:/g/personal/722D585B2864D582/IQCySUYmpbe7TJtdlflyLJkHAT3c2eqS6IEEglMgdVXd-0o?resid=722D585B2864D582!s264649b2b7a54cbb9b5d95f9722c9907&ithint=file%2Cxlsx&CT=1788525030956&web=1&TeamsCID=0867999d-8137-4bbc-bd02-e6fe8ac7541e&linkOpenTime=1788525031006&wdCid=&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvYy83MjJkNTg1YjI4NjRkNTgyL0lRQ3lTVVltcGJlN1RKdGRsZmx5TEprSEFUM2MyZXFTNklFRWdsTWdkVlhkLTBvP0NUPTE3ODg1MjUwMzA5NTYmd2ViPTEmVGVhbXNDSUQ9MDg6Nzk5OWQtODEzNy00YmJjLWJkMDItZTZmZThhYzc1NDFlJmxpbmtPcGVuVGltZT0xNzg4NTI1MDMxMDA6',
  Seller_Returns_Report:
    'https://onedrive.live.com/:x:/g/personal/722D585B2864D582/IQB2Imiq_SHhSov6FrjWcoatAfgALYZWBk_PrBEd01zFwh4?resid=722D585B2864D582!saa68227621fd4ae18bfa16b8d67286ad&ithint=file%2Cxlsx&CT=1788525069623&web=1&TeamsCID=6f07a6aa-dccd-45c1-9999-e49a94394b44&linkOpenTime=1788525069632&wdCid=&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvYy83MjJkNTg1YjI4NjRkNTgyL0lRQjJJbWlxX1NIaFNvdjZGcmpXY29hdEFmZ0FMWVpXQmtfUHJCRWQwMXpGd2g0P0NUPTE3ODg1MjUwNjk2MjMmd2ViPTEmVGVhbXNDSUQ9NmYwN2E2YWEtZGNjZC00NWMxLTk5OTktZTQ5YTk0Mzk0YjQ0JmxpbmtPcGVuVGltZT0xNzg4NTI1MDg3NDc3',
  Payments:
    'https://onedrive.live.com/:x:/g/personal/722D585B2864D582/IQBqUwkwC8ANRZ06M4yvIk-LAReW2RV0eq8pbdABYKNFi9w?resid=722D585B2864D582!s3009536ac00b450d9d3a338caf224f8b&ithint=file%2Cxlsx&CT=1788525087470&web=1&TeamsCID=c1ebd638-6f2f-4ae2-912a-c7e48f941bcc&linkOpenTime=1788525087477&wdCid=&migratedtospo=true&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3gvYy83MjJkNTg1YjI4NjRkNTgyL0lRQnFVd2t3QzhBTlJaMDZNNHl2SWstTEFSZVcyUlYwZXE4cGJkQUJZS05GaTl3P0NUPTE3ODg1MjUwODc0NzAmd2ViPTEmVGVhbXNDSUQ9YzFlYmQ2MzgtNmYyZi00YWUyLTkxMmEtYzdlNDhmOTQxYmNjJmxpbmtPcGVuVGltZT0xNzg4NTI1MDg3NDc3',
};

export default function FinanceConfiguration() {
  const profile = useSelector((state) => state.auth.profile);
  const connectedChannels = profile?.connected_channels || [];
  const [recalculateModal, setRecalculateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedMarketplace, setSelectedMarketplace] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const DEFAULT_RECENT_UPLOADS = [
    {
      reportName: 'Seller Orders Report',
      reportType: 'Seller_Orders_Report',
      fileName: 'myntra_orders_Aug.xlsx',
      uploadedOn: '20 Aug 2026, 11:30 AM',
      status: 'Processed',
      records: '12,542',
      marketplace: 'Myntra',
    },
    {
      reportName: 'Seller Returns Report',
      reportType: 'Seller_Returns_Report',
      fileName: 'myntra_returns_Aug.xlsx',
      uploadedOn: '20 Aug 2026, 10:15 AM',
      status: 'Processed',
      records: '8,765',
      marketplace: 'Myntra',
    },
    {
      reportName: 'Payments Report',
      reportType: 'Payments',
      fileName: 'myntra_payments_Aug.xlsx',
      uploadedOn: '19 Aug 2026, 06:45 AM',
      status: 'Processed',
      records: '5,420',
      marketplace: 'Myntra',
    },
  ];

  const [recentUploads, setRecentUploads] = useState(() => {
    try {
      const saved = localStorage.getItem('recent_uploaded_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse recent_uploaded_reports from localStorage:', e);
    }
    return DEFAULT_RECENT_UPLOADS;
  });

  useEffect(() => {
    try {
      const serializableUploads = recentUploads.map(({ file, ...item }) => item);
      localStorage.setItem('recent_uploaded_reports', JSON.stringify(serializableUploads));
    } catch (e) {
      console.error('Failed to save recent_uploaded_reports to localStorage:', e);
    }
  }, [recentUploads]);

  const marketplaceOptions = useMemo(() => {
    const defaultList = ['Amazon-India', 'Myntra'];
    return Array.from(new Set([...connectedChannels, ...defaultList]));
  }, [connectedChannels]);

  const reportTypeOptions = useMemo(() => {
    if (selectedMarketplace && selectedMarketplace.toLowerCase().includes('myntra')) {
      return [
        { label: 'Seller_Orders_Report', value: 'Seller_Orders_Report' },
        { label: 'Seller_Returns_Report', value: 'Seller_Returns_Report' },
        { label: 'Payments', value: 'Payments' },
      ];
    }
    return [
      { label: 'Finance Report', value: 'finance' },
      { label: 'Sales Report', value: 'sales' },
      { label: 'Inventory Report', value: 'inventory' },
      { label: 'Orders Report', value: 'orders' },
    ];
  }, [selectedMarketplace]);

  useEffect(() => {
    const fetchUploadedReports = async () => {
      try {
        const res = await DataService.get('/myntra/reports/list/');
        if (res?.data?.status && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setRecentUploads((prev) => {
            const backendData = res.data.data;
            const existingKeys = new Set(backendData.map((item) => `${item.reportType}_${item.fileName}`));
            const prevFiltered = prev.filter((item) => !existingKeys.has(`${item.reportType}_${item.fileName}`));
            return [...backendData, ...prevFiltered];
          });
        }
      } catch (err) {
        console.error('Error fetching uploaded reports:', err);
      }
    };

    fetchUploadedReports();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'recalculate') {
        setRecalculateModal(true);
      }

      if (e.detail === 'delete') {
        setDeleteModal(true);
      }
    };

    window.addEventListener('headerAction', handler);

    return () => {
      window.removeEventListener('headerAction', handler);
    };
  }, []);

  /*
   * Select file
   */
  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();

    const isValidFile = allowedExtensions.some((extension) => fileName.endsWith(extension));

    if (!isValidFile) {
      message.error('Please upload a CSV, XLSX or XLS file.');
      return;
    }

    const maxSize = 25 * 1024 * 1024;

    if (file.size > maxSize) {
      message.error('File size must be less than 25MB.');
      return;
    }

    setSelectedFile(file);
  };

  /*
   * Drag & Drop
   */
  const handleDrop = (e) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  /*
   * Upload & Process
   */
  const handleUpload = async () => {
    if (!selectedMarketplace) {
      message.warning('Please select a Marketplace.');
      return;
    }

    if (!selectedReportType) {
      message.warning('Please select a Report Type.');
      return;
    }

    if (!selectedFile) {
      message.warning('Please select a file to upload.');
      return;
    }

    setUploading(true);

    try {
      let endpoint = '';
      if (selectedMarketplace.toLowerCase().includes('myntra')) {
        if (selectedReportType === 'Seller_Orders_Report') {
          endpoint = '/myntra/reports/orders/upload/';
        } else if (selectedReportType === 'Seller_Returns_Report') {
          endpoint = '/myntra/reports/returns/upload/';
        } else if (selectedReportType === 'Payments') {
          endpoint = '/myntra/reports/payments/upload/';
        } else {
          endpoint = '/myntra/reports/orders/upload/';
        }
      } else {
        endpoint = `/reports/${selectedReportType}/upload/`;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      if (selectedReportType === 'Payments') {
        formData.append('payment_method', 'PREPAID');
      }

      const res = await DataService.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const resData = res?.data || {};

      if (resData.status === true || resData.status === 'SUCCESS' || res.status === 200) {
        message.success(resData.message || 'Report uploaded and processed successfully.');

        const recordsCount =
          resData.data?.records ||
          (resData.data?.created !== undefined ? resData.data.created + (resData.data.updated || 0) : null) ||
          resData.data?.rows ||
          '1,000+';

        const fileUrl = resData.data?.fileUrl || null;

        const newUploadItem = {
          reportName: resData.data?.reportName || selectedReportType.replace(/_/g, ' '),
          reportType: selectedReportType,
          fileName: selectedFile.name,
          uploadedOn: new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          status: 'Processed',
          records: typeof recordsCount === 'number' ? recordsCount.toLocaleString() : recordsCount,
          marketplace: selectedMarketplace,
          file: selectedFile,
          fileUrl,
        };

        setRecentUploads((prev) => [newUploadItem, ...prev]);

        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        message.error(resData.message || resData.error || 'Upload failed.');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to upload report file.';
      message.error(errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleViewFormatGuide = () => {
    if (selectedMarketplace && selectedMarketplace.toLowerCase().includes('myntra')) {
      const link = MYNTRA_SAMPLE_LINKS[selectedReportType] || MYNTRA_SAMPLE_LINKS.Seller_Orders_Report;
      window.open(link, '_blank', 'noopener,noreferrer');
    } else {
      message.info('Format guide available for Myntra reports.');
    }
  };

  const handleView = (item) => {
    if (item.file) {
      const url = URL.createObjectURL(item.file);
      window.open(url, '_blank');
      return;
    }

    if (item.fileUrl) {
      window.open(item.fileUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const sampleUrl = MYNTRA_SAMPLE_LINKS[item.reportType] || MYNTRA_SAMPLE_LINKS.Seller_Orders_Report;
    if (sampleUrl) {
      window.open(sampleUrl, '_blank', 'noopener,noreferrer');
    } else {
      message.info(`Opening file view for ${item.fileName}`);
    }
  };

  const handleDownload = (item) => {
    if (item.file) {
      const url = URL.createObjectURL(item.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.fileName || `${item.reportName || 'report'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      message.success(`Downloading ${item.fileName || item.reportName}`);
      return;
    }

    if (item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = item.fileName || `${item.reportName || 'report'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      message.success(`Downloading ${item.fileName || item.reportName}`);
      return;
    }

    const sampleUrl = MYNTRA_SAMPLE_LINKS[item.reportType] || MYNTRA_SAMPLE_LINKS.Seller_Orders_Report;
    if (sampleUrl) {
      const directDownloadUrl = sampleUrl.includes('onedrive.live.com')
        ? sampleUrl.replace('web=1', 'download=1')
        : sampleUrl;
      const a = document.createElement('a');
      a.href = directDownloadUrl;
      a.download = `${item.reportName || item.fileName || 'Report'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      message.success(`Downloading ${item.reportName || item.fileName || 'Report'}`);
    } else {
      message.info(`Downloading ${item.fileName || item.reportName}...`);
    }
  };

  return (
    <>
      <div className="px-5 xl:px-[15px] pt-2 pb-5">
        <div className="flex items-start justify-between gap-6 lg:flex-col lg:gap-4">
          {/* LEFT SIDE */}
          <div>
            <PageHeader title="Upload Marketplace Reports" className="p-0 bg-transparent" />

            <p className="text-[13px] text-[#6B7280] mt-[-8px] max-w-[540px] leading-[20px] sm:text-[12px] sm:leading-[18px]">
              Upload your marketplace reports to add sales, fees, transactions and other data to your TrackMyProfit
              dashboard.
            </p>
          </div>

          <div className="w-[500px] min-h-[92px] shrink-0 bg-white border border-[#E8EAED] rounded-[8px] px-4 py-3 flex items-start gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:w-full lg:shrink sm:px-3 sm:py-3 ">
            <div className="w-[38px] h-[38px] rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
              <QuestionCircleOutlined className="text-[19px] text-[#22C55E]" />
            </div>

            {/* CONTENT */}
            <div>
              <h3 className="text-[15px] font-semibold text-[#1F2937] mb-[3px]">How it works?</h3>

              <p className="text-[13px] text-[#6B7280] leading-[18px] mb-2 sm:text-[12px] sm:leading-[17px]">
                Update your finance settings → We apply the configuration → It appears in your profit calculations.
              </p>

              <button
                type="button"
                onClick={handleViewFormatGuide}
                className="text-[12px] text-[#1683D8] font-medium flex items-center gap-1 hover:text-[#0F6FB8]"
              >
                View Guide
                <span className="text-[14px]">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="px-5 xl:px-[15px] pb-[30px]">
        <div className="bg-white border border-[#E8EAED] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-4 pt-4 pb-4">
            {/* ================= SECTION TITLE ================= */}
            <div className="mb-4">
              <h3 className="text-[15px] font-semibold text-[#1F2937]">1. Upload New Report</h3>
            </div>

            <div className="grid grid-cols-[180px_190px_1fr] gap-5 items-start lg:grid-cols-2 md:grid-cols-1 md:gap-4">
              {' '}
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-[6px]">Select Marketplace</label>

                <div className="relative">
                  {/* Marketplace Icon */}
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-[20px] h-[20px] rounded-[4px] bg-[#EAFBF4] flex items-center justify-center pointer-events-none">
                    <ShopOutlined className="text-[11px] text-[#35B77B]" />
                  </div>

                  <select
                    value={selectedMarketplace}
                    onChange={(e) => {
                      setSelectedMarketplace(e.target.value);
                      setSelectedReportType('');
                    }}
                    className="h-[34px] w-full appearance-none
    border border-[#D9DDE3] rounded-[5px] bg-white pl-[37px] pr-[30px]
    text-[10px] text-[#4B5563] outline-none cursor-pointer transition-all
    hover:border-[#35B77B] focus:border-[#35B77B]"
                  >
                    <option value="" disabled>
                      Select Marketplace
                    </option>

                    {marketplaceOptions.map((channel) => (
                      <option key={channel} value={channel}>
                        {channel}
                      </option>
                    ))}
                  </select>

                  {/* Dropdown Arrow */}
                  <DownOutlined className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-[#374151] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-[6px]">Select Report Type</label>

                <div className="relative">
                  {/* Report Icon */}
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-[20px] h-[20px] rounded-[4px] bg-[#F1EAFE] flex items-center justify-center pointer-events-none">
                    <FileTextOutlined className="text-[11px] text-[#8B5CF6]" />
                  </div>

                  <select
                    value={selectedReportType}
                    onChange={(e) => setSelectedReportType(e.target.value)}
                    className="h-[34px] w-full appearance-none border border-[#D9DDE3] rounded-[5px] bg-white pl-[37px] pr-[30px] text-[10px] text-[#4B5563] outline-none cursor-pointer transition-all hover:border-[#8B5CF6] focus:border-[#8B5CF6]"
                  >
                    <option value="" disabled>
                      Select Report Type
                    </option>
                    {reportTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Dropdown Arrow */}
                  <DownOutlined className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] text-[#374151] pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#374151] mb-[6px]">Upload File</label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="min-h-[114px] w-full border border-[#D9DDE3] rounded-[5px] bg-white flex items-center justify-center gap-3 px-3 py-3 transition-all hover:border-[#35B77B] sm:min-h-[125px] sm:gap-2"
                >
                  {/* UPLOAD ICON - LEFT */}
                  <div className="shrink-0">
                    <CloudUploadOutlined className="text-[40px] text-[#35B77B]" />
                  </div>

                  {/* CONTENT - RIGHT */}
                  <div className="flex flex-col items-center justify-center text-center min-w-0">
                    {/* DRAG TEXT */}
                    <p className="text-[12px] text-[#6B7280] mb-[3px]">Drag & drop your file here</p>

                    <p className="text-[11px] text-[#9CA3AF] mb-[4px]">or</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    />

                    {/* BROWSE BUTTON */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-[27px] px-5 border border-[#35B77B] rounded-[4px] bg-white text-[#35B77B] text-[11px] font-semibold hover:bg-[#ECFDF5] transition-all"
                    >
                      Browse File
                    </button>

                    {/* FILE INFO */}
                    <p className="text-[11px] text-[#9CA3AF] mt-[5px] sm:text-[10px]">
                      Supports .csv, .xlsx, .xls
                      <span className="mx-1">|</span>
                      Max file size 25MB
                    </p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="mt-1.5 px-2.5 py-1.5 rounded-[4px] bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileTextOutlined className="text-[11px] text-[#22C55E]" />

                      <span className="text-[9px] text-[#374151] truncate">{selectedFile.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);

                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                    >
                      <CloseOutlined className="text-[9px]" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#F0F1F3] flex items-center justify-between gap-4 md:flex-col md:items-stretch md:gap-3">
              {' '}
              {/* INFO */}
              <div className="flex items-center gap-1.5 min-w-0 md:flex-wrap">
                <ExclamationCircleOutlined className="text-[14px] text-[#6B7280] shrink-0" />

                <span className="text-[12px] text-[#4B5563] sm:text-[11px]">
                  Make sure your file is in the correct format.
                </span>

                <button
                  type="button"
                  onClick={handleViewFormatGuide}
                  className="text-[12px] text-[#1683D8] font-medium hover:underline whitespace-nowrap"
                >
                  View format guide
                </button>
              </div>
              {/* UPLOAD BUTTON */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="h-[31px] px-4 rounded-[5px] bg-[#16A36A] hover:bg-[#128A59] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-[0_2px_5px_rgba(22,163,106,0.18)] transition-all whitespace-nowrap md:w-full disabled:opacity-50 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 12, color: '#fff' }} spin />} />
                    Processing...
                  </>
                ) : (
                  'Upload & Process'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ================= RECENT UPLOADS TABLE ================= */}
      <section className="px-5 xl:px-[15px] pb-[30px]">
        <div className="bg-white border border-[#E8EAED] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="px-4 pt-4 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#1F2937]">Recent Uploads</h3>
            </div>

            <div className="border border-[#E8EAED] rounded-[6px] overflow-hidden">
              {/* TABLE HEADER */}
              <div className="grid grid-cols-[1.2fr_1fr_1.2fr_1.35fr_1.3fr_.9fr_.75fr_.65fr] bg-[#F8FAFC] border-b border-[#E8EAED]">
                <div className="px-3 py-2.5 text-[11px] font-semibold text-[#374151]">Report Name</div>
                <div className="px-3 py-2.5 text-[11px] font-semibold text-[#374151]">Marketplace</div>
                <div className="px-3 py-2.5 text-[11px] font-semibold text-[#374151]">Report Type</div>
                <div className="px-3 py-2.5 text-[11px] font-semibold text-[#374151]">File Name</div>
                <div className="px-3 py-2.5 text-[11px] font-semibold text-[#374151]">Uploaded On</div>
                <div className="px-3 py-2.5 text-[11px] font-semibold text-[#374151]">Status</div>
                <div className="px-3 py-2.5 text-[11px] font-semibold text-[#374151]">Records</div>
                <div className="px-3 py-2.5 text-[11px] font-semibold text-[#374151]">Actions</div>
              </div>

              {/* TABLE ROWS */}
              {recentUploads.map((item, index) => (
                <div
                  key={`${item.fileName}-${index}`}
                  className="grid grid-cols-[1.2fr_1fr_1.2fr_1.35fr_1.3fr_.9fr_.75fr_.65fr] min-h-[45px] items-center border-b border-[#F0F1F3] last:border-b-0 hover:bg-[#FAFCFB] transition-colors"
                >
                  {/* REPORT NAME */}
                  <div className="px-3 flex items-center gap-2 min-w-0">
                    <div
                      className={`
                  w-[25px] h-[25px] rounded-[5px]
                  flex items-center justify-center shrink-0
                  ${
                    item.reportName === 'Transaction Report' || item.reportName.includes('Orders')
                      ? 'bg-[#E8F8F1]'
                      : item.reportName === 'Ads Report' || item.reportName.includes('Returns')
                      ? 'bg-[#F1EAFE]'
                      : item.reportName === 'Settlement Report' || item.reportName.includes('Payments')
                      ? 'bg-[#FFF7D6]'
                      : 'bg-[#FEEBEC]'
                  }
                `}
                    >
                      <FileTextOutlined
                        className={`
                    text-[12px]
                    ${
                      item.reportName === 'Transaction Report' || item.reportName.includes('Orders')
                        ? 'text-[#35B77B]'
                        : item.reportName === 'Ads Report' || item.reportName.includes('Returns')
                        ? 'text-[#8B5CF6]'
                        : item.reportName === 'Settlement Report' || item.reportName.includes('Payments')
                        ? 'text-[#EAB308]'
                        : 'text-[#EF4444]'
                    }
                  `}
                      />
                    </div>

                    <span className="text-[11px] text-[#374151] font-medium truncate">{item.reportName}</span>
                  </div>

                  {/* MARKETPLACE */}
                  <div className="px-3 flex items-center gap-1.5">
                    <div className="w-[18px] h-[18px] rounded-[3px] bg-[#EAFBF4] flex items-center justify-center overflow-hidden">
                      <ShopOutlined className="text-[10px] text-[#35B77B]" />
                    </div>

                    <span className="text-[11px] text-[#4B5563]">{item.marketplace || 'Myntra'}</span>
                  </div>

                  {/* REPORT TYPE */}
                  <div className="px-3 min-w-0">
                    <span className="text-[11px] text-[#4B5563] truncate block">{item.reportType}</span>
                  </div>

                  {/* FILE NAME */}
                  <div className="px-3 min-w-0">
                    <span className="text-[11px] text-[#4B5563] truncate block">{item.fileName}</span>
                  </div>

                  {/* UPLOADED ON */}
                  <div className="px-3 min-w-0">
                    <span className="text-[11px] text-[#4B5563] whitespace-nowrap">{item.uploadedOn}</span>
                  </div>

                  {/* STATUS */}
                  <div className="px-3">
                    {item.status === 'Processed' && (
                      <span className="inline-flex items-center gap-1 h-[21px] px-2 rounded-[4px] border border-[#A7E8CB] bg-[#ECFDF5] text-[#159669] text-[8px] font-medium whitespace-nowrap">
                        <CheckCircleOutlined className="text-[9px]" />
                        Processed
                      </span>
                    )}

                    {item.status === 'Processing' && (
                      <span className="inline-flex items-center gap-1 h-[21px] px-2 rounded-[4px] border border-[#A9CFF7] bg-[#EFF6FF] text-[#287BC5] text-[8px] font-medium whitespace-nowrap">
                        <SyncOutlined spin className="text-[9px]" />
                        Processing
                      </span>
                    )}

                    {item.status === 'Failed' && (
                      <span className="inline-flex items-center gap-1 h-[21px] px-2 rounded-[4px] border border-[#F5B5B5] bg-[#FEF2F2] text-[#E54848] text-[8px] font-medium whitespace-nowrap">
                        <CloseCircleOutlined className="text-[9px]" />
                        Failed
                      </span>
                    )}
                  </div>

                  {/* RECORDS */}
                  <div className="px-3">
                    <span className="text-[11px] text-[#4B5563]">{item.records}</span>
                  </div>

                  {/* ACTIONS */}
                  <div className="px-3 flex items-center gap-3">
                    {item.status === 'Processed' && (
                      <>
                        <button
                          type="button"
                          title="View"
                          onClick={() => handleView(item)}
                          className="text-[#64748B] hover:text-[#1683D8] transition-colors cursor-pointer"
                        >
                          <EyeOutlined className="text-[12px]" />
                        </button>

                        <button
                          type="button"
                          title="Download"
                          onClick={() => handleDownload(item)}
                          className="text-[#64748B] hover:text-[#1683D8] transition-colors cursor-pointer"
                        >
                          <DownloadOutlined className="text-[12px]" />
                        </button>
                      </>
                    )}

                    {item.status === 'Processing' && <span className="text-[11px] text-[#9CA3AF]">—</span>}

                    {item.status === 'Failed' && (
                      <button
                        type="button"
                        title="View Error"
                        onClick={() => handleView(item)}
                        className="text-[#64748B] hover:text-[#E54848] transition-colors cursor-pointer"
                      >
                        <EyeOutlined className="text-[12px]" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========= RECALCULATE MODAL====== */}
      <Modal open={recalculateModal} onCancel={() => setRecalculateModal(false)} footer={null} centered width={500}>
        <h3 className="text-[16px] font-semibold mb-4">Select Effective Date</h3>

        <input
          type="date"
          className="w-full border rounded-md px-3 py-2 mb-4"
          value={selectedDate || ''}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <p className="text-blue-600 text-sm italic mb-4">
          Use this for recalculating expenses beyond last month. The changes in front end will reflect only after next
          sync depending on your agreed sync cycle for each channel.
        </p>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setRecalculateModal(false)}>Cancel</Button>

          <Button
            type="primary"
            disabled={!selectedDate}
            onClick={() => {
              setRecalculateModal(false);
              message.success('Recalculation started successfully.');
            }}
          >
            OK
          </Button>
        </div>
      </Modal>

      {/* =================== DELETE MODAL==================================== */}
      <Modal open={deleteModal} onCancel={() => setDeleteModal(false)} footer={null} centered>
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-yellow-100 text-yellow-600 rounded-full p-2">
            <ExclamationCircleOutlined style={{ fontSize: '18px' }} />
          </div>

          <h3 className="text-lg font-semibold">Confirm deletion</h3>
        </div>

        <p className="text-sm text-gray-500 mb-4 ml-10">
          Once you have updated all the settings, please click Recalculate Expense button to calculate if your changes
          are beyond 2 months. Otherwise, it will automatically reflect the next morning.
        </p>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setDeleteModal(false)}>Cancel</Button>

          <Button
            danger
            type="default"
            className="border-red-500 text-red-500 bg-white hover:!bg-red-500 hover:!text-white"
            onClick={() => {
              setDeleteModal(false);
              message.success('Configuration deleted successfully.');
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
