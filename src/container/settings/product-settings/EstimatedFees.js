import React, { useState, useEffect, useMemo } from 'react';
import { Button, Select, Switch, Table, Modal, Input, InputNumber, Checkbox, message, Upload, Spin } from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { PageHeader } from '../../../components/page-headers/page-headers';
import { DataService } from '../../../config/dataService/dataService';

const { Option } = Select;

// Formatting helpers
const rup = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const band = (f, t) => {
  if (t === '' || t === null || t === undefined) return `Above ${rup(f)}`;
  if (f === 0 || f === '0') return `Up to ${rup(t)}`;
  return `${rup(f)} – ${rup(t)}`;
};

const INITIAL_FEES = [
  {
    id: 'comm',
    name: 'Commission',
    desc: 'Myntra calls it platform commission',
    how: 'pct-slab',
    by_cat: true,
    on: true,
    value: 0,
    groups: [
      {
        label: 'Apparel › Tops › Women',
        slabs: [
          [0, 500, 4],
          [500, 1000, 8],
          [1000, 2000, 15],
          [2000, '', 15],
        ],
      },
      {
        label: 'Apparel › Dresses › Women',
        slabs: [
          [0, 800, 4],
          [800, 2000, 15],
          [2000, '', 15],
        ],
      },
    ],
  },
  {
    id: 'fixed',
    name: 'Fixed fee',
    desc: 'Charged on each item sold',
    how: 'flat-slab',
    by_cat: true,
    on: true,
    value: 0,
    groups: [
      {
        label: 'Apparel › Tops › Women',
        slabs: [
          [0, 400, 0],
          [400, 450, 15],
          [450, 1000, 27],
          [1000, 2000, 45],
          [2000, '', 61],
        ],
      },
      {
        label: 'Apparel › Dresses › Women',
        slabs: [
          [0, 500, 0],
          [500, 600, 3],
          [600, 1000, 27],
          [1000, 2000, 45],
          [2000, '', 61],
        ],
      },
    ],
  },
  {
    id: 'ret',
    name: 'Return fee',
    desc: 'When a customer returns an order',
    how: 'flat',
    by_cat: false,
    on: true,
    value: 60,
    groups: [],
  },
  {
    id: 'mkt',
    name: 'Marketing services fee',
    desc: 'Charged on net sales value',
    how: 'pct',
    by_cat: false,
    on: true,
    value: 2,
    groups: [],
  },
  {
    id: 'ship',
    name: 'Shipping fee',
    desc: 'Not charged — logistics is in the commission',
    how: 'flat',
    by_cat: false,
    on: false,
    value: 0,
    groups: [],
  },
];

