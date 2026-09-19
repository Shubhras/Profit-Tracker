import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Table, Spin, Select, Button, Input, Dropdown, Tooltip } from 'antd';
import {
  ExportOutlined,
  DownOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  SearchOutlined,
  DollarCircleOutlined,
  CarOutlined,
  AuditOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { getPaymentReconcileDetails, exportProfitabilityDetails } from '../../redux/dashboard/actionCreator';

const parseAmount = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/[₹,\s]/g, '');
  return parseFloat(cleaned) || 0;
};

const formatCurrency = (val) => {
  const num = Math.abs(parseAmount(val));
  return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatMpName = (name) => {
  if (!name) return 'Amazon';
  const clean = name.replace(/[-_]india$/i, '').trim();
  if (clean.toLowerCase() === 'amazon') return 'Amazon';
  if (clean.toLowerCase() === 'flipkart') return 'Flipkart';
  if (clean.toLowerCase() === 'meesho') return 'Meesho';
  if (clean.toLowerCase() === 'myntra') return 'Myntra';
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const channelLogoMap = {
  Amazon: '/icons/amazon.svg',
  'Amazon-India': '/icons/amazon.svg',
  amazon: '/icons/amazon.svg',
  Flipkart: '/icons/flipkart.png',
  'Flipkart-India': '/icons/flipkart.png',
  flipkart: '/icons/flipkart.png',
  Myntra: '/icons/myntraLogo.jpg',
  'Myntra-India': '/icons/myntraLogo.jpg',
  myntra: '/icons/myntraLogo.jpg',
  Meesho: '/icons/meesho.png',
  'Meesho-India': '/icons/meesho.png',
  meesho: '/icons/meesho.png',
  Blinkit: '/icons/blinkit.png',
  Zepto: '/icons/zepto.png',
  Nykaa: '/icons/nykaa.png',
  Ajio: '/icons/ajio.png',
  Shopify: '/icons/shopify.png',
  Swiggy: '/icons/swiggy.png',
};

export default function FeeLeaks() {
  const dispatch = useDispatch();
  const { dateRange, profitData, loading, channel: globalChannel } = useSelector((state) => state.dashboard);
  const profile = useSelector((state) => state.auth?.profile);

  const totalsData = useMemo(() => profitData?.totals || {}, [profitData]);

  // Filter & Pagination States
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const dataSource = useMemo(() => {
    const rows =
      profitData?.response?.map((item, index) => ({
        ...item,
        key: index,
        asin: item.asin || item.child_sku || item.seller_sku || '-',
        name: item.name || '',
        channel: item.channel || '-',
        redirecturl: item.redirecturl,
        fees_leaks: item.fees_leaks || '₹0.0',
        shipping_leaks: item.shipping_leaks || '₹0.0',
        mp_gst_leaks: item.mp_gst_leaks || '₹0.0',
        tcs_leaks: item.tcs_leaks || '₹0.0',
        tds_leaks: item.tds_leaks || '₹0.0',
        unsettled_not_paid: item.unsettled_not_paid || '₹0.0',
        actual_fees: item.actual_fees || '₹0.0',
        actual_shipping_charges: item.actual_shipping_charges || '₹0.0',
        actual_mp_gst: item.actual_mp_gst || '₹0.0',
        actual_tcs: item.actual_tcs || '₹0.0',
        actual_tds: item.actual_tds || '₹0.0',
        expected_settlement: item.expected_settlement || item.exp_settlement || '₹0.0',
      })) || [];

    return rows;
  }, [profitData]);

  const marketplaceOptions = useMemo(() => {
    const connectedChannels = profile?.connected_channels || [];
    const activeChannels = connectedChannels.length > 0 ? connectedChannels : globalChannel || [];

    const options = [{ label: 'All Marketplaces', value: 'all' }];
    const addedValues = new Set();

    if (activeChannels.length > 0) {
      activeChannels.forEach((ch) => {
        const lower = String(ch).toLowerCase();
        if (lower.includes('amazon') && !addedValues.has('amazon')) {
          options.push({ label: 'Amazon', value: 'amazon' });
          addedValues.add('amazon');
        } else if (lower.includes('myntra') && !addedValues.has('myntra')) {
          options.push({ label: 'Myntra', value: 'myntra' });
          addedValues.add('myntra');
        } else if (lower.includes('flipkart') && !addedValues.has('flipkart')) {
          options.push({ label: 'Flipkart', value: 'flipkart' });
          addedValues.add('flipkart');
        } else if (lower.includes('meesho') && !addedValues.has('meesho')) {
          options.push({ label: 'Meesho', value: 'meesho' });
          addedValues.add('meesho');
        }
      });
    }

    if (options.length === 1 && dataSource.length > 0) {
      const presentMp = new Set(dataSource.map((row) => formatMpName(row.channel || 'Amazon')));
      presentMp.forEach((mpName) => {
        const val = mpName.toLowerCase();
        if (!addedValues.has(val)) {
          options.push({ label: mpName, value: val });
          addedValues.add(val);
        }
      });
    }

    return options;
  }, [profile, globalChannel, dataSource]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMarketplace, debouncedSearch, globalChannel, dateRange]);

  const getEffectiveChannels = (mp, globalCh) => {
    if (mp === 'amazon') {
      return ['Amazon-India'];
    }
    if (mp && mp !== 'all') {
      return [mp];
    }
    return globalCh || [];
  };

  const buildPayload = () => {
    return {
      filters: {
        channel: {
          IN: getEffectiveChannels(selectedMarketplace, globalChannel),
        },
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
      },
      pagination: {
        pageNo: currentPage - 1,
        pageSize: pageSize,
      },
    };
  };

  // Fetch reconciliation data using getPaymentReconcileDetails
  useEffect(() => {
    dispatch(getPaymentReconcileDetails(buildPayload()));
  }, [dateRange, globalChannel, selectedMarketplace, debouncedSearch, currentPage, pageSize]);

  // Summary statistics for 5 leak categories
  const summaryStats = useMemo(() => {
    let totFeesLeak = Math.abs(parseAmount(totalsData?.total_fees_leaks || totalsData?.fees_leaks));
    let totShipLeak = Math.abs(parseAmount(totalsData?.total_shipping_leaks || totalsData?.shipping_leaks));
    let totGstLeak = Math.abs(parseAmount(totalsData?.total_mp_gst_leaks || totalsData?.mp_gst_leaks));
    let totTcsLeak = Math.abs(parseAmount(totalsData?.total_tcs_leaks || totalsData?.tcs_leaks));
    let totTdsLeak = Math.abs(parseAmount(totalsData?.total_tds_leaks || totalsData?.tds_leaks));
    let totUnsettled = Math.abs(
      parseAmount(
        totalsData?.total_settlement_hold ||
        totalsData?.settlement_hold ||
        totalsData?.total_unsettled_not_paid ||
        totalsData?.unsettled_not_paid
      )
    );

    if (totFeesLeak === 0 && totShipLeak === 0 && totTcsLeak === 0 && dataSource.length > 0) {
      dataSource.forEach((row) => {
        totFeesLeak += Math.abs(parseAmount(row.fees_leaks));
        totShipLeak += Math.abs(parseAmount(row.shipping_leaks));
        totGstLeak += Math.abs(parseAmount(row.mp_gst_leaks));
        totTcsLeak += Math.abs(parseAmount(row.tcs_leaks));
        totTdsLeak += Math.abs(parseAmount(row.tds_leaks));
        totUnsettled += Math.abs(parseAmount(row.unsettled_not_paid || row.settlement_hold));
      });
    }

    const totalLeaksSum = totFeesLeak + totShipLeak + totGstLeak + totTcsLeak + totTdsLeak;

    const feesPct = totalLeaksSum ? ((totFeesLeak / totalLeaksSum) * 100).toFixed(1) : '0';
    const shipPct = totalLeaksSum ? ((totShipLeak / totalLeaksSum) * 100).toFixed(1) : '0';
    const gstPct = totalLeaksSum ? ((totGstLeak / totalLeaksSum) * 100).toFixed(1) : '0';
    const tcsPct = totalLeaksSum ? ((totTcsLeak / totalLeaksSum) * 100).toFixed(1) : '0';
    const tdsPct = totalLeaksSum ? ((totTdsLeak / totalLeaksSum) * 100).toFixed(1) : '0';

    return {
      totFeesLeak,
      totShipLeak,
      totGstLeak,
      totTcsLeak,
      totTdsLeak,
      totUnsettled,
      totalLeaksSum,
      feesPct,
      shipPct,
      gstPct,
      tcsPct,
      tdsPct,
    };
  }, [dataSource, totalsData]);

  // Marketplace leak breakdown for sidebar based on dropdown channels and summary cards total
  const topMarketplaces = useMemo(() => {
    const channelsInDropdown = marketplaceOptions.filter((opt) => opt.value !== 'all');
    const totalLeaksSum = summaryStats.totalLeaksSum || 0;

    const targetChannels = channelsInDropdown.length > 0 ? channelsInDropdown : [{ label: 'Amazon', value: 'amazon' }];

    return targetChannels.map((ch) => {
      const mpName = ch.label;
      const mpVal = String(ch.value).toLowerCase();

      let mpTotal = 0;
      const keyFromTotals = totalsData?.[`${mpVal}_leaks`] ?? totalsData?.[`${mpName.toLowerCase()}_leaks`];
      if (keyFromTotals !== undefined && keyFromTotals !== null && keyFromTotals !== '') {
        mpTotal = Math.abs(parseAmount(keyFromTotals));
      } else {
        dataSource.forEach((item) => {
          const itemChannel = String(item.channel || '').toLowerCase();
          const formattedName = formatMpName(item.channel);

          if (
            itemChannel.includes(mpVal) ||
            mpVal.includes(itemChannel) ||
            formattedName.toLowerCase() === mpName.toLowerCase()
          ) {
            mpTotal +=
              Math.abs(parseAmount(item.fees_leaks)) +
              Math.abs(parseAmount(item.shipping_leaks)) +
              Math.abs(parseAmount(item.mp_gst_leaks)) +
              Math.abs(parseAmount(item.tcs_leaks)) +
              Math.abs(parseAmount(item.tds_leaks));
          }
        });
      }

      if (targetChannels.length === 1 && totalLeaksSum > 0 && mpTotal === 0) {
        mpTotal = totalLeaksSum;
      }

      const percentage = totalLeaksSum > 0 ? ((mpTotal / totalLeaksSum) * 100).toFixed(2) : '0.00';

      const logoSrc =
        channelLogoMap[mpName] ||
        channelLogoMap[mpVal] ||
        (mpVal.includes('amazon') ? '/icons/amazon.svg' : null) ||
        (mpVal.includes('flipkart') ? '/icons/flipkart.png' : null) ||
        (mpVal.includes('myntra') ? '/icons/myntraLogo.jpg' : null) ||
        (mpVal.includes('meesho') ? '/icons/meesho.png' : null) ||
        '/icons/others.png';

      return {
        name: mpName,
        rawAmount: mpTotal,
        amount: formatCurrency(mpTotal),
        percentage: `${percentage}%`,
        logo: logoSrc,
      };
    });
  }, [marketplaceOptions, summaryStats, dataSource, totalsData]);

  const totalMarketplacesAmount = useMemo(() => {
    return topMarketplaces.reduce((acc, item) => acc + (item.rawAmount ?? parseAmount(item.amount) ?? 0), 0);
  }, [topMarketplaces]);

  // Export handler
  const [exportLoading, setExportLoading] = useState(false);
  const handleExport = async (format = 'xlsx') => {
    try {
      setExportLoading(true);
      const payload = {
        filters: {
          channel: { IN: getEffectiveChannels(selectedMarketplace, globalChannel) },
          fromDate: dateRange?.fromDate || null,
          toDate: dateRange?.endDate || null,
          ...(searchQuery.trim() && { search: searchQuery.trim() }),
        },
      };
      await dispatch(exportProfitabilityDetails(payload, format, '/amazon/payment-reconcile/details/export/'));
    } catch (error) {
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

  const columns = [
    {
      title: 'ASIN',
      dataIndex: 'asin',
      key: 'asin',
      width: 50,
      align: 'center',
      ellipsis: true,
      render: (v, record) => {
        if (!record?.redirecturl) return <span className="font-semibold text-blue-600">{v || '-'}</span>;
        return (
          <Tooltip title={record.name} color="black" overlayInnerStyle={{ color: '#fff' }}>
            <button
              type="button"
              onClick={() => window.open(record.redirecturl, '_blank')}
              className="text-blue-500 hover:text-blue-600 underline font-semibold bg-transparent border-none p-0 cursor-pointer"
            >
              {v}
            </button>
          </Tooltip>
        );
      },
      sorter: (a, b) => String(a.asin || '').localeCompare(String(b.asin || '')),
    },
    {
      title: 'Fee Leaks',
      dataIndex: 'fees_leaks',
      key: 'fees_leaks',
      width: 60,
      ellipsis: true,
      align: 'center',
      sorter: (a, b) => parseAmount(a.fees_leaks) - parseAmount(b.fees_leaks),
      render: (v) => (
        <span style={{ color: parseAmount(v) !== 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{v || '₹ 0.00'}</span>
      ),
    },
    {
      title: 'Shipping Leaks',
      dataIndex: 'shipping_leaks',
      key: 'shipping_leaks',
      width: 60,
      ellipsis: true,
      align: 'center',
      sorter: (a, b) => parseAmount(a.shipping_leaks) - parseAmount(b.shipping_leaks),
      render: (v) => (
        <span style={{ color: parseAmount(v) !== 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{v || '₹ 0.00'}</span>
      ),
    },
    {
      title: 'MP-GST Leaks',
      dataIndex: 'mp_gst_leaks',
      key: 'mp_gst_leaks',
      width: 60,
      ellipsis: true,
      align: 'center',
      sorter: (a, b) => parseAmount(a.mp_gst_leaks) - parseAmount(b.mp_gst_leaks),
      render: (v) => (
        <span style={{ color: parseAmount(v) !== 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{v || '₹ 0.00'}</span>
      ),
    },
    {
      title: 'TCS Leaks',
      dataIndex: 'tcs_leaks',
      key: 'tcs_leaks',
      width: 60,
      ellipsis: true,
      align: 'center',
      sorter: (a, b) => parseAmount(a.tcs_leaks) - parseAmount(b.tcs_leaks),
      render: (v) => (
        <span style={{ color: parseAmount(v) !== 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{v || '₹ 0.00'}</span>
      ),
    },
    {
      title: 'TDS Leaks',
      dataIndex: 'tds_leaks',
      key: 'tds_leaks',
      width: 60,
      ellipsis: true,
      align: 'center',
      sorter: (a, b) => parseAmount(a.tds_leaks) - parseAmount(b.tds_leaks),
      render: (v) => (
        <span style={{ color: parseAmount(v) !== 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{v || '₹ 0.00'}</span>
      ),
    },
    {
      title: 'Settlement Hold',
      dataIndex: 'unsettled_not_paid',
      key: 'unsettled_not_paid',
      width: 60,
      ellipsis: true,
      align: 'center',
      sorter: (a, b) => parseAmount(a.unsettled_not_paid) - parseAmount(b.unsettled_not_paid),
      render: (v) => (
        <span style={{ color: parseAmount(v) !== 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>{v || '₹ 0.00'}</span>
      ),
    },
  ];

  return (
    <>
      <main className="min-h-[715px] lg:min-h-[580px] flex-1 h-auto px-5 mt-4 xl:px-[15px] pb-5 bg-transparent">
        <Spin spinning={loading} size="large">
          {/* TOP HEADER */}
          <div className="mb-3">
            <div className="flex items-center justify-between gap-3 md:flex-col md:items-start">
              <div>
                <h1 className="text-[21px] font-semibold text-dark leading-none mb-1">All Leaks</h1>
                <p className="text-[12px] text-light leading-4 mb-0">
                  View, analyze and export all types of leaks identified across marketplaces.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:w-full sm:flex-wrap">
                <Dropdown menu={{ items: exportMenuItems }} trigger={['click']} placement="bottomRight">
                  <Button
                    type="primary"
                    icon={<ExportOutlined />}
                    loading={exportLoading}
                    className="bg-[#10b981] hover:bg-[#059669] border-none text-white font-medium px-4 h-[35px] rounded-lg flex items-center gap-1.5 shadow-sm text-[13px]"
                  >
                    Export <DownOutlined style={{ fontSize: 10 }} />
                  </Button>
                </Dropdown>
              </div>
            </div>
          </div>

          {/* SUMMARY CARDS - 6 LEAK & SETTLEMENT CATEGORIES */}
          <div className="grid grid-cols-6 gap-2.5 2xl:grid-cols-6 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 mb-3">
            {/* Fee Leaks */}
            <div className="relative overflow-hidden rounded-xl border border-red-100 bg-gradient-to-br from-white via-white to-red-50/30 p-3 shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-600">
                  <DollarCircleOutlined style={{ fontSize: 15 }} />
                </div>
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-1 truncate">
                  Fee Leaks
                </p>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-red-600 leading-tight truncate">
                  {formatCurrency(summaryStats.totFeesLeak)}
                </h2>
              </div>
            </div>

            {/* Shipping Leaks */}
            <div className="relative overflow-hidden rounded-xl border border-amber-100 bg-gradient-to-br from-white via-white to-amber-50/30 p-3 shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 border border-amber-100 text-amber-600">
                  <CarOutlined style={{ fontSize: 15 }} />
                </div>
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-1 truncate">
                  Shipping Leaks
                </p>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-amber-600 leading-tight truncate">
                  {formatCurrency(summaryStats.totShipLeak)}
                </h2>
              </div>
            </div>

            {/* MP-GST Leaks */}
            <div className="relative overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-br from-white via-white to-purple-50/30 p-3 shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 border border-purple-100 text-purple-600">
                  <AuditOutlined style={{ fontSize: 15 }} />
                </div>
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-1 truncate">
                  MP-GST Leaks
                </p>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-purple-700 leading-tight truncate">
                  {formatCurrency(summaryStats.totGstLeak)}
                </h2>
              </div>
            </div>

            {/* TCS Leaks */}
            <div className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/30 p-3 shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                  <BankOutlined style={{ fontSize: 15 }} />
                </div>
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-1 truncate">
                  TCS Leaks
                </p>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-blue-600 leading-tight truncate">
                  {formatCurrency(summaryStats.totTcsLeak)}
                </h2>
              </div>
            </div>

            {/* TDS Leaks */}
            <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/30 p-3 shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <SafetyCertificateOutlined style={{ fontSize: 15 }} />
                </div>
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-1 truncate">
                  TDS Leaks
                </p>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-emerald-600 leading-tight truncate">
                  {formatCurrency(summaryStats.totTdsLeak)}
                </h2>
              </div>
            </div>

            {/* Settlement Hold */}
            <div className="relative overflow-hidden rounded-xl border border-rose-100 bg-gradient-to-br from-white via-white to-rose-50/30 p-3 shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-600">
                  <PauseCircleOutlined style={{ fontSize: 15 }} />
                </div>
                <p className="text-[12px] font-medium text-gray-500 uppercase tracking-wider mb-1 truncate">
                  Settlement Hold
                </p>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-rose-600 leading-tight truncate">
                  {formatCurrency(summaryStats.totUnsettled)}
                </h2>
              </div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white border border-normal rounded-10 shadow-regular px-3 py-3 mb-2">
            <div className="grid grid-cols-5 gap-3 xl:grid-cols-3 sm:grid-cols-1 items-center">
              <Select
                size="small"
                className="text-[11px] w-full"
                value={selectedMarketplace}
                onChange={(val) => setSelectedMarketplace(val)}
                options={marketplaceOptions}
              />

              <div className="col-span-2 sm:col-span-1">
                <Input
                  size="small"
                  className="text-[12px] h-[30px]"
                  placeholder="Search SKU / ASIN "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined className="text-gray-400" />}
                  allowClear
                />
              </div>
            </div>
          </div>

          {/* TOP TABLE */}
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={24} md={24} lg={20}>
              <div className="bg-white rounded-10 shadow-regular overflow-hidden">
                <Table
                  columns={columns.map((item) => ({
                    ...item,
                  }))}
                  dataSource={dataSource}
                  showSorterTooltip={false}
                  pagination={{
                    current: currentPage,
                    pageSize,
                    total: profitData?.pagination?.count || 0,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                    onChange: (page, newSize) => {
                      setCurrentPage(page);
                      setPageSize(newSize);
                    },
                    onShowSizeChange: (current, size) => {
                      setCurrentPage(1);
                      setPageSize(size);
                    },
                  }}
                  size="small"
                  scroll={{ x: 800 }}
                  className="
                    [&_.ant-table-thead>tr>th]:!text-[12px]
                    [&_.ant-table-thead>tr>th]:!font-semibold
                    [&_.ant-table-tbody>tr>td]:!text-[12px]
                    [&_.ant-table-cell]:!px-2
                    [&_.ant-table-cell]:!py-2
                  "
                />
              </div>
            </Col>

            <Col xs={24} sm={24} md={24} lg={4}>
              <div className="flex flex-col gap-2">
                <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-[#111827] mb-3">Top Marketplaces by Leaks</h3>

                  {topMarketplaces.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        {item.logo ? (
                          <img src={item.logo} alt={item.name} className="w-5 h-5 object-contain rounded" />
                        ) : (
                          <span className="text-[16px]">📦</span>
                        )}
                        <span className="text-[12px] text-[#374151] font-medium">{item.name}</span>
                      </div>

                      <span className="text-[12px] font-semibold text-[#374151]">{item.amount}</span>
                    </div>
                  ))}

                  <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-gray-200">
                    <span className="text-[12px] font-semibold text-[#111827]">Total</span>
                    <span className="text-[12px] font-bold text-[#111827]">
                      {formatCurrency(totalMarketplacesAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Spin>
      </main>
    </>
  );
}
