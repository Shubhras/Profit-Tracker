import React, { useEffect } from 'react';
import { Button, Table, Tag, Tooltip, Modal, Switch } from 'antd';
import { FilterOutlined, ExportOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getKeywords, KeywordBidUpdate } from '../../redux/advertising/actionCreator';

function Keywords() {
  const dispatch = useDispatch();
  const [searchText, setSearchText] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [isBidModalOpen, setIsBidModalOpen] = React.useState(false);
  const [selectedBid, setSelectedBid] = React.useState('');
  const [pagination, setPagination] = React.useState({
    current: 1,
    pageSize: 10,
  });
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedKeyword, setSelectedKeyword] = React.useState(null);
  const [savingBid, setSavingBid] = React.useState(false);

  const [filters, setFilters] = React.useState({
    state: '',
    match_type: '',
  });

  const [appliedFilters, setAppliedFilters] = React.useState({
    state: '',
    match_type: '',
  });
  const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

  const { keywordsData, loading } = useSelector((state) => state.advertising);

  useEffect(() => {
    const payload = {
      search: debouncedSearch,
      state: appliedFilters.state,
      match_type: appliedFilters.match_type,
      // state: 'enabled',
      // match_type: 'broad',
      // campaign_id: '1234567890',
      // ad_group_id: '9876543210',
      // ordering: '-created_at',
    };

    dispatch(getKeywords(pagination.current, pagination.pageSize, payload));
  }, [dispatch, pagination, debouncedSearch, appliedFilters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchText]);

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
            state: appliedFilters.state,
            match_type: appliedFilters.match_type,
          }),
        );
      }
    } catch (err) {
      console.log(err);
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
      width: 90,
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
      sorter: (a, b) => Number(a.bid || 0) - Number(b.bid || 0),
      ellipsis: true,
      render: (v, record) => (
        <button
          type="button"
          onClick={() => {
            setSelectedBid(v);
            setSelectedKeyword(record);
            setIsBidModalOpen(true);
          }}
          className="px-3 py-[6px] rounded-xl border border-transparent text-[#111827] font-medium bg-transparent hover:border-[#dbe1e8] hover:bg-white hover:shadow-sm transition-all duration-200"
        >
          ₹{Number(v ?? 0).toLocaleString('en-IN')}
        </button>
      ),
    },

    {
      title: 'Campaign Name',
      dataIndex: 'campaignName',
      align: 'center',
      width: 70,
      ellipsis: true,
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
    },

    {
      title: 'Currency Code',
      dataIndex: 'currencyCode',
      align: 'center',
      width: 70,
      ellipsis: true,
    },
    {
      title: 'Impressions',
      dataIndex: 'impressions',
      align: 'center',
      width: 70,
      ellipsis: true,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Clicks',
      dataIndex: 'clicks',
      align: 'center',
      width: 70,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Cost',
      dataIndex: 'cost',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.cost || 0) - Number(b.cost || 0),
      render: (v) => <span className="font-medium text-[#dc2626]">₹{v ?? 0}</span>,
    },

    {
      title: 'Sales',
      dataIndex: 'sales',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.sales || 0) - Number(b.sales || 0),
      render: (v) => <span className="font-medium text-[#16a34a]">₹{v ?? 0}</span>,
    },

    {
      title: 'Orders',
      dataIndex: 'orders',
      align: 'center',
      sorter: (a, b) => Number(a.orders || 0) - Number(b.orders || 0),
      width: 70,
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'Units',
      dataIndex: 'units',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.units || 0) - Number(b.units || 0),
      render: (v) => <span className="font-medium text-[#111827]">{v ?? '-'}</span>,
    },

    {
      title: 'ACOS',
      dataIndex: 'acos',
      align: 'center',
      width: 70,
      sorter: (a, b) => Number(a.acos || 0) - Number(b.acos || 0),
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
      sorter: (a, b) => Number(a.roas || 0) - Number(b.raos || 0),
      render: (v) => (
        <Tag className="!px-3 !py-[3px] !rounded-full" color={v >= 1 ? 'success' : 'warning'}>
          {v ? v.toFixed(2) : '-'}
        </Tag>
      ),
    },
  ];

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
        setIsBidModalOpen(false);

        dispatch(
          getKeywords(pagination.current, pagination.pageSize, {
            search: debouncedSearch,
            state: appliedFilters.state,
            match_type: appliedFilters.match_type,
          }),
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSavingBid(false);
    }
  };

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

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="relative w-[280px]">
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full h-[30px] rounded-xl border border-[#dbe1e8] bg-white pl-11 pr-4 text-[14px] text-[#111827] outline-none shadow-sm transition-all duration-200 focus:border-[#dbe1e8] hover:border-[#dbe1e8]"
                />

                <SearchOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[15px]" />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`!h-[30px] text-[13px] !px-5 !rounded-xl !font-medium !shadow-sm !flex !items-center !justify-center transition-all
      ${
        showFilters
          ? '!border-[#2563eb] !text-[#2563eb] !bg-[#eff6ff]'
          : '!border-[#dbe1e8] !text-[#374151] hover:!border-[#2563eb] hover:!text-[#2563eb]'
      }`}
                  >
                    Filters
                  </Button>

                  {/* Filter Dropdown */}
                  {showFilters && (
                    <div className="absolute top-[52px] right-0 w-[320px] bg-white border border-[#e5e7eb] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Header */}
                      <div className="px-5 py-4 border-b border-[#edf1f5] bg-[#fafafa]">
                        <h3 className="text-[19px] font-semibold text-[#111827] mb-1">Filter Keywords</h3>

                        <p className="text-xs text-[#6b7280] mt-1">Filter keywords by state and match type</p>
                      </div>

                      {/* Body */}
                      <div className="p-5 space-y-5">
                        {/* State */}
                        <div>
                          <label className="block text-[14px] font-semibold text-[#6b7280] mb-2 uppercase tracking-wide">
                            State
                          </label>

                          <select
                            value={filters.state}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                state: e.target.value,
                              })
                            }
                            className="w-full h-11 px-4 rounded-xl border border-[#dbe1e8] text-sm outline-none focus:border-[#2563eb]"
                          >
                            <option value="">All States</option>
                            <option value="enabled">Enabled</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </div>

                        {/* Match Type */}
                        <div>
                          <label className="block text-[14px] font-semibold text-[#6b7280] mb-2 uppercase tracking-wide">
                            Match Type
                          </label>

                          <select
                            value={filters.match_type}
                            onChange={(e) =>
                              setFilters({
                                ...filters,
                                match_type: e.target.value,
                              })
                            }
                            className="w-full h-11 px-4 rounded-xl border border-[#dbe1e8] text-sm outline-none focus:border-[#2563eb]"
                          >
                            <option value="">All Match Types</option>
                            <option value="broad">BROAD</option>
                            <option value="phrase">PHRASE</option>
                          </select>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-4 border-t border-[#edf1f5] flex items-center justify-between bg-[#fafafa]">
                        <button
                          type="button"
                          onClick={() => {
                            const resetFilters = {
                              state: '',
                              match_type: '',
                            };

                            setFilters(resetFilters);
                            setAppliedFilters(resetFilters);
                          }}
                          className="text-sm font-medium text-[#6b7280] hover:text-[#111827]"
                        >
                          Reset
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAppliedFilters(filters);
                            setShowFilters(false);
                          }}
                          className="h-10 px-5 rounded-xl bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-all"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="primary"
                  icon={<ExportOutlined />}
                  className="!h-[30px] text-[13px] !px-5 !rounded-xl !bg-[#2563eb] !border-[#2563eb] !font-medium hover:!bg-[#1d4ed8] hover:!border-[#1d4ed8] !shadow-sm !flex !items-center !justify-center"
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
            scroll={{ x: 1200 }}
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
      <Modal
        open={isBidModalOpen}
        footer={null}
        centered
        closable={false}
        onCancel={() => setIsBidModalOpen(false)}
        width={340}
      >
        <div className="pt-1">
          <div className="flex items-center gap-1 mb-4">
            <span className="text-[13px] font-semibold tracking-wide text-[#4b5563] uppercase">Default Bid</span>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-semibold text-[15px]">₹</div>

            <input
              type="number"
              value={selectedBid}
              onChange={(e) => setSelectedBid(e.target.value)}
              className="w-full h-[54px] rounded-2xl border border-[#c7d2fe] bg-[#fafbff] pl-10 pr-4 text-[18px] font-semibold text-[#111827] outline-none"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-[#eef1f5] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsBidModalOpen(false)}
              className="h-[42px] px-5 rounded-xl text-[#6b7280] font-medium hover:bg-[#f3f4f6]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleBidUpdate}
              disabled={savingBid}
              className="h-[42px] px-6 rounded-xl bg-[#111827] text-white font-semibold disabled:opacity-50"
            >
              {savingBid ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Keywords;