export default function EstimatedFees() {
  const [fees, setFees] = useState(INITIAL_FEES);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState('Myntra');
  const [selectedSampleItem, setSelectedSampleItem] = useState('top');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [curFee, setCurFee] = useState(null);

  // Fetch estimated fee rules from Backend API
  const fetchFeeRules = async (mp) => {
    setLoading(true);
    try {
      const response = await DataService.get(`/amazon/estimated-fee-rules/?marketplace=${mp}`);
      if (response.data && response.data.results) {
        setFees(response.data.results);
      }
    } catch (err) {
      console.error('Error fetching fee rules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeRules(selectedMarketplace);
  }, [selectedMarketplace]);

  // Handle Excel Rate Card Upload
  const handleUploadExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await DataService.post('/amazon/estimated-fee-rules/upload-excel/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data && response.data.success) {
        message.success(response.data.message || 'Fee rules imported successfully!');
        fetchFeeRules(selectedMarketplace);
      } else {
        message.error(response.data?.message || 'Failed to import rate card.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      message.error(err.response?.data?.message || 'Failed to upload Excel file.');
    } finally {
      setUploading(false);
    }
  };

  // Handle Download Sample Template
  const handleDownloadSample = async () => {
    try {
      const response = await DataService.get('/amazon/estimated-fee-rules/download-sample/', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Estimated_Fees_Sample_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Sample template downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      message.error('Failed to download sample template.');
    }
  };

  // Toggle Fee Status (On/Off) in Backend
  const toggleFeeStatus = async (index) => {
    const feeToToggle = fees[index];
    const newStatus = !feeToToggle.on;

    // Optimistic UI update
    setFees((prev) => prev.map((item, i) => (i === index ? { ...item, on: newStatus } : item)));

    if (feeToToggle.id && typeof feeToToggle.id === 'number') {
      try {
        await DataService.put(`/amazon/estimated-fee-rules/${feeToToggle.id}/`, {
          on: newStatus,
        });
      } catch (err) {
        message.error('Failed to update status on server');
        // Rollback
        setFees((prev) => prev.map((item, i) => (i === index ? { ...item, on: !newStatus } : item)));
      }
    }
  };

  // Open Modal for Create or Edit
  const openModal = (index = null) => {
    setEditingIndex(index);
    if (index === null) {
      setCurFee({
        marketplace: selectedMarketplace,
        name: 'Commission',
        desc: '',
        how: 'pct-slab',
        by_cat: false,
        on: true,
        value: 10,
        groups: [
          {
            label: 'All products',
            slabs: [
              [0, 500, 5],
              [500, 1000, 10],
              [1000, '', 15],
            ],
          },
        ],
      });
    } else {
      setCurFee(JSON.parse(JSON.stringify(fees[index])));
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurFee(null);
    setEditingIndex(null);
  };

  // Save Fee to Backend API
  const handleSaveFee = async () => {
    if (!curFee || !curFee.name) {
      message.warning('Please enter a valid fee name');
      return;
    }

    const payload = {
      marketplace: selectedMarketplace,
      name: curFee.name,
      desc: curFee.desc || '',
      how: curFee.how,
      by_cat: curFee.by_cat || false,
      on: curFee.on !== undefined ? curFee.on : true,
      value: curFee.value || 0,
      groups: curFee.groups || [],
    };

    try {
      if (editingIndex === null) {
        const response = await DataService.post('/amazon/estimated-fee-rules/', payload);
        if (response.data && response.data.data) {
          message.success(`Fee "${curFee.name}" added successfully.`);
          fetchFeeRules(selectedMarketplace);
        }
      } else {
        const targetId = curFee.id;
        if (targetId && typeof targetId === 'number') {
          await DataService.put(`/amazon/estimated-fee-rules/${targetId}/`, payload);
          message.success(`Fee "${curFee.name}" updated successfully.`);
          fetchFeeRules(selectedMarketplace);
        } else {
          setFees((prev) => prev.map((item, i) => (i === editingIndex ? curFee : item)));
          message.success(`Fee "${curFee.name}" updated locally.`);
        }
      }
    } catch (err) {
      console.error('Error saving fee:', err);
      message.error('Failed to save fee rule');
    } finally {
      closeModal();
    }
  };

  // Delete Fee with warning confirmation modal
  const confirmDeleteFee = (feeToDelete) => {
    if (!feeToDelete) return;

    Modal.confirm({
      title: 'Delete Estimated Fee',
      content: `Are you sure you want to delete "${feeToDelete.name}" for ${selectedMarketplace}? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        if (feeToDelete.id && typeof feeToDelete.id === 'number') {
          try {
            await DataService.delete(`/amazon/estimated-fee-rules/${feeToDelete.id}/`);
            message.success(`Fee "${feeToDelete.name}" deleted.`);
            fetchFeeRules(selectedMarketplace);
          } catch (err) {
            message.error('Failed to delete fee rule');
          }
        } else {
          setFees((prev) => prev.filter((item) => item !== feeToDelete && item.id !== feeToDelete.id));
          message.success(`Fee deleted.`);
        }
        closeModal();
      },
    });
  };

  // Slab & Group Modifiers for Modal
  const updateGroupLabel = (gIndex, newLabel) => {
    setCurFee((prev) => {
      const newGroups = [...prev.groups];
      newGroups[gIndex].label = newLabel;
      return { ...prev, groups: newGroups };
    });
  };

  const updateSlabValue = (gIndex, sIndex, colIndex, val) => {
    setCurFee((prev) => {
      const newGroups = [...prev.groups];
      const newSlabs = [...newGroups[gIndex].slabs];
      const slab = [...newSlabs[sIndex]];
      slab[colIndex] = val === '' ? '' : Number(val);
      newSlabs[sIndex] = slab;
      newGroups[gIndex].slabs = newSlabs;
      return { ...prev, groups: newGroups };
    });
  };

  const addSlab = (gIndex) => {
    setCurFee((prev) => {
      const newGroups = [...prev.groups];
      const { slabs } = newGroups[gIndex];
      const lastSlab = slabs[slabs.length - 1];
      const prevTo = lastSlab ? lastSlab[1] || 0 : 0;
      newGroups[gIndex].slabs = [...slabs, [prevTo, '', '']];
      return { ...prev, groups: newGroups };
    });
  };

  const deleteSlab = (gIndex, sIndex) => {
    setCurFee((prev) => {
      const newGroups = [...prev.groups];
      newGroups[gIndex].slabs = newGroups[gIndex].slabs.filter((_, i) => i !== sIndex);
      return { ...prev, groups: newGroups };
    });
  };

  const addGroup = () => {
    setCurFee((prev) => ({
      ...prev,
      groups: [...prev.groups, { label: 'New product type', slabs: [[0, '', '']] }],
    }));
  };

  const deleteGroup = (gIndex) => {
    setCurFee((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== gIndex),
    }));
  };

  // Summary builder for table row
  const getSummary = (f) => {
    const byCat = f.by_cat || f.byCat;
    if (f.how === 'pct') return { main: `${f.value}% of sale price`, sub: '' };
    if (f.how === 'flat') return { main: f.on ? `${rup(f.value)} per order` : 'Not charged', sub: '' };

    const unit = f.how === 'pct-slab' ? '%' : '';
    const allSlabs = (f.groups || []).flatMap((g) => (g.slabs || []).map((s) => Number(s[2] || 0)));
    const lo = allSlabs.length ? Math.min(...allSlabs) : 0;
    const hi = allSlabs.length ? Math.max(...allSlabs) : 0;
    const main = byCat ? 'Changes with product type and price' : 'Changes with price';

    const g = f.groups && f.groups[0] ? f.groups[0] : null;
    let sub = '';
    if (g && g.slabs) {
      const rangeText = unit ? `${lo}% – ${hi}%` : `${rup(lo)} – ${rup(hi)}`;
      const typeText = byCat ? `${f.groups.length} product types` : `${g.slabs.length} price bands`;
      const egText = g.slabs
        .slice(0, 3)
        .map((s) => `${band(s[0], s[1])} → ${unit ? `${s[2]}%` : rup(s[2])}`)
        .join(' · ');
      sub = `${rangeText} · ${typeText}\ne.g. ${g.label}: ${egText}`;
    }
    return { main, sub };
  };

  // Live Example Calculator for Bottom Card
  const orderCalculation = useMemo(() => {
    if (selectedSampleItem === 'top') {
      const price = 899;
      const commRate = 15;
      const commAmt = (price * commRate) / 100;
      const fixedAmt = 27;
      const net = price - commAmt - fixedAmt;
      return {
        price,
        commAmt,
        commRate,
        fixedAmt,
        net,
        label: "Women's Top — sold at ₹899",
      };
    }
    const price = 1650;
    const commRate = 15;
    const commAmt = (price * commRate) / 100;
    const fixedAmt = 45;
    const net = price - commAmt - fixedAmt;
    return {
      price,
      commAmt,
      commRate,
      fixedAmt,
      net,
      label: "Women's Dress — sold at ₹1,650",
    };
  }, [selectedSampleItem]);

  // Live Example Text in Modal
  const modalLiveText = useMemo(() => {
    if (!curFee) return null;
    const price = 899;
    const byCat = curFee.by_cat || curFee.byCat;
    if (curFee.how === 'pct') {
      const v = Number(curFee.value || 0);
      return (
        <span>
          <b>Example:</b> on a ₹899 sale this charges <b>₹{((price * v) / 100).toFixed(2)}</b>.
        </span>
      );
    }
    if (curFee.how === 'flat') {
      const v = Number(curFee.value || 0);
      return (
        <span>
          <b>Example:</b> every order is charged <b>{rup(v)}</b>.
        </span>
      );
    }
    if (curFee.how === 'weight') {
      return (
        <span>
          <b>Example:</b> a 0.4 kg order falls in the first row.
        </span>
      );
    }

    const g = curFee.groups && curFee.groups[0] ? curFee.groups[0] : null;
    if (!g) return null;

    const hit = (g.slabs || []).find(
      (s) => price >= (Number(s[0]) || 0) && (s[1] === '' || s[1] === null || price < Number(s[1])),
    );
    const r = hit ? hit[2] : '—';
    const amt =
      hit === undefined || r === ''
        ? '—'
        : curFee.how === 'pct-slab'
        ? `₹${((price * Number(r)) / 100).toFixed(2)}`
        : rup(r);

    return (
      <span>
        <b>Example:</b> a ₹899 sale
        {byCat ? (
          <span>
            {' '}
            in <b>{g.label}</b>
          </span>
        ) : (
          ''
        )}{' '}
        falls in the <b>{hit ? band(hit[0], hit[1]) : '—'}</b> band → charged <b>{amt}</b>
        {curFee.how === 'pct-slab' && r !== '' ? ` (${r}%)` : ''}.
      </span>
    );
  }, [curFee]);

  return (
    <>
      {/* PAGE HEADER */}
      <div className="px-6 pt-3 pb-5">
        <div className="flex items-start justify-between gap-6 lg:flex-col lg:gap-4">
          <div>
            <PageHeader title="Estimated Fees" className="p-0 bg-transparent" />
            <p className="text-[13px] text-[#6B7280] mt-[-8px] max-w-[540px] leading-[20px]">
              Tell us what each marketplace charges you. We&apos;ll then show the fees on every order right away —
              without waiting for the settlement report.
            </p>
          </div>

          {/* GREEN RATE CARD BANNER */}
          <div className="w-[460px] bg-[#ECFDF5] border border-[#A7F3D0] rounded-[10px] p-4 flex items-start gap-3 lg:w-full">
            <div className="text-[24px] leading-none shrink-0">📄</div>
            <div className="flex-1">
              <h4 className="text-[14px] font-semibold text-[#111827] m-0 mb-1">
                Have your rate card? Let us fill this in.
              </h4>
              <p className="text-[12.5px] text-[#374151] leading-[18px] m-0">
                Upload the fee agreement your marketplace sent you — Myntra&apos;s CTA PDF, Amazon&apos;s fee sheet,
                Flipkart&apos;s rate card. We&apos;ll read the tables and fill everything in. You just check the
                numbers.
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Upload
                  showUploadList={false}
                  beforeUpload={(file) => {
                    handleUploadExcel(file);
                    return false;
                  }}
                  accept=".xlsx,.xls,.csv"
                >
                  <Button
                    type="primary"
                    icon={<UploadOutlined />}
                    size="small"
                    loading={uploading}
                    className="bg-[#16A34A] hover:bg-[#15803D] border-none text-[12.5px] h-[32px] rounded-[6px]"
                  >
                    Upload rate card
                  </Button>
                </Upload>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={handleDownloadSample}
                  className="bg-white border-[#16A34A] text-[#16A34A] hover:bg-[#ECFDF5] text-[12.5px] h-[32px] rounded-[6px]"
                >
                  Download sample template
                </Button>
                <Button
                  size="small"
                  onClick={() => openModal()}
                  className="bg-white border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] text-[12.5px] h-[32px] rounded-[6px]"
                >
                  Enter manually
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="px-6 pb-10">
        {/* MARKETPLACE SELECTOR & ADD FEE */}
        <div className="flex items-start gap-3 mb-5 flex-wrap">
          <div className="w-[300px] max-w-full">
            <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Select Marketplace</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] z-10 pointer-events-none">🏬</span>
              <Select
                value={selectedMarketplace}
                onChange={(val) => setSelectedMarketplace(val)}
                className="w-full h-[44px] custom-mp-select"
                style={{ paddingLeft: '32px' }}
              >
                <Option value="Myntra">Myntra</Option>
                <Option value="Amazon">Amazon</Option>
                <Option value="Flipkart">Flipkart</Option>
                <Option value="Meesho">Meesho</Option>
                <Option value="Blinkit">Blinkit</Option>
                <Option value="Zepto">Zepto</Option>
                <Option value="Swiggy Instamart">Swiggy Instamart</Option>
                <Option value="Nykaa">Nykaa</Option>
              </Select>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280] mt-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Fees set up for this marketplace</span>
            </div>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            className="bg-[#16A34A] hover:bg-[#15803D] border-none text-[13.5px] font-semibold h-[44px] px-5 mt-[26px] rounded-[8px] flex items-center"
          >
            Add fee
          </Button>
        </div>

        {/* FEE TABLE CARD */}
        <div className="bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(16,24,40,0.05)] overflow-hidden mb-5">
          <Spin spinning={loading}>
            <Table
              dataSource={fees}
              rowKey={(record) => record.id || record.name}
              pagination={false}
              columns={[
                {
                  title: 'Fee',
                  dataIndex: 'name',
                  key: 'name',
                  width: '28%',
                  render: (text, record) => (
                    <div className={record.on ? '' : 'opacity-60'}>
                      <div className="font-semibold text-[#111827] text-[14px]">{text}</div>
                      <div className="text-[12px] text-[#9CA3AF] mt-0.5">{record.desc}</div>
                    </div>
                  ),
                },
                {
                  title: "What you're charged",
                  key: 'charged',
                  width: '44%',
                  render: (_, record, index) => {
                    const s = getSummary(record);
                    const editable = record.how.includes('slab') || record.how === 'weight';
                    return (
                      <div className={record.on ? '' : 'opacity-60'}>
                        <div className="font-semibold text-[#111827] text-[14px]">{s.main}</div>
                        {s.sub && (
                          <div className="text-[12px] text-[#9CA3AF] mt-1 whitespace-pre-line leading-relaxed">
                            {s.sub}
                          </div>
                        )}
                        {editable && (
                          <button
                            type="button"
                            onClick={() => openModal(index)}
                            className="mt-1 text-[12.5px] font-semibold text-[#2563EB] hover:underline bg-transparent border-none p-0 cursor-pointer"
                          >
                            View / edit table
                          </button>
                        )}
                      </div>
                    );
                  },
                },
                {
                  title: 'On',
                  key: 'on',
                  width: '16%',
                  render: (_, record, index) => (
                    <Switch
                      checked={record.on}
                      onChange={() => toggleFeeStatus(index)}
                      className={record.on ? 'bg-[#16A34A]' : ''}
                    />
                  ),
                },
                {
                  title: 'Edit',
                  key: 'actions',
                  width: '12%',
                  render: (_, record, index) => (
                    <div className="flex items-center gap-1">
                      <Button
                        type="text"
                        icon={<EditOutlined className="text-[#9CA3AF] hover:text-[#374151] text-[15px]" />}
                        onClick={() => openModal(index)}
                      />
                      <Button
                        type="text"
                        icon={<DeleteOutlined className="text-[#9CA3AF] hover:text-[#DC2626] text-[15px]" />}
                        onClick={() => confirmDeleteFee(record)}
                      />
                    </div>
                  ),
                },
              ]}
            />
          </Spin>
        </div>

        {/* REAL ORDER CALCULATION PREVIEW */}
        <div className="bg-white border border-[#E5E7EB] rounded-[10px] shadow-[0_1px_2px_rgba(16,24,40,0.05)] p-5 flex items-center gap-6 flex-wrap mb-4">
          <div>
            <div className="text-[13px] text-[#6B7280] font-medium mb-2">See it on a real order</div>
            <Select
              value={selectedSampleItem}
              onChange={(val) => setSelectedSampleItem(val)}
              className="w-[300px] h-[40px]"
            >
              <Option value="top">Women&apos;s Top — sold at ₹899</Option>
              <Option value="dress">Women&apos;s Dress — sold at ₹1,650</Option>
            </Select>
          </div>

          <div className="text-[14.5px] text-[#374151] leading-[1.9] pt-2">
            Sale <b className="text-[#111827]">₹{orderCalculation.price}</b>{' '}
            <span className="text-[#DC2626]">
              − commission ₹{orderCalculation.commAmt.toFixed(2)}{' '}
              <small className="text-[#9CA3AF]">({orderCalculation.commRate}% slab)</small>
            </span>{' '}
            <span className="text-[#DC2626]">− fixed fee ₹{orderCalculation.fixedAmt}</span> ={' '}
            <span className="text-[#15803D] font-bold">₹{orderCalculation.net.toFixed(2)} after fees</span>
          </div>
        </div>

        <p className="text-[12.5px] text-[#9CA3AF] text-center mt-3">
          These estimates show on every order in Profit. When the settlement report comes in, the real charge replaces
          the estimate automatically.
        </p>
      </main>

      {/* ================= ADD / EDIT FEE MODAL ================= */}
      <Modal
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        width={660}
        centered
        className="estimated-fee-modal"
        title={
          <div className="text-[16.5px] font-bold text-[#111827]">
            {editingIndex === null
              ? `Add a fee — ${selectedMarketplace}`
              : `Edit ${curFee?.name ? curFee.name.toLowerCase() : 'fee'} — ${selectedMarketplace}`}
          </div>
        }
      >
        {curFee && (
          <div className="pt-2">
            {/* What is the fee called? */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">What is the fee called?</label>
              <Select
                value={curFee.name}
                onChange={(val) => setCurFee((prev) => ({ ...prev, name: val }))}
                className="w-full h-[42px]"
              >
                <Option value="Commission">Commission</Option>
                <Option value="Fixed fee">Fixed fee</Option>
                <Option value="Shipping fee">Shipping fee</Option>
                <Option value="Return fee">Return fee</Option>
                <Option value="Storage fee">Storage fee</Option>
                <Option value="Something else…">Something else…</Option>
              </Select>
            </div>

            {/* How much do they charge? */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">How much do they charge?</label>
              <Select
                value={curFee.how}
                onChange={(val) => setCurFee((prev) => ({ ...prev, how: val }))}
                className="w-full h-[42px]"
              >
                <Option value="pct">A percentage of the sale price</Option>
                <Option value="flat">A fixed rupee amount</Option>
                <Option value="pct-slab">A percentage that changes with the price</Option>
                <Option value="flat-slab">A fixed amount that changes with the price</Option>
                <Option value="weight">A fixed amount that changes with weight</Option>
              </Select>
              <div className="text-[12px] text-[#9CA3AF] mt-1.5">
                {['pct', 'flat'].includes(curFee.how)
                  ? 'Same rate on every order.'
                  : curFee.how === 'weight'
                  ? 'Set an amount for each weight range.'
                  : 'Set the rate for each price range, exactly as it appears on your rate card.'}
              </div>
            </div>

            {/* SIMPLE TYPES (PCT / FLAT) */}
            {['pct', 'flat'].includes(curFee.how) && (
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  {curFee.how === 'pct' ? 'Percentage' : 'Amount'}
                </label>
                <div className="flex items-center gap-3">
                  <InputNumber
                    value={curFee.value}
                    onChange={(val) => setCurFee((prev) => ({ ...prev, value: val }))}
                    className="flex-1 h-[42px] flex items-center"
                  />
                  <span className="text-[14px] text-[#6B7280] font-semibold">
                    {curFee.how === 'pct' ? '% of sale price' : '₹ per order'}
                  </span>
                </div>
              </div>
            )}

            {/* SLAB TYPES (PCT-SLAB / FLAT-SLAB / WEIGHT) */}
            {!['pct', 'flat'].includes(curFee.how) && (
              <div className="mb-4">
                <div className="mb-3">
                  <Checkbox
                    checked={curFee.by_cat || curFee.byCat}
                    onChange={(e) =>
                      setCurFee((prev) => ({ ...prev, by_cat: e.target.checked, byCat: e.target.checked }))
                    }
                    className="text-[13.5px] font-medium text-[#374151]"
                  >
                    The rate is different for each product type
                  </Checkbox>
                </div>

                {/* GROUPS */}
                {(curFee.by_cat || curFee.byCat
                  ? curFee.groups
                  : [curFee.groups[0] || { label: 'All products', slabs: [[0, '', '']] }]
                ).map((g, gi) => (
                  <div key={gi} className="border border-[#E5E7EB] rounded-[9px] mb-3 overflow-hidden">
                    <div className="flex items-center justify-between gap-3 p-3 bg-[#FAFBFC] border-b border-[#E5E7EB]">
                      <div className="flex-1">
                        {curFee.by_cat || curFee.byCat ? (
                          <Input
                            value={g.label}
                            onChange={(e) => updateGroupLabel(gi, e.target.value)}
                            className="h-[34px] font-semibold text-[13px]"
                          />
                        ) : (
                          <div>
                            <span className="font-semibold text-[13px] text-[#111827]">All products</span>
                            <span className="block text-[11.5px] text-[#9CA3AF]">
                              Same rate for everything you sell here
                            </span>
                          </div>
                        )}
                      </div>
                      {(curFee.by_cat || curFee.byCat) && curFee.groups.length > 1 && (
                        <Button
                          type="text"
                          icon={<DeleteOutlined className="text-[#9CA3AF] hover:text-[#DC2626]" />}
                          onClick={() => deleteGroup(gi)}
                        />
                      )}
                    </div>

                    <div className="p-3">
                      <div className="grid grid-cols-[1fr_1fr_1fr_30px] gap-2 mb-2 text-[11px] font-semibold uppercase text-[#6B7280] tracking-wider">
                        <div>{curFee.how === 'weight' ? 'Weight from' : 'Price from'}</div>
                        <div>{curFee.how === 'weight' ? 'Weight to' : 'Price to'}</div>
                        <div>Rate ({curFee.how === 'pct-slab' ? '%' : '₹'})</div>
                        <div />
                      </div>

                      {(g.slabs || []).map((s, si) => (
                        <div key={si} className="grid grid-cols-[1fr_1fr_1fr_30px] gap-2 items-center mb-2">
                          <Input
                            type="number"
                            value={s[0]}
                            onChange={(e) => updateSlabValue(gi, si, 0, e.target.value)}
                            className="h-[36px] text-[13.5px]"
                          />
                          <Input
                            type="number"
                            value={s[1]}
                            placeholder="no limit"
                            onChange={(e) => updateSlabValue(gi, si, 1, e.target.value)}
                            className="h-[36px] text-[13.5px]"
                          />
                          <Input
                            type="number"
                            value={s[2]}
                            onChange={(e) => updateSlabValue(gi, si, 2, e.target.value)}
                            className="h-[36px] text-[13.5px]"
                          />
                          <Button
                            type="text"
                            icon={<CloseOutlined className="text-[#9CA3AF] hover:text-[#DC2626]" />}
                            onClick={() => deleteSlab(gi, si)}
                          />
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => addSlab(gi)}
                        className="mt-1 text-[13px] font-semibold text-[#2563EB] hover:underline bg-transparent border-none p-0 cursor-pointer"
                      >
                        ＋ Add price range
                      </button>
                    </div>
                  </div>
                ))}

                {(curFee.by_cat || curFee.byCat) && (
                  <button
                    type="button"
                    onClick={addGroup}
                    className="mt-1 text-[13px] font-semibold text-[#2563EB] hover:underline bg-transparent border-none p-0 cursor-pointer"
                  >
                    ＋ Add another product type
                  </button>
                )}
              </div>
            )}

            {/* LIVE BOX EXAMPLE */}
            {modalLiveText && (
              <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-[9px] p-3.5 text-[13px] text-[#15803D] leading-relaxed mb-4">
                {modalLiveText}
              </div>
            )}

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
              {editingIndex !== null ? (
                <button
                  type="button"
                  onClick={() => confirmDeleteFee(curFee)}
                  className="text-[#DC2626] hover:underline text-[13px] font-semibold bg-transparent border-none p-0 cursor-pointer"
                >
                  Delete this fee
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <Button onClick={closeModal} className="h-[38px] px-4 rounded-[8px]">
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleSaveFee}
                  className="bg-[#16A34A] hover:bg-[#15803D] border-none text-[13.5px] font-semibold h-[38px] px-4 rounded-[8px]"
                >
                  Save fee
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
