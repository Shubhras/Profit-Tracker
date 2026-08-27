import React, { useEffect, useState } from 'react';
import { Table, Tooltip, Modal, Button, Dropdown } from 'antd';
import moment from 'moment';
import {
  InfoCircleOutlined,
  SearchOutlined,
  // FilterOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  EyeOutlined,
  ExportOutlined,
  DownOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getSettledOrders, getAllSettlement } from '../../redux/reconcilePayment/actionCreator';
import { DataService } from '../../config/dataService/dataService';

function OrderSettlement() {
  const dispatch = useDispatch();

  const { dateRange: globalDateRange } = useSelector((state) => state.dashboard);
  const [dateRange, setDateRange] = useState(() => {
    if (globalDateRange?.fromDate && globalDateRange?.endDate) {
      return [moment(globalDateRange.fromDate), moment(globalDateRange.endDate)];
    }
    return [moment().startOf('month'), moment().endOf('month')];
  });
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    if (globalDateRange?.fromDate && globalDateRange?.endDate) {
      const start = moment(globalDateRange.fromDate);
      const end = moment(globalDateRange.endDate);
      if (start.isValid() && end.isValid()) {
        setDateRange([start, end]);
      }
    }
  }, [globalDateRange]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const [exportLoading, setExportLoading] = useState(false);

  const formatDateStr = (dateObj) => {
    if (!dateObj) return '';
    if (typeof dateObj.format === 'function') {
      return dateObj.format('YYYY-MM-DD');
    }
    if (dateObj instanceof Date) {
      return dateObj.toISOString().split('T')[0];
    }
    return String(dateObj);
  };

  const handleExport = async (format = 'xlsx') => {
    try {
      setExportLoading(true);
      let startDate = '';
      let endDate = '';
      if (dateRange && dateRange[0] && dateRange[1]) {
        startDate = formatDateStr(dateRange[0]);
        endDate = formatDateStr(dateRange[1]);
      } else {
        const today = new Date();
        [startDate] = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T');
        [endDate] = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T');
      }

      const isSummary = activeTab === 'summary';
      const endpoint = isSummary
        ? `/amazon/order-settlement-dashboard/export/?start_date=${startDate}&end_date=${endDate}&search=${encodeURIComponent(
            debouncedSearch || '',
          )}&format=${format}`
        : `/amazon/settlement-summary/export/?start_date=${startDate}&end_date=${endDate}&search=${encodeURIComponent(
            debouncedSearch || '',
          )}&format=${format}`;

      const response = await DataService.get(endpoint, { responseType: 'blob' });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = isSummary ? `order_settlement_dashboard.${format}` : `settlement_summary.${format}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const exportMenuItems = [
    {
      key: 'xlsx',
      label: 'Excel (.xlsx)',
      icon: <FileExcelOutlined style={{ color: '#10b981' }} />,
      onClick: () => handleExport('xlsx'),
    },
    {
      key: 'csv',
      label: 'CSV (.csv)',
      icon: <FileTextOutlined style={{ color: '#3b82f6' }} />,
      onClick: () => handleExport('csv'),
    },
  ];

  const {
    settledData,
    settledLoading,
    allsettlementData,
    loading: allSettlementLoading,
  } = useSelector((state) => state.reconcilePayment);

  useEffect(() => {
    let startDate = '';
    let endDate = '';

    if (dateRange && dateRange[0] && dateRange[1]) {
      startDate = formatDateStr(dateRange[0]);
      endDate = formatDateStr(dateRange[1]);
    } else {
      const today = new Date();
      [startDate] = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T');
      [endDate] = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T');
    }

    if (activeTab === 'summary') {
      dispatch(getSettledOrders(pagination.current, pagination.pageSize, debouncedSearch, startDate, endDate));
    }

    if (activeTab === 'settlement') {
      dispatch(
        getAllSettlement({
          start_date: startDate,
          end_date: endDate,
          search: debouncedSearch,
        }),
      );
    }
  }, [dispatch, activeTab, pagination.current, pagination.pageSize, debouncedSearch, dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const kpiStats =
    (activeTab === 'summary' ? settledData?.kpi_stats : allsettlementData?.kpi_stats) ||
    settledData?.kpi_stats ||
    allsettlementData?.kpi_stats ||
    {};

  const topCards = [
    {
      title: 'Total Orders',
      value: kpiStats?.total_orders !== undefined ? Number(kpiStats.total_orders).toLocaleString('en-IN') : '0',
      sub: 'Order Volume',
      icon: <ShoppingCartOutlined />,
      iconBg: 'bg-[#eff6ff]',
      iconColor: 'text-[#2563eb]',
      valueColor: 'text-[#2563eb]',
    },

    {
      title: 'Total GMV',
      value: `₹ ${
        kpiStats?.total_gmv !== undefined
          ? Number(kpiStats.total_gmv).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '0.00'
      }`,
      sub: 'Gross Sales',
      icon: <DollarOutlined />,
      iconBg: 'bg-[#ecfdf3]',
      iconColor: 'text-[#16a34a]',
      valueColor: 'text-[#16a34a]',
    },

    {
      title: 'Total Settlements',
      value: `₹ ${
        kpiStats?.total_settlements !== undefined
          ? Number(kpiStats.total_settlements).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '0.00'
      }`,
      sub: 'Released Payouts',
      icon: <CheckCircleOutlined />,
      iconBg: 'bg-[#f5f3ff]',
      iconColor: 'text-[#7c3aed]',
      valueColor: 'text-[#7c3aed]',
    },

    {
      title: 'Pending Settlements',
      value: `₹ ${
        kpiStats?.pending_settlements !== undefined
          ? Number(kpiStats.pending_settlements).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '0.00'
      }`,
      sub: 'Deferred Payouts',
      icon: <ClockCircleOutlined />,
      iconBg: 'bg-[#fff7ed]',
      iconColor: 'text-[#f97316]',
      valueColor: 'text-[#f97316]',
    },

    {
      title: 'Settlement Success Rate',
      value: `${kpiStats?.settlement_success_rate !== undefined ? kpiStats.settlement_success_rate : 0}%`,
      sub: 'Released / Total',
      icon: <RiseOutlined />,
      iconBg: 'bg-[#ecfeff]',
      iconColor: 'text-[#0891b2]',
      valueColor: 'text-[#0891b2]',
    },
  ];

  const dataSource =
    activeTab === 'summary'
      ? settledData?.results?.map((item, index) => ({
          key: item.id || index,
          transactionId: item.transaction_id,
          orderId: item.order_id,
          transactionType: item.transaction_type,
          transactionStatus: item.transaction_status,
          description: item.description,
          postedDate: item.posted_date,
          totalAmount: item.total_amount,
          currencyCode: item.currency_code,
          breakdowns: item.breakdowns || [],
          relatedIdentifiers: item.related_identifiers || [],
        })) || []
      : allsettlementData?.results?.map((item, index) => ({
          key: item.settlement_date || index,

          // SAME COLUMN NAMES
          settlementDate: item.settlement_date,
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
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      align: 'center',
      width: 90,
      sorter: (a, b) => String(a.orderId || '').localeCompare(String(b.orderId || '')),
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Transaction Type',
      dataIndex: 'transactionType',
      key: 'transactionType',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.transactionType || '').localeCompare(String(b.transactionType || '')),
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Status',
      dataIndex: 'transactionStatus',
      key: 'transactionStatus',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.transactionStatus || '').localeCompare(String(b.transactionStatus || '')),
      render: (status) => {
        const color = status === 'DEFERRED' ? '#f59e0b' : status === 'RELEASED' ? '#16a34a' : '#2563eb';

        return (
          <span
            className="px-2 py-1 rounded-full text-[10px] font-semibold"
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
      key: 'description',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.description || '').localeCompare(String(b.description || '')),
      ellipsis: true,
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Posted Date',
      dataIndex: 'postedDate',
      key: 'postedDate',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.postedDate - b.postedDate,
      render: (date) => {
        const formattedDate = date ? new Date(date).toLocaleString('en-IN') : '-';

        return (
          <Tooltip title={formattedDate} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
              {formattedDate}
            </span>
          </Tooltip>
        );
      },
    },

    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
      render: (amount) => {
        const value = Number(amount || 0);

        return (
          <span className={`font-semibold ${value < 0 ? 'text-red-500' : 'text-green-600'}`}>
            ₹ {Math.abs(value).toFixed(2)}
          </span>
        );
      },
    },

    {
      title: 'Currency',
      dataIndex: 'currencyCode',
      key: 'currencyCode',
      align: 'center',
      width: 70,
      sorter: (a, b) => String(a.currencyCode || '').localeCompare(String(b.currencyCode || '')),
    },
    {
      title: '',
      key: 'view',
      align: 'center',
      width: 30,
      render: (record) => (
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

  const settlementColumns = [
    {
      title: 'Settlement Date',
      dataIndex: 'settlementDate',
      key: 'settlementDate',
      align: 'center',
      width: 100,
      sorter: (a, b) => a.settlementDate - b.settlementDate,
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      align: 'center',
      width: 100,
      render: (v) => `₹ ${Number(v || 0).toFixed(2)}`,
      sorter: (a, b) => a.sales - b.sales,
    },
    {
      title: 'Refunds',
      dataIndex: 'refunds',
      key: 'refunds',
      align: 'center',
      width: 100,
      render: (v) => `₹ ${Number(v || 0).toFixed(2)}`,
      sorter: (a, b) => a.refunds - b.refunds,
    },
    {
      title: 'Expenses',
      dataIndex: 'expenses',
      key: 'expenses',
      align: 'center',
      width: 100,
      render: (v) => `₹ ${Number(v || 0).toFixed(2)}`,
      sorter: (a, b) => a.expenses - b.expenses,
    },
    {
      title: 'Others',
      dataIndex: 'others',
      key: 'others',
      align: 'center',
      width: 100,
      render: (v) => `₹ ${Number(v || 0).toFixed(2)}`,
      sorter: (a, b) => a.others - b.others,
    },
    {
      title: 'Payout Amount',
      dataIndex: 'payoutAmount',
      key: 'payoutAmount',
      align: 'center',
      width: 120,
      render: (v) => `₹ ${Number(v || 0).toFixed(2)}`,
      sorter: (a, b) => a.payoutAmount - b.payoutAmount,
    },
    {
      title: 'Transactions',
      dataIndex: 'totalTransactions',
      key: 'totalTransactions',
      align: 'center',
      width: 100,
      sorter: (a, b) => a.totalTransactions - b.totalTransactions,
    },
    {
      title: '',
      key: 'view',
      align: 'center',
      width: 30,
      render: (record) => (
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
      <div className="min-h-screen bg-[#f6f8fc] p-3 md:p-2 sm:p-3">
        {' '}
        {/* HEADER */}
        <div className="mb-2 flex items-start justify-between lg:flex-col lg:gap-2">
          {' '}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] md:text-[18px] sm:text-[16px] mb-0 font-semibold text-[#111827] leading-none">
                Order & Settlements
              </h1>
              <InfoCircleOutlined className="text-[12px] text-[#9ca3af]" />
            </div>

            <p className="mt-1 text-[12px] text-[#6b7280]">
              Track order volume, GMV and settlement status across all marketplaces.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#6b7280] lg:flex-wrap">
            {' '}
            <span>Payment Reconciliation</span>
            <span>{'>'}</span>
            <span className="font-semibold text-[#2563eb]">Order & Settlements</span>
          </div>
        </div>
        {/* TOP CARDS */}
        <div className="grid grid-cols-5 lg:grid-cols-2 md:grid-cols-1 gap-2 mb-2">
          {' '}
          {topCards.map((item, index) => (
            <div key={index} className="rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 sm:px-2">
              <div className="flex items-center gap-2">
                {/* Icon */}
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[12px] ${item.iconBg} ${item.iconColor}`}
                >
                  {item.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Title */}
                  <p className="truncate text-[11px] leading-[11px] font-medium text-[#6b7280]">{item.title}</p>

                  {/* Value */}
                  <h2 className={`mt-[1px] truncate text-[16px] font-bold leading-none ${item.valueColor}`}>
                    {item.value}
                  </h2>

                  {/* Bottom Text */}
                  <p className="mt-[2px] truncate text-[10px] leading-none text-[#9ca3af]">{item.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* MAIN */}
        <div className="w-full">
          {' '}
          {/* LEFT */}
          <div className="rounded-lg p-2 border border-[#e5e7eb] bg-white overflow-hidden">
            {/* TABS */}
            <div className="flex items-center gap-6 border-b border-[#edf0f2] px-2 py-2 sm:gap-3 sm:flex-wrap">
              {' '}
              {[
                { label: 'Order Summary', value: 'summary' },
                { label: 'All Settlement', value: 'settlement' },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.value);

                    setPagination({
                      current: 1,
                      pageSize: 10,
                    });
                  }}
                  className={`pb-0 text-[12px] font-semibold ${
                    activeTab === item.value ? 'border-b-2 border-[#16a34a] text-[#16a34a]' : 'text-[#6b7280]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* FILTERS */}
            <div className="flex items-center gap-3 border-b border-[#edf0f2] px-4 py-3 lg:flex-wrap">
              <div className="flex items-center gap-2 ml-auto md:ml-0 md:w-full">
                <div className="relative md:w-full">
                  <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search Order ID / SKU"
                    className="py-1 w-[180px] md:w-full rounded-l border border-[#e5e7eb] pl-3 pr-9 text-[12px] outline-none"
                  />

                  <SearchOutlined className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#9ca3af]" />
                </div>
                <Dropdown menu={{ items: exportMenuItems }} trigger={['click']} placement="bottomRight">
                  <Button
                    type="primary"
                    icon={<ExportOutlined />}
                    loading={exportLoading}
                    className="bg-[#10b981] hover:bg-[#059669] border-none text-white font-medium px-3 h-[30px] rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    Export <DownOutlined style={{ fontSize: 10 }} />
                  </Button>
                </Dropdown>
              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto w-full">
              <Table
                columns={activeTab === 'summary' ? columns : settlementColumns}
                dataSource={dataSource}
                showSorterTooltip={false}
                loading={activeTab === 'summary' ? settledLoading : allSettlementLoading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: activeTab === 'summary' ? settledData?.count || 0 : allsettlementData?.count || 0,
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
                scroll={{ x: 800, y: 500 }}
                className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-[6px]
  "
              />
            </div>
          </div>
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
        width={500}
        styles={{
          body: {
            padding: '12px 15px',
          },
        }}
      >
        {selectedRecord && selectedRecord.settlementDate ? (
          <div className="space-y-4">
            <div>
              <h3 className="mb-1 text-[14px] font-semibold text-gray-800">Settlement Details</h3>
              <p className="text-[12px] text-gray-500 mb-3">
                Settlement Date: <span className="font-semibold text-gray-700">{selectedRecord.settlementDate}</span>
              </p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2 rounded bg-gray-50 border text-center">
                  <span className="text-[11px] text-gray-500 block">Sales</span>
                  <span className="text-[13px] font-semibold text-green-600">
                    ₹ {Number(selectedRecord.sales || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded bg-gray-50 border text-center">
                  <span className="text-[11px] text-gray-500 block">Refunds</span>
                  <span className="text-[13px] font-semibold text-red-500">
                    ₹ {Number(selectedRecord.refunds || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded bg-gray-50 border text-center">
                  <span className="text-[11px] text-gray-500 block">Expenses</span>
                  <span className="text-[13px] font-semibold text-red-500">
                    ₹ {Number(selectedRecord.expenses || 0).toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded bg-gray-50 border text-center">
                  <span className="text-[11px] text-gray-500 block">Payout Amount</span>
                  <span className="text-[13px] font-semibold text-blue-600">
                    ₹ {Number(selectedRecord.payoutAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedRecord.transactions?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-[12px] font-semibold text-gray-700">
                    Transactions ({selectedRecord.totalTransactions || selectedRecord.transactions.length})
                  </h4>
                  <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                    {selectedRecord.transactions.map((txn, idx) => (
                      <div
                        key={txn.id || idx}
                        className="flex items-center justify-between p-2 rounded border border-gray-100 bg-white text-[12px]"
                      >
                        <div>
                          <span className="font-medium text-gray-800 block">
                            {txn.transaction_type} - {txn.description || 'N/A'}
                          </span>
                          <span className="text-[10px] text-gray-400">ID: {txn.transaction_id}</span>
                        </div>
                        <span
                          className={`font-semibold ${
                            Number(txn.total_amount) < 0 ? 'text-red-500' : 'text-green-600'
                          }`}
                        >
                          ₹ {Math.abs(Number(txn.total_amount || 0)).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          selectedRecord && (
            <div className="space-y-4">
              {/* Breakdown Section */}
              <div>
                <h3 className="mb-3 text-[13px] font-semibold text-gray-800">Breakdown Summary</h3>
                <div className="mb-2 font-semibold text-[13px] text-gray-800">
                  {selectedRecord?.transactionType} : ₹ {Math.abs(Number(selectedRecord?.totalAmount || 0)).toFixed(2)}
                </div>

                <div className="space-y-2">
                  {selectedRecord.breakdowns?.map((item) => (
                    <div key={item.id} className="rounded-md border border-gray-200 p-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-gray-800">{item.breakdown_type}</span>

                        <span
                          className={`text-[13px] font-semibold ${
                            Number(item.amount) < 0 ? 'text-red-500' : 'text-green-600'
                          }`}
                        >
                          ₹ {Math.abs(Number(item.amount)).toFixed(2)}
                        </span>
                      </div>

                      {item.children?.length > 0 && (
                        <div className="mt-2 space-y-1 border-l-2 border-gray-200 pl-3">
                          {item.children.map((child) => (
                            <div key={child.id} className="flex items-center justify-between">
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
          )
        )}
      </Modal>
    </>
  );
}

export default OrderSettlement;
