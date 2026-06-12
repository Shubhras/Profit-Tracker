import React, { useState } from 'react';
import { Table, Tag, Input, Button, Drawer, Select, DatePicker, Popover } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

function HelpSupport() {
  const [openFilter, setOpenFilter] = useState(false);

  const [ticketData, setTicketData] = useState([
    {
      key: 1,
      ticketId: 'TK-1001',
      subject: 'Amazon products not syncing',
      category: 'Marketplace Integration',
      user: 'John Smith',
      priority: 'High',
      assignedTo: 'Rahul Sharma',
      status: 'Open',
    },
    {
      key: 2,
      ticketId: 'TK-1002',
      subject: 'Subscription payment issue',
      category: 'Subscription',
      user: 'Emma Watson',
      priority: 'Medium',
      assignedTo: 'Priya Singh',
      status: 'Pending',
    },
    {
      key: 3,
      ticketId: 'TK-1003',
      subject: 'API authentication failed',
      category: 'API & Webhooks',
      user: 'David Brown',
      priority: 'High',
      assignedTo: 'Amit Patel',
      status: 'Escalated',
    },
    {
      key: 4,
      ticketId: 'TK-1004',
      subject: 'Unable to login account',
      category: 'Account Access',
      user: 'Sophia Lee',
      priority: 'Low',
      assignedTo: 'Rahul Sharma',
      status: 'Resolved',
    },
  ]);

  const handleStatusChange = (ticketId, newStatus) => {
    setTicketData((prev) =>
      prev.map((ticket) => (ticket.ticketId === ticketId ? { ...ticket, status: newStatus } : ticket)),
    );
  };

  const columns = [
    {
      title: <span className="text-[11px] font-semibold">Ticket ID</span>,
      dataIndex: 'ticketId',
      width: 110,
      align: 'center',
      render: (text) => <span className="text-[12px] font-medium">{text}</span>,
    },

    {
      title: <span className="text-[11px] font-semibold">Issue</span>,
      dataIndex: 'subject',
      width: 250,
      align: 'center',
      render: (text) => <span className="text-[12px]">{text}</span>,
    },

    {
      title: <span className="text-[11px] font-semibold">Category</span>,
      dataIndex: 'category',
      width: 180,
      align: 'center',
      render: (text) => <Tag className="text-[10px]">{text}</Tag>,
    },

    {
      title: <span className="text-[11px] font-semibold">User</span>,
      dataIndex: 'user',
      width: 140,
      align: 'center',
      render: (text) => <span className="text-[12px]">{text}</span>,
    },

    {
      title: <span className="text-[11px] font-semibold">Priority</span>,
      dataIndex: 'priority',
      width: 120,
      align: 'center',
      render: (priority) => {
        const colorMap = {
          High: 'red',
          Medium: 'orange',
          Low: 'green',
        };

        return <Tag color={colorMap[priority]}>{priority}</Tag>;
      },
    },

    {
      title: <span className="text-[11px] font-semibold">Assigned To</span>,
      dataIndex: 'assignedTo',
      width: 140,
      align: 'center',
      render: (text) => <span className="text-[12px]">{text}</span>,
    },

    {
      title: <span className="text-[11px] font-semibold">Status</span>,
      dataIndex: 'status',
      width: 140,
      align: 'center',
      render: (status, record) => (
        <StatusPopover
          status={status}
          onChange={(newStatus) => {
            handleStatusChange(record.ticketId, newStatus);
            // API Call
            // updateTicketStatus(record.id, newStatus)
          }}
        />
      ),
    },
    {
      title: <span className="text-[11px] font-semibold">Action</span>,
      width: 100,
      render: () => (
        <Button type="link" size="small" className="text-[11px]">
          View
        </Button>
      ),
    },
  ];

  function StatusPopover({ status, onChange }) {
    const statuses = [
      { label: 'Open', color: '#52c41a' },
      { label: 'Pending', color: '#faad14' },
      { label: 'Resolved', color: '#1677ff' },
      { label: 'Escalated', color: '#ff4d4f' },
    ];

    const content = (
      <div className="w-[160px] py-1">
        {statuses.map((item) => (
          <div
            key={item.label}
            role="button"
            tabIndex={0}
            onClick={() => onChange(item.label)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onChange(item.label);
              }
            }}
            className="flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg hover:bg-[#f5f5f5] transition-all"
          >
            <span className="text-[13px]">{item.label}</span>

            {status === item.label && <span className="text-[#1677ff]">✓</span>}
          </div>
        ))}
      </div>
    );

    const current = statuses.find((s) => s.label === status);

    return (
      <Popover trigger="click" placement="bottomLeft" content={content}>
        <Button className="inline-flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer hover:bg-[#f5f5f5] transition-all">
          <span
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: current?.color,
            }}
          />

          <span className="text-[13px] font-medium">{status}</span>

          <DownOutlined
            style={{
              fontSize: 10,
              color: '#94a3b8',
            }}
          />
        </Button>
      </Popover>
    );
  }

  return (
    <>
      <div className="bg-[#f8fafc] min-h-screen p-3 px-2">
        <div className="flex gap-5 items-start">
          {' '}
          {/* LEFT PANEL */}
          {/* <div className="w-[220px] shrink-0 bg-white rounded-2xl border border-[#e5e7eb] p-4 h-fit">
            <div className="mb-5">
              <h2 className="text-[16px] font-semibold text-[#111827] mb-1">Ticket Center</h2>

              <p className="text-[11px] text-[#6b7280]">Manage support requests</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-[#f0fdf4] rounded-xl p-3 border border-[#dcfce7]">
                <p className="text-[11px] text-[#16a34a] mb-1">Total Tickets</p>

                <h3 className="text-[20px] font-semibold text-[#111827] mb-0">1,036</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#eff6ff] rounded-lg p-2">
                  <p className="text-[10px] text-[#2563eb] mb-1">Open</p>

                  <h4 className="text-[14px] font-semibold mb-0">291</h4>
                </div>

                <div className="bg-[#fef3c7] rounded-lg p-2">
                  <p className="text-[10px] text-[#d97706] mb-1">Pending</p>

                  <h4 className="text-[14px] font-semibold mb-0">89</h4>
                </div>

                <div className="bg-[#dbeafe] rounded-lg p-2">
                  <p className="text-[10px] text-[#2563eb] mb-1">Resolved</p>

                  <h4 className="text-[14px] font-semibold mb-0">526</h4>
                </div>

                <div className="bg-[#fee2e2] rounded-lg p-2">
                  <p className="text-[10px] text-[#dc2626] mb-1">Escalated</p>

                  <h4 className="text-[14px] font-semibold mb-0">78</h4>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-[11px] uppercase font-semibold text-[#9ca3af] mb-3">Status</h4>

              <div className="space-y-1">
                {['All Tickets', 'New', 'Open', 'Pending', 'Resolved', 'Escalated'].map((item) => (
                  <div key={item} className="px-3 py-2 rounded-lg hover:bg-[#f9fafb] cursor-pointer text-[13px]">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[11px] uppercase font-semibold text-[#9ca3af] mb-3">Categories</h4>

              <div className="space-y-2">
                {['Marketplace', 'Subscription', 'Payment', 'API', 'Account', 'Feature Requests'].map((item) => (
                  <div key={item} className="text-[13px] text-[#4b5563] hover:text-primary cursor-pointer">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div> */}
          {/* RIGHT PANEL */}
          <div className="flex-1 bg-white rounded-2xl border border-[#e5e7eb] p-5 overflow-hidden">
            {' '}
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-semibold text-[#111827] mb-0">All Tickets</h2>

              <div className="flex items-center gap-3">
                <Input placeholder="Search tickets..." prefix={<SearchOutlined />} className="w-[280px]" />

                <Button onClick={() => setOpenFilter(true)}>Filter</Button>

                <Button type="primary">Create Ticket</Button>
              </div>
            </div>
            {/* Table */}
            <Table
              size="small"
              columns={columns}
              dataSource={ticketData}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          </div>
        </div>
      </div>
      <Drawer
        title="Ticket Filters"
        placement="right"
        width={320}
        open={openFilter}
        onClose={() => setOpenFilter(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium mb-2">Status</label>

            <Select placeholder="Select Status" style={{ width: '100%' }}>
              <Option value="open">Open</Option>
              <Option value="pending">Pending</Option>
              <Option value="resolved">Resolved</Option>
              <Option value="escalated">Escalated</Option>
            </Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-2">Category</label>

            <Select placeholder="Select Category" style={{ width: '100%' }}>
              <Option value="marketplace">Marketplace Integration</Option>

              <Option value="subscription">Subscription</Option>

              <Option value="payment">Payment Issues</Option>

              <Option value="api">API & Webhooks</Option>

              <Option value="account">Account Access</Option>
            </Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-2">Priority</label>

            <Select placeholder="Select Priority" style={{ width: '100%' }}>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-2">Assigned To</label>

            <Select placeholder="Select Agent" style={{ width: '100%' }}>
              <Option value="rahul">Rahul Sharma</Option>

              <Option value="priya">Priya Singh</Option>

              <Option value="amit">Amit Patel</Option>
            </Select>
          </div>

          <div>
            <label className="block text-[12px] font-medium mb-2">Date Range</label>

            <RangePicker style={{ width: '100%' }} />
          </div>

          <div className="pt-4 flex gap-2">
            <Button block>Reset</Button>

            <Button type="primary" block>
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  );
}

export default HelpSupport;
