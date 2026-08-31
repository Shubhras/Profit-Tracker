import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Button, message, Form, Input, InputNumber, Select, Switch, Table, Tag, DatePicker } from 'antd';
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
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { DataService } from '../../../config/dataService/dataService';

export default function FinanceConfiguration() {
  const profile = useSelector((state) => state.auth.profile);
  const connectedChannels = profile?.connected_channels || [];

  const [expenseForm] = Form.useForm();

  const [expenses, setExpenses] = useState([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseSaving, setExpenseSaving] = useState(false);

  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  const [costType, setCostType] = useState('per_sku');
  const [splitMode, setSplitMode] = useState('equally');
  const [repeatMonthly, setRepeatMonthly] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseDeleteModal, setExpenseDeleteModal] = useState(false);

  const [recalculateModal, setRecalculateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);
  const connectedMarketplaces = useMemo(() => {
    return connectedChannels.map((channel) => ({
      id: channel,
      name: channel,
    }));
  }, [connectedChannels]);

  const fetchExpenses = async () => {
    setExpenseLoading(true);

    try {
      const params = {
        month: selectedMonth,
      };

      if (selectedMarketplace !== 'all') {
        params.marketplace = selectedMarketplace;
      }

      const response = await DataService.get('/amazon/other-expenses/', {
        params,
      });

      if (Array.isArray(response.data?.results)) {
        setExpenses(response.data.results);
      } else if (Array.isArray(response.data)) {
        setExpenses(response.data);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error('Error fetching business expenses:', error);
      message.error('Failed to load expenses.');
    } finally {
      setExpenseLoading(false);
    }
  };
  useEffect(() => {
    fetchExpenses();
  }, [selectedMarketplace, selectedMonth]);

  const handleExpenseSubmit = async (statusType = 'applied') => {
    try {
      const values = await expenseForm.validateFields();

      setExpenseSaving(true);

      const payload = {
        expense_name: values.expense_name,
        marketplace: values.marketplace || connectedMarketplaces[0]?.name || 'Amazon',

        cost_value: values.cost_value,

        start_date: values.date_range ? values.date_range[0].format('YYYY-MM-DD') : null,

        end_date: values.date_range ? values.date_range[1].format('YYYY-MM-DD') : null,

        cost_type: costType,
        split_lump_sum_by: splitMode,
        repeat_monthly: repeatMonthly,
        status: statusType,
      };

      const response = await DataService.post('/amazon/other-expenses/', payload);

      if (response.data && (response.data.success || response.data.id)) {
        message.success(statusType === 'draft' ? 'Expense saved as draft!' : 'Expense applied successfully!');

        expenseForm.resetFields();

        setCostType('per_sku');
        setSplitMode('equally');
        setRepeatMonthly(false);
        setShowPreview(false);
        setPreviewData([]);

        fetchExpenses();
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      message.error('Failed to save expense. Please check your inputs.');
    } finally {
      setExpenseSaving(false);
    }
  };

  const handleGeneratePreview = async (overrideCostType = costType, overrideSplitMode = splitMode) => {
    const costValue = expenseForm.getFieldValue('cost_value');

    if (!costValue) {
      message.warning('Please enter a cost value to generate preview.');
      return;
    }

    setPreviewLoading(true);
    setShowPreview(true);

    try {
      const response = await DataService.post('/amazon/other-expenses/preview/', {
        cost_value: costValue,
        cost_type: overrideCostType,
        split_lump_sum_by: overrideSplitMode,
      });

      if (response.data?.preview) {
        setPreviewData(response.data.preview);
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
      message.error('Unable to generate preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCostTypeChange = (type) => {
    setCostType(type);

    if (showPreview) {
      handleGeneratePreview(type, splitMode);
    }
  };

  const handleSplitModeChange = (mode) => {
    setSplitMode(mode);

    if (showPreview) {
      handleGeneratePreview(costType, mode);
    }
  };

  const togglePreview = () => {
    if (showPreview) {
      setShowPreview(false);
    } else {
      handleGeneratePreview();
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      await DataService.delete(`/amazon/other-expenses/${expenseToDelete.id}/`);

      message.success('Expense deleted successfully.');

      setExpenseDeleteModal(false);
      setExpenseToDelete(null);

      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      message.error('Failed to delete expense.');
    }
  };

  /*
   * Existing header actions are kept so that
   * other parts of the application can still
   * trigger upload / recalculate actions.
   */
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
  const handleUpload = () => {
    if (!selectedFile) {
      message.warning('Please select a finance configuration file.');
      return;
    }

    console.log('Finance Configuration File:', selectedFile);

    message.success('Finance configuration file uploaded successfully.');

    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const recentUploads = [
    {
      reportName: 'Transaction Report',
      reportType: 'Transaction Report',
      fileName: 'blinkit_txn_20Aug.csv',
      uploadedOn: '20 Aug 2026, 11:30 AM',
      status: 'Processed',
      records: '12,542',
    },
    {
      reportName: 'Ads Report',
      reportType: 'Ads Report',
      fileName: 'blinkit_ads_20Aug.xlsx',
      uploadedOn: '20 Aug 2026, 10:15 AM',
      status: 'Processed',
      records: '8,765',
    },
    {
      reportName: 'Settlement Report',
      reportType: 'Settlement Report',
      fileName: 'blinkit_settlement_19Aug.xlsx',
      uploadedOn: '19 Aug 2026, 06:45 AM',
      status: 'Processing',
      records: '—',
    },
    {
      reportName: 'Fee Report',
      reportType: 'Fee Report',
      fileName: 'blinkit_fee_18Aug.xlsx',
      uploadedOn: '18 Aug 2026, 09:20 AM',
      status: 'Failed',
      records: '—',
    },
  ];

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
                    defaultValue=""
                    className="h-[34px] w-full appearance-none
    border border-[#D9DDE3] rounded-[5px] bg-white pl-[37px] pr-[30px]
    text-[10px] text-[#4B5563] outline-none cursor-pointer transition-all
    hover:border-[#35B77B] focus:border-[#35B77B]"
                  >
                    <option value="" disabled>
                      Select Marketplace
                    </option>

                    {connectedChannels.map((channel) => (
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
                    defaultValue=""
                    className="h-[34px] w-full appearance-none border border-[#D9DDE3] rounded-[5px] bg-white pl-[37px] pr-[30px] text-[10px] text-[#4B5563] outline-none cursor-pointer transition-all hover:border-[#8B5CF6] focus:border-[#8B5CF6]"
                  >
                    <option value="" disabled>
                      Select Report Type
                    </option>
                    <option value="finance">Finance Report</option>
                    <option value="sales">Sales Report</option>
                    <option value="inventory">Inventory Report</option>
                    <option value="orders">Orders Report</option>
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
                  className="text-[12px] text-[#1683D8] font-medium hover:underline whitespace-nowrap"
                >
                  View format guide
                </button>
              </div>
              {/* UPLOAD BUTTON */}
              <button
                type="button"
                onClick={handleUpload}
                className="h-[31px] px-4 rounded-[5px] bg-[#16A36A] hover:bg-[#128A59] text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-[0_2px_5px_rgba(22,163,106,0.18)] transition-all whitespace-nowrap md:w-full "
              >
                Upload & Process
              </button>
            </div>
          </div>
        </div>
      </main>

      {/*  RECENT UPLOADS============ */}
      <section className="px-5 xl:px-[15px] pb-[30px]">
        <div className="bg-white border border-[#E8EAED] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* SECTION HEADER */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3 sm:items-start">
            {' '}
            <h3 className="text-[15px] font-semibold text-[#1F2937] mb-0">2. Recent Uploads</h3>
            <button
              type="button"
              className="text-[11px] text-[#1683D8] font-medium flex items-center gap-1 hover:text-[#0F6FB8] transition-colors"
            >
              View All Uploads
              <span className="text-[14px] leading-none">→</span>
            </button>
          </div>

          {/* TABLE WRAPPER */}
          <div className="px-4 pb-4 overflow-x-auto">
            <div className="min-w-[1000px] border border-[#EEF0F2] rounded-[6px] overflow-hidden">
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
                    item.reportName === 'Transaction Report'
                      ? 'bg-[#E8F8F1]'
                      : item.reportName === 'Ads Report'
                      ? 'bg-[#F1EAFE]'
                      : item.reportName === 'Settlement Report'
                      ? 'bg-[#FFF7D6]'
                      : 'bg-[#FEEBEC]'
                  }
                `}
                    >
                      <FileTextOutlined
                        className={`
                    text-[12px]
                    ${
                      item.reportName === 'Transaction Report'
                        ? 'text-[#35B77B]'
                        : item.reportName === 'Ads Report'
                        ? 'text-[#8B5CF6]'
                        : item.reportName === 'Settlement Report'
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
                    <div className="w-[18px] h-[18px] rounded-[3px] bg-[#FFF7D6] flex items-center justify-center overflow-hidden">
                      <img src="/icons/blinkit.png" alt="Blinkit" className="w-full h-full object-contain" />
                    </div>

                    <span className="text-[11px] text-[#4B5563]">Blinkit</span>
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
                          className="text-[#64748B] hover:text-[#1683D8] transition-colors"
                        >
                          <EyeOutlined className="text-[12px]" />
                        </button>

                        <button
                          type="button"
                          title="Download"
                          className="text-[#64748B] hover:text-[#1683D8] transition-colors"
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
                        className="text-[#64748B] hover:text-[#E54848] transition-colors"
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

      {/* ================= 3. ADD EXPENSE ================= */}
      <section className="px-5 xl:px-[15px] pb-[30px]">
        <div className="bg-white border border-[#E8EAED] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden p-5">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h3 className="text-[15px] font-semibold text-[#1F2937] m-0">3. Add Expense</h3>

            <span className="text-[12px] text-[#1683D8] font-medium cursor-pointer hover:underline">
              Bulk upload (.xlsx)
            </span>
          </div>

          <Form form={expenseForm} layout="vertical">
            {/* BASIC FIELDS */}
            <div className="grid grid-cols-4 gap-4 lg:grid-cols-2 md:grid-cols-1">
              {/* Expense Name */}
              <Form.Item
                name="expense_name"
                label={<span className="text-[12px] font-medium text-[#374151]">Expense Name</span>}
                rules={[
                  {
                    required: true,
                    message: 'Expense name is required',
                  },
                ]}
              >
                <Input placeholder="e.g. Storage fees, Packaging" className="h-[36px]" />
              </Form.Item>

              {/* Marketplace */}
              <Form.Item
                name="marketplace"
                label={<span className="text-[12px] font-medium text-[#374151]">Select Marketplace</span>}
                initialValue={connectedMarketplaces[0]?.name}
              >
                <Select className="h-[36px]" placeholder="Select Marketplace">
                  {connectedMarketplaces.map((market) => (
                    <Select.Option key={market.id} value={market.name}>
                      {market.name}
                    </Select.Option>
                  ))}

                  <Select.Option value="All">All Connected Marketplaces</Select.Option>
                </Select>
              </Form.Item>

              {/* Cost Value */}
              <Form.Item
                name="cost_value"
                label={<span className="text-[12px] font-medium text-[#374151]">Cost Value (₹)</span>}
                rules={[
                  {
                    required: true,
                    message: 'Cost value is required',
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="10000"
                  className="w-full h-[36px] flex items-center"
                  formatter={(value) => (value ? `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                  parser={(value) => value?.replace(/₹\s?|(,*)/g, '') || ''}
                />
              </Form.Item>

              {/* Duration */}
              <Form.Item
                name="date_range"
                label={<span className="text-[12px] font-medium text-[#374151]">Duration</span>}
              >
                <DatePicker.RangePicker className="w-full h-[36px]" />
              </Form.Item>
            </div>

            {/* COST TYPE */}
            <div className="mt-2 mb-4">
              <label className="block text-[12px] font-medium text-[#374151] mb-2">Cost Type</label>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                {/* PER SKU */}
                <button
                  type="button"
                  onClick={() => handleCostTypeChange('per_sku')}
                  className={`text-left w-full p-3.5 rounded-[8px] border cursor-pointer transition-all ${
                    costType === 'per_sku'
                      ? 'border-[#22C55E] bg-[#F0FDF4] shadow-[0_0_0_1px_#22C55E]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-[13px] text-[#1F2937] mb-1">
                    <input
                      type="radio"
                      checked={costType === 'per_sku'}
                      onChange={() => handleCostTypeChange('per_sku')}
                    />

                    <span>Per SKU</span>
                  </div>

                  <p className="text-[12px] text-[#6B7280] m-0 pl-5">
                    One lump sum, split across every SKU that sold in the duration.
                  </p>

                  {/* {costType === 'per_sku' && (
                    <div className="mt-3 pl-5 border-t pt-2">
                      <label className="block text-[11px] text-[#4B5563] mb-1 font-medium">Split the lump sum:</label>

                      <Select value={splitMode} onChange={handleSplitModeChange} className="w-[200px] h-[32px]">
                        <Select.Option value="equally">Equally across SKUs</Select.Option>

                        <Select.Option value="net_sales">By net sales</Select.Option>

                        <Select.Option value="units_sold">By units sold</Select.Option>
                      </Select>
                    </div>
                  )} */}
                </button>

                {/* PER ORDER */}
                <button
                  type="button"
                  onClick={() => handleCostTypeChange('per_order')}
                  className={`text-left w-full p-3.5 rounded-[8px] border cursor-pointer transition-all ${
                    costType === 'per_order'
                      ? 'border-[#22C55E] bg-[#F0FDF4] shadow-[0_0_0_1px_#22C55E]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-[13px] text-[#1F2937] mb-1">
                    <input
                      type="radio"
                      checked={costType === 'per_order'}
                      onChange={() => handleCostTypeChange('per_order')}
                    />

                    <span>Per Order</span>
                  </div>

                  <p className="text-[12px] text-[#6B7280] m-0 pl-5">
                    A fixed rate charged on each order in the duration.
                  </p>
                </button>
              </div>
              <div className="mt-3 pl-5 pt-2 mb-3">
                <label className="block text-[13px] text-[#4B5563] mb-1.5 font-medium">
                  Split the lump sum
                  <span className="text-[#94A3B8] font-normal"> — how much each SKU absorbs</span>
                </label>

                <Select
                  value={splitMode}
                  onChange={(value) => handleSplitModeChange(value)}
                  className="
      w-[120px]
      [&_.ant-select-selector]:!h-[30px]
      [&_.ant-select-selector]:!rounded-[6px]
      [&_.ant-select-selector]:!border-[#D9E0E7]
      [&_.ant-select-selector]:!px-[6px]
      [&_.ant-select-selection-item]:!text-[12px]
      [&_.ant-select-selection-item]:!text-[#374151]
      [&_.ant-select-selection-item]:!leading-[28px]
    "
                  size="middle"
                  // popupMatchSelectWidth={true}
                  options={[
                    {
                      value: 'equally',
                      label: 'Equally across SKUs',
                    },
                    {
                      value: 'net_sales',
                      label: 'By net sales',
                    },
                    {
                      value: 'units_sold',
                      label: 'In ratio of units sold',
                    },
                  ]}
                />
              </div>
            </div>

            {/* REPEAT MONTHLY */}
            <div className="flex items-center gap-3 mb-4">
              <Switch checked={repeatMonthly} onChange={setRepeatMonthly} />

              <span className="text-[13px] font-medium text-[#374151]">Repeat this expense every month</span>
            </div>

            {/* PREVIEW */}
            <div className="border border-[#E5E7EB] rounded-[6px] p-3 mb-5 bg-[#F9FAFB]">
              <div className="w-full flex items-center justify-between text-[13px] font-medium text-[#374151]">
                <span className="flex items-center gap-1.5 text-[#186118] font-semibold">
                  <EyeOutlined className="text-[14px] text-[#64748B]" />
                  Preview — how this hits your profit
                </span>

                <button
                  type="button"
                  onClick={togglePreview}
                  className="text-[12px] text-[#1683D8] hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {showPreview && (
                <div className="mt-3">
                  <Table
                    loading={previewLoading}
                    dataSource={previewData}
                    rowKey="sku"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'SKU',
                        dataIndex: 'sku',
                      },
                      {
                        title: 'Units Sold',
                        dataIndex: 'units_sold',
                      },
                      {
                        title: 'Share',
                        dataIndex: 'share',
                      },
                      {
                        title: 'Expense Amount',
                        dataIndex: 'expense',
                        render: (val) => `₹${Number(val).toFixed(2)}`,
                      },
                      {
                        title: 'Per Unit',
                        dataIndex: 'per_unit',
                        render: (val) => `₹${Number(val).toFixed(2)}`,
                      },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button
                onClick={() => handleExpenseSubmit('draft')}
                loading={expenseSaving}
                className="rounded-lg text-[13px]"
              >
                Save as draft
              </Button>

              <Button
                type="primary"
                onClick={() => handleExpenseSubmit('applied')}
                loading={expenseSaving}
                className="bg-[#16A36A] rounded-lg hover:bg-[#128A59] text-[13px] font-semibold"
              >
                Save & apply to profit
              </Button>
            </div>
          </Form>
        </div>
      </section>

      {/* ================= 4. ADDED EXPENSES ================= */}
      <section className="px-5 xl:px-[15px] pb-[30px]">
        <div className="bg-white border border-[#E8EAED] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-4 lg:flex-col lg:items-start lg:gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1F2937] m-0">4. Added Expenses</h3>

              <p className="text-[12px] text-[#6B7280] m-0">Manage active and drafted operational costs.</p>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={selectedMarketplace}
                onChange={setSelectedMarketplace}
                className="
      w-[120px]
      [&_.ant-select-selector]:!h-[30px]
      [&_.ant-select-selector]:!rounded-[6px]
      [&_.ant-select-selector]:!border-[#D9E0E7]
      [&_.ant-select-selector]:!px-[10px]
      [&_.ant-select-selection-item]:!text-[10px]
      [&_.ant-select-selection-item]:!text-[#374151]
      [&_.ant-select-selection-item]:!leading-[28px]
    "
                suffixIcon={<DownOutlined className="text-[9px] text-[#64748B]" />}
              >
                <Select.Option value="all">All marketplaces</Select.Option>

                {connectedMarketplaces.map((market) => (
                  <Select.Option key={market.id} value={market.name}>
                    {market.name}
                  </Select.Option>
                ))}
              </Select>
              <DatePicker
                picker="month"
                value={dayjs(selectedMonth)}
                onChange={(date, dateString) => setSelectedMonth(dateString)}
                className="
    w-[110px]
    !h-[30px]
    !rounded-[6px]
    !border-[#D9E0E7]
    !px-[10px]
    [&_.ant-picker-input>input]:!text-[10px]
    [&_.ant-picker-input>input]:!text-[#374151]
    [&_.ant-picker-input>input]:!leading-[28px]
    [&_.ant-picker-suffix]:!text-[9px]
  "
              />
            </div>
          </div>

          {/* TABLE */}
          <Table
            loading={expenseLoading}
            dataSource={expenses}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Expense',
                dataIndex: 'expense_name',
                ellipsis: true,
                render: (text, record) => (
                  <div className="flex items-center gap-2 font-medium text-[#1F2937]">
                    <span>{text}</span>

                    {record.repeat_monthly && <Tag color="purple">Monthly</Tag>}
                  </div>
                ),
              },

              {
                title: 'Marketplace',
                dataIndex: 'marketplace',
                ellipsis: true,
                render: (value) => <Tag color="blue">{value}</Tag>,
              },

              {
                title: 'Cost Value',
                dataIndex: 'cost_value',
                ellipsis: true,
                render: (value) => `₹${Number(value).toLocaleString()}`,
              },

              {
                title: 'Cost Type',
                dataIndex: 'cost_type',
                ellipsis: true,
                render: (value) => <Tag color={value === 'per_sku' ? 'orange' : 'cyan'}>{value?.toUpperCase()}</Tag>,
              },

              {
                title: 'Duration',
                key: 'duration',
                ellipsis: true,
                render: (_, record) =>
                  record.start_date && record.end_date ? `${record.start_date} – ${record.end_date}` : 'Not set',
              },

              {
                title: 'Applied To',
                dataIndex: 'applied_to_count',
                ellipsis: true,
              },

              {
                title: 'Effective Rate',
                dataIndex: 'effective_rate',
                ellipsis: true,
              },

              {
                title: 'Status',
                dataIndex: 'status',
                render: (value) => {
                  if (value === 'applied') {
                    return (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        Applied
                      </Tag>
                    );
                  }

                  if (value === 'recalculating') {
                    return (
                      <Tag icon={<SyncOutlined spin />} color="processing">
                        Recalculating
                      </Tag>
                    );
                  }

                  return <Tag color="default">Draft</Tag>;
                },
              },

              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <div className="flex items-center gap-2">
                    <Button type="text" icon={<EyeOutlined />} size="small" />

                    <Button type="text" icon={<EditOutlined />} size="small" />

                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => {
                        setExpenseToDelete(record);
                        setExpenseDeleteModal(true);
                      }}
                    />
                  </div>
                ),
              },
            ]}
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-[6px]
  "
          />
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
      {/* ================= EXPENSE DELETE MODAL ================= */}
      <Modal open={expenseDeleteModal} onCancel={() => setExpenseDeleteModal(false)} footer={null} centered>
        <div className="flex items-start gap-3 mb-3">
          <ExclamationCircleOutlined className="text-[22px] text-[#EF4444] mt-1" />

          <div>
            <h3 className="text-[16px] font-semibold m-0">Confirm Expense Deletion</h3>

            <p className="text-[13px] text-[#6B7280] mt-1">
              Are you sure you want to delete <strong>{expenseToDelete?.expense_name}</strong>? This action will remove
              it from future profit calculations.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setExpenseDeleteModal(false)}>Cancel</Button>

          <Button type="primary" danger onClick={handleDeleteExpense}>
            Delete Expense
          </Button>
        </div>
      </Modal>
      {/* =========================================================
          DELETE MODAL
      ========================================================== */}
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
