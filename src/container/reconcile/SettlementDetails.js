import React, { useEffect, useState } from 'react';
import { Table, Tooltip, Modal } from 'antd';
import { ArrowLeftOutlined, EyeOutlined } from '@ant-design/icons';
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
        }),
      );
    }
  }, [dispatch, settlementDate, pagination.current, pagination.pageSize]);

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
      render: (value) => (
        <Tooltip title={value}>
          <span>{value}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      align: 'center',
      width: 70,
      ellipsis: true,

      render: (value) => (
        <Tooltip title={value}>
          <span>{value}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Transaction Type',
      dataIndex: 'transactionType',
      align: 'center',
      width: 70,
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'transactionStatus',
      align: 'center',
      width: 70,
      ellipsis: true,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      align: 'center',
      width: 70,
      ellipsis: true,
    },
    {
      title: 'Posted Date',
      dataIndex: 'postedDate',
      align: 'center',
      width: 70,
      ellipsis: true,

      render: (value) => (value ? new Date(value).toLocaleString('en-IN') : '-'),
    },
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
    },
    {
      title: '',
      key: 'view',
      align: 'center',

      width: 50,
      render: (_, record) => (
        <Tooltip title="View Details" color="black" overlayInnerStyle={{ color: '#fff' }}>
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
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-[32px] h-[32px] rounded-xl bg-white border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:bg-[#f5f7fa] transition-all duration-200"
          >
            <ArrowLeftOutlined />
          </button>

          <h2 className="text-xl font-semibold m-0">Settlement Details</h2>
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
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
          scroll={{ x: 1100 }}
          size="middle"
          bordered={false}
          className="
          [&_.ant-table-thead>tr>th]:!text-[12px]
          [&_.ant-table-thead>tr>th]:!font-semibold
          [&_.ant-table-tbody>tr>td]:!text-[12px]
        "
        />
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
