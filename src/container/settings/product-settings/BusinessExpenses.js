import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Switch,
  Table,
  Tag,
  Upload,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { getChannels } from '../../../redux/Settings/actionCreator';
import { DataService } from '../../../config/dataService/dataService';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function BusinessExpenses() {
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.auth.profile);
  const connectedChannels = profile?.connected_channels || [];
  const [form] = Form.useForm();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Redux Channels
  const channels = useSelector((state) => state.settings.channels);

  useEffect(() => {
    dispatch(getChannels());
  }, [dispatch]);

  // Compute Connected Marketplaces Only
  const connectedMarketplaces = useMemo(() => {
    const marketplaceData = Array.isArray(channels) ? channels : [];
    const connected = marketplaceData.filter((market) => market.status === 'connected');

    if (connected.length === 0) {
      return [{ id: 'Amazon', name: 'Amazon' }];
    }

    return connected.map((market) => ({
      id: market.id || market.name,
      name: market.name || market.id,
    }));
  }, [channels]);

  // Filters
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(null);

  // Form & Editing State
  const [editingExpense, setEditingExpense] = useState(null);
  const [costType, setCostType] = useState('per_sku');
  const [splitMode, setSplitMode] = useState('equally');
  const [repeatMonthly, setRepeatMonthly] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Modals
  const [deleteModal, setDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const [viewModal, setViewModal] = useState(false);
  const [expenseToView, setExpenseToView] = useState(null);

  const [allExpenses, setAllExpenses] = useState([]);

  // Fetch Expenses via DataService
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      // 1. Fetch ALL expenses for cost_type locking check across all months
      const allResponse = await DataService.get('/amazon/other-expenses/');
      if (allResponse.data) {
        if (Array.isArray(allResponse.data.results)) {
          setAllExpenses(allResponse.data.results);
        } else if (Array.isArray(allResponse.data)) {
          setAllExpenses(allResponse.data);
        }
      }

      // 2. Fetch filtered expenses for table display
      const params = {};
      if (selectedMonth) {
        params.month = selectedMonth;
      }
      if (selectedMarketplace !== 'all') {
        params.marketplace = selectedMarketplace;
      }
      const response = await DataService.get('/amazon/other-expenses/', { params });
      if (response.data) {
        if (Array.isArray(response.data.results)) {
          setExpenses(response.data.results);
        } else if (Array.isArray(response.data)) {
          setExpenses(response.data);
        }
      }
    } catch (err) {
      console.error('Error fetching business expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedMarketplace, selectedMonth]);

  // Handle Excel Upload for Business Expenses
  const handleUploadExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await DataService.post('/amazon/other-expenses/upload-excel/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.success) {
        message.success(response.data.message || 'Business expenses imported successfully!');
        fetchExpenses();
        setUploadModalOpen(false);
      } else {
        message.error(response.data?.message || 'Failed to import business expenses.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      message.error(err.response?.data?.message || 'Failed to upload Excel file.');
    } finally {
      setUploading(false);
    }
  };

  // Handle Download Sample Template for Business Expenses
  const handleDownloadSample = async () => {
    try {
      const response = await DataService.get('/amazon/other-expenses/download-sample/', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Business_Expenses_Sample_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Sample template downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      message.error('Failed to download sample template.');
    }
  };

  // Handle Edit Click
  const handleEditClick = (record) => {
    setEditingExpense(record);
    const initialDates =
      record.start_date && record.end_date ? [moment(record.start_date), moment(record.end_date)] : null;

    form.setFieldsValue({
      expense_name: record.expense_name,
      marketplace: record.marketplace || connectedMarketplaces[0]?.name || 'Amazon',
      cost_value: record.cost_value,
      date_range: initialDates,
    });
    setCostType(record.cost_type || 'per_sku');
    setSplitMode(record.split_lump_sum_by || 'equally');
    setRepeatMonthly(Boolean(record.repeat_monthly));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingExpense(null);
    form.resetFields();
    setCostType('per_sku');
    setSplitMode('equally');
    setRepeatMonthly(false);
    setShowPreview(false);
    setPreviewData([]);
  };

  // Handle View Details Click
  const handleViewClick = (record) => {
    setExpenseToView(record);
    setViewModal(true);
  };

  // Handle Form Submission (Create / Update) via DataService
  const handleSubmit = async (statusType = 'applied') => {
    try {
      const values = await form.validateFields();
      if (!costType) {
        message.warning('Please select a Cost Type.');
        return;
      }
      setSaving(true);

      const payload = {
        expense_name: values.expense_name,
        marketplace: values.marketplace || connectedMarketplaces[0]?.name || 'Amazon',
        cost_value: values.cost_value,
        start_date: values.date_range && values.date_range[0] ? values.date_range[0].format('YYYY-MM-DD') : null,
        end_date: values.date_range && values.date_range[1] ? values.date_range[1].format('YYYY-MM-DD') : null,
        cost_type: costType,
        split_lump_sum_by: splitMode,
        repeat_monthly: repeatMonthly,
        status: statusType,
      };

      let response;
      if (editingExpense) {
        response = await DataService.put(`/amazon/other-expenses/${editingExpense.id}/`, payload);
      } else {
        response = await DataService.post('/amazon/other-expenses/', payload);
      }

      if (response.data && (response.data.success || response.data.id || response.data.data)) {
        message.success(
          editingExpense
            ? 'Expense updated successfully!'
            : `Expense ${statusType === 'draft' ? 'saved as draft' : 'applied successfully'}!`,
        );
        handleCancelEdit();
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      if (err.errorFields && err.errorFields.length > 0) {
        message.warning('Please fill in all required fields.');
      } else if (err.response?.data?.errors?.cost_type) {
        const costTypeErr = Array.isArray(err.response.data.errors.cost_type)
          ? err.response.data.errors.cost_type[0]
          : err.response.data.errors.cost_type;
        message.error(costTypeErr);
      } else if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error('Failed to save expense. Please check your inputs.');
      }
    } finally {
      setSaving(false);
    }
  };

  // Selected marketplace in the Form
  const formMarketplace = Form.useWatch('marketplace', form) || connectedMarketplaces[0]?.name || 'Amazon';

  const normalizeMarketplace = (mkt) => {
    if (!mkt) return 'all';
    const s = String(mkt).trim().toLowerCase();
    if (s.includes('amazon')) return 'amazon';
    if (s.includes('myntra')) return 'myntra';
    if (s.includes('flipkart')) return 'flipkart';
    if (s === 'all' || s === 'all connected marketplaces') return 'all';
    return s.replace(/[-_ ]/g, '');
  };

  // Check if cost_type is locked for the selected formMarketplace across ALL user expenses
  const lockedCostTypeInfo = useMemo(() => {
    if (!formMarketplace || !Array.isArray(allExpenses)) return null;

    const targetNorm = normalizeMarketplace(formMarketplace);
    const existing = allExpenses.filter((e) => {
      if (editingExpense && e.id === editingExpense.id) return false;
      const eNorm = normalizeMarketplace(e.marketplace);
      if (targetNorm === 'all' || eNorm === 'all') return true;
      return eNorm === targetNorm;
    });

    if (existing.length > 0) {
      const firstType = existing[0].cost_type;
      return {
        isLocked: true,
        costType: firstType,
        marketplace: formMarketplace,
        existingName: existing[0].expense_name,
      };
    }
    return { isLocked: false, costType: null };
  }, [formMarketplace, allExpenses, editingExpense]);

  // Sync costType state whenever lockedCostTypeInfo changes
  useEffect(() => {
    if (lockedCostTypeInfo?.isLocked && lockedCostTypeInfo.costType) {
      setCostType(lockedCostTypeInfo.costType);
    }
  }, [lockedCostTypeInfo]);

  // Generate Live Preview Breakdown via DataService
  const handleGeneratePreview = async (overrideCostType = costType, overrideSplitMode = splitMode) => {
    const costValue = form.getFieldValue('cost_value');
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
      if (response.data && response.data.preview) {
        setPreviewData(response.data.preview);
      }
    } catch (err) {
      console.error('Error fetching preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Toggle Preview visibility
  const togglePreview = () => {
    if (showPreview) {
      setShowPreview(false);
    } else {
      handleGeneratePreview();
    }
  };

  // Change Cost Type & refresh preview if open
  const handleCostTypeChange = (type) => {
    if (lockedCostTypeInfo?.isLocked && lockedCostTypeInfo.costType !== type) {
      const lockedDisplay = lockedCostTypeInfo.costType === 'per_sku' ? 'Per SKU' : 'Per Order';
      message.warning(
        `Cost type for ${lockedCostTypeInfo.marketplace} is locked to ${lockedDisplay} based on existing expenses.`,
      );
      return;
    }
    setCostType(type);
    if (showPreview) {
      handleGeneratePreview(type, splitMode);
    }
  };

  // Delete Expense via DataService
  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      await DataService.delete(`/amazon/other-expenses/${expenseToDelete.id}/`);
      message.success('Expense deleted successfully.');
      setDeleteModal(false);
      if (editingExpense && editingExpense.id === expenseToDelete.id) {
        handleCancelEdit();
      }
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      message.error('Failed to delete expense.');
    }
  };

  const selectedMonthMoment = useMemo(() => {
    if (!selectedMonth) return null;
    const parsed = moment(selectedMonth, 'YYYY-MM');
    return parsed.isValid() ? parsed : null;
  }, [selectedMonth]);

  return (
    <>
      {/* PAGE HEADER */}
      <div className="px-5 xl:px-[15px] pt-2 pb-5">
        <div className="flex items-start justify-between gap-6 lg:flex-col lg:gap-4">
          <div>
            <PageHeader title="Business Expenses" className="p-0 bg-transparent" />
            <p className="text-[13px] text-[#6B7280] mt-[-8px] max-w-[600px] leading-[20px]">
              Add the costs that never show up in a marketplace report — storage, packaging, manpower, software, agency
              fees. TrackMyProfit spreads each one across your SKUs or orders so your profit reflects what you actually
              spent.
            </p>
          </div>

          <div className="w-[450px] bg-white border border-[#E8EAED] rounded-[8px] px-4 py-3 flex items-start gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:w-full">
            <div className="w-[36px] h-[36px] rounded-full bg-[#ECFDF5] flex items-center justify-center shrink-0">
              <QuestionCircleOutlined className="text-[18px] text-[#22C55E]" />
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[#1F2937] mb-[2px]">How it works?</h3>
              <p className="text-[12px] text-[#6B7280] leading-[17px] mb-1">
                Add an expense → Choose Per SKU or Per order → We spread it over the duration → It shows as Other
                Expense in your profit.
              </p>
            </div>
          </div>
        </div>

        {/* INFO NOTICE BANNER */}
        <div className="mt-4 p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-[6px] flex items-center gap-2 text-[12px] text-[#0369A1]">
          <InfoCircleOutlined className="text-[14px] shrink-0" />
          <span>
            Fees the marketplace already bills you per order — commission, shipping, RTO — come in through your uploaded
            reports. Add them under Finance Configuration → Upload Marketplace Reports, not here.
          </span>
        </div>
      </div>

      <main className="px-5 xl:px-[15px] pb-[30px]">
        {/* ================= 1. ADD / EDIT EXPENSE FORM ================= */}
        <div className="bg-white border border-[#E8EAED] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden mb-6 p-5">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-[15px] font-semibold text-[#1F2937] m-0">
                {editingExpense ? `1. Edit Expense: ${editingExpense.expense_name}` : '1. Add Expense'}
              </h3>
              {editingExpense && (
                <Tag color="warning" className="m-0">
                  Editing Mode
                </Tag>
              )}
            </div>
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="text-[12px] text-[#1683D8] font-medium cursor-pointer hover:underline bg-transparent border-none p-0"
            >
              ⚡ Bulk upload (.xlsx)
            </button>
          </div>

          <Form form={form} layout="vertical">
            <div className="grid grid-cols-4 gap-4 lg:grid-cols-2 md:grid-cols-1">
              {/* Expense Name */}
              <Form.Item
                name="expense_name"
                label={<span className="text-[12px] font-medium text-[#374151]">Expense Name</span>}
                rules={[{ required: true, message: 'Expense name is required' }]}
              >
                <Input placeholder="e.g. Storage fees, Packaging" className="h-[36px]" />
              </Form.Item>

              {/* Select Marketplace */}
              <Form.Item
                name="marketplace"
                label={<span className="text-[12px] font-medium text-[#374151]">Select Marketplace</span>}
                rules={[{ required: true, message: 'Please select a marketplace' }]}
                initialValue={connectedMarketplaces[0]?.name || 'Amazon'}
              >
                <Select className="h-[36px]" placeholder="Select Marketplace">
                  {connectedChannels.map((channel) => (
                    <Option key={channel} value={channel}>
                      {channel}
                    </Option>
                  ))}
                  {/* <Option value="All">All Connected Marketplaces</Option> */}
                </Select>
              </Form.Item>

              {/* Cost Value */}
              <Form.Item
                name="cost_value"
                label={<span className="text-[12px] font-medium text-[#374151]">Cost Value (₹)</span>}
                rules={[
                  { required: true, message: 'Cost value is required' },
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === '') {
                        return Promise.reject(new Error('Cost value is required'));
                      }
                      const num = Number(value);
                      if (Number.isNaN(num) || num <= 0) {
                        return Promise.reject(new Error('Please enter a valid price amount greater than 0'));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  placeholder="10000"
                  className="w-full h-[36px] flex items-center"
                  formatter={(val) => (val ? `₹ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                  parser={(val) => {
                    if (!val) return '';
                    return val.replace(/[^0-9.]/g, '');
                  }}
                />
              </Form.Item>

              {/* Duration */}
              <Form.Item
                name="date_range"
                label={<span className="text-[12px] font-medium text-[#374151]">Duration</span>}
                rules={[{ required: true, message: 'Duration is required' }]}
              >
                <RangePicker className="w-full h-[36px]" />
              </Form.Item>
            </div>

            {/* COST TYPE SELECTION CARDS */}
            <div className="mt-2 mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[12px] font-medium text-[#374151]">
                  <span className="text-[#ff4d4f] mr-1 text-[14px] leading-none">*</span>
                  Cost Type
                </label>
                {lockedCostTypeInfo?.isLocked && (
                  <Tag color="blue" className="m-0 text-[11px]">
                    🔒 Locked to {lockedCostTypeInfo.costType === 'per_sku' ? 'Per SKU' : 'Per Order'} for{' '}
                    {formMarketplace}
                  </Tag>
                )}
              </div>

              {lockedCostTypeInfo?.isLocked && (
                <div className="mb-3 p-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[6px] flex items-center gap-2 text-[12px] text-[#1E40AF]">
                  <InfoCircleOutlined className="text-[#3B82F6]" />
                  <span>
                    Cost Type for <strong>{formMarketplace}</strong> is locked to{' '}
                    <strong>{lockedCostTypeInfo.costType === 'per_sku' ? 'Per SKU' : 'Per Order'}</strong> based on your
                    existing expenses for this marketplace.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                {/* PER SKU CARD */}
                <button
                  type="button"
                  disabled={lockedCostTypeInfo?.isLocked && lockedCostTypeInfo.costType !== 'per_sku'}
                  onClick={() => handleCostTypeChange('per_sku')}
                  className={`text-left w-full p-3.5 rounded-[8px] border transition-all ${
                    costType === 'per_sku'
                      ? 'border-[#22C55E] bg-[#F0FDF4] shadow-[0_0_0_1px_#22C55E]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#CBD5E1]'
                  } ${
                    lockedCostTypeInfo?.isLocked && lockedCostTypeInfo.costType !== 'per_sku'
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-[13px] text-[#1F2937] mb-1">
                    <input
                      type="radio"
                      disabled={lockedCostTypeInfo?.isLocked && lockedCostTypeInfo.costType !== 'per_sku'}
                      checked={costType === 'per_sku'}
                      onChange={() => handleCostTypeChange('per_sku')}
                    />
                    <span>Per SKU</span>
                  </div>
                  <p className="text-[12px] text-[#6B7280] m-0 pl-5">A fixed rate charged per SKU in the duration.</p>
                </button>

                {/* PER ORDER CARD */}
                <button
                  type="button"
                  disabled={lockedCostTypeInfo?.isLocked && lockedCostTypeInfo.costType !== 'per_order'}
                  onClick={() => handleCostTypeChange('per_order')}
                  className={`text-left w-full p-3.5 rounded-[8px] border transition-all ${
                    costType === 'per_order'
                      ? 'border-[#22C55E] bg-[#F0FDF4] shadow-[0_0_0_1px_#22C55E]'
                      : 'border-[#E5E7EB] bg-white hover:border-[#CBD5E1]'
                  } ${
                    lockedCostTypeInfo?.isLocked && lockedCostTypeInfo.costType !== 'per_order'
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-[13px] text-[#1F2937] mb-1">
                    <input
                      type="radio"
                      disabled={lockedCostTypeInfo?.isLocked && lockedCostTypeInfo.costType !== 'per_order'}
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
            </div>

            {/* REPEAT MONTHLY TOGGLE */}
            <div className="flex items-center gap-3 mb-4">
              <Switch checked={repeatMonthly} onChange={(checked) => setRepeatMonthly(checked)} />
              <span className="text-[13px] font-medium text-[#374151]">Repeat this expense every month</span>
            </div>

            {/* PREVIEW ACCORDION */}
            <div className="border border-[#E5E7EB] rounded-[6px] p-3 mb-5 bg-[#F9FAFB]">
              <div className="w-full flex items-center justify-between text-[13px] font-medium text-[#374151]">
                <span>👁️ Preview — how this hits your profit</span>
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
                      { title: 'SKU', dataIndex: 'sku', key: 'sku' },
                      { title: 'Units Sold', dataIndex: 'units_sold', key: 'units_sold' },
                      { title: 'Share', dataIndex: 'share', key: 'share' },
                      {
                        title: 'Expense Amount',
                        dataIndex: 'expense',
                        key: 'expense',
                        render: (val) => `₹${Number(val).toFixed(2)}`,
                      },
                      {
                        title: 'Per Unit',
                        dataIndex: 'per_unit',
                        key: 'per_unit',
                        render: (val) => `₹${Number(val).toFixed(2)}`,
                      },
                    ]}
                  />
                </div>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              {editingExpense && <Button onClick={handleCancelEdit}>Cancel Edit</Button>}
              <Button onClick={() => handleSubmit('draft')} loading={saving}>
                {editingExpense ? 'Update draft' : 'Save as draft'}
              </Button>
              <Button
                type="primary"
                onClick={() => handleSubmit('applied')}
                loading={saving}
                className="bg-[#16A36A] hover:bg-[#128A59]"
              >
                {editingExpense ? 'Update & apply to profit' : 'Save & apply to profit'}
              </Button>
            </div>
          </Form>
        </div>

        {/* ================= 2. ADDED EXPENSES TABLE ================= */}
        <div className="bg-white border border-[#E8EAED] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-5">
          <div className="flex items-center justify-between mb-4 lg:flex-col lg:items-start lg:gap-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[#1F2937] m-0">2. Added Expenses</h3>
              <p className="text-[12px] text-[#6B7280] m-0">Manage active and drafted operational costs.</p>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={selectedMarketplace}
                onChange={(val) => setSelectedMarketplace(val)}
                className="w-[180px] h-[34px]"
              >
                <Option value="all">All Marketplaces</Option>
                {connectedChannels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel}
                  </option>
                ))}
              </Select>

              <DatePicker
                picker="month"
                placeholder="Filter by Month"
                value={selectedMonthMoment}
                onChange={(date, dateString) => {
                  if (date && dateString) {
                    setSelectedMonth(dateString);
                  } else {
                    setSelectedMonth(null);
                  }
                }}
                className="h-[34px]"
                allowClear
              />
            </div>
          </div>

          <Table
            loading={loading}
            dataSource={expenses}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'Expense',
                dataIndex: 'expense_name',
                key: 'expense_name',
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
                key: 'marketplace',
                render: (val) => <Tag color="blue">{val}</Tag>,
              },
              {
                title: 'Cost Value',
                dataIndex: 'cost_value',
                key: 'cost_value',
                render: (val) => `₹${Number(val).toLocaleString()}`,
              },
              {
                title: 'Cost Type',
                dataIndex: 'cost_type',
                key: 'cost_type',
                render: (val) => <Tag color={val === 'per_sku' ? 'orange' : 'cyan'}>{(val || '').toUpperCase()}</Tag>,
              },
              {
                title: 'Duration',
                key: 'duration',
                render: (_, record) =>
                  record.start_date && record.end_date ? `${record.start_date} – ${record.end_date}` : 'Not set',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (val) => {
                  if (val === 'applied')
                    return (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        Applied
                      </Tag>
                    );
                  if (val === 'recalculating')
                    return (
                      <Tag icon={<SyncOutlined spin />} color="processing">
                        Recalculating
                      </Tag>
                    );
                  return <Tag color="default">Draft</Tag>;
                },
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <div className="flex items-center gap-2">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => handleViewClick(record)}
                      title="View details"
                    />
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => handleEditClick(record)}
                      title="Edit expense"
                    />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => {
                        setExpenseToDelete(record);
                        setDeleteModal(true);
                      }}
                      title="Delete expense"
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </main>

      {/* VIEW DETAILS MODAL */}
      <Modal
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setViewModal(false)}>
            Close
          </Button>,
        ]}
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-[#1683D8]" />
            <span>Expense Details</span>
          </div>
        }
        width={560}
        centered
      >
        {expenseToView && (
          <div className="py-2">
            <div className="bg-[#F9FAFB] p-4 rounded-[8px] border border-[#E5E7EB] mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[16px] font-semibold text-[#1F2937] m-0">{expenseToView.expense_name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <Tag color="blue">{expenseToView.marketplace}</Tag>
                    {expenseToView.repeat_monthly && <Tag color="purple">Monthly Recurring</Tag>}
                    {expenseToView.status === 'applied' ? (
                      <Tag icon={<CheckCircleOutlined />} color="success">
                        Applied
                      </Tag>
                    ) : expenseToView.status === 'recalculating' ? (
                      <Tag icon={<SyncOutlined spin />} color="processing">
                        Recalculating
                      </Tag>
                    ) : (
                      <Tag color="default">Draft</Tag>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#6B7280] uppercase font-medium">Cost Value</span>
                  <div className="text-[20px] font-bold text-[#16A36A]">
                    ₹{Number(expenseToView.cost_value).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="bg-white p-3 rounded-[6px] border border-[#E5E7EB]">
                <span className="text-[#6B7280] block text-[11px] font-medium uppercase mb-1">Cost Type</span>
                <span className="font-semibold text-[#1F2937]">
                  {expenseToView.cost_type === 'per_order' ? 'Per Order' : 'Per SKU'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-[6px] border border-[#E5E7EB]">
                <span className="text-[#6B7280] block text-[11px] font-medium uppercase mb-1">Duration</span>
                <span className="font-semibold text-[#1F2937]">
                  {expenseToView.start_date && expenseToView.end_date
                    ? `${expenseToView.start_date} to ${expenseToView.end_date}`
                    : 'Continuous / Unspecified'}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal open={deleteModal} onCancel={() => setDeleteModal(false)} footer={null} centered>
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
          <Button onClick={() => setDeleteModal(false)}>Cancel</Button>
          <Button type="primary" danger onClick={handleDeleteExpense}>
            Delete Expense
          </Button>
        </div>
      </Modal>

      {/* BULK UPLOAD EXCEL MODAL */}
      <Modal
        title="Bulk Upload Business Expenses"
        open={uploadModalOpen}
        onCancel={() => setUploadModalOpen(false)}
        footer={null}
        width={520}
        centered
      >
        <div className="py-2">
          <p className="text-[13px] text-[#4B5563] leading-[20px] mb-4">
            Upload an Excel (.xlsx, .xls) or CSV file containing your operational business expenses.
          </p>

          <div className="p-4 bg-[#F9FAFB] border border-dashed border-[#D1D5DB] rounded-[8px] text-center mb-4">
            <Spin spinning={uploading} tip="Parsing and importing business expenses...">
              <Upload.Dragger
                name="file"
                multiple={false}
                showUploadList={false}
                disabled={uploading}
                beforeUpload={(file) => {
                  handleUploadExcel(file);
                  return false;
                }}
                accept=".xlsx,.xls,.csv"
                className="bg-transparent border-none"
              >
                <p className="ant-upload-drag-icon text-[32px] text-[#16A34A] mb-2">
                  <UploadOutlined />
                </p>
                <p className="text-[14px] font-semibold text-[#111827] mb-1">
                  Click or drag Excel file to this area to upload
                </p>
                <p className="text-[12px] text-[#6B7280]">Supports .xlsx, .xls, and .csv files</p>
              </Upload.Dragger>
            </Spin>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadSample}
              className="border-[#16A34A] text-[#16A34A] hover:bg-[#ECFDF5] text-[13px] rounded-[6px]"
            >
              Download Sample Template
            </Button>
            <Button onClick={() => setUploadModalOpen(false)} className="rounded-[6px]">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
