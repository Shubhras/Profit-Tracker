import React, { useEffect, useRef, useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import {
  UploadOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../components/page-headers/page-headers';

export default function FinanceConfiguration() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [percentage, setPercentage] = useState('');
  const currentValue = 12;

  const [savedPercentage, setSavedPercentage] = useState(null);

  const [uploadModal, setUploadModal] = useState(false);
  const [recalculateModal, setRecalculateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  /*
   * Existing header actions are kept so that
   * other parts of the application can still
   * trigger upload / recalculate actions.
   */
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'upload') {
        setUploadModal(true);
      }

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

  /*
   * Save percentage configuration
   */
  const handleSavePercentage = () => {
    if (!percentage) {
      message.warning('Please enter a percentage.');
      return;
    }

    const value = Number(percentage);

    if (value < 0 || value > 100) {
      message.warning('Percentage must be between 0 and 100.');
      return;
    }

    setSavedPercentage(value);
    setIsModalOpen(false);
    setPercentage('');

    message.success('Configuration updated successfully.');
  };

  return (
    <>
      {/* =========================================================
          PAGE HEADER
      ========================================================== */}
      <div className="px-5 xl:px-[15px] pt-2 pb-5">
        <div className="flex items-start justify-between gap-6 lg:flex-col">
          {/* LEFT SIDE */}
          <div>
            <PageHeader title="Upload Marketplace Reports" className="p-0 bg-transparent" />

            <p className="text-[13px] text-[#6B7280] mt-[-8px] max-w-[540px] leading-[20px]">
              Upload your marketplace reports to add sales, fees, transactions and other data to your TrackMyProfit
              dashboard.
            </p>
          </div>

          {/* =====================================================
              HOW IT WORKS CARD
          ====================================================== */}
          <div
            className="
              w-[410px]
              min-h-[92px]
              bg-white
              border border-[#E8EAED]
              rounded-[8px]
              px-4
              py-3
              flex
              items-start
              gap-3
              shadow-[0_1px_3px_rgba(0,0,0,0.04)]
              lg:w-full
            "
          >
            {/* ICON */}
            <div
              className="
                w-[38px]
                h-[38px]
                rounded-full
                bg-[#ECFDF5]
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <QuestionCircleOutlined className="text-[19px] text-[#22C55E]" />
            </div>

            {/* CONTENT */}
            <div>
              <h3 className="text-[13px] font-semibold text-[#1F2937] mb-[3px]">How it works?</h3>

              <p className="text-[12px] text-[#6B7280] leading-[18px] mb-[2px]">
                Update your finance settings → We apply the configuration → It appears in your profit calculations.
              </p>

              <button
                type="button"
                className="
                  text-[12px]
                  text-[#1683D8]
                  font-medium
                  flex
                  items-center
                  gap-1
                  hover:text-[#0F6FB8]
                "
              >
                View Guide
                <span className="text-[14px]">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}
      <main className="px-5 xl:px-[15px] pb-[30px]">
        <div
          className="
            bg-white
            border border-[#E8EAED]
            rounded-[8px]
            shadow-[0_1px_3px_rgba(0,0,0,0.03)]
            overflow-hidden
          "
        >
          <div className="px-4 pt-4 pb-4">
            {/* ================= SECTION TITLE ================= */}
            <div className="mb-4">
              <h3 className="text-[15px] font-semibold text-[#1F2937]">1. Upload New Report</h3>
            </div>

            <div className="grid grid-cols-[180px_190px_1fr] gap-5 items-start">
              <div>
                <label className="block text-[10px] font-medium text-[#374151] mb-[6px]">Min. Claim %</label>

                <div
                  className="
          h-[34px]
          w-full
          border
          border-[#D9DDE3]
          rounded-[5px]
          bg-white
          flex
          items-center
          overflow-hidden
          transition-all
          hover:border-[#35B77B]
          focus-within:border-[#35B77B]
        "
                >
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Enter percentage"
                    value={savedPercentage !== null ? savedPercentage : percentage}
                    onChange={(e) => {
                      setSavedPercentage(null);
                      setPercentage(e.target.value);
                    }}
                    bordered={false}
                    className="
            !h-full
            !px-2.5
            !text-[11px]
            !shadow-none
            flex-1
          "
                  />

                  <div
                    className="
            h-full
            px-2.5
            bg-[#F8FAFB]
            border-l
            border-[#E5E7EB]
            flex
            items-center
            justify-center
            text-[10px]
            text-[#6B7280]
          "
                  >
                    %
                  </div>
                </div>

                <div className="mt-[5px] flex items-center justify-between">
                  <span className="text-[9px] text-[#9CA3AF]">Current: {currentValue}%</span>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="
            text-[9px]
            text-[#1683D8]
            font-medium
            hover:underline
          "
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* =====================================================
        REPORT TYPE / CONFIGURATION
        Kept as compact information field so existing
        finance configuration functionality remains intact.
    ====================================================== */}
              <div>
                <label className="block text-[10px] font-medium text-[#374151] mb-[6px]">Configuration Type</label>

                <div
                  className="
          h-[34px]
          w-full
          border
          border-[#D9DDE3]
          rounded-[5px]
          bg-white
          flex
          items-center
          px-2.5
        "
                >
                  <div
                    className="
            w-[20px]
            h-[20px]
            rounded-[4px]
            bg-[#F1EAFE]
            flex
            items-center
            justify-center
            mr-2
          "
                  >
                    <FileTextOutlined className="text-[11px] text-[#8B5CF6]" />
                  </div>

                  <span className="text-[10px] text-[#4B5563] truncate">Finance Configuration</span>
                </div>

                <div className="mt-[5px]">
                  <span className="text-[9px] text-[#9CA3AF]">Supported finance report</span>
                </div>
              </div>

              {/* =====================================================
        UPLOAD FILE
    ====================================================== */}
              <div>
                <label className="block text-[10px] font-medium text-[#374151] mb-[6px]">Upload File</label>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="
          h-[114px]
          w-full
          border
          border-[#D9DDE3]
          rounded-[5px]
          bg-white
          flex
          flex-col
          items-center
          justify-center
          text-center
          transition-all
          hover:border-[#35B77B]
        "
                >
                  {/* UPLOAD ICON */}
                  <div className="mb-[3px]">
                    <CloudUploadOutlined className="text-[28px] text-[#35B77B]" />
                  </div>

                  {/* DRAG TEXT */}
                  <p className="text-[10px] text-[#6B7280] mb-[2px]">Drag & drop your file here</p>

                  <p className="text-[9px] text-[#9CA3AF] mb-[5px]">or</p>

                  {/* FILE INPUT */}
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
                    className="
            h-[27px]
            px-3.5
            border
            border-[#35B77B]
            rounded-[4px]
            bg-white
            text-[#35B77B]
            text-[10px]
            font-semibold
            hover:bg-[#ECFDF5]
            transition-all
          "
                  >
                    Browse File
                  </button>

                  {/* FILE INFO */}
                  <p className="text-[8px] text-[#9CA3AF] mt-[5px]">
                    Supports .csv, .xlsx, .xls
                    <span className="mx-1">|</span>
                    Max file size 25MB
                  </p>
                </div>

                {/* SELECTED FILE */}
                {selectedFile && (
                  <div
                    className="
            mt-1.5
            px-2.5
            py-1.5
            rounded-[4px]
            bg-[#F0FDF4]
            border
            border-[#BBF7D0]
            flex
            items-center
            justify-between
          "
                  >
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
                      className="
              text-[#9CA3AF]
              hover:text-[#EF4444]
              transition-colors
            "
                    >
                      <CloseOutlined className="text-[9px]" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* =========================================================
      BOTTOM INFO + ACTION
  ========================================================= */}
            <div
              className="
      mt-3
      pt-3
      border-t
      border-[#F0F1F3]
      flex
      items-center
      justify-between
      gap-4
    "
            >
              {/* INFO */}
              <div className="flex items-center gap-1.5 min-w-0">
                <ExclamationCircleOutlined className="text-[12px] text-[#6B7280]" />

                <span className="text-[9px] text-[#4B5563]">Make sure your file is in the correct format.</span>

                <button
                  type="button"
                  className="
          text-[9px]
          text-[#1683D8]
          font-medium
          hover:underline
          whitespace-nowrap
        "
                >
                  View format guide
                </button>
              </div>

              {/* UPLOAD BUTTON */}
              <button
                type="button"
                onClick={handleUpload}
                className="
        h-[31px]
        px-4
        rounded-[5px]
        bg-[#16A36A]
        hover:bg-[#128A59]
        text-white
        text-[10px]
        font-semibold
        flex
        items-center
        gap-1.5
        shadow-[0_2px_5px_rgba(22,163,106,0.18)]
        transition-all
        whitespace-nowrap
      "
              >
                <UploadOutlined className="text-[11px]" />
                Upload & Process
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* =========================================================
          CHANGE CONFIGURATION MODAL
      ========================================================== */}
      <Modal
        title="Change Configuration Settings"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSavePercentage}
        okText="Submit"
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm">Min. Claim % to consider as Unsellable in profit</label>

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="Enter percentage"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="px-3 py-1 outline-none w-[160px]"
              />

              <div className="bg-gray-100 text-black px-2 py-1 text-sm">%</div>
            </div>

            <span className="text-gray-500 text-sm">Current: {currentValue}%</span>
          </div>
        </div>
      </Modal>

      {/* =========================================================
          UPLOAD MODAL
      ========================================================== */}
      <Modal
        open={uploadModal}
        onCancel={() => setUploadModal(false)}
        footer={null}
        centered
        width={500}
        closeIcon={
          <CloseOutlined
            style={{
              fontSize: '16px',
              color: '#6b7280',
            }}
          />
        }
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[16px] font-semibold">File Upload</h3>

          <a href="#" className="text-blue-600 text-sm underline" onClick={(e) => e.preventDefault()}>
            Upload Sample File
          </a>
        </div>

        <input
          type="file"
          id="expenseFileInput"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              console.log(file);
              setSelectedFile(file);
            }
          }}
        />

        <Button
          type="primary"
          onClick={() => document.getElementById('expenseFileInput')?.click()}
          className="mb-3 flex items-center gap-2 text-white border-none font-semibold"
        >
          <UploadOutlined
            style={{
              color: '#fff',
              fontSize: '16px',
            }}
          />
          Expense Upload
        </Button>

        <p className="text-blue-600 text-sm italic mb-4">
          Once you have updated all settings, click the “Recalculate Expense” button to apply changes older than last
          month. Otherwise, the updates will be applied automatically the next morning.
        </p>

        <div className="flex justify-end gap-2">
          <Button onClick={() => setUploadModal(false)}>Cancel</Button>

          <Button
            type="primary"
            onClick={() => {
              setUploadModal(false);
              message.success('File submitted successfully.');
            }}
          >
            Submit
          </Button>
        </div>
      </Modal>

      {/* =========================================================
          RECALCULATE MODAL
      ========================================================== */}
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
