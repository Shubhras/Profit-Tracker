import React, { useEffect } from 'react';
import { Button, Table, Tooltip } from 'antd';

import {
  SearchOutlined,
  DownloadOutlined,
  PlusOutlined,
  // MoreOutlined,
  RightOutlined,
  StopOutlined,
  DollarOutlined,
  EyeOutlined,
  AimOutlined,
  ShoppingCartOutlined,
  LineChartOutlined,
  PercentageOutlined,
} from '@ant-design/icons';

import { useDispatch, useSelector } from 'react-redux';
import { getSearchTerms } from '../../redux/advertising/actionCreator';

function SearchTerms() {
  const dispatch = useDispatch();

  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { searchTerms, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    dispatch(getSearchTerms(pagination.current, pagination.pageSize));
  }, [dispatch, pagination]);

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
          className="w-[15px] h-[15px] accent-[#2563eb]"
        />
      ),

      dataIndex: 'checkbox',
      width: 55,
      fixed: 'left',

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
          className="w-[15px] h-[15px] accent-[#2563eb]"
        />
      ),
    },

    {
      title: 'Search Term',
      dataIndex: 'searchTerm',
      width: 240,

      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Impressions',
      dataIndex: 'impressions',
      width: 130,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      width: 100,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      width: 120,

      render: (v) => <span className="font-medium">₹{Number(v || 0).toLocaleString()}</span>,
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      width: 100,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      width: 130,

      render: (v) => <span className="font-medium text-[#15803d]">₹{Number(v || 0).toLocaleString()}</span>,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      width: 100,

      render: (v) => {
        let color = '#16a34a';

        if (v > 40) {
          color = '#dc2626';
        } else if (v > 25) {
          color = '#d97706';
        }

        return (
          <span style={{ color }} className="font-semibold">
            {v}%
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
      value: '$54,231.52',
      growth: '↑ 18% vs last 30 days',
      icon: <DollarOutlined className="text-[#16a34a]" />,
      iconBg: 'bg-[#e8f7ef]',
    },

    {
      title: 'Impressions',
      value: '9.82M',
      growth: '↑ 16% vs last 30 days',
      icon: <EyeOutlined className="text-[#7c3aed]" />,
      iconBg: 'bg-[#f3e8ff]',
    },

    {
      title: 'Clicks',
      value: '88,742',
      growth: '↑ 14% vs last 30 days',
      icon: <AimOutlined className="text-[#d97706]" />,
      iconBg: 'bg-[#fef3c7]',
    },

    {
      title: 'Orders',
      value: '1,842',
      growth: '↑ 9% vs last 30 days',
      icon: <ShoppingCartOutlined className="text-[#059669]" />,
      iconBg: 'bg-[#d1fae5]',
    },

    {
      title: 'Sales',
      value: '$198,421.60',
      growth: '↑ 21% vs last 30 days',
      icon: <LineChartOutlined className="text-[#e11d48]" />,
      iconBg: 'bg-[#ffe4e6]',
    },

    {
      title: 'ACOS',
      value: '27.32%',
      growth: '↓ 5% vs last 30 days',
      icon: <PercentageOutlined className="text-[#2563eb]" />,
      iconBg: 'bg-[#dbeafe]',
    },
  ];

  return (
    <div className="bg-[#f5f7fb] min-h-screen p-5">
      {/* HEADER */}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-semibold text-[#111827] mb-1">Search Terms</h1>

          <p className="text-[14px] text-[#6b7280] max-w-[900px]">
            Discover how customers search for your products and optimize your keywords by adding high-performing search
            terms as keywords and blocking irrelevant terms as negative keywords.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="!h-[42px] !rounded-xl !border-[#dbe1e8]">
            <DownloadOutlined />
            Search Term Report
          </Button>

          <Button type="primary" className="!h-[42px] !rounded-xl !bg-[#0f766e]">
            <PlusOutlined />
            Add as Keyword
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 mb-5">
        {metricCards.map((item) => (
          <div key={item.title} className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-[15px] font-semibold text-[#6b7280]">{item.title}</p>

              <div className={`w-8 h-8 rounded-xl ${item.iconBg} flex items-center justify-center`}>{item.icon}</div>
            </div>

            {/* VALUE */}

            <h2 className="text-[24px] font-semibold text-[#111827] mt-3">{item.value}</h2>

            {/* GROWTH */}

            <p className={`text-[12px] mt-2 ${item.growth.includes('↓') ? 'text-[#dc2626]' : 'text-[#16a34a]'}`}>
              {item.growth}
            </p>
          </div>
        ))}
      </div>

      {/* FILTER BAR */}

      <div className="flex items-center gap-3 mb-5">
        <select className="h-[42px] px-4 rounded-xl border border-[#dbe1e8] bg-white text-[14px] outline-none">
          <option>All Campaigns</option>
        </select>

        <select className="h-[42px] px-4 rounded-xl border border-[#dbe1e8] bg-white text-[14px] outline-none">
          <option>All Ad Groups</option>
        </select>

        <select className="h-[42px] px-4 rounded-xl border border-[#dbe1e8] bg-white text-[14px] outline-none">
          <option>Broad Match, Phrase Match, Exact Match</option>
        </select>

        <select className="h-[42px] px-4 rounded-xl border border-[#dbe1e8] bg-white text-[14px] outline-none">
          <option>01/05/2026 - 31/05/2026</option>
        </select>

        <div className="relative ml-auto w-[260px]">
          <input
            placeholder="Search term..."
            className="w-full h-[42px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] outline-none"
          />

          <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="grid grid-cols-[1fr_320px] gap-5">
        {/* TABLE */}

        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
          <Table
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: searchTerms?.pagination?.total_records || 0,

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
            scroll={{ x: 'max-content' }}
            bordered={false}
          />
        </div>

        {/* SIDEBAR */}

        <div className="space-y-5">
          {/* MATCH DISTRIBUTION */}

          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
            <h2 className="text-[17px] font-semibold text-[#111827] mb-5">Match Type Distribution</h2>

            {/* PIE CHART */}

            <div className="relative w-[180px] h-[180px] mx-auto">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(
          #0f766e 0% 59%,
          #2563eb 59% 89%,
          #d97706 89% 100%
        )`,
                }}
              />

              {/* INNER CIRCLE */}

              <div className="absolute inset-[18px] bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-[32px] font-bold text-[#111827]">1,256</h2>

                  <p className="text-[13px] text-[#6b7280]">Total Terms</p>
                </div>
              </div>
            </div>

            {/* LEGENDS */}

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-[14px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#0f766e]" />
                  Broad Match
                </div>

                <span className="font-medium text-[#111827]">742 (59%)</span>
              </div>

              <div className="flex items-center justify-between text-[14px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2563eb]" />
                  Phrase Match
                </div>

                <span className="font-medium text-[#111827]">372 (30%)</span>
              </div>

              <div className="flex items-center justify-between text-[14px]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#d97706]" />
                  Exact Match
                </div>

                <span className="font-medium text-[#111827]">142 (11%)</span>
              </div>
            </div>
          </div>

          {/* TOP TERMS */}

          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5">
            <h2 className="text-[17px] font-semibold text-[#111827] mb-4">Top Performing Terms</h2>

            {[
              'sony wh-1000xm5',
              'noise cancelling headphones',
              'gaming headphones',
              'wireless bluetooth headphones',
              'over ear headphones',
            ].map((item, index) => (
              <div
                key={item}
                className={`flex items-center justify-between py-3 ${index !== 4 ? 'border-b border-[#f1f5f9]' : ''}`}
              >
                <p className="text-[14px] text-[#111827]">{item}</p>

                <span className="text-[13px] font-medium text-[#16a34a]">{22 + index}%</span>
              </div>
            ))}

            <Button className="w-full !mt-4 !h-[42px] !rounded-xl">View All</Button>
          </div>

          {/* QUICK ACTIONS */}

          {/* QUICK ACTIONS */}

          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-5 shadow-sm">
            <h2 className="text-[18px] font-semibold text-[#111827] mb-5">Quick Actions</h2>

            <div className="space-y-1">
              {/* ADD KEYWORD */}
              <button
                type="button"
                className="w-full flex items-center justify-between p-2 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#dcfce7] flex items-center justify-center">
                    <PlusOutlined className="text-[#16a34a] text-[18px]" />
                  </div>

                  <div className="text-left">
                    <h3 className="text-[15px] font-semibold text-[#111827] mb-1">Add as Keyword</h3>

                    <p className="text-[13px] text-[#6b7280]">Add selected terms as keywords</p>
                  </div>
                </div>

                <RightOutlined className="text-[#94a3b8]" />
              </button>

              {/* ADD NEGATIVE */}

              <button
                type="button"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#fef2f2] border border-[#fecaca] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#fee2e2] flex items-center justify-center">
                    <StopOutlined className="text-[#ef4444] text-[18px]" />
                  </div>

                  <div className="text-left">
                    <h3 className="text-[15px] font-semibold text-[#111827] mb-1">Add as Negative</h3>

                    <p className="text-[13px] text-[#6b7280]">Add selected terms as negative</p>
                  </div>
                </div>

                <RightOutlined className="text-[#94a3b8]" />
              </button>

              {/* DOWNLOAD REPORT */}

              <button
                type="button"
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#dbeafe] flex items-center justify-center">
                    <DownloadOutlined className="text-[#2563eb] text-[18px]" />
                  </div>

                  <div className="text-left">
                    <h3 className="text-[15px] font-semibold text-[#111827] mb-1">Download Report</h3>

                    <p className="text-[13px] text-[#6b7280]">Get detailed search term report</p>
                  </div>
                </div>

                <RightOutlined className="text-[#94a3b8]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchTerms;
