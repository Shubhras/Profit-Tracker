import React, { useEffect, useState } from 'react';
import { Table, Tooltip, Modal } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllSettlement } from '../../redux/reconcilePayment/actionCreator';

function BreakdownItem({ item, level = 0 }) {
  return (
    <div className="mt-0">
      <div
        className="flex items-center justify-between py-1 pl-3 border-l-2 border-gray-200"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <span className="text-[13px]">{item.breakdown_type}</span>

        <span className={`font-medium ${Number(item.amount) < 0 ? 'text-red-500' : 'text-green-600'}`}>
          ₹ {Math.abs(Number(item.amount)).toFixed(2)}
        </span>
      </div>

      {item.children?.map((child) => (
        <BreakdownItem key={child.id} item={child} level={level + 1} />
      ))}
    </div>
  );
}

function SettlementDetails() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('');

  const settlementDate = location.state?.settlementDate;

  const loading = useSelector((state) => state.reconcilePayment?.loading);
  const settlementData = useSelector((state) => state.reconcilePayment?.allsettlementData);

  useEffect(() => {
    if (settlementDate) {
      dispatch(
        getAllSettlement({
          settlement_date: settlementDate,
          page: pagination.current,
          page_size: pagination.pageSize,
          search: debouncedSearch,
          transaction_status: statusFilter,
          transaction_type: transactionTypeFilter,
        }),
      );
    }
  }, [
    dispatch,
    settlementDate,
    pagination.current,
    pagination.pageSize,
    transactionTypeFilter,
    debouncedSearch,
    statusFilter,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchText]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleView = (record) => {
    console.log(record);

    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const dataSource =
    settlementData?.results?.map((item) => ({
      key: item.id,
      id: item.id,
      transactionId: item.transaction_id,
      orderId: item.order_id,
      transactionType: item.transaction_type,
      transactionStatus: item.transaction_status,
      description: item.description,
      postedDate: item.posted_date,
      totalAmount: item.total_amount,
      currencyCode: item.currency_code,
      breakdowns: item.breakdowns,
      relatedIdentifiers: item.related_identifiers,
    })) || [];

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transactionId',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.transactionId).localeCompare(String(b.transactionId)),
      render: (value) => (
        <Tooltip title={value} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[#2563eb] cursor-pointer">{value}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.orderId - b.orderId,

      render: (value) => (
        <Tooltip title={value} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[#2563eb] cursor-pointer">{value}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transactionType',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.transactionType).localeCompare(String(b.transactionType)),
      render: (type) => {
        const config =
          type === 'Shipment'
            ? {
                bg: '#dbeafe',
                color: '#1d4ed8',
              } // Blue
            : type === 'ServiceFee'
            ? {
                bg: '#f3e8ff',
                color: '#7e22ce',
              } // Purple
            : {
                bg: '#ecf0f8',
                color: '#415064',
              };

        return (
          <Tooltip color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span
              className="px-2 py-1 rounded-l text-[10px] font-semibold cursor-pointer"
              style={{
                background: config.bg,
                color: config.color,
              }}
            >
              {type}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'transactionStatus',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.transactionStatus).localeCompare(String(b.transactionStatus)),

      render: (status) => {
        const color = status === 'DEFERRED' ? '#f59e0b' : status === 'RELEASED' ? '#16a34a' : '#2563eb';

        return (
          <span
            className="px-2 py-1 rounded-l text-[10px] font-semibold"
            style={{
              background: `${color}20`,
              color,
            }}
          >
            {status}
          </span>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.description).localeCompare(String(b.description)),
    },
    // {
    //   title: 'Posted Date',
    //   dataIndex: 'postedDate',
    //   align: 'center',
    //   width: 70,
    //   ellipsis: true,

    //   render: (value) => (value ? new Date(value).toLocaleString('en-IN') : '-'),
    // },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => Number(a.totalAmount) - Number(b.totalAmount),
      render: (value) => (
        <span className={Number(value) < 0 ? 'text-red-600 font-medium' : 'text-green-700 font-medium'}>
          ₹ {Number(value).toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Currency',
      dataIndex: 'currencyCode',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.totalAmount) - String(b.totalAmount),
    },
    {
      title: '',
      key: 'view',
      align: 'center',

      width: 30,
      render: (_, record) => (
        <Tooltip color="black" overlayInnerStyle={{ color: '#fff' }}>
          <EyeOutlined
            style={{
              fontSize: '16px',
              cursor: 'pointer',
              color: '#1677ff',
            }}
            onClick={() => handleView(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-3 py-2">
            {/* Top Content */}
            <div className="flex items-center gap-3 mb-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-[32px] h-[32px] bg-white rounded-xl border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:bg-[#f5f7fa] transition-all duration-200"
              >
                <ArrowLeftOutlined />
              </button>

              <h2 className="text-xl font-semibold m-0">Settlement Details</h2>
            </div>

            {/* Bottom Row */}
            <div className="mt-5 flex items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-[260px]">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search campaigns..."
                  className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  {/* Status Filter */}

                  <select
                    value={transactionTypeFilter}
                    onChange={(e) => {
                      setTransactionTypeFilter(e.target.value);
                      setPagination((prev) => ({
                        ...prev,
                        current: 1,
                      }));
                    }}
                    className="h-[30px] px-2 pr-4 rounded-xl border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value="Shipment">Shipment</option>
                    <option value="ServiceFee">Service Fee</option>
                    <option value="ProductAdsPayment	">ProductAdsPayment</option>
                  </select>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPagination((prev) => ({
                      ...prev,
                      current: 1,
                    }));
                  }}
                  className="h-[30px] px-2 pr-4 rounded-xl border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none cursor-pointer"
                >
                  <option value="">All State</option>
                  <option value="DEFERRED">DEFERRED</option>
                  <option value="RELEASED">RELEASED</option>
                </select>
              </div>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            showSorterTooltip={false}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: settlementData?.count || 0,
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
            scroll={{ x: 900 }}
            size="middle"
            bordered={false}
            className="
          [&_.ant-table-thead>tr>th]:!text-[12px]
          [&_.ant-table-thead>tr>th]:!font-semibold
          [&_.ant-table-tbody>tr>td]:!text-[12px]
        "
          />
        </div>
      </div>
      <Modal
        // title={<div className="text-[15px] font-semibold text-gray-800">Transaction Details</div>}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        footer={null}
        width={400}
        styles={{
          body: {
            padding: '12px 15px',
          },
        }}
      >
        {selectedRecord && (
          <div className="space-y-4">
            {/* Breakdown Section */}
            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-gray-800">Breakdown Summary</h3>

              <div className="space-y-2">
                <div className="mb-2 font-semibold text-[13px]">
                  {selectedRecord.transactionType} - ₹ {selectedRecord.totalAmount}
                </div>

                {selectedRecord?.breakdowns?.map((item) => (
                  <div key={item.id} className="rounded-md border border-gray-200 p-2 mb-2">
                    <BreakdownItem item={item} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default SettlementDetails;
