import React from 'react';
import { Button, Table, Tag } from 'antd';

import {
  DownloadOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  DollarOutlined,
  EyeOutlined,
  AimOutlined,
  LineChartOutlined,
} from '@ant-design/icons';

function NegativeKey() {
  const metricCards = [
    {
      title: 'Total Negative Keywords',
      value: '2,842',
      growth: '↑ 12% vs last 30 days',
      icon: <PlusOutlined className="text-[#16a34a]" />,
      iconBg: 'bg-[#dcfce7]',
    },

    {
      title: 'Impressions Blocked',
      value: '1.24M',
      growth: '↑ 18% vs last 30 days',
      icon: <EyeOutlined className="text-[#7c3aed]" />,
      iconBg: 'bg-[#f3e8ff]',
    },

    {
      title: 'Clicks Blocked',
      value: '24,536',
      growth: '↑ 15% vs last 30 days',
      icon: <AimOutlined className="text-[#d97706]" />,
      iconBg: 'bg-[#fef3c7]',
    },

    {
      title: 'Spend Saved',
      value: '$18,672',
      growth: '↑ 22% vs last 30 days',
      icon: <DollarOutlined className="text-[#16a34a]" />,
      iconBg: 'bg-[#dcfce7]',
    },

    {
      title: 'ACOS Improvement',
      value: '4.67%',
      growth: '↑ 9% vs last 30 days',
      icon: <LineChartOutlined className="text-[#ef4444]" />,
      iconBg: 'bg-[#ffe4e6]',
    },
  ];

  const dataSource = [
    {
      key: 1,
      keyword: 'free',
      type: 'Broad',
      addedTo: 'Campaign (12)',
      addedOn: '28 Apr 2026',
      impression: '45,231',
      clicks: '1,024',
      saved: '$845.21',
    },

    {
      key: 2,
      keyword: 'cheap',
      type: 'Phrase',
      addedTo: 'Campaign (8)',
      addedOn: '25 Apr 2026',
      impression: '38,112',
      clicks: '823',
      saved: '$642.18',
    },

    {
      key: 3,
      keyword: 'near me',
      type: 'Phrase',
      addedTo: 'Campaign (5)',
      addedOn: '22 Apr 2026',
      impression: '22,589',
      clicks: '612',
      saved: '$512.67',
    },

    {
      key: 4,
      keyword: 'how to',
      type: 'Broad',
      addedTo: 'Ad Group (24)',
      addedOn: '20 Apr 2026',
      impression: '19,342',
      clicks: '534',
      saved: '$421.39',
    },

    {
      key: 5,
      keyword: 'diy',
      type: 'Phrase',
      addedTo: 'Ad Group (18)',
      addedOn: '18 Apr 2026',
      impression: '16,875',
      clicks: '401',
      saved: '$318.71',
    },

    {
      key: 6,
      keyword: 'amazon',
      type: 'Exact',
      addedTo: 'Campaign (3)',
      addedOn: '15 Apr 2026',
      impression: '14,560',
      clicks: '371',
      saved: '$287.63',
    },
  ];

  const columns = [
    {
      title: <input type="checkbox" className="w-[15px] h-[15px] accent-[#10b981]" />,

      dataIndex: 'checkbox',
      width: 50,

      render: () => <input type="checkbox" className="w-[15px] h-[15px] accent-[#10b981]" />,
    },

    {
      title: 'Negative Keyword',
      dataIndex: 'keyword',

      render: (v) => <span className="font-medium text-[#111827]">{v}</span>,
    },

    {
      title: 'Match Type',
      dataIndex: 'type',

      render: (v) => {
        const bg = v === 'Broad' ? '#dcfce7' : v === 'Phrase' ? '#ede9fe' : '#fef3c7';

        const color = v === 'Broad' ? '#15803d' : v === 'Phrase' ? '#7c3aed' : '#d97706';

        return (
          <Tag
            style={{
              background: bg,
              color,
              border: 'none',
              borderRadius: '999px',
              fontWeight: 500,
            }}
          >
            {v}
          </Tag>
        );
      },
    },

    {
      title: 'Added To',
      dataIndex: 'addedTo',
    },

    {
      title: 'Added On',
      dataIndex: 'addedOn',
    },

    {
      title: 'Impr. Blocked',
      dataIndex: 'impression',
    },

    {
      title: 'Clicks Blocked',
      dataIndex: 'clicks',
    },

    {
      title: 'Spend Saved',
      dataIndex: 'saved',

      render: (v) => <span className="font-semibold text-[#16a34a]">{v}</span>,
    },

    {
      title: 'Actions',
      width: 70,

      render: () => <Button type="text" icon={<MoreOutlined />} />,
    },
  ];

  return (
    <div className="bg-[#f5f7fb] min-h-screen p-3">
      {/* HEADER */}

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-[20px] font-semibold text-[#111827] mb-[2px]">Negative Keywords</h1>

          <p className="text-[11px] text-[#6b7280] max-w-[900px] leading-[16px]">
            Discover, analyze and manage negative keywords to prevent wasted ad spend and improve campaign performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button className="!h-[32px] !rounded-xl !border-[#dbe1e8]">
            <DownloadOutlined className="!text-[11px]" />
            <span className="text-[12px]">Amazon Search Term Report</span>
          </Button>

          <Button type="primary" className="!h-[35px] !rounded-xl !bg-[#059669]">
            <PlusOutlined className="!text-[11px]" />
            <span className="text-[12px] font-semibold">Add Negative Keywords</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {metricCards.map((item) => (
          <div
            key={item.title}
            className="
        bg-white
        rounded-2xl
        border border-[#e5e7eb]
        px-3 py-2
        shadow-sm
        min-h-[92px]
        flex flex-col justify-between
      "
          >
            {/* TOP */}
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-[#6b7280] leading-[14px] line-clamp-2 min-h-[20px] font-medium">
                  {item.title}
                </p>

                <div className={`w-7 h-7 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                  {item.icon}
                </div>
              </div>

              <h2 className="text-[18px] font-bold text-[#111827] leading-none mt-1 whitespace-nowrap">{item.value}</h2>
            </div>

            {/* BOTTOM */}
            <p className="text-[10px] text-[#16a34a] leading-3 font-medium mt-1">{item.growth}</p>
          </div>
        ))}
      </div>

      {/* TABS */}

      <div className="flex items-center gap-8 border-b border-[#e5e7eb] mb-2">
        {['Negative Keywords', 'Negative Phrases', 'Negative Exact', 'ASIN Targeting', 'Auto Suggestions'].map(
          (item, index) => (
            <button
              key={item}
              type="button"
              className={`pb-4 text-[14px] font-medium transition-all ${
                index === 0 ? 'text-[#059669] border-b-2 border-[#059669]' : 'text-[#64748b]'
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      {/* FILTERS */}

      <div className="flex items-center gap-3 mb-5">
        <select className="h-[35px] px-4 rounded-xl border border-[#dbe1e8] bg-white text-[12px] outline-none">
          <option>All Campaigns</option>
        </select>

        <select className="h-[35px] px-4 rounded-xl border border-[#dbe1e8] bg-white text-[12px] outline-none">
          <option>All Ad Groups</option>
        </select>

        <select className="h-[35px] px-4 rounded-xl border border-[#dbe1e8] bg-white text-[12px] outline-none">
          <option>All Match Types</option>
        </select>

        <select className="h-[35px] px-4 rounded-xl border border-[#dbe1e8] bg-white text-[12px] outline-none">
          <option>01/05/2026 - 31/05/2026</option>
        </select>

        <div className="relative ml-auto w-[280px]">
          <input
            placeholder="Search negative keywords..."
            className="w-full h-[42px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] outline-none"
          />

          <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="grid grid-cols-[1fr_320px] gap-2">
        {/* TABLE */}

        <div className="bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden">
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              pageSize: 10,
            }}
            scroll={{ x: 'max-content' }}
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
          {/* WASTED TERMS */}

          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-3">
            <h2 className="text-[14px] font-semibold text-[#111827] mb-2">Top Wasted Search Terms</h2>

            {[
              {
                term: 'free sample',
                clicks: 342,
                spend: '$256.32',
              },

              {
                term: 'near me',
                clicks: 278,
                spend: '$198.45',
              },

              {
                term: 'how to use',
                clicks: 221,
                spend: '$156.78',
              },

              {
                term: 'cheap price',
                clicks: 193,
                spend: '$142.33',
              },

              {
                term: 'diy craft',
                clicks: 161,
                spend: '$118.42',
              },
            ].map((item, index) => (
              <div key={item.term} className={`py-0 ${index !== 4 ? 'border-b border-[#f1f5f9]' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className="text-[14px] text-[#111827] mb-1">{item.term}</p>

                  <span className="text-[13px] font-medium text-[#ef4444]">{item.spend}</span>
                </div>

                <p className="text-[12px] text-[#64748b] mt-1">{item.clicks} clicks</p>
              </div>
            ))}

            <Button className="w-full !mt-2 !h-[35px] !rounded-xl">View All Search Terms</Button>
          </div>

          <div className="bg-white rounded-2xl border border-[#e5e7eb] p-3">
            <h2 className="text-[14px] font-semibold text-[#111827]">Add Negative Keywords</h2>

            <p className="text-[13px] text-[#6b7280] mb-2">Add multiple keywords or phrases (one per line)</p>

            <textarea
              rows={5}
              placeholder="Enter negative keywords..."
              className="w-full rounded-xl border border-[#dbe1e8] p-2 text-[14px] outline-none resize-none"
            />

            <select className="w-full h-[35px] mt-2 px-4 rounded-xl border border-[#dbe1e8] bg-white text-[14px] outline-none">
              <option>Broad Match</option>
              <option>Phrase Match</option>
              <option>Exact Match</option>
            </select>

            <Button type="primary" className="w-full !mt-4 !h-[35px] !rounded-xl !bg-[#059669]">
              Add Keywords
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NegativeKey;
