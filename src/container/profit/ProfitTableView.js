import React, { useEffect, useState } from 'react';
import { Table, Modal, Checkbox, Tooltip, Dropdown, Menu, Button, Row, Col } from 'antd';
import {
  RightOutlined,
  DownOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfitData, exportProfitabilityDetails } from '../../redux/dashboard/actionCreator';

// Formatting Helpers
const formatNumber = (val) => {
  if (val === undefined || val === null || val === '') return '0.00';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : Number(val);
  if (Number.isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatInteger = (val) => {
  if (val === undefined || val === null || val === '') return '0';
  const num = typeof val === 'string' ? parseInt(val.replace(/[^0-9.-]+/g, ''), 10) : Number(val);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('en-IN');
};

const formatCompactCurrency = (val) => {
  if (val === undefined || val === null || val === '') return '₹0';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : Number(val);
  if (Number.isNaN(num)) return '₹0';
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
};

const renderCurrencyCell = (val) => {
  if (val === undefined || val === null || val === '') return '₹0.00';
  const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : Number(val);
  if (Number.isNaN(num) || num === 0) return '₹0.00';
  if (num < 0) {
    return `-₹${formatNumber(Math.abs(num))}`;
  }
  return `₹${formatNumber(num)}`;
};

export default function ProfitTableView() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, profitData, dateRange, search, channel: globalChannel } = useSelector((state) => state.dashboard);
  const totals = profitData?.totals || {};

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [openSettings, setOpenSettings] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const getLogo = (channel) => {
    const channelName = channel?.toLowerCase() || '';
    if (channelName.includes('amazon')) return '/icons/amazon.svg';
    if (channelName.includes('myntra')) return '/icons/myntraLogo.jpg';
    return null;
  };

  const [visibleColumns, setVisibleColumns] = useState([
    'channel',
    'grossqty',
    'netQty',
    'returnqty',
    'returnPercent',
    'netsales',
    'mpfees',
    'shipping',
    'profit',
    'profitPercent',
    'action',
  ]);

  const buildPayload = () => {
    return {
      filters: {
        channel: { IN: globalChannel },
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
        search,
      },
      pagination: {
        pageNo: 0,
        pageSize: 25,
      },
    };
  };

  useEffect(() => {
    const payload = buildPayload();
    dispatch(getProfitData(payload));
  }, [dispatch, dateRange, search, globalChannel]);

  const handleExport = async (format = 'xlsx') => {
    try {
      setExportLoading(true);
      const payload = buildPayload();
      await dispatch(exportProfitabilityDetails(payload, format, '/amazon/profitability/details/export/'));
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    const handleHeaderAction = (event) => {
      if (event.detail === 'export') {
        handleExport();
      }
    };

    window.addEventListener('headerAction', handleHeaderAction);
    return () => {
      window.removeEventListener('headerAction', handleHeaderAction);
    };
  }, [dispatch, dateRange, globalChannel, search]);

  const exportMenu = (
    <Menu>
      <Menu.Item
        key="xlsx"
        icon={<FileExcelOutlined style={{ color: '#10b981' }} />}
        onClick={() => handleExport('xlsx')}
      >
        Excel (.xlsx)
      </Menu.Item>
      <Menu.Item
        key="csv"
        icon={<FileTextOutlined style={{ color: '#3b82f6' }} />}
        onClick={() => handleExport('csv')}
      >
        CSV (.csv)
      </Menu.Item>
    </Menu>
  );

  const tableData =
    profitData?.response?.map((item, index) => ({
      key: index,
      channel: item.channel,
      grossqty: item.grossqty,
      netQty: item.netqty,
      returnqty: item.returnqty,
      returnPercent: item.retpercent,
      netsales: item.netsales,
      netasp: item.netasp,
      net_discount: item.net_discount,
      mpfees: item.mpfees,
      shipping: item.shippingfees ?? item.shipping,
      adSpend: item.ads,
      stdCost: item.stdCost || 0,
      gst: item.gsttopay,
      profit: item.profit,
      grossprofit: item.grossprofit,
      profitPercent: item.profitmargin ?? item.grossprofitper,
      ...item,
    })) || [];

  const columns = [
    {
      title: 'Channel',
      dataIndex: 'channel',
      key: 'channel',
      width: 150,
      sorter: (a, b) => (a.channel || '').localeCompare(b.channel || ''),
      render: (value) => {
        const logo = getLogo(value);
        const parts = (value || '').split('-');
        const mainName = parts[0] || value;
        const subName = parts.length > 1 ? parts.slice(1).join(' ') : '';

        return (
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt={value}
                className="w-7 h-7 rounded-md object-contain border border-gray-100 p-0.5 shrink-0 bg-white"
              />
            ) : (
              <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                {(value || '').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-left leading-tight">
              <div className="font-bold text-[13px] text-[#111827]">{mainName}</div>
              {subName && <div className="text-[11px] text-[#9ca3af] font-medium">{subName}</div>}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Gross Qty',
      dataIndex: 'grossqty',
      key: 'grossqty',
      align: 'center',
      width: 85,
      sorter: (a, b) => (Number(a.grossqty) || 0) - (Number(b.grossqty) || 0),
      render: (v) => <span className="text-[13px] text-[#374151]">{v ?? 0}</span>,
    },
    {
      title: 'Net Qty',
      dataIndex: 'netQty',
      key: 'netQty',
      align: 'center',
      width: 85,
      sorter: (a, b) => (Number(a.netQty) || 0) - (Number(b.netQty) || 0),
      render: (v) => <span className="text-[13px] text-[#374151]">{v ?? 0}</span>,
    },
    {
      title: 'Return Qty',
      dataIndex: 'returnqty',
      key: 'returnqty',
      align: 'center',
      width: 85,
      sorter: (a, b) => (Number(a.returnqty) || 0) - (Number(b.returnqty) || 0),
      render: (v) => <span className="text-[13px] text-[#374151]">{v ?? 0}</span>,
    },
    {
      title: 'Return %',
      dataIndex: 'returnPercent',
      key: 'returnPercent',
      align: 'center',
      width: 85,
      sorter: (a, b) => (Number(a.returnPercent) || 0) - (Number(b.returnPercent) || 0),
      render: (v) => <span className="text-[13px] text-[#374151]">{v != null ? `${v}%` : '0%'}</span>,
    },
    {
      title: 'Net Sales',
      dataIndex: 'netsales',
      key: 'netsales',
      align: 'center',
      width: 110,
      sorter: (a, b) => (Number(a.netsales) || 0) - (Number(b.netsales) || 0),
      render: (v) => <span className="text-[13px] text-[#374151] font-medium">{renderCurrencyCell(v)}</span>,
    },
    {
      title: 'MP fees',
      dataIndex: 'mpfees',
      key: 'mpfees',
      align: 'center',
      width: 100,
      sorter: (a, b) => (Number(a.mpfees) || 0) - (Number(b.mpfees) || 0),
      render: (v) => <span className="text-[13px] text-[#374151]">{renderCurrencyCell(v)}</span>,
    },
    {
      title: 'Shipping',
      dataIndex: 'shipping',
      key: 'shipping',
      align: 'center',
      width: 100,
      sorter: (a, b) => (Number(a.shipping) || 0) - (Number(b.shipping) || 0),
      render: (v) => <span className="text-[13px] text-[#374151]">{renderCurrencyCell(v)}</span>,
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      align: 'center',
      width: 100,
      sorter: (a, b) => (Number(a.profit) || 0) - (Number(b.profit) || 0),
      render: (v) => <span className="text-[13px] text-[#374151]">{renderCurrencyCell(v)}</span>,
    },
    {
      title: 'Profit %',
      dataIndex: 'profitPercent',
      key: 'profitPercent',
      align: 'center',
      width: 95,
      sorter: (a, b) => (Number(a.profitPercent) || 0) - (Number(b.profitPercent) || 0),
      render: (v) => {
        const num = Number(v) || 0;
        const isPositive = num >= 0;
        return (
          <span className={`font-semibold text-[13px] ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {num > 0 ? `${num.toFixed(2)}%` : `${num.toFixed(2)}%`}
          </span>
        );
      },
    },
    {
      title: 'Actions',
      key: 'action',
      fixed: 'right',
      width: 65,
      align: 'center',
      render: (_, record) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() =>
              navigate('/admin/profit/profitTableView/details', {
                state: { channels: [record.channel], type: 'single' },
              })
            }
            className="w-[24px] h-[24px] rounded-full border border-[#dbe1e8] flex items-center justify-center cursor-pointer hover:border-gray-400 hover:text-black transition-all duration-200 mx-auto bg-white"
          >
            <RightOutlined style={{ fontSize: 10, color: '#6b7280' }} />
          </button>
        </div>
      ),
    },
  ];

  const allColumnsList = [
    { label: 'Channel', key: 'channel' },
    { label: 'Gross Qty', key: 'grossqty' },
    { label: 'Net Qty', key: 'netQty' },
    { label: 'Return Qty', key: 'returnqty' },
    { label: 'Return %', key: 'returnPercent' },
    { label: 'Net Sales', key: 'netsales' },
    { label: 'MP fees', key: 'mpfees' },
    { label: 'Shipping', key: 'shipping' },
    { label: 'Profit', key: 'profit' },
    { label: 'Profit %', key: 'profitPercent' },
    { label: 'Actions', key: 'action' },
  ];

  const handleSelectAll = (checked) => {
    if (checked) {
      setVisibleColumns(allColumnsList.map((col) => col.key));
    } else {
      setVisibleColumns(['channel', 'action']);
    }
  };

  const filteredColumns = columns.filter(
    (col) => col.key === 'channel' || col.key === 'action' || visibleColumns.includes(col.key || col.dataIndex),
  );

  // Pie chart data preparation
  const getChannelColor = (channelName, index) => {
    const name = (channelName || '').toLowerCase();
    if (name.includes('myntra')) return '#10b981';
    if (name.includes('amazon')) return '#3b82f6';
    if (name.includes('flipkart')) return '#f59e0b';
    const fallbackColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    return fallbackColors[index % fallbackColors.length];
  };

  const totalNetSales = Number(totals.netsales) || tableData.reduce((acc, row) => acc + (Number(row.netsales) || 0), 0);

  const pieData = tableData.map((item, index) => {
    const cleanName = (item.channel || '').split('-')[0] || item.channel || `Channel ${index + 1}`;
    return {
      name: cleanName,
      fullName: item.channel,
      value: Math.max(0, Number(item.netsales) || 0),
      color: getChannelColor(item.channel, index),
    };
  });

  return (
    <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-4 py-4 xl:px-6 pb-6 bg-[#f8fafc]">
      {/* Top Header / Breadcrumb area */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-[12px] text-[#6b7280] mb-1 font-medium">
          <span>Profit</span>
          <span>&gt;</span>
          <span className="text-[#374151]">Channel Wise Profit</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827] tracking-tight m-0">Channel Wise Profit</h1>
            <p className="text-[13px] text-[#6b7280] mt-0.5 mb-0">
              Compare sales, fees, costs and profit across all your sales channels
            </p>
          </div>

          <Dropdown overlay={exportMenu} trigger={['click']} placement="bottomRight">
            <Button
              loading={exportLoading}
              className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-[#374151] font-medium px-3.5 py-1.5 h-[36px] rounded-lg shadow-sm"
            >
              <DownloadOutlined style={{ fontSize: 13, color: '#10b981' }} />
              <span className="text-[13px]">Export</span>
              <DownOutlined style={{ fontSize: 10, color: '#9ca3af' }} />
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* 4 KPI Summary Cards using Ant Design Row/Col */}
      <Row gutter={[16, 16]} className="mb-5">
        {/* Card 1: Total Net Sales */}
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow duration-200 h-full">
            <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[#6b7280]">Total Net Sales</div>
              <div className="text-[21px] font-bold text-[#111827] mt-0.5 tracking-tight truncate">
                ₹{formatNumber(totals.netsales)}
              </div>
              <div className="text-[12px] font-semibold text-[#10b981] flex items-center gap-1 mt-1">
                <span>↑</span>
                <span>12.5% vs previous period</span>
              </div>
            </div>
          </div>
        </Col>

        {/* Card 2: Total Units Sold */}
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow duration-200 h-full">
            <div className="w-12 h-12 rounded-xl bg-[#eff6ff] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[#6b7280]">Total Units Sold</div>
              <div className="text-[21px] font-bold text-[#111827] mt-0.5 tracking-tight truncate">
                {formatInteger(totals.netqty ?? totals.grossqty ?? 0)}
              </div>
              <div className="text-[12px] font-semibold text-[#10b981] flex items-center gap-1 mt-1">
                <span>↑</span>
                <span>15.8% vs previous period</span>
              </div>
            </div>
          </div>
        </Col>

        {/* Card 3: Total Profit */}
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow duration-200 h-full">
            <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] flex items-center justify-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[#6b7280]">Total Profit</div>
              <div className="text-[21px] font-bold text-[#111827] mt-0.5 tracking-tight truncate">
                ₹{formatNumber(totals.profit)}
              </div>
              <div className="text-[12px] font-semibold text-[#10b981] flex items-center gap-1 mt-1">
                <span>↑</span>
                <span>{totals.profitmargin ?? totals.grossprofitper ?? 0}% Profit Margin</span>
              </div>
            </div>
          </div>
        </Col>

        {/* Card 4: Overall Profit % */}
        <Col xs={24} sm={12} md={12} lg={6} xl={6}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow duration-200 h-full">
            <div className="w-12 h-12 rounded-xl bg-[#f3e8ff] flex items-center justify-center shrink-0">
              <span className="text-[22px] font-bold text-[#8b5cf6]">%</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[#6b7280]">Overall Profit %</div>
              <div className="text-[21px] font-bold text-[#111827] mt-0.5 tracking-tight truncate">
                {totals.profitmargin ?? totals.grossprofitper ?? 0}%
              </div>
              <div className="text-[12px] font-semibold text-[#10b981] flex items-center gap-1 mt-1">
                <span>↑</span>
                <span>22.1% vs previous period</span>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Main Content Area: 2 Columns using Ant Design Row/Col */}
      <Row gutter={[20, 20]} align="top">
        {/* Left Column: Channel Performance Table */}
        <Col xs={24} sm={24} md={24} lg={16} xl={17}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-bold text-[#111827] m-0">Channel Performance</h2>
            </div>

            <Table
              bordered={false}
              columns={filteredColumns}
              dataSource={tableData}
              showSorterTooltip={false}
              loading={loading}
              tableLayout="auto"
              locale={{ emptyText: 'No Data Found' }}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
              }}
              onChange={(pag) => {
                setPagination(pag);
              }}
              size="middle"
              scroll={{ x: 900 }}
              className="
                [&_.ant-table]:!bg-transparent
                [&_.ant-table-thead>tr>th]:!bg-[#f9fafb]
                [&_.ant-table-thead>tr>th]:!text-[12px]
                [&_.ant-table-thead>tr>th]:!font-semibold
                [&_.ant-table-thead>tr>th]:!text-[#4b5563]
                [&_.ant-table-thead>tr>th]:!border-b
                [&_.ant-table-thead>tr>th]:!border-[#f1f5f9]
                [&_.ant-table-tbody>tr>td]:!text-[13px]
                [&_.ant-table-tbody>tr>td]:!border-b
                [&_.ant-table-tbody>tr>td]:!border-[#f8fafc]
                [&_.ant-table-tbody>tr:hover>td]:!bg-[#f8fafc]
                [&_.ant-table-cell]:!px-2.5
                [&_.ant-table-cell]:!py-3.5
              "
              summary={() => (
                <Table.Summary.Row className="bg-[#f9fafb] font-bold border-t border-gray-200">
                  <Table.Summary.Cell index={0} className="font-bold text-[13px] text-[#111827]">
                    Total
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center" className="font-bold text-[13px] text-[#111827]">
                    {totals.grossqty ?? 0}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center" className="font-bold text-[13px] text-[#111827]">
                    {totals.netqty ?? 0}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="center" className="font-bold text-[13px] text-[#111827]">
                    {totals.returnqty ?? 0}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="center" className="font-bold text-[13px] text-[#111827]">
                    {totals.retpercent != null ? `${totals.retpercent}%` : '0%'}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="center" className="font-bold text-[13px] text-[#111827]">
                    {renderCurrencyCell(totals.netsales)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="center" className="font-bold text-[13px] text-[#111827]">
                    {renderCurrencyCell(totals.mpfees)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} align="center" className="font-bold text-[13px] text-[#111827]">
                    {renderCurrencyCell(totals.shippingfees ?? totals.shipping)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={8} align="center" className="font-bold text-[13px] text-[#111827]">
                    {renderCurrencyCell(totals.profit)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={9} align="center" className="font-bold text-[13px] text-[#10b981]">
                    {totals.profitmargin ?? totals.grossprofitper ?? 0}%
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={10} align="center" />
                </Table.Summary.Row>
              )}
            />
          </div>
        </Col>

        {/* Right Column: Net Sales Contribution Donut Chart */}
        <Col xs={24} sm={24} md={24} lg={8} xl={7}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-[16px] font-bold text-[#111827] mb-2">Net Sales Contribution</h2>

            {/* Donut Chart */}
            <div className="relative w-full h-[220px] flex items-center justify-center my-3">
              {totalNetSales > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <RechartsTooltip
                      formatter={(val) => [`₹${formatNumber(val)}`, 'Net Sales']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                      }}
                    />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={pieData.length > 1 ? 3 : 0}
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center text-gray-400 text-sm">No Sales Data</div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[20px] font-bold text-[#111827] leading-tight tracking-tight">
                  {formatCompactCurrency(totals.netsales ?? totalNetSales)}
                </span>
                <span className="text-[11px] font-medium text-[#9ca3af] mt-0.5">Net Sales</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="mt-4 space-y-2.5">
              {pieData.map((item, idx) => {
                const pct = totalNetSales > 0 ? ((item.value / totalNetSales) * 100).toFixed(1) : '0.0';
                return (
                  <div key={idx} className="flex items-center justify-between text-[13px] py-1 border-b border-gray-50 last:border-none">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-[#374151]">{item.name}</span>
                    </div>
                    <span className="text-[#6b7280] text-[12px] font-medium">{pct}%</span>
                    <span className="font-semibold text-[#111827]">₹{formatNumber(item.value)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Col>
      </Row>

      {/* Optional Customize Columns Modal */}
      <Modal
        title="Customize Your Columns"
        open={openSettings}
        onCancel={() => setOpenSettings(false)}
        footer={null}
        width={900}
      >
        <div className="mb-3 flex items-center gap-2">
          <Checkbox
            checked={visibleColumns.length === allColumnsList.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
          >
            Select All
          </Checkbox>
        </div>

        <div className="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {allColumnsList.map((col) => (
            <div
              key={col.key}
              className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded whitespace-nowrap"
            >
              <Checkbox
                className="whitespace-nowrap"
                checked={visibleColumns.includes(col.key)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setVisibleColumns([...visibleColumns, col.key]);
                  } else {
                    setVisibleColumns(visibleColumns.filter((c) => c !== col.key));
                  }
                }}
              >
                {col.label}
              </Checkbox>
            </div>
          ))}
        </div>
      </Modal>
    </main>
  );
}
