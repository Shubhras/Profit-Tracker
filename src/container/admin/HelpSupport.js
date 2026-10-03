import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Button, Modal, Select, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getAdminTickets, updateTicketStatus } from '../../redux/admin/actionCreator';

function HelpSupport() {
  // const [openFilter, setOpenFilter] = useState(false);
  const { TextArea } = Input;
  const dispatch = useDispatch();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [priority, setPriority] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const [statusModal, setStatusModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const { getTicketsLists, loading } = useSelector((state) => state.AdminDashboard);

  useEffect(() => {
    dispatch(getAdminTickets(pagination.current, pagination.pageSize, debouncedSearch, '', priority));
  }, [dispatch, pagination.current, pagination.pageSize, debouncedSearch, priority]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  }, [debouncedSearch, priority]);

  const handleOpenStatusModal = (record) => {
    setSelectedTicket(record);
    setSelectedStatus(record.status);
    setAdminNote(record.adminNote || '');

    setStatusModal(true);
  };

  const ticketData =
    getTicketsLists?.results?.data?.map((item) => ({
      key: item.id,
      id: item.id,
      ticketId: item.ticket_id || `TK-${item.id}`,
      subject: item.title,
      category: item.category || '-',
      user: item.user_name || item.user?.full_name || '-',
      email: item.user_email || item.user?.user_email || '-',
      priority: item.priority || 'Low',
      assignedTo: item.assigned_to || '-',
      status: item.status || 'Open',
      adminNote: item.admin_note || '',
      description: item.description || '',
      document: item.document || '',
    })) || [];

  const columns = [
    {
      title: <span className="text-[13px] font-semibold">Ticket ID</span>,
      dataIndex: 'ticketId',
      width: 110,
      align: 'center',
      render: (text) => <span className="text-[12px] font-medium text-[#111827]">{text}</span>,
    },

    {
      title: <span className="text-[13px] font-semibold">Title</span>,
      dataIndex: 'subject',
      width: 250,
      align: 'center',
      render: (text) => <span className="text-[12px] text-[#111827]">{text}</span>,
    },

    {
      title: <span className="text-[13px] font-semibold">Description</span>,
      dataIndex: 'description',
      width: 250,
      align: 'center',
      // render: (text) => <span className="text-[12px]">{text}</span>,
      render: (v) => (
        <span className="font-medium text-[#111827] block truncate" style={{ maxWidth: '220px' }}>
          {v}
        </span>
      ),
    },

    {
      title: <span className="text-[13px] font-semibold">User</span>,
      dataIndex: 'user',
      width: 140,
      align: 'center',
      render: (text) => <span className="text-[12px] text-[#111827]">{text}</span>,
    },
    {
      title: <span className="text-[11px] font-semibold">Email</span>,
      dataIndex: 'email',
      width: 140,
      align: 'center',
      render: (text) => <span className="text-[12px] text-[#111827]">{text}</span>,
    },

    {
      title: <span className="text-[13px] font-semibold">Priority</span>,
      dataIndex: 'priority',
      width: 120,
      align: 'center',
      render: (priorityValue) => {
        const colorMap = {
          High: 'red',
          Medium: 'orange',
          Low: 'green',
        };

        return <Tag color={colorMap[priorityValue]}>{priorityValue}</Tag>;
      },
    },
    {
      title: <span className="text-[13px] font-semibold">Status</span>,
      dataIndex: 'status',
      width: 140,
      align: 'center',
      render: (status, record) => (
        <Tag
          color={
            status === 'open'
              ? 'green'
              : status === 'in_progress'
                ? 'orange'
                : status === 'resolved'
                  ? 'blue'
                  : status === 'closed'
                    ? 'red'
                    : 'default'
          }
          className="cursor-pointer px-3 py-1 rounded-l"
          onClick={() => handleOpenStatusModal(record)}
        >
          {status?.replace(/_/g, ' ')?.replace(/\b\w/g, (c) => c.toUpperCase())}
        </Tag>
      ),
    },
  ];

  const handleUpdateStatus = () => {
    dispatch(
      updateTicketStatus(
        selectedTicket.id,
        {
          status: selectedStatus,
          admin_note: adminNote,
        },
        (success, response) => {
          if (success) {
            message.success(response.message);

            setStatusModal(false);

            dispatch(getAdminTickets(pagination.current, pagination.pageSize, debouncedSearch, '', priority));
          } else {
            message.error('Failed to update ticket');
          }
        },
      ),
    );
  };

  return (
    <>
      <div className="min-h-screen p-4">
        <div className="flex gap-5 items-start">
          <div className="flex-1 bg-white rounded-lg border border-[#e5e7eb] p-5 overflow-hidden">
            {/* Header */}
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-[20px] font-semibold text-[#111827] mb-0">All Tickets</h2>

              {/* Filters */}
              <div className="flex items-center justify-between mt-4">
                {/* Search - Left */}
                <Input
                  placeholder="Search tickets..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="w-[280px] h-[34px] rounded-lg"
                />

                {/* Priority + Reset - Right */}
                <div className="flex items-center gap-3">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    aria-label="Filter by Priority"
                    className="w-[180px] h-[34px] rounded-lg border border-[#d9d9d9] bg-white px-3 text-[13px] text-[#374151] outline-none cursor-pointer"
                  >
                    <option value="">Filter by Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>

                  <Button
                    onClick={() => {
                      setSearchText('');
                      setPriority('');
                      setPagination((prev) => ({
                        ...prev,
                        current: 1,
                      }));
                    }}
                    className="h-[34px] px-3 rounded-lg"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            {/* Table */}
            <Table
              size="small"
              loading={loading}
              columns={columns}
              dataSource={ticketData}
              scroll={{ x: 1000 }}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: getTicketsLists?.results?.pagination?.total || 0,
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
              className="
    [&_.ant-table-thead>tr>th]:!text-[13px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[13px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
            />
          </div>
        </div>
      </div>

      <Modal open={statusModal} footer={null} width={520} centered onCancel={() => setStatusModal(false)}>
        <div className="p-2">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Update Ticket</h2>
            <p className="text-gray-500 text-sm mt-1">Change ticket status and add an internal note.</p>
          </div>

          {/* Status + Ticket ID */}
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>

              <Select
                value={selectedStatus}
                className="w-[200px]"
                size="small"
                onChange={setSelectedStatus}
                options={[
                  { label: 'Open', value: 'open' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Resolved', value: 'resolved' },
                  { label: 'Closed', value: 'closed' },
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ticket ID</label>

              <Input
                size="small"
                value={selectedTicket?.ticketId}
                disabled
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Admin Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note</label>

            <TextArea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Write an internal note..."
              autoSize={{
                minRows: 2,
                maxRows: 8,
              }}
            />
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>

            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 min-h-[80px] whitespace-pre-wrap">
              {selectedTicket?.description || 'No description available'}
            </div>
          </div>

          {/* Attachment */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">Attachment</label>

            {selectedTicket?.document ? (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-center rounded-lg bg-white border border-gray-200 overflow-hidden">
                  <img
                    src={selectedTicket.document}
                    alt="Ticket attachment"
                    className="max-h-[220px] w-auto max-w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
                <p className="text-sm text-gray-400 m-0">No attachment available</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-8 border-t pt-5">
            <Button className="px-2 text-[13px]" onClick={() => setStatusModal(false)}>
              Cancel
            </Button>

            <Button type="primary" className="px-2 text-[13px] font-semibold" onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default HelpSupport;
