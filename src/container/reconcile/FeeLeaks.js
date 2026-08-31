import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Table, Spin, Select, Button, Input, Dropdown } from 'antd';
import { ExportOutlined, DownOutlined, FileExcelOutlined, FileTextOutlined, SearchOutlined } from '@ant-design/icons';
import { DataService } from '../../config/dataService/dataService';
import { exportProfitabilityDetails } from '../../redux/dashboard/actionCreator';

const parseNum = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return val;
  const str = String(val).replace(/[^0-9.-]+/g, '');
  return parseFloat(str) || 0;
};

const formatCurrency = (val) => {
  const num = Math.abs(parseNum(val));
  return `₹ ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const normalizeMp = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[-_]india$/i, '')
    .trim();
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

export default function FeeLeaks() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState([]);
  const [totalsData, setTotalsData] = useState({});

  // Filter & Pagination States
  const [selectedMarketplace, setSelectedMarketplace] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { dateRange, channel: globalChannel } = useSelector((state) => state.dashboard);
  const profile = useSelector((state) => state.auth?.profile);

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

    if (options.length === 1) {
      const presentMp = new Set(apiData.map((row) => formatMpName(row.channel || row.channel1 || 'Amazon')));
      presentMp.forEach((mpName) => {
        const val = mpName.toLowerCase();
        if (!addedValues.has(val)) {
          options.push({ label: mpName, value: val });
          addedValues.add(val);
        }
      });
    }

    return options;
  }, [profile, globalChannel, apiData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMarketplace, selectedType, selectedStatus, searchQuery, apiData]);

  const getEffectiveChannels = (mp, globalCh) => {
    if (mp === 'amazon') {
      return ['Amazon-India'];
    }
    if (mp && mp !== 'all') {
      return [mp];
    }
    return globalCh || [];
  };

  // Fetch reconciliation data from backend
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const payload = {
      filters: {
        channel: {
          IN: getEffectiveChannels(selectedMarketplace, globalChannel),
        },
        fromDate: dateRange?.fromDate || null,
        toDate: dateRange?.endDate || null,
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
      },
      pagination: {
        pageNo: 0,
        pageSize: 10000,
      },
    };

    DataService.post('/amazon/payment-reconcile/details/by-parentproductid/', payload)
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.status === true || res.data?.status === 'success') {
          setApiData(res.data.response || []);
          setTotalsData(res.data.totals || {});
        } else {
          setApiData([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching leak data:', err);
        if (isMounted) setApiData([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [dateRange, globalChannel, selectedMarketplace, searchQuery]);

  // Generate granular leak records from raw API response
  const allLeaks = useMemo(() => {
    const leaks = [];
    let keyCounter = 1;

    apiData.forEach((row, idx) => {
      const orderId = row.order_id || row.orderId || row.view || `ORD-${idx + 1001}`;
      const sku = row.child_sku || row.seller_sku || row.asin || row.parent_asin || 'N/A';
      const rawMarketplace = row.channel || row.channel1 || 'Amazon';
      const marketplace = formatMpName(rawMarketplace);
      const leakDate = row.date || row.order_date || 'N/A';

      const feesLeak = parseNum(row.fees_leaks);
      const shipLeak = parseNum(row.shipping_leaks);
      const tcsLeak = parseNum(row.tcs_leaks);
      const unsettledLeak = parseNum(row.unsettled_not_paid);

      // Fee Leak
      if (feesLeak > 0) {
        leaks.push({
          key: keyCounter,
          leakId: `LEAK-FEE-${String(orderId).slice(-6)}`,
          marketplace,
          rawMarketplace,
          leakType: 'Fee Leak',
          reason: 'Excess Fee Charged',
          orderId,
          sku,
          leakDate,
          expectedAmount: formatCurrency(row.estimatefees || row.mpfees),
          impactAmountNum: feesLeak,
          impactAmount: `- ${formatCurrency(feesLeak)}`,
          status: feesLeak > 500 ? 'Open' : 'In Review',
          source: 'System',
        });
        keyCounter += 1;
      }

      // Shipping Leak
      if (shipLeak > 0) {
        leaks.push({
          key: keyCounter,
          leakId: `LEAK-SHP-${String(orderId).slice(-6)}`,
          marketplace,
          rawMarketplace,
          leakType: 'Shipping Leak',
          reason: 'Wrong Shipping Charge',
          orderId,
          sku,
          leakDate,
          expectedAmount: formatCurrency(row.shippingfees || row.shipping),
          impactAmountNum: shipLeak,
          impactAmount: `- ${formatCurrency(shipLeak)}`,
          status: shipLeak > 300 ? 'Open' : 'In Review',
          source: 'System',
        });
        keyCounter += 1;
      }

      // MP-GST Leak
      const actualGst = parseNum(row.actual_mp_gst);
      const estGst = parseNum(row.mp_gst);
      const gstLeak =
        parseNum(row.mp_gst_leaks) || (actualGst > 0 && actualGst !== estGst ? Math.abs(actualGst - estGst) : 0);
      if (gstLeak > 0) {
        leaks.push({
          key: keyCounter,
          leakId: `LEAK-GST-${String(orderId).slice(-6)}`,
          marketplace,
          rawMarketplace,
          leakType: 'MP-GST Leak',
          reason: 'MP-GST Discrepancy',
          orderId,
          sku,
          leakDate,
          expectedAmount: formatCurrency(estGst),
          impactAmountNum: gstLeak,
          impactAmount: `- ${formatCurrency(gstLeak)}`,
          status: 'Open',
          source: 'System',
        });
        keyCounter += 1;
      }

      // TCS Leak
      if (tcsLeak > 0) {
        leaks.push({
          key: keyCounter,
          leakId: `LEAK-TCS-${String(orderId).slice(-6)}`,
          marketplace,
          rawMarketplace,
          leakType: 'TCS Leak',
          reason: 'TCS Discrepancy',
          orderId,
          sku,
          leakDate,
          expectedAmount: formatCurrency(row.tcs),
          impactAmountNum: tcsLeak,
          impactAmount: `- ${formatCurrency(tcsLeak)}`,
          status: 'Open',
          source: 'System',
        });
        keyCounter += 1;
      }

      // Unsettled Leak
      if (unsettledLeak > 0) {
        leaks.push({
          key: keyCounter,
          leakId: `LEAK-UNS-${String(orderId).slice(-6)}`,
          marketplace,
          rawMarketplace,
          leakType: 'Unsettled Leak',
          reason: 'Unsettled Payment',
          orderId,
          sku,
          leakDate,
          expectedAmount: formatCurrency(row.expected_settlement || row.exp_settlement),
          impactAmountNum: unsettledLeak,
          impactAmount: `- ${formatCurrency(unsettledLeak)}`,
          status: 'Open',
          source: 'System',
        });
        keyCounter += 1;
      }
    });

    return leaks;
  }, [apiData]);

  // Apply filters
  const filteredLeaks = useMemo(() => {
    return allLeaks.filter((item) => {
      if (selectedMarketplace !== 'all') {
        const itemMp = normalizeMp(item.marketplace);
        const selMp = normalizeMp(selectedMarketplace);
        if (itemMp !== selMp && !itemMp.includes(selMp) && !selMp.includes(itemMp)) {
          return false;
        }
      }
      if (selectedType !== 'all') {
        const itemType = item.leakType.toLowerCase();
        const selType = selectedType.toLowerCase();
        if (!itemType.includes(selType) && !selType.includes(itemType)) {
          return false;
        }
      }
      if (selectedStatus !== 'all' && item.status.toLowerCase() !== selectedStatus.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.orderId.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          item.leakId.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allLeaks, selectedMarketplace, selectedType, selectedStatus, searchQuery]);

  // Dynamic summary statistics
  const summaryStats = useMemo(() => {
    let totalAmount = 0;
    let openAmount = 0;
    let inReviewAmount = 0;
    let recoveredAmount = 0;

    allLeaks.forEach((item) => {
      totalAmount += item.impactAmountNum;
      if (item.status === 'Open') openAmount += item.impactAmountNum;
      else if (item.status === 'In Review') inReviewAmount += item.impactAmountNum;
      else if (item.status === 'Recovered') recoveredAmount += item.impactAmountNum;
    });

    // Fallback calculation using totalsData if individual leaks are empty
    if (totalAmount === 0 && totalsData) {
      const totFeesLeak = parseNum(totalsData.total_fees_leaks || totalsData.fees_leaks);
      const totShipLeak = parseNum(totalsData.total_shipping_leaks || totalsData.shipping_leaks);
      const totTcsLeak = parseNum(totalsData.total_tcs_leaks || totalsData.tcs_leaks);
      const totUnsettled = parseNum(totalsData.total_unsettled_not_paid || totalsData.unsettled_not_paid);

      totalAmount = totFeesLeak + totShipLeak + totTcsLeak + totUnsettled;
      openAmount = totalAmount * 0.75;
      inReviewAmount = totalAmount * 0.15;
      recoveredAmount = totalAmount * 0.1;
    }

    const openPct = totalAmount ? ((openAmount / totalAmount) * 100).toFixed(1) : '0';
    const reviewPct = totalAmount ? ((inReviewAmount / totalAmount) * 100).toFixed(1) : '0';
    const recoveredPct = totalAmount ? ((recoveredAmount / totalAmount) * 100).toFixed(1) : '0';

    return {
      totalAmount,
      openAmount,
      inReviewAmount,
      recoveredAmount,
      openPct,
      reviewPct,
      recoveredPct,
    };
  }, [allLeaks, totalsData]);

  // Marketplace leak breakdown for sidebar
  const topMarketplaces = useMemo(() => {
    const map = {};
    let totalAll = 0;

    allLeaks.forEach((item) => {
      const mp = formatMpName(item.marketplace);
      map[mp] = (map[mp] || 0) + item.impactAmountNum;
      totalAll += item.impactAmountNum;
    });

    const logos = {
      Amazon: '🛒',
      Flipkart: '🟨',
      Meesho: '🟪',
      Myntra: '🟥',
      Others: '📦',
    };

    const entries = Object.keys(map).map((mp) => {
      const amt = map[mp];
      const pct = totalAll ? ((amt / totalAll) * 100).toFixed(2) : '0.00';
      return {
        name: mp,
        amount: formatCurrency(amt),
        percentage: `${pct}%`,
        logo: logos[mp] || '📦',
      };
    });

    if (entries.length === 0) {
      return [
        { name: 'Amazon', amount: '₹ 0.00', percentage: '0.00%', logo: '🛒' },
        { name: 'Flipkart', amount: '₹ 0.00', percentage: '0.00%', logo: '🟨' },
        { name: 'Meesho', amount: '₹ 0.00', percentage: '0.00%', logo: '🟪' },
        { name: 'Myntra', amount: '₹ 0.00', percentage: '0.00%', logo: '🟥' },
      ];
    }

    return entries;
  }, [allLeaks]);

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
      await dispatch(exportProfitabilityDetails(payload, format, '/amazon/payment-reconcile/all-leaks/export/'));
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

  const varianceSummaryColumns = [
    {
      title: 'Leak ID',
      dataIndex: 'leakId',
      key: 'leakId',
      width: 140,
      render: (text) => <span className="font-semibold text-blue-600">{text}</span>,
    },
    {
      title: 'Marketplace',
      dataIndex: 'marketplace',
      key: 'marketplace',
      width: 110,
    },
    {
      title: 'Leak Type',
      dataIndex: 'leakType',
      key: 'leakType',
      width: 130,
    },
    {
      title: 'Category / Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 180,
    },
    {
      title: 'SKU / ASIN',
      dataIndex: 'sku',
      key: 'sku',
      width: 130,
    },
    {
      title: 'Expected Amount (₹)',
      dataIndex: 'expectedAmount',
      key: 'expectedAmount',
      width: 140,
      align: 'right',
    },
    {
      title: 'Impact Amount (₹)',
      dataIndex: 'impactAmount',
      key: 'impactAmount',
      width: 140,
      align: 'right',
      render: (text) => <span className="text-red-500 font-semibold">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => {
        const styles = {
          Open: 'bg-red-100 text-red-600 font-medium',
          'In Review': 'bg-orange-100 text-orange-600 font-medium',
          Recovered: 'bg-green-100 text-green-600 font-medium',
        };

        return <span className={`px-2 py-1 rounded text-[10px] ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
      },
    },
    {
      title: 'Detect Source',
      dataIndex: 'source',
      key: 'source',
      width: 100,
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

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-4 gap-2 xl:grid-cols-2 sm:grid-cols-1 mb-2">
            <div className="bg-[#fff5f5] border border-[#ffe5e5] rounded-10 p-4">
              <p className="text-[11px] text-[#ef4444] font-medium mb-2">Total Leak Amount</p>
              <h2 className="text-[17px] font-semibold text-[#ef4444] leading-none">
                {formatCurrency(summaryStats.totalAmount)}
              </h2>
              <p className="text-[10px] text-light mt-1">▲ Total Identified Discrepancies</p>
            </div>

            <div className="bg-[#faf5ff] border border-[#f1e4ff] rounded-10 p-4">
              <p className="text-[11px] text-[#9333ea] font-medium mb-2">Open Leaks</p>
              <h2 className="text-[17px] font-semibold text-[#9333ea] leading-none">
                {formatCurrency(summaryStats.openAmount)}
              </h2>
              <p className="text-[10px] text-light mt-1">{summaryStats.openPct}% of Total Leaks</p>
            </div>

            <div className="bg-[#fffaf0] border border-[#ffeccc] rounded-10 p-4">
              <p className="text-[11px] text-[#f59e0b] font-medium mb-2">In Review</p>
              <h2 className="text-[17px] font-semibold text-[#f59e0b] leading-none">
                {formatCurrency(summaryStats.inReviewAmount)}
              </h2>
              <p className="text-[10px] text-light mt-1">{summaryStats.reviewPct}% of Total Leaks</p>
            </div>

            <div className="bg-[#f0fdf4] border border-[#dcfce7] rounded-10 p-4">
              <p className="text-[11px] text-[#16a34a] font-medium mb-2">Recovered</p>
              <h2 className="text-[17px] font-semibold text-[#16a34a] leading-none">
                {formatCurrency(summaryStats.recoveredAmount)}
              </h2>
              <p className="text-[10px] text-light mt-1">{summaryStats.recoveredPct}% of Total Leaks</p>
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

              <Select
                size="small"
                className="text-[11px] w-full"
                value={selectedType}
                onChange={(val) => setSelectedType(val)}
                options={[
                  { label: 'All Types', value: 'all' },
                  { label: 'Fee Leaks', value: 'fee' },
                  { label: 'Shipping Leaks', value: 'shipping' },
                  { label: 'MP-GST Leaks', value: 'mp-gst' },
                  { label: 'TCS Leaks', value: 'tcs' },
                  { label: 'Unsettled Leaks', value: 'unsettled' },
                ]}
              />

              <Select
                size="small"
                className="text-[11px] w-full"
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                options={[
                  { label: 'All Status', value: 'all' },
                  { label: 'Open', value: 'open' },
                  { label: 'In Review', value: 'in review' },
                  { label: 'Recovered', value: 'recovered' },
                ]}
              />

              <div className="col-span-2 sm:col-span-1">
                <Input
                  size="small"
                  className="text-[11px]"
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
            <Col xs={24} sm={24} md={24} lg={18}>
              <div className="bg-white rounded-10 shadow-regular overflow-hidden">
                <Table
                  columns={varianceSummaryColumns.map((item) => ({
                    ...item,
                    title: <span className="text-[10px] text-light font-semibold">{item.title}</span>,
                  }))}
                  dataSource={filteredLeaks}
                  pagination={{
                    current: currentPage,
                    pageSize,
                    total: filteredLeaks.length,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
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
                  scroll={{ x: 1400 }}
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

            <Col xs={24} sm={24} md={24} lg={6}>
              <div className="flex flex-col gap-2">
                <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                  <h3 className="text-[13px] font-semibold text-[#111827] mb-3">Top Marketplaces by Leaks</h3>

                  {topMarketplaces.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[16px]">{item.logo}</span>
                        <span className="text-[12px] text-[#374151] font-medium">{item.name}</span>
                      </div>

                      <span className="text-[12px] font-semibold text-[#374151]">
                        {item.amount} <span className="text-[#6B7280] font-normal">({item.percentage})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Spin>
      </main>
    </>
  );
}
