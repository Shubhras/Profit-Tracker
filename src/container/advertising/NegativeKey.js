import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Tooltip } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { SearchOutlined, MoreOutlined } from '@ant-design/icons';
import { getNegativeKeywords, getCampaignsRulesList, getAdsGroup } from '../../redux/advertising/actionCreator'; // apne path ke hisab se

function NegativeKey() {
  const dispatch = useDispatch();
  // const { RangePicker } = DatePicker;
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [matchType, setMatchType] = useState('');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedAdGroup, setSelectedAdGroup] = useState('');
  const [activeTab, setActiveTab] = useState('Negative Keywords');
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });
  const { adsGroupData } = useSelector((state) => state.advertising);
  const { dateRange } = useSelector((state) => state.dashboard);

  const fetchNegativeKeywords = async () => {
    setLoading(true);

    const payload = {
      search: debouncedSearch,
      campaign_id: selectedCampaign,
      ad_group_id: selectedAdGroup,
      match_type: matchType,
      state: '',
      page: pagination.current,
      page_size: pagination.pageSize,
      fromDate: dateRange?.fromDate || null,
      toDate: dateRange?.endDate || null,
    };

    const response = await dispatch(getNegativeKeywords(payload));

    if (response?.status) {
      setTotalRecords(response.total_records || 0);
      const formattedData = (response?.data || []).map((item) => ({
        key: item.id,

        keyword: item.keyword_text,

        type: item.match_type,

        campaignName: item.campaign_name,

        state: item.state,

        addedOn: new Date(item.created_at).toLocaleDateString('en-GB'),

        adGroupName: item.ad_group_name,
      }));

      setTableData(formattedData);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNegativeKeywords();
  }, [
    dateRange,
    pagination.current,
    pagination.pageSize,
    matchType,
    selectedCampaign,
    selectedAdGroup,
    debouncedSearch,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchCampaigns = async () => {
    const response = await dispatch(getCampaignsRulesList());

    if (response?.status) {
      setCampaigns(response.data || []);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    dispatch(
      getAdsGroup(1, 4000, {
        search: '',
      }),
    );
  }, [dispatch]);

  const columns = [
    {
      title: <input type="checkbox" className="w-[13px] h-[13px] accent-[#10b981]" />,
      width: 50,
      align: 'center',
      render: () => <input type="checkbox" className="w-[13px] h-[13px] accent-[#10b981]" />,
    },

    {
      title: 'Keyword Text',
      dataIndex: 'keyword',
      width: 70,
      align: 'center',
      ellipsis: true,
      sorter: (a, b) => String(a.keyword || '').localeCompare(String(b.keyword || '')),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Match Type',
      dataIndex: 'type',
      width: 70,
      align: 'center',
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => String(a.type || '').localeCompare(String(b.type || '')),
      render: (v) => {
        const label = v === 'NEGATIVE_EXACT' ? 'Exact' : v === 'NEGATIVE_PHRASE' ? 'Phrase' : 'Broad';

        return (
          <Tag
            style={{
              background: v === 'NEGATIVE_EXACT' ? '#fef3c7' : v === 'NEGATIVE_PHRASE' ? '#ede9fe' : '#dcfce7',
              color: v === 'NEGATIVE_EXACT' ? '#d97706' : v === 'NEGATIVE_PHRASE' ? '#7c3aed' : '#15803d',
              border: 'none',
              // borderRadius: '999px',
            }}
          >
            {label}
          </Tag>
        );
      },
    },

    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      width: 70,
      align: 'center',
      ellipsis: true,
      sorter: (a, b) => String(a.campaignName || '').localeCompare(String(b.campaignName || '')),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'State',
      dataIndex: 'state',
      width: 70,
      align: 'center',
      ellipsis: {
        showTitle: false,
      },
      sorter: (a, b) => String(a.state || '').localeCompare(String(b.state || '')),
      render: (v) => <Tag color={v === 'ENABLED' ? 'green' : 'red'}>{v}</Tag>,
    },

    {
      title: 'Added On',
      dataIndex: 'addedOn',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.addedOn || 0) - Number(b.addedOn || 0),
    },

    {
      title: 'Ad Group Name',
      dataIndex: 'adGroupName',
      width: 70,
      align: 'center',
      ellipsis: true,
      sorter: (a, b) => String(a.adGroupName || '').localeCompare(String(b.adGroupName || '')),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="cursor-pointer">{v}</span>
        </Tooltip>
      ),
    },

    {
      title: 'Actions',
      width: 50,
      align: 'center',
      render: () => <Button type="text" icon={<MoreOutlined />} />,
    },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    switch (tab) {
      case 'Negative Keywords':
        setMatchType('');
        break;

      case 'Negative Phrases':
        setMatchType('NEGATIVE_PHRASE');
        break;

      case 'Negative Exact':
        setMatchType('NEGATIVE_EXACT');
        break;

      default:
        setMatchType('');
    }

    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const tabs = ['Negative Keywords', 'Negative Phrases', 'Negative Exact', 'ASIN Targeting', 'Auto Suggestions'];

  return (
    <div className="bg-[#f5f7fb] min-h-screen px-4 py-2">
      <div className="flex flex-col min-lg:flex-row min-lg:items-start justify-between gap-3 mb-2">
        <div>
          <h1 className="text-[24px] font-semibold text-[#111827] mb-[2px]">Negative Keywords</h1>

          <p className="text-[13px] text-[#6b7280] max-w-[900px] leading-[16px]">
            Discover, analyze and manage negative keywords to prevent wasted ad spend and improve campaign performance.
          </p>
        </div>
      </div>

      {/* TABS */}

      <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap border-b border-[#e5e7eb] mb-2 scrollbar-hide">
        {tabs.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleTabChange(item)}
            className={`pb-1 text-[13px] font-medium transition-all ${
              activeTab === item ? 'text-[#059669] border-b-2 border-[#059669]' : 'text-[#64748b]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* FILTERS */}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select
          value={selectedCampaign}
          onChange={(e) => setSelectedCampaign(e.target.value)}
          className="h-[30px] w-[170px] px-2 pr-5 rounded-xl border border-[#dbe1e8] bg-white text-[12px] outline-none cursor-pointer truncate"
        >
          <option value="">All Campaigns</option>

          {campaigns.map((item) => (
            <option key={item.campaign_id} value={item.campaign_id}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={matchType}
          onChange={(e) => setMatchType(e.target.value)}
          className="h-[30px] w-full min-sm:w-[170px] px-2 pr-5 rounded-xl border border-[#dbe1e8] bg-white text-[12px] outline-none cursor-pointer"
        >
          <option value="">All Match Type</option>
          <option value="NEGATIVE_BROAD">Broad</option>
          <option value="NEGATIVE_PHRASE">Phrase</option>
          <option value="NEGATIVE_EXACT">Exact</option>
        </select>

        <select
          value={selectedAdGroup}
          onChange={(e) => setSelectedAdGroup(e.target.value)}
          className="h-[30px] w-full min-sm:w-[170px] px-2 pr-5 rounded-xl border border-[#dbe1e8] bg-white text-[12px] outline-none cursor-pointer truncate"
        >
          <option value="">All Ad Groups</option>

          {adsGroupData?.results?.map((item) => (
            <option key={item.ad_group_id} value={item.ad_group_id}>
              {item.name}
            </option>
          ))}
        </select>
        {/* <RangePicker
          format="DD/MM/YYYY"
          className="!h-[30px] text-[12px] !rounded-xl"
          placeholder={['Start Date', 'End Date']}
        /> */}

        <div className="relative w-full min-md:w-[280px] min-md:ml-auto">
          {' '}
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search negative keywords..."
            className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] outline-none"
          />
          <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        </div>
      </div>

      {/* MAIN CONTENT */}

      {/* TABLE */}

      <div className="bg-white rounded-lg border border-[#e5e7eb] p-2 overflow-hidden min-w-0">
        {' '}
        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          tableLayout="fixed"
          showSorterTooltip={false}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: totalRecords,
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
          scroll={{ x: 800, y: 600 }}
          size="middle"
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
    </div>
  );
}

export default NegativeKey;
