import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Button, Modal, Select, message, Tooltip, Card, Row, Col } from 'antd';
import {
  SearchOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminContactMessages, updateAdminContactMessage } from '../../redux/admin/actionCreator';

const { Option } = Select;

function ContactMessages() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updateStatusVal, setUpdateStatusVal] = useState('');
  const [updateIsReadVal, setUpdateIsReadVal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { getContactMessagesData, loading } = useSelector((state) => state.AdminDashboard);

  const fetchMessages = (
    page = pagination.current,
    pageSize = pagination.pageSize,
    search = searchText,
    status = statusFilter,
  ) => {
    dispatch(getAdminContactMessages(page, pageSize, search, status));
  };

  useEffect(() => {
    fetchMessages(pagination.current, pagination.pageSize, searchText, statusFilter);
  }, [dispatch, pagination.current, pagination.pageSize, statusFilter]);

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchMessages(1, pagination.pageSize, value, statusFilter);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchMessages(1, pagination.pageSize, searchText, value);
  };

  const handleOpenDetailModal = (record) => {
    setSelectedItem(record);
    setUpdateStatusVal(record.status || 'new');
    setUpdateIsReadVal(Boolean(record.is_read));
    setDetailModalOpen(true);

    if (!record.is_read) {
      dispatch(
        updateAdminContactMessage(record.id, { is_read: true }, (success) => {
          if (success) {
            fetchMessages(pagination.current, pagination.pageSize, searchText, statusFilter);
          }
        }),
      );
    }
  };

  const handleSaveUpdate = () => {
    if (!selectedItem) return;
    setSubmitting(true);

    dispatch(
      updateAdminContactMessage(
        selectedItem.id,
        {
          status: updateStatusVal,
          is_read: updateIsReadVal,
        },
        (success, response) => {
          setSubmitting(false);
          if (success) {
            message.success(response?.message || 'Contact message updated successfully');
            setDetailModalOpen(false);
            fetchMessages(pagination.current, pagination.pageSize, searchText, statusFilter);
          } else {
            message.error('Failed to update contact message status');
          }
        },
      ),
    );
  };

  const extractList = (val) => {
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) return val.data;
    if (Array.isArray(val?.results)) return val.results;
    if (Array.isArray(val?.results?.data)) return val.results.data;
    if (Array.isArray(val?.data?.results)) return val.data.results;
    if (Array.isArray(val?.data?.data)) return val.data.data;
    return [];
  };

  const rawList = extractList(getContactMessagesData);

  const totalRecords =
    getContactMessagesData?.count ??
    getContactMessagesData?.results?.count ??
    getContactMessagesData?.pagination?.total_records ??
    rawList.length;

  const tableData = rawList.map((item) => ({
    key: item.id,
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    designation: item.designation || item.company_name || '-',
    message: item.message,
    status: item.status || 'new',
    is_read: Boolean(item.is_read),
    created_at: item.created_at
      ? new Date(item.created_at).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '-',
  }));

  const totalCount = totalRecords;
  const newCount = rawList.filter((m) => m.status === 'new').length;
  const contactedCount = rawList.filter((m) => m.status === 'contacted').length;
  const resolvedCount = rawList.filter((m) => m.status === 'resolved').length;

  const columns = [
    {
      title: <span className="text-[13px] font-semibold">ID</span>,
      dataIndex: 'id',
      width: 70,
      align: 'center',
      render: (text, record) => (
        <span className={`text-[12px] font-semibold ${!record.is_read ? 'text-[#0ea5e9]' : 'text-[#6b7280]'}`}>
          #{text}
        </span>
      ),
    },
    {
      title: <span className="text-[13px] font-semibold">Contact Person</span>,
      dataIndex: 'name',
      width: 180,
      render: (text, record) => (
        <div>
          <div className="font-semibold text-[#111827] text-[13px] flex items-center gap-1.5">
            <UserOutlined className="text-[#64748b]" /> {text}
            {!record.is_read && (
              <span className="w-2 h-2 rounded-full bg-[#0ea5e9] inline-block" title="Unread Inquiry" />
            )}
          </div>
          <div className="text-[11px] text-[#6b7280] mt-0.5">{record.designation}</div>
        </div>
      ),
    },
    {
      title: <span className="text-[13px] font-semibold">Contact Info</span>,
      dataIndex: 'email',
      width: 210,
      render: (email, record) => (
        <div className="text-[12px] text-[#374151]">
          <div className="flex items-center gap-1 text-[#2563eb]">
            <MailOutlined className="text-[#64748b]" />
            <a href={`mailto:${email}`} className="hover:underline text-[#2563eb]">
              {email}
            </a>
          </div>
          {record.phone && (
            <div className="flex items-center gap-1 text-[#4b5563] mt-1 text-[11px]">
              <PhoneOutlined className="text-[#64748b]" />
              <a href={`tel:${record.phone}`} className="hover:underline text-[#4b5563]">
                {record.phone}
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: <span className="text-[13px] font-semibold">Message Inquiry</span>,
      dataIndex: 'message',
      width: 280,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-normal text-[#374151] block truncate cursor-pointer" style={{ maxWidth: '260px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: <span className="text-[13px] font-semibold">Status</span>,
      dataIndex: 'status',
      width: 120,
      align: 'center',
      render: (status) => {
        const statusConfig = {
          new: { color: 'gold', label: 'New' },
          contacted: { color: 'processing', label: 'Contacted' },
          resolved: { color: 'success', label: 'Resolved' },
        };
        const conf = statusConfig[status] || { color: 'default', label: status };
        return (
          <Tag color={conf.color} className="capitalize font-medium px-2.5 py-0.5 rounded-full">
            {conf.label}
          </Tag>
        );
      },
    },
    {
      title: <span className="text-[13px] font-semibold">Received At</span>,
      dataIndex: 'created_at',
      width: 150,
      align: 'center',
      render: (text) => <span className="text-[12px] text-[#6b7280]">{text}</span>,
    },
    {
      title: <span className="text-[13px] font-semibold">Action</span>,
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          className="bg-[#0f766e] hover:bg-[#0d9488] text-white border-none font-semibold px-3 py-1 rounded-lg flex items-center justify-center gap-1.5 text-[12px] shadow-sm"
          onClick={() => handleOpenDetailModal(record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-[#f8fafc]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[#0f172a] mb-1">Contact Messages</h1>
        <p className="text-[13px] text-[#64748b]">
          Manage and respond to website user inquiries, lead requests, and contact messages.
        </p>
      </div>

      {/* 4 Cards in Single Horizontal Row with Square Icon Boxes */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Total Messages</div>
                <div className="text-[24px] font-bold text-[#0f172a] mt-1">{totalCount}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] border border-[#dbeafe]">
                <MailOutlined className="text-[20px]" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">New Inquiries</div>
                <div className="text-[24px] font-bold text-[#d97706] mt-1">{newCount}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#fffbeb] flex items-center justify-center text-[#d97706] border border-[#fef3c7]">
                <ClockCircleOutlined className="text-[20px]" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Contacted</div>
                <div className="text-[24px] font-bold text-[#2563eb] mt-1">{contactedCount}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] border border-[#dbeafe]">
                <PhoneOutlined className="text-[20px]" />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">Resolved</div>
                <div className="text-[24px] font-bold text-[#059669] mt-1">{resolvedCount}</div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#059669] border border-[#a7f3d0]">
                <CheckCircleOutlined className="text-[20px]" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 flex-1 min-w-[280px]">
            <Input
              placeholder="Search by name, email, phone, company..."
              prefix={<SearchOutlined className="text-[#94a3b8]" />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
              className="max-w-[320px] h-[36px] rounded-lg"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-[#64748b]">Filter Status:</span>
            <Select value={statusFilter} onChange={handleStatusFilterChange} className="w-[150px] h-[36px]">
              <Option value="">All Statuses</Option>
              <Option value="new">New</Option>
              <Option value="contacted">Contacted</Option>
              <Option value="resolved">Resolved</Option>
            </Select>
          </div>
        </div>

        <Table
          size="middle"
          loading={loading}
          columns={columns}
          dataSource={tableData}
          scroll={{ x: 950 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} inquiries`,
          }}
          onChange={(pag) => {
            setPagination({
              current: pag.current,
              pageSize: pag.pageSize,
            });
            fetchMessages(pag.current, pag.pageSize, searchText, statusFilter);
          }}
          className="
            [&_.ant-table-thead>tr>th]:!bg-[#f8fafc]
            [&_.ant-table-thead>tr>th]:!text-[#475569]
            [&_.ant-table-thead>tr>th]:!font-semibold
            [&_.ant-table-tbody>tr>td]:!py-3.5
          "
        />
      </div>

      <Modal
        open={detailModalOpen}
        footer={null}
        width={560}
        centered
        onCancel={() => setDetailModalOpen(false)}
        destroyOnClose
      >
        {selectedItem && (
          <div className="p-1">
            <div className="border-b pb-4 mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0f172a] mb-0 flex items-center gap-2">
                  Inquiry Message #{selectedItem.id}
                </h2>
                <p className="text-[12px] text-[#64748b] mb-0 mt-0.5">Received on {selectedItem.created_at}</p>
              </div>
              <Tag
                color={
                  selectedItem.status === 'new'
                    ? 'gold'
                    : selectedItem.status === 'contacted'
                    ? 'processing'
                    : 'success'
                }
                className="capitalize font-semibold px-3 py-1 text-[12px] rounded-full"
              >
                {selectedItem.status}
              </Tag>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#f8fafc] p-4 rounded-xl mb-5 border border-[#e2e8f0]">
              <div>
                <label className="text-[11px] font-semibold uppercase text-[#64748b] block mb-1">Full Name</label>
                <div className="text-[13px] font-semibold text-[#0f172a]">{selectedItem.name}</div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#64748b] block mb-1">
                  Designation / Company
                </label>
                <div className="text-[13px] text-[#334155]">{selectedItem.designation}</div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#64748b] block mb-1">Email Address</label>
                <div className="text-[13px] text-[#2563eb]">
                  <a href={`mailto:${selectedItem.email}`} className="hover:underline">
                    {selectedItem.email}
                  </a>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase text-[#64748b] block mb-1">Phone Number</label>
                <div className="text-[13px] text-[#334155]">
                  {selectedItem.phone ? (
                    <a href={`tel:${selectedItem.phone}`} className="hover:underline text-[#334155]">
                      {selectedItem.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">Inquiry Message Content</label>
              <div className="bg-white border border-[#cbd5e1] p-3.5 rounded-xl text-[13px] text-[#1e293b] leading-relaxed max-h-[180px] overflow-y-auto whitespace-pre-wrap">
                {selectedItem.message}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#f1f5f9] p-4 rounded-xl mb-6">
              <div>
                <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">Update Status</label>
                <Select value={updateStatusVal} onChange={setUpdateStatusVal} className="w-full">
                  <Option value="new">New</Option>
                  <Option value="contacted">Contacted</Option>
                  <Option value="resolved">Resolved</Option>
                </Select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#334155] block mb-1.5">Read Status</label>
                <Select
                  value={updateIsReadVal ? 'read' : 'unread'}
                  onChange={(val) => setUpdateIsReadVal(val === 'read')}
                  className="w-full"
                >
                  <Option value="read">Mark as Read</Option>
                  <Option value="unread">Mark as Unread</Option>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button onClick={() => setDetailModalOpen(false)} className="rounded-lg">
                Cancel
              </Button>
              <Button
                type="primary"
                loading={submitting}
                onClick={handleSaveUpdate}
                className="rounded-lg font-medium px-5"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ContactMessages;
