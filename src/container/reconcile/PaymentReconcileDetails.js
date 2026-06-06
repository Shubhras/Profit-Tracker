import React, { useEffect, useState } from 'react';
import { Table, Tooltip, Modal } from 'antd';
import { EyeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAmazonTransactionDetail } from '../../redux/reconcilePayment/actionCreator';

function PaymentReconcileDetails() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const selectedDate = location.state?.date;
  const loading = useSelector((state) => state.reconcilePayment?.loading);

  const transactionData = useSelector((state) => state.reconcilePayment?.amazontransation);

  useEffect(() => {
    if (selectedDate) {
      dispatch(getAmazonTransactionDetail(pagination.current, pagination.pageSize, selectedDate, selectedDate, true));
    }
  }, [dispatch, selectedDate]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleView = (record) => {
    console.log(record.transactions?.[0]);
    setSelectedRecord(record.transactions?.[0]);
    setIsModalOpen(true);
  };

  const dataSource =
    transactionData?.results?.map((item, index) => ({
      key: index,
      statementPeriod: item.statement_period,
      date: item.date,
      beginningBalance: item.beginning_balance,
      sales: item.sales,
      refunds: item.refunds,
      expenses: item.expenses,
      others: item.others,
      payoutAmount: item.payout_amount,
      totalTransactions: item.total_transactions,

      transactions: item.transactions || [],
    })) || [];

  const columns = [
    {
      title: 'Statement Period',
      dataIndex: 'statementPeriod',
      align: 'center',
      width: 70,
      ellipsis: true,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      align: 'center',
      width: 70,
      ellipsis: true,
    },
    {
      title: 'Beginning Balance',
      dataIndex: 'beginningBalance',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => `₹ ${Number(v).toFixed(2)}`,
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => `₹ ${Number(v).toFixed(2)}`,
    },
    {
      title: 'Refunds',
      dataIndex: 'refunds',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => `₹ ${Number(v).toFixed(2)}`,
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="text-red-600">₹ {Number(v).toFixed(2)}</span>,
    },
    {
      title: 'Others',
      dataIndex: 'others',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => `₹ ${Number(v).toFixed(2)}`,
    },
    {
      title: 'Payout Amount',
      dataIndex: 'payoutAmount',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="text-green-600 font-semibold">₹ {Number(v).toFixed(2)}</span>,
    },
    {
      title: 'Transactions',
      dataIndex: 'totalTransactions',
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
            className="w-[32px] h-[32px] bg-white rounded-xl border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:bg-[#f5f7fa] transition-all duration-200"
          >
            <ArrowLeftOutlined />
          </button>

          <h2 className="text-xl font-semibold m-0">Payment Reconcile Details</h2>
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          showSorterTooltip={false}
          tableLayout="fixed"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: transactionData?.count || 0,
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
          scroll={{ x: 800 }}
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
          <div className="space-y-2">
            {/* Breakdown Section */}
            <div>
              <h3 className="mb-3 text-[13px] font-semibold text-gray-800">Breakdown Summary</h3>

              <div className="space-y-2">
                <div className="mb-2 font-semibold text-[13px]">
                  {selectedRecord.transaction_type} - ₹ {selectedRecord.total_amount}
                </div>

                {selectedRecord?.breakdowns?.map((item) => (
                  <div key={item.id} className="rounded-md border border-gray-200 p-2 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium">{item.breakdown_type}</span>

                      <span
                        className={`text-[13px] font-semibold ${
                          Number(item.amount) < 0 ? 'text-red-500' : 'text-green-600'
                        }`}
                      >
                        ₹ {Math.abs(Number(item.amount)).toFixed(2)}
                      </span>
                    </div>

                    {item.children?.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-gray-200">
                        {item.children.map((child) => (
                          <div key={child.id} className="flex items-center justify-between py-1">
                            <span className="text-[12px] text-gray-500">{child.breakdown_type}</span>

                            <span
                              className={`text-[12px] font-medium ${
                                Number(child.amount) < 0 ? 'text-red-500' : 'text-green-600'
                              }`}
                            >
                              ₹ {Math.abs(Number(child.amount)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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

export default PaymentReconcileDetails;
