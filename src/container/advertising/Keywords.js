import React, { useEffect, useState } from 'react';
import { Button, Table, Tag, Tooltip, Switch, Popover, Input } from 'antd';
import { ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  getKeywords,
  KeywordBidUpdate,
  getCampaignsRulesList,
  getAdsGroup,
} from '../../redux/advertising/actionCreator';

function Keywords() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [selectedBid, setSelectedBid] = React.useState('');
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [selectedAdGroup, setSelectedAdGroup] = useState('');
  const [openBidId, setOpenBidId] = React.useState(null);
  const [selectedKeyword, setSelectedKeyword] = React.useState(null);
  const [stateFilter, setStateFilter] = useState('');

  const [savingBid, setSavingBid] = React.useState(false);

  const [matchType, setMatchType] = React.useState('');
  const [campaigns, setCampaigns] = React.useState([]);
  const [selectedCampaign, setSelectedCampaign] = React.useState('');

  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { keywordsData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    const payload = {
      search: debouncedSearch,

      campaign_id: selectedCampaign || null,
      state: stateFilter,

      match_type: matchType || '',

      ad_group_id: selectedAdGroup,
    };

    dispatch(getKeywords(pagination.current, pagination.pageSize, payload));
  }, [
    dispatch,
    pagination.current,
    pagination.pageSize,
    debouncedSearch,
    stateFilter,
    selectedCampaign,
    matchType,
    selectedAdGroup,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchText]);

  const fetchCampaigns = async () => {
    const response = await dispatch(getCampaignsRulesList());

    if (response?.status) {
      setCampaigns(response.data || []);
    }
  };
  const { adsGroupData } = useSelector((state) => state.advertising);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleStateUpdate = async (record, checked) => {
    const payload = {
      profile_id: record.profileId, // ya jahan se aa raha ho
      keywords: [
        {
          keywordId: record.keywordId,
          state: checked ? 'ENABLED' : 'PAUSED',
          bid: Number(record.bid),
        },
      ],
    };

    try {
      const res = await dispatch(KeywordBidUpdate(payload));

      if (res?.status) {
        dispatch(
          getKeywords(pagination.current, pagination.pageSize, {
            search: debouncedSearch,
            // state: appliedFilters.state,
            // match_type: appliedFilters.match_type,
          }),
        );
      }
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    dispatch(
      getAdsGroup(1, 4000, {
        search: '',
      }),
    );
  }, [dispatch]);

  const handleBidUpdate = async () => {
    if (!selectedKeyword) return;

    setSavingBid(true);

    const payload = {
      profile_id: selectedKeyword.profileId,
      keywords: [
        {
          keywordId: selectedKeyword.keywordId,
          state: selectedKeyword.state,
          bid: Number(selectedBid),
        },
      ],
    };

    try {
      const res = await dispatch(KeywordBidUpdate(payload));

      if (res?.status) {
        setOpenBidId(null);

        dispatch(
          getKeywords(pagination.current, pagination.pageSize, {
            search: debouncedSearch,
            // state: appliedFilters.state,
            // match_type: appliedFilters.match_type,
          }),
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSavingBid(false);
    }
  };

  const dataSource =
    keywordsData?.results?.map((item) => ({
      // key: index,
      key: item.keyword_id,
      keywordId: item.keyword_id,
      keywordText: item.keyword_text,
      profileId: item.profile_id,
      matchType: item.match_type,
      state: item.state,
      bid: item.bid,
      campaignName: item.campaign_name,
      adGroupName: item.ad_group_name,
      countryCode: item.country_code,
      currencyCode: item.currency_code,
      createdAt: item.created_at,
      impressions: item.metrics?.impressions,
      clicks: item.metrics?.clicks,
      cost: item.metrics?.cost,
      sales: item.metrics?.sales,
      orders: item.metrics?.orders,
      units: item.metrics?.units,
      acos: item.metrics?.acos,
      roas: item.metrics?.roas,
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
          className="w-[13px] h-[13px] cursor-pointer accent-[#2563eb]"
        />
      ),
      dataIndex: 'checkbox',
      width: 60,
      align: 'center',
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
          className="w-[13px] h-[13px] cursor-pointer accent-[#2563eb]"
        />
      ),
    },
    // {
    //   title: 'Keyword ID',
    //   dataIndex: 'keywordId',
    //   width: 100,
    //   ellipsis: true,
    //   render: (v) => {
    //     const text = String(v);

    //     return (
    //       <Tooltip title={text} color="black" overlayInnerStyle={{ color: '#fff' }}>
    //         <span className="text-[#2563eb] font-medium cursor-pointer">
    //           {text.length > 9 ? `${text.slice(0, 9)}...` : text}
    //         </span>
    //       </Tooltip>
    //     );
    //   },
    // },

    {
      title: '',
      dataIndex: 'state',
      align: 'center',
      size: 'small',
      width: 70,
      render: (value, record) => (
        <Switch
          checked={value === 'ENABLED'}
          checkedChildren=""
          unCheckedChildren=""
          onChange={(checked) => handleStateUpdate(record, checked)}
        />
      ),
    },

    {
      title: 'Keyword',
      dataIndex: 'keywordText',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.keywordText).localeCompare(String(b.keywordText)),

      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Match Type',
      dataIndex: 'matchType',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.matchType).localeCompare(String(b.matchType)),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="font-medium text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    // {
    //   title: 'State',
    //   dataIndex: 'state',
    //   align: 'center',
    //   width: 70,
    //   ellipsis: true,
    //   render: (v) => (
    //     <Tag color={v === 'ENABLED' ? 'success' : 'error'} className="!px-2 !py-[1px] text-[10px] !rounded-full">
    //       {v}
    //     </Tag>
    //   ),
    // },

    {
      title: 'Bid',
      dataIndex: 'bid',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.bid - b.bid,
      ellipsis: true,

      render: (v, record) => {
        const bidContent = (
          <div className="w-[220px]">
            <Input
              prefix="₹"
              type="number"
              value={selectedBid}
              onChange={(e) => setSelectedBid(e.target.value)}
              className="!h-[34px]"
            />

            <div className="mt-3 flex justify-end gap-2">
              <Button
                onClick={() => {
                  setOpenBidId(null);
                }}
                className="!border-0 !shadow-none"
              >
                Cancel
              </Button>

              <Button
                loading={savingBid}
                onClick={async () => {
                  await handleBidUpdate();
                  setOpenBidId(null);
                }}
                className="
              !text-white
              !border-0
              !rounded-xl
              !font-semibold
            "
                style={{
                  background: 'linear-gradient(135deg, rgb(16,185,129) 0%, rgb(15,118,110) 100%)',
                }}
              >
                Save
              </Button>
            </div>
          </div>
        );

        return (
          <Popover
            trigger="click"
            placement="bottom"
            content={bidContent}
            open={openBidId === record.keywordId}
            onOpenChange={(open) => {
              if (open) {
                setOpenBidId(record.keywordId);
                setSelectedBid(record.bid);
                setSelectedKeyword(record);
              } else {
                setOpenBidId(null);
              }
            }}
          >
            <button
              type="button"
              className="group relative overflow-hidden w-[72px] px-2 py-[7px] rounded-2xl border border-transparent bg-transparent hover:border-[#dbeafe] hover:bg-[#f8fbff] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#eff6ff] via-[#f8fafc] to-[#ecfeff] opacity-80" />

              <div className="relative w-full truncate text-center">
                <span className="text-[10px] font-bold text-[#0f172a] truncate block">
                  ₹{Number(v ?? 0).toFixed(2)}
                </span>
              </div>
            </button>
          </Popover>
        );
      },
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
          <span className="text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Ad Group Name',
      dataIndex: 'adGroupName',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.adGroupName).localeCompare(String(b.adGroupName)),
      render: (v) => (
        <Tooltip title={v} color="black" overlayInnerStyle={{ color: '#fff' }}>
          <span className="text-[#111827] block truncate cursor-pointer" style={{ maxWidth: '220px' }}>
            {v}
          </span>
        </Tooltip>
      ),
    },

    {
      title: 'Country Code',
      dataIndex: 'countryCode',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.countryCode).localeCompare(String(b.countryCode)),
    },

    {
      title: 'Currency Code',
      dataIndex: 'currencyCode',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => String(a.currencyCode).localeCompare(String(b.currencyCode)),
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: 70,
      ellipsis: true,
      sorter: (a, b) => a.impressions - b.impressions,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.clicks - b.clicks,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.cost - b.cost,
      render: (v) => <span className="font-medium text-[#dc2626]">₹{v ?? 0}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.sales - b.sales,
      render: (v) => <span className="font-medium text-[#16a34a]">₹{v ?? 0}</span>,
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      sorter: (a, b) => a.orders - b.orders,
      width: 70,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.units - b.units,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.acos - b.acos,
      render: (v) => (
        <Tag className="!px-3 !py-[3px] !rounded-full" color={v > 100 ? 'error' : 'processing'}>
          {v ? `${v.toFixed(2)}%` : '-'}
        </Tag>
      ),
    },

    {
      title: 'ROAS',
      dataIndex: 'roas',
      align: 'center',
      width: 70,
      sorter: (a, b) => a.roas - b.roas,
      render: (v) => (
        <Tag className="!px-3 !py-[3px] !rounded-full" color={v >= 1 ? 'success' : 'warning'}>
          {v ? v.toFixed(2) : '-'}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <div className="p-2">
        <div className="mt-3 mb-3 rounded-2xl border border-[#e5e7eb] bg-white shadow-sm overflow-visible">
          {/* Header */}
          <div className="border-b border-[#edf0f2] px-3 py-3">
            {/* TOP CONTENT */}
            <div>
              <h1 className="text-[19px] font-semibold text-[#111827] mb-1">Keywords Performance</h1>

              <p className="mt-1 text-sm text-[#6b7280]">
                Track keyword bids, targeting, ad group performance and marketplace activity.
              </p>
            </div>

            {/* <div className="mt-5 flex items-center justify-between gap-3 flex-wrap"> */}
            <div className="mt-5 flex items-center justify-between gap-3 lg:flex-col lg:items-start">
              {/* Search */}
              <div className="relative w-[240px] md:w-full">
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              {/* Filters + Export */}
              {/* <div className="flex items-center gap-2 flex-wrap"> */}
              <div className="flex items-center gap-2 flex-wrap lg:w-full">
                {/* All Marketplace */}
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="h-[30px] w-[150px] md:flex-1 md:min-w-[140px]  px-2 rounded-xl border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none"
                >
                  <option value="">All Campaigns</option>

                  {campaigns.map((item) => (
                    <option key={item.campaign_id} value={item.campaign_id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="h-[30px] px-2 pr-6 rounded-xl border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none cursor-pointer"
                >
                  <option value="">All State</option>
                  <option value="ENABLED">Enabled</option>
                  <option value="PAUSED">Paused</option>
                </select>

                <select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value)}
                  className="h-[30px] px-2 pr-4 rounded-xl border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none"
                >
                  <option value="">All Match Type</option>
                  <option value="BROAD">Broad</option>
                  <option value="PHRASE">Phrase</option>
                  <option value="EXACT">Exact</option>
                </select>

                {/* Ad Group */}
                <select
                  value={selectedAdGroup}
                  onChange={(e) => setSelectedAdGroup(e.target.value)}
                  className="h-[30px] w-[150px] md:flex-1 md:min-w-[140px] px-2 pr-4 rounded-xl border border-[#dbe1e8] text-[#374151] font-medium bg-white text-[12px] outline-none cursor-pointer truncate"
                >
                  <option value="">All Ad Groups</option>

                  {adsGroupData?.results?.map((item) => (
                    <option key={item.ad_group_id} value={item.ad_group_id}>
                      {item.name}
                    </option>
                  ))}
                </select>

                {/* Export */}
                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="!h-[30px] text-[13px] !px-3 !rounded-xl !bg-[#2563eb] !border-[#2563eb] !font-semibold !shadow-sm"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          {/* <div className="overflow-x-auto"> */}
          <Table
            columns={columns}
            dataSource={dataSource}
            showSorterTooltip={false}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: keywordsData?.pagination?.total_records || 0,
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
            scroll={{ x: 1300 }}
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
          {/* </div> */}
        </div>
      </div>
    </>
  );
}

export default Keywords;
