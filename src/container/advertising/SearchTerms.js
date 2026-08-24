import React, { useEffect, useState } from 'react';
import { Button, Table, Tooltip, Dropdown, Modal, message } from 'antd';

import {
  SearchOutlined,
  ExportOutlined,
  DownOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  DollarOutlined,
  EyeOutlined,
  AimOutlined,
  ShoppingCartOutlined,
  LineChartOutlined,
  PercentageOutlined,
} from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import { getSearchTerms, exportSearchTerms } from '../../redux/advertising/actionCreator';

function SearchTerms() {
  const dispatch = useDispatch();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { searchTerms, loading } = useSelector((state) => state.advertising);
  const { dateRange } = useSelector((state) => state.dashboard);

  const handleExport = async (format = 'xlsx') => {
    setExportLoading(true);
    try {
      const payload = {
        filters: {
          search: debouncedSearch,
          ...(dateRange?.fromDate && { from_date: dateRange.fromDate, start_date: dateRange.fromDate }),
          ...(dateRange?.endDate && { to_date: dateRange.endDate, end_date: dateRange.endDate }),
        },
        pagination: {
          pageNo: 1,
          pageSize: 10,
        },
      };
      const res = await dispatch(exportSearchTerms(payload, format));
      if (res?.status) {
        message.success('Export report generated successfully!');
      } else {
        message.error(res?.message || 'Failed to export search terms');
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to export search terms');
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

  useEffect(() => {
    dispatch(
      getSearchTerms({
        filters: {
          search: debouncedSearch,
          ...(dateRange?.fromDate && { from_date: dateRange.fromDate, start_date: dateRange.fromDate }),
          ...(dateRange?.endDate && { to_date: dateRange.endDate, end_date: dateRange.endDate }),
        },
        pagination: {
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        },
      }),
    );
  }, [dispatch, pagination.current, pagination.pageSize, debouncedSearch, dateRange]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const [isTopTermsModalOpen, setIsTopTermsModalOpen] = useState(false);

  const summaryCards = searchTerms?.dashboard?.summary_cards || {};
  const performanceKey = searchTerms?.dashboard?.top_performing_terms || [];
  /*
  const matchTypeDist = searchTerms?.dashboard?.match_type_distribution || {};
  const totalMatchTerms = matchTypeDist?.total_terms || 0;
  const distributionData = matchTypeDist?.data || [];

  const getMatchColor = (matchType) => {
    const type = String(matchType || '').toUpperCase();
    if (type.includes('EXACT')) return '#d97706';
    if (type.includes('PHRASE')) return '#2563eb';
    if (type.includes('BROAD')) return '#0f766e';
    if (type.includes('TARGETING_EXPRESSION_PREDEFINED')) return '#64748b';
    if (type.includes('TARGETING_EXPRESSION')) return '#8b5cf6';
    return '#94a3b8';
  };

  const formatMatchTypeName = (matchType) => {
    if (!matchType) return 'Unknown';
    const type = String(matchType).toUpperCase();
    if (type === 'EXACT') return 'Exact Match';
    if (type === 'PHRASE') return 'Phrase Match';
    if (type === 'BROAD') return 'Broad Match';
    if (type.includes('TARGETING_EXPRESSION_PREDEFINED')) return 'Auto / Predefined';
    if (type.includes('TARGETING_EXPRESSION')) return 'Targeting Expression';
    return matchType
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  let cumulativePct = 0;
  const gradientStops = distributionData.map((item) => {
    const start = cumulativePct;
    cumulativePct += item.percentage || 0;
    return `${getMatchColor(item.match_type)} ${start}% ${cumulativePct}%`;
  });
  const conicBg = gradientStops.length > 0 ? `conic-gradient(${gradientStops.join(', ')})` : '#e5e7eb';
  */

  const topTermsColumns = [
    {
      title: '#',
      dataIndex: 'rank',
      width: 50,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Search Term',
      dataIndex: 'search_term',
      render: (v) => <span className="font-semibold text-[#111827]">{v}</span>,
    },
    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      width: 100,
      render: (v) => Number(v || 0).toLocaleString(),
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 130,
      render: (v) => <span className="font-semibold text-[#16a34a]">₹{Number(v || 0).toLocaleString()}</span>,
    },
    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 100,
      render: (v) => (v != null ? `${Number(v).toFixed(2)}%` : '-'),
    },
    {
      title: 'ROAS',
      dataIndex: 'roas',
      align: 'center',
      width: 100,
      render: (v) => (v != null ? Number(v).toFixed(2) : '-'),
    },
  ];

  // const fetchCampaigns = async () => {
  //   const response = await dispatch(getCampaignsRulesList());

  //   if (response?.status) {
  //     setCampaigns(response.data || []);
  //   }
  // };

  // useEffect(() => {
  //   fetchCampaigns();
  // }, []);

  const dataSource =
    searchTerms?.data?.map((item) => ({
      key: item.id,

      id: item.id,
      campaignId: item.campaign_id,
      campaignName: item.campaign_name,
      searchTerm: item.search_term,
      reportDate: item.report_date,

      impressions: item.impressions,
      clicks: item.clicks,
      cost: item.cost,
      sales: item.sales,
      orders: item.orders,
      acos: item.acos,
      roas: item.roas,
    })) || [];

  const columns = [
    {
      title: (
        <input
          type="checkbox"
          checked={dataSource.length > 0 && selectedRowKeys.length === dataSource.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys(dataSource.map((item) => item.key));
            } else {
              setSelectedRowKeys([]);
            }
          }}
          className="w-[12px] h-[12px] accent-[#2563eb]"
        />
      ),

      dataIndex: 'checkbox',
      width: 55,
      align: 'center',

      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedRowKeys.includes(record.key)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, record.key]);
            } else {
              setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.key));
            }
          }}
          className="w-[12px] h-[12px] accent-[#2563eb]"
        />
      ),
    },

    {
      title: 'Search Term',
      dataIndex: 'searchTerm',
      width: 70,
      ellipsis: true,
      align: 'center',
      sorter: (a, b) => String(a.searchTerm).localeCompare(String(b.searchTerm)),

      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[11px] text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '100px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.campaignName).localeCompare(String(b.campaignName)),

      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[11px] text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '100px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: 70,
      render: (v) => <span className="text-[11px]">{v}</span>,
      sorter: (a, b) => a.impressions - b.impressions,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      width: 70,
      align: 'center',
      render: (v) => <span className="text-[11px]">{v}</span>,
      sorter: (a, b) => a.clicks - b.clicks,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: 70,

      sorter: (a, b) => a.cost - b.cost,
      render: (v) => <span className="font-medium text-[11px]">₹{Number(v || 0).toLocaleString()}</span>,
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.orders - b.orders,
      render: (v) => <span className="text-[11px]">{v}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      width: 70,
      align: 'center',
      sorter: (a, b) => a.sales - b.sales,
      render: (v) => <span className="font-medium text-[#15803d] text-[11px]">₹{Number(v || 0).toLocaleString()}</span>,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.acos - b.acos,
      render: (v) => {
        let color = '#16a34a';

        if (v > 40) {
          color = '#dc2626';
        } else if (v > 25) {
          color = '#d97706';
        }

        return (
          <span style={{ color }} className="font-semibold text-[11px]">
            {Number(v || 0).toFixed(1)}%
          </span>
        );
      },
    },

    // {
    //   title: 'Actions',
    //   width: 80,

    //   render: () => <Button type="text" icon={<MoreOutlined />} />,
    // },
  ];

  const metricCards = [
    {
      title: 'Total Spend',
      value: `₹${Number(summaryCards?.total_spend || 0).toLocaleString()}`,
      growth: '',
      icon: <DollarOutlined className="text-[#16a34a]" />,
      iconBg: 'bg-[#e8f7ef]',
    },

    {
      title: 'Impressions',
      value: Number(summaryCards?.impressions || 0).toLocaleString(),
      growth: '',
      icon: <EyeOutlined className="text-[#7c3aed]" />,
      iconBg: 'bg-[#f3e8ff]',
    },

    {
      title: 'Clicks',
      value: Number(summaryCards?.clicks || 0).toLocaleString(),
      growth: '',
      icon: <AimOutlined className="text-[#d97706]" />,
      iconBg: 'bg-[#fef3c7]',
    },

    {
      title: 'Orders',
      value: Number(summaryCards?.orders || 0).toLocaleString(),
      growth: '',
      icon: <ShoppingCartOutlined className="text-[#059669]" />,
      iconBg: 'bg-[#d1fae5]',
    },

    {
      title: 'Sales',
      value: `₹${Number(summaryCards?.sales || 0).toLocaleString()}`,
      growth: '',
      icon: <LineChartOutlined className="text-[#e11d48]" />,
      iconBg: 'bg-[#ffe4e6]',
    },

    {
      title: 'ACOS',
      value: `${Number(summaryCards?.acos || 0).toFixed(2)}%`,
      growth: '',
      icon: <PercentageOutlined className="text-[#2563eb]" />,
      iconBg: 'bg-[#dbeafe]',
    },
  ];

  return (
    <div className="bg-[#f5f7fb] min-h-screen p-4">
      {/* HEADER */}

      <div className="flex flex-col gap-3 min-lg:flex-row min-lg:items-start min-lg:justify-between mb-1">
        {' '}
        <div>
          <h1 className="text-[20px] lg:text-[18px] font-semibold text-[#111827] mb-0">Search Terms</h1>

          <p className="text-[12px] text-[#6b7280] max-w-[850px]">
            Discover how customers search for your products and optimize your keywords by adding high-performing search
            terms as keywords and blocking irrelevant terms as negative keywords.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight" trigger={['click']}>
            <Button
              type="primary"
              icon={<ExportOutlined />}
              loading={exportLoading}
              className="!h-[30px] text-[13px] !rounded-xl !bg-[#2563eb] !font-semibold !flex !items-center !justify-center"
            >
              Export <DownOutlined className="text-[10px] ml-1" />
            </Button>
          </Dropdown>
        </div>
      </div>

      <div className="grid grid-cols-6 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2 mb-2">
        {metricCards.map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-[#e5e7eb] px-3 py-3">
            <div className="flex items-start justify-between">
              <p className="text-[12px] font-medium text-[#6b7280]">{item.title}</p>

              <div className={`w-7 h-7 rounded-lg ${item.iconBg} flex items-center justify-center`}>{item.icon}</div>
            </div>

            <h2 className="text-[18px] font-semibold text-[#111827] mt-2">{item.value}</h2>

            <p className={`text-[10px] mt-1 ${item.growth.includes('↓') ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>
              {item.growth}
            </p>
          </div>
        ))}
      </div>

      {/* FILTER BAR */}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative lg:w-full min-lg:w-[180px]">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search term..."
            className="w-full h-[30px] rounded-lg border border-[#dbe1e8] bg-white pl-9 pr-3 text-[12px] outline-none"
          />

          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[12px]" />
        </div>

        {/* <select className="h-[30px] px-2 rounded-lg border border-[#dbe1e8] bg-white text-[12px] outline-none">
          <option>Broad Match, Phrase Match, Exact Match</option>
        </select> */}

        {/* <select className="h-[30px] px-2 rounded-lg border border-[#dbe1e8] bg-white text-[12px] outline-none">
          <option>01/05/2026 - 31/05/2026</option>
        </select> */}
      </div>
      {/* MAIN CONTENT */}

      <div className="grid grid-cols-[1fr_300px] xl:grid-cols-1 gap-3">
        {/* TABLE */}

        <div className="bg-white p-3 rounded-xl border border-[#e5e7eb] overflow-hidden">
          <Table
            // className="[&_.ant-table-thead>tr>th]:text-[11px] [&_.ant-table-thead>tr>th]:font-medium"
            columns={columns}
            size="small"
            dataSource={dataSource}
            loading={loading}
            showSorterTooltip={false}
            tableLayout="fixed"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: searchTerms?.pagination?.totalItems || 0,

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
            scroll={{ x: '800', y: 500 }}
            bordered={false}
            className="
    [&_.ant-table-thead>tr>th]:!text-[12px]
    [&_.ant-table-thead>tr>th]:!font-semibold
    [&_.ant-table-tbody>tr>td]:!text-[12px]
    [&_.ant-table-cell]:!px-2
    [&_.ant-table-cell]:!py-2
  "
          />
        </div>

        {/* SIDEBAR */}

        <div className="space-y-2">
          {/* MATCH DISTRIBUTION */}

          {/* <div className="bg-white rounded-xl border border-[#e5e7eb] p-3">
            <h2 className="text-[15px] font-semibold text-[#111827] mb-3">Match Type Distribution</h2>

            <div className="relative w-[120px] h-[120px] mx-auto">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: conicBg,
                }}
              />

              <div className="absolute inset-[14px] bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-[18px] font-bold text-[#111827]">{Number(totalMatchTerms).toLocaleString()}</h2>

                  <p className="text-[10px] text-[#6b7280]">Total Terms</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {distributionData.length > 0 ? (
                distributionData.map((item) => (
                  <div key={item.match_type} className="flex items-center justify-between text-[11px] gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: getMatchColor(item.match_type) }}
                      />
                      <span className="truncate text-[#374151]" title={formatMatchTypeName(item.match_type)}>
                        {formatMatchTypeName(item.match_type)}
                      </span>
                    </div>

                    <span className="font-medium text-[#111827] shrink-0 whitespace-nowrap">
                      {Number(item.count || 0).toLocaleString()} ({item.percentage || 0}%)
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[12px] text-[#9ca3af] text-center my-2">No match distribution data</p>
              )}
            </div>
          </div> */}

          {/* TOP TERMS */}

          <div className="bg-white rounded-xl border border-[#e5e7eb] p-3">
            <h2 className="text-[15px] font-semibold text-[#111827] mb-2">Top Performing Terms</h2>

            {performanceKey.slice(0, 5).map((item, index, arr) => (
              <div
                key={item.search_term + index}
                className={`flex items-center justify-between py-1 ${
                  index !== arr.length - 1 ? 'border-b border-[#f1f5f9]' : ''
                }`}
              >
                <div>
                  <p className="text-[12px] text-[#111827] truncate max-w-[180px] mb-1">{item.search_term}</p>

                  <p className="text-[11px] text-[#6b7280]">Orders: {item.orders}</p>
                </div>

                <span className="text-[12px] font-semibold text-[#16a34a]">
                  ₹{Number(item.sales || 0).toLocaleString()}
                </span>
              </div>
            ))}

            <Button
              onClick={() => setIsTopTermsModalOpen(true)}
              className="w-full !h-[34px] !rounded-lg !text-[11px] mt-2 cursor-pointer"
            >
              View All
            </Button>
          </div>
        </div>
      </div>

      <Modal
        title="Top Performing Search Terms"
        open={isTopTermsModalOpen}
        onCancel={() => setIsTopTermsModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsTopTermsModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={750}
      >
        <Table
          columns={topTermsColumns}
          dataSource={performanceKey.map((item, index) => ({ ...item, key: index }))}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>
    </div>
  );
}

export default SearchTerms;
