import React from 'react';
import { Modal, Select, Input, Button, DatePicker } from 'antd';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';

export default function AddExpenseModal({ open, onCancel }) {
  const [rows, setRows] = React.useState([{ id: Date.now() }]);
  const addRow = () => {
    setRows([...rows, { id: Date.now() }]);
  };
  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width="95%" // 🔥 full width type
      style={{ maxWidth: '95vw' }} // ensure screen fit
      bodyStyle={{ padding: '20px' }}
      closeIcon={<CloseOutlined style={{ fontSize: '16px', color: '#6b7280' }} />}
    >
      {/* HEADER */}
      <h3 className="text-[16px] font-semibold mb-4">Generate New Expense</h3>

      {/* FILTER ROW */}
      <div className="mb-4">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-end gap-3 mb-3">
            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Account</span>
              <Select className="w-[100px]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Channel</span>
              <Select className="w-[100px]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Order Status</span>
              <Select className="w-[100px]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Fulfillment Type</span>
              <Select className="w-[100px]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Warehouse</span>
              <Select className="w-[100px]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Attribute Type</span>
              <Select defaultValue="All" className="w-[100px]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Attribute Value</span>
              <Select defaultValue="All" className="w-[80px]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Cost Type</span>
              <Select className="w-[80px]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Cost Name</span>
              <Input className="!w-[80px] py-2" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Cost</span>
              <Input className="!w-[100px] py-2" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">Start Date</span>
              <DatePicker className="w-[100px]" />
            </div>

            <div className="flex flex-col">
              <span className="text-[12px] text-black mb-1">End Date</span>
              <DatePicker className="w-[100px]" />
            </div>

            {rows.length > 1 && (
              <Button danger icon={<DeleteOutlined />} onClick={() => deleteRow(row.id)} className="mb-1" />
            )}
          </div>
        ))}
      </div>

      <div className="mb-4">
        <Button type="primary" onClick={addRow} className="w-full bg-[#163A5F] text-white font-semibold">
          Add Expense +
        </Button>
      </div>

      {/* INFO TEXT */}
      <p className="text-blue-600 text-sm italic mb-4">
        Once you have updated all settings, click the Recalculate Expense button to apply changes older than last month.
        Otherwise, the updates will be applied automatically the next morning.
      </p>

      {/* FOOTER */}
      <div className="flex justify-end gap-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary">Submit</Button>
      </div>
    </Modal>
  );
}
