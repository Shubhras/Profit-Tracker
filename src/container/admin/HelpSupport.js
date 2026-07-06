import React, { useEffect, useState } from 'react';
import { Table, Tag, Input, Button, Modal, Select, message, Tooltip } from 'antd';
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

  const [statusModal, setStatusModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');

  const { getTicketsLists, loading } = useSelector((state) => state.AdminDashboard);

  useEffect(() => {
    dispatch(getAdminTickets(pagination.current, pagination.pageSize));
  }, [dispatch, pagination.current, pagination.pageSize]);

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
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
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
          className="cursor-pointer px-3 py-1 rounded-full"
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

            dispatch(getAdminTickets(pagination.current, pagination.pageSize));
          } else {
            message.error('Failed to update ticket');
          }
        },
      ),
    );
  };

  return (
    <>
      <div className="min-h-screen p-3 px-2">
        <div className="flex gap-5 items-start">
          <div className="flex-1 bg-white rounded-2xl border border-[#e5e7eb] p-5 overflow-hidden">
            {' '}
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-semibold text-[#111827] mb-0">All Tickets</h2>

              <div className="flex items-center gap-3">
                <Input placeholder="Search tickets..." prefix={<SearchOutlined />} className="w-[280px] h-[30px]" />
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
                total: ticketData.length,
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

            <TextArea
              value={selectedTicket?.description || ''}
              disabled
              autoSize={{
                minRows: 2,
                maxRows: 6,
              }}
              className="bg-gray-50 cursor-not-allowed"
            />
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
