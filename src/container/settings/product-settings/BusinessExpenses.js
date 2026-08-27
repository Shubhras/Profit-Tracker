import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, DatePicker, Form, Input, InputNumber, message, Modal, Select, Switch, Table, Tag } from 'antd';
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { getChannels } from '../../../redux/Settings/actionCreator';
import { DataService } from '../../../config/dataService/dataService';

const { Option } = Select;
const { RangePicker } = DatePicker;

export default function BusinessExpenses() {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));

  // Form State
  const [costType, setCostType] = useState('per_sku');
  const [splitMode, setSplitMode] = useState('equally');
  const [repeatMonthly, setRepeatMonthly] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Modals
  const [deleteModal, setDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Fetch Expenses via DataService
  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const params = { month: selectedMonth };
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

  // Handle Form Submission via DataService
  const handleSubmit = async (statusType = 'applied') => {
    try {
      const values = await form.validateFields();
      setSaving(true);

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
        message.success(`Expense ${statusType === 'draft' ? 'saved as draft' : 'applied successfully'}!`);
        form.resetFields();
        setShowPreview(false);
        setPreviewData([]);
        fetchExpenses();
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      message.error('Failed to save expense. Please check your inputs.');
    } finally {
      setSaving(false);
    }
  };

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
    setCostType(type);
    if (showPreview) {
      handleGeneratePreview(type, splitMode);
    }
  };

  // Change Split Mode & refresh preview if open
  const handleSplitModeChange = (mode) => {
    setSplitMode(mode);
    if (showPreview) {
      handleGeneratePreview(costType, mode);
    }
  };

  // Delete Expense via DataService
  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    try {
      await DataService.delete(`/amazon/other-expenses/${expenseToDelete.id}/`);
      message.success('Expense deleted successfully.');
      setDeleteModal(false);
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
      message.error('Failed to delete expense.');
    }
  };

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
        {/* ================= 1. ADD EXPENSE FORM ================= */}
        <div className="bg-white border border-[#E8EAED] rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden mb-6 p-5">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <h3 className="text-[15px] font-semibold text-[#1F2937] m-0">1. Add Expense</h3>
            <span className="text-[12px] text-[#1683D8] font-medium cursor-pointer hover:underline">
              ⚡ Bulk upload (.xlsx)
            </span>
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
                initialValue={connectedMarketplaces[0]?.name || 'Amazon'}
              >
                <Select className="h-[36px]">
                  {connectedMarketplaces.map((market) => (
                    <Option key={market.id} value={market.name}>
                      {market.name}
                    </Option>
                  ))}
                  <Option value="All">All Connected Marketplaces</Option>
                </Select>
              </Form.Item>

              {/* Cost Value */}
              <Form.Item
                name="cost_value"
                label={<span className="text-[12px] font-medium text-[#374151]">Cost Value (₹)</span>}
                rules={[{ required: true, message: 'Cost value is required' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="10000"
                  className="w-full h-[36px] flex items-center"
                  formatter={(val) => (val ? `₹ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                  parser={(val) => val.replace(/₹\s?|(,*)/g, '')}
                />
              </Form.Item>

              {/* Duration */}
              <Form.Item
                name="date_range"
                label={<span className="text-[12px] font-medium text-[#374151]">Duration</span>}
              >
                <RangePicker className="w-full h-[36px]" />
              </Form.Item>
            </div>

            {/* COST TYPE SELECTION CARDS */}
            <div className="mt-2 mb-4">
              <label className="block text-[12px] font-medium text-[#374151] mb-2">Cost Type</label>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                {/* PER SKU CARD */}
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

                  {/* SUB-OPTION SPLIT MODE */}
                  {costType === 'per_sku' && (
                    <div className="mt-3 pl-5 border-t pt-2">
                      <label className="block text-[11px] text-[#4B5563] mb-1 font-medium">Split the lump sum:</label>
                      <Select
                        value={splitMode}
                        onChange={(val) => handleSplitModeChange(val)}
                        className="w-[200px] h-[32px]"
                      >
                        <Option value="equally">Equally across SKUs</Option>
                        <Option value="net_sales">By net sales</Option>
                        <Option value="units_sold">By units sold</Option>
                      </Select>
                    </div>
                  )}
                </button>

                {/* PER ORDER CARD */}
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
              <Button onClick={() => handleSubmit('draft')} loading={saving}>
                Save as draft
              </Button>
              <Button
                type="primary"
                onClick={() => handleSubmit('applied')}
                loading={saving}
                className="bg-[#16A36A] hover:bg-[#128A59]"
              >
                Save & apply to profit
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
                {connectedMarketplaces.map((market) => (
                  <Option key={market.id} value={market.name}>
                    {market.name}
                  </Option>
                ))}
              </Select>

              <DatePicker
                picker="month"
                value={dayjs(selectedMonth)}
                onChange={(date, dateString) => setSelectedMonth(dateString)}
                className="h-[34px]"
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
                render: (val) => <Tag color={val === 'per_sku' ? 'orange' : 'cyan'}>{val.toUpperCase()}</Tag>,
              },
              {
                title: 'Duration',
                key: 'duration',
                render: (_, record) =>
                  record.start_date && record.end_date ? `${record.start_date} – ${record.end_date}` : 'Not set',
              },
              {
                title: 'Applied To',
                dataIndex: 'applied_to_count',
                key: 'applied_to_count',
              },
              {
                title: 'Effective Rate',
                dataIndex: 'effective_rate',
                key: 'effective_rate',
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
                    <Button type="text" icon={<EyeOutlined />} size="small" />
                    <Button type="text" icon={<EditOutlined />} size="small" />
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => {
                        setExpenseToDelete(record);
                        setDeleteModal(true);
                      }}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </main>

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
    </>
  );
}
